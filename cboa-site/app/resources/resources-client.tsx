'use client'

import { useState } from 'react'
import Hero from '@/components/content/Hero'
import Card from '@/components/ui/Card'
import { ContentItem } from '@/lib/content'

interface ResourcesClientProps {
  resources: ContentItem[]
}

export default function ResourcesClient({ resources }: ResourcesClientProps) {
  const [filterCategory, setFilterCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  const categories = ['All', ...new Set(resources.map(r => r.category))].sort()
  
  const filteredResources = resources.filter(resource => {
    const matchesCategory = filterCategory === 'all' || resource.category === filterCategory
    const matchesSearch = resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })
  
  const getAccessBadgeColor = (level: string) => {
    switch(level) {
      case 'public': return 'bg-green-100 text-green-800'
      case 'members': return 'bg-blue-100 text-blue-800'
      case 'officials': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  const getFileIcon = (type: string) => {
    switch(type) {
      case 'PDF': return '📄'
      case 'DOC': return '📝'
      case 'XLS': return '📊'
      case 'Link': return '🔗'
      default: return '📎'
    }
  }
  
  return (
    <>
      <Hero
        title="Resources"
        subtitle="Documents, forms, and materials for officials"
      />

      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-semibold text-gray-700 mb-2">
                  Search Resources
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Search by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                />
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value.toLowerCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat.toLowerCase()}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Resources Grid */}
          {filteredResources.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource, index) => (
                <Card key={resource.slug || index} hover>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-2xl">{getFileIcon(resource.fileType)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getAccessBadgeColor(resource.accessLevel)}`}>
                      {resource.accessLevel}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-cboa-blue mb-2">{resource.title}</h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="bg-gray-100 px-2 py-1 rounded">{resource.category}</span>
                    <span>{resource.fileType}</span>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{resource.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Updated: {resource.lastUpdated ? new Date(resource.lastUpdated).toLocaleDateString() : 'N/A'}
                    </span>
                    
                    {resource.downloadLink ? (
                      <a 
                        href={resource.downloadLink}
                        className="text-cboa-orange hover:text-cboa-blue transition-colors font-semibold text-sm"
                        download
                      >
                        Download →
                      </a>
                    ) : resource.externalLink ? (
                      <a 
                        href={resource.externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cboa-orange hover:text-cboa-blue transition-colors font-semibold text-sm"
                      >
                        Open Link →
                      </a>
                    ) : null}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {resources.length === 0 
                  ? 'No resources available. Use the CMS to add resources.'
                  : 'No resources found matching your criteria.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}