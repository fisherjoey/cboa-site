# Debugging the CBOA site

A field guide for "the site is broken, where do I start?" Written for a
new maintainer who just inherited this repo.

If you're new here, also read:
- `README.md` (overall project)
- `__tests__/integration/README.md` (test suite quick-start)
- `__tests__/integration/PATTERN.md` (test contract reference)

## The five-minute first-look

When something on the live site isn't working, in this order:

1. **Did the last deploy succeed?** Open Netlify → Deploys. A red one
   means tests failed during the build (we run `npm run test:integration`
   before `npm run build` per `netlify.toml`). The Netlify build log
   will show which test file failed and the assertion message — that's
   often the root cause already.

2. **What does the user actually see?** Reproduce in a browser. Open
   devtools. Check the network tab for failing requests to
   `/.netlify/functions/<name>` — the response body usually carries an
   error string.

3. **Check `app_logs` in Supabase.** Almost every handler in
   `netlify/functions/` writes structured logs via `lib/logger.ts`. They
   land in the `app_logs` table. Filter by `source = '<function-name>'`
   and `level = 'ERROR'`, sorted by `created_at desc`. The portal admin
   has a UI for this at `/portal/admin/logs`.

4. **Check `audit_logs`** for any user-initiated mutation (member
   updates, evaluations created, OSAs submitted). The audit row carries
   the actor email, the action, and any payload diff.

5. **If it's email-related, check `email_history`.** Every send routes
   through there with a `status` column — `failed` rows have the error
   from Microsoft Graph in `error_message`.

## Where things live

| Concern | Location |
|---|---|
| Page UI | `app/<route>/page.tsx` |
| Reusable UI | `components/` |
| Server endpoints | `netlify/functions/<name>.ts` |
| Auth + role gating | `netlify/functions/_shared/handler.ts` |
| Site config (URLs, emails, org name) | `lib/siteConfig.ts` |
| Database schema source of truth | `supabase/migrations/*.sql` (run order matters) |
| Local Supabase config | `supabase/config.toml` (rarely needed) |
| CI build | `netlify.toml` `[build].command` |
| Tests | `__tests__/integration/*.test.ts`, `__tests__/unit/` |

## Common failure modes (and what they mean)

### "500 from a portal endpoint"

The handler probably hit a Postgres error and didn't translate it. The
audit-suite found ~30 instances of this — see "Known issues" below. The
Postgres error is in `app_logs`. Common varieties:
- **NOT NULL violation** — required field missing in body. Should be a
  400 from the handler; isn't.
- **Unique violation** — duplicate `slug` / `page_name` / etc. Same
  story, should be 400 from the handler.
- **CHECK violation** — value off the enum (e.g. `level` outside 1..5
  on `officials`). Same.
- **PGRST116** — `.single()` got 0 or >1 rows. Almost always means the
  id doesn't exist; should be a 404.

If you're fixing one of these, the cleanest pattern is a small
`mapPgError(error): { status: number; body: string }` helper that turns
each Postgres error code into the right HTTP status. Then call it from
the `catch` block in `createHandler` (`netlify/functions/_shared/handler.ts`).

### "Email didn't arrive"

In order of likelihood:

1. The user's mail server filtered it. Check sender's spam folder. The
   `email_history.status` will say `'sent'`.
2. Microsoft Graph creds expired. `email_history.status` will say
   `'failed'` and `error_message` will mention `AADSTS...`. Re-mint a
   client secret in Azure AD and update Netlify env vars.
3. Bulk email expansion silently expanded to nothing. There's a known
   bug in `send-email.ts` where `members.select('email, role,
   certification_level, rank')` fails on the `rank` column — see Known
   Issues. The handler swallows it and returns success with zero
   recipients beyond `customEmails`.

### "Deploy is stuck or failing"

- Netlify dashboard → Deploys → click the red one.
- The build log shows test output. If a test failed, the suite name and
  assertion message appear inline. Run the same test locally:
  `npm run test:integration -- __tests__/integration/<file>.test.ts`
