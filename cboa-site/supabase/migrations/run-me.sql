-- =============================================================
-- CBOA Site — Pending Supabase Migrations
-- Run this file in the Supabase SQL Editor
-- =============================================================

-- 1. Add tournament_details JSONB column to calendar_events
-- Stores: { school, divisions, levels, genders, multiLocation, gamesInArbiter }
ALTER TABLE calendar_events
  ADD COLUMN IF NOT EXISTS tournament_details JSONB DEFAULT NULL;


-- 2. Create scheduler_updates table
CREATE TABLE IF NOT EXISTS scheduler_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT DEFAULT 'Scheduler',
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduler_updates_date
  ON scheduler_updates (date DESC);

ALTER TABLE scheduler_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read scheduler updates"
  ON scheduler_updates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage scheduler updates"
  ON scheduler_updates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
