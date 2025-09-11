'use client'

import Link from 'next/link';
import { useRole } from '@/contexts/RoleContext';
import { useState, useEffect } from 'react';
import { 
  IconBooks, 
  IconNews, 
  IconNotebook, 
  IconCalendar,
  IconGavel,
  IconClipboard,
  IconSettings,
  IconEye,
  IconDownload
} from '@tabler/icons-react';

export default function PortalDashboard() {
  const { user } = useRole();
  const [latestBounce, setLatestBounce] = useState<any>(null);

  useEffect(() => {
    // Load the latest Bounce newsletter
    const newsletters = localStorage.getItem('cboa_newsletters');
    if (newsletters) {
      const parsed = JSON.parse(newsletters);
      if (parsed.length > 0) {
        // Sort by date and get the latest
        const sorted = parsed.sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setLatestBounce(sorted[0]);
      }
    }
  }, []);

  // Define sections based on role
  const officialSections = [
    {
      href: '/portal/resources',
      title: 'Resources',
      description: 'Access rulebooks, training materials, forms, and official documents',
      icon: IconBooks,
      badge: null
    },
    {
      href: '/portal/news',
      title: 'News & Announcements',
      description: 'Stay updated with the latest CBOA news, events, and important announcements',
      icon: IconNews,
      badge: null
    },
    {
      href: '/portal/the-bounce',
      title: 'The Bounce',
      description: 'Read our monthly newsletter with in-depth articles and officiating insights',
      icon: IconNotebook,
      badge: null
    },
    {
      href: '/portal/calendar',
      title: 'Calendar',
      description: 'View upcoming games, training sessions, and important dates',
      icon: IconCalendar,
      badge: null
    },
    {
      href: '/portal/rule-modifications',
      title: 'Rule Modifications',
      description: 'Review CBOA-specific rule modifications and interpretations',
      icon: IconGavel,
      badge: null
    }
  ];

  const executiveSections = [
    ...officialSections,
    {
      href: '/portal/reports',
      title: 'Reports & Analytics',
      description: 'View performance metrics, attendance, and statistical reports',
      icon: IconClipboard,
      badge: 'EXEC'
    }
  ];

  const adminSections = [
    ...executiveSections,
    {
      href: '/admin',
      title: 'CMS Admin',
      description: 'Manage website content, news articles, and resources',
      icon: IconSettings,
      badge: 'ADMIN'
    }
  ];

  // Select sections based on role
  const sections = user.role === 'admin' 
    ? adminSections 
    : user.role === 'executive' 
      ? executiveSections 
      : officialSections;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Welcome, {user.name}
        </h1>
        <p className="text-gray-600">
          You are logged in as: <span className="font-semibold">
            {user.role === 'admin' ? 'Administrator' : 
             user.role === 'executive' ? 'Executive Member' : 
             'Official'}
          </span>
        </p>
        {user.role === 'official' && (
          <p className="text-sm text-gray-500 mt-2">
            Access your resources, view announcements, and stay connected with CBOA.
          </p>
        )}
        {user.role === 'executive' && (
          <p className="text-sm text-gray-500 mt-2">
            You have access to executive features including reports and analytics.
          </p>
        )}
        {user.role === 'admin' && (
          <p className="text-sm text-gray-500 mt-2">
            You have full administrative access to all portal features and content management.
          </p>
        )}
      </div>

      {/* Latest Bounce Newsletter */}
      {latestBounce && (
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Latest Newsletter: The Bounce
              </h2>
              <h3 className="text-base font-medium text-gray-800 mb-1">
                {latestBounce.title}
              </h3>
              <p className="text-sm text-gray-600">
                Published: {new Date(latestBounce.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/portal/the-bounce"
                className="text-blue-600 hover:text-blue-800 p-2"
                title="View Newsletter"
              >
                <IconEye className="h-5 w-5" />
              </Link>
              {latestBounce.fileUrl && (
                <a
                  href={latestBounce.fileUrl}
                  download
                  className="text-green-600 hover:text-green-800 p-2"
                  title="Download PDF"
                >
                  <IconDownload className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Portal Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          
          return (
            <Link key={section.href} href={section.href} className="block">
              <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow h-full relative border border-gray-200">
                {section.badge && (
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      section.badge === 'ADMIN' ? 'bg-gray-700 text-white' : 
                      section.badge === 'EXEC' ? 'bg-gray-600 text-white' : 
                      'bg-gray-500 text-white'
                    }`}>
                      {section.badge}
                    </span>
                  </div>
                )}
                <div className="p-4 sm:p-6">
                  <div className="flex items-center mb-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-gray-700" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 ml-3 flex-1">
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {section.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Links Section - Simplified */}
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <Link href="/portal/resources#rulebooks" className="text-sm text-gray-700 hover:text-gray-900 hover:underline">
            → Rulebooks
          </Link>
          <Link href="/portal/resources#forms" className="text-sm text-gray-700 hover:text-gray-900 hover:underline">
            → Forms & Documents
          </Link>
          <Link href="/portal/resources#training" className="text-sm text-gray-700 hover:text-gray-900 hover:underline">
            → Training Materials
          </Link>
          <Link href="/portal/news#announcements" className="text-sm text-gray-700 hover:text-gray-900 hover:underline">
            → Latest Announcements
          </Link>
          <Link href="/portal/calendar" className="text-sm text-gray-700 hover:text-gray-900 hover:underline">
            → Upcoming Events
          </Link>
          <Link href="/portal/the-bounce" className="text-sm text-gray-700 hover:text-gray-900 hover:underline">
            → Newsletter Archive
          </Link>
          {user.role !== 'official' && (
            <Link href="/portal/reports" className="text-sm text-gray-700 hover:text-gray-900 hover:underline">
              → Performance Reports
            </Link>
          )}
          {user.role === 'admin' && (
            <Link href="/admin" className="text-sm text-gray-700 hover:text-gray-900 hover:underline">
              → Content Management
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}