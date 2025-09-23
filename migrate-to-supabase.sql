-- Create rule_modifications table in Supabase
CREATE TABLE IF NOT EXISTS rule_modifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL, -- Markdown content
  effective_date TEXT,
  priority INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  tags TEXT[], -- Array of tags
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Markdown
  category TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'normal',
  author TEXT DEFAULT 'CBOA Executive',
  urgent BOOLEAN DEFAULT false,
  audience TEXT[] DEFAULT ARRAY['all'],
  expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE rule_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can view active rules" ON rule_modifications
  FOR SELECT USING (active = true);

CREATE POLICY "Public can view announcements" ON announcements
  FOR SELECT USING (expires IS NULL OR expires > NOW());

-- Admin/Executive write access
CREATE POLICY "Admins can manage rules" ON rule_modifications
  FOR ALL USING (
    auth.jwt() ->> 'role' IN ('admin', 'executive')
  );

CREATE POLICY "Admins can manage announcements" ON announcements
  FOR ALL USING (
    auth.jwt() ->> 'role' IN ('admin', 'executive')
  );

-- Create indexes for performance
CREATE INDEX idx_rule_modifications_category ON rule_modifications(category);
CREATE INDEX idx_rule_modifications_active ON rule_modifications(active);
CREATE INDEX idx_announcements_category ON announcements(category);
CREATE INDEX idx_announcements_expires ON announcements(expires);