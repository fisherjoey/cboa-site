'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { IconLoader2 } from '@tabler/icons-react'
import netlifyIdentity from 'netlify-identity-widget'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export default function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = '/'
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [hasRedirected, setHasRedirected] = useState(false)

  // Check if authentication should be disabled in development
  const isDevMode = process.env.NODE_ENV === 'development'
  const disableAuthInDev = process.env.NEXT_PUBLIC_DISABLE_AUTH_DEV === 'true'
  const shouldBypassAuth = isDevMode && disableAuthInDev

  useEffect(() => {
    // If not authenticated and auth is required, redirect to home and open login modal
    if (!shouldBypassAuth && !isAuthenticated && !isLoading && requireAuth && !hasRedirected) {
      setHasRedirected(true)

      // Check if user just logged out - don't open modal in that case
      const justLoggedOut = sessionStorage.getItem('justLoggedOut')
      if (justLoggedOut) {
        sessionStorage.removeItem('justLoggedOut')
        router.push('/')
        return
      }

      // Store intended destination
      sessionStorage.setItem('redirectAfterLogin', pathname)
      // Redirect to home
      router.push('/')
      // Open the login modal after a brief delay to let the redirect happen
      setTimeout(() => {
        netlifyIdentity.open('login')
      }, 100)
    }
  }, [isAuthenticated, isLoading, requireAuth, pathname, shouldBypassAuth, hasRedirected, router])

  // If auth is bypassed in development, always allow access
  if (shouldBypassAuth) {
    return <>{children}</>
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <IconLoader2 className="h-12 w-12 text-cboa-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated and auth is required - show loading while redirecting
  if (!isAuthenticated && requireAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <IconLoader2 className="h-12 w-12 text-cboa-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // Authenticated or auth not required
  return <>{children}</>
}