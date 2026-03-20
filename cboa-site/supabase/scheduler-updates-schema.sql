-- Scheduler Updates table
-- Stores schedule-related news items (new leagues added, schedule changes, etc.)
CREATE TABLE IF NOT EXISTS scheduler_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT DEFAULT 'Scheduler',
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for ordering by date (newest first)
CREATE INDEX IF NOT EXISTS idx_scheduler_updates_date ON scheduler_updates (date DESC);

-- Enable RLS
ALTER TABLE scheduler_updates ENABLE ROW LEVEL SECURITY;

-- Read access for authenticated users
CREATE POLICY "Authenticated users can read scheduler updates"
  ON scheduler_updates FOR SELECT
  TO authenticated
  USING (true);

-- Admin/executive can manage scheduler updates
CREATE POLICY "Admins can manage scheduler updates"
  ON scheduler_updates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
