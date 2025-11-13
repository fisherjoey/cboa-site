'use client'

import { useState, useEffect } from 'react'
import { IconPlus, IconEdit, IconTrash, IconDeviceFloppy, IconX, IconAlertCircle, IconSearch, IconFilter } from '@tabler/icons-react'
import { TinyMCEEditor, HTMLViewer } from '@/components/TinyMCEEditor'
import { useRole } from '@/contexts/RoleContext'
import { announcementsAPI } from '@/lib/api'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/Toast'
import {
  validateAnnouncementForm,
  getFieldError,
  hasErrors,
  formatValidationErrors
} from '@/lib/portalValidation'
import { parseAPIError, sanitize, ValidationError } from '@/lib/errorHandling'

interface Announcement {
  id: string
  title: string
  content: string
  category: string
  priority: 'high' | 'normal' | 'low'
  date: string
  author: string
  audience?: string[]
  expires?: string
}

interface NewsClientProps {
  initialAnnouncements: Announcement[]
}

export default function NewsClient({ initialAnnouncements }: NewsClientProps) {
  const { user } = useRole()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'general' | 'rules' | 'schedule' | 'training' | 'administrative'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<Announcement>>({}) // Buffer for editing
  const [newAnnouncement, setNewAnnouncement] = useState<Partial<Announcement>>({
    title: '',
    content: '',
    category: 'general',
    priority: 'normal',
    author: 'CBOA Executive',
    date: new Date().toISOString()
  })
  const [sendAsEmail, setSendAsEmail] = useState(false)
  const [emailRecipients, setEmailRecipients] = useState<string[]>(['all-members'])
  const { toasts, dismissToast, success, error, warning, info } = useToast()
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])

  const canEdit = user.role === 'admin' || user.role === 'executive'

  // Load announcements from API
  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    try {
      const data = await announcementsAPI.getAll()
      setAnnouncements(data)
    } catch (error) {
      const errorMessage = parseAPIError(error)
      error(`Failed to load announcements: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }


  const filteredAnnouncements = announcements.filter(item => {
    const matchesFilter = filter === 'all' || item.category === filter
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleCreate = async () => {
    // Validate form
    const errors = validateAnnouncementForm(newAnnouncement)
    if (hasErrors(errors)) {
      setValidationErrors(errors)
      error('Please fix the validation errors before submitting')
      return
    }

    try {
      // Sanitize inputs
      const sanitizedData = {
        title: sanitize.text(newAnnouncement.title || ''),
        content: sanitize.html(newAnnouncement.content || ''), // HTML from TinyMCE
        category: newAnnouncement.category || 'general',
        priority: newAnnouncement.priority || 'normal',
        author: sanitize.text(newAnnouncement.author || 'CBOA Executive'),
        date: new Date().toISOString()
      }

      const created = await announcementsAPI.create(sanitizedData)
      setAnnouncements([created, ...announcements])

      // Send as email if checkbox is selected
      if (sendAsEmail) {
        try {
          await sendAnnouncementAsEmail(sanitizedData.title, sanitizedData.content)
          success('Announcement created and email sent successfully')
        } catch (emailError) {
          warning('Announcement created but email failed to send')
        }
      } else {
        success('Announcement created successfully')
      }

      setNewAnnouncement({
        title: '',
        content: '',
        category: 'general',
        priority: 'normal',
        author: 'CBOA Executive',
        date: new Date().toISOString()
      })
      setValidationErrors([])
      setIsCreating(false)
      setSendAsEmail(false)
      setEmailRecipients(['all-members'])
    } catch (error) {
      const errorMessage = parseAPIError(error)
      error(`Failed to create announcement: ${errorMessage}`)
    }
  }

  const sendAnnouncementAsEmail = async (subject: string, htmlContent: string) => {
    const API_BASE = process.env.NODE_ENV === 'production'
      ? '/.netlify/functions'
      : 'http://localhost:9000/.netlify/functions'

    const { generateCBOAEmailTemplate } = await import('@/lib/emailTemplate')
    const emailHtml = generateCBOAEmailTemplate({
      subject,
      content: htmlContent, // Already HTML
      previewText: subject
    })

    const response = await fetch(`${API_BASE}/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: emailRecipients,
        subject,
        html: emailHtml
      })
    })

    if (!response.ok) {
      throw new Error('Failed to send email')
    }
  }

  const startEditing = (announcement: Announcement) => {
    setEditingId(announcement.id)
    setEditingData({ ...announcement }) // Copy data to buffer
  }

  const handleEditChange = (field: keyof Announcement, value: any) => {
    setEditingData(prev => ({ ...prev, [field]: value }))
  }

  const saveEdit = async (id: string) => {
    try {
      // Sanitize updates
      const sanitizedUpdates = {
        ...editingData,
        title: editingData.title ? sanitize.text(editingData.title) : undefined,
        content: editingData.content ? sanitize.html(editingData.content) : undefined, // HTML from TinyMCE
        author: editingData.author ? sanitize.text(editingData.author) : undefined
      }

      const updated = await announcementsAPI.update({ id, ...sanitizedUpdates })
      setAnnouncements(prev => prev.map(a =>
        a.id === id ? updated : a
      ))
      setEditingId(null)
      setEditingData({})
      success('Announcement updated successfully')
    } catch (error) {
      const errorMessage = parseAPIError(error)
      error(`Failed to update announcement: ${errorMessage}`)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingData({})
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      try {
        await announcementsAPI.delete(id)
        setAnnouncements(prev => prev.filter(a => a.id !== id))
        success('Announcement deleted successfully')
      } catch (error) {
        const errorMessage = parseAPIError(error)
        error(`Failed to delete announcement: ${errorMessage}`)
      }
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

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return { text: 'High Priority', color: 'text-red-600', icon: '🔴' }
      case 'normal': return { text: 'Normal', color: 'text-yellow-600', icon: '🟡' }
      case 'low': return { text: 'Low', color: 'text-green-600', icon: '🟢' }
      default: return { text: '', color: '', icon: '' }
    }
  }

  return (
    <div className="px-4 py-5 sm:p-6">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">News & Announcements</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
            Stay informed with the latest CBOA updates
          </p>
        </div>
        {canEdit && !isCreating && (
          <button
            onClick={() => {
              setIsCreating(true)
              // Pre-select the category based on the current filter
              const category = filter === 'all' ? 'general' : filter
              setNewAnnouncement({
                title: '',
                content: '',
                category: category,
                priority: 'normal',
                author: 'CBOA Executive',
                date: new Date().toISOString()
              })
            }}
            className="bg-orange-500 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-orange-600 flex items-center gap-2 text-sm sm:text-base"
          >
            <IconPlus className="h-5 w-5" />
            New Announcement
          </button>
        )}
      </div>

      {/* Create New Announcement Form */}
      {isCreating && (
        <div className="mb-6 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Announcement</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                  getFieldError(validationErrors, 'title') ? 'border-red-500' : ''
                }`}
                placeholder="Enter announcement title..."
              />
              {getFieldError(validationErrors, 'title') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError(validationErrors, 'title')}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newAnnouncement.category}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, category: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="general">General</option>
                  <option value="rules">Rules</option>
                  <option value="schedule">Schedule</option>
                  <option value="training">Training</option>
                  <option value="administrative">Administrative</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={newAnnouncement.priority}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                <input
                  type="text"
                  value={newAnnouncement.author}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, author: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <div className={getFieldError(validationErrors, 'content') ? 'border-2 border-red-500 rounded-lg' : ''}>
                <TinyMCEEditor
                  value={newAnnouncement.content}
                  onChange={(val) => setNewAnnouncement({ ...newAnnouncement, content: val })}
                  height={400}
                  placeholder="Enter announcement content..."
                />
              </div>
              {getFieldError(validationErrors, 'content') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError(validationErrors, 'content')}</p>
              )}
            </div>

            {/* Send as Email Checkbox */}
            <div className="border-t pt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendAsEmail}
                  onChange={(e) => setSendAsEmail(e.target.checked)}
                  className="h-5 w-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Also send as email</div>
                  <div className="text-sm text-gray-600">Send this announcement to all members via email</div>
                </div>
              </label>

              {sendAsEmail && (
                <div className="mt-3 ml-8 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">Recipients: <span className="font-medium">All Members</span></p>
                  <p className="text-xs text-gray-500">The announcement will be formatted in an email template and sent to all registered members.</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <IconDeviceFloppy className="h-5 w-5" />
                Save Announcement
              </button>
              <button
                onClick={() => {
                  setIsCreating(false)
                  setNewAnnouncement({
                    title: '',
                    content: '',
                    category: 'announcement',
                    priority: 'normal',
                    author: 'CBOA Executive'
                  })
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 flex items-center gap-2"
              >
                <IconX className="h-5 w-5" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(['all', 'general', 'rules', 'schedule', 'training', 'administrative'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-2 rounded-md capitalize text-sm ${
                  filter === cat
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Important Announcements Banner */}
      {filteredAnnouncements.some(a => a.priority === 'high') && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <IconAlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Important Updates</h3>
              <p className="mt-1 text-sm text-red-700">
                There are high-priority announcements that require your attention.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map(announcement => (
          <div key={announcement.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
            {editingId === announcement.id ? (
              // Edit Mode
              <div className="p-6">
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editingData.title || ''}
                    onChange={(e) => handleEditChange('title', e.target.value)}
                    className="w-full text-lg font-semibold px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <select
                      value={editingData.category || 'general'}
                      onChange={(e) => handleEditChange('category', e.target.value)}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="general">General</option>
                      <option value="rules">Rules</option>
                      <option value="schedule">Schedule</option>
                      <option value="training">Training</option>
                      <option value="administrative">Administrative</option>
                    </select>

                    <select
                      value={editingData.priority || 'normal'}
                      onChange={(e) => handleEditChange('priority', e.target.value)}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="high">High Priority</option>
                      <option value="normal">Normal</option>
                      <option value="low">Low</option>
                    </select>

                    <input
                      type="text"
                      value={editingData.author || ''}
                      onChange={(e) => handleEditChange('author', e.target.value)}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <TinyMCEEditor
                    value={editingData.content || ''}
                    onChange={(val) => handleEditChange('content', val)}
                    height={400}
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(announcement.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <IconDeviceFloppy className="h-5 w-5" />
                      Save Changes
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="p-6 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(announcement.category)}`}>
                        {announcement.category}
                      </span>
                      {announcement.priority === 'high' && (
                        <span className={`text-xs font-medium ${getPriorityBadge(announcement.priority).color}`}>
                          {getPriorityBadge(announcement.priority).icon} {getPriorityBadge(announcement.priority).text}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {announcement.title}
                    </h3>
                    <div className="text-gray-600 mb-3 overflow-hidden">
                      <HTMLViewer
                        content={announcement.content}
                        className="break-words"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                      <span>{new Date(announcement.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>Posted by {announcement.author}</span>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-2 sm:ml-4">
                      <button
                        onClick={() => startEditing(announcement)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <IconEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <IconTrash className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAnnouncements.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No announcements yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            {canEdit 
              ? 'Click "New Announcement" to create your first announcement.'
              : 'Announcements will appear here once added by administrators.'}
          </p>
        </div>
      )}

      {/* Subscription Notice */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Stay Updated</h3>
        <p className="text-sm text-blue-700">
          Important announcements are also sent via email. Make sure your contact information is up to date.
        </p>
      </div>
    </div>
  )
}