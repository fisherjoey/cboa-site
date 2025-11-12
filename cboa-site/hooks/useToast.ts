'use client'

import { useState, useCallback } from 'react'
import { Toast, ToastType } from '@/components/Toast'

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((
    type: ToastType,
    title: string,
    message?: string,
    duration?: number
  ) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = {
      id,
      type,
      title,
      message,
      duration: duration || 5000
    }

    setToasts(prev => [...prev, newToast])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // Convenience methods
  const success = useCallback((title: string, message?: string, duration?: number) => {
    showToast('success', title, message, duration)
  }, [showToast])

  const error = useCallback((title: string, message?: string, duration?: number) => {
    showToast('error', title, message, duration || 7000) // Errors stay longer
  }, [showToast])

  const warning = useCallback((title: string, message?: string, duration?: number) => {
    showToast('warning', title, message, duration)
  }, [showToast])

  const info = useCallback((title: string, message?: string, duration?: number) => {
    showToast('info', title, message, duration)
  }, [showToast])

  return {
    toasts,
    showToast,
    dismissToast,
    success,
    error,
    warning,
    info
  }
}
