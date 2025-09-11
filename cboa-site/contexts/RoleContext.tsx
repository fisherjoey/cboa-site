'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from './AuthContext'

type UserRole = 'official' | 'executive' | 'admin'

interface User {
  name: string
  role: UserRole
  level?: number
  avatar?: string
}

interface RoleContextType {
  user: User
  setUser: (user: User) => void
  switchRole: (role: UserRole) => void
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user: authUser } = useAuth()
  
  // Convert auth user to role user format
  const user: User = authUser ? {
    name: authUser.name,
    role: authUser.role,
    level: authUser.user_metadata?.level,
    avatar: authUser.user_metadata?.avatar
  } : {
    name: 'Guest',
    role: 'official'
  }

  // These functions are no-ops in production since roles come from Netlify Identity
  const setUser = (user: User) => {
    console.warn('setUser is disabled in production mode. User roles are managed by Netlify Identity.')
  }
  
  const switchRole = (role: UserRole) => {
    console.warn('switchRole is disabled in production mode. User roles are managed by Netlify Identity.')
  }

  return (
    <RoleContext.Provider value={{ user, setUser, switchRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return context
}