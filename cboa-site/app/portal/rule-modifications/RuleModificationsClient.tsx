'use client'

import { useState } from 'react'
import { IconGavel, IconCalendar, IconFilter, IconChevronRight, IconChevronDown } from '@tabler/icons-react'
import Card from '@/components/ui/Card'
import { ContentItem } from '@/lib/content'

interface RuleModificationsClientProps {
  modifications: ContentItem[]
  categories: string[]
}

export default function RuleModificationsClient({ modifications, categories }: RuleModificationsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set())
  
  const filteredModifications = selectedCategory === 'all'
    ? modifications
    : modifications.filter(mod => mod.category === selectedCategory)
  
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
      '3-Person Mechanics': 'bg-blue-100 text-blue-800',
      '2-Person Mechanics': 'bg-green-100 text-green-800',
      'Local Rules': 'bg-orange-100 text-orange-800',
      'Tournament Rules': 'bg-purple-100 text-purple-800',
      'Clarifications': 'bg-yellow-100 text-yellow-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <IconGavel className="h-8 w-8 text-cboa-blue" />
          <h1 className="text-3xl font-bold text-cboa-blue">Rule Modifications</h1>
        </div>
        <p className="text-gray-600">
          Official rule modifications and clarifications for CBOA officials. These modifications apply to all games unless otherwise specified.
        </p>
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
            All Categories ({modifications.length})
          </button>
          {categories.map(category => {
            const count = modifications.filter(m => m.category === category).length
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
      
      {/* Rule Modifications List */}
      {filteredModifications.length > 0 ? (
        <div className="space-y-4">
          {filteredModifications.map((modification) => {
            const isExpanded = expandedRules.has(modification.slug)
            const effectiveDate = modification.effectiveDate 
              ? new Date(modification.effectiveDate).toLocaleDateString('en-CA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              : null
            
            return (
              <Card key={modification.slug} className="overflow-hidden">
                <div 
                  className="cursor-pointer"
                  onClick={() => toggleExpanded(modification.slug)}
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
                        </div>
                        
                        <h3 className="text-xl font-bold text-cboa-blue mb-2">
                          {modification.title}
                        </h3>
                        
                        {modification.summary && (
                          <p className="text-gray-600 mb-3">
                            {modification.summary}
                          </p>
                        )}
                        
                        {modification.approvedBy && (
                          <p className="text-sm text-gray-500">
                            Approved by: <span className="font-medium">{modification.approvedBy}</span>
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
                        <div dangerouslySetInnerHTML={{ __html: modification.content || modification.body || '' }} />
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
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <IconGavel className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Rule Modifications Available
          </h3>
          <p className="text-gray-500">
            {selectedCategory === 'all' 
              ? 'No rule modifications have been posted yet.'
              : `No rule modifications found for "${selectedCategory}".`}
          </p>
        </Card>
      )}
    </div>
  )
}