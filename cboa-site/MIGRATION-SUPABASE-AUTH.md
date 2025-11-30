# Supabase Auth Migration

## Migration Status: CODE COMPLETE

The code migration from Netlify Identity to Supabase Auth is complete. **Auth emails are sent via Microsoft Graph API** (not Supabase's built-in emails).

## What Was Changed

### Files Created
- `app/(auth)/layout.tsx` - Auth pages layout with AuthProvider
- `app/(auth)/login/page.tsx` - New login page with email/password form
- `app/(auth)/forgot-password/page.tsx` - Password reset page
- `netlify/functions/supabase-auth-admin.ts` - Admin operations with Microsoft Graph emails
- `netlify/functions/auth-password-reset.ts` - Public password reset with Microsoft Graph
- `supabase/migrations/add-supabase-auth-user-id.sql` - Migration to add user_id column

### Files Modified
- `contexts/AuthContext.tsx` - Replaced Netlify Identity with Supabase Auth
- `components/AuthGuard.tsx` - Updated to redirect to /login instead of opening modal
- `lib/api.ts` - Replaced identityAPI with supabaseAuthAPI (aliased for compatibility)
- `netlify/functions/members.ts` - Added support for user_id lookups
- `app/portal/members/page.tsx` - Updated "Identity Users" to "Portal Users"
- `app/layout.tsx` - Removed Netlify Identity script
- `package.json` - Added @supabase/ssr dependency

### Files to Delete After Testing
These files are no longer used but kept for rollback if needed:
- `netlify/functions/identity-admin.ts`
- `netlify/functions/identity-signup.js`
- `netlify/functions/resend-invites.ts`
- `netlify/functions/bulk-set-roles.js`

## Before Deploying: Supabase Dashboard Setup

### 1. Enable Email Auth in Supabase
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Ensure **Email** provider is enabled
4. Configure settings:
   - Enable "Confirm email" if you want email verification
   - Enable "Secure email change" for security

### 2. Configure Email Templates
1. Go to **Authentication** > **Email Templates**
2. Update templates for:
   - **Invite user** - Sent when admin invites a new member
   - **Reset password** - Sent for password recovery
   - **Confirm email** - Sent for email verification (if enabled)

### 3. Configure URLs
1. Go to **Authentication** > **URL Configuration**
2. Set **Site URL**: `https://your-site.netlify.app`
3. Add **Redirect URLs**:
   - `https://your-site.netlify.app/portal`
   - `https://your-site.netlify.app/portal/reset-password`
   - `http://localhost:3000/portal` (for local development)
   - `http://localhost:3000/portal/reset-password`

### 4. Run Database Migration
Run the SQL migration to add the `user_id` column:
```sql
-- Add user_id column for Supabase Auth
ALTER TABLE members
ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE;

-- Create index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_members_user_id ON members(user_id);
```

### 5. Create Initial Admin User
1. Go to **Authentication** > **Users**
2. Click **Add user** > **Create new user**
3. Enter email and password for the first admin
4. After creating, click on the user and update their metadata:
   ```json
   {
     "role": "admin",
     "full_name": "Admin Name"
   }
   ```

## User Roles
Roles are stored in `user_metadata.role` or `app_metadata.role`:
- `admin` - Full access to all features
- `executive` - Can manage members and content
- `official` - Standard member access

## Auth Flow Summary

1. **Login**: User visits `/login`, enters email/password
2. **Session**: Supabase creates session, stored in cookies
3. **Auth State**: AuthContext listens for auth state changes
4. **Protected Routes**: AuthGuard redirects to /login if not authenticated
5. **Logout**: Supabase signs out, session cleared

## API Endpoints

### `/.netlify/functions/supabase-auth-admin`
Admin operations (requires admin role JWT):
- `GET ?action=list` - List all auth users
- `GET ?email=xxx` - Get user status by email
- `POST { email, name, role }` - Send invite via Microsoft Graph
- `POST { email, name, action: 'resend' }` - Resend invite
- `PUT { userId, role, name }` - Update user metadata
- `PUT { email, action: 'reset_password' }` - Send password reset (admin-initiated)
- `DELETE ?email=xxx` - Delete user

### `/.netlify/functions/auth-password-reset`
Public password reset (no auth required):
- `POST { email }` - Send password reset email via Microsoft Graph

## Microsoft Graph Email Integration

Auth emails are sent via your existing Microsoft Graph setup instead of Supabase's built-in emails. This provides:
- Branded CBOA email templates
- Emails from your own domain (announcements@cboa.ca)
- Better deliverability

**Required Environment Variables** (already configured):
- `MICROSOFT_TENANT_ID`
- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET`
- `MICROSOFT_SENDER_EMAIL`

## Testing Checklist

- [ ] Login with email/password works
- [ ] Logout works
- [ ] Password reset email sends
- [ ] Admin can see Portal Users list
- [ ] Admin can send invites
- [ ] Admin can resend invites
- [ ] New users can accept invites
- [ ] Roles are properly assigned and enforced
- [ ] AuthGuard redirects unauthenticated users to /login
