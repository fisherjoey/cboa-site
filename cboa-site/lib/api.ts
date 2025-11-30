// API helper functions for portal data
import { retryAsync, parseAPIError, AppError } from './errorHandling'
import {
  mockMembers,
  mockActivities,
  getMemberByNetlifyId,
  getMemberById,
  getActivitiesByMemberId,
  createMockMember,
  updateMockMember,
  deleteMockMember
} from './mockData/members'
import {
  getFromCache,
  saveToCache,
  invalidateCache,
  CACHE_TTL,
  type CacheKey
} from './cache'

// Use /api route which redirects to /.netlify/functions (configured in netlify.toml)
// In development, use NEXT_PUBLIC_API_URL to point to the Netlify proxy
// In production, use relative path '/api'
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

// Flag to enable mock data when functions aren't available
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || process.env.NODE_ENV === 'development'

// Helper to check if we're in browser (for cache)
const isBrowser = () => typeof window !== 'undefined'

// Enhanced fetch with better error handling and mock data fallback
async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
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

      throw new AppError(
        errorMessage,
        'API_ERROR',
        response.status
      )
    }

    return response
  } catch (error: any) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new AppError(
        'Network error. Please check your internet connection.',
        'NETWORK_ERROR'
      )
    }

    // Re-throw AppError as-is
    if (error instanceof AppError) {
      throw error
    }

    // Wrap unknown errors
    throw new AppError(
      parseAPIError(error),
      'UNKNOWN_ERROR'
    )
  }
}

// Calendar Events API
export const calendarAPI = {
  async getAll(options?: { forceRefresh?: boolean }) {
    const cacheKey = 'calendarEvents'

    // Check cache first (unless forcing refresh)
    if (!options?.forceRefresh && isBrowser()) {
      const cached = getFromCache(cacheKey)
      if (cached) return cached
    }

    const data = await retryAsync(async () => {
      const res = await apiFetch(`${API_BASE}/calendar-events`)
      return res.json()
    })

    // Save to cache
    if (isBrowser()) {
      saveToCache(cacheKey, data)
    }

    return data
  },

  async create(event: any) {
    const res = await apiFetch(`${API_BASE}/calendar-events`, {
      method: 'POST',
      body: JSON.stringify(event)
    })
    // Invalidate cache on mutation
    invalidateCache('calendarEvents')
    return res.json()
  },

  async update(event: any) {
    const res = await apiFetch(`${API_BASE}/calendar-events`, {
      method: 'PUT',
      body: JSON.stringify(event)
    })
    // Invalidate cache on mutation
    invalidateCache('calendarEvents')
    return res.json()
  },

  async delete(id: string) {
    await apiFetch(`${API_BASE}/calendar-events?id=${id}`, {
      method: 'DELETE'
    })
    // Invalidate cache on mutation
    invalidateCache('calendarEvents')
  }
}

// Announcements API
export const announcementsAPI = {
  async getAll(options?: { forceRefresh?: boolean }) {
    const cacheKey = 'announcements'

    if (!options?.forceRefresh && isBrowser()) {
      const cached = getFromCache(cacheKey)
      if (cached) return cached
    }

    const data = await retryAsync(async () => {
      const res = await apiFetch(`${API_BASE}/announcements`)
      return res.json()
    })

    if (isBrowser()) {
      saveToCache(cacheKey, data)
    }

    return data
  },

  async create(announcement: any) {
    const res = await apiFetch(`${API_BASE}/announcements`, {
      method: 'POST',
      body: JSON.stringify(announcement)
    })
    invalidateCache('announcements')
    return res.json()
  },

  async update(announcement: any) {
    const res = await apiFetch(`${API_BASE}/announcements`, {
      method: 'PUT',
      body: JSON.stringify(announcement)
    })
    invalidateCache('announcements')
    return res.json()
  },

  async delete(id: string) {
    await apiFetch(`${API_BASE}/announcements?id=${id}`, {
      method: 'DELETE'
    })
    invalidateCache('announcements')
  }
}

