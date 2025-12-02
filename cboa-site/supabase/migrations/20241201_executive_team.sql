-- Create executive_team table
CREATE TABLE IF NOT EXISTS executive_team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  image_url TEXT,
  bio TEXT,
  active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_executive_team_active ON executive_team(active);
CREATE INDEX idx_executive_team_priority ON executive_team(priority DESC);

-- Enable RLS
ALTER TABLE executive_team ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (active members only)
CREATE POLICY "Anyone can view active executive members" ON executive_team
  FOR SELECT USING (active = true);

-- Policy for service role to manage all members
CREATE POLICY "Service role can manage executive team" ON executive_team
  FOR ALL USING (auth.role() = 'service_role');

-- Insert initial executive team members
INSERT INTO executive_team (name, position, email, priority, active) VALUES
  ('Natasha Proulx', 'President', 'president@cboa.ca', 100, true),
  ('Justin Weir', 'Vice President', 'vicepresident@cboa.ca', 95, true),
  ('Ian Pollard', 'Past President', 'pastpresident@cboa.ca', 90, true),
  ('Cole Andrew', 'Treasurer', 'treasurer@cboa.ca', 85, true),
  ('Shane Ross', 'Secretary', 'secretary@cboa.ca', 80, true),
  ('Cam Broadhead', 'Performance and Assessment', 'performance@cboa.ca', 75, true),
  ('David Falkenberg', 'Member Services', 'memberservices@cboa.ca', 70, true),
  ('Doran Davidson', 'Referee Development', 'education@cboa.ca', 65, true),
  ('Ryler Kerrison', 'Assignor', 'assignor@cboa.ca', 60, true),
  ('Jerome Bohaychuk', 'Scheduler', 'jerome@cboa.ca', 55, true),
  ('Joe Lam', 'Scheduler', 'joe.lam@cboa.ca', 50, true),
  ('Joey Fisher', 'Webmaster', 'webmaster@cboa.ca', 45, true),
  ('Chris Gauvin', 'Officiating Coordinator', 'officiating@cboa.ca', 40, true),
  ('Candy (Kayla) Brown', 'Recruiting Coordinator', 'recruiting@cboa.ca', 35, true);
