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
      case 'general': return 'bg-blue-900/40 text-blue-400'
      case 'rules': return 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300'
      case 'schedule': return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
      case 'training': return 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300'
      case 'administrative': return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <IconBell className="h-5 w-5 text-orange-500" />
          Latest Announcement
        </h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (!announcement) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <IconBell className="h-5 w-5 text-orange-500" />
          Latest Announcement
        </h2>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <IconBell className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
          <p className="text-sm">No announcements yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <IconBell className="h-5 w-5 text-orange-500" />
          Latest Announcement
        </h2>
        <Link
          href="/portal/news"
          className="text-sm text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400 font-medium flex items-center gap-1"
        >
          View All
          <IconChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <Link href="/portal/news" className="block group">
        <div className={`border-l-4 pl-4 ${
          announcement.priority === 'high'
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
            : 'border-orange-500'
        } p-3 rounded-r-lg group-hover:shadow-md transition-shadow`}>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getCategoryColor(announcement.category)}`}>
              {announcement.category}
            </span>
            {announcement.priority === 'high' && (
              <span className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                <IconAlertCircle className="h-3 w-3" />
                High Priority
              </span>
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(announcement.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>

          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
            {announcement.title}
          </h3>

          <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
            <HTMLViewer content={announcement.content} className="prose-sm dark:prose-invert" />
          </div>

          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Posted by {announcement.author}
          </div>
        </div>
      </Link>
    </div>
  )
}
