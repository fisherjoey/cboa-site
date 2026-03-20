'use client'

import { useAuth } from '@/contexts/AuthContext'
import { IconUser, IconMail, IconShield, IconId } from '@tabler/icons-react'

export default function ProfilePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">Please log in to view your profile.</p>
        </div>
      </div>
    )
  }

  // Format role for display
  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'executive':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <div className="max-w-lg mx-auto px-3 py-3 sm:p-5">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Profile Header — compact */}
        <div className="bg-gradient-to-r from-cboa-blue to-slate-700 px-4 py-4 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <IconUser size={24} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-white truncate">{user.name}</h1>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                {formatRole(user.role)}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details — flat list with dividers */}
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          <div className="flex items-center gap-3 px-4 py-3">
            <IconMail size={18} className="text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-sm text-gray-900 dark:text-white truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3">
            <IconShield size={18} className="text-gray-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Role</p>
              <p className="text-sm text-gray-900 dark:text-white">{formatRole(user.role)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3">
            <IconId size={18} className="text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">User ID</p>
              <p className="text-xs text-gray-900 dark:text-white font-mono truncate">{user.id}</p>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Profile information is managed through your account.
          </p>
        </div>
      </div>
    </div>
  )
}
