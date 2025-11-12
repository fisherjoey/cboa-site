'use client'

import { useState, useCallback, useEffect } from 'react'
import { Calendar, momentLocalizer, View, Event } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { IconPlus, IconEdit, IconTrash, IconCalendar, IconClock, IconMapPin, IconUsers } from '@tabler/icons-react'
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CBOA Calendar</h1>
          <p className="text-gray-600 mt-1">Training events, meetings, and important dates</p>
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
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center gap-2"
          >
            <IconPlus className="h-5 w-5" />
            Add Event
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Training</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 rounded"></div>
          <span>Meeting</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span>Game</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Deadline</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Social</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow p-4" style={{ height: '600px' }}>
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