- If the build itself fails (not tests), it's almost always a
  TypeScript error from a recent change — `npx tsc --noEmit` locally to
  reproduce.

### "User says the form returned an error"

1. Get the timestamp from the user.
2. Query `app_logs` for `source = '<form-handler>'` around that time.
3. If the form is the OSA wizard, `osa_submissions` will have a row
   (the handler is idempotent by content hash, so retries don't double
   up).
4. If it's the contact form, check `contact_submissions` and
   `email_history`. The handler validates email via MX lookup — if the
   user typo'd the domain, MX fails and you'll see a 400.

### "Test failed in CI but passes locally"

Two common causes:

1. **A different test in the same suite is leaving rows behind.** The
   `app_logs` table fills with hundreds of rows during a run, so any
   test that asserts "list contains X" needs to scope by `?search=
   E2E-TEST` or filter results in JS. See
   `__tests__/integration/admin-history.test.ts` for the pattern.
2. **Race against fire-and-forget DB inserts.** Some handlers
   `insert(...).then(...)` without awaiting. Tests need to either poll
   for the row, or sleep > 1s in `afterAll` before cleaning. See
   `send-email.test.ts` and `contact-form.test.ts` for two-pass
   cleanup.

## Running the integration tests locally

```bash
cd cboa-site
cp .env.example .env.local   # fill in the Supabase URL + service role key
npm install
npm run test:integration

# one file
npm run test:integration -- __tests__/integration/calendar-events.test.ts

# match by test name
npm run test:integration -- -t "is idempotent"
```

You DO need real Supabase credentials. Tests insert tagged rows
(prefix `E2E-TEST-...`) and clean them in `afterAll`. They don't need
real Microsoft Graph credentials — the helper at
`__tests__/integration/helpers/mockGraph.ts` intercepts every Graph
call.

If a run leaves orphan rows (you killed it with Ctrl-C), the next run's
`beforeAll` sweeps them on the way in. To force a manual sweep, see the
script template inside `helpers/cleanup.ts` (`cleanupEverything()`).

## Adding a new netlify function

1. Create `netlify/functions/<name>.ts`. If it doesn't have unusual auth
   needs, use `createHandler({ name, auth, handler })` from
   `_shared/handler.ts` — it gets you CORS, role-gating, and structured
   logging for free.
2. If the function reads/writes a new table, add a migration in
   `supabase/migrations/<date>_<thing>.sql`. Run the migration in your
   prod project (the team uses prod Supabase directly; there's no
   staging env).
3. Add an integration test at
   `__tests__/integration/<name>.test.ts`. See `PATTERN.md` for the
   contract and pick a similar existing test as a template.
4. If the function shows up on a frontend page, share the request
   payload type (export it from the function file, or extract a
   `build<Thing>Payload(state)` to `lib/forms/`) so tests + frontend
   stay in sync.

## Known issues (as of the audit, ~50 found)

These are real bugs surfaced by the integration suite. They're marked
`it.failing(...)` in the tests with `// BUG: <one-line>` comments — the
suite stays green, but the moment someone fixes one, that test will
flip and prompt review.

The big themes:

1. **Most portal POST/PUT endpoints don't validate request bodies.**
   Missing required fields hit Postgres NOT NULL constraints and surface
   as 500s instead of 400s. Same for enum-bounded fields like `level`,
   `priority`, `category`, `activity_type`. Affects: announcements,
   calendar-events, newsletters, scheduler-updates, rule-modifications,
   officials, member-activities, resources, public-news, public-pages,
   public-resources, public-training. Single-helper fix:
   `mapPgError(error)` in `_shared/handler.ts`.

2. **PUT to a non-existent id silently succeeds in many handlers.**
   `update().eq('id', x).select()` returns `[]` and the handler returns
   200 with `null`. Should 404. Affects: calendar-events, newsletters,
   scheduler-updates, rule-modifications, contact-submissions,
   public-pages.

