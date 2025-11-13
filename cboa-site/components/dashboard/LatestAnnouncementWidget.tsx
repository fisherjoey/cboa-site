'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { IconBell, IconChevronRight, IconAlertCircle } from '@tabler/icons-react'
import { announcementsAPI } from '@/lib/api'
import { HTMLViewer } from '@/components/TinyMCEEditor'

interface Announcement {
  id: string
  title: string
  content: string
  category: string
  priority: 'high' | 'normal' | 'low'
  date: string
  author: string
}

export default function LatestAnnouncementWidget() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadLatestAnnouncement()
  }, [])

  const loadLatestAnnouncement = async () => {
    try {
      const data = await announcementsAPI.getAll()
      if (data.length > 0) {
        // Sort by date and get the latest
        const sorted = data.sort((a: Announcement, b: Announcement) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        setAnnouncement(sorted[0])
      }
    } catch (error) {
      console.error('Failed to load announcements:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general': return 'bg-blue-100 text-blue-800'
      case 'rules': return 'bg-purple-100 text-purple-800'
      case 'schedule': return 'bg-green-100 text-green-800'
      case 'training': return 'bg-orange-100 text-orange-800'
      case 'administrative': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <IconBell className="h-5 w-5 text-orange-500" />
          Latest Announcement
        </h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!announcement) {
    return (
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <IconBell className="h-5 w-5 text-orange-500" />
          Latest Announcement
        </h2>
        <div className="text-center py-8 text-gray-500">
          <IconBell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No announcements yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
          <IconBell className="h-5 w-5 text-orange-500" />
          Latest Announcement
        </h2>
        <Link
          href="/portal/news"
          className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
        >
          View All
          <IconChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <Link href="/portal/news" className="block group">
        <div className={`border-l-4 pl-4 ${
          announcement.priority === 'high'
            ? 'border-red-500 bg-red-50'
            : 'border-orange-500'
        } p-3 rounded-r-lg group-hover:shadow-md transition-shadow`}>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getCategoryColor(announcement.category)}`}>
              {announcement.category}
            </span>
            {announcement.priority === 'high' && (
              <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                <IconAlertCircle className="h-3 w-3" />
                High Priority
              </span>
            )}
            <span className="text-xs text-gray-500">
              {new Date(announcement.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>

          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
            {announcement.title}
          </h3>

          <div className="text-sm text-gray-600 line-clamp-3">
            <HTMLViewer content={announcement.content} className="prose-sm" />
          </div>

          <div className="mt-2 text-xs text-gray-500">
            Posted by {announcement.author}
          </div>
        </div>
      </Link>
    </div>
  )
}
