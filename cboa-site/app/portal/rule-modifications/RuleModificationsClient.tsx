'use client'

import { useState, useEffect } from 'react'
import { IconGavel, IconCalendar, IconFilter, IconChevronRight, IconChevronDown, IconSearch, IconPlus, IconEdit, IconTrash, IconDeviceFloppy, IconX } from '@tabler/icons-react'
import Card from '@/components/ui/Card'
import { ContentItem } from '@/lib/content'
import { useRole } from '@/contexts/RoleContext'
import { MarkdownEditor, MarkdownViewer } from '@/components/MarkdownEditor'
import { ruleModificationsAPI } from '@/lib/api'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/Toast'
import { parseAPIError, sanitize, ValidationError } from '@/lib/errorHandling'
import { getFieldError } from '@/lib/portalValidation'

interface RuleModificationsClientProps {
  modifications: ContentItem[]
  categories: string[]
}

export default function RuleModificationsClient({ modifications: initialModifications, categories }: RuleModificationsClientProps) {
  const { user } = useRole()
  const toast = useToast()
  const [modifications, setModifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newModification, setNewModification] = useState({
    title: '',
    category: 'Club Tournament',
    summary: '',
    content: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    active: true
  })
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])

  const canEdit = user.role === 'admin' || user.role === 'executive'

  // Load rule modifications from API
  useEffect(() => {
    loadModifications()
  }, [])

  const loadModifications = async () => {
    try {
      const data = await ruleModificationsAPI.getAll()
      setModifications(data)
    } catch (error) {
      const errorMessage = parseAPIError(error)
      toast.error(`Failed to load rule modifications: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter modifications based on category and search term
  const filteredModifications = modifications.filter(mod => {
    const matchesCategory = selectedCategory === 'all' || mod.category === selectedCategory
    const matchesSearch = searchTerm === '' ||
      mod.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mod.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mod.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mod.body?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch && mod.active !== false
  })

  const toggleExpanded = (slug: string) => {
    const newExpanded = new Set(expandedRules)
    if (newExpanded.has(slug)) {
      newExpanded.delete(slug)
    } else {
      newExpanded.add(slug)
    }
    setExpandedRules(newExpanded)
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'School League': 'bg-blue-100 text-blue-800',
      'School Tournament': 'bg-purple-100 text-purple-800',
      'Club League': 'bg-green-100 text-green-800',
      'Club Tournament': 'bg-orange-100 text-orange-800',
      'Adult': 'bg-yellow-100 text-yellow-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const handleCreate = async () => {
    if (!newModification.title || !newModification.content) {
      toast.error('Please fill in all required fields (title and content)')
      return
    }

    // Sanitize text inputs
    const sanitizedTitle = sanitize.text(newModification.title)
    const sanitizedSummary = sanitize.text(newModification.summary)
    const sanitizedContent = sanitize.text(newModification.content)

    try {
      const created = await ruleModificationsAPI.create({
        title: sanitizedTitle,
        category: newModification.category,
        summary: sanitizedSummary,
        content: sanitizedContent,
        effective_date: newModification.effectiveDate,
        active: newModification.active
      })
      setModifications([created, ...modifications])
      setNewModification({
        title: '',
        category: 'Club Tournament',
        summary: '',
        content: '',
        effectiveDate: new Date().toISOString().split('T')[0],
        active: true
      })
      setIsCreating(false)
      toast.success('Rule modification created successfully!')
    } catch (error) {
      const errorMessage = parseAPIError(error)
      toast.error(`Failed to create rule modification: ${errorMessage}`)
    }
  }

  const handleUpdate = async (id: string, updates: any) => {
    // Sanitize text inputs if they exist in updates
    const sanitizedUpdates = { ...updates }
    if (updates.title) {
      sanitizedUpdates.title = sanitize.text(updates.title)
    }
    if (updates.summary) {
      sanitizedUpdates.summary = sanitize.text(updates.summary)
    }
    if (updates.content) {
      sanitizedUpdates.content = sanitize.text(updates.content)
    }

    try {
      const updated = await ruleModificationsAPI.update({ id, ...sanitizedUpdates })
      setModifications(prev => prev.map(mod =>
        mod.id === id ? updated : mod
      ))
      toast.success('Rule modification updated successfully!')
    } catch (error) {
      const errorMessage = parseAPIError(error)
      toast.error(`Failed to update rule modification: ${errorMessage}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this rule modification?')) {
      try {
        await ruleModificationsAPI.delete(id)
        setModifications(prev => prev.filter(mod => mod.id !== id))
        toast.success('Rule modification deleted successfully!')
      } catch (error) {
        const errorMessage = parseAPIError(error)
        toast.error(`Failed to delete rule modification: ${errorMessage}`)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <IconGavel className="h-8 w-8 text-cboa-blue" />
            <h1 className="text-3xl font-bold text-cboa-blue">Rule Modifications</h1>
          </div>
          {canEdit && (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cboa-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <IconPlus className="h-5 w-5" />
              Add New Rule
            </button>
          )}
        </div>
        <p className="text-gray-600">
          Official rule modifications and clarifications for CBOA officials. These modifications apply to all games unless otherwise specified.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search rule modifications..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cboa-blue"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <IconFilter className="h-5 w-5 text-gray-500" />
          <span className="font-semibold text-gray-700">Filter by Category:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-cboa-orange text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories ({modifications.filter(m => m.active !== false).length})
          </button>
          {categories.map(category => {
            const count = modifications.filter(m => m.category === category && m.active !== false).length
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-cboa-orange text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Create New Rule Form */}
      {isCreating && canEdit && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Create New Rule Modification</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={newModification.title}
                onChange={(e) => setNewModification({...newModification, title: e.target.value})}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cboa-blue ${
                  getFieldError('title', validationErrors) ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {getFieldError('title', validationErrors) && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('title', validationErrors)}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={newModification.category}
                onChange={(e) => setNewModification({...newModification, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cboa-blue"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
              <input
                type="text"
                value={newModification.summary}
                onChange={(e) => setNewModification({...newModification, summary: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cboa-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
              <input
                type="date"
                value={newModification.effectiveDate}
                onChange={(e) => setNewModification({...newModification, effectiveDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cboa-blue"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown)</label>
              <MarkdownEditor
                value={newModification.content}
                onChange={(value) => setNewModification({...newModification, content: value || ''})}
              />
              {getFieldError('content', validationErrors) && (
                <p className="mt-1 text-sm text-red-600">{getFieldError('content', validationErrors)}</p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <IconDeviceFloppy className="h-5 w-5" />
                Save
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <IconX className="h-5 w-5" />
                Cancel
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Rule Modifications List */}
      {filteredModifications.length > 0 ? (
        <div className="space-y-4">
          {filteredModifications.map((modification) => {
            const isExpanded = expandedRules.has(modification.id)
            const isEditing = editingId === modification.id
            const effectiveDate = modification.effectiveDate
              ? new Date(modification.effectiveDate).toLocaleDateString('en-CA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              : null

            return (
              <Card key={modification.id} className="overflow-hidden">
                {isEditing ? (
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-4">Edit Rule Modification</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={modification.title}
                          onChange={(e) => handleUpdate(modification.id, { title: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cboa-blue ${
                            getFieldError('title', validationErrors) ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {getFieldError('title', validationErrors) && (
                          <p className="mt-1 text-sm text-red-600">{getFieldError('title', validationErrors)}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                          value={modification.category}
                          onChange={(e) => handleUpdate(modification.id, { category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cboa-blue"
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                        <input
                          type="text"
                          value={modification.summary}
                          onChange={(e) => handleUpdate(modification.id, { summary: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cboa-blue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
                        <input
                          type="date"
                          value={modification.effectiveDate ? new Date(modification.effectiveDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleUpdate(modification.id, { effectiveDate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cboa-blue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown)</label>
                        <MarkdownEditor
                          value={modification.content || modification.body || ''}
                          onChange={(value) => handleUpdate(modification.id, { content: value })}
                        />
                        {getFieldError('content', validationErrors) && (
                          <p className="mt-1 text-sm text-red-600">{getFieldError('content', validationErrors)}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <IconDeviceFloppy className="h-5 w-5" />
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <IconX className="h-5 w-5" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className="cursor-pointer"
                      onClick={() => toggleExpanded(modification.id)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(modification.category)}`}>
                                {modification.category}
                              </span>
                              {effectiveDate && (
                                <div className="flex items-center gap-1 text-sm text-gray-500">
                                  <IconCalendar className="h-4 w-4" />
                                  <span>Effective: {effectiveDate}</span>
                                </div>
                              )}
                              {canEdit && (
                                <div className="flex items-center gap-2 ml-auto" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => setEditingId(modification.id)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <IconEdit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(modification.id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <IconTrash className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </div>

                            <h3 className="text-xl font-bold text-cboa-blue mb-2">
                              {modification.title}
                            </h3>

                            {modification.summary && (
                              <p className="text-gray-600 mb-3">
                                {modification.summary}
                              </p>
                            )}
                          </div>

                          <div className="ml-4">
                            {isExpanded ? (
                              <IconChevronDown className="h-6 w-6 text-gray-400" />
                            ) : (
                              <IconChevronRight className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t bg-gray-50">
                        <div className="p-6">
                          <div className="prose prose-lg max-w-none">
                            <MarkdownViewer content={modification.content || modification.body || ''} />
                          </div>

                          {modification.references && modification.references.length > 0 && (
                            <div className="mt-6 pt-6 border-t">
                              <h4 className="font-semibold text-gray-700 mb-2">References:</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {modification.references.map((ref: any, index: number) => (
                                  <li key={index} className="text-gray-600">
                                    {typeof ref === 'string' ? ref : ref.reference}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <IconGavel className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Rule Modifications Found
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? `No rule modifications match "${searchTerm}"`
              : selectedCategory === 'all'
                ? 'No rule modifications have been posted yet.'
                : `No rule modifications found for "${selectedCategory}".`}
          </p>
        </Card>
      )}

      <ToastContainer />
    </div>
  )
}