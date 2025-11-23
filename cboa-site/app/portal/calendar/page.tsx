'use client'

import { useState, useCallback, useEffect } from 'react'
import { Calendar, momentLocalizer, View, Event } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar.css'
import { IconPlus, IconEdit, IconTrash, IconCalendar, IconClock, IconMapPin, IconUsers, IconChevronLeft, IconChevronRight, IconList, IconCalendarEvent } from '@tabler/icons-react'
import { calendarAPI } from '@/lib/api'
import { useRole } from '@/contexts/RoleContext'

const localizer = momentLocalizer(moment)

interface CBOAEvent extends Event {
  id?: string
  title: string
  start: Date
  end: Date
  type: 'training' | 'meeting' | 'game' | 'deadline' | 'social'
  description?: string
  location?: string
  instructor?: string
  maxParticipants?: number
  registrationLink?: string
}

export default function CalendarPage() {
  const { user } = useRole()
  const [events, setEvents] = useState<CBOAEvent[]>([])
  const [view, setView] = useState<View>('month')
  const [date, setDate] = useState(new Date())
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CBOAEvent | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [mobileView, setMobileView] = useState<'calendar' | 'list'>('list')

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
          title: 'Registration Deadline - Winter League',
          start: new Date(2025, 0, 31, 23, 59),
          end: new Date(2025, 0, 31, 23, 59),
          type: 'deadline',
          description: 'Last day to register for winter league assignments'
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
      case 'game':
        backgroundColor = '#f97316' // orange
        break
      case 'deadline':
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
      case 'game': return 'bg-orange-500'
      case 'deadline': return 'bg-red-500'
      case 'social': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const monthEvents = getEventsForMonth(date)
  const upcomingEvents = getUpcomingEvents()

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">CBOA Calendar</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Training events, meetings, and important dates</p>
        </div>
        {canEdit && (
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
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-500 rounded"></div>
          <span>Game</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded"></div>
          <span>Deadline</span>
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
        <div className="bg-white rounded-lg shadow p-2 overflow-x-auto">
          <div style={{ minHeight: '400px' }}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 400 }}
              onSelectEvent={handleSelectEvent}
              view="month"
              date={date}
              onNavigate={setDate}
              eventPropGetter={eventStyleGetter}
              toolbar={true}
              views={['month']}
            />
          </div>
        </div>
      </div>

      {/* Desktop Calendar */}
      <div className="hidden sm:block bg-white rounded-lg shadow p-4" style={{ height: '600px' }}>
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
        />
      </div>

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
                <option value="game">Game</option>
                <option value="deadline">Deadline</option>
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