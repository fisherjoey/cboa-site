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
  validateResourceForm,
  getFieldError,
  hasErrors,
  formatValidationErrors
} from '@/lib/portalValidation'
import { parseAPIError, sanitize, ValidationError } from '@/lib/errorHandling'
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
  const { toasts, dismissToast, success, error, warning, info } = useToast()
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
        fileUrl: r.file_name === 'external-link' ? '' : r.file_url,
        externalLink: r.file_name === 'external-link' ? r.file_url : undefined,
        lastUpdated: r.updated_at || r.created_at,
        featured: r.is_featured,
        accessLevel: r.access_level || 'all'
      }))
      setResources(mapped)
    } catch (error) {
      error('Failed to Load Resources', parseAPIError(error))
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

    // Validate form data
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
      error('Validation Failed', formatValidationErrors(errors))
      return
    }

    // Sanitize inputs
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

      // Handle file upload with automatic validation
      if (uploadedFile) {
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

      const apiData = {
        title: sanitizedData.title,
        description: sanitizedData.description,
        category: sanitizedData.category,
        file_url: fileUrl || sanitizedData.externalLink || '',
        file_name: fileName || 'external-link',
        is_featured: sanitizedData.featured,
        access_level: sanitizedData.accessLevel
      }

      const created = await resourcesAPI.create(apiData)
      const mappedResource: Resource = {
        id: created.id,
        title: created.title,
        description: created.description,
        category: created.category,
        fileUrl: created.file_name === 'external-link' ? '' : created.file_url,
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
        accessLevel: 'all'
      })
      setUploadedFile(null)
      setFileSearchTerm('')
      setShowFileDropdown(false)
      setValidationErrors([])
      if (fileInputRef.current) fileInputRef.current.value = ''
      setIsCreating(false)
    } catch (error) {
      error('Failed to Create Resource', parseAPIError(error))
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdate = async (id: string, updates: Partial<Resource>) => {
    try {
      // Sanitize updates
      const sanitizedUpdates: any = { id }
      if (updates.title !== undefined) sanitizedUpdates.title = sanitize.text(updates.title)
      if (updates.description !== undefined) sanitizedUpdates.description = sanitize.text(updates.description)
      if (updates.category !== undefined) sanitizedUpdates.category = updates.category
      if (updates.fileUrl !== undefined) sanitizedUpdates.file_url = updates.fileUrl
      if (updates.externalLink !== undefined) {
        sanitizedUpdates.url = updates.externalLink ? sanitize.url(updates.externalLink) : null
      }
      if (updates.featured !== undefined) sanitizedUpdates.is_featured = updates.featured
      if (updates.accessLevel !== undefined) sanitizedUpdates.access_level = updates.accessLevel

      const updated = await resourcesAPI.update(sanitizedUpdates)
      setResources(prev => prev.map(r =>
        r.id === id ? {
          ...r,
          ...updates,
          lastUpdated: updated.updated_at
        } : r
      ))
      success('Resource Updated', 'Changes saved successfully.')
    } catch (error) {
      error('Update Failed', parseAPIError(error))
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
            onClick={() => setIsCreating(true)}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resource File</label>
                <div className="space-y-2">
                  {/* Upload new file button */}
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
                            fileUrl: '' // Clear any existing selection
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
                      className="flex-1 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg border border-gray-300 flex items-center justify-center gap-2 transition-colors"
                    >
                      <IconFileUpload className="h-5 w-5" />
                      {uploadedFile ? uploadedFile.name : 'Upload New File'}
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

                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">External Link</label>
                <input
                  type="url"
                  value={newResource.externalLink || ''}
                  onChange={(e) => setNewResource({ ...newResource, externalLink: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File Size</label>
                <input
                  type="text"
                  value={newResource.fileSize || ''}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-50 cursor-not-allowed"
                  placeholder="Auto-calculated"
                  disabled
                  readOnly
                />
              </div>

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
                  <span className="text-sm font-medium text-gray-700">Featured</span>
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
                            onClick={() => setEditingId(resource.id)}
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
          
          if (editingId === resource.id) {
            // Edit mode
            return (
              <div key={resource.id} className="bg-white rounded-lg shadow p-4">
                <div className="space-y-3">
                  <input
                    type="text"
                    value={resource.title}
                    onChange={(e) => handleUpdate(resource.id, { title: e.target.value })}
                    className="w-full font-semibold px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <textarea
                    value={resource.description}
                    onChange={(e) => handleUpdate(resource.id, { description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )
          }

          return (
            <div key={resource.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <ResourceThumbnail
                    resource={resource}
                    size="medium"
                    onClick={() => setViewingResource(resource)}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 break-words">{resource.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{resource.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
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
                        onClick={() => setEditingId(resource.id)}
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