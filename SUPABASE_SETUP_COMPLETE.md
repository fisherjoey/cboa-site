# Complete Supabase Integration Setup

This guide will walk you through completing the Supabase integration for your CBOA site.

## Current Status

✅ Supabase project created
✅ Environment variables configured
✅ Client libraries installed
✅ Adapter code written
⚠️ Database schema incomplete
⚠️ Storage buckets not created
⚠️ Not integrated into production pages

---

## Step 1: Run Database Schema

1. **Open your Supabase Dashboard**:
   - Go to https://supabase.com/dashboard
   - Select your project: `qrfbkxqhwvftuzotecit`

2. **Navigate to SQL Editor**:
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Complete Schema**:
   - Copy the entire contents of `cboa-site/supabase/complete-schema.sql`
   - Paste into the SQL editor
   - Click "Run" (or press Ctrl+Enter)
   - You should see: "Success. No rows returned"

4. **Verify Tables Were Created**:
   - Click "Table Editor" in the left sidebar
   - You should see these tables:
     - `rule_modifications`
     - `announcements`
     - `calendar_events`
     - `resources`
     - `newsletters`

---

## Step 2: Create Storage Buckets

1. **Navigate to Storage**:
   - Click "Storage" in the left sidebar
   - Click "Create a new bucket"

2. **Create Three Buckets**:

   **Bucket 1: portal-resources**
   - Name: `portal-resources`
   - Public bucket: ✅ Yes
   - File size limit: 50 MB
   - Allowed MIME types: All (or specific: PDF, DOC, DOCX, images)

   **Bucket 2: newsletters**
   - Name: `newsletters`
   - Public bucket: ✅ Yes
   - File size limit: 50 MB
   - Allowed MIME types: application/pdf

   **Bucket 3: training-materials**
   - Name: `training-materials`
   - Public bucket: ✅ Yes
   - File size limit: 50 MB
   - Allowed MIME types: All

3. **Configure Bucket Policies** (for each bucket):
   - Click on the bucket name
   - Go to "Policies" tab
   - Click "New Policy"

   **Policy 1: Public Read Access**
   ```sql
   CREATE POLICY "Public can view files"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'portal-resources');
   ```

   **Policy 2: Authenticated Upload**
   ```sql
   CREATE POLICY "Authenticated users can upload"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'portal-resources'
     AND auth.role() = 'authenticated'
   );
   ```

   **Policy 3: Authenticated Delete**
   ```sql
   CREATE POLICY "Authenticated users can delete"
   ON storage.objects FOR DELETE
   USING (
     bucket_id = 'portal-resources'
     AND auth.role() = 'authenticated'
   );
   ```

   Repeat for `newsletters` and `training-materials` buckets.

---

## Step 3: Test the Connection

Let's verify everything works locally:

1. **Make sure your `.env.local` has these values**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://qrfbkxqhwvftuzotecit.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
   NEXT_PUBLIC_USE_SUPABASE=true
   ```

2. **Test the connection** (I can create a test script for you)

3. **Add some test data**:
   ```sql
   -- In Supabase SQL Editor
   INSERT INTO rule_modifications (slug, title, category, description, active)
   VALUES
     ('test-rule-1', 'Test Rule Modification', 'School League', 'This is a test rule', true),
     ('shot-clock-rule', '24-Second Shot Clock', 'Club Tournament', 'Shot clock rules for club tournaments', true);
   ```

---

## Step 4: Configure Netlify Environment Variables

Once local testing works, add the same environment variables to Netlify:

1. **Go to Netlify Dashboard**:
   - Open your CBOA site
   - Go to "Site settings" → "Environment variables"

2. **Add These Variables**:
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
     Value: `https://qrfbkxqhwvftuzotecit.supabase.co`

   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     Value: `eyJhbGci...` (from your .env.local)

   - Key: `SUPABASE_SERVICE_ROLE_KEY`
     Value: `eyJhbGci...` (from your .env.local)

   - Key: `NEXT_PUBLIC_USE_SUPABASE`
     Value: `true`

3. **Trigger a new deployment** to apply the variables

---

## Step 5: Migration Strategy

You have two options for migrating content:

### Option A: Hybrid Approach (Recommended)
Keep CMS for static content, use Supabase for dynamic content:

**Keep in CMS** (markdown files):
- News articles
- Training events
- Static pages (About, etc.)
- Basic resources

**Move to Supabase**:
- Rule modifications (need frequent updates)
- Announcements (time-sensitive)
- File uploads (PDFs, documents)
- Calendar events (dynamic scheduling)

### Option B: Full Migration
Move everything to Supabase (more work, but fully dynamic)

---

## Step 6: Switch Pages to Use Supabase

You already have example pages! Just need to activate them:

### Rule Modifications (Example):

**Current**: `app/portal/rule-modifications/page.tsx` (uses CMS)
**Supabase version**: `app/portal/rule-modifications/page-supabase.tsx` (ready to use)

To switch:
1. Rename `page.tsx` to `page-cms-backup.tsx`
2. Rename `page-supabase.tsx` to `page.tsx`
3. Update `next.config.js` to enable dynamic rendering:
   ```js
   const nextConfig = {
     output: 'export', // Change to 'standalone' for dynamic features
     // ... rest of config
   }
   ```

**WAIT!** If you use Supabase, you need to change from `output: 'export'` to enable server-side features.

---

## Step 7: Testing Checklist

- [ ] Can view rule modifications from Supabase in browser
- [ ] Can upload a file to portal-resources bucket
- [ ] Can create an announcement
- [ ] Can view calendar events
- [ ] Auth still works with Netlify Identity
- [ ] No console errors in browser

---

## Architecture Decision: Static vs Dynamic

**Current Setup**: Static export (`output: 'export'`)
- ✅ Cheapest hosting
- ✅ Fastest performance
- ✅ Works with Netlify free tier
- ❌ Can't use Supabase for server-side rendering
- ❌ All data fetched client-side

**With Supabase**: Need dynamic rendering (`output: 'standalone'`)
- ✅ Real-time data updates
- ✅ Server-side rendering
- ✅ Better SEO for dynamic content
- ❌ Requires serverless functions (still cheap on Netlify)
- ❌ Slightly more complex deployment

---

## Recommended Next Steps

1. **Run the schema SQL** (Step 1)
2. **Create storage buckets** (Step 2)
3. **Test connection locally** (I can help with this)
4. **Add test data and verify it works**
5. **Decide**: Hybrid or full migration?
6. **Update deployment config** if going dynamic

---

## Need Help?

- Supabase docs: https://supabase.com/docs
- Test script needed? Let me know!
- Want me to create migration scripts? Just ask!

---

## Quick Commands

```bash
# Test Supabase connection locally
cd cboa-site
npm run dev

# Build with static export (current)
npm run build

# Deploy to Netlify
git push origin main
```

Ready to proceed? Start with Step 1 - run the schema SQL in your Supabase dashboard!
