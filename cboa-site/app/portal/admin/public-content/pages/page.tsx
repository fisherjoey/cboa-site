'use client'

import { useState, useEffect } from 'react'
import { IconLayoutDashboard, IconEdit, IconDeviceFloppy, IconX, IconInfoCircle } from '@tabler/icons-react'
import { useRole } from '@/contexts/RoleContext'
import { TinyMCEEditor, HTMLViewer } from '@/components/TinyMCEEditor'
import { publicPagesAPI } from '@/lib/api'
import { useToast } from '@/hooks/useToast'
import { parseAPIError, sanitize, ValidationError } from '@/lib/errorHandling'
import { getFieldError } from '@/lib/portalValidation'
import type { PublicPage } from '@/types/publicContent'

export default function PublicPagesAdmin() {
  const { user } = useRole()
  const { success, error, warning, info } = useToast()
  const [pages, setPages] = useState<PublicPage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set())
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])

  const canEdit = user.role === 'admin' || user.role === 'executive'

  // Load pages from API
  useEffect(() => {
    loadPages()
  }, [])

  const loadPages = async () => {
    try {
      const data = await publicPagesAPI.getAll()
      setPages(data)
    } catch (err) {
      const errorMessage = parseAPIError(err)
      error(`Failed to load pages: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedPages)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedPages(newExpanded)
  }

  const getPageIcon = (pageName: string) => {
    const icons: Record<string, string> = {
      'home': '🏠',
      'about': 'ℹ️',
      'contact': '📧',
      'services': '⚙️'
    }
    return icons[pageName] || '📄'
  }

  const getPageDescription = (pageName: string) => {
    const descriptions: Record<string, string> = {
      'home': 'The main landing page of your website',
      'about': 'Information about CBOA and its mission',
      'contact': 'Contact information and inquiry form',
      'services': 'Services offered by CBOA'
    }
    return descriptions[pageName] || 'Website page content'
  }

  const handleUpdate = async (id: string, updates: any) => {
    // Sanitize inputs
    const sanitizedUpdates = { ...updates }
    if (updates.title) {
      sanitizedUpdates.title = sanitize.text(updates.title)
    }
    if (updates.meta_description) {
      sanitizedUpdates.meta_description = sanitize.text(updates.meta_description)
    }
    if (updates.content) {
      sanitizedUpdates.content = sanitize.html(updates.content)
    }

    try {
      const updated = await publicPagesAPI.update({ id, ...sanitizedUpdates })
      setPages(prev => prev.map(item =>
        item.id === id ? updated : item
      ))
      success('Page updated successfully!')
    } catch (err) {
      const errorMessage = parseAPIError(err)
      error(`Failed to update page: ${errorMessage}`)
    }
  }

  return (
    <div className="py-5 sm:py-6">

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Public Page Content</h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
          Edit content for core pages on your public website (Home, About, etc.)
        </p>
      </div>

      {/* Info Alert */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <IconInfoCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900">About Page Content</h3>
            <p className="mt-1 text-sm text-blue-700">
              These are the core pages of your website. The content you add here will be displayed on the public-facing pages.
              Changes are reflected immediately after saving.
            </p>
          </div>
        </div>
      </div>

      {/* Pages List */}
      {pages.length > 0 ? (
        <div className="space-y-4">
          {pages.map((page) => {
            const isExpanded = expandedPages.has(page.id)
            const isEditing = editingId === page.id

            if (isEditing) {
              return (
                <div key={page.id} className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">{getPageIcon(page.page_name)}</span>
                    <h2 className="text-lg sm:text-xl font-semibold">
                      Edit {page.page_name.charAt(0).toUpperCase() + page.page_name.slice(1)} Page
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                      <input
                        type="text"
                        value={page.title}
                        onChange={(e) => handleUpdate(page.id, { title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Page title (shown in browser tab)"
                      />
                      <p className="mt-1 text-xs text-gray-500">This appears in the browser tab and search results</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description (SEO)</label>
                      <textarea
                        value={page.meta_description || ''}
                        onChange={(e) => handleUpdate(page.id, { meta_description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        rows={2}
                        placeholder="Brief description for search engines..."
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Recommended: 150-160 characters. This appears in search engine results.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Page Content</label>
                      <TinyMCEEditor
                        value={page.content}
                        onChange={(value) => handleUpdate(page.id, { content: value })}
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Use the editor to format your content with headings, lists, images, and links.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                      >
                        <IconDeviceFloppy className="h-5 w-5" />
                        Done Editing
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 flex items-center justify-center gap-2"
                      >
                        <IconX className="h-5 w-5" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={page.id}
                className="bg-white border-2 border-gray-200 rounded-lg hover:border-orange-300 transition-colors"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{getPageIcon(page.page_name)}</span>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {page.page_name.charAt(0).toUpperCase() + page.page_name.slice(1)} Page
                          </h3>
                          <p className="text-sm text-gray-500">{getPageDescription(page.page_name)}</p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Title:</span>
                          <span className="ml-2 text-sm text-gray-900">{page.title}</span>
                        </div>
                        {page.meta_description && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">Meta Description:</span>
                            <p className="text-sm text-gray-600 mt-1">{page.meta_description}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-sm font-medium text-gray-700">Last Updated:</span>
                          <span className="ml-2 text-sm text-gray-600">
                            {new Date(page.updated_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>

                      {page.content && (
                        <>
                          <button
                            onClick={() => toggleExpanded(page.id)}
                            className="mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium"
                          >
                            {isExpanded ? 'Hide' : 'Show'} content preview
                          </button>

                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">Content Preview:</h4>
                              <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-lg">
                                <HTMLViewer content={page.content} />
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {canEdit && (
                      <button
                        onClick={() => setEditingId(page.id)}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2 flex-shrink-0"
                      >
                        <IconEdit className="h-4 w-4" />
                        Edit Page
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <IconLayoutDashboard className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pages found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Pages should be initialized in your database. Check your migration script.
          </p>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Page Content Tips</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>• <strong>Page Title:</strong> Keep it concise and descriptive (50-60 characters)</p>
          <p>• <strong>Meta Description:</strong> Summarize the page content for search engines (150-160 characters)</p>
          <p>• <strong>Content:</strong> Use headings (H2, H3) to organize content and improve readability</p>
          <p>• <strong>Images:</strong> Add images via the editor toolbar for visual appeal</p>
          <p>• <strong>Links:</strong> Use internal links to connect related pages on your site</p>
          <p>• <strong>SEO:</strong> Include relevant keywords naturally in your content</p>
        </div>
      </div>
    </div>
  )
}
