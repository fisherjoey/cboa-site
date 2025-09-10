# CBOA - Calgary Basketball Officials Association Website

A modern, responsive website for the Calgary Basketball Officials Association built with Next.js, TypeScript, and Decap CMS.

## Features

- **Modern Tech Stack**: Next.js 15, TypeScript, Tailwind CSS
- **Content Management**: Decap CMS for easy content updates
- **Responsive Design**: Mobile-first approach with excellent mobile experience
- **Static Site Generation**: Fast loading times with SSG
- **Component Architecture**: Reusable components for consistency

## Project Structure

```
cboa-site/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── [pages]/           # Individual page routes
├── components/            # React components
│   ├── content/           # Content display components
│   ├── layout/            # Layout components
│   └── ui/                # UI components
├── content/               # CMS content (markdown/yaml)
├── public/                # Static assets
│   └── admin/             # Decap CMS admin panel
└── styles/                # Global styles
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd cboa-site
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### Deploy to Netlify

1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `out`
4. Set up Netlify Identity for CMS authentication:
   - Enable Identity service in Netlify dashboard
   - Configure registration preferences
   - Add admin users

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Configure build settings (auto-detected)
4. Deploy

### Environment Variables

No environment variables required for basic setup. For production:

- `NEXT_PUBLIC_SITE_URL` - Your production URL

## CMS Access

Access the CMS at `/admin` after deployment. Requires authentication through Netlify Identity.

### Content Types

- **Officials**: Referee profiles and information
- **News**: News articles and updates
- **Training**: Training events and workshops
- **Schedules**: Game schedules and assignments
- **Resources**: Documents and resources for officials
- **Pages**: Static page content

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **CMS**: Decap CMS (formerly Netlify CMS)
- **Deployment**: Netlify/Vercel

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Private - All rights reserved

## Contact

Calgary Basketball Officials Association
- Email: info@cboa.ca
- Phone: (403) 555-CBOA