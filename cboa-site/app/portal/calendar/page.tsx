'use client'

import { useState, useCallback, useEffect } from 'react'
import { Calendar, momentLocalizer, View, Event } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar.css'
import { IconPlus, IconEdit, IconTrash, IconCalendar, IconClock, IconMapPin, IconUsers, IconChevronLeft, IconChevronRight, IconList, IconCalendarEvent, IconChartBar, IconX } from '@tabler/icons-react'
import { calendarAPI } from '@/lib/api'
import { useRole } from '@/contexts/RoleContext'

const localizer = momentLocalizer(moment)

// Calendar view mode type
type CalendarViewMode = 'events' | 'statistics'

interface CBOAEvent extends Event {
  id?: string
  title: string
  start: Date
  end: Date
  type: 'training' | 'meeting' | 'league' | 'social'
  description?: string
  location?: string
  instructor?: string
  maxParticipants?: number
  registrationLink?: string
}

// Mock daily game data for Statistics view (February 2026)
const mockDailyGames: Record<string, { games: number; assignments: number; leagues: { name: string; games: number }[] }> = {
  '2026-02-02': { games: 12, assignments: 24, leagues: [{ name: 'CBE Junior High', games: 8 }, { name: 'Senior Mens', games: 4 }] },
  '2026-02-03': { games: 8, assignments: 16, leagues: [{ name: 'CBE Junior High', games: 6 }, { name: 'Womens Div 2', games: 2 }] },
  '2026-02-04': { games: 15, assignments: 30, leagues: [{ name: 'CSHSAA', games: 10 }, { name: 'CBE Junior High', games: 5 }] },
  '2026-02-05': { games: 6, assignments: 12, leagues: [{ name: 'Senior Mens', games: 6 }] },
  '2026-02-06': { games: 22, assignments: 44, leagues: [{ name: 'CBE Junior High', games: 14 }, { name: 'CSHSAA', games: 8 }] },
  '2026-02-07': { games: 35, assignments: 70, leagues: [{ name: 'Edge Tournament', games: 20 }, { name: 'CBE Junior High', games: 15 }] },
  '2026-02-08': { games: 28, assignments: 56, leagues: [{ name: 'Edge Tournament', games: 18 }, { name: 'Senior Mens', games: 10 }] },
  '2026-02-09': { games: 10, assignments: 20, leagues: [{ name: 'CBE Junior High', games: 6 }, { name: 'Womens Div 2', games: 4 }] },
  '2026-02-10': { games: 14, assignments: 28, leagues: [{ name: 'CBE Junior High', games: 10 }, { name: 'Rocky View League', games: 4 }] },
  '2026-02-11': { games: 18, assignments: 36, leagues: [{ name: 'CSHSAA', games: 12 }, { name: 'CBE Junior High', games: 6 }] },
  '2026-02-12': { games: 8, assignments: 16, leagues: [{ name: 'Senior Mens', games: 8 }] },
  '2026-02-13': { games: 24, assignments: 48, leagues: [{ name: 'CBE Junior High', games: 16 }, { name: 'CSHSAA', games: 8 }] },
  '2026-02-14': { games: 42, assignments: 84, leagues: [{ name: 'Nelson Mandela Invitational', games: 24 }, { name: 'CBE Junior High', games: 18 }] },
  '2026-02-15': { games: 38, assignments: 76, leagues: [{ name: 'Nelson Mandela Invitational', games: 22 }, { name: 'Senior Mens', games: 16 }] },
  '2026-02-16': { games: 5, assignments: 10, leagues: [{ name: 'Womens Masters', games: 5 }] },
  '2026-02-17': { games: 0, assignments: 0, leagues: [] },
  '2026-02-18': { games: 12, assignments: 24, leagues: [{ name: 'CBE Junior High', games: 8 }, { name: 'Rocky View League', games: 4 }] },
  '2026-02-19': { games: 16, assignments: 32, leagues: [{ name: 'CSHSAA', games: 10 }, { name: 'CBE Junior High', games: 6 }] },
  '2026-02-20': { games: 10, assignments: 20, leagues: [{ name: 'Senior Mens', games: 6 }, { name: 'Womens Div 2', games: 4 }] },
  '2026-02-21': { games: 30, assignments: 60, leagues: [{ name: 'Holy Trinity Tournament', games: 18 }, { name: 'CBE Junior High', games: 12 }] },
  '2026-02-22': { games: 26, assignments: 52, leagues: [{ name: 'Holy Trinity Tournament', games: 16 }, { name: 'Senior Mens', games: 10 }] },
  '2026-02-23': { games: 8, assignments: 16, leagues: [{ name: 'CBE Junior High', games: 5 }, { name: 'Foothills League', games: 3 }] },
  '2026-02-24': { games: 14, assignments: 28, leagues: [{ name: 'CBE Junior High', games: 10 }, { name: 'CSHSAA', games: 4 }] },
  '2026-02-25': { games: 20, assignments: 40, leagues: [{ name: 'CSHSAA', games: 14 }, { name: 'CBE Junior High', games: 6 }] },
  '2026-02-26': { games: 6, assignments: 12, leagues: [{ name: 'Senior Mens', games: 6 }] },
  '2026-02-27': { games: 18, assignments: 36, leagues: [{ name: 'CBE Junior High', games: 12 }, { name: 'Rocky View League', games: 6 }] },
  '2026-02-28': { games: 32, assignments: 64, leagues: [{ name: 'Rundle Tournament', games: 20 }, { name: 'Senior Mens', games: 12 }] },
}

export default function CalendarPage() {
  const { user } = useRole()
  const [calendarMode, setCalendarMode] = useState<CalendarViewMode>('events')
  const [events, setEvents] = useState<CBOAEvent[]>([])
  const [view, setView] = useState<View>('month')
  const [date, setDate] = useState(new Date())
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CBOAEvent | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [mobileView, setMobileView] = useState<'calendar' | 'list'>('list')
  const [selectedStatDate, setSelectedStatDate] = useState<string | null>(null)

  // Load events from API on mount
  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const data = await calendarAPI.getAll()
      // Convert date strings to Date objects
      const eventsWithDates = data.map((e: any) => ({
        ...e,
        start: new Date(e.start_date),
        end: new Date(e.end_date)
      }))
      setEvents(eventsWithDates)
    } catch (error) {
      console.error('Failed to load events:', error)
      // Fallback to sample events if API fails
      setEvents([
        {
          id: '1',
          title: 'Level 2 Certification Clinic',
          start: new Date(2025, 0, 15, 18, 0),
          end: new Date(2025, 0, 15, 21, 0),
          type: 'training',
          description: 'Certification clinic for Level 2 officials',
          location: 'Central Community Center',
          instructor: 'John Smith',
          maxParticipants: 20
        },
        {
          id: '2',
          title: 'Executive Meeting',
          start: new Date(2025, 0, 20, 19, 0),
          end: new Date(2025, 0, 20, 21, 0),
          type: 'meeting',
          description: 'Monthly executive committee meeting',
          location: 'CBOA Office'
        },
        {
          id: '3',
          title: 'Winter League Playoffs Begin',
          start: new Date(2025, 0, 31, 23, 59),
          end: new Date(2025, 0, 31, 23, 59),
          type: 'league',
          description: 'Start of winter league playoff season'
        }
      ])
    }
  }

  const canEdit = user.role === 'admin' || user.role === 'executive'

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    if (!canEdit) return
    
    setSelectedEvent({
      title: '',
      start,
      end,
      type: 'training'
    })
    setIsEditing(true)
    setShowEventModal(true)
  }, [canEdit])

  const handleSelectEvent = useCallback((event: CBOAEvent) => {
    setSelectedEvent(event)
    setIsEditing(false)
    setShowEventModal(true)
  }, [])

  const handleSaveEvent = async (eventData: CBOAEvent) => {
    try {
      // Extract only the fields we want to send to the API
      const apiData = {
        title: eventData.title,
        type: eventData.type,
        description: eventData.description,
        location: eventData.location,
        instructor: eventData.instructor,
        max_participants: eventData.maxParticipants,
        registration_link: eventData.registrationLink,
        start_date: eventData.start.toISOString(),
        end_date: eventData.end.toISOString(),
        created_by: 'CBOA Executive' // In production, get from auth
      }

      if (selectedEvent?.id) {
        // Update existing event
        const updated = await calendarAPI.update({ ...apiData, id: selectedEvent.id })
        setEvents(prev => prev.map(e => 
          e.id === selectedEvent.id ? { 
            ...updated, 
            start: new Date(updated.start_date),
            end: new Date(updated.end_date)
          } : e
        ))
      } else {
        // Add new event
        const created = await calendarAPI.create(apiData)
        setEvents(prev => [...prev, {
          ...created,
          start: new Date(created.start_date),
          end: new Date(created.end_date)
        }])
      }
      setShowEventModal(false)
      setSelectedEvent(null)
    } catch (error) {
      console.error('Failed to save event:', error)
      alert('Failed to save event. Please try again.')
    }
  }

  const handleDeleteEvent = async () => {
    if (selectedEvent?.id) {
      try {
        await calendarAPI.delete(selectedEvent.id)
        setEvents(prev => prev.filter(e => e.id !== selectedEvent.id))
        setShowEventModal(false)
        setSelectedEvent(null)
      } catch (error) {
        console.error('Failed to delete event:', error)
        alert('Failed to delete event. Please try again.')
      }
    } else if (selectedEvent) {
      setEvents(prev => prev.filter(e => e.id !== selectedEvent.id))
      setShowEventModal(false)
      setSelectedEvent(null)
    }
  }

  const eventStyleGetter = (event: CBOAEvent) => {
    let backgroundColor = '#3174ad'

    switch (event.type) {
      case 'training':
        backgroundColor = '#10b981' // green
        break
      case 'meeting':
        backgroundColor = '#8b5cf6' // purple
        break
      case 'league':
        backgroundColor = '#ef4444' // red
        break
      case 'social':
        backgroundColor = '#3b82f6' // blue
        break
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    }
  }

  // Get events for a specific month
  const getEventsForMonth = (targetDate: Date) => {
    const startOfMonth = moment(targetDate).startOf('month')
    const endOfMonth = moment(targetDate).endOf('month')
    return events.filter(event => {
      const eventStart = moment(event.start)
      return eventStart.isBetween(startOfMonth, endOfMonth, 'day', '[]')
    }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  }

  // Get upcoming events (next 30 days)
  const getUpcomingEvents = () => {
    const now = moment()
    const thirtyDaysLater = moment().add(30, 'days')
    return events.filter(event => {
      const eventStart = moment(event.start)
      return eventStart.isBetween(now, thirtyDaysLater, 'day', '[]')
    }).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  }

  // Navigate months for mobile
  const navigateMonth = (direction: 'prev' | 'next') => {
    setDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  // Get event type color
  const getEventTypeColor = (type: CBOAEvent['type']) => {
    switch (type) {
      case 'training': return 'bg-green-500'
      case 'meeting': return 'bg-purple-500'
      case 'league': return 'bg-red-500'
      case 'social': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const selectedStatDayData = selectedStatDate ? mockDailyGames[selectedStatDate] : null

  const monthEvents = getEventsForMonth(date)
  const upcomingEvents = getUpcomingEvents()

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">CBOA Calendar</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {calendarMode === 'events'
              ? 'Training events, meetings, and important dates'
              : 'Game statistics and assignment data'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Calendar Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setCalendarMode('events')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                calendarMode === 'events'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <IconCalendarEvent className="h-4 w-4" />
              Events
            </button>
            <button
              onClick={() => setCalendarMode('statistics')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                calendarMode === 'statistics'
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <IconChartBar className="h-4 w-4" />
              Statistics
            </button>
          </div>
          {canEdit && calendarMode === 'events' && (
            <button
              onClick={() => {
                setSelectedEvent({
                  title: '',
                  start: new Date(),
                  end: new Date(),
                  type: 'training'
                })
                setIsEditing(true)
                setShowEventModal(true)
              }}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <IconPlus className="h-5 w-5" />
              Add Event
            </button>
          )}
        </div>
      </div>

      {/* Events Mode Content */}
      {calendarMode === 'events' && (
        <>
          {/* Mobile View Toggle */}
          <div className="mb-4 flex sm:hidden">
            <button
              onClick={() => setMobileView('list')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-l-lg flex items-center justify-center gap-2 ${
                mobileView === 'list'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              <IconList className="h-4 w-4" />
              List
            </button>
            <button
              onClick={() => setMobileView('calendar')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-r-lg flex items-center justify-center gap-2 ${
                mobileView === 'calendar'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              <IconCalendarEvent className="h-4 w-4" />
              Calendar
            </button>
          </div>

          {/* Legend */}
          <div className="mb-4 flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded"></div>
              <span>Training</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-500 rounded"></div>
              <span>Meeting</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded"></div>
              <span>League Date</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded"></div>
              <span>Social</span>
            </div>
          </div>

      {/* Mobile List View */}
      <div className={`sm:hidden ${mobileView === 'list' ? 'block' : 'hidden'}`}>
        {/* Month Navigation */}
        <div className="bg-white rounded-lg shadow mb-4">
          <div className="flex items-center justify-between p-4 border-b">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <IconChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold">
              {moment(date).format('MMMM YYYY')}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <IconChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Events List */}
          <div className="divide-y">
            {monthEvents.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <IconCalendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No events this month</p>
              </div>
            ) : (
              monthEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => {
                    setSelectedEvent(event)
                    setIsEditing(false)
                    setShowEventModal(true)
                  }}
                  className="w-full p-4 text-left hover:bg-gray-50 flex items-start gap-3"
                >
                  <div className={`w-1 self-stretch rounded-full ${getEventTypeColor(event.type)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-gray-900 truncate">{event.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full text-white ${getEventTypeColor(event.type)}`}>
                        {event.type}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500 flex items-center gap-1">
                      <IconClock className="h-4 w-4" />
                      {moment(event.start).format('ddd, MMM D • h:mm A')}
                    </div>
                    {event.location && (
                      <div className="mt-1 text-sm text-gray-500 flex items-center gap-1">
                        <IconMapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Events Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Upcoming Events</h2>
            <p className="text-sm text-gray-500">Next 30 days</p>
          </div>
          <div className="divide-y max-h-64 overflow-y-auto">
            {upcomingEvents.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <p>No upcoming events</p>
              </div>
            ) : (
              upcomingEvents.slice(0, 5).map((event) => (
                <button
                  key={event.id}
                  onClick={() => {
                    setSelectedEvent(event)
                    setIsEditing(false)
                    setShowEventModal(true)
                  }}
                  className="w-full p-3 text-left hover:bg-gray-50 flex items-center gap-3"
                >
                  <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center text-white ${getEventTypeColor(event.type)}`}>
                    <span className="text-xs font-medium">{moment(event.start).format('MMM')}</span>
                    <span className="text-sm font-bold leading-none">{moment(event.start).format('D')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm truncate">{event.title}</h3>
                    <p className="text-xs text-gray-500">{moment(event.start).format('h:mm A')}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile Calendar View */}
      <div className={`sm:hidden ${mobileView === 'calendar' ? 'block' : 'hidden'}`}>
        <div className="bg-white rounded-lg shadow p-2">
          <div style={{ minHeight: '650px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 650 }}
              onSelectEvent={handleSelectEvent}
              view="month"
              date={date}
              onNavigate={setDate}
              eventPropGetter={eventStyleGetter}
              toolbar={true}
              views={['month']}
              showAllEvents
            />
          </div>
        </div>
      </div>

      {/* Desktop Calendar */}
      <div className="hidden sm:block bg-white rounded-lg shadow p-4" style={{ height: '800px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable={canEdit}
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          eventPropGetter={eventStyleGetter}
          showAllEvents
        />
      </div>
        </>
      )}

      {/* Statistics Mode Content */}
      {calendarMode === 'statistics' && (
        <>
          {/* Under Construction Banner */}
          <div className="mb-4 bg-amber-100 border border-amber-300 rounded-lg p-4 flex items-center gap-3">
            <span className="text-2xl">🚧</span>
            <div>
              <p className="font-semibold text-amber-800">Under Construction</p>
              <p className="text-sm text-amber-700">This view is currently displaying mock data for demonstration purposes.</p>
            </div>
          </div>

          {/* Statistics Legend */}
          <div className="mb-4 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-600">
            <span>Games:</span>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 bg-gray-50 border rounded"></span>
              <span>0</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 bg-blue-100 rounded"></span>
              <span>1-9</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 bg-blue-200 rounded"></span>
              <span>10-19</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 bg-blue-300 rounded"></span>
              <span>20-29</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 bg-blue-400 rounded"></span>
              <span>30-39</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 bg-blue-500 rounded"></span>
              <span>40+</span>
            </div>
          </div>

          {/* Statistics Calendar - using react-big-calendar */}
          <div className="hidden sm:block bg-white rounded-lg shadow p-4" style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={[]} // No events displayed in stats view
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              onSelectSlot={({ start }: { start: Date }) => {
                const dateKey = moment(start).format('YYYY-MM-DD')
                setSelectedStatDate(selectedStatDate === dateKey ? null : dateKey)
              }}
              selectable={true}
              components={{
                dateCellWrapper: ({ children, value }: { children: React.ReactNode; value: Date }) => {
                  const dateKey = moment(value).format('YYYY-MM-DD')
                  const dayData = mockDailyGames[dateKey]
                  const games = dayData?.games || 0
                  const isSelected = selectedStatDate === dateKey

                  return (
                    <div
                      className={`rbc-day-bg cursor-pointer transition-all ${
                        isSelected ? 'ring-2 ring-orange-500 ring-inset' : ''
                      }`}
                      style={{
                        backgroundColor: games === 0 ? '#f9fafb' :
                          games < 10 ? '#dbeafe' :
                          games < 20 ? '#bfdbfe' :
                          games < 30 ? '#93c5fd' :
                          games < 40 ? '#60a5fa' : '#3b82f6'
                      }}
                    >
                      {children}
                      {games > 0 && (
                        <div className="absolute bottom-1 left-1 right-1 text-center">
                          <span className={`text-xs font-medium ${games >= 30 ? 'text-white' : 'text-gray-700'}`}>
                            {games} games
                          </span>
                        </div>
                      )}
                    </div>
                  )
                }
              }}
              dayPropGetter={(dateValue: Date) => {
                const dateKey = moment(dateValue).format('YYYY-MM-DD')
                const dayData = mockDailyGames[dateKey]
                const games = dayData?.games || 0
                const isSelected = selectedStatDate === dateKey

                return {
                  className: isSelected ? 'stats-day-selected' : '',
                  style: {
                    backgroundColor: games === 0 ? '#f9fafb' :
                      games < 10 ? '#dbeafe' :
                      games < 20 ? '#bfdbfe' :
                      games < 30 ? '#93c5fd' :
                      games < 40 ? '#60a5fa' : '#3b82f6'
                  }
                }
              }}
            />
          </div>

          {/* Selected Day Detail */}
          {selectedStatDate && selectedStatDayData && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">
                  {new Date(selectedStatDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h3>
                <button
                  onClick={() => setSelectedStatDate(null)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <IconX className="h-4 w-4" />
                </button>
              </div>
              <div className="flex gap-6 mb-3 text-sm">
                <div>
                  <span className="text-gray-500">Total Games:</span>
                  <span className="ml-2 font-semibold">{selectedStatDayData.games}</span>
                </div>
                <div>
                  <span className="text-gray-500">Assignments:</span>
                  <span className="ml-2 font-semibold">{selectedStatDayData.assignments}</span>
                </div>
              </div>
              {selectedStatDayData.leagues.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">League Breakdown:</h4>
                  <div className="space-y-1">
                    {selectedStatDayData.leagues.map((league, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{league.name}</span>
                        <span className="text-gray-600">{league.games} games</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedStatDayData.games === 0 && (
                <p className="text-sm text-gray-500">No games scheduled</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Event Modal */}
      {showEventModal && selectedEvent && (
        <EventModal
          event={selectedEvent}
          isEditing={isEditing}
          canEdit={canEdit}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          onClose={() => {
            setShowEventModal(false)
            setSelectedEvent(null)
            setIsEditing(false)
          }}
          onEdit={() => setIsEditing(true)}
        />
      )}
    </div>
  )
}

// Event Modal Component
function EventModal({ 
  event, 
  isEditing, 
  canEdit,
  onSave, 
  onDelete, 
  onClose,
  onEdit
}: {
  event: CBOAEvent
  isEditing: boolean
  canEdit: boolean
  onSave: (event: CBOAEvent) => void
  onDelete: () => void
  onClose: () => void
  onEdit: () => void
}) {
  const [formData, setFormData] = useState<CBOAEvent>(event)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  if (!isEditing) {
    // View mode
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
          
          <div className="relative bg-white rounded-lg max-w-md w-full p-6 z-10">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">{event.title}</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {event.type && (
                <div className="flex items-center gap-2">
                  <IconCalendar className="h-5 w-5 text-gray-500" />
                  <span className="capitalize">{event.type}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <IconClock className="h-5 w-5 text-gray-500" />
                <span>
                  {moment(event.start).format('MMM DD, YYYY h:mm A')} - 
                  {moment(event.end).format('h:mm A')}
                </span>
              </div>

              {event.location && (
                <div className="flex items-center gap-2">
                  <IconMapPin className="h-5 w-5 text-gray-500" />
                  <span>{event.location}</span>
                </div>
              )}

              {event.instructor && (
                <div className="flex items-center gap-2">
                  <IconUsers className="h-5 w-5 text-gray-500" />
                  <span>Instructor: {event.instructor}</span>
                </div>
              )}

              {event.description && (
                <div className="mt-4">
                  <p className="text-gray-600">{event.description}</p>
                </div>
              )}

              {event.registrationLink && (
                <a 
                  href={event.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                >
                  Register Now
                </a>
              )}
            </div>

            <div className="mt-6 flex gap-2">
              {canEdit && (
                <>
                  <button
                    onClick={onEdit}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center justify-center gap-2"
                  >
                    <IconEdit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={onDelete}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center justify-center gap-2"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Edit mode
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg max-w-md w-full p-6 z-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {event.id ? 'Edit Event' : 'Add New Event'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as CBOAEvent['type'] })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="training">Training</option>
                <option value="meeting">Meeting</option>
                <option value="league">League Date</option>
                <option value="social">Social</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date/Time *
                </label>
                <input
                  type="datetime-local"
                  value={moment(formData.start).format('YYYY-MM-DDTHH:mm')}
                  onChange={(e) => setFormData({ ...formData, start: new Date(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date/Time *
                </label>
                <input
                  type="datetime-local"
                  value={moment(formData.end).format('YYYY-MM-DDTHH:mm')}
                  onChange={(e) => setFormData({ ...formData, end: new Date(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={3}
              />
            </div>

            {formData.type === 'training' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructor
                  </label>
                  <input
                    type="text"
                    value={formData.instructor || ''}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    value={formData.maxParticipants || ''}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Registration Link
                  </label>
                  <input
                    type="url"
                    value={formData.registrationLink || ''}
                    onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </>
            )}

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                Save Event
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}