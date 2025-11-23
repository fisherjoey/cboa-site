'use client'

import Link from 'next/link';
import { useRole } from '@/contexts/RoleContext';
import {
  IconBooks,
  IconNews,
  IconNotebook,
  IconCalendar,
  IconGavel,
  IconClipboard,
  IconSettings,
  IconUser,
  IconUsers,
  IconExternalLink,
  IconCalendarEvent,
  IconBallBasketball,
  IconBrandDiscord,
  IconArchive
} from '@tabler/icons-react';
import UpcomingEventsWidget from '@/components/dashboard/UpcomingEventsWidget';
import LatestAnnouncementWidget from '@/components/dashboard/LatestAnnouncementWidget';
import LatestNewsletterWidget from '@/components/dashboard/LatestNewsletterWidget';

export default function PortalDashboard() {
  const { user } = useRole();

  // Define sections based on role
  const officialSections = [
    {
      href: '/portal/profile',
      title: 'My Profile',
      description: 'View and update your personal information and activity history',
      icon: IconUser,
      badge: null
    },
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
      href: '/portal/members',
      title: 'Members Directory',
      description: 'Manage member profiles, track activities, and view member information',
      icon: IconUsers,
      badge: 'EXEC'
    },
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
        <p className="text-sm sm:text-base text-gray-600">
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

      {/* Dashboard Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Announcement */}
        <LatestAnnouncementWidget />

        {/* Upcoming Events */}
        <UpcomingEventsWidget />
      </div>

      {/* Latest Newsletter - Full Width */}
      <LatestNewsletterWidget />

      {/* Quick Links Section */}
      <div className="bg-gray-50 rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Portal Links */}
          <Link
            href="/portal/profile"
            className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <IconUser className="h-5 w-5 text-orange-600 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900">My Profile</span>
          </Link>
          <Link
            href="/portal/resources"
            className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <IconBooks className="h-5 w-5 text-orange-600 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900">Resources</span>
          </Link>
          <Link
            href="/portal/news"
            className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <IconNews className="h-5 w-5 text-orange-600 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900">News</span>
          </Link>
          <Link
            href="/portal/calendar"
            className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <IconCalendar className="h-5 w-5 text-orange-600 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900">Calendar</span>
          </Link>
          <Link
            href="/portal/the-bounce"
            className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <IconNotebook className="h-5 w-5 text-orange-600 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900">Newsletter</span>
          </Link>
          <Link
            href="/portal/rule-modifications"
            className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <IconGavel className="h-5 w-5 text-orange-600 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900">Rule Modifications</span>
          </Link>
          {user.role !== 'official' && (
            <>
              <Link
                href="/portal/members"
                className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-shadow border border-gray-200"
              >
                <IconUsers className="h-5 w-5 text-orange-600 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-900">Members</span>
              </Link>
              <Link
                href="/portal/reports"
                className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-shadow border border-gray-200"
              >
                <IconClipboard className="h-5 w-5 text-orange-600 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-900">Reports</span>
              </Link>
            </>
          )}
          {/* External Links */}
          <a
            href="https://app.arbitersports.com/login"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <IconCalendarEvent className="h-5 w-5 text-orange-600 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900">Arbiter</span>
            <IconExternalLink className="h-3 w-3 text-gray-400 ml-auto flex-shrink-0" />
          </a>
          <a
            href="https://gameplanbasketball.ca/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <IconBallBasketball className="h-5 w-5 text-orange-600 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900">Game Plan</span>
            <IconExternalLink className="h-3 w-3 text-gray-400 ml-auto flex-shrink-0" />
          </a>
          <a
            href="https://discord.com/invite/CeqKGMyVhh"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <IconBrandDiscord className="h-5 w-5 text-orange-600 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900">Discord</span>
            <IconExternalLink className="h-3 w-3 text-gray-400 ml-auto flex-shrink-0" />
          </a>
          <a
            href="https://sites.google.com/view/cboa-resource-centre/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-white rounded-lg hover:shadow-md transition-shadow border border-gray-200"
          >
            <IconArchive className="h-5 w-5 text-orange-600 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900">Legacy Resource Centre</span>
            <IconExternalLink className="h-3 w-3 text-gray-400 ml-auto flex-shrink-0" />
          </a>
        </div>
      </div>
    </div>
  );
}