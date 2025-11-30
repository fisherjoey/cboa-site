'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { IconNotebook, IconDownload, IconEye, IconCalendar, IconUpload, IconPlus, IconTrash, IconFile } from '@tabler/icons-react'
import Card from '@/components/ui/Card'
import { ContentItem } from '@/lib/content'
import { useRole } from '@/contexts/RoleContext'
import { newslettersAPI } from '@/lib/api'
import { uploadFile } from '@/lib/fileUpload'
import { useToast } from '@/hooks/useToast'
import { validateNewsletterForm, getFieldError, hasErrors, formatValidationErrors } from '@/lib/portalValidation'
import { parseAPIError, sanitize, ValidationError } from '@/lib/errorHandling'
import FileUpload from '@/components/FileUpload'

// Dynamically import PDFViewer to avoid SSR issues
const PDFViewer = dynamic(() => import('./PDFViewer'), {
  ssr: false,
  loading: () => <div className="text-center py-8">Loading PDF viewer...</div>
})

interface TheBounceClientProps {
  newsletters: ContentItem[]
}

interface Newsletter {
  id: string
  title: string
  date: string
  pdfFile: string
  description?: string
  featured?: boolean
  uploadedAt: string
}

export default function TheBounceClient({ newsletters: initialNewsletters }: TheBounceClientProps) {
  const { user } = useRole()
  const { success, error, warning, info } = useToast()
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    featured: false
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load newsletters from API
  useEffect(() => {
    loadNewsletters()
  }, [])

  const loadNewsletters = async () => {
    try {
      const data = await newslettersAPI.getAll()
      // Map API data to frontend format
      const mapped = data.map((n: any) => ({
        id: n.id,
        title: n.title,
        date: n.date,
        description: n.description || '',
        pdfFile: n.file_url,
        featured: n.is_featured,
        uploadedAt: n.created_at
      }))
      setNewsletters(mapped)
    } catch (error) {
      const errorMessage = parseAPIError(error)
      error(`Failed to load newsletters: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Filter newsletters based on search
  const filteredNewsletters = newsletters.filter(newsletter => 
    searchTerm === '' ||
    newsletter.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    newsletter.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  // Get featured newsletter
  const featuredNewsletter = newsletters.find(n => n.featured)
  
  const handleView = (newsletter: Newsletter) => {
    setSelectedNewsletter(newsletter)
  }
  
  const handleDownload = (newsletter: Newsletter) => {
    if (newsletter.pdfFile) {
      // Create a download link
      const link = document.createElement('a')
      link.href = newsletter.pdfFile
      link.download = `${newsletter.title}.pdf`
      link.click()
    }
  }
  
  const handleUpload = async () => {
    if (!selectedFile) {
      error('Please select a PDF file')
      return
    }

    if (selectedFile.type !== 'application/pdf') {
      error('Please select a PDF file')
      return
    }

    // Sanitize text inputs
    const sanitizedTitle = sanitize.text(uploadForm.title)
    const sanitizedDescription = sanitize.text(uploadForm.description)

    // Extract month and year from date for validation
    const dateObj = new Date(uploadForm.date)
    const month = dateObj.toLocaleDateString('en-CA', { month: 'long' })
    const year = dateObj.getFullYear()

    // Validate form data
    const formData = {
      title: sanitizedTitle || `The Bounce - ${month} ${year}`,
      month: month,
      year: year,
      description: sanitizedDescription,
      file: selectedFile
    }

    const errors = validateNewsletterForm(formData)
    if (hasErrors(errors)) {
      setValidationErrors(errors)
      error(formatValidationErrors(errors))
      return
    }

    setValidationErrors([])

    try {
      // Upload file to Supabase Storage (newsletters bucket)
      const uploadResult = await uploadFile(selectedFile, '/newsletter/')

      // Create newsletter in database
      const apiData = {
        title: formData.title,
        date: uploadForm.date,
        description: formData.description,
        file_name: selectedFile.name,
        file_url: uploadResult.url,
        file_size: uploadResult.size,
        is_featured: uploadForm.featured
      }

      const created = await newslettersAPI.create(apiData)

      // Add to local state
      const newNewsletter: Newsletter = {
        id: created.id,
        title: created.title,
        date: created.date,
        description: created.description || '',
        pdfFile: created.file_url,
        featured: created.is_featured,
        uploadedAt: created.created_at
      }

      setNewsletters([newNewsletter, ...newsletters])

      // Reset form
      setUploadForm({
        title: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        featured: false
      })
      setSelectedFile(null)
      setShowUploadForm(false)

      success('Newsletter uploaded successfully!')
    } catch (err) {
      const errorMessage = parseAPIError(err)
      error(`Failed to upload newsletter: ${errorMessage}`)
    }
  }
  
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this newsletter?')) {
      try {
        await newslettersAPI.delete(id)
        setNewsletters(prev => prev.filter(n => n.id !== id))
        success('Newsletter deleted successfully!')
      } catch (error) {
        const errorMessage = parseAPIError(error)
        error(`Failed to delete newsletter: ${errorMessage}`)
      }
    }
  }
  
  return (
    <div className="px-4 py-5 sm:p-6">

      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">The Bounce Newsletter</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
            Your monthly source for CBOA news, officiating tips, and member updates
          </p>
        </div>
        {(user.role === 'admin' || user.role === 'executive') && !showUploadForm && (
          <button
            onClick={() => setShowUploadForm(true)}
            className="bg-orange-500 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-orange-600 flex items-center gap-2 text-sm sm:text-base"
          >
            <IconPlus className="h-5 w-5" />
            Upload Newsletter
          </button>
        )}
      </div>
      
      {/* Upload Form */}
      {showUploadForm && (user.role === 'admin' || user.role === 'executive') && (
        <div className="mb-6 bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Upload New Newsletter</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                placeholder="e.g., The Bounce - January 2025"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  getFieldError(validationErrors, 'title')
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-orange-500'
                }`}
              />
              {getFieldError(validationErrors, 'title') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError(validationErrors, 'title')}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={uploadForm.date}
                onChange={(e) => setUploadForm({ ...uploadForm, date: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  getFieldError(validationErrors, 'date')
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-orange-500'
                }`}
              />
              {getFieldError(validationErrors, 'date') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError(validationErrors, 'date')}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                placeholder="Brief description of this issue's content"
                rows={2}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  getFieldError(validationErrors, 'description')
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-orange-500'
                }`}
              />
              {getFieldError(validationErrors, 'description') && (
                <p className="mt-1 text-sm text-red-600">{getFieldError(validationErrors, 'description')}</p>
              )}
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uploadForm.featured}
                  onChange={(e) => setUploadForm({ ...uploadForm, featured: e.target.checked })}
                  className="rounded text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm font-medium text-gray-700">Feature this issue</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PDF File
              </label>
              <FileUpload
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
                accept=".pdf"
                maxSize={10}
                buttonText="Choose PDF File"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IconUpload className="h-5 w-5" />
                Upload Newsletter
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUploadForm(false)
                  setSelectedFile(null)
                  setValidationErrors([])
                  setUploadForm({
                    title: '',
                    date: new Date().toISOString().split('T')[0],
                    description: '',
                    featured: false
                  })
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 flex items-center justify-center gap-2"
              >
                <IconFile className="h-5 w-5" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Featured Issue */}
      {featuredNewsletter && (
        <div className="bg-gradient-to-r from-cboa-orange to-orange-600 rounded-lg shadow-lg text-white p-4 sm:p-6">
          <div>
            <span className="text-sm font-medium opacity-90">Latest Issue</span>
            <h2 className="text-xl sm:text-2xl font-bold mt-1">{featuredNewsletter.title}</h2>
            {featuredNewsletter.description && (
              <p className="mt-2 text-sm sm:text-base opacity-90">{featuredNewsletter.description}</p>
            )}
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleView(featuredNewsletter)}
                className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
              >
                <IconEye className="h-4 w-4" />
                Read Now
              </button>
              <button
                onClick={() => handleDownload(featuredNewsletter)}
                className="border-2 border-white text-white px-4 py-2 rounded-lg font-medium hover:bg-white hover:text-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                <IconDownload className="h-4 w-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Search and View Mode */}
      <div className="mb-6 bg-white rounded-lg shadow p-3 sm:p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              placeholder="Search newsletters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm ${
                viewMode === 'grid'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm ${
                viewMode === 'list'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              List View
            </button>
          </div>
        </div>
      </div>
      
      {/* Newsletter Archive */}
      {filteredNewsletters.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <IconNotebook className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No newsletters found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? `No newsletters found matching "${searchTerm}"`
              : (user.role === 'admin' || user.role === 'executive')
                ? 'Click "Upload Newsletter" to add your first newsletter.'
                : 'Newsletters will appear here once uploaded by administrators.'}
          </p>
        </div>
      ) : (
        <div>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNewsletters.map((newsletter) => (
                <Card key={newsletter.id} className="hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <IconCalendar className="h-4 w-4" />
                      <span>
                        {new Date(newsletter.date).toLocaleDateString('en-CA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-cboa-blue mb-2">
                      {newsletter.title}
                    </h3>
                    
                    {newsletter.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {newsletter.description}
                      </p>
                    )}
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(newsletter)}
                        className="flex-1 bg-orange-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(newsletter)}
                        className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                      >
                        Download
                      </button>
                      {(user.role === 'admin' || user.role === 'executive') && (
                        <button
                          onClick={() => handleDelete(newsletter.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete newsletter"
                        >
                          <IconTrash className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {filteredNewsletters.map((newsletter) => (
                  <li key={newsletter.id} className="hover:bg-gray-50 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                          <h3 className="text-base sm:text-lg font-medium text-cboa-blue truncate">
                            {newsletter.title}
                          </h3>
                          <span className="text-xs sm:text-sm text-gray-500">
                            {new Date(newsletter.date).toLocaleDateString('en-CA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        {newsletter.description && (
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {newsletter.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 sm:ml-4">
                        <button
                          onClick={() => handleView(newsletter)}
                          className="text-orange-500 hover:text-orange-600 font-medium text-sm"
                        >
                          View
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleDownload(newsletter)}
                          className="text-gray-600 hover:text-gray-800 font-medium text-sm"
                        >
                          Download
                        </button>
                        {(user.role === 'admin' || user.role === 'executive') && (
                          <>
                            <span className="text-gray-300">|</span>
                            <button
                              onClick={() => handleDelete(newsletter.id)}
                              className="text-red-600 hover:text-red-700 font-medium text-sm"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
      
      {/* PDF Viewer Modal */}
      {selectedNewsletter && (
        <PDFViewer
          pdfUrl={selectedNewsletter.pdfFile || ''}
          title={selectedNewsletter.title || ''}
          onClose={() => setSelectedNewsletter(null)}
        />
      )}
      
      {/* Newsletter Info */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-orange-900 mb-2">About The Bounce</h3>
        <p className="text-sm text-orange-800 mb-3">
          The Bounce is CBOA's monthly newsletter, featuring:
        </p>
        <ul className="text-sm text-orange-800 space-y-1">
          <li>• In-depth articles on officiating techniques</li>
          <li>• Rule interpretations and clarifications</li>
          <li>• Member spotlights and achievements</li>
          <li>• Training tips from experienced officials</li>
          <li>• Important dates and upcoming events</li>
        </ul>
        <p className="text-sm text-orange-800 mt-3">
          New issues are published on the first Monday of each month.
        </p>
      </div>
    </div>
  )
}