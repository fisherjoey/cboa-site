'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBox() {
  const [search, setSearch] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`)
      setSearch('')
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative">
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-white/10 border border-white/20 text-white placeholder-gray-300 px-4 py-2 rounded-full text-base w-48 md:w-64 focus:outline-none focus:border-cboa-orange focus:bg-white/15 transition-all"
      />
      <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  )
}