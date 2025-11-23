'use client'

import { useState, useEffect, useRef } from 'react'
import { resourcesAPI } from '@/lib/api'
import { uploadFile } from '@/lib/fileUpload'
import ResourceViewer from '@/components/ResourceViewer'
import ResourceThumbnail from '@/components/ResourceThumbnail'
import { useRole } from '@/contexts/RoleContext'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/Toast'
import {
  getFieldError,
  hasErrors,
  formatValidationErrors
} from '@/lib/portalValidation'
import { parseAPIError, sanitize, ValidationError } from '@/lib/errorHandling'
import { TinyMCEEditor, HTMLViewer } from '@/components/TinyMCEEditor'
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
  IconUpload,
  IconFileUpload,
  IconEye,
  IconLink,
  IconArticle
} from '@tabler/icons-react'

type ResourceType = 'file' | 'link' | 'video' | 'text'

interface Resource {
  id: string
  title: string
  description: string
  category: 'rulebooks' | 'forms' | 'training' | 'policies' | 'guides' | 'videos'
  resourceType: ResourceType
  fileUrl?: string
  externalLink?: string
  fileSize?: string
  lastUpdated: string
  featured?: boolean
  accessLevel?: 'all' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5'
}

export default function ResourcesClient() {
  const { user } = useRole()
  const { toasts, dismissToast, success, error, warning, info } = useToast()
  const [resources, setResources] = useState<Resource[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<Resource> | null>(null)
  const [viewingResource, setViewingResource] = useState<Resource | null>(null)
  const [newResource, setNewResource] = useState<Partial<Resource>>({
    title: '',
    description: '',
    category: 'rulebooks',
    resourceType: 'file',
    accessLevel: 'all'
  })
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [existingFiles, setExistingFiles] = useState<Array<{name: string, url: string, size: string}>>([])
  const [fileSearchTerm, setFileSearchTerm] = useState('')
  const [showFileDropdown, setShowFileDropdown] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canEdit = user.role === 'admin' || user.role === 'executive'

  // Load resources from API
  useEffect(() => {
    loadResources()
    loadExistingFiles()
  }, [])

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
      console.error('Failed to load existing files:', error)
    }
  }

  const loadResources = async () => {
    try {
      const data = await resourcesAPI.getAll()
      // Map API data to frontend format
      const mapped = data.map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description || '',
        category: r.category,
        resourceType: (r.resource_type || 'file') as ResourceType,
        fileUrl: r.file_name === 'external-link' ? '' : r.file_url,
        externalLink: r.file_name === 'external-link' ? r.file_url : undefined,
        lastUpdated: r.updated_at || r.created_at,
        featured: r.is_featured,
        accessLevel: r.access_level || 'all'
      }))
      setResources(mapped)
    } catch (err) {
      error('Failed to Load Resources', parseAPIError(err))
      setResources([])
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

  const resourceTypes = [
    { value: 'file', label: 'File Upload', icon: IconFile, description: 'Upload a PDF, document, or other file' },
    { value: 'link', label: 'External Link', icon: IconLink, description: 'Link to an external website or resource' },
    { value: 'video', label: 'Video', icon: IconVideo, description: 'Embed a video link (YouTube, Vimeo, etc.)' },
    { value: 'text', label: 'Text Content', icon: IconArticle, description: 'Rich text content displayed directly' }
  ]

  // Custom validation based on resource type
  const validateResourceFormCustom = (data: Partial<Resource>, file?: File | null): ValidationError[] => {
    const errors: ValidationError[] = []

    // Title validation
    if (!data.title || data.title.trim().length < 3) {
      errors.push({ field: 'title', message: 'Title must be at least 3 characters' })
    }
    if (data.title && data.title.length > 200) {
      errors.push({ field: 'title', message: 'Title must be less than 200 characters' })
    }

    // Category validation
    if (!data.category) {
      errors.push({ field: 'category', message: 'Category is required' })
    }

    // Resource type specific validation
    const resourceType = data.resourceType || 'file'

    if (resourceType === 'file') {
      if (!file && !data.fileUrl) {
        errors.push({ field: 'file', message: 'Please upload a file or select an existing one' })
      }
    } else if (resourceType === 'link' || resourceType === 'video') {
      if (!data.externalLink) {
        errors.push({ field: 'externalLink', message: 'Please provide a URL' })
      }
    } else if (resourceType === 'text') {
      // For text resources, description is required and should have content
      if (!data.description || data.description.trim().length < 10) {
        errors.push({ field: 'description', message: 'Text content must be at least 10 characters' })
      }
    }

    // Description validation for non-text types (optional but with max length if provided)
    if (resourceType !== 'text' && data.description && data.description.length > 1000) {
      errors.push({ field: 'description', message: 'Description must be less than 1000 characters' })
    }

    return errors
  }

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory
    const matchesSearch = searchTerm === '' || 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleCreate = async () => {
    // Clear previous validation errors
    setValidationErrors([])

    // Validate form data using custom validation
    const errors = validateResourceFormCustom(newResource, uploadedFile)

    if (hasErrors(errors)) {
      setValidationErrors(errors)
      error('Validation Failed', formatValidationErrors(errors))
      return
    }

    // Sanitize inputs - don't sanitize HTML for text type
    const resourceType = newResource.resourceType || 'file'
    const sanitizedData = {
      title: sanitize.text(newResource.title || ''),
      description: resourceType === 'text' ? newResource.description || '' : sanitize.text(newResource.description || ''),
      category: newResource.category,
      resourceType: resourceType,
      externalLink: newResource.externalLink ? sanitize.url(newResource.externalLink) : undefined,
      accessLevel: newResource.accessLevel || 'all',
      featured: newResource.featured || false
    }

    try {
      setIsUploading(true)
      let fileUrl = newResource.fileUrl
      let fileName: string | undefined

      // Handle file upload with automatic validation (only for file type)
      if (resourceType === 'file' && uploadedFile) {
        try {
          const uploadResult = await uploadFile(uploadedFile)
          fileUrl = uploadResult.url
          fileName = uploadResult.fileName
          success('File Uploaded', `${uploadResult.fileName} uploaded successfully`)
        } catch (uploadError) {
          error('Upload Failed', parseAPIError(uploadError))
          setIsUploading(false)
          return
        }
      }

      // Determine file_url and file_name based on resource type
      let apiFileUrl = ''
      let apiFileName = ''
      if (resourceType === 'file') {
        apiFileUrl = fileUrl || ''
        apiFileName = fileName || 'uploaded-file'
      } else if (resourceType === 'link' || resourceType === 'video') {
        apiFileUrl = sanitizedData.externalLink || ''
        apiFileName = 'external-link'
      } else if (resourceType === 'text') {
        apiFileUrl = ''
        apiFileName = 'text-content'
      }

      const apiData = {
        title: sanitizedData.title,
        description: sanitizedData.description,
        category: sanitizedData.category,
        resource_type: sanitizedData.resourceType,
        file_url: apiFileUrl,
        file_name: apiFileName,
        is_featured: sanitizedData.featured,
        access_level: sanitizedData.accessLevel
      }

      const created = await resourcesAPI.create(apiData)
      const mappedResource: Resource = {
        id: created.id,
        title: created.title,
        description: created.description,
        category: created.category,
        resourceType: (created.resource_type || 'file') as ResourceType,
        fileUrl: created.file_name === 'external-link' || created.file_name === 'text-content' ? '' : created.file_url,
        externalLink: created.file_name === 'external-link' ? created.file_url : undefined,
        fileSize: newResource.fileSize,
        lastUpdated: created.created_at,
        featured: created.is_featured,
        accessLevel: created.access_level
      }

      setResources([...resources, mappedResource])
      success('Resource Created', 'The resource was successfully added to the library.')

      // Reset form
      setNewResource({
        title: '',
        description: '',
        category: 'rulebooks',
        resourceType: 'file',
        accessLevel: 'all'
      })
      setUploadedFile(null)
      setFileSearchTerm('')
      setShowFileDropdown(false)
      setValidationErrors([])
      if (fileInputRef.current) fileInputRef.current.value = ''
      setIsCreating(false)
    } catch (err) {
      error('Failed to Create Resource', parseAPIError(err))
    } finally {
      setIsUploading(false)
    }
  }

  // Start editing a resource - copy data to local buffer
  const startEditing = (resource: Resource) => {
    setEditingId(resource.id)
    setEditingData({
      title: resource.title || '',
      description: resource.description || '',
      category: resource.category,
      resourceType: resource.resourceType || 'file',
      fileUrl: resource.fileUrl,
      externalLink: resource.externalLink,
      featured: resource.featured,
      accessLevel: resource.accessLevel
    })
  }

  // Cancel editing - clear local buffer
  const cancelEditing = () => {
    setEditingId(null)
    setEditingData(null)
  }

  // Save edit - only call API when Save button is clicked
  const handleSaveEdit = async () => {
    if (!editingId || !editingData) return

    try {
      // Sanitize updates - don't sanitize HTML for text type
      const isTextType = editingData.resourceType === 'text'
      const sanitizedUpdates: any = { id: editingId }
      if (editingData.title !== undefined) sanitizedUpdates.title = sanitize.text(editingData.title)
      if (editingData.description !== undefined) {
        sanitizedUpdates.description = isTextType ? editingData.description : sanitize.text(editingData.description)
      }
      if (editingData.category !== undefined) sanitizedUpdates.category = editingData.category
      if (editingData.resourceType !== undefined) sanitizedUpdates.resource_type = editingData.resourceType
      if (editingData.fileUrl !== undefined) sanitizedUpdates.file_url = editingData.fileUrl
      if (editingData.externalLink !== undefined) {
        sanitizedUpdates.url = editingData.externalLink ? sanitize.url(editingData.externalLink) : null
      }
      if (editingData.featured !== undefined) sanitizedUpdates.is_featured = editingData.featured
      if (editingData.accessLevel !== undefined) sanitizedUpdates.access_level = editingData.accessLevel

      const updated = await resourcesAPI.update(sanitizedUpdates)
      setResources(prev => prev.map(r =>
        r.id === editingId ? {
          ...r,
          ...editingData,
          lastUpdated: updated.updated_at
        } : r
      ))
      success('Resource Updated', 'Changes saved successfully.')
      cancelEditing()
    } catch (err) {
      error('Update Failed', parseAPIError(err))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return

    try {
      await resourcesAPI.delete(id)
      setResources(prev => prev.filter(r => r.id !== id))
      success('Resource Deleted', 'The resource has been removed.')
    } catch (error) {
      error('Delete Failed', parseAPIError(error))
    }
  }

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category)
    return cat ? cat.icon : IconFile
  }

  return (
    <div className="px-4 py-5 sm:p-6">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Resources</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Training materials, forms, and official documents</p>
        </div>
        {canEdit && !isCreating && (
          <button
            onClick={() => {
              setIsCreating(true)
              // Pre-select the category based on the current tab
              const category = selectedCategory === 'all' ? 'rulebooks' : selectedCategory
              setNewResource({
                title: '',
                description: '',
                category: category as Resource['category'],
                resourceType: 'file',
                accessLevel: 'all'
              })
            }}
            className="bg-orange-500 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-orange-600 flex items-center gap-2 text-sm sm:text-base"
          >
            <IconPlus className="h-5 w-5" />
            Add Resource
          </button>
        )}
      </div>

      {/* Create New Resource Form */}
      {isCreating && (
        <div className="mb-6 bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Add New Resource</h2>

          <div className="space-y-4">
            {/* Resource Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type *</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {resourceTypes.map((type) => {
                  const Icon = type.icon
                  const isSelected = newResource.resourceType === type.value
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setNewResource({ ...newResource, resourceType: type.value as ResourceType, externalLink: '', fileUrl: '' })}
                      className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  )
                })}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {resourceTypes.find(t => t.value === newResource.resourceType)?.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                {getFieldError(validationErrors, 'title') && (
                  <p className="mt-1 text-sm text-red-600">
                    {getFieldError(validationErrors, 'title')}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select
                  value={newResource.category}
                  onChange={(e) => setNewResource({ ...newResource, category: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="rulebooks">Rulebooks</option>
                  <option value="forms">Forms</option>
                  <option value="training">Training Materials</option>
                  <option value="policies">Policies</option>
                  <option value="guides">Guides</option>
                  <option value="videos">Videos</option>
                </select>
              </div>
            </div>

            {/* Description/Content - TinyMCE for text type, textarea for others */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {newResource.resourceType === 'text' ? 'Content *' : 'Description'}
              </label>
              {newResource.resourceType === 'text' ? (
                <div className={`border rounded-lg ${getFieldError(validationErrors, 'description') ? 'border-red-500' : 'border-gray-300'}`}>
                  <TinyMCEEditor
                    value={newResource.description || ''}
                    onChange={(value) => setNewResource({ ...newResource, description: value })}
                    height={400}
                    placeholder="Enter your content here..."
                  />
                </div>
              ) : (
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
              )}
              {getFieldError(validationErrors, 'description') && (
                <p className="mt-1 text-sm text-red-600">
                  {getFieldError(validationErrors, 'description')}
                </p>
              )}
            </div>

            {/* File Upload - only for file type */}
            {newResource.resourceType === 'file' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resource File *</label>
                <div className="flex gap-2">
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
                          fileSize: `${sizeInMB} MB`,
                          fileUrl: ''
                        })
                        setFileSearchTerm('')
                      }
                    }}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-1 px-3 py-2 rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                      getFieldError(validationErrors, 'file')
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <IconFileUpload className="h-5 w-5" />
                    {uploadedFile ? uploadedFile.name : 'Upload File'}
                  </button>
                  {uploadedFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFile(null)
                        setNewResource({ ...newResource, fileSize: '', fileUrl: '' })
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg"
                    >
                      <IconX className="h-5 w-5" />
                    </button>
                  )}
                </div>
                {newResource.fileSize && (
                  <p className="mt-1 text-xs text-gray-500">File size: {newResource.fileSize}</p>
                )}
                {getFieldError(validationErrors, 'file') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError(validationErrors, 'file')}</p>
                )}
              </div>
            )}

            {/* External Link - for link and video types */}
            {(newResource.resourceType === 'link' || newResource.resourceType === 'video') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {newResource.resourceType === 'video' ? 'Video URL *' : 'External Link *'}
                </label>
                <input
                  type="url"
                  value={newResource.externalLink || ''}
                  onChange={(e) => setNewResource({ ...newResource, externalLink: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    getFieldError(validationErrors, 'externalLink')
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-orange-500'
                  }`}
                  placeholder={newResource.resourceType === 'video' ? 'https://youtube.com/watch?v=...' : 'https://...'}
                />
                {getFieldError(validationErrors, 'externalLink') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError(validationErrors, 'externalLink')}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
                <select
                  value={newResource.accessLevel}
                  onChange={(e) => setNewResource({ ...newResource, accessLevel: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Officials</option>
                  <option value="level1">Level 1+</option>
                  <option value="level2">Level 2+</option>
                  <option value="level3">Level 3+</option>
                  <option value="level4">Level 4+</option>
                  <option value="level5">Level 5 Only</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newResource.featured || false}
                    onChange={(e) => setNewResource({ ...newResource, featured: e.target.checked })}
                    className="rounded text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured Resource</span>
                </label>
              </div>
            </div>

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
                  setNewResource({
                    title: '',
                    description: '',
                    category: 'rulebooks',
                    resourceType: 'file',
                    accessLevel: 'all'
                  })
                  setUploadedFile(null)
                  setFileSearchTerm('')
                  setShowFileDropdown(false)
                  if (fileInputRef.current) fileInputRef.current.value = ''
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

      {/* Search and Category Filter */}
      <div className="mb-6 bg-white rounded-lg shadow p-3 sm:p-4">
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
          {categories.map(category => {
            const Icon = category.icon
            return (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm flex items-center gap-1 sm:gap-2 ${
                  selectedCategory === category.value
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                {category.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Featured Resources */}
      {filteredResources.some(r => r.featured) && (
        <div className="mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Featured Resources</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {filteredResources.filter(r => r.featured).map(resource => {
              const Icon = getCategoryIcon(resource.category)
              return (
                <div key={resource.id} className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex items-start gap-2 sm:gap-3 flex-1">
                      <ResourceThumbnail 
                        resource={resource} 
                        size="medium" 
                        onClick={() => setViewingResource(resource)}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                          <span>Updated: {resource.lastUpdated}</span>
                          {resource.fileSize && <span>{resource.fileSize}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(resource.fileUrl || resource.externalLink) && (
                        <button
                          onClick={() => setViewingResource(resource)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View"
                        >
                          <IconEye className="h-5 w-5" />
                        </button>
                      )}
                      {resource.fileUrl && (
                        <a
                          href={resource.fileUrl}
                          download
                          className="text-orange-600 hover:text-orange-800"
                          title="Download"
                        >
                          <IconDownload className="h-5 w-5" />
                        </a>
                      )}
                      {resource.externalLink && (
                        <a
                          href={resource.externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                          title="Open in new tab"
                        >
                          <IconExternalLink className="h-5 w-5" />
                        </a>
                      )}
                      {canEdit && (
                        <>
                          <button
                            onClick={() => startEditing(resource)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <IconEdit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(resource.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <IconTrash className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Resources List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {selectedCategory === 'all' ? 'All Resources' : categories.find(c => c.value === selectedCategory)?.label}
        </h2>
        
        {filteredResources.filter(r => !r.featured).map(resource => {
          const Icon = getCategoryIcon(resource.category)
          
          if (editingId === resource.id && editingData) {
            // Edit mode - use local editingData state
            return (
              <div key={resource.id} className="bg-white rounded-lg shadow p-4">
                <div className="space-y-3">
                  {/* Resource Type Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {resourceTypes.map((type) => {
                        const TypeIcon = type.icon
                        const isSelected = editingData.resourceType === type.value
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setEditingData({ ...editingData, resourceType: type.value as ResourceType })}
                            className={`p-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                              isSelected
                                ? 'border-orange-500 bg-orange-50 text-orange-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-600'
                            }`}
                          >
                            <TypeIcon className="h-5 w-5" />
                            <span className="text-xs font-medium">{type.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <input
                    type="text"
                    value={editingData.title || ''}
                    onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                    className="w-full font-semibold px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Resource title..."
                  />

                  {/* Description/Content */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {editingData.resourceType === 'text' ? 'Content' : 'Description'}
                    </label>
                    {editingData.resourceType === 'text' ? (
                      <TinyMCEEditor
                        value={editingData.description || ''}
                        onChange={(value) => setEditingData({ ...editingData, description: value })}
                        height={300}
                        placeholder="Enter your content here..."
                      />
                    ) : (
                      <textarea
                        value={editingData.description || ''}
                        onChange={(e) => setEditingData({ ...editingData, description: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        rows={2}
                        placeholder="Resource description..."
                      />
                    )}
                  </div>

                  {/* External Link for link/video types */}
                  {(editingData.resourceType === 'link' || editingData.resourceType === 'video') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {editingData.resourceType === 'video' ? 'Video URL' : 'External Link'}
                      </label>
                      <input
                        type="url"
                        value={editingData.externalLink || ''}
                        onChange={(e) => setEditingData({ ...editingData, externalLink: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="https://..."
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={editingData.category || 'rulebooks'}
                        onChange={(e) => setEditingData({ ...editingData, category: e.target.value as any })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="rulebooks">Rulebooks</option>
                        <option value="forms">Forms</option>
                        <option value="training">Training Materials</option>
                        <option value="policies">Policies</option>
                        <option value="guides">Guides</option>
                        <option value="videos">Videos</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Access Level</label>
                      <select
                        value={editingData.accessLevel || 'all'}
                        onChange={(e) => setEditingData({ ...editingData, accessLevel: e.target.value as any })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="all">All Officials</option>
                        <option value="level1">Level 1+</option>
                        <option value="level2">Level 2+</option>
                        <option value="level3">Level 3+</option>
                        <option value="level4">Level 4+</option>
                        <option value="level5">Level 5 Only</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingData.featured || false}
                        onChange={(e) => setEditingData({ ...editingData, featured: e.target.checked })}
                        className="rounded text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Featured</span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center gap-1"
                    >
                      <IconDeviceFloppy className="h-4 w-4" />
                      Save Changes
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 flex items-center gap-1"
                    >
                      <IconX className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )
          }

          // Get resource type icon
          const getResourceTypeIcon = (type: ResourceType) => {
            switch (type) {
              case 'file': return IconFile
              case 'link': return IconLink
              case 'video': return IconVideo
              case 'text': return IconArticle
              default: return IconFile
            }
          }
          const ResourceTypeIcon = getResourceTypeIcon(resource.resourceType || 'file')

          return (
            <div key={resource.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {resource.resourceType === 'text' ? (
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconArticle className="h-6 w-6 text-purple-600" />
                    </div>
                  ) : (
                    <ResourceThumbnail
                      resource={resource}
                      size="medium"
                      onClick={() => setViewingResource(resource)}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 break-words">{resource.title}</h3>
                    {resource.resourceType === 'text' ? (
                      <div className="text-sm text-gray-600 mt-1 line-clamp-3">
                        <HTMLViewer content={resource.description} />
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{resource.description}</p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span className={`px-2 py-0.5 rounded ${
                        resource.resourceType === 'text' ? 'bg-purple-100 text-purple-800' :
                        resource.resourceType === 'video' ? 'bg-red-100 text-red-800' :
                        resource.resourceType === 'link' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {resource.resourceType || 'file'}
                      </span>
                      <span>Updated: {resource.lastUpdated}</span>
                      {resource.fileSize && <span>{resource.fileSize}</span>}
                      {resource.accessLevel && resource.accessLevel !== 'all' && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          {resource.accessLevel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 sm:ml-2">
                  {(resource.fileUrl || resource.externalLink) && (
                    <button
                      onClick={() => setViewingResource(resource)}
                      className="text-blue-600 hover:text-blue-800"
                      title="View"
                    >
                      <IconEye className="h-5 w-5" />
                    </button>
                  )}
                  {resource.fileUrl && (
                    <a
                      href={resource.fileUrl}
                      download
                      className="text-green-600 hover:text-green-800"
                      title="Download"
                    >
                      <IconDownload className="h-5 w-5" />
                    </a>
                  )}
                  {resource.externalLink && (
                    <a
                      href={resource.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                      title="Open in new tab"
                    >
                      <IconExternalLink className="h-5 w-5" />
                    </a>
                  )}
                  {canEdit && (
                    <>
                      <button
                        onClick={() => startEditing(resource)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <IconEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(resource.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <IconTrash className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <IconFile className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No resources found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {canEdit 
              ? 'Click "Add Resource" to add your first resource.'
              : 'Resources will appear here once added by administrators.'}
          </p>
        </div>
      )}

      {/* Resource Viewer Modal */}
      {viewingResource && (
        <ResourceViewer
          resource={viewingResource}
          onClose={() => setViewingResource(null)}
        />
      )}
    </div>
  )
}