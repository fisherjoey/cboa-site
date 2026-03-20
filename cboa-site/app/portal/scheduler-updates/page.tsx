'use client'

import { useState, useEffect } from 'react'
import { IconPlus, IconEdit, IconTrash, IconDeviceFloppy, IconX } from '@tabler/icons-react'
import { TinyMCEEditor, HTMLViewer } from '@/components/TinyMCEEditor'
import { useRole } from '@/contexts/RoleContext'
import { schedulerUpdatesAPI } from '@/lib/api'
import { useToast } from '@/hooks/useToast'
import { parseAPIError, sanitize } from '@/lib/errorHandling'

interface SchedulerUpdate {
  id: string
  title: string
  content: string
  author: string
  date: string
}

export default function SchedulerUpdatesPage() {
  const { user } = useRole()
  const [updates, setUpdates] = useState<SchedulerUpdate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<SchedulerUpdate>>({})
  const [newUpdate, setNewUpdate] = useState<Partial<SchedulerUpdate>>({
    title: '',
    content: '',
    author: 'Scheduler',
  })
  const { success, error: showError } = useToast()

  const canEdit = user.role === 'admin' || user.role === 'executive'

  useEffect(() => {
    loadUpdates()
  }, [])

  const loadUpdates = async () => {
    try {
      const data = await schedulerUpdatesAPI.getAll()
      setUpdates(data)
    } catch (err) {
      console.error(`Failed to load scheduler updates: ${parseAPIError(err)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newUpdate.title?.trim() || !newUpdate.content?.trim()) {
      showError('Title and content are required')
      return
    }

    try {
      const sanitizedData = {
        title: newUpdate.title.trim(),
        content: sanitize.html(newUpdate.content),
        author: (newUpdate.author || 'Scheduler').trim(),
        date: new Date().toISOString()
      }

      const created = await schedulerUpdatesAPI.create(sanitizedData)
      setUpdates([created, ...updates])
      success('Scheduler update created')
      setNewUpdate({ title: '', content: '', author: 'Scheduler' })
      setIsCreating(false)
    } catch (err) {
      showError(`Failed to create update: ${parseAPIError(err)}`)
    }
  }

  const startEditing = (item: SchedulerUpdate) => {
    setEditingId(item.id)
    setEditingData({ ...item })
  }

  const saveEdit = async (id: string) => {
    try {
      const sanitizedUpdates = {
        ...editingData,
        title: editingData.title?.trim(),
        content: editingData.content ? sanitize.html(editingData.content) : undefined,
        author: editingData.author?.trim()
      }

      const updated = await schedulerUpdatesAPI.update({ id, ...sanitizedUpdates })
      setUpdates(prev => prev.map(u => u.id === id ? updated : u))
      setEditingId(null)
      setEditingData({})
      success('Update saved')
    } catch (err) {
      showError(`Failed to save: ${parseAPIError(err)}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this update?')) {
      try {
        await schedulerUpdatesAPI.delete(id)
        setUpdates(prev => prev.filter(u => u.id !== id))
        success('Update deleted')
      } catch (err) {
        showError(`Failed to delete: ${parseAPIError(err)}`)
      }
    }
  }

  return (
    <div className="px-3 py-4 sm:p-5 portal-animate">
      {/* Header */}
      <div className="mb-4 sm:mb-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-xl sm:text-2xl font-bold font-heading tracking-tight text-gray-900 dark:text-white">Scheduler Updates</h1>
        {canEdit && !isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-orange-500 text-white px-3 py-2 sm:px-4 rounded-lg shadow-sm shadow-orange-500/20 hover:bg-orange-600 flex items-center gap-2 text-sm sm:text-base"
          >
            <IconPlus className="h-5 w-5" />
            New Update
          </button>
        )}
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="mb-6 bg-white dark:bg-portal-surface rounded-lg border border-gray-200 dark:border-portal-border p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">New Scheduler Update</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  value={newUpdate.title}
                  onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                  className="w-full px-3 py-2 border bg-white dark:bg-portal-hover text-gray-900 dark:text-white border-gray-200 dark:border-portal-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g. New CBE Junior High games added"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author</label>
                <select
                  value={newUpdate.author}
                  onChange={(e) => setNewUpdate({ ...newUpdate, author: e.target.value })}
                  className="w-full pl-3 pr-8 py-2 border bg-white dark:bg-portal-hover text-gray-900 dark:text-white border-gray-200 dark:border-portal-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Scheduler">Scheduler</option>
                  <option value="Jerome Bohaychuk, Scheduler">Jerome Bohaychuk, Scheduler</option>
                  <option value="Joe Lam, Scheduler">Joe Lam, Scheduler</option>
                  <option value="Ryler Kerrison, Assignor">Ryler Kerrison, Assignor</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
              <TinyMCEEditor
                value={newUpdate.content || ''}
                onChange={(val) => setNewUpdate({ ...newUpdate, content: val })}
                height={300}
                placeholder="Describe the schedule change or update..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <IconDeviceFloppy className="h-5 w-5" />
                Save Update
              </button>
              <button
                onClick={() => {
                  setIsCreating(false)
                  setNewUpdate({ title: '', content: '', author: 'Scheduler' })
                }}
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-400 flex items-center gap-2"
              >
                <IconX className="h-5 w-5" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Updates List */}
      <div className="space-y-4">
        {updates.map(item => (
          <div key={item.id} className="bg-white dark:bg-portal-surface rounded-lg border border-gray-200 dark:border-portal-border hover:border-orange-200 dark:hover:border-orange-800/40 hover:shadow-sm transition-shadow overflow-hidden">
            {editingId === item.id ? (
              /* Edit Mode */
              <div className="p-4">
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editingData.title || ''}
                    onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                    className="w-full text-lg font-semibold px-3 py-2 border bg-white dark:bg-portal-hover text-gray-900 dark:text-white border-gray-200 dark:border-portal-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />

                  <select
                    value={editingData.author || 'Scheduler'}
                    onChange={(e) => setEditingData({ ...editingData, author: e.target.value })}
                    className="pl-3 pr-8 py-2 border bg-white dark:bg-portal-hover text-gray-900 dark:text-white border-gray-200 dark:border-portal-border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Scheduler">Scheduler</option>
                    <option value="Jerome Bohaychuk, Scheduler">Jerome Bohaychuk, Scheduler</option>
                    <option value="Joe Lam, Scheduler">Joe Lam, Scheduler</option>
                    <option value="Ryler Kerrison, Assignor">Ryler Kerrison, Assignor</option>
                  </select>

                  <TinyMCEEditor
                    value={editingData.content || ''}
                    onChange={(val) => setEditingData({ ...editingData, content: val })}
                    height={300}
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(item.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                      <IconDeviceFloppy className="h-5 w-5" />
                      Save Changes
                    </button>
                    <button
                      onClick={() => { setEditingId(null); setEditingData({}) }}
                      className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="p-6 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <div className="text-gray-600 dark:text-gray-300 mb-3 overflow-hidden">
                      <HTMLViewer
                        content={item.content}
                        className="break-words"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-3 mt-3 border-t border-gray-100 dark:border-portal-border/50">
                      <span>{new Date(item.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                      <span className="hidden sm:inline">&bull;</span>
                      <span>Posted by {item.author}</span>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-2 sm:ml-4">
                      <button
                        onClick={() => startEditing(item)}
                        className="text-blue-400 hover:text-blue-800"
                      >
                        <IconEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
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

      {!isLoading && updates.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-portal-surface rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No scheduler updates yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {canEdit
              ? 'Click "New Update" to post the first scheduling update.'
              : 'Schedule updates will appear here once posted.'}
          </p>
        </div>
      )}

    </div>
  )
}
