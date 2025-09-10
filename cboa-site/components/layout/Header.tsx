'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import SearchBox from '../ui/SearchBox'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50">
      {/* Top Row: Logo + Utility Navigation */}
      <div className="bg-cboa-dark text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center py-3 gap-4">
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/images/logos/cboa-logo.png" 
                alt="CBOA Logo" 
                width={50} 
                height={50}
                className="rounded invert"
              />
              <div>
                <h2 className="text-xl font-bold">CBOA</h2>
                <p className="text-xs text-gray-300">Calgary Basketball Officials</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-4 text-sm">
              <SearchBox />
              <Link 
                href="/become-a-referee" 
                className="bg-cboa-orange text-white px-4 py-2 rounded-full font-semibold hover:bg-opacity-90 transition-all"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Row: Main Navigation */}
      <nav className="bg-cboa-blue text-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <ul className="hidden md:flex gap-6 py-4">
              <li><Link href="/" className="hover:text-cboa-orange transition-colors px-3 py-2">Home</Link></li>
              <li><Link href="/about" className="hover:text-cboa-orange transition-colors px-3 py-2">About</Link></li>
              <li><Link href="/training" className="hover:text-cboa-orange transition-colors px-3 py-2">Training</Link></li>
              <li><Link href="/become-a-referee" className="hover:text-cboa-orange transition-colors px-3 py-2">Become a Referee</Link></li>
              <li><Link href="/get-officials" className="hover:text-cboa-orange transition-colors px-3 py-2">Request Officials</Link></li>
              <li><Link href="/resources" className="hover:text-cboa-orange transition-colors px-3 py-2">Resources</Link></li>
              <li><Link href="/news" className="hover:text-cboa-orange transition-colors px-3 py-2">News</Link></li>
            </ul>
            
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
            </ul>
          )}
        </div>
      </nav>
    </header>
  )
}