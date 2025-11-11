# Supabase Setup - Fresh Start Guide

## 🎯 Clean Slate Approach

Since you haven't launched yet, let's wipe everything and start with a clean, well-structured database.

---

## ⚡ Quick Setup (15 minutes)

### Step 1: Reset Database (2 minutes)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select project: `qrfbkxqhwvftuzotecit`

2. **Run Reset Script**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query" button (top right)
   - Open file: `cboa-site/supabase/reset-database.sql`
   - Copy the ENTIRE contents
   - Paste into the SQL Editor
   - Click "Run" (or press Ctrl/Cmd + Enter)
   - Should see message: "Success. No rows returned"

3. **Delete Storage Buckets** (if any exist)
   - Click "Storage" in left sidebar
   - If you see any buckets listed:
     - Click the ⋯ (three dots) next to each bucket
     - Click "Delete bucket"
     - Confirm deletion
   - Delete all existing buckets to start fresh

---

### Step 2: Create Clean Schema (3 minutes)

1. **Run the Fixed Schema**
   - Still in SQL Editor, click "New Query" again
   - Open file: `cboa-site/supabase/complete-schema-fixed.sql`
   - Copy the ENTIRE contents (all 267 lines)
   - Paste into the SQL Editor
   - Click "Run" (or press Ctrl/Cmd + Enter)
   - Should see: "Success. No rows returned" with a success message at the bottom

2. **Verify Tables Were Created**
   - Click "Table Editor" in left sidebar
   - You should now see 5 tables:
     - ✅ announcements
     - ✅ calendar_events
     - ✅ newsletters
     - ✅ resources
     - ✅ rule_modifications
   - If you see all 5 tables, you're good! ✅

---

### Step 3: Create Storage Buckets (5 minutes)

**Create buckets and make them public:**

1. **Click "Storage"** in left sidebar

