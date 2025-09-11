'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import SearchBox from '../ui/SearchBox'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const pathname = usePathname()
  
  // Check if user is logged in (mock for now)
  useEffect(() => {
    // In production, this would check actual auth state
    setIsLoggedIn(false) // Set based on auth state
  }, [pathname])
  
  // Check if we're on portal pages - don't show main header on portal
  const isPortalPage = pathname?.startsWith('/portal')
  
  // Don't render main header on portal pages
  if (isPortalPage) {
    return null
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Top Row: Logo + Utility Navigation */}
      <div className="bg-cboa-dark text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center py-4 gap-4">
            <Link href="/" className="flex items-center gap-4">
              <Image 
                src="/images/logos/cboa-logo.png" 
                alt="CBOA Logo" 
                width={60} 
                height={60}
                className="rounded invert"
              />
              <div>
                <h2 className="text-2xl font-bold">CBOA</h2>
                <p className="text-sm text-gray-300">Calgary Basketball Officials</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-6">
              <SearchBox />
              <Link 
                href="/portal" 
                className="text-white hover:text-cboa-orange transition-colors font-medium text-base px-4 py-2 border border-white/20 rounded hover:border-cboa-orange"
              >
                Member Portal
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Row: Main Navigation */}
      <nav className="bg-cboa-blue text-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <ul className="hidden md:flex gap-6 py-5">
              <li><Link href="/" className="hover:text-cboa-orange transition-colors px-3 py-2 text-base font-medium">Home</Link></li>
              <li><Link href="/about" className="hover:text-cboa-orange transition-colors px-3 py-2 text-base font-medium">About</Link></li>
              <li><Link href="/training" className="hover:text-cboa-orange transition-colors px-3 py-2 text-base font-medium">Training</Link></li>
              <li><Link href="/become-a-referee" className="hover:text-cboa-orange transition-colors px-3 py-2 text-base font-medium">Become a Referee</Link></li>
              <li><Link href="/get-officials" className="hover:text-cboa-orange transition-colors px-3 py-2 text-base font-medium">Request Officials</Link></li>
              <li><Link href="/resources" className="hover:text-cboa-orange transition-colors px-3 py-2 text-base font-medium">Resources</Link></li>
              <li><Link href="/news" className="hover:text-cboa-orange transition-colors px-3 py-2 text-base font-medium">News</Link></li>
            </ul>
            
            {/* Portal Navigation - Right side when logged in */}
            {isLoggedIn && (
              <ul className="hidden md:flex gap-4 py-4 items-center">
                <li className="text-cboa-orange font-medium">Portal:</li>
                <li><Link href="/portal" className="hover:text-cboa-orange transition-colors px-2 py-1">Dashboard</Link></li>
                <li><Link href="/portal/resources" className="hover:text-cboa-orange transition-colors px-2 py-1">Resources</Link></li>
                <li><Link href="/portal/news" className="hover:text-cboa-orange transition-colors px-2 py-1">News</Link></li>
                <li><Link href="/portal/the-bounce" className="hover:text-cboa-orange transition-colors px-2 py-1">The Bounce</Link></li>
                <li>
                  <button 
                    className="text-sm hover:text-cboa-orange px-2 py-1 transition-colors"
                    onClick={() => setIsLoggedIn(false)}
                  >
                    Logout
                  </button>
                </li>
              </ul>
            )}
            
            {/* Mobile Menu Button */}
            <button
              className="md:hidden py-4"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <ul className="md:hidden py-4 border-t border-gray-600">
              <li><Link href="/" className="block hover:text-cboa-orange transition-colors px-3 py-2">Home</Link></li>
              <li><Link href="/about" className="block hover:text-cboa-orange transition-colors px-3 py-2">About</Link></li>
              <li><Link href="/training" className="block hover:text-cboa-orange transition-colors px-3 py-2">Training</Link></li>
              <li><Link href="/become-a-referee" className="block hover:text-cboa-orange transition-colors px-3 py-2">Become a Referee</Link></li>
              <li><Link href="/get-officials" className="block hover:text-cboa-orange transition-colors px-3 py-2">Request Officials</Link></li>
              <li><Link href="/resources" className="block hover:text-cboa-orange transition-colors px-3 py-2">Resources</Link></li>
              <li><Link href="/news" className="block hover:text-cboa-orange transition-colors px-3 py-2">News</Link></li>
              <li><Link href="/portal" className="block hover:text-cboa-orange transition-colors px-3 py-2 font-medium">Member Portal</Link></li>
            </ul>
          )}
        </div>
      </nav>
    </header>
  )
}