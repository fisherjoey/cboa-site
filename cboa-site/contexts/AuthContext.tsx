'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import netlifyIdentity from 'netlify-identity-widget'

type UserRole = 'official' | 'executive' | 'admin'

interface User {
  id: string
  email: string
  name: string
  role: UserRole
  user_metadata?: any
  app_metadata?: any
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: () => void
  logout: () => void
  signup: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Map Netlify Identity roles to our app roles
function getUserRole(netlifyUser: any): UserRole {
  // Check both app_metadata.roles and user_metadata.roles
  // Also check if role is stored directly in user_metadata
  const appRoles = netlifyUser?.app_metadata?.roles || []
  const userRoles = netlifyUser?.user_metadata?.roles || []
  const directRole = netlifyUser?.user_metadata?.role
  const roles = [...appRoles, ...userRoles]
  
  // Check direct role field first
  if (directRole) {
    if (directRole === 'admin' || directRole === 'Admin') return 'admin'
    if (directRole === 'executive' || directRole === 'Executive') return 'executive'
    if (directRole === 'official' || directRole === 'Official') return 'official'
  }
  
  // Then check roles array
  if (roles.includes('admin') || roles.includes('Admin')) return 'admin'
  if (roles.includes('executive') || roles.includes('Executive')) return 'executive'
  if (roles.includes('official') || roles.includes('Official')) return 'official'
  
  // New users without roles get 'official' by default
  // But they won't have admin panel access
  return 'official'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [devRoleIndex, setDevRoleIndex] = useState(0)

  // Check if authentication should be disabled in development
  const isDevMode = process.env.NODE_ENV === 'development'
  const disableAuthInDev = process.env.NEXT_PUBLIC_DISABLE_AUTH_DEV === 'true'
  const shouldBypassAuth = isDevMode && disableAuthInDev

  // Dev users for cycling through different roles
  const devUsers = [
    {
      id: 'dev-user-admin',
      email: 'admin@example.com',
      name: 'Dev Admin User',
      role: 'admin' as UserRole,
      user_metadata: { full_name: 'Dev Admin User' },
      app_metadata: { roles: ['admin'] }
    },
    {
      id: 'dev-user-executive',
      email: 'executive@example.com',
      name: 'Dev Executive User',
      role: 'executive' as UserRole,
      user_metadata: { full_name: 'Dev Executive User' },
      app_metadata: { roles: ['executive'] }
    },
    {
      id: 'dev-user-official',
      email: 'official@example.com',
      name: 'Dev Official User',
      role: 'official' as UserRole,
      user_metadata: { full_name: 'Dev Official User' },
      app_metadata: { roles: ['official'] }
    }
  ]

  useEffect(() => {
    // If authentication is bypassed in development, create a mock user
    if (shouldBypassAuth) {
      setUser(devUsers[devRoleIndex])
      setIsLoading(false)
      return
    }

    // Initialize Netlify Identity
    netlifyIdentity.init({
      container: 'body', // defaults to document.body
      locale: 'en' // defaults to 'en'
    })

    // Check for existing user
    const currentUser = netlifyIdentity.currentUser()
    if (currentUser) {
      setUser({
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.user_metadata?.full_name || currentUser.email,
        role: getUserRole(currentUser),
        user_metadata: currentUser.user_metadata,
        app_metadata: currentUser.app_metadata
      })
    }

    setIsLoading(false)

    // Set up event listeners
    netlifyIdentity.on('login', (netlifyUser) => {
      setUser({
        id: netlifyUser.id,
        email: netlifyUser.email,
        name: netlifyUser.user_metadata?.full_name || netlifyUser.email,
        role: getUserRole(netlifyUser),
        user_metadata: netlifyUser.user_metadata,
        app_metadata: netlifyUser.app_metadata
      })
      netlifyIdentity.close()
    })

    netlifyIdentity.on('logout', () => {
      setUser(null)
    })

    netlifyIdentity.on('error', (err) => {
      console.error('Netlify Identity error:', err)
    })

    // Cleanup (only if not bypassing auth)
    return () => {
      if (!shouldBypassAuth) {
        netlifyIdentity.off('login')
        netlifyIdentity.off('logout')
        netlifyIdentity.off('error')
      }
    }
  }, [shouldBypassAuth, devRoleIndex])

  const login = () => {
    if (shouldBypassAuth) {
      return
    }
    netlifyIdentity.open('login')
  }

  const logout = () => {
    if (shouldBypassAuth) {
      // Cycle to next dev user role
      const nextIndex = (devRoleIndex + 1) % devUsers.length
      setDevRoleIndex(nextIndex)
      setUser(devUsers[nextIndex])
      return
    }
    netlifyIdentity.logout()
  }

  const signup = () => {
    if (shouldBypassAuth) {
      return
    }
    netlifyIdentity.open('signup')
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user,
        isLoading,
        login, 
        logout,
        signup
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}