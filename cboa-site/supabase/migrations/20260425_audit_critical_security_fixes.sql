-- =============================================================
-- 2026-04-25 Audit fixes — closes issues #2, #4, #8, #16, #17, #18
-- Run in Supabase SQL Editor. Idempotent.
-- =============================================================

-- ---------------------------------------------------------------
-- Helper functions for role checks. SECURITY DEFINER avoids RLS
-- recursion when policies on `members` need to consult `members`
-- to determine if the caller is an admin.
-- ---------------------------------------------------------------

CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM members
    WHERE user_id = uid
      AND LOWER(role) = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION is_admin_or_executive(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM members
    WHERE user_id = uid
      AND LOWER(role) IN ('admin', 'executive')
  );
$$;

-- ---------------------------------------------------------------
-- Issue #2 — members & member_activities RLS lockdown.
-- Was: USING (true) on every operation. Now: self-row OR admin/executive.
-- ---------------------------------------------------------------

DROP POLICY IF EXISTS "Public read access for members" ON members;
DROP POLICY IF EXISTS "Users can insert own member record" ON members;
DROP POLICY IF EXISTS "Users can update own member record" ON members;
DROP POLICY IF EXISTS "Admins can delete members" ON members;

CREATE POLICY "members_select_self_or_admin" ON members
  FOR SELECT
  USING (auth.uid() = user_id OR is_admin_or_executive(auth.uid()));

CREATE POLICY "members_insert_self_or_admin" ON members
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR is_admin_or_executive(auth.uid()));

CREATE POLICY "members_update_self_or_admin" ON members
  FOR UPDATE
  USING (auth.uid() = user_id OR is_admin_or_executive(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR is_admin_or_executive(auth.uid()));

CREATE POLICY "members_delete_admin" ON members
  FOR DELETE
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Public read access for member_activities" ON member_activities;
DROP POLICY IF EXISTS "Public insert access for member_activities" ON member_activities;
DROP POLICY IF EXISTS "Public update access for member_activities" ON member_activities;
DROP POLICY IF EXISTS "Public delete access for member_activities" ON member_activities;

CREATE POLICY "member_activities_select_self_or_admin" ON member_activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.id = member_activities.member_id
        AND (m.user_id = auth.uid() OR is_admin_or_executive(auth.uid()))
    )
  );

CREATE POLICY "member_activities_modify_admin" ON member_activities
  FOR ALL
  USING (is_admin_or_executive(auth.uid()))
  WITH CHECK (is_admin_or_executive(auth.uid()));

-- ---------------------------------------------------------------
-- Issue #4 — Public-content table writes were `USING (auth.role() =
-- 'authenticated')`, which let any logged-in member delete all
-- content. Restrict writes to admin/executive; public-read of
-- active rows is preserved by the existing SELECT policies.
-- ---------------------------------------------------------------

DROP POLICY IF EXISTS "Authenticated can manage news" ON public_news;
DROP POLICY IF EXISTS "Authenticated can manage training" ON public_training_events;
DROP POLICY IF EXISTS "Authenticated can manage resources" ON public_resources;
DROP POLICY IF EXISTS "Authenticated can manage pages" ON public_pages;
DROP POLICY IF EXISTS "Authenticated can manage officials" ON officials;

CREATE POLICY "Admins can manage news" ON public_news
  FOR ALL USING (is_admin_or_executive(auth.uid()))
  WITH CHECK (is_admin_or_executive(auth.uid()));

CREATE POLICY "Admins can manage training" ON public_training_events
  FOR ALL USING (is_admin_or_executive(auth.uid()))
  WITH CHECK (is_admin_or_executive(auth.uid()));

CREATE POLICY "Admins can manage resources" ON public_resources
  FOR ALL USING (is_admin_or_executive(auth.uid()))
  WITH CHECK (is_admin_or_executive(auth.uid()));

CREATE POLICY "Admins can manage pages" ON public_pages
  FOR ALL USING (is_admin_or_executive(auth.uid()))
  WITH CHECK (is_admin_or_executive(auth.uid()));

CREATE POLICY "Admins can manage officials" ON officials
  FOR ALL USING (is_admin_or_executive(auth.uid()))
  WITH CHECK (is_admin_or_executive(auth.uid()));

-- ---------------------------------------------------------------
-- Issue #8 — Existing admin policies on email_history, app_logs,
-- audit_logs, osa_submissions, contact_submissions checked
-- members.role = 'Admin' (capital A). The app stores 'admin'
-- lowercase, so these policies were dead. Recreate via is_admin().
-- ---------------------------------------------------------------

DROP POLICY IF EXISTS "Admins can view email history" ON email_history;
CREATE POLICY "Admins can view email history" ON email_history
  FOR SELECT USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view app logs" ON app_logs;
CREATE POLICY "Admins can view app logs" ON app_logs
  FOR SELECT USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view osa_submissions" ON osa_submissions;
CREATE POLICY "Admins can view osa_submissions" ON osa_submissions
  FOR SELECT USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update osa_submissions" ON osa_submissions;
CREATE POLICY "Admins can update osa_submissions" ON osa_submissions
  FOR UPDATE USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view contact submissions" ON contact_submissions;
CREATE POLICY "Admins can view contact submissions" ON contact_submissions
  FOR SELECT USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can update contact submissions" ON contact_submissions;
CREATE POLICY "Admins can update contact submissions" ON contact_submissions
  FOR UPDATE USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- ---------------------------------------------------------------
-- Issue #16 — members.user_id had no FK to auth.users, so deleting
-- an auth user left orphan rows. First nullify any existing
-- orphans, then add the FK with ON DELETE SET NULL.
-- ---------------------------------------------------------------

UPDATE members
SET user_id = NULL
WHERE user_id IS NOT NULL
  AND user_id NOT IN (SELECT id FROM auth.users);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'members_user_id_fkey'
      AND conrelid = 'members'::regclass
  ) THEN
    ALTER TABLE members
      ADD CONSTRAINT members_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ---------------------------------------------------------------
-- Issue #17 — invite_tokens had UNIQUE(email, used_at), which does
-- NOT prevent multiple (email, NULL) rows because Postgres treats
-- NULLs as distinct. Replace with a partial unique index that
-- enforces "at most one active invite per email".
-- ---------------------------------------------------------------

ALTER TABLE invite_tokens
  DROP CONSTRAINT IF EXISTS unique_active_token_per_email;

CREATE UNIQUE INDEX IF NOT EXISTS invite_tokens_active_email_idx
  ON invite_tokens(email)
  WHERE used_at IS NULL;

-- ---------------------------------------------------------------
-- Issue #18 — email_history.sent_by_id and invite_tokens.created_by
-- referenced auth.users with no ON DELETE clause, which blocks
-- deletion of any auth user who ever sent an email or issued an
-- invite. Convert to ON DELETE SET NULL so deletes succeed and
-- the historical rows are preserved.
-- ---------------------------------------------------------------

ALTER TABLE email_history
  DROP CONSTRAINT IF EXISTS email_history_sent_by_id_fkey;

ALTER TABLE email_history
  ADD CONSTRAINT email_history_sent_by_id_fkey
  FOREIGN KEY (sent_by_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE invite_tokens
  DROP CONSTRAINT IF EXISTS invite_tokens_created_by_fkey;

ALTER TABLE invite_tokens
  ADD CONSTRAINT invite_tokens_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
