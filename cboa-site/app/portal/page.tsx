'use client'

import Link from 'next/link';
import { useRole } from '@/contexts/RoleContext';
import { 
  IconBooks, 
  IconNews, 
  IconNotebook, 
  IconCalendar,
  IconGavel,
  IconUsers,
  IconSettings,
  IconFileText,
  IconClipboard
} from '@tabler/icons-react';

export default function PortalDashboard() {
  const { user } = useRole();

  // Define sections based on role
  const officialSections = [
    {
      href: '/portal/resources',
      title: 'Resources',
      description: 'Access rulebooks, training materials, forms, and official documents',
      icon: IconBooks,
      color: 'blue',
      badge: null
    },
    {
      href: '/portal/news',
      title: 'News & Announcements',
      description: 'Stay updated with the latest CBOA news, events, and important announcements',
      icon: IconNews,
      color: 'green',
      badge: null
    },
    {
      href: '/portal/the-bounce',
      title: 'The Bounce',
      description: 'Read our monthly newsletter with in-depth articles and officiating insights',
      icon: IconNotebook,
      color: 'orange',
      badge: null
    },
    {
      href: '/portal/calendar',
      title: 'Calendar',
      description: 'View upcoming games, training sessions, and important dates',
      icon: IconCalendar,
      color: 'purple',
      badge: null
    },
    {
      href: '/portal/rule-modifications',
      title: 'Rule Modifications',
      description: 'Review CBOA-specific rule modifications and interpretations',
      icon: IconGavel,
      color: 'red',
      badge: null
    }
  ];

  const executiveSections = [
    ...officialSections,
    {
      href: '/portal/officials-management',
      title: 'Officials Management',
      description: 'Manage official certifications, levels, and assignments',
      icon: IconUsers,
      color: 'indigo',
      badge: 'EXEC'
    },
    {
      href: '/portal/reports',
      title: 'Reports & Analytics',
      description: 'View performance metrics, attendance, and statistical reports',
      icon: IconClipboard,
      color: 'teal',
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
      color: 'gray',
      badge: 'ADMIN'
    },
    {
      href: '/portal/system-settings',
      title: 'System Settings',
      description: 'Configure portal settings, user permissions, and system preferences',
      icon: IconFileText,
      color: 'slate',
      badge: 'ADMIN'
    }
  ];

  // Select sections based on role
  const sections = user.role === 'admin' 
    ? adminSections 
    : user.role === 'executive' 
      ? executiveSections 
      : officialSections;

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; hover: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', hover: 'text-blue-600' },
      green: { bg: 'bg-green-100', text: 'text-green-600', hover: 'text-green-600' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', hover: 'text-orange-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', hover: 'text-purple-600' },
      red: { bg: 'bg-red-100', text: 'text-red-600', hover: 'text-red-600' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', hover: 'text-indigo-600' },
      teal: { bg: 'bg-teal-100', text: 'text-teal-600', hover: 'text-teal-600' },
      gray: { bg: 'bg-gray-100', text: 'text-gray-600', hover: 'text-gray-600' },
      slate: { bg: 'bg-slate-100', text: 'text-slate-600', hover: 'text-slate-600' }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
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
            You have access to executive features including officials management and reports.
          </p>
        )}
        {user.role === 'admin' && (
          <p className="text-sm text-gray-500 mt-2">
            You have full administrative access to all portal features and content management.
          </p>
        )}
      </div>

      {/* Main Portal Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          const colors = getColorClasses(section.color);
          
          return (
            <Link key={section.href} href={section.href} className="block">
              <div className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow h-full relative">
                {section.badge && (
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${
                      section.badge === 'ADMIN' ? 'bg-red-500 text-white' : 
                      section.badge === 'EXEC' ? 'bg-purple-500 text-white' : 
                      'bg-gray-500 text-white'
                    }`}>
                      {section.badge}
                    </span>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className={`h-16 w-16 rounded-full ${colors.bg} flex items-center justify-center`}>
                      <Icon className={`h-8 w-8 ${colors.text}`} />
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
                    {section.title}
                  </h2>
                  <p className="text-gray-600 text-center text-sm">
                    {section.description}
                  </p>
                  <div className="mt-4 text-center">
                    <span className={`text-sm font-medium ${colors.hover}`}>
                      {section.href.startsWith('/admin') ? 'Open Admin →' : 'View →'}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Stats - Different based on role */}
      {user.role !== 'official' && (
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded">
              <div className="text-2xl font-bold text-blue-600">250+</div>
              <div className="text-sm text-gray-600">Active Officials</div>
            </div>
            <div className="bg-white p-4 rounded">
              <div className="text-2xl font-bold text-green-600">47</div>
              <div className="text-sm text-gray-600">Games This Week</div>
            </div>
            <div className="bg-white p-4 rounded">
              <div className="text-2xl font-bold text-orange-600">12</div>
              <div className="text-sm text-gray-600">Pending Assignments</div>
            </div>
            <div className="bg-white p-4 rounded">
              <div className="text-2xl font-bold text-purple-600">8</div>
              <div className="text-sm text-gray-600">Upcoming Events</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links Section */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/portal/resources#rulebooks" className="text-sm text-blue-600 hover:text-blue-800">
            • Rulebooks
          </a>
          <a href="/portal/resources#forms" className="text-sm text-blue-600 hover:text-blue-800">
            • Forms & Documents
          </a>
          <a href="/portal/resources#training" className="text-sm text-blue-600 hover:text-blue-800">
            • Training Materials
          </a>
          <a href="/portal/news#announcements" className="text-sm text-blue-600 hover:text-blue-800">
            • Latest Announcements
          </a>
          {user.role !== 'official' && (
            <>
              <a href="/portal/officials-management" className="text-sm text-purple-600 hover:text-purple-800">
                • Officials Directory
              </a>
              <a href="/portal/reports" className="text-sm text-purple-600 hover:text-purple-800">
                • Performance Reports
              </a>
            </>
          )}
          {user.role === 'admin' && (
            <>
              <a href="/admin" className="text-sm text-red-600 hover:text-red-800">
                • Content Management
              </a>
              <a href="/portal/system-settings" className="text-sm text-red-600 hover:text-red-800">
                • System Configuration
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}