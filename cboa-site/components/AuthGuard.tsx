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

  // Check if authentication should be disabled in development
  const isDevMode = process.env.NODE_ENV === 'development'
  const disableAuthInDev = process.env.NEXT_PUBLIC_DISABLE_AUTH_DEV === 'true'
  const shouldBypassAuth = isDevMode && disableAuthInDev

  useEffect(() => {
    // Store the intended destination (only if not bypassing auth)
    if (!shouldBypassAuth && !isAuthenticated && !isLoading && requireAuth) {
      sessionStorage.setItem('redirectAfterLogin', pathname)
    }
  }, [isAuthenticated, isLoading, requireAuth, pathname, shouldBypassAuth])

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

  // Not authenticated and auth is required
  if (!isAuthenticated && requireAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 mx-4">
          <div className="text-center">
            {/* CBOA Logo/Branding */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-cboa-blue to-blue-700 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-2xl">CBOA</span>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Officials Portal
            </h1>
            <p className="text-gray-600 mb-8">
              Sign in to access schedules, resources, and member tools.
            </p>

            <button
              onClick={login}
              className="w-full bg-cboa-orange text-white py-3 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-all hover:shadow-lg active:scale-[0.98]"
            >
              Sign In with Email
            </button>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                New to CBOA? Contact <a href="mailto:info@cboa.ca" className="text-cboa-orange hover:underline">info@cboa.ca</a> to get started.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-4 text-center text-xs text-gray-400">
          Calgary Basketball Officials Association
        </div>
      </div>
    )
  }

  // Authenticated or auth not required
  return <>{children}</>
}