2. **Create Bucket #1: portal-resources**
   - Click "New bucket" button (top right)
   - Bucket name: `portal-resources`
   - Leave "Public bucket" **UNCHECKED** for now (we'll change this after)
   - Click "Create bucket"

3. **Make it Public:**
   - Click on the `portal-resources` bucket you just created
   - Click the "Configuration" or "Settings" icon (⚙️)
   - Look for "Public access" or "Make bucket public" toggle
   - Toggle it to **ON** or click "Make public"
   - Confirm if prompted

   **Alternative method if above doesn't work:**
   - Click the bucket name
   - Click "Policies" tab
   - Click "New policy"
   - Select "For SELECT operations: Allow public access"
   - Click "Review" then "Save policy"

4. **Create Bucket #2: newsletters**
   - Click "New bucket" button again
   - Bucket name: `newsletters`
   - Click "Create bucket"
   - **Make it public** using the same method as above

5. **Create Bucket #3: training-materials**
   - Click "New bucket" button again
   - Bucket name: `training-materials`
   - Click "Create bucket"
   - **Make it public** using the same method as above

6. **Verify All Buckets Are Public:**
   - Back in Storage main view
   - You should see 3 buckets listed
   - Each should show "Public" indicator/badge
   - If not visible, click on each bucket and verify in settings

**Note:** Public buckets allow anyone to read/view files, but upload/delete is still controlled by your application code and RLS policies.

---

### Step 4: Add Test Data (2 minutes)

Let's add some sample data to test everything works:

1. **Go back to SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

2. **Copy and paste this test data:**

```sql
-- Test rule modifications
INSERT INTO rule_modifications (slug, title, category, description, active, priority, content)
VALUES
  ('shot-clock-24', '24-Second Shot Clock', 'Club Tournament', 'Implementation of 24-second shot clock for club tournaments', true, 10, 'All club tournament games will use a 24-second shot clock starting this season.'),
  ('possession-arrow', 'Possession Arrow Clarification', 'School League', 'Updated guidelines for possession arrow usage', true, 5, 'Possession arrow applies to all jump ball situations except the opening tip.'),
  ('timeout-rules', 'Timeout Duration Rules', 'Adult', 'Standardized timeout durations for adult leagues', true, 3, 'All timeouts are 60 seconds. Each team gets 2 timeouts per half.');

-- Test announcements
INSERT INTO announcements (title, content, category, priority, author)
VALUES
  ('Welcome to CBOA Portal', 'This is your new member portal powered by Supabase!', 'announcement', 'normal', 'Admin'),
  ('Season Start Reminder', 'Don''t forget - new season starts next week. Make sure your certifications are up to date.', 'announcement', 'high', 'Admin');

-- Test calendar events
INSERT INTO calendar_events (title, description, start_date, end_date, location, event_type)
VALUES
  ('Pre-Season Training Clinic', 'Mandatory training for all Level 3+ officials', '2025-01-15 18:00:00-07', '2025-01-15 21:00:00-07', 'Talisman Centre', 'training'),
  ('Provincial Championships', 'Officials needed for provincial tournament', '2025-03-20 09:00:00-07', '2025-03-22 18:00:00-07', 'Saville Community Centre', 'tournament');
```

3. **Run the query**
   - Click "Run" button
   - Should see: "Success. No rows returned"

4. **Verify Data Was Added**
   - Click "Table Editor" in left sidebar
   - Click on "rule_modifications" table
   - You should see 3 rows of data
   - Check "announcements" - should have 2 rows
   - Check "calendar_events" - should have 2 rows
   - ✅ Test data added successfully!

---

### Step 5: Test Connection Locally (2 minutes)

Now let's verify everything works from your local machine:

1. **Open your terminal**
   - Navigate to the project:
   ```bash
   cd "C:\Users\School\OneDrive\Desktop\CBOA Static Site\cboa-site"
   ```

2. **Install dependencies** (if you haven't already)
   ```bash
   npm install
   ```

3. **Run the test script**
   ```bash
   npm run test:supabase
   ```

4. **Expected output:**
   ```
   🔧 CBOA Supabase Connection Test
   ================================

   1. Checking environment variables...
   ✅ Environment variables found
      URL: https://qrfbkxqhwvftuzotecit.supabase.co
      Key: eyJhbGci...

   2. Creating Supabase client...
   ✅ Client created

   3. Testing database connection...
      ✅ Table "rule_modifications" accessible
      ✅ Table "announcements" accessible
      ✅ Table "calendar_events" accessible
      ✅ Table "resources" accessible
      ✅ Table "newsletters" accessible

   4. Testing storage buckets...
      ✅ Found 3 storage bucket(s):
         - portal-resources (public)
         - newsletters (public)
         - training-materials (public)

   5. Testing data operations...
      → Attempting to insert test data...
      ✅ Insert successful
      → Attempting to read test data...
      ✅ Read successful
      → Cleaning up test data...
      ✅ Cleanup successful

   ================================

   ✅ Test suite completed!

   Next steps:
   1. If any tables are missing, run complete-schema-fixed.sql in Supabase
   2. If buckets are missing, create them in Supabase Dashboard
   3. Check SUPABASE_SETUP_COMPLETE.md for detailed instructions
   ```

5. **If you see all ✅ checkmarks - SUCCESS!**

---

### Step 6: Verify Netlify Environment Variables (1 minute)

Make sure your production environment is configured:

1. **Go to Netlify Dashboard**
   - Open https://app.netlify.com
   - Select your CBOA site
   - Go to "Site settings" → "Environment variables"

2. **Verify these variables exist:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://qrfbkxqhwvftuzotecit.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... (long key from .env.local)
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (different long key from .env.local)
   NEXT_PUBLIC_USE_SUPABASE=true
   ```

3. **If any are missing, add them:**
   - Click "Add a variable"
   - Key: (variable name from above)
   - Value: (value from your `.env.local` file)
   - Scopes: Select "All" (or at minimum "Production")
   - Click "Create variable"

4. **After adding/verifying variables:**
   - You don't need to redeploy yet
   - Variables will be used on next deployment

---

## 🎉 Success! You're Done!

You now have a **fully functional Supabase setup** with:
- ✅ 5 database tables with proper structure and indexes
- ✅ 3 storage buckets for file uploads
- ✅ RLS policies enabled (controlled by your app)
- ✅ Test data to verify everything works
- ✅ Automatic updated_at triggers
- ✅ Proper indexes for performance
- ✅ Local connection verified
- ✅ Production environment configured

---

## 🚀 Next Step: Use It!

### Quick Win #1: View Your Test Data

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser:**
   - Go to http://localhost:3000/portal
   - Log in (auth is bypassed in dev mode if `NEXT_PUBLIC_DISABLE_AUTH_DEV=true`)

### Quick Win #2: Switch Rule Modifications to Supabase

Your rule modifications page already has a Supabase-powered version ready!

1. **Navigate to the rule modifications folder:**
   ```bash
   cd app/portal/rule-modifications
   ```

2. **Backup the current CMS version:**
   ```bash
   # In Git Bash or PowerShell
   mv page.tsx page-cms-backup.tsx
   ```

3. **Activate the Supabase version:**
   ```bash
   mv page-supabase.tsx page.tsx
   ```

4. **Refresh your browser**
   - Go to http://localhost:3000/portal/rule-modifications
   - You should see the 3 test rules you added!
   - Try adding/editing in Supabase SQL Editor - changes appear instantly (no rebuild!)

---

## 📊 Database Structure Overview

```
rule_modifications
├── id (UUID)
├── slug (TEXT, unique)
├── title (TEXT)
├── category (TEXT)
├── description (TEXT)
├── content (TEXT)
├── active (BOOLEAN)
├── priority (INTEGER)
├── effective_date (DATE)
├── created_at, updated_at (auto)

announcements
├── id (UUID)
├── title, content (TEXT)
├── category, priority (TEXT)
├── author (TEXT)
├── published_at (TIMESTAMPTZ)

calendar_events
├── id (UUID)
├── title, description (TEXT)
├── start_date, end_date (TIMESTAMPTZ)
├── location, event_type (TEXT)

resources
├── id (UUID)
├── file_name, file_url (TEXT)
├── category, bucket (TEXT)
├── file_size (BIGINT)
├── is_featured (BOOLEAN)

newsletters
├── id (UUID)
├── title, description (TEXT)
├── date (DATE)
├── file_url, file_name (TEXT)
├── is_featured (BOOLEAN)
```

---

## ✅ Setup Checklist

Follow this in order:

- [ ] **Step 1a:** Open Supabase Dashboard
- [ ] **Step 1b:** Run reset-database.sql in SQL Editor
- [ ] **Step 1c:** Delete any existing storage buckets
- [ ] **Step 2a:** Run complete-schema-fixed.sql in SQL Editor
- [ ] **Step 2b:** Verify 5 tables exist in Table Editor
- [ ] **Step 3:** Create 3 public storage buckets
- [ ] **Step 4a:** Insert test data via SQL Editor
- [ ] **Step 4b:** Verify data in Table Editor
- [ ] **Step 5:** Run `npm run test:supabase` locally
- [ ] **Step 6:** Verify Netlify environment variables
- [ ] **Bonus:** Switch rule modifications page to Supabase

---

## 🆘 Troubleshooting

### "Policy already exists" error:
- **Solution:** Run the reset script again, it cleans up old policies
- Or manually drop policies in SQL Editor

### Test script fails with connection error:
- **Check:** Is `.env.local` in the `cboa-site` folder?
- **Check:** Do the keys in `.env.local` match what's in Supabase Dashboard?
- **Try:** `cd cboa-site` then `npm run test:supabase`

### Can't create buckets:
- **Check:** Did you delete old buckets first?
- **Try:** Refresh the Storage page
- **Note:** Bucket names must be lowercase, no spaces

### "auth.uid() not found" error:
- **Solution:** Make sure you're using `complete-schema-fixed.sql`, NOT the original `complete-schema.sql`
- The fixed version works with Netlify Identity

### Tables missing after running schema:
- **Check:** Did you see "Success" message?
- **Check:** Table Editor → Refresh page
- **Try:** Run the schema again (it has `IF NOT EXISTS` so it's safe)

### Test data insert fails:
- **Check:** Did you run the schema first?
- **Check:** Are all 5 tables visible in Table Editor?
- **Try:** Run just one INSERT at a time to find the problematic one

---

## 🔒 Security Notes

**Your setup is secure because:**
- ✅ Portal requires Netlify Identity login
- ✅ Role-based access (Official/Executive/Admin) in your app
- ✅ RLS is enabled (database level protection)
- ✅ Public policies are safe (controlled by your application)
- ✅ Service role key is server-side only (in Netlify Functions)

**How it works:**
1. **Database:** Wide open read, write requires valid request
2. **Application:** Netlify Identity guards the portal pages
3. **Frontend:** Role checks control what users can do
4. **Backend:** (Future) Netlify Functions validate tokens for writes

---

## 🎯 What's Next?

After this setup, you can:

1. **Migrate more content** - Move announcements, calendar events to Supabase
2. **Add file uploads** - Use the storage buckets for PDFs, documents
3. **Create admin UI** - Build forms to manage rules without SQL
4. **Real-time updates** - Content updates instantly (no rebuilds!)
5. **Better than CMS** - No git commits needed for content changes

---

**You're ready! Start with Step 1 and follow the checkboxes. Should take about 15 minutes total.**

Questions? Check the troubleshooting section above or the detailed SUPABASE_SETUP_COMPLETE.md guide.