// Rule Modifications API
export const ruleModificationsAPI = {
  async getAll(options?: { forceRefresh?: boolean }) {
    const cacheKey = 'ruleModifications'

    if (!options?.forceRefresh && isBrowser()) {
      const cached = getFromCache(cacheKey)
      if (cached) return cached
    }

    const data = await retryAsync(async () => {
      const res = await apiFetch(`${API_BASE}/rule-modifications`)
      return res.json()
    })

    if (isBrowser()) {
      saveToCache(cacheKey, data)
    }

    return data
  },

  async create(modification: any) {
    const res = await apiFetch(`${API_BASE}/rule-modifications`, {
      method: 'POST',
      body: JSON.stringify(modification)
    })
    invalidateCache('ruleModifications')
    return res.json()
  },

  async update(modification: any) {
    const res = await apiFetch(`${API_BASE}/rule-modifications`, {
      method: 'PUT',
      body: JSON.stringify(modification)
    })
    invalidateCache('ruleModifications')
    return res.json()
  },

  async delete(id: string) {
    await apiFetch(`${API_BASE}/rule-modifications?id=${id}`, {
      method: 'DELETE'
    })
    invalidateCache('ruleModifications')
  }
}

// Newsletters API
export const newslettersAPI = {
  async getAll(options?: { forceRefresh?: boolean }) {
    const cacheKey = 'newsletters'

    if (!options?.forceRefresh && isBrowser()) {
      const cached = getFromCache(cacheKey)
      if (cached) return cached
    }

    const data = await retryAsync(async () => {
      const res = await apiFetch(`${API_BASE}/newsletters`)
      return res.json()
    })

    if (isBrowser()) {
      saveToCache(cacheKey, data)
    }

    return data
  },

  async create(newsletter: any) {
    const res = await apiFetch(`${API_BASE}/newsletters`, {
      method: 'POST',
      body: JSON.stringify(newsletter)
    })
    invalidateCache('newsletters')
    return res.json()
  },

  async update(newsletter: any) {
    const res = await apiFetch(`${API_BASE}/newsletters`, {
      method: 'PUT',
      body: JSON.stringify(newsletter)
    })
    invalidateCache('newsletters')
    return res.json()
  },

  async delete(id: string) {
    await apiFetch(`${API_BASE}/newsletters?id=${id}`, {
      method: 'DELETE'
    })
    invalidateCache('newsletters')
  }
}

// Members API with mock data fallback
export const membersAPI = {
  async getAll(options?: { forceRefresh?: boolean }) {
    const cacheKey = 'members'

    if (!options?.forceRefresh && isBrowser()) {
      const cached = getFromCache(cacheKey)
      if (cached) return cached
    }

    try {
      const data = await retryAsync(async () => {
        const res = await apiFetch(`${API_BASE}/members`)
        return res.json()
      })

      if (isBrowser()) {
        saveToCache(cacheKey, data)
      }

      return data
    } catch (error) {
      if (USE_MOCK_DATA) {
        console.warn('Using mock data for members (functions not available)')
        return mockMembers
      }
      throw error
    }
  },

  async getByNetlifyId(netlifyUserId: string) {
    try {
      return await retryAsync(async () => {
        const res = await apiFetch(`${API_BASE}/members?netlify_user_id=${netlifyUserId}`)
        return res.json()
      })
    } catch (error) {
      if (USE_MOCK_DATA) {
        console.warn(`Using mock data for member with netlify_user_id: ${netlifyUserId}`)
        return getMemberByNetlifyId(netlifyUserId)
      }
      throw error
    }
  },

  async getById(id: string) {
    try {
      return await retryAsync(async () => {
        const res = await apiFetch(`${API_BASE}/members?id=${id}`)
        return res.json()
      })
    } catch (error) {
      if (USE_MOCK_DATA) {
        console.warn(`Using mock data for member with id: ${id}`)
        return getMemberById(id)
      }
      throw error
    }
  },

  async create(member: any) {
    try {
      const res = await apiFetch(`${API_BASE}/members`, {
        method: 'POST',
        body: JSON.stringify(member)
      })
      invalidateCache('members')
      return res.json()
    } catch (error) {
      if (USE_MOCK_DATA) {
        console.warn('Using mock data to create member')
        return createMockMember(member)
      }
      throw error
    }
  },

  async update(member: any) {
    try {
      const res = await apiFetch(`${API_BASE}/members`, {
        method: 'PUT',
        body: JSON.stringify(member)
      })
      invalidateCache('members')
      return res.json()
    } catch (error) {
      if (USE_MOCK_DATA) {
        console.warn(`Using mock data to update member: ${member.id}`)
        return updateMockMember(member.id, member)
      }
      throw error
    }
  },

  async delete(id: string) {
    try {
      await apiFetch(`${API_BASE}/members?id=${id}`, {
        method: 'DELETE'
      })
      invalidateCache('members')
    } catch (error) {
      if (USE_MOCK_DATA) {
        console.warn(`Using mock data to delete member: ${id}`)
        deleteMockMember(id)
        return
      }
      throw error
    }
  }
}