3. **`?search` parameters interpolate user input straight into PostgREST
   `.or()` / `.ilike()` filters.** A `%` matches everything, a comma or
   paren breaks the filter and 500s. Affects:
   logs (search), email-history (search), contact-submissions (search).
   Fix: escape `%`, `_`, `,`, `(`, `)` before passing to PostgREST.

4. **send-email bulk recipient expansion is silently broken in
   production.** `send-email.ts:125` selects a `rank` column that
   collides with the SQL `rank()` aggregate; PostgREST returns an
   error; handler swallows it; group expansion ends up empty. Anyone
   using the admin "email all admins" UI is sending only to manually
   typed `customEmails`. **High-priority fix.**

5. **Privilege escalation via members PUT.** A regular member can set
   their own `status` and `rank` fields (the handler strips
   `role`/`email`/`netlify_user_id`/`user_id` but not those). A
   suspended user could un-suspend themselves with a self-PUT.
   `netlify/functions/members.ts:383-396`.

6. **`accept-invite` info disclosure.** Non-existent token vs
   existing-without-member produce different error messages, both at
   404. A holder of token strings can probe for existence.

7. **Invite tokens never expire.** No `expires_at` column or check.
   Documented as intentional (per file comment) — but worth revisiting.

8. **`upload-file` accepts mismatched content-type.** A `.pdf` file with
   EXE bytes is happily uploaded. Filename extension is trusted blindly.

9. **`upload-file` 502s on bad Content-Type header.** Busboy throws
   synchronously when given `application/json`; handler isn't wrapped
   in a try/catch around the constructor.

10. **`logs?level=info` (lowercase) matches nothing.** The CHECK column
    stores `'INFO'/'WARN'/'ERROR'`, the frontend dropdown sends
    lowercase, the handler doesn't normalize.

11. **`logs?type=client` silently aliases to `app_logs`.** The
    docstring claims it's a separate type. The ternary on
    `netlify/functions/logs.ts:26` only special-cases `'audit'`.

12. **Frontend caller drift in `app/portal/news/NewsClient.tsx:286`.**
    Sends `{to, subject, html}` to `/send-email`; the function expects
    `{recipientGroups | customEmails, subject, htmlContent}`. The
    feature is broken. Either fix the caller or extract the shared
    payload-builder so the type-checker catches it next time.

13. **`rule-modifications` GET hard-codes `.eq('active', true)`.**
    Deactivated rules can't be retrieved through the API at all —
    you'd have to fix in SQL.

14. **Dead code: `netlify/functions/resend-invites.ts`.** Talks to
    Netlify Identity (which the project migrated off). Zero callers in
    the repo. Candidate for deletion.

A full list with file:line references lives in the `// BUG:` comments
in `__tests__/integration/*.test.ts`. Search for `BUG:` to enumerate.

## Things that are NOT bugs (worth knowing)

- **The OSA webhook is idempotent by content hash.** Submitting the
  same form twice returns `{ duplicate: true }` and doesn't duplicate
  rows or emails. This is intentional — see `osa-webhook.ts` line ~800.
- **Test users live in real `auth.users`** during a test run. They get
  cleaned up in `afterAll`. If you see emails like
  `e2e-test-admin-<timestamp>@example.test` in the auth dashboard
  during a deploy, that's expected and they'll be gone within ~90s.
- **Microsoft Graph creds in `.env.local` are optional** for tests.
  They're required for the prod app to actually send mail.

## When to call for help

- If a fix would touch `_shared/handler.ts`, `lib/logger.ts`, or
  the auth flow, get a second pair of eyes — those are blast-radius-
  amplifying changes.
- If you're about to do a Supabase schema migration, check that prod
  is a single project (no staging) before running it. Coordinate with
  whoever else might be in the dashboard.
- If the integration suite goes red and you can't pinpoint the cause
  within ~30 minutes, the test infra itself might have an issue
  (Supabase rate limits, Netlify env var rotation, etc.). Worth asking
  before chasing further.
