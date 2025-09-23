'use client'

import { useState } from 'react'
import { IconPlus, IconEdit, IconTrash, IconDeviceFloppy, IconX, IconAlertCircle, IconSearch, IconFilter } from '@tabler/icons-react'
import { MarkdownEditor, MarkdownViewer } from '@/components/MarkdownEditor'
import { useRole } from '@/contexts/RoleContext'

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
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements)
  const [filter, setFilter] = useState<'all' | 'general' | 'rules' | 'schedule' | 'training' | 'administrative'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newAnnouncement, setNewAnnouncement] = useState<Partial<Announcement>>({
    title: '',
    content: '',
    category: 'general',
    priority: 'normal',
    author: 'CBOA Executive',
    date: new Date().toISOString()
  })

  const canEdit = user.role === 'admin' || user.role === 'executive'


  const filteredAnnouncements = announcements.filter(item => {
    const matchesFilter = filter === 'all' || item.category === filter
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleCreate = () => {
    if (newAnnouncement.title && newAnnouncement.content) {
      const created = {
        id: Date.now().toString(),
        title: newAnnouncement.title!,
        content: newAnnouncement.content!,
        category: newAnnouncement.category || 'general',
        priority: newAnnouncement.priority as Announcement['priority'],
        author: newAnnouncement.author || 'CBOA Executive',
        date: new Date().toISOString()
      }
      setAnnouncements([created, ...announcements])
      setNewAnnouncement({
        title: '',
        content: '',
        category: 'general',
        priority: 'normal',
        author: 'CBOA Executive',
        date: new Date().toISOString()
      })
      setIsCreating(false)
    }
  }

  const handleUpdate = (id: string, updates: Partial<Announcement>) => {
    setAnnouncements(prev => prev.map(a =>
      a.id === id ? { ...a, ...updates } : a
    ))
    setEditingId(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      setAnnouncements(prev => prev.filter(a => a.id !== id))
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">News & Announcements</h1>
          <p className="mt-2 text-gray-600">Stay informed with the latest CBOA updates</p>
        </div>
        {canEdit && !isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center gap-2"
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
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter announcement title..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown supported)</label>
              <MarkdownEditor
                value={newAnnouncement.content}
                onChange={(val) => setNewAnnouncement({ ...newAnnouncement, content: val })}
                height={400}
                placeholder="Enter announcement content..."
              />
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
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <div className="flex gap-2">
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
                    value={announcement.title}
                    onChange={(e) => handleUpdate(announcement.id, { title: e.target.value })}
                    className="w-full text-lg font-semibold px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  
                  <div className="grid grid-cols-3 gap-4">
                    <select
                      value={announcement.category}
                      onChange={(e) => handleUpdate(announcement.id, { category: e.target.value as any })}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="announcement">Announcement</option>
                      <option value="news">News</option>
                      <option value="event">Event</option>
                      <option value="update">Update</option>
                    </select>

                    <select
                      value={announcement.priority}
                      onChange={(e) => handleUpdate(announcement.id, { priority: e.target.value as any })}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="high">High Priority</option>
                      <option value="normal">Normal</option>
                      <option value="low">Low</option>
                    </select>

                    <input
                      type="text"
                      value={announcement.author}
                      onChange={(e) => handleUpdate(announcement.id, { author: e.target.value })}
                      className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <MarkdownEditor
                    value={announcement.content}
                    onChange={(val) => handleUpdate(announcement.id, { content: val })}
                    height={400}
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <IconDeviceFloppy className="h-5 w-5" />
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
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
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center gap-2 mb-2">
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
                      <MarkdownViewer 
                        content={announcement.content} 
                        className="break-words"
                      />
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{new Date(announcement.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                      <span className="mx-2">•</span>
                      <span>Posted by {announcement.author}</span>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => setEditingId(announcement.id)}
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