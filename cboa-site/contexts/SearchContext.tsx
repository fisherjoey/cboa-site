'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface SearchResult {
  title: string
  description: string
  url: string
  category: string
}

interface SearchContextType {
  searchTerm: string
  setSearchTerm: (term: string) => void
  searchResults: SearchResult[]
  isSearching: boolean
  performSearch: (term: string) => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

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

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const performSearch = (term: string) => {
    setSearchTerm(term)
    setIsSearching(true)

    if (!term.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    const lowercaseTerm = term.toLowerCase()
    const results = searchableContent.filter(item => 
      item.title.toLowerCase().includes(lowercaseTerm) ||
      item.description.toLowerCase().includes(lowercaseTerm) ||
      item.category.toLowerCase().includes(lowercaseTerm)
    )

    setTimeout(() => {
      setSearchResults(results)
      setIsSearching(false)
    }, 100)
  }

  return (
    <SearchContext.Provider value={{
      searchTerm,
      setSearchTerm,
      searchResults,
      isSearching,
      performSearch
    }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider')
  }
  return context
}