// API helper functions for portal data
import { retryAsync, parseAPIError, AppError } from './errorHandling'

// Use local functions server for development
const API_BASE = process.env.NODE_ENV === 'production'
  ? '/.netlify/functions'
  : 'http://localhost:9000/.netlify/functions'

// Enhanced fetch with better error handling
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

// Members API
export const membersAPI = {
  async getAll() {
    return retryAsync(async () => {
      const res = await apiFetch(`${API_BASE}/members`)
      return res.json()
    })
  },

  async getByNetlifyId(netlifyUserId: string) {
    return retryAsync(async () => {
      const res = await apiFetch(`${API_BASE}/members?netlify_user_id=${netlifyUserId}`)
      return res.json()
    })
  },

  async getById(id: string) {
    return retryAsync(async () => {
      const res = await apiFetch(`${API_BASE}/members?id=${id}`)
      return res.json()
    })
  },

  async create(member: any) {
    const res = await apiFetch(`${API_BASE}/members`, {
      method: 'POST',
      body: JSON.stringify(member)
    })
    return res.json()
  },

  async update(member: any) {
    const res = await apiFetch(`${API_BASE}/members`, {
      method: 'PUT',
      body: JSON.stringify(member)
    })
    return res.json()
  },

  async delete(id: string) {
    await apiFetch(`${API_BASE}/members?id=${id}`, {
      method: 'DELETE'
    })
  }
}

// Member Activities API
export const memberActivitiesAPI = {
  async getAll(memberId?: string) {
    return retryAsync(async () => {
      const url = memberId
        ? `${API_BASE}/member-activities?member_id=${memberId}`
        : `${API_BASE}/member-activities`
      const res = await apiFetch(url)
      return res.json()
    })
  },

  async create(activity: any) {
    const res = await apiFetch(`${API_BASE}/member-activities`, {
      method: 'POST',
      body: JSON.stringify(activity)
    })
    return res.json()
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