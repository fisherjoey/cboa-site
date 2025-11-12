# Migration Plan: CMS to Supabase Database

## Overview
Currently the site uses a hybrid approach:
- **CMS (Markdown files)**: Rule modifications, news, training
- **Supabase DB**: Resources, calendar events, announcements, newsletters

**Goal**: Migrate all dynamic content to Supabase so it can be managed through the admin portal.

---

## Current State

### What Uses CMS (Markdown)
1. **Rule Modifications** (`content/portal/rule-modifications/`)
   - Page: `app/portal/rule-modifications/page.tsx`
   - Loads via: `getAllContent('portal/rule-modifications')`
   - ✅ Supabase table EXISTS: `rule_modifications`

2. **News** (`content/news/`)
   - Page: `app/page.tsx` (homepage), `app/news/page.tsx`
   - Loads via: `getAllContent('news')`
   - ❌ Supabase table: NOT CREATED YET

3. **Training** (`content/training/`)
   - Page: `app/page.tsx` (homepage), `app/training/page.tsx`
   - Loads via: `getAllContent('training')`
   - ❌ Supabase table: NOT CREATED YET

### What Uses Supabase
1. **Resources** ✅
   - Table: `resources`
   - Page: `app/portal/resources/page.tsx`
   - API: `lib/api.ts` → `resourcesAPI`
   - Functions: `netlify/functions/resources.ts`

2. **Calendar Events** ✅
   - Table: `calendar_events`
   - Functions: `netlify/functions/calendar-events.ts`
   - NOT YET CONNECTED TO FRONTEND

3. **Announcements** ✅
   - Table: `announcements`
   - Functions: `netlify/functions/announcements.ts`
   - NOT YET CONNECTED TO FRONTEND

4. **Newsletters** ✅
   - Table: `newsletters`
   - NOT YET CONNECTED TO FRONTEND

---

## Migration Steps

### Phase 1: Connect Existing Supabase Tables to Frontend

#### 1.1 Rule Modifications
- [x] Table exists in Supabase
- [ ] Update `app/portal/rule-modifications/page.tsx` to use API
- [ ] Create API functions in `lib/api.ts`
- [ ] Test CRUD operations in admin portal

#### 1.2 Announcements
- [x] Table exists in Supabase
- [x] Backend function exists
- [ ] Create frontend component to display announcements
- [ ] Add announcements to homepage or create a "bounce" notification
- [ ] Create admin interface for managing announcements

#### 1.3 Calendar Events
- [x] Table exists in Supabase
- [x] Backend function exists
- [ ] Create calendar view component
- [ ] Display events on portal dashboard
- [ ] Create admin interface for managing events

### Phase 2: Create Missing Tables

#### 2.1 News Table
```sql
CREATE TABLE IF NOT EXISTS news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  author TEXT DEFAULT 'CBOA Admin',
  date DATE NOT NULL,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2.2 Training Table
```sql
CREATE TABLE IF NOT EXISTS training (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  type TEXT CHECK (type IN ('workshop', 'certification', 'refresher', 'meeting')),
  max_participants INTEGER,
  current_registrations INTEGER DEFAULT 0,
  registration_link TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Phase 3: Update Frontend to Use Database

#### 3.1 Rule Modifications
**Current**: Loads from markdown files
**New**: Load from Supabase via API

Changes needed:
- Update `app/portal/rule-modifications/page.tsx`
- Add `ruleModificationsAPI` to `lib/api.ts`
- Update `RuleModificationsClient.tsx` to handle CRUD

#### 3.2 Homepage
**Current**: Loads news and training from markdown
**New**: Load from Supabase via API

Changes needed:
- Update `app/page.tsx` to fetch from API
- Make it a client component or use Server Actions

---

## Implementation Priority

1. **FIRST**: Get backend functions working (locally or in production)
   - Option A: Fix production environment variables
   - Option B: Create local function server

2. **SECOND**: Connect Rule Modifications to database
   - Already has table and structure
   - Just needs API integration

3. **THIRD**: Add announcements/bounce notification
   - Table exists, just needs frontend component

4. **FOURTH**: Connect calendar events
   - Display on portal dashboard

5. **FIFTH**: Migrate News and Training
   - Create tables
   - Migrate existing markdown content
   - Update frontend

---

## Backend Function Status

**Issue**: Functions return 500 error because:
- Production may be missing `SUPABASE_SERVICE_ROLE_KEY` env var
- OR Production has old code

**Solutions**:
1. Check Netlify environment variables
2. Ensure all required vars are set in production
3. Redeploy functions (with permission)

**Alternative**: Create local function server for development

---

## Next Steps

1. Choose backend approach (fix production or local server)
2. Test resources API to confirm it works
3. Migrate rule modifications to use database
4. Add announcements component
5. Create admin interfaces for managing content
