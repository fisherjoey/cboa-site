# CBOA Static Site

Official website for the Calgary Basketball Officials Association (CBOA).

## Project Structure

```
cboa-site/          # Main Next.js application
├── app/            # Next.js app directory with pages
├── components/     # Reusable React components
├── content/        # CMS content (markdown files)
├── lib/            # Utility functions and data fetching
├── public/         # Static assets (images, icons)
└── styles/         # Global styles
```

## Development

To run the development server:

```bash
cd cboa-site
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Features

- **Training Management**: Schedule and track training events and workshops
- **Resource Library**: Access to FIBA rules and officiating resources
- **News & Updates**: Latest announcements and information
- **Member Registration**: Online application for new referees
- **Official Requests**: Form for organizations to request officials

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **CMS**: File-based content management
- **Icons**: Tabler Icons
- **Deployment**: Optimized for static hosting

## Content Management

Content is managed through markdown files in the `/content` directory:
- `/content/news/` - News articles
- `/content/training/` - Training events
- `/content/resources/` - Resource documents
- `/content/settings/` - Site configuration

## Building for Production

```bash
npm run build
```

The site is configured for static export and can be deployed to any static hosting service.

## Contact

For questions about the website, contact: webmaster@cboa.ca