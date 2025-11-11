# Supabase Integration - Quick Start

## 🎯 Your Mission
Get Supabase fully integrated with your CBOA site.

---

## ✅ What You Already Have

- Supabase project created: `qrfbkxqhwvftuzotecit.supabase.co`
- Credentials in `.env.local`
- Supabase client code written
- Storage adapters ready
- Data adapters ready
- Example pages ready to use

---

## 📋 What You Need To Do

### 1️⃣ Run Database Schema (5 minutes)

```bash
# File location
cboa-site/supabase/complete-schema.sql
```

**Steps:**
1. Open https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" → "New Query"
4. Copy/paste `complete-schema.sql`
5. Click "Run"
6. Verify tables in "Table Editor"

**Tables to verify:**
- ✅ rule_modifications
- ✅ announcements
- ✅ calendar_events
- ✅ resources
- ✅ newsletters

---

### 2️⃣ Create Storage Buckets (3 minutes)

**In Supabase Dashboard:**
1. Click "Storage"
2. Create these 3 buckets (all PUBLIC):
   - `portal-resources`
   - `newsletters`
   - `training-materials`

---

### 3️⃣ Test Connection Locally (2 minutes)

```bash
cd cboa-site

# Install ts-node if needed
npm install

# Run test script
npm run test:supabase
```

**Expected output:**
```
✅ Environment variables found
✅ Client created
✅ All tables accessible
✅ Storage buckets found
✅ Test suite completed!
```

---

### 4️⃣ Add Environment Variables to Netlify (3 minutes)

**In Netlify Dashboard:**
Go to: Site Settings → Environment Variables → Add

```
NEXT_PUBLIC_SUPABASE_URL=https://qrfbkxqhwvftuzotecit.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... (from .env.local)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (from .env.local)
NEXT_PUBLIC_USE_SUPABASE=true
```

Then: Trigger new deployment

---

### 5️⃣ Decide: Static or Dynamic?

#### Option A: Keep Static (Current)
**Pros:**
- ✅ Free Netlify hosting
- ✅ Fastest performance
- ✅ No changes to deployment

**Cons:**
- ❌ Supabase data fetched client-side only
- ❌ No server-side rendering
- ❌ Slightly worse SEO for dynamic content

**How:**
- Keep `next.config.js` as-is
- Use Supabase in client components only

#### Option B: Go Dynamic (Recommended for Supabase)
**Pros:**
- ✅ Server-side rendering
- ✅ Better SEO
- ✅ Real-time data
- ✅ More secure (API keys on server)

**Cons:**
- ❌ Need serverless functions (still cheap)
- ❌ Slightly more complex deploy

**How:**
Change `next.config.js`:
```js
const nextConfig = {
  output: 'standalone', // Changed from 'export'
  // ... rest stays same
}
```

---

## 🚀 Quick Wins - Use Supabase Today

### Switch Rule Modifications to Supabase

**Current:** Uses markdown files (CMS)
**Goal:** Use Supabase (instant updates, no rebuilds)

**Steps:**
1. Add some test data in Supabase SQL Editor:
```sql
INSERT INTO rule_modifications (slug, title, category, description, active, priority)
VALUES
  ('shot-clock-24', '24-Second Shot Clock', 'Club Tournament', 'Shot clock implementation for club tournaments', true, 10),
  ('possession-arrow', 'Possession Arrow Usage', 'School League', 'Clarification on possession arrow rules', true, 5);
```

2. Switch the page:
```bash
cd cboa-site/app/portal/rule-modifications
mv page.tsx page-cms-backup.tsx
mv page-supabase.tsx page.tsx
```

3. Test locally:
```bash
npm run dev
# Open http://localhost:3000/portal (login required)
```

4. Deploy if it works!

---

## 📊 Migration Roadmap

### Phase 1: Dynamic Content Only (Recommended)
Move only frequently-updated content to Supabase:
- ✅ Rule modifications
- ✅ Announcements
- ✅ Calendar events
- ✅ File uploads

Keep in CMS:
- News articles
- Training events
- Static pages

### Phase 2: Everything (Future)
Migrate all content to Supabase database.

---

## 🆘 Troubleshooting

### Test Script Fails?
```bash
# Check environment variables
cat .env.local | grep SUPABASE

# Make sure you're in the right directory
cd cboa-site
npm run test:supabase
```

### Tables Missing?
- Run `complete-schema.sql` in Supabase SQL Editor
- Check "Table Editor" to verify

### Buckets Missing?
- Go to Storage section in Supabase Dashboard
- Create manually (see Step 2)

### RLS Policy Errors?
- Policies are in `complete-schema.sql`
- Allow public read, authenticated write

---

## 📝 Commands Reference

```bash
# Install dependencies
npm install

# Test Supabase connection
npm run test:supabase

# Run dev server
npm run dev

# Build for production
npm run build

# Deploy (push to GitHub)
git add .
git commit -m "Add Supabase integration"
git push origin main
```

---

## 📚 Documentation Files

- **SUPABASE_SETUP_COMPLETE.md** - Detailed step-by-step guide
- **SUPABASE_QUICKSTART.md** - This file (quick reference)
- **supabase/complete-schema.sql** - Database schema
- **scripts/test-supabase.ts** - Connection test script

---

## ⏱️ Time Estimate

- **Minimum setup**: ~15 minutes
  - Run schema (5 min)
  - Create buckets (3 min)
  - Test locally (2 min)
  - Add to Netlify (3 min)
  - Test deployment (2 min)

- **Full integration**: ~2-4 hours
  - Includes migrating content
  - Testing all features
  - Updating all pages

---

## 🎉 Success Criteria

You'll know it's working when:
- ✅ Test script passes all checks
- ✅ Can view Supabase data in browser
- ✅ Can upload files to buckets
- ✅ No console errors
- ✅ Auth still works

---

**Ready to start? Begin with Step 1: Run the schema SQL!**

Questions? Check SUPABASE_SETUP_COMPLETE.md for detailed instructions.
