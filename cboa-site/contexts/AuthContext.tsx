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
  const roles = netlifyUser?.app_metadata?.roles || []
  
  // Only grant admin/executive roles if explicitly set in Netlify
  if (roles.includes('admin')) return 'admin'
  if (roles.includes('executive')) return 'executive'
  if (roles.includes('official')) return 'official'
  
  // New users without roles get 'official' by default
  // But they won't have admin panel access
  return 'official'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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

    // Cleanup
    return () => {
      netlifyIdentity.off('login')
      netlifyIdentity.off('logout')
      netlifyIdentity.off('error')
    }
  }, [])

  const login = () => {
    netlifyIdentity.open('login')
  }

  const logout = () => {
    netlifyIdentity.logout()
  }

  const signup = () => {
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