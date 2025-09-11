# CBOA Member Portal Implementation Plan

## Overview
Complete implementation plan for the CBOA member portal with authentication, role-based access control, and content management features.

## 1. Authentication Architecture

### Role Hierarchy
- **Public**: Non-authenticated visitors
- **Official**: Registered CBOA officials
- **Executive**: Board members with content management access
- **Admin**: Full system administration

### Authentication Provider
- **Service**: Netlify Identity
- **Token Management**: JWT with refresh tokens
- **Session Storage**: httpOnly cookies
- **SSO Options**: Email/Password, Magic Links, Google OAuth

## 2. Portal Structure

### Public Routes
```
/                       - Homepage
/about                  - About CBOA
/news                   - Public news
/become-a-referee       - Application form
/get-officials          - Official request form
/contact                - Contact information
```

### Official Portal Routes (Protected)
```
/portal                     - Member dashboard
/portal/documents           - Document library
/portal/the-bounce          - Newsletter archive with PDF viewer
/portal/training            - Training resources
/portal/profile             - Personal profile management
/portal/directory           - Member directory
/portal/assignments         - Game assignments
/portal/resources           - Official resources
```

### Executive Portal Routes (Protected)
```
/portal/executive           - Executive dashboard
/portal/executive/analytics - Membership analytics
/portal/executive/finance   - Financial documents
/portal/executive/minutes   - Meeting minutes
/portal/executive/announcements - Post announcements
/admin                      - CMS access for content creation
```

### Admin Portal Routes (Protected)
```
/portal/admin               - Admin dashboard
/portal/admin/users         - User management
/portal/admin/roles         - Role assignments
/portal/admin/settings      - System settings
/portal/admin/audit         - Audit logs
/admin                      - Full CMS access
```

## 3. The Bounce Newsletter Archive

### Features
- Monthly archive organization
- Embedded PDF viewer with controls
- Search and filter functionality
- Download individual issues
- Mobile-responsive design

### Implementation
- **PDF Viewer**: react-pdf library
- **Storage**: /public/newsletters/[year]/[month].pdf
- **UI Components**:
  - Archive listing page
  - PDF viewer with navigation
  - Search bar with filters
  - Issue cards with preview

## 4. CMS Access Permissions

### Executive CMS Access
- Create/edit news posts
- Manage newsletter content
- Update announcements
- Upload documents
- Edit training materials
- Cannot delete content or modify settings

### Admin CMS Access
- Full content management
- Delete permissions
- Site settings configuration
- User management
- System configuration

## 5. Technical Implementation

### Required Dependencies
```json
{
  "netlify-identity-widget": "^1.9.2",
  "react-pdf": "^7.5.0",
  "js-cookie": "^3.0.5",
  "jsonwebtoken": "^9.0.2"
}
```

### Environment Variables
```
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
NETLIFY_IDENTITY_URL=https://your-site.netlify.app/.netlify/identity
JWT_SECRET=your-secret-key
```

### Security Measures
- Token rotation every hour
- Refresh tokens valid for 7 days
- CSRF protection
- Rate limiting on auth endpoints
- Audit logging for all actions

## 6. Implementation Phases

### Phase 1: Authentication Foundation (Week 1)
- [ ] Set up Netlify Identity
- [ ] Create authentication context
- [ ] Implement login/logout flows
- [ ] Add protected route middleware

### Phase 2: Role-Based Access (Week 2)
- [ ] Implement role checking
- [ ] Create role gates for components
- [ ] Set up API route protection
- [ ] Add user profile management

### Phase 3: Portal Pages (Week 3)
- [ ] Build member dashboard
- [ ] Create document library
- [ ] Implement The Bounce archive
- [ ] Add executive features

### Phase 4: CMS Integration (Week 4)
- [ ] Configure Decap CMS roles
- [ ] Set up content workflows
- [ ] Add audit logging
- [ ] Complete testing

## 7. File Structure
```
/cboa-site
  /app
    /portal
      layout.tsx            # Protected layout wrapper
      page.tsx              # Member dashboard
      /documents
      /the-bounce
        page.tsx            # Newsletter archive
        /[year]
          /[month]
            page.tsx        # Individual issue viewer
      /executive
      /admin
  /components
    /auth
      AuthProvider.tsx      # Authentication context
      LoginForm.tsx         # Login component
      RoleGate.tsx          # Role-based access control
    /portal
      Dashboard.tsx         # Dashboard components
      Navigation.tsx        # Portal navigation
    /the-bounce
      Archive.tsx           # Newsletter archive
      PDFViewer.tsx         # PDF viewer component
      IssueCard.tsx         # Issue preview card
  /lib
    /auth
      middleware.ts         # Auth middleware
      roles.ts              # Role definitions
      tokens.ts             # Token management
  /middleware.ts            # Next.js middleware for route protection
```

## 8. Database Schema (for future implementation)
```typescript
// User extended profile
interface UserProfile {
  id: string;
  email: string;
  role: 'public' | 'official' | 'executive' | 'admin';
  fullName: string;
  phone?: string;
  certificationLevel?: string;
  memberSince: Date;
  lastLogin: Date;
}

// Newsletter issue
interface NewsletterIssue {
  id: string;
  title: string;
  date: Date;
  issueNumber: number;
  pdfUrl: string;
  coverImage?: string;
  highlights: string[];
  fileSize: string;
  downloads: number;
}
```

## 9. Testing Checklist
- [ ] Authentication flow works correctly
- [ ] Role-based access control enforced
- [ ] PDF viewer loads and navigates properly
- [ ] Mobile responsive on all devices
- [ ] CMS access restricted by role
- [ ] Session management and timeouts
- [ ] Error handling for failed auth
- [ ] Audit logging captures events

## 10. Deployment Checklist
- [ ] Environment variables configured
- [ ] Netlify Identity enabled
- [ ] Build succeeds without errors
- [ ] All routes protected appropriately
- [ ] SSL certificate active
- [ ] Backup authentication method available
- [ ] Admin account created
- [ ] Initial content uploaded

## Next Steps
1. Install required dependencies
2. Set up authentication infrastructure
3. Create portal route structure
4. Implement The Bounce archive
5. Configure CMS permissions
6. Test with sample users
7. Deploy to production