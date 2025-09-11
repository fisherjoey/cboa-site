'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import SearchBox from '../ui/SearchBox'

export default function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  
  // Check if we're on portal pages
  const isPortalPage = pathname?.startsWith('/portal')
  
  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])
  
  // Prevent body scroll when mobile menu is open (only if not on portal page)
  useEffect(() => {
    if (!isPortalPage && mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen, isPortalPage])
  
  // Check if user is logged in (mock for now)
  useEffect(() => {
    // In production, this would check actual auth state
    setIsLoggedIn(false) // Set based on auth state
  }, [pathname])
  
  // Don't render main header on portal pages
  if (isPortalPage) {
    return null
  }

  return (
    <header className="sticky top-0 z-50">
      {/* Top Row: Logo + Utility Navigation */}
      <div className="bg-cboa-dark text-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3 md:py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 md:gap-4">
              <Image 
                src="/images/logos/cboa-logo.png" 
                alt="CBOA Logo" 
                width={45} 
                height={45}
                className="rounded invert md:w-[60px] md:h-[60px]"
              />
              <div>
                <h2 className="text-lg md:text-2xl font-bold">CBOA</h2>
                <p className="text-xs md:text-sm text-gray-300 hidden sm:block">Calgary Basketball Officials</p>
              </div>
            </Link>
            
            {/* Desktop Utility */}
            <div className="hidden md:flex items-center gap-6">
              <SearchBox />
              <Link 
                href="/portal" 
                className="text-white hover:text-cboa-orange transition-colors font-medium text-base px-4 py-2 border border-white/20 rounded hover:border-cboa-orange"
              >
                Member Portal
              </Link>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 -mr-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
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
        </div>
      </div>
      
      {/* Bottom Row: Main Navigation - Desktop Only */}
      <nav className="bg-cboa-blue text-white hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <ul className="flex gap-6 py-5">
              <li><Link href="/" className="hover:text-cboa-orange transition-colors px-3 py-2 text-base font-medium">Home</Link></li>
              <li><Link href="/about" className="hover:text-cboa-orange transition-colors px-3 py-2 text-base font-medium">About</Link></li>
              <li><Link href="/training" className="hover:text-cboa-orange transition-colors px-3 py-2 text-base font-medium">Training</Link></li>
              <li><Link href="/become-a-referee" className="hover:text-cboa-orange transition-colors px-3 py-2 text-base font-medium">Become a Referee</Link></li>
              <li><Link href="/get-officials" className="bg-cboa-orange text-white hover:bg-orange-600 transition-colors px-4 py-2 text-base font-medium rounded">Book Referees</Link></li>
              <li><Link href="/resources" className="hover:text-cboa-orange transition-colors px-3 py-2 text-base font-medium">Resources</Link></li>
              <li><Link href="/news" className="hover:text-cboa-orange transition-colors px-3 py-2 text-base font-medium">News</Link></li>
            </ul>
            
            {/* Portal Navigation - Right side when logged in */}
            {isLoggedIn && (
              <ul className="flex gap-4 py-4 items-center">
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
          }
        </div>
      </nav>
      
      {/* Mobile Menu Slide-in Panel */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="md:hidden fixed right-0 top-0 h-full w-64 bg-cboa-blue text-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl">
            {/* Menu Header */}
            <div className="bg-cboa-dark p-4 flex justify-between items-center">
              <span className="font-bold text-lg">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-2"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Search Box Mobile */}
            <div className="p-4 border-b border-white/20">
              <SearchBox />
            </div>
            
            {/* Menu Items */}
            <nav className="py-4">
              <Link href="/" className="block px-4 py-3 hover:bg-white/10 transition-colors">Home</Link>
              <Link href="/about" className="block px-4 py-3 hover:bg-white/10 transition-colors">About</Link>
              <Link href="/training" className="block px-4 py-3 hover:bg-white/10 transition-colors">Training</Link>
              <Link href="/become-a-referee" className="block px-4 py-3 hover:bg-white/10 transition-colors">Become a Referee</Link>
              <Link href="/get-officials" className="block px-4 py-3 bg-cboa-orange hover:bg-orange-600 transition-colors font-medium">Book Referees</Link>
              <Link href="/resources" className="block px-4 py-3 hover:bg-white/10 transition-colors">Resources</Link>
              <Link href="/news" className="block px-4 py-3 hover:bg-white/10 transition-colors">News</Link>
              
              {/* Portal Button */}
              <div className="px-4 py-3 mt-4 border-t border-white/20">
                <Link 
                  href="/portal" 
                  className="block text-center bg-cboa-orange text-white py-2 px-4 rounded font-medium hover:bg-orange-600 transition-colors"
                >
                  Member Portal
                </Link>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  )
}