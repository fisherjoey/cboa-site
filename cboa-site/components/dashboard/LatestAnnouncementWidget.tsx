'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { IconBell, IconChevronRight, IconAlertCircle } from '@tabler/icons-react'
import { announcementsAPI } from '@/lib/api'

interface Announcement {
  id: string
  title: string
  content: string
  category: string
  priority: 'high' | 'normal' | 'low'
  date: string
  author: string
}

const MAX_ANNOUNCEMENTS = 3

export default function LatestAnnouncementWidget() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    try {
      const data = await announcementsAPI.getAll()
      if (data.length > 0) {
        const sorted = data.sort((a: Announcement, b: Announcement) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        setAnnouncements(sorted.slice(0, MAX_ANNOUNCEMENTS))
      }
    } catch (error) {
      console.error('Failed to load announcements:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general': return 'bg-blue-50 dark:bg-blue-500/[0.06] text-blue-700/80 dark:text-blue-300/60'
      case 'rules': return 'bg-purple-50 dark:bg-purple-500/[0.06] text-purple-700/80 dark:text-purple-300/60'
      case 'schedule': return 'bg-green-50 dark:bg-green-500/[0.06] text-green-700/80 dark:text-green-300/60'
      case 'training': return 'bg-orange-50 dark:bg-orange-500/[0.06] text-orange-700/80 dark:text-orange-300/60'
      case 'administrative': return 'bg-red-50 dark:bg-red-500/[0.06] text-red-700/80 dark:text-red-300/60'
      default: return 'bg-zinc-100 dark:bg-zinc-500/[0.06] text-zinc-600 dark:text-zinc-400'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-portal-surface rounded-lg border border-gray-200 dark:border-portal-border p-6">
        <h2 className="font-heading text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <IconBell className="h-5 w-5 text-orange-500" />
          Announcements
        </h2>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-portal-hover rounded w-3/4 mb-2"></div>
          <div className="h-16 bg-gray-200 dark:bg-portal-hover rounded"></div>
          <div className="h-16 bg-gray-200 dark:bg-portal-hover rounded"></div>
        </div>
      </div>
    )
  }

  if (announcements.length === 0) {
    return (
      <div className="bg-white dark:bg-portal-surface rounded-lg border border-gray-200 dark:border-portal-border p-3 sm:p-4">
        <h2 className="font-heading text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <IconBell className="h-5 w-5 text-orange-500" />
          Announcements
        </h2>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <IconBell className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
          <p className="text-sm">No announcements yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-portal-surface rounded-lg border border-gray-200 dark:border-portal-border p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-heading text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <IconBell className="h-5 w-5 text-orange-500" />
          Announcements
        </h2>
        <Link
          href="/portal/news"
          className="text-sm text-orange-600 dark:text-portal-accent hover:text-orange-700 dark:hover:text-portal-accent font-semibold flex items-center gap-1"
        >
          View All
          <IconChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-portal-border -mx-3 sm:-mx-4">
        {announcements.map((announcement) => (
          <Link key={announcement.id} href="/portal/news" className="block group">
            <div className={`flex items-start gap-3 px-3 sm:px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-portal-hover/50 transition-colors ${
              announcement.priority === 'high' ? 'border-l-3 border-l-red-500' : ''
            }`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${getCategoryColor(announcement.category)}`}>
                    {announcement.category}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    {new Date(announcement.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  {announcement.priority === 'high' && (
                    <IconAlertCircle className="h-3 w-3 text-red-500" />
                  )}
                </div>
                <h3 className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate">
                  {announcement.title}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