// Member Activities API with mock data fallback
export const memberActivitiesAPI = {
  async getAll(memberId?: string, options?: { forceRefresh?: boolean }) {
    const cacheKey = memberId ? `memberActivities_${memberId}` : 'memberActivities'

    if (!options?.forceRefresh && isBrowser()) {
      const cached = getFromCache(cacheKey)
      if (cached) return cached
    }

    try {
      const data = await retryAsync(async () => {
        const url = memberId
          ? `${API_BASE}/member-activities?member_id=${memberId}`
          : `${API_BASE}/member-activities`
        const res = await apiFetch(url)
        return res.json()
      })

      if (isBrowser()) {
        saveToCache(cacheKey, data, CACHE_TTL.memberActivities)
      }

      return data
    } catch (error) {
      if (USE_MOCK_DATA) {
        console.warn(`Using mock data for activities${memberId ? ` for member: ${memberId}` : ''}`)
        return memberId ? getActivitiesByMemberId(memberId) : mockActivities
      }
      throw error
    }
  },

  async create(activity: any) {
    try {
      const res = await apiFetch(`${API_BASE}/member-activities`, {
        method: 'POST',
        body: JSON.stringify(activity)
      })
      // Invalidate all activity caches
      invalidateCache('memberActivities')
      if (activity.member_id) {
        invalidateCache(`memberActivities_${activity.member_id}`)
      }
      return res.json()
    } catch (error) {
      if (USE_MOCK_DATA) {
        console.warn('Using mock data to create activity (not persisted)')
        const newActivity = {
          id: `mock-activity-${Date.now()}`,
          ...activity,
          created_at: new Date().toISOString()
        }
        mockActivities.push(newActivity)
        return newActivity
      }
      throw error
    }
  },

  async update(activity: any) {
    const res = await apiFetch(`${API_BASE}/member-activities`, {
      method: 'PUT',
      body: JSON.stringify(activity)
    })
    invalidateCache('memberActivities')
    if (activity.member_id) {
      invalidateCache(`memberActivities_${activity.member_id}`)
    }
    return res.json()
  },

  async delete(id: string, memberId?: string) {
    await apiFetch(`${API_BASE}/member-activities?id=${id}`, {
      method: 'DELETE'
    })
    invalidateCache('memberActivities')
    if (memberId) {
      invalidateCache(`memberActivities_${memberId}`)
    }
  }
}

