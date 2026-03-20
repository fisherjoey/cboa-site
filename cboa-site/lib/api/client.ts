/**
 * Shared API client utilities — auth headers, fetch wrapper, config.
 */
import { retryAsync, parseAPIError, AppError } from '../errorHandling'
import { createBrowserClient } from '@supabase/ssr'

export { AppError }

// API base URL — proxied to /.netlify/functions via netlify.toml
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

// Flag to enable mock data when functions aren't available
export const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || process.env.NODE_ENV === 'development'

export const isBrowser = () => typeof window !== 'undefined'

// Lazily-created browser client that shares session with AuthContext
let _browserClient: ReturnType<typeof createBrowserClient> | null = null
function getBrowserClient() {
  if (!isBrowser()) return null
  if (!_browserClient) {
    _browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _browserClient
}

// Get Supabase auth token for authenticated API calls
async function getAuthHeaders(): Promise<Record<string, string>> {
  const client = getBrowserClient()
  if (!client) return {}
  try {
    const { data: { session } } = await client.auth.getSession()
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` }
    }
  } catch {
    // Not logged in
  }
  return {}
}

/** Enhanced fetch with auth token injection and error handling */
export async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  try {
    const authHeaders = await getAuthHeaders()
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
        ...options?.headers
      }
    })

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch {
        // If JSON parsing fails, use default message
      }

      throw new AppError(errorMessage, 'API_ERROR', response.status)
    }

    return response
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new AppError('Network error. Please check your internet connection.', 'NETWORK_ERROR')
    }
    if (error instanceof AppError) throw error
    throw new AppError(parseAPIError(error), 'UNKNOWN_ERROR')
  }
}

/** Re-export retryAsync for use in API modules */
export { retryAsync }

/** Get the current user's JWT token from Supabase session */
export async function getAuthToken(): Promise<string | null> {
  const client = getBrowserClient()
  if (!client) return null
  try {
    const { data: { session } } = await client.auth.getSession()
    return session?.access_token || null
  } catch {
    return null
  }
}
