'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useRole } from '@/contexts/RoleContext'
import { 
  IconHome, 
  IconBooks, 
  IconNews, 
  IconNotebook,
  IconLock,
  IconExternalLink,
  IconChevronDown,
  IconX,
  IconMenu2,
  IconCalendar,
  IconGavel,
  IconUserCircle,
  IconShield,
  IconUsers
} from '@tabler/icons-react'

import { useAuth } from '@/contexts/AuthContext'

export default function PortalHeader() {
  const { user } = useRole()
  const { logout } = useAuth()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case 'admin': return 'bg-red-500'
      case 'executive': return 'bg-purple-500'
      default: return 'bg-blue-500'
    }
  }

  const getRoleLabel = (role: string) => {
    switch(role) {
      case 'admin': return 'Administrator'
      case 'executive': return 'Executive'
      default: return 'Official'
    }
  }

  const portalLinks = [
    { href: '/portal', label: 'Dashboard', icon: IconHome },
    { href: '/portal/calendar', label: 'Calendar', icon: IconCalendar },
    { href: '/portal/resources', label: 'Resources', icon: IconBooks },
    { href: '/portal/news', label: 'News & Announcements', icon: IconNews },
    { href: '/portal/rule-modifications', label: 'Rule Modifications', icon: IconGavel },
    { href: '/portal/the-bounce', label: 'The Bounce', icon: IconNotebook },
  ]

  return (
    <header className="sticky top-0 z-50">
      {/* Portal Indicator Bar */}
      <div className="bg-orange-500 text-white text-xs py-1">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconLock className="h-4 w-4" />
            <span className="font-semibold">Secure Member Portal</span>
            <span className={`px-2 py-0.5 rounded text-xs ${getRoleBadgeColor(user.role)}`}>
              {getRoleLabel(user.role)}
            </span>
          </div>
          <Link href="/" className="hover:underline">
            ← Back to Public Site
          </Link>
        </div>
      </div>

      {/* Main Portal Header */}
      <div className="bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Portal Name */}
            <Link href="/portal" className="flex items-center gap-3">
              <Image 
                src="/images/logos/cboa-logo.png" 
                alt="CBOA Logo" 
                width={40} 
                height={40}
                className="rounded invert"
              />
              <div>
                <h1 className="text-lg font-bold">CBOA Member Portal</h1>
                <p className="text-xs text-gray-400">Calgary Basketball Officials</p>
              </div>
            </Link>

            {/* Desktop User Menu */}
            <div className="hidden md:flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 hover:bg-slate-800 px-3 py-2 rounded"
                >
                  <div className="h-8 w-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="font-medium">{user.name}</span>
                  <IconChevronDown className="h-4 w-4" />
                </button>

                {/* Profile Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <button 
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <IconX className="h-6 w-6" />
              ) : (
                <IconMenu2 className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Portal Navigation */}
      <nav className="bg-slate-800 text-white border-t border-slate-700">
        <div className="container mx-auto px-4">
          {/* Desktop Navigation */}
          <ul className="hidden md:flex">
            {portalLinks.map(link => (
              <li key={link.href}>
                {link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 border-b-2 border-transparent hover:bg-slate-700 hover:border-slate-600 transition-colors"
                  >
                    <link.icon className="h-4 w-4" />
                    <span>{link.label}</span>
                    <IconExternalLink className="h-3 w-3 ml-1" />
                  </a>
                ) : (
                  <Link
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                      pathname === link.href
                        ? 'border-orange-500 bg-slate-900 text-orange-400'
                        : 'border-transparent hover:bg-slate-700 hover:border-slate-600'
                    } ${
                      link.executive ? 'bg-purple-900 bg-opacity-30 font-semibold' : ''
                    }`}
                  >
                    <link.icon className="h-4 w-4" />
                    <span>{link.label}</span>
                    {link.executive && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-purple-600 rounded">EXEC</span>
                    )}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-2 space-y-1">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-slate-700">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-10 w-10 bg-orange-500 rounded-full flex items-center justify-center font-bold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-gray-400">{getRoleLabel(user.role)}</div>
                  </div>
                </div>
              </div>

              {/* Mobile Links */}
              {portalLinks.map(link => (
                link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-slate-700"
                  >
                    <link.icon className="h-4 w-4" />
                    <span>{link.label}</span>
                    <IconExternalLink className="h-3 w-3 ml-1" />
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2 ${
                      pathname === link.href
                        ? 'bg-slate-900 text-orange-400'
                        : 'hover:bg-slate-700'
                    } ${
                      link.executive ? 'bg-purple-900 bg-opacity-30' : ''
                    }`}
                  >
                    <link.icon className="h-4 w-4" />
                    <span>{link.label}</span>
                    {link.executive && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-purple-600 rounded">EXEC</span>
                    )}
                  </Link>
                )
              ))}
              
              <hr className="border-slate-700" />
              
              <button 
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-red-400 hover:bg-slate-700"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

    </header>
  )
}