// Resources API
export const resourcesAPI = {
  async getAll(featured?: boolean, options?: { forceRefresh?: boolean }) {
    const cacheKey = featured ? 'resources_featured' : 'resources'

    if (!options?.forceRefresh && isBrowser()) {
      const cached = getFromCache(cacheKey)
      if (cached) return cached
    }

    const data = await retryAsync(async () => {
      const url = featured
        ? `${API_BASE}/resources?featured=true`
        : `${API_BASE}/resources`
      const res = await apiFetch(url)
      return res.json()
    })

    if (isBrowser()) {
      saveToCache(cacheKey, data)
    }

    return data
  },

  async create(resource: any) {
    const res = await apiFetch(`${API_BASE}/resources`, {
      method: 'POST',
      body: JSON.stringify(resource)
    })
    invalidateCache('resources')
    invalidateCache('resources_featured')
    return res.json()
  },

  async update(resource: any) {
    const res = await apiFetch(`${API_BASE}/resources`, {
      method: 'PUT',
      body: JSON.stringify(resource)
    })
    invalidateCache('resources')
    invalidateCache('resources_featured')
    return res.json()
  },

  async delete(id: string) {
    await apiFetch(`${API_BASE}/resources?id=${id}`, {
      method: 'DELETE'
    })
    invalidateCache('resources')
    invalidateCache('resources_featured')
  }
}

// ============================================================================
// Public Content Management APIs
// ============================================================================

import type {
  PublicNewsItem,
  PublicTrainingEvent,
  PublicResource,
  PublicPage,
  Official
} from '@/types/publicContent'

// Public News API
export const publicNewsAPI = {
  async getAll(options?: { forceRefresh?: boolean }): Promise<PublicNewsItem[]> {
    const cacheKey = 'publicNews'

    if (!options?.forceRefresh && isBrowser()) {
      const cached = getFromCache<PublicNewsItem[]>(cacheKey)
      if (cached) return cached
    }

    const data = await retryAsync(async () => {
      const res = await apiFetch(`${API_BASE}/public-news`)
      return res.json()
    })

    if (isBrowser()) {
      saveToCache(cacheKey, data)
    }

    return data
  },

  async getActive(): Promise<PublicNewsItem[]> {
    const all = await this.getAll()
    return all.filter(item => item.active)
  },

  async getBySlug(slug: string): Promise<PublicNewsItem> {
    return retryAsync(async () => {
      const res = await apiFetch(`${API_BASE}/public-news?slug=${slug}`)
      return res.json()
    })
  },

  async create(item: Partial<PublicNewsItem>): Promise<PublicNewsItem> {
    const res = await apiFetch(`${API_BASE}/public-news`, {
      method: 'POST',
      body: JSON.stringify(item)
    })
    invalidateCache('publicNews')
    return res.json()
  },

  async update(item: Partial<PublicNewsItem>): Promise<PublicNewsItem> {
    const res = await apiFetch(`${API_BASE}/public-news`, {
      method: 'PUT',
      body: JSON.stringify(item)
    })
    invalidateCache('publicNews')
    return res.json()
  },

  async delete(id: string): Promise<void> {
    await apiFetch(`${API_BASE}/public-news?id=${id}`, {
      method: 'DELETE'
    })
    invalidateCache('publicNews')
  }
}

// Public Training Events API
export const publicTrainingAPI = {
  async getAll(options?: { forceRefresh?: boolean }): Promise<PublicTrainingEvent[]> {
    const cacheKey = 'publicTraining'

    if (!options?.forceRefresh && isBrowser()) {
      const cached = getFromCache<PublicTrainingEvent[]>(cacheKey)
      if (cached) return cached
    }

    const data = await retryAsync(async () => {
      const res = await apiFetch(`${API_BASE}/public-training`)
      return res.json()
    })

    if (isBrowser()) {
      saveToCache(cacheKey, data)
    }

    return data
  },

  async getActive(): Promise<PublicTrainingEvent[]> {
    const all = await this.getAll()
    return all.filter(item => item.active)
  },

  async getUpcoming(): Promise<PublicTrainingEvent[]> {
    const active = await this.getActive()
    const now = new Date()
    return active.filter(item => new Date(item.event_date) >= now)
  },

  async getBySlug(slug: string): Promise<PublicTrainingEvent> {
    return retryAsync(async () => {
      const res = await apiFetch(`${API_BASE}/public-training?slug=${slug}`)
      return res.json()
    })
  },

  async create(item: Partial<PublicTrainingEvent>): Promise<PublicTrainingEvent> {
    const res = await apiFetch(`${API_BASE}/public-training`, {
      method: 'POST',
      body: JSON.stringify(item)
    })
    invalidateCache('publicTraining')
    return res.json()
  },

  async update(item: Partial<PublicTrainingEvent>): Promise<PublicTrainingEvent> {
    const res = await apiFetch(`${API_BASE}/public-training`, {
      method: 'PUT',
      body: JSON.stringify(item)
    })
    invalidateCache('publicTraining')
    return res.json()
  },

  async delete(id: string): Promise<void> {
    await apiFetch(`${API_BASE}/public-training?id=${id}`, {
      method: 'DELETE'
    })
    invalidateCache('publicTraining')
  }
}

// Public Resources API
export const publicResourcesAPI = {
  async getAll(options?: { forceRefresh?: boolean }): Promise<PublicResource[]> {
    const cacheKey = 'publicResources'

    if (!options?.forceRefresh && isBrowser()) {
      const cached = getFromCache<PublicResource[]>(cacheKey)
      if (cached) return cached
    }

    const data = await retryAsync(async () => {
      const res = await apiFetch(`${API_BASE}/public-resources`)
      return res.json()
    })

    if (isBrowser()) {
      saveToCache(cacheKey, data)
    }

    return data
  },

  async getActive(): Promise<PublicResource[]> {
    const all = await this.getAll()
    return all.filter(item => item.active)
  },

  async getByCategory(category: string): Promise<PublicResource[]> {
    return retryAsync(async () => {
      const res = await apiFetch(`${API_BASE}/public-resources?category=${category}`)
      return res.json()
    })
  },

  async getBySlug(slug: string): Promise<PublicResource> {
    return retryAsync(async () => {
      const res = await apiFetch(`${API_BASE}/public-resources?slug=${slug}`)
      return res.json()
    })
  },

  async create(item: Partial<PublicResource>): Promise<PublicResource> {
    const res = await apiFetch(`${API_BASE}/public-resources`, {
      method: 'POST',
      body: JSON.stringify(item)
    })
    invalidateCache('publicResources')
    return res.json()
  },

  async update(item: Partial<PublicResource>): Promise<PublicResource> {
    const res = await apiFetch(`${API_BASE}/public-resources`, {
      method: 'PUT',
      body: JSON.stringify(item)
    })
    invalidateCache('publicResources')
    return res.json()
  },

  async delete(id: string): Promise<void> {
    await apiFetch(`${API_BASE}/public-resources?id=${id}`, {
      method: 'DELETE'
    })
    invalidateCache('publicResources')
  }
}

// Public Pages API
export const publicPagesAPI = {
  async getAll(options?: { forceRefresh?: boolean }): Promise<PublicPage[]> {
    const cacheKey = 'publicPages'

    if (!options?.forceRefresh && isBrowser()) {
      const cached = getFromCache<PublicPage[]>(cacheKey)
      if (cached) return cached
    }

    const data = await retryAsync(async () => {
      const res = await apiFetch(`${API_BASE}/public-pages`)
      return res.json()
    })

    if (isBrowser()) {
      saveToCache(cacheKey, data)
    }

    return data
  },

  async getByName(pageName: string): Promise<PublicPage> {
    return retryAsync(async () => {
      const res = await apiFetch(`${API_BASE}/public-pages?page_name=${pageName}`)
      return res.json()
    })
  },

  async update(page: Partial<PublicPage>): Promise<PublicPage> {
    const res = await apiFetch(`${API_BASE}/public-pages`, {
      method: 'PUT',
      body: JSON.stringify(page)
    })
    invalidateCache('publicPages')
    return res.json()
  }
}

// ============================================================================
// Netlify Identity Admin API
// ============================================================================

export interface IdentityUser {
  id: string
  email: string
  name?: string
  confirmed: boolean
  confirmed_at?: string
  invited_at?: string
  created_at?: string
  roles: string[]
}

export interface IdentityStatus {
  exists: boolean
  id?: string
  email?: string
  name?: string
  confirmed?: boolean
  confirmed_at?: string
  invited_at?: string
  created_at?: string
  roles?: string[]
}

// Helper to get the current user's JWT token (async - refreshes if needed)
async function getIdentityToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null

  // Access netlifyIdentity from window
  const netlifyIdentity = (window as any).netlifyIdentity
  if (!netlifyIdentity) return null

  const currentUser = netlifyIdentity.currentUser()
  if (!currentUser) return null

  // Use jwt() method which auto-refreshes the token if expired
  try {
    const token = await currentUser.jwt()
    return token || null
  } catch {
    // Fall back to stored token if jwt() fails
    return currentUser.token?.access_token || null
  }
}

// Identity Admin API - requires admin/executive role
export const identityAPI = {
  // List all identity users
  async listUsers(): Promise<IdentityUser[]> {
    const token = await getIdentityToken()
    if (!token) {
      throw new AppError('Not authenticated', 'AUTH_ERROR', 401)
    }

    const res = await apiFetch(`${API_BASE}/identity-admin?action=list`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    const data = await res.json()
    return data.users || []
  },

  // Get identity status for a specific email
  async getStatus(email: string): Promise<IdentityStatus> {
    const token = await getIdentityToken()
    if (!token) {
      throw new AppError('Not authenticated', 'AUTH_ERROR', 401)
    }

    try {
      const res = await apiFetch(`${API_BASE}/identity-admin?email=${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      return await res.json()
    } catch (error) {
      // Return not found status for 404
      if (error instanceof AppError && error.statusCode === 404) {
        return { exists: false }
      }
      throw error
    }
  },

  // Send invite to a new user
  async sendInvite(email: string, name?: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const token = await getIdentityToken()
    if (!token) {
      throw new AppError('Not authenticated', 'AUTH_ERROR', 401)
    }

    const res = await apiFetch(`${API_BASE}/identity-admin`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ email, name })
    })
    return res.json()
  },

  // Resend invite for a pending user
  async resendInvite(email: string, name?: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const token = await getIdentityToken()
    if (!token) {
      throw new AppError('Not authenticated', 'AUTH_ERROR', 401)
    }

    const res = await apiFetch(`${API_BASE}/identity-admin`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ email, name, action: 'resend' })
    })
    return res.json()
  },

  // Delete a user from Identity
  async deleteUser(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const token = await getIdentityToken()
    if (!token) {
      throw new AppError('Not authenticated', 'AUTH_ERROR', 401)
    }

    const res = await apiFetch(`${API_BASE}/identity-admin?email=${encodeURIComponent(email)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return res.json()
  }
}

// Officials API
export const officialsAPI = {
  async getAll(options?: { forceRefresh?: boolean }): Promise<Official[]> {
    const cacheKey = 'officials'

    if (!options?.forceRefresh && isBrowser()) {
      const cached = getFromCache<Official[]>(cacheKey)
      if (cached) return cached
    }

    const data = await retryAsync(async () => {
      const res = await apiFetch(`${API_BASE}/officials`)
      return res.json()
    })

    if (isBrowser()) {
      saveToCache(cacheKey, data)
    }

    return data
  },

  async getActive(): Promise<Official[]> {
    const all = await this.getAll()
    return all.filter(item => item.active)
  },

  async getByLevel(level: number): Promise<Official[]> {
    return retryAsync(async () => {
      const res = await apiFetch(`${API_BASE}/officials?level=${level}`)
      return res.json()
    })
  },

  async create(item: Partial<Official>): Promise<Official> {
    const res = await apiFetch(`${API_BASE}/officials`, {
      method: 'POST',
      body: JSON.stringify(item)
    })
    invalidateCache('officials')
    return res.json()
  },

  async update(item: Partial<Official>): Promise<Official> {
    const res = await apiFetch(`${API_BASE}/officials`, {
      method: 'PUT',
      body: JSON.stringify(item)
    })
    invalidateCache('officials')
    return res.json()
  },

  async delete(id: string): Promise<void> {
    await apiFetch(`${API_BASE}/officials?id=${id}`, {
      method: 'DELETE'
    })
    invalidateCache('officials')
  }
}