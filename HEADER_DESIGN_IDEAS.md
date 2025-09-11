# CBOA Header Design Ideas & Wireframes

## Current Implementation
```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo] CBOA                     [Search] [Member Portal] [Apply Now]│ (Dark top bar)
├─────────────────────────────────────────────────────────────────────┤
│  Home | About | Training | Become a Referee | Request | Resources    │ (Blue nav bar)
│                                    Portal: Dashboard | Resources | News│ (When logged in)
└─────────────────────────────────────────────────────────────────────┘
```

## Design Option 1: Mega Menu with Dropdowns
```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo] CBOA                     [Search] [Member Portal] [Apply Now]│
├─────────────────────────────────────────────────────────────────────┤
│  Home | About ▼ | Training ▼ | Officials ▼ | Resources ▼ | News     │
│         └─ Mission    └─ Courses  └─ Become    └─ Rulebooks         │
│         └─ Executive  └─ Schedule └─ Request   └─ Forms              │
│         └─ History    └─ Clinics  └─ Assign    └─ Videos             │
└─────────────────────────────────────────────────────────────────────┘
```

## Design Option 2: Sticky Sub-Navigation
```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo] CBOA                              [Search] [Login] [Apply]   │
├─────────────────────────────────────────────────────────────────────┤
│  Home | About | Training | Become a Referee | Request | Resources    │
├─────────────────────────────────────────────────────────────────────┤
│  Quick Links: Next Clinic (Jan 15) | Rule Updates | The Bounce Dec  │ (Context bar)
└─────────────────────────────────────────────────────────────────────┘
```

## Design Option 3: User-Centric Portal Integration
```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo] CBOA                    [👤 John Doe ▼] [🔔 3] [Settings]   │
├─────────────────────────────────────────────────────────────────────┤
│  Public: Home | About | Training | Become | Request                  │
│  Member: Dashboard | Resources | News | The Bounce | Schedule        │
└─────────────────────────────────────────────────────────────────────┘
```

## Design Option 4: Tabbed Navigation
```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo] CBOA Calgary Basketball Officials         [Search] [Account] │
├─────────────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────────┐                                       │
│ │  Public  │ │ Member Portal│  (Tabs)                               │
│ └──────────┴─┴──────────────┴───────────────────────────────────────┤
│  Home | About | Training | Become a Referee | Request | Resources    │
└─────────────────────────────────────────────────────────────────────┘
```

## Design Option 5: Minimal with Side Drawer
```
┌─────────────────────────────────────────────────────────────────────┐
│  [☰] [Logo] CBOA                          [Search] [Portal] [Apply]  │
└─────────────────────────────────────────────────────────────────────┘
When menu clicked:
┌─────────────┬───────────────────────────────────────────────────────┐
│ Navigation  │                                                        │
│ ─────────── │                                                        │
│ Home        │                                                        │
│ About       │                                                        │
│ Training    │                                                        │
│ Officials   │                                                        │
│ Resources   │                                                        │
│ News        │                                                        │
│             │                                                        │
│ Member Area │                                                        │
│ ─────────── │                                                        │
│ Dashboard   │                                                        │
│ The Bounce  │                                                        │
│ Schedule    │                                                        │
└─────────────┴───────────────────────────────────────────────────────┘
```

## Design Option 6: Action-Oriented Header
```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo] CBOA                                                         │
│  Calgary Basketball Officials                                        │
├─────────────────────────────────────────────────────────────────────┤
│  I want to: [Become a Referee] [Request Officials] [Access Portal]   │
│  Learn: [About CBOA] [Training] [Resources] [News]                   │
└─────────────────────────────────────────────────────────────────────┘
```

## Design Option 7: Progressive Disclosure
```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo] CBOA     Home | About | Training | More ▼    [Portal Login] │
├─────────────────────────────────────────────────────────────────────┤
│  🏀 Next Game: Jan 15 | 📚 New Rules Available | 📰 Latest News     │ (Info bar)
└─────────────────────────────────────────────────────────────────────┘
```

## Design Option 8: Split Navigation with Notifications
```
┌─────────────────────────────────────────────────────────────────────┐
│  Public Site              CBOA              Member Portal            │
│  ────────────                               ──────────────           │
│  • About                [Logo]              • Dashboard (2)          │
│  • Training                                 • Resources              │
│  • Become Referee                          • The Bounce (NEW)       │
│  • Request Officials                        • My Schedule            │
└─────────────────────────────────────────────────────────────────────┘
```

## Design Option 9: Contextual Quick Actions
```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo] CBOA                                    [Search] [👤 Login]  │
├─────────────────────────────────────────────────────────────────────┤
│  Home | About | Training | Officials | Resources | News | Portal     │
├─────────────────────────────────────────────────────────────────────┤
│  Quick: [📅 View Schedule] [📖 Read Rules] [📝 Apply Now] [📧 Contact]│
└─────────────────────────────────────────────────────────────────────┘
```

## Design Option 10: Breadcrumb Integration
```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo] CBOA Calgary Basketball Officials    [Search] [Member Area]  │
├─────────────────────────────────────────────────────────────────────┤
│  You are here: Portal > The Bounce > December 2024                  │
├─────────────────────────────────────────────────────────────────────┤
│  [← Back] Home | About | Training | Officials | Resources | News     │
└─────────────────────────────────────────────────────────────────────┘
```

## Mobile-First Responsive Ideas

### Collapsed Mobile View
```
┌─────────────────┐
│ [☰] CBOA  [👤]  │
└─────────────────┘
```

### Expanded Mobile Menu
```
┌─────────────────┐
│ [✕] CBOA  [👤]  │
├─────────────────┤
│ Home            │
│ About           │
│ Training        │
│ Become Referee  │
│ Request Officials│
│ Resources       │
│ News            │
│ ───────────     │
│ Member Portal   │
│ The Bounce      │
│ My Schedule     │
│ Logout          │
└─────────────────┘
```

## Accessibility & UX Improvements

1. **Skip Navigation Link**: Hidden link for screen readers
2. **Keyboard Navigation**: Full tab support with visible focus states
3. **ARIA Labels**: Proper labeling for all interactive elements
4. **Contrast Ratios**: Ensure WCAG AAA compliance
5. **Sticky vs Fixed**: Consider scroll behavior and content visibility
6. **Loading States**: Show skeleton loaders during navigation
7. **Search Autocomplete**: Quick access to popular pages
8. **Notification Badge**: Show unread count for portal items
9. **Profile Menu**: Quick access to settings, logout, profile
10. **Emergency Banner**: Space for urgent announcements above header

## Implementation Recommendations

### Priority 1: Enhanced Current Design
- Add dropdown menus for main navigation items
- Include notification badges for portal users
- Implement search autocomplete
- Add user profile dropdown

### Priority 2: Mobile Optimization
- Implement hamburger menu for mobile
- Create bottom navigation for key actions on mobile
- Add swipe gestures for menu navigation

### Priority 3: Advanced Features
- Implement mega menus with featured content
- Add quick action buttons based on user role
- Create contextual navigation based on page section
- Add breadcrumb navigation for deep pages

## Color Scheme Suggestions

### Current
- Dark Header: #1a1a1a
- Blue Nav: #2c5282
- Orange Accent: #ed8936

### Alternative Palettes
1. **Modern Professional**
   - Primary: #0f172a (slate-900)
   - Secondary: #3b82f6 (blue-500)
   - Accent: #f97316 (orange-500)

2. **High Contrast**
   - Primary: #000000
   - Secondary: #ffffff
   - Accent: #ff6b35

3. **Soft Touch**
   - Primary: #334155 (slate-700)
   - Secondary: #64748b (slate-500)
   - Accent: #fb923c (orange-400)