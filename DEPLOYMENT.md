# CBOA Website Deployment Guide

## Pre-Deployment Checklist

### 1. Repository Setup
- [ ] Push code to GitHub repository
- [ ] Connect GitHub repository to Netlify

### 2. Netlify Configuration

#### Site Settings
1. Go to Netlify Dashboard
2. Click "New site from Git"
3. Connect to your GitHub repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 18

#### Environment Variables
Set the following in Netlify Dashboard > Site Settings > Environment Variables:
```
NEXT_PUBLIC_SITE_URL=https://cboa.ca
```

#### Identity Configuration
1. Enable Netlify Identity:
   - Go to Site Settings > Identity
   - Click "Enable Identity"
   
2. Configure registration:
   - Set registration to "Invite only"
   - Configure external providers if needed (Google, GitHub)
   
3. Set up email templates:
   - Customize invitation email
   - Customize confirmation email
   - Customize password reset email

#### Git Gateway
1. Enable Git Gateway:
   - Go to Site Settings > Identity > Services
   - Enable Git Gateway
   - This allows CMS users to edit content

### 3. CMS Setup

1. **First Admin User**:
   - Go to https://cboa.ca/admin
   - You'll be prompted to create the first user
   - Use the invitation system to add more editors

2. **User Roles**:
   - `admin` - Full CMS access
   - `editor` - Can create/edit content
   - `member` - Portal access only

### 4. Domain Configuration

1. **Add Custom Domain**:
   - Go to Site Settings > Domain Management
   - Add custom domain: `cboa.ca`
   - Configure DNS records with your domain provider

2. **SSL Certificate**:
   - Netlify automatically provisions SSL
   - Wait for DNS propagation (up to 24 hours)

### 5. Portal Authentication

✅ **IMPLEMENTED: The portal now uses Netlify Identity for real authentication!**

Features:
- Portal is protected - requires login
- Roles are managed through Netlify Identity
- No more demo role switcher

**Setting up User Roles:**

1. In Netlify Identity, add roles to user's `app_metadata`:
   ```json
   {
     "roles": ["admin"]  // or ["executive"] or ["official"]
   }
   ```

2. Default role is "official" for any authenticated user

3. To set roles via Netlify Dashboard:
   - Go to Identity > Users
   - Click on a user
   - Edit app_metadata
   - Add roles array

**First Time Setup:**
1. Enable Netlify Identity (Site Settings > Identity)
2. First user signs up (becomes admin)
3. Admin invites other users
4. Admin sets roles in user metadata

### 6. Data Migration

1. **Content Files**:
   - All markdown content in `/content` folder
   - Will be managed through CMS after deployment

2. **Portal Data**:
   - Currently uses localStorage (demo)
   - For production, consider:
     - Netlify Functions for API
     - External database (Supabase, Firebase)
     - Or keep as static content managed via CMS

### 7. Post-Deployment

1. **Test Critical Paths**:
   - [ ] Homepage loads correctly
   - [ ] Navigation works
   - [ ] Contact forms submit
   - [ ] CMS login works at /admin
   - [ ] Portal features work as expected
   - [ ] News pages load
   - [ ] Resources can be viewed/downloaded

2. **Monitor**:
   - Check Netlify build logs
   - Monitor function logs if using
   - Set up error tracking (Sentry)

3. **Backup**:
   - Enable automatic GitHub backups
   - Regular content exports from CMS

## Deployment Commands

```bash
# Local testing
npm run build
npm run start

# Push to GitHub (triggers Netlify deploy)
git add .
git commit -m "Prepare for deployment"
git push origin main
```

## Troubleshooting

### Build Failures
- Check Node version (should be 18)
- Clear cache and redeploy
- Check for missing environment variables

### CMS Access Issues
- Verify Git Gateway is enabled
- Check user has correct role
- Clear browser cache

### Identity Issues
- Check Identity service is enabled
- Verify email templates are configured
- Check spam folder for confirmation emails

## Support

- Netlify Documentation: https://docs.netlify.com
- Next.js on Netlify: https://docs.netlify.com/frameworks/next-js/
- Decap CMS: https://decapcms.org/docs/

## Important URLs

- Production Site: https://cboa.ca
- CMS Admin: https://cboa.ca/admin
- Member Portal: https://cboa.ca/portal
- Netlify Dashboard: https://app.netlify.com