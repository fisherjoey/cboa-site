'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { 
  IconFileText,
  IconSpeakerphone,
  IconNews,
  IconBallBasketball,
  IconBooks,
  IconUsers,
  IconRocket,
  IconPlus,
  IconUpload
} from '@tabler/icons-react'

export default function PortalAdmin() {
  useEffect(() => {
    // Check if user has admin/executive role
    // In production, this would be a proper auth check
    const userRole = 'executive' // Mock role
    
    if (userRole !== 'admin' && userRole !== 'executive') {
      window.location.href = '/portal'
    }
  }, [])

  const adminSections = [
    {
      title: 'Content Management',
      description: 'Manage portal content through the CMS',
      icon: IconFileText,
      links: [
        { label: 'Access CMS', href: '/admin', target: '_blank', badge: 'External' },
        { label: 'View Content', href: '/portal/admin/content' },
      ]
    },
    {
      title: 'Portal Announcements',
      description: 'Create and manage member announcements',
      icon: IconSpeakerphone,
      links: [
        { label: 'New Announcement', href: '/admin/#/collections/portal_announcements/new', target: '_blank' },
        { label: 'Manage Announcements', href: '/admin/#/collections/portal_announcements', target: '_blank' },
      ]
    },
    {
      title: 'The Bounce Newsletter',
      description: 'Upload and manage monthly newsletters',
      icon: IconNews,
      links: [
        { label: 'Upload Newsletter', href: '/admin/#/collections/the_bounce/new', target: '_blank' },
        { label: 'Manage Issues', href: '/admin/#/collections/the_bounce', target: '_blank' },
      ]
    },
    {
      title: 'Game Assignments',
      description: 'Schedule and assign officials to games',
      icon: IconBallBasketball,
      links: [
        { label: 'New Assignment', href: '/admin/#/collections/game_assignments/new', target: '_blank' },
        { label: 'View Schedule', href: '/portal/admin/schedule' },
      ]
    },
    {
      title: 'Portal Resources',
      description: 'Upload documents and resources for members',
      icon: IconBooks,
      links: [
        { label: 'Add Resource', href: '/admin/#/collections/portal_resources/new', target: '_blank' },
        { label: 'Manage Resources', href: '/admin/#/collections/portal_resources', target: '_blank' },
      ]
    },
    {
      title: 'User Management',
      description: 'Manage member accounts and permissions',
      icon: IconUsers,
      links: [
        { label: 'View Members', href: '/portal/admin/users' },
        { label: 'Pending Applications', href: '/portal/admin/applications' },
      ]
    },
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Portal Administration</h1>
        <p className="text-gray-600">Manage portal content, users, and settings</p>
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin"
            target="_blank"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <IconRocket className="h-4 w-4" />
            Open CMS Dashboard
          </Link>
          <Link
            href="/admin/#/collections/portal_announcements/new"
            target="_blank"
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors inline-flex items-center gap-2"
          >
            <IconPlus className="h-4 w-4" />
            New Announcement
          </Link>
          <Link
            href="/admin/#/collections/the_bounce/new"
            target="_blank"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors inline-flex items-center gap-2"
          >
            <IconUpload className="h-4 w-4" />
            Upload Newsletter
          </Link>
        </div>
      </div>

      {/* Admin Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <section.icon className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{section.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{section.description}</p>
              <div className="space-y-2">
                {section.links.map((link, linkIdx) => (
                  <Link
                    key={linkIdx}
                    href={link.href}
                    target={link.target}
                    className="flex items-center justify-between text-sm text-blue-600 hover:text-blue-800 py-1"
                  >
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                        {link.badge}
                      </span>
                    )}
                    <span>→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CMS Instructions */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📖 CMS Quick Guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Creating Content:</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
              <li>Click "Open CMS Dashboard" or navigate to /admin</li>
              <li>Select the content type from the sidebar</li>
              <li>Click "New [Content Type]" button</li>
              <li>Fill in all required fields</li>
              <li>Click "Publish" to make it live</li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Managing Portal Content:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li><strong>Announcements:</strong> Visible on portal dashboard and news page</li>
              <li><strong>Newsletters:</strong> PDFs accessible in The Bounce archive</li>
              <li><strong>Resources:</strong> Documents available in portal resources section</li>
              <li><strong>Game Assignments:</strong> Shows in member schedules</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Changes made in the CMS may take a few minutes to appear on the live site. 
            Clear your browser cache if updates don't appear immediately.
          </p>
        </div>
      </div>

      {/* Role-based Access Info */}
      <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h3 className="font-semibold text-purple-900 mb-2">Access Levels:</h3>
        <div className="text-sm text-purple-700 space-y-1">
          <p>• <strong>Executives:</strong> Can create/edit announcements, newsletters, and resources</p>
          <p>• <strong>Admins:</strong> Full access to all content and user management</p>
          <p>• <strong>Officials:</strong> View-only access to portal content</p>
        </div>
      </div>
    </div>
  )
}