/**
 * ENHANCED EXAMPLE - ResourcesClient with Comprehensive Error Handling
 *
 * This is an example showing how to integrate all the error handling features.
 * Key additions marked with // ✨ ENHANCED comments
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { resourcesAPI } from '@/lib/api'
import { uploadFile } from '@/lib/fileUpload'
import ResourceViewer from '@/components/ResourceViewer'
import ResourceThumbnail from '@/components/ResourceThumbnail'
import { useRole } from '@/contexts/RoleContext'
// ✨ ENHANCED: Import error handling utilities
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/Toast'
import {
  validateResourceForm,
  getFieldError,
  hasErrors,
  formatValidationErrors,
  ValidationError
} from '@/lib/portalValidation'
import { parseAPIError, sanitize } from '@/lib/errorHandling'
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconDownload,
  IconExternalLink,
  IconFile,
  IconBook,
  IconFileText,
  IconVideo,
  IconClipboard,
  IconDeviceFloppy,
  IconX,
  IconFileUpload,
  IconEye
} from '@tabler/icons-react'

interface Resource {
  id: string
  title: string
  description: string
  category: 'rulebooks' | 'forms' | 'training' | 'policies' | 'guides' | 'videos'
  fileUrl?: string
  externalLink?: string
  fileSize?: string
  lastUpdated: string
  featured?: boolean
  accessLevel?: 'all' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5'
}

export default function ResourcesClient() {
  const { user } = useRole()
  // ✨ ENHANCED: Add toast notifications
  const toast = useToast()

  const [resources, setResources] = useState<Resource[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewingResource, setViewingResource] = useState<Resource | null>(null)
  const [newResource, setNewResource] = useState<Partial<Resource>>({
    title: '',
    description: '',
    category: 'rulebooks',
    accessLevel: 'all'
  })
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [existingFiles, setExistingFiles] = useState<Array<{name: string, url: string, size: string}>>([])
  const [fileSearchTerm, setFileSearchTerm] = useState('')
  const [showFileDropdown, setShowFileDropdown] = useState(false)
  // ✨ ENHANCED: Add validation errors state
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canEdit = user.role === 'admin' || user.role === 'executive'

  useEffect(() => {
    loadResources()
    if (canEdit) {
      loadExistingFiles()
    }
  }, [canEdit])

  const loadExistingFiles = async () => {
    try {
      const API_BASE = process.env.NODE_ENV === 'production'
        ? '/.netlify/functions'
        : 'http://localhost:9000/.netlify/functions'

      const response = await fetch(`${API_BASE}/list-resource-files`)
      if (response.ok) {
        const data = await response.json()
        setExistingFiles(data.files || [])
      }
    } catch (error) {
      // ✨ ENHANCED: Better error logging without user-facing alert
      console.error('Failed to load existing files:', error)
      // Don't show error to user - this is not critical
    }
  }

  const loadResources = async () => {
    try {
      // ✨ ENHANCED: API call has automatic retry logic
      const data = await resourcesAPI.getAll()
      const mapped = data.map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description || '',
        category: r.category,
        fileUrl: r.file_url,
        externalLink: r.url,
        lastUpdated: r.updated_at || r.created_at,
        featured: r.is_featured,
        accessLevel: r.access_level || 'all'
      }))
      setResources(mapped)
    } catch (error) {
      // ✨ ENHANCED: User-friendly error notification
      toast.error('Failed to Load Resources', parseAPIError(error))
      // Fallback to empty array
      setResources([])
    }
  }

  const handleCreate = async () => {
    // ✨ ENHANCED: Comprehensive validation before submission
    setValidationErrors([])

    const errors = validateResourceForm({
      title: newResource.title,
      description: newResource.description,
      category: newResource.category,
      file: uploadedFile,
      fileUrl: newResource.fileUrl,
      externalLink: newResource.externalLink,
      accessLevel: newResource.accessLevel
    })

    if (hasErrors(errors)) {
      setValidationErrors(errors)
      toast.error('Validation Failed', formatValidationErrors(errors))
      return
    }

    // ✨ ENHANCED: Sanitize inputs to prevent XSS
    const sanitizedData = {
      title: sanitize.text(newResource.title || ''),
      description: sanitize.text(newResource.description || ''),
      category: newResource.category,
      externalLink: newResource.externalLink ? sanitize.url(newResource.externalLink) : undefined,
      accessLevel: newResource.accessLevel || 'all',
      featured: newResource.featured || false
    }

    try {
      setIsUploading(true)
      let fileUrl = newResource.fileUrl
      let fileName: string | undefined

      // ✨ ENHANCED: File upload with automatic validation
      if (uploadedFile) {
        try {
          const uploadResult = await uploadFile(uploadedFile)
          fileUrl = uploadResult.url
          fileName = uploadResult.fileName
          toast.success('File Uploaded', `${uploadResult.fileName} uploaded successfully`)
        } catch (uploadError) {
          // ✨ ENHANCED: Specific upload error feedback
          toast.error('Upload Failed', parseAPIError(uploadError))
          setIsUploading(false)
          return
        }
      }

      const apiData = {
        ...sanitizedData,
        file_url: fileUrl,
        file_name: fileName,
        url: sanitizedData.externalLink
      }

      // ✨ ENHANCED: API call with automatic retry
      const created = await resourcesAPI.create(apiData)

      const mappedResource: Resource = {
        id: created.id,
        title: created.title,
        description: created.description,
        category: created.category,
        fileUrl: created.file_url,
        externalLink: created.url,
        fileSize: newResource.fileSize,
        lastUpdated: created.created_at,
        featured: created.is_featured,
        accessLevel: created.access_level
      }

      setResources([...resources, mappedResource])

      // ✨ ENHANCED: Success notification
      toast.success('Resource Created', 'The resource was successfully added to the library.')

      // Reset form
      setNewResource({
        title: '',
        description: '',
        category: 'rulebooks',
        accessLevel: 'all'
      })
      setUploadedFile(null)
      setFileSearchTerm('')
      setShowFileDropdown(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setIsCreating(false)
      setValidationErrors([])

    } catch (error) {
      // ✨ ENHANCED: User-friendly error notification
      toast.error('Failed to Create Resource', parseAPIError(error))
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdate = async (id: string, updates: Partial<Resource>) => {
    try {
      // ✨ ENHANCED: Sanitize updates
      const sanitizedUpdates: any = {}
      if (updates.title !== undefined) sanitizedUpdates.title = sanitize.text(updates.title)
      if (updates.description !== undefined) sanitizedUpdates.description = sanitize.text(updates.description)
      if (updates.category !== undefined) sanitizedUpdates.category = updates.category
      if (updates.fileUrl !== undefined) sanitizedUpdates.file_url = updates.fileUrl
      if (updates.externalLink !== undefined) {
        sanitizedUpdates.url = updates.externalLink ? sanitize.url(updates.externalLink) : null
      }
      if (updates.featured !== undefined) sanitizedUpdates.is_featured = updates.featured
      if (updates.accessLevel !== undefined) sanitizedUpdates.access_level = updates.accessLevel

      const updated = await resourcesAPI.update({ id, ...sanitizedUpdates })

      setResources(prev => prev.map(r =>
        r.id === id ? {
          ...r,
          ...updates,
          lastUpdated: updated.updated_at
        } : r
      ))

      // ✨ ENHANCED: Success feedback
      toast.success('Resource Updated', 'Changes saved successfully.')
    } catch (error) {
      // ✨ ENHANCED: Better error feedback
      toast.error('Update Failed', parseAPIError(error))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return

    try {
      await resourcesAPI.delete(id)
      setResources(prev => prev.filter(r => r.id !== id))
      // ✨ ENHANCED: Success feedback
      toast.success('Resource Deleted', 'The resource has been removed.')
    } catch (error) {
      // ✨ ENHANCED: Better error feedback
      toast.error('Delete Failed', parseAPIError(error))
    }
  }

  const categories = [
    { value: 'all', label: 'All Resources', icon: IconFile },
    { value: 'rulebooks', label: 'Rulebooks', icon: IconBook },
    { value: 'forms', label: 'Forms', icon: IconClipboard },
    { value: 'training', label: 'Training Materials', icon: IconFileText },
    { value: 'policies', label: 'Policies', icon: IconFileText },
    { value: 'guides', label: 'Guides', icon: IconBook },
    { value: 'videos', label: 'Videos', icon: IconVideo }
  ]

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory
    const matchesSearch = searchTerm === '' ||
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category)
    return cat ? cat.icon : IconFile
  }

  return (
    <div className="px-4 py-5 sm:p-6">
      {/* ✨ ENHANCED: Toast container for notifications */}
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />

      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Resources</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Training materials, forms, and official documents</p>
        </div>
        {canEdit && !isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="bg-orange-500 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-orange-600 flex items-center gap-2 text-sm sm:text-base"
          >
            <IconPlus className="h-5 w-5" />
            Add Resource
          </button>
        )}
      </div>

      {/* Create Form with Validation */}
      {isCreating && (
        <div className="mb-6 bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Add New Resource</h2>

          <div className="space-y-4">
            {/* ✨ ENHANCED: Title field with validation feedback */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={newResource.title}
                onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  getFieldError(validationErrors, 'title')
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-orange-500'
                }`}
                placeholder="Resource title..."
              />
              {/* ✨ ENHANCED: Inline validation error */}
              {getFieldError(validationErrors, 'title') && (
                <p className="mt-1 text-sm text-red-600">
                  {getFieldError(validationErrors, 'title')}
                </p>
              )}
            </div>

            {/* ✨ ENHANCED: Description with validation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={newResource.description}
                onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  getFieldError(validationErrors, 'description')
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-orange-500'
                }`}
                rows={3}
                placeholder="Brief description of the resource..."
              />
              {getFieldError(validationErrors, 'description') && (
                <p className="mt-1 text-sm text-red-600">
                  {getFieldError(validationErrors, 'description')}
                </p>
              )}
            </div>

            {/* File upload with validation feedback */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resource File</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setUploadedFile(file)
                    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2)
                    setNewResource({
                      ...newResource,
                      fileSize: `${sizeInMB} MB`
                    })
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg ${
                  getFieldError(validationErrors, 'file')
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.mp4,.avi,.mov"
              />
              {getFieldError(validationErrors, 'file') && (
                <p className="mt-1 text-sm text-red-600">
                  {getFieldError(validationErrors, 'file')}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Max file size: 25MB. Allowed types: PDF, DOC, XLS, PPT, MP4, AVI, MOV
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleCreate}
                disabled={isUploading}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <IconDeviceFloppy className="h-5 w-5" />
                    Save Resource
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setIsCreating(false)
                  setValidationErrors([])
                  setNewResource({
                    title: '',
                    description: '',
                    category: 'rulebooks',
                    accessLevel: 'all'
                  })
                  setUploadedFile(null)
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 flex items-center justify-center gap-2"
              >
                <IconX className="h-5 w-5" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rest of the component (search, filters, resource list) remains the same */}
      {/* ... */}
    </div>
  )
}
