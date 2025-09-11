'use client'

import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import { IconNotebook, IconDownload, IconEye, IconCalendar, IconUpload, IconPlus, IconTrash, IconFile } from '@tabler/icons-react'
import Card from '@/components/ui/Card'
import { ContentItem } from '@/lib/content'
import { useRole } from '@/contexts/RoleContext'

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
  const [newsletters, setNewsletters] = useState<Newsletter[]>(() => {
    // Load newsletters from localStorage on mount
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cboa-newsletters')
      if (stored) {
        return JSON.parse(stored)
      }
    }
    return []
  })
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  
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
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a PDF file')
      return
    }
    
    // Convert file to base64 for localStorage storage
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      
      const newNewsletter: Newsletter = {
        id: Date.now().toString(),
        title: uploadForm.title || `The Bounce - ${new Date(uploadForm.date).toLocaleDateString('en-CA', { month: 'long', year: 'numeric' })}`,
        date: uploadForm.date,
        description: uploadForm.description,
        featured: uploadForm.featured,
        pdfFile: base64,
        uploadedAt: new Date().toISOString()
      }
      
      const updatedNewsletters = [newNewsletter, ...newsletters]
      setNewsletters(updatedNewsletters)
      
      // Save to localStorage
      localStorage.setItem('cboa-newsletters', JSON.stringify(updatedNewsletters))
      
      // Reset form
      setUploadForm({
        title: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        featured: false
      })
      setShowUploadForm(false)
      
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    
    reader.readAsDataURL(file)
  }
  
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this newsletter?')) {
      const updatedNewsletters = newsletters.filter(n => n.id !== id)
      setNewsletters(updatedNewsletters)
      localStorage.setItem('cboa-newsletters', JSON.stringify(updatedNewsletters))
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <IconNotebook className="h-8 w-8 text-cboa-blue" />
              <h1 className="text-3xl font-bold text-cboa-blue">The Bounce Newsletter</h1>
            </div>
            <p className="text-gray-600">
              Your monthly source for CBOA news, officiating tips, and member updates
            </p>
          </div>
          {(user.role === 'admin' || user.role === 'executive') && (
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="bg-cboa-orange text-white px-4 py-2 rounded-md font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
            >
              <IconPlus className="h-5 w-5" />
              Upload Newsletter
            </button>
          )}
        </div>
      </div>
      
      {/* Upload Form */}
      {showUploadForm && (user.role === 'admin' || user.role === 'executive') && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-cboa-blue mb-4">Upload New Newsletter</h3>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-cboa-orange focus:border-cboa-orange"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={uploadForm.date}
                onChange={(e) => setUploadForm({ ...uploadForm, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-cboa-orange focus:border-cboa-orange"
              />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-cboa-orange focus:border-cboa-orange"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                checked={uploadForm.featured}
                onChange={(e) => setUploadForm({ ...uploadForm, featured: e.target.checked })}
                className="h-4 w-4 text-cboa-orange focus:ring-cboa-orange border-gray-300 rounded"
              />
              <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                Feature this issue
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PDF File
              </label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => setShowUploadForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Upload a PDF file (max 10MB)</p>
            </div>
          </div>
        </Card>
      )}
      
      {/* Featured Issue */}
      {featuredNewsletter && (
        <div className="bg-gradient-to-r from-cboa-orange to-orange-600 rounded-lg shadow-lg text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium opacity-90">Latest Issue</span>
              <h2 className="text-2xl font-bold mt-1">{featuredNewsletter.title}</h2>
              {featuredNewsletter.description && (
                <p className="mt-2 opacity-90">{featuredNewsletter.description}</p>
              )}
              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => handleView(featuredNewsletter)}
                  className="bg-white text-cboa-orange px-4 py-2 rounded-md font-medium hover:bg-orange-50 transition-colors"
                >
                  <IconEye className="inline h-4 w-4 mr-2" />
                  Read Now
                </button>
                <button
                  onClick={() => handleDownload(featuredNewsletter)}
                  className="border border-white text-white px-4 py-2 rounded-md font-medium hover:bg-white hover:text-cboa-orange transition-colors"
                >
                  <IconDownload className="inline h-4 w-4 mr-2" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Search and View Mode */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search newsletters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-cboa-orange focus:border-cboa-orange"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-md ${
                viewMode === 'grid' 
                  ? 'bg-cboa-orange text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md ${
                viewMode === 'list' 
                  ? 'bg-cboa-orange text-white' 
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
        <Card className="p-12 text-center">
          <IconNotebook className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Newsletters Available
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? `No newsletters found matching "${searchTerm}"`
              : 'Newsletters will appear here once uploaded through the CMS.'}
          </p>
        </Card>
      ) : (
        <div>
          {viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNewsletters.map((newsletter) => (
                <Card key={newsletter.slug} className="hover:shadow-lg transition-shadow">
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
                        className="flex-1 bg-cboa-orange text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-orange-600 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDownload(newsletter)}
                        className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                      >
                        Download
                      </button>
                      {(user.role === 'admin' || user.role === 'executive') && (
                        <button
                          onClick={() => handleDelete(newsletter.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
                  <li key={newsletter.slug} className="hover:bg-gray-50 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-medium text-cboa-blue">
                            {newsletter.title}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {new Date(newsletter.date).toLocaleDateString('en-CA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        {newsletter.description && (
                          <p className="text-gray-600 text-sm">
                            {newsletter.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="ml-4 flex items-center gap-3">
                        <button
                          onClick={() => handleView(newsletter)}
                          className="text-cboa-orange hover:text-orange-700 font-medium"
                        >
                          View
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleDownload(newsletter)}
                          className="text-gray-600 hover:text-gray-700 font-medium"
                        >
                          Download
                        </button>
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
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">About The Bounce</h3>
        <p className="text-sm text-blue-700 mb-3">
          The Bounce is CBOA's monthly newsletter, featuring:
        </p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• In-depth articles on officiating techniques</li>
          <li>• Rule interpretations and clarifications</li>
          <li>• Member spotlights and achievements</li>
          <li>• Training tips from experienced officials</li>
          <li>• Important dates and upcoming events</li>
        </ul>
        <p className="text-sm text-blue-700 mt-3">
          New issues are published on the first Monday of each month.
        </p>
      </div>
    </div>
  )
}