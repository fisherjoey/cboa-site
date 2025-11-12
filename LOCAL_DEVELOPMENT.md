# Local Development Setup

## Running the Development Environment

The CBOA site requires both the Next.js frontend and the Netlify Functions backend to run locally.

### Quick Start

**Terminal 1: Start the Functions Server**
```bash
cd cboa-site
npm run dev:functions
```
This starts the local functions server on http://localhost:8888

**Terminal 2: Start the Next.js Frontend**
```bash
cd cboa-site
npm run dev
```
This starts Next.js on http://localhost:3000

### What's Running

- **Next.js (port 3000)**: Frontend application
- **Functions Server (port 8888)**: Local Express server running Netlify Functions
  - Resources API
  - Calendar Events API
  - Announcements API
  - Upload File function
  - List Resource Files function

### Why Not Use Netlify Dev?

Netlify Dev (`npm run dev:netlify`) has issues on Windows with the current setup. The custom functions server (`npm run dev:functions`) is a lightweight alternative that:
- Runs all the same Netlify Functions
- Doesn't have the Windows compatibility issues
- Is faster to start up
- Easier to debug

### Environment Variables

Make sure `.env.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_USE_SUPABASE=true
```

### Testing the Setup

1. Open http://localhost:3000 in your browser
2. Navigate to http://localhost:3000/portal/resources
3. Try creating a new resource
4. The frontend (port 3000) will call the functions server (port 8888)
5. The functions server will interact with Supabase

### Architecture

```
Browser (localhost:3000)
    ↓
Next.js Frontend
    ↓  (API calls)
Local Functions Server (localhost:8888)
    ↓
Supabase (Production DB)
```

## Portal vs Public Site

### Portal (app/portal/**)
- **Uses Supabase Database** for all dynamic content
- Rule Modifications → `rule_modifications` table
- Resources → `resources` table
- Calendar Events → `calendar_events` table
- Announcements → `announcements` table
- All CRUD operations go through Netlify Functions

### Public Site (app/**, not /portal)
- **Uses CMS (Markdown files)** for static content
- News → `content/news/*.md`
- Training → `content/training/*.md`
- About pages → Static React components
- Built at compile time, not dynamic

### Key Rule
**No CMS in the Portal** - Everything in `/portal` must use Supabase, not markdown files.

## Common Tasks

### Testing Supabase Connection
```bash
npm run test:supabase
```

### Testing Storage Buckets
```bash
npm run test:buckets
```

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```

## Troubleshooting

### Functions Server Won't Start
- Check that port 8888 is not in use
- Make sure `.env.local` exists with all required variables
- Try: `npm install` to ensure all dependencies are installed

### Frontend Can't Connect to Functions
- Make sure functions server is running on port 8888
- Check browser console for CORS errors
- Verify `lib/api.ts` has correct `API_BASE` URL

### Database Errors
- Check Supabase dashboard to ensure tables exist
- Verify RLS policies allow operations
- Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly

### Upload Errors
- Check Storage bucket policies in Supabase dashboard
- Verify buckets are public
- Check that storage policies allow uploads

## Next Steps

See `MIGRATION_TO_DATABASE.md` for the plan to migrate remaining CMS content to Supabase.
