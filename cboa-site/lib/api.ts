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

// Use /api route which redirects to /.netlify/functions (configured in netlify.toml)
// This bypasses Next.js routing conflicts
const API_BASE = '/api'

// Flag to enable mock data when functions aren't available
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || process.env.NODE_ENV === 'development'

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
  async getAll() {
    return retryAsync(async () => {
      const res = await apiFetch(`${API_BASE}/calendar-events`)
      return res.json()
    })
  },

  async create(event: any) {
    const res = await apiFetch(`${API_BASE}/calendar-events`, {
      method: 'POST',
      body: JSON.stringify(event)
    })
    return res.json()
  },

  async update(event: any) {
    const res = await apiFetch(`${API_BASE}/calendar-events`, {
      method: 'PUT',
      body: JSON.stringify(event)
    })
    return res.json()
  },

  async delete(id: string) {
    await apiFetch(`${API_BASE}/calendar-events?id=${id}`, {
      method: 'DELETE'
    })
  }
}

// Announcements API
export const announcementsAPI = {
  async getAll() {
    return retryAsync(async () => {
      const res = await apiFetch(`${API_BASE}/announcements`)
      return res.json()
    })
  },

  async create(announcement: any) {
    const res = await apiFetch(`${API_BASE}/announcements`, {
      method: 'POST',
      body: JSON.stringify(announcement)
    })
    return res.json()
  },

  async update(announcement: any) {
    const res = await apiFetch(`${API_BASE}/announcements`, {
      method: 'PUT',
      body: JSON.stringify(announcement)
    })
    return res.json()
  },

  async delete(id: string) {
    await apiFetch(`${API_BASE}/announcements?id=${id}`, {
      method: 'DELETE'
    })
  }
}

// Rule Modifications API
export const ruleModificationsAPI = {
  async getAll() {
    return retryAsync(async () => {
      const res = await apiFetch(`${API_BASE}/rule-modifications`)
      return res.json()
    })
  },

  async create(modification: any) {
    const res = await apiFetch(`${API_BASE}/rule-modifications`, {
      method: 'POST',
      body: JSON.stringify(modification)
    })
    return res.json()
  },

  async update(modification: any) {
    const res = await apiFetch(`${API_BASE}/rule-modifications`, {
      method: 'PUT',
      body: JSON.stringify(modification)
    })
    return res.json()
  },

  async delete(id: string) {
    await apiFetch(`${API_BASE}/rule-modifications?id=${id}`, {
      method: 'DELETE'
    })
  }
}

// Newsletters API
export const newslettersAPI = {
  async getAll() {
    return retryAsync(async () => {
      const res = await apiFetch(`${API_BASE}/newsletters`)
      return res.json()
    })
  },

  async create(newsletter: any) {
    const res = await apiFetch(`${API_BASE}/newsletters`, {
      method: 'POST',
      body: JSON.stringify(newsletter)
    })
    return res.json()
  },

  async update(newsletter: any) {
    const res = await apiFetch(`${API_BASE}/newsletters`, {
      method: 'PUT',
      body: JSON.stringify(newsletter)
    })
    return res.json()
  },

  async delete(id: string) {
    await apiFetch(`${API_BASE}/newsletters?id=${id}`, {
      method: 'DELETE'
    })
  }
}

// Members API with mock data fallback
export const membersAPI = {
  async getAll() {
    try {
      return await retryAsync(async () => {
        const res = await apiFetch(`${API_BASE}/members`)
        return res.json()
      })
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
  async getAll(memberId?: string) {
    try {
      return await retryAsync(async () => {
        const url = memberId
          ? `${API_BASE}/member-activities?member_id=${memberId}`
          : `${API_BASE}/member-activities`
        const res = await apiFetch(url)
        return res.json()
      })
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
      return res.json()
    } catch (error) {
      if (USE_MOCK_DATA) {
        console.warn('Using mock data to create activity (not persisted)')
        // Create a mock activity that won't persist
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
    return res.json()
  },

  async delete(id: string) {
    await apiFetch(`${API_BASE}/member-activities?id=${id}`, {
      method: 'DELETE'
    })
  }
}

// Resources API
export const resourcesAPI = {
  async getAll(featured?: boolean) {
    return retryAsync(async () => {
      const url = featured
        ? `${API_BASE}/resources?featured=true`
        : `${API_BASE}/resources`
      const res = await apiFetch(url)
      return res.json()
    })
  },

  async create(resource: any) {
    const res = await apiFetch(`${API_BASE}/resources`, {
      method: 'POST',
      body: JSON.stringify(resource)
    })
    return res.json()
  },

  async update(resource: any) {
    const res = await apiFetch(`${API_BASE}/resources`, {
      method: 'PUT',
      body: JSON.stringify(resource)
    })
    return res.json()
  },

  async delete(id: string) {
    await apiFetch(`${API_BASE}/resources?id=${id}`, {
      method: 'DELETE'
    })
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
  async getAll(): Promise<PublicNewsItem[]> {
    return retryAsync(async () => {
      const res = await apiFetch(`${API_BASE}/public-news`)
      return res.json()
    })
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
    return res.json()
  },

  async update(item: Partial<PublicNewsItem>): Promise<PublicNewsItem> {
    const res = await apiFetch(`${API_BASE}/public-news`, {
      method: 'PUT',
      body: JSON.stringify(item)
    })
    return res.json()
  },

  async delete(id: string): Promise<void> {
    await apiFetch(`${API_BASE}/public-news?id=${id}`, {
      method: 'DELETE'
    })
  }
}

// Public Training Events API
export const publicTrainingAPI = {
  async getAll(): Promise<PublicTrainingEvent[]> {
    return retryAsync(async () => {
      const res = await apiFetch(`${API_BASE}/public-training`)
      return res.json()
    })
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
    return res.json()
  },

  async update(item: Partial<PublicTrainingEvent>): Promise<PublicTrainingEvent> {
    const res = await apiFetch(`${API_BASE}/public-training`, {
      method: 'PUT',
      body: JSON.stringify(item)
    })
    return res.json()
  },

  async delete(id: string): Promise<void> {
    await apiFetch(`${API_BASE}/public-training?id=${id}`, {
      method: 'DELETE'
    })
  }
}

// Public Resources API
export const publicResourcesAPI = {
  async getAll(): Promise<PublicResource[]> {
    return retryAsync(async () => {
      const res = await apiFetch(`${API_BASE}/public-resources`)
      return res.json()
    })
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
    return res.json()
  },

  async update(item: Partial<PublicResource>): Promise<PublicResource> {
    const res = await apiFetch(`${API_BASE}/public-resources`, {
      method: 'PUT',
      body: JSON.stringify(item)
    })
    return res.json()
  },

  async delete(id: string): Promise<void> {
    await apiFetch(`${API_BASE}/public-resources?id=${id}`, {
      method: 'DELETE'
    })
  }
}

// Public Pages API
export const publicPagesAPI = {
  async getAll(): Promise<PublicPage[]> {
    return retryAsync(async () => {
      const res = await apiFetch(`${API_BASE}/public-pages`)
      return res.json()
    })
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
    return res.json()
  }
}

// Officials API
export const officialsAPI = {
  async getAll(): Promise<Official[]> {
    return retryAsync(async () => {
      const res = await apiFetch(`${API_BASE}/officials`)
      return res.json()
    })
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
    return res.json()
  },

  async update(item: Partial<Official>): Promise<Official> {
    const res = await apiFetch(`${API_BASE}/officials`, {
      method: 'PUT',
      body: JSON.stringify(item)
    })
    return res.json()
  },

  async delete(id: string): Promise<void> {
    await apiFetch(`${API_BASE}/officials?id=${id}`, {
      method: 'DELETE'
    })
  }
}