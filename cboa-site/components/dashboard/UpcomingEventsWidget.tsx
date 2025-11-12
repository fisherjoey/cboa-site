'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { IconCalendar, IconClock, IconMapPin, IconChevronRight } from '@tabler/icons-react'
import { calendarAPI } from '@/lib/api'

interface Event {
  id: string
  title: string
  type: 'training' | 'meeting' | 'game' | 'deadline' | 'social'
  start_date: string
  end_date: string
  location?: string
}

export default function UpcomingEventsWidget() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const data = await calendarAPI.getAll()
      // Filter to only future events and sort by date
      const now = new Date()
      const upcomingEvents = data
        .filter((e: Event) => new Date(e.start_date) >= now)
        .sort((a: Event, b: Event) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        )
        .slice(0, 5) // Get next 5 events
      setEvents(upcomingEvents)
    } catch (error) {
      console.error('Failed to load events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'training': return 'bg-green-100 text-green-800 border-green-200'
      case 'meeting': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'game': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'deadline': return 'bg-red-100 text-red-800 border-red-200'
      case 'social': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Reset time portion for comparison
    today.setHours(0, 0, 0, 0)
    tomorrow.setHours(0, 0, 0, 0)
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)

    if (compareDate.getTime() === today.getTime()) {
      return 'Today'
    } else if (compareDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <IconCalendar className="h-5 w-5 text-orange-500" />
          Upcoming Events
        </h2>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
          <IconCalendar className="h-5 w-5 text-orange-500" />
          Upcoming Events
        </h2>
        <Link
          href="/portal/calendar"
          className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
        >
          View All
          <IconChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <IconCalendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No upcoming events</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <Link
              key={event.id}
              href="/portal/calendar"
              className="block border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize border ${getEventColor(event.type)}`}>
                      {event.type}
                    </span>
                    <span className="text-xs font-medium text-gray-500">
                      {formatDate(event.start_date)}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm truncate">
                    {event.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <IconClock className="h-3 w-3" />
                      {formatTime(event.start_date)}
                    </span>
                    {event.location && (
                      <span className="flex items-center gap-1 truncate">
                        <IconMapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </span>
                    )}
                  </div>
                </div>
                <IconChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
