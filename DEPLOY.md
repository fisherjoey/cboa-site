# Deployment Instructions for Netlify

## Prerequisites
- Netlify account
- GitHub repository connected to Netlify

## Deployment Configuration

### 1. Netlify Build Settings
In your Netlify dashboard, configure the following build settings:

- **Base directory**: `cboa-site`
- **Build command**: `npm run build`
- **Publish directory**: `cboa-site/.next`
- **Node version**: 18 (set in Environment Variables)

### 2. Environment Variables
Add these environment variables in Netlify dashboard:

```
NODE_VERSION=18
NEXT_TELEMETRY_DISABLED=1
```

### 3. Required Netlify Plugins
The site uses the official Next.js plugin for Netlify. It should be automatically detected from the `netlify.toml` file.

### 4. Build Configuration
The `netlify.toml` file in the root directory contains all necessary configuration:
- Build settings
- Redirects for API and admin routes
- Plugin configuration
- Function directory settings

### 5. Deploy Steps

#### Option A: Auto Deploy (Recommended)
1. Push changes to your main branch
2. Netlify will automatically trigger a build
3. Monitor the build logs in Netlify dashboard

#### Option B: Manual Deploy
1. Go to Netlify dashboard
2. Navigate to your site
3. Click "Trigger deploy" → "Deploy site"

### 6. Post-Deployment Setup

#### Enable Netlify Identity (for CMS)
1. Go to Site settings → Identity
2. Click "Enable Identity"
3. Configure registration preferences (invite-only recommended)
4. Enable Git Gateway under Identity → Services

#### Configure Domain
1. Go to Site settings → Domain management
2. Add your custom domain
3. Configure DNS settings as instructed

### Common Build Issues and Solutions

#### Issue: Build fails with module not found
**Solution**: Clear cache and redeploy
```
Netlify dashboard → Deploys → Trigger deploy → Clear cache and deploy site
```

#### Issue: Next.js build errors
**Solution**: The `next.config.js` is configured to ignore TypeScript and ESLint errors during build. If you still encounter issues, check the build logs.

#### Issue: CMS not working
**Solution**: Ensure Git Gateway is enabled and properly configured in Netlify Identity settings.

### Build Output
After successful deployment, your site will be available at:
- Netlify URL: `https://[your-site-name].netlify.app`
- Custom domain: `https://cboa-calgary.ca` (after DNS configuration)

### Important Files
- `netlify.toml` - Netlify configuration
- `next.config.js` - Next.js configuration
- `package.json` - Build scripts and dependencies
- `.env.example` - Environment variable template

### Support
For deployment issues:
1. Check Netlify build logs
2. Verify all environment variables are set
3. Ensure Node version is 18 or higher
4. Clear cache and redeploy if needed