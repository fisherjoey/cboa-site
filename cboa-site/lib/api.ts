// API helper functions for portal data

const API_BASE = process.env.NODE_ENV === 'production' 
  ? '/.netlify/functions' 
  : 'http://localhost:8888/.netlify/functions'

// Calendar Events API
export const calendarAPI = {
  async getAll() {
    const res = await fetch(`${API_BASE}/calendar-events`)
    if (!res.ok) throw new Error('Failed to fetch events')
    return res.json()
  },

  async create(event: any) {
    const res = await fetch(`${API_BASE}/calendar-events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    })
    if (!res.ok) throw new Error('Failed to create event')
    return res.json()
  },

  async update(event: any) {
    const res = await fetch(`${API_BASE}/calendar-events`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    })
    if (!res.ok) throw new Error('Failed to update event')
    return res.json()
  },

  async delete(id: string) {
    const res = await fetch(`${API_BASE}/calendar-events?id=${id}`, {
      method: 'DELETE'
    })
    if (!res.ok) throw new Error('Failed to delete event')
  }
}

// Announcements API
export const announcementsAPI = {
  async getAll() {
    const res = await fetch(`${API_BASE}/announcements`)
    if (!res.ok) throw new Error('Failed to fetch announcements')
    return res.json()
  },

  async create(announcement: any) {
    console.log('API: Creating announcement at', `${API_BASE}/announcements`)
    console.log('API: Announcement data:', announcement)
    const res = await fetch(`${API_BASE}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(announcement)
    })
    if (!res.ok) {
      const errorText = await res.text()
      console.error('API Error Response:', errorText)
      throw new Error(`Failed to create announcement: ${res.status} ${res.statusText}`)
    }
    return res.json()
  },

  async update(announcement: any) {
    const res = await fetch(`${API_BASE}/announcements`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(announcement)
    })
    if (!res.ok) throw new Error('Failed to update announcement')
    return res.json()
  },

  async delete(id: string) {
    const res = await fetch(`${API_BASE}/announcements?id=${id}`, {
      method: 'DELETE'
    })
    if (!res.ok) throw new Error('Failed to delete announcement')
  }
}

// Resources API
export const resourcesAPI = {
  async getAll(featured?: boolean) {
    const url = featured 
      ? `${API_BASE}/resources?featured=true`
      : `${API_BASE}/resources`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch resources')
    return res.json()
  },

  async create(resource: any) {
    const res = await fetch(`${API_BASE}/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resource)
    })
    if (!res.ok) throw new Error('Failed to create resource')
    return res.json()
  },

  async update(resource: any) {
    const res = await fetch(`${API_BASE}/resources`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resource)
    })
    if (!res.ok) throw new Error('Failed to update resource')
    return res.json()
  },

  async delete(id: string) {
    const res = await fetch(`${API_BASE}/resources?id=${id}`, {
      method: 'DELETE'
    })
    if (!res.ok) throw new Error('Failed to delete resource')
  }
}