# Supabase Setup Guide for CBOA Portal

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Choose a project name (e.g., "cboa-portal")
4. Set a strong database password (save this!)
5. Select a region closest to Calgary

## 2. Get Your API Keys

Once your project is created:
1. Go to Settings → API
2. Copy the following:
   - `Project URL` (e.g., https://xxxxx.supabase.co)
   - `anon/public` key (safe for client-side)
   - `service_role` key (server-side only - for Netlify Functions)

## 3. Database Schema

Run this SQL in the Supabase SQL Editor (SQL → New Query):

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Calendar Events Table
CREATE TABLE calendar_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  type VARCHAR(50) NOT NULL,
  location VARCHAR(255),
  description TEXT,
  created_by VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements Table
CREATE TABLE announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  author VARCHAR(255) NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resources Table
CREATE TABLE resources (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL,
  url TEXT,
  file_url TEXT,
  description TEXT,
  access_level VARCHAR(20) DEFAULT 'all',
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_calendar_events_date ON calendar_events(start_date, end_date);
CREATE INDEX idx_announcements_date ON announcements(date DESC);
CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_featured ON resources(is_featured);

-- Row Level Security (RLS) Policies
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to calendar events" ON calendar_events
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to announcements" ON announcements
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to resources" ON resources
  FOR SELECT USING (true);

-- For now, we'll handle write permissions through Netlify Functions
-- Later, you can add more granular policies based on user roles
```

## 4. Environment Variables

Create a `.env.local` file in your `cboa-site` directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 5. Netlify Environment Variables

In your Netlify dashboard:
1. Go to Site Settings → Environment Variables
2. Add the same three variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## 6. File Storage

Files (PDFs, documents) will be stored in the git repository under:
- `/public/portal/newsletters/` - for The Bounce PDFs
- `/public/portal/resources/` - for resource documents

This matches the CMS approach and provides more storage space.

## Security Notes

- Never commit `.env.local` to git
- The `SUPABASE_SERVICE_ROLE_KEY` should only be used in Netlify Functions (server-side)
- The `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe for client-side use
- Consider implementing proper authentication with Netlify Identity + Supabase Auth later