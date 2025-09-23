# CBOA Hybrid Architecture Plan

## Use Static/CMS for:
- **Rule Modifications** - Change infrequently, need version control
- **Training Materials** - PDFs, documents, guides
- **About/Info Pages** - Marketing content
- **News Articles** - Planned announcements

## Use Supabase for:
- **User Authentication** - Login/roles
- **Game Assignments** - Real-time updates needed
- **Official Availability** - Dynamic scheduling
- **Urgent Announcements** - Need instant visibility
- **File Storage** - PDFs, images (already configured)
- **Comments/Feedback** - User-generated content

## Implementation Steps:

### Phase 1: Keep Current Setup ✅
- Rule modifications via CMS
- Basic announcements via CMS
- Static pages

### Phase 2: Add Supabase Features
1. **User Authentication**
   ```typescript
   // Use Supabase Auth instead of localStorage
   const { user } = await supabase.auth.signIn({
     email, password
   })
   ```

2. **Dynamic Announcements**
   ```typescript
   // Hybrid: Load CMS + Supabase announcements
   const cmsAnnouncements = getAllContent('announcements')
   const { data: dbAnnouncements } = await supabase
     .from('announcements')
     .select('*')
     .eq('urgent', true)
   ```

3. **Game Assignments** (Future)
   ```typescript
   const { data: assignments } = await supabase
     .from('game_assignments')
     .select('*')
     .eq('official_id', user.id)
   ```

## Why This Works:
- Start with what's working (CMS)
- Add dynamic features incrementally
- No big rewrite needed
- Can migrate piece by piece