'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface SearchResult {
  title: string
  description: string
  url: string
  category: string
}

const searchableContent: SearchResult[] = [
  {
    title: 'Home',
    description: 'Welcome to Calgary Basketball Officials Association',
    url: '/',
    category: 'Main'
  },
  {
    title: 'About CBOA',
    description: 'Learn about the Calgary Basketball Officials Association, our mission, and leadership',
    url: '/about',
    category: 'About'
  },
  {
    title: 'Become a Referee',
    description: 'Join CBOA as a basketball referee. Learn about requirements, training, and how to apply',
    url: '/become-a-referee',
    category: 'Membership'
  },
  {
    title: 'Training & Development',
    description: 'Referee training programs, clinics, workshops, and certification courses',
    url: '/training',
    category: 'Training'
  },
  {
    title: 'Training Schedule',
    description: 'View upcoming training sessions, clinics, and workshops schedule',
    url: '/training/schedule',
    category: 'Training'
  },
  {
    title: 'Resources',
    description: 'Official rules, forms, documents, and referee resources',
    url: '/resources',
    category: 'Resources'
  },
  {
    title: 'News & Updates',
    description: 'Latest news, announcements, and updates from CBOA',
    url: '/news',
    category: 'News'
  },
  {
    title: 'Get Officials',
    description: 'Request certified basketball officials for your games and tournaments',
    url: '/get-officials',
    category: 'Services'
  },
  {
    title: 'Contact Us',
    description: 'Get in touch with Calgary Basketball Officials Association',
    url: '/about#contact',
    category: 'Contact'
  },
  {
    title: 'FIBA Rules',
    description: 'Official FIBA basketball rules and regulations',
    url: '/resources',
    category: 'Resources'
  },
  {
    title: 'Canada Basketball Rules',
    description: 'Canada Basketball official rules and guidelines',
    url: '/resources',
    category: 'Resources'
  },
  {
    title: 'Referee Evaluation Forms',
    description: 'Performance evaluation forms for basketball referees',
    url: '/resources',
    category: 'Resources'
  },
  {
    title: 'Mission Statement',
    description: 'CBOA mission to provide quality officiating for basketball in Calgary',
    url: '/about',
    category: 'About'
  },
  {
    title: 'Board of Directors',
    description: 'Meet the CBOA leadership team and board members',
    url: '/about',
    category: 'About'
  },
  {
    title: 'Membership Benefits',
    description: 'Benefits of becoming a CBOA certified referee',
    url: '/become-a-referee',
    category: 'Membership'
  },
  {
    title: 'Training Requirements',
    description: 'Mandatory training and certification requirements for referees',
    url: '/training',
    category: 'Training'
  },
  {
    title: 'Game Assignments',
    description: 'How game assignments work for CBOA referees',
    url: '/resources',
    category: 'Resources'
  },
  {
    title: 'Code of Conduct',
    description: 'Professional standards and code of conduct for CBOA referees',
    url: '/resources',
    category: 'Resources'
  }
]

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (query) {
      setIsLoading(true)
      const lowercaseQuery = query.toLowerCase()
      const searchResults = searchableContent.filter(item => 
        item.title.toLowerCase().includes(lowercaseQuery) ||
        item.description.toLowerCase().includes(lowercaseQuery) ||
        item.category.toLowerCase().includes(lowercaseQuery)
      )
      setTimeout(() => {
        setResults(searchResults)
        setIsLoading(false)
      }, 300)
    } else {
      setResults([])
      setIsLoading(false)
    }
  }, [query])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-cboa-dark mb-6">
            Search Results
          </h1>
          
          {query && (
            <div className="mb-8">
              <p className="text-gray-600">
                Showing results for: <span className="font-semibold text-cboa-dark">"{query}"</span>
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cboa-blue"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-6">
              {results.map((result, index) => (
                <Link 
                  key={index}
                  href={result.url}
                  className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-xl font-semibold text-cboa-dark hover:text-cboa-blue transition-colors">
                      {result.title}
                    </h2>
                    <span className="text-xs bg-cboa-orange text-white px-2 py-1 rounded-full">
                      {result.category}
                    </span>
                  </div>
                  <p className="text-gray-600 line-clamp-2">
                    {result.description}
                  </p>
                  <p className="text-sm text-cboa-blue mt-2">
                    {result.url}
                  </p>
                </Link>
              ))}
            </div>
          ) : query ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">No results found</h2>
              <p className="text-gray-500">
                We couldn't find any results for "{query}". Try searching with different keywords.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h2 className="text-xl font-semibold text-gray-700 mb-2">Start searching</h2>
              <p className="text-gray-500">
                Use the search bar above to find information about CBOA, training, resources, and more.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}