# Best Practices for Member Portal Implementation

## 1. Authentication & Access Control

### Separate Subdomain Approach ✅ (Recommended)
```
public site:  www.cboa.ca
member portal: portal.cboa.ca  OR  members.cboa.ca
admin portal:  admin.cboa.ca
```
**Pros:**
- Clear separation of concerns
- Independent deployment cycles
- Can use different tech stacks
- Better security isolation
- Easier to implement different authentication methods
- Can be hosted on different servers/services

### Subfolder Approach
```
www.cboa.ca/
www.cboa.ca/portal/
www.cboa.ca/admin/
```
**Pros:**
- Simpler SSL certificate management
- Easier local development
- Single codebase possible
**Cons:**
- Harder to separate concerns
- Shared cookies/sessions can cause issues

## 2. Navigation Patterns

### Best Practice: Context-Aware Navigation
```
Public Site Header:
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo] CBOA                                    [Login] [Apply Now]  │
├─────────────────────────────────────────────────────────────────────┤
│  Home | About | Training | Become a Referee | Request | Resources    │
└─────────────────────────────────────────────────────────────────────┘

Member Portal Header (after login):
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo] CBOA Member Portal         Hi, John [Profile ▼] [Logout]    │
├─────────────────────────────────────────────────────────────────────┤
│  Dashboard | Resources | News | The Bounce | Schedule | Settings     │
│                                            [← Back to Public Site]   │
└─────────────────────────────────────────────────────────────────────┘
```

## 3. Visual Differentiation

### Color Coding
- **Public Site**: Primary brand colors (Blue/Orange)
- **Member Portal**: Shifted palette (Darker blue/Gold)
- **Admin Portal**: Distinct palette (Gray/Red accents)

### Visual Indicators
```
Member Portal:
┌─────────────────────────────────────────────────────────────────────┐
│  🔒 Secure Member Area                                   [John Doe]  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  You are in: MEMBER PORTAL                                          │
└─────────────────────────────────────────────────────────────────────┘
```

## 4. Industry Examples

### **Microsoft** (Excellent Example)
- Public: microsoft.com
- Portal: portal.microsoft.com
- Admin: admin.microsoft.com
- Clear visual differentiation
- Consistent but distinct navigation

### **GitHub**
- Public: github.com
- User: github.com/[username]
- Settings: github.com/settings
- Organizations: github.com/organizations
- Uses path-based separation with clear context

### **Salesforce**
- Marketing: salesforce.com
- Login: login.salesforce.com
- App: [instance].lightning.force.com
- Complete separation with different domains

## 5. Technical Implementation

### Recommended Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Public Site   │     │  Member Portal  │     │  Admin Portal   │
│   (Next.js)     │     │   (Next.js)     │     │   (Next.js)     │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                         │
         └───────────┬───────────┴─────────────┬──────────┘
                     │                         │
              ┌──────┴──────┐          ┌──────┴──────┐
              │  Auth API   │          │  Data API   │
              │  (Auth0/    │          │  (REST/     │
              │  Netlify)   │          │  GraphQL)   │
              └─────────────┘          └─────────────┘
```

### Monorepo Structure
```
cboa-platform/
├── apps/
│   ├── public-site/
│   ├── member-portal/
│   └── admin-portal/
├── packages/
│   ├── ui-components/    # Shared components
│   ├── auth/             # Shared auth logic
│   └── api-client/       # Shared API client
└── libs/
    └── shared-types/     # TypeScript types
```

## 6. User Experience Best Practices

### Clear Entry Points
```
Public Homepage:
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  Welcome to CBOA                          ┌──────────────────┐     │
│                                           │  Member Login     │     │
│  For Officials ─────►                     │                  │     │
│  For Leagues ───────►                     │  [Login Button]  │     │
│  For Public ────────►                     │                  │     │
│                                           │  Not a member?   │     │
│                                           │  [Apply Now]     │     │
│                                           └──────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

### Persistent Identity
Once logged in, show user identity across all areas:
- Name/Avatar in header
- Role badge (Official, Executive, Admin)
- Last login time
- Notification count

### Smart Redirects
- Save intended destination before login
- Redirect to portal dashboard after login
- Maintain context when switching between areas

## 7. Security Considerations

### Session Management
```javascript
// Separate session cookies per subdomain
portal.cboa.ca:   portal_session (httpOnly, secure, sameSite)
admin.cboa.ca:    admin_session (httpOnly, secure, sameSite)
www.cboa.ca:      public_session (can be less restrictive)
```

### Role-Based Access
```
Public User:
  ✓ View public pages
  ✗ Access portal
  ✗ Access admin

Member (Official):
  ✓ View public pages
  ✓ Access member portal
  ✗ Access admin area

Executive:
  ✓ View public pages
  ✓ Access member portal
  ✓ Limited admin access (CMS, news)

Admin:
  ✓ Full access to all areas
```

## 8. Mobile Considerations

### App-Like Experience for Portal
```
Mobile Portal View:
┌──────────────┐
│ ☰  Portal    │  <- Simplified header
├──────────────┤
│              │
│  Dashboard   │  <- Touch-optimized
│              │
├──────────────┤
│ [Resources]  │  <- Large tap targets
│ [News]       │
│ [The Bounce] │
│ [Schedule]   │
└──────────────┘
```

### Progressive Web App (PWA)
- Make portal installable
- Offline access to key resources
- Push notifications for updates

## 9. Analytics & Tracking

### Separate Analytics Properties
- Public Site: GA Property 1
- Member Portal: GA Property 2
- Admin Portal: GA Property 3

This allows for:
- Separate conversion tracking
- Different success metrics
- Privacy compliance (members may have different consent)

## 10. Common Pitfalls to Avoid

❌ **Don't Mix Contexts**
- Avoid showing public navigation in portal
- Don't use same color scheme for all areas

❌ **Don't Share Sessions Unnecessarily**
- Each area should have independent sessions
- Logout from portal shouldn't affect public site

❌ **Don't Overcomplicate**
- Start with clear separation
- Add cross-navigation only if needed

❌ **Don't Forget Mobile**
- Portal needs mobile-first design
- Consider native app for frequent users

## Recommended Implementation for CBOA

### Phase 1: Current Approach (Simple)
- Single domain with /portal path
- Shared header with conditional portal links
- Visual differentiation through colors

### Phase 2: Subdomain Separation (Better)
- portal.cboa.ca for member area
- Separate Next.js app or route groups
- Independent auth sessions
- Clearer visual identity

### Phase 3: Full Platform (Best)
- Multiple subdomains for different user types
- Microservices architecture
- Native mobile apps
- Advanced analytics and personalization

## Example Implementation

### Next.js App Router Structure
```
app/
├── (public)/          # Public site layout group
│   ├── layout.tsx     # Public header/footer
│   ├── page.tsx
│   └── about/
├── (portal)/          # Portal layout group
│   ├── layout.tsx     # Portal header/nav
│   ├── middleware.ts  # Auth check
│   └── dashboard/
└── (admin)/           # Admin layout group
    ├── layout.tsx     # Admin header/nav
    ├── middleware.ts  # Admin auth check
    └── users/
```

### Middleware for Protection
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  if (path.startsWith('/portal')) {
    // Check for valid session
    if (!hasValidSession(request)) {
      return NextResponse.redirect('/login?redirect=' + path);
    }
  }
  
  if (path.startsWith('/admin')) {
    // Check for admin role
    if (!hasAdminRole(request)) {
      return NextResponse.redirect('/unauthorized');
    }
  }
}
```