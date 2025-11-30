'use client'

import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import { EventClickArg, DateSelectArg } from '@fullcalendar/core'
import './calendar.css'
import { IconPlus, IconEdit, IconTrash, IconCalendar, IconClock, IconMapPin, IconUsers, IconCalendarEvent, IconChartBar, IconX } from '@tabler/icons-react'
import Modal from '@/components/ui/Modal'
import { calendarAPI } from '@/lib/api'
import { useRole } from '@/contexts/RoleContext'
import moment from 'moment'

// Calendar view mode type
type CalendarViewMode = 'events' | 'statistics'

interface CBOAEvent {
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
}

// Event type to color mapping
const eventTypeColors: Record<string, string> = {
  training: '#10b981', // green
  meeting: '#8b5cf6',  // purple
  league: '#ef4444',   // red
  social: '#3b82f6',   // blue
}

export default function CalendarPage() {
  const { user } = useRole()
  const [calendarMode, setCalendarMode] = useState<CalendarViewMode>('events')
  const [events, setEvents] = useState<CBOAEvent[]>([])
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CBOAEvent | null>(null)
  const [isEditing, setIsEditing] = useState(false)
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

  // Convert events to FullCalendar format
  const fullCalendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    backgroundColor: eventTypeColors[event.type] || '#3b82f6',
    borderColor: eventTypeColors[event.type] || '#3b82f6',
    extendedProps: {
      type: event.type,
      description: event.description,
      location: event.location,
      instructor: event.instructor,
      maxParticipants: event.maxParticipants,
      registrationLink: event.registrationLink
    }
  }))

  const handleEventClick = (clickInfo: EventClickArg) => {
    const event = events.find(e => e.id === clickInfo.event.id)
    if (event) {
      setSelectedEvent(event)
      setIsEditing(false)
      setShowEventModal(true)
    }
  }

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    if (!canEdit) return

    setSelectedEvent({
      title: '',
      start: selectInfo.start,
      end: selectInfo.end,
      type: 'training'
    })
    setIsEditing(true)
    setShowEventModal(true)
  }

  const handleSaveEvent = async (eventData: CBOAEvent) => {
    try {
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
        created_by: 'CBOA Executive'
      }

      if (selectedEvent?.id) {
        const updated = await calendarAPI.update({ ...apiData, id: selectedEvent.id })
        setEvents(prev => prev.map(e =>
          e.id === selectedEvent.id ? {
            ...updated,
            start: new Date(updated.start_date),
            end: new Date(updated.end_date)
          } : e
        ))
      } else {
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
    }
  }

  const selectedStatDayData = selectedStatDate ? mockDailyGames[selectedStatDate] : null

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">CBOA Calendar</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
            {calendarMode === 'events'
              ? 'Training events, meetings, and important dates'
              : 'Game statistics and assignment data'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Calendar Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={() => setCalendarMode('events')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                calendarMode === 'events'
                  ? 'bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <IconCalendarEvent className="h-4 w-4" />
              Events
            </button>
            <button
              onClick={() => setCalendarMode('statistics')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                calendarMode === 'statistics'
                  ? 'bg-white dark:bg-gray-800 shadow text-gray-900 dark:text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
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
          {/* Legend */}
          <div className="mb-4 flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
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

          {/* FullCalendar */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <FullCalendar
              plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,listMonth'
              }}
              events={fullCalendarEvents}
              eventClick={handleEventClick}
              selectable={canEdit}
              select={handleDateSelect}
              height="auto"
              contentHeight={700}
              eventDisplay="block"
              dayMaxEvents={4}
              moreLinkClick="popover"
              eventTimeFormat={{
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short'
              }}
              listDayFormat={{
                weekday: 'long',
                month: 'short',
                day: 'numeric'
              }}
              listDaySideFormat={false}
              noEventsContent="No events scheduled"
              buttonText={{
                today: 'Today',
                month: 'Month',
                list: 'List'
              }}
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
          <div className="mb-4 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            <span>Games:</span>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded"></span>
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

          {/* Statistics placeholder */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-500 dark:text-gray-400">
            <IconChartBar className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Statistics Calendar Coming Soon</p>
            <p className="text-sm mt-2">This feature will display game counts and assignment data by date.</p>
          </div>

          {/* Selected Day Detail */}
          {selectedStatDate && selectedStatDayData && (
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {new Date(selectedStatDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h3>
                <button
                  onClick={() => setSelectedStatDate(null)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <IconX className="h-4 w-4" />
                </button>
              </div>
              <div className="flex gap-6 mb-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Total Games:</span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-white">{selectedStatDayData.games}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Assignments:</span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-white">{selectedStatDayData.assignments}</span>
                </div>
              </div>
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
      <Modal
        isOpen={true}
        onClose={onClose}
        title={event.title}
        size="sm"
      >
        <div className="space-y-3">
          {event.type && (
            <div className="flex items-center gap-2">
              <IconCalendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span className="capitalize text-gray-900 dark:text-white">{event.type}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <IconClock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <span className="text-gray-900 dark:text-white">
              {moment(event.start).format('MMM DD, YYYY h:mm A')} -
              {moment(event.end).format('h:mm A')}
            </span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2">
              <IconMapPin className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-900 dark:text-white">{event.location}</span>
            </div>
          )}

          {event.instructor && (
            <div className="flex items-center gap-2">
              <IconUsers className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-900 dark:text-white">Instructor: {event.instructor}</span>
            </div>
          )}

          {event.description && (
            <div className="mt-4">
              <p className="text-gray-600 dark:text-gray-300">{event.description}</p>
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
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </Modal>
    )
  }

  // Edit mode
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={event.id ? 'Edit Event' : 'Add New Event'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Event Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Event Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as CBOAEvent['type'] })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Start Date/Time *
            </label>
            <input
              type="datetime-local"
              value={moment(formData.start).format('YYYY-MM-DDTHH:mm')}
              onChange={(e) => setFormData({ ...formData, start: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              End Date/Time *
            </label>
            <input
              type="datetime-local"
              value={moment(formData.end).format('YYYY-MM-DDTHH:mm')}
              onChange={(e) => setFormData({ ...formData, end: new Date(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Location
          </label>
          <input
            type="text"
            value={formData.location || ''}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            rows={3}
          />
        </div>

        {formData.type === 'training' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Instructor
              </label>
              <input
                type="text"
                value={formData.instructor || ''}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Max Participants
              </label>
              <input
                type="number"
                value={formData.maxParticipants || ''}
                onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Registration Link
              </label>
              <input
                type="url"
                value={formData.registrationLink || ''}
                onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}
