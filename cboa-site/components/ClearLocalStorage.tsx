'use client'

import { useEffect } from 'react'

export default function ClearLocalStorage() {
  useEffect(() => {
    // Clear all CBOA localStorage data
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('cboa_'))
      keys.forEach(key => localStorage.removeItem(key))
      console.log('Cleared localStorage:', keys)
    }
  }, [])

  return null
}