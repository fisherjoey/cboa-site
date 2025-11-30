'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { membersAPI } from '@/lib/api'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

type UserRole = 'official' | 'executive' | 'admin' | 'evaluator' | 'mentor'

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
  login: (email: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<{ error?: string }>
  resetPassword: (email: string) => Promise<{ error?: string }>
  supabaseUser: SupabaseUser | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create Supabase browser client
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Map Supabase user metadata to our app roles
function getUserRole(supabaseUser: SupabaseUser | null): UserRole {
  if (!supabaseUser) return 'official'

  // Check both app_metadata.role and user_metadata.role
  const appRole = supabaseUser.app_metadata?.role
  const userRole = supabaseUser.user_metadata?.role
  const appRoles = supabaseUser.app_metadata?.roles || []
  const userRoles = supabaseUser.user_metadata?.roles || []
  const roles = [...appRoles, ...userRoles]

  // Check direct role field first (app_metadata takes precedence)
  const directRole = appRole || userRole
  if (directRole) {
    const roleLower = directRole.toLowerCase()
    if (roleLower === 'admin') return 'admin'
    if (roleLower === 'executive') return 'executive'
    if (roleLower === 'evaluator') return 'evaluator'
    if (roleLower === 'mentor') return 'mentor'
    if (roleLower === 'official') return 'official'
  }

  // Then check roles array (case-insensitive)
  const rolesLower = roles.map((r: string) => r.toLowerCase())
  if (rolesLower.includes('admin')) return 'admin'
  if (rolesLower.includes('executive')) return 'executive'
  if (rolesLower.includes('evaluator')) return 'evaluator'
  if (rolesLower.includes('mentor')) return 'mentor'
  if (rolesLower.includes('official')) return 'official'

  // New users without roles get 'official' by default
  return 'official'
}

// Sync Supabase Auth user with members table
async function syncUserToMembers(supabaseUser: SupabaseUser): Promise<void> {
  try {
    // Check if member already exists by user_id (Supabase auth id)
    const existingMember = await membersAPI.getByUserId(supabaseUser.id)

    if (!existingMember) {
      // Create new member record
      await membersAPI.create({
        user_id: supabaseUser.id,
        email: supabaseUser.email!,
        name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email!,
        role: getUserRole(supabaseUser),
        status: 'active'
      })
      console.log('Created new member record for:', supabaseUser.email)
    }
  } catch (error) {
    // Don't block login if sync fails - just log the error
    console.error('Failed to sync user to members table:', error)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
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

  // Convert Supabase user to our User type
  const mapSupabaseUser = (sbUser: SupabaseUser): User => ({
    id: sbUser.id,
    email: sbUser.email!,
    name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email!,
    role: getUserRole(sbUser),
    user_metadata: sbUser.user_metadata,
    app_metadata: sbUser.app_metadata
  })

  useEffect(() => {
    // If authentication is bypassed in development, create a mock user
    if (shouldBypassAuth) {
      setUser(devUsers[devRoleIndex])
      setIsLoading(false)
      return
    }

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error getting session:', error)
          setIsLoading(false)
          return
        }

        if (session?.user) {
          setSupabaseUser(session.user)
          setUser(mapSupabaseUser(session.user))
          // Sync existing user to members table
          syncUserToMembers(session.user)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)

        if (event === 'SIGNED_IN' && session?.user) {
          setSupabaseUser(session.user)
          setUser(mapSupabaseUser(session.user))
          // Sync user to members table on login
          syncUserToMembers(session.user)

          // Only redirect if there's a stored redirect path (indicating a fresh login)
          const redirectPath = sessionStorage.getItem('redirectAfterLogin')
          if (redirectPath) {
            sessionStorage.removeItem('redirectAfterLogin')
            window.location.href = redirectPath
          }
        } else if (event === 'SIGNED_OUT') {
          setSupabaseUser(null)
          setUser(null)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setSupabaseUser(session.user)
          setUser(mapSupabaseUser(session.user))
        } else if (event === 'USER_UPDATED' && session?.user) {
          setSupabaseUser(session.user)
          setUser(mapSupabaseUser(session.user))
        }
      }
    )

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [shouldBypassAuth, devRoleIndex])

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    if (shouldBypassAuth) {
      return {}
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error: any) {
      return { error: error.message || 'An unexpected error occurred' }
    }
  }

  const logout = async (): Promise<void> => {
    if (shouldBypassAuth) {
      // Cycle to next dev user role
      const nextIndex = (devRoleIndex + 1) % devUsers.length
      setDevRoleIndex(nextIndex)
      setUser(devUsers[nextIndex])
      return
    }

    // Set flag so AuthGuard knows not to open login modal
    sessionStorage.setItem('justLoggedOut', 'true')
    await supabase.auth.signOut()
  }

  const signup = async (email: string, password: string, name: string): Promise<{ error?: string }> => {
    if (shouldBypassAuth) {
      return {}
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            name: name
          }
        }
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error: any) {
      return { error: error.message || 'An unexpected error occurred' }
    }
  }

  const resetPassword = async (email: string): Promise<{ error?: string }> => {
    try {
      // Use our custom endpoint that sends via Microsoft Graph
      const response = await fetch('/.netlify/functions/auth-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || 'Failed to send reset email' }
      }

      return {}
    } catch (error: any) {
      return { error: error.message || 'An unexpected error occurred' }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        signup,
        resetPassword,
        supabaseUser
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