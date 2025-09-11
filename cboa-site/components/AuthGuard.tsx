'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { IconLock, IconLoader2 } from '@tabler/icons-react'

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
  const { isAuthenticated, isLoading, login } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Store the intended destination
    if (!isAuthenticated && !isLoading && requireAuth) {
      sessionStorage.setItem('redirectAfterLogin', pathname)
    }
  }, [isAuthenticated, isLoading, requireAuth, pathname])

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

  // Not authenticated and auth is required
  if (!isAuthenticated && requireAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <IconLock className="h-16 w-16 text-cboa-blue mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please log in to access the CBOA Member Portal
            </p>
            <button
              onClick={login}
              className="w-full bg-cboa-orange text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              Log In
            </button>
            <p className="mt-4 text-sm text-gray-500">
              Don't have an account? Contact your administrator for access.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Authenticated or auth not required
  return <>{children}</>
}