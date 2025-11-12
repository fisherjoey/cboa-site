// API helper functions for portal data

// Use local functions server for development
const API_BASE = process.env.NODE_ENV === 'production'
  ? '/.netlify/functions'
  : 'http://localhost:9000/.netlify/functions'

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

// Rule Modifications API
export const ruleModificationsAPI = {
  async getAll() {
    const res = await fetch(`${API_BASE}/rule-modifications`)
    if (!res.ok) throw new Error('Failed to fetch rule modifications')
    return res.json()
  },

  async create(modification: any) {
    const res = await fetch(`${API_BASE}/rule-modifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(modification)
    })
    if (!res.ok) throw new Error('Failed to create rule modification')
    return res.json()
  },

  async update(modification: any) {
    const res = await fetch(`${API_BASE}/rule-modifications`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(modification)
    })
    if (!res.ok) throw new Error('Failed to update rule modification')
    return res.json()
  },

  async delete(id: string) {
    const res = await fetch(`${API_BASE}/rule-modifications?id=${id}`, {
      method: 'DELETE'
    })
    if (!res.ok) throw new Error('Failed to delete rule modification')
  }
}

// Newsletters API
export const newslettersAPI = {
  async getAll() {
    const res = await fetch(`${API_BASE}/newsletters`)
    if (!res.ok) throw new Error('Failed to fetch newsletters')
    return res.json()
  },

  async create(newsletter: any) {
    const res = await fetch(`${API_BASE}/newsletters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newsletter)
    })
    if (!res.ok) throw new Error('Failed to create newsletter')
    return res.json()
  },

  async update(newsletter: any) {
    const res = await fetch(`${API_BASE}/newsletters`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newsletter)
    })
    if (!res.ok) throw new Error('Failed to update newsletter')
    return res.json()
  },

  async delete(id: string) {
    const res = await fetch(`${API_BASE}/newsletters?id=${id}`, {
      method: 'DELETE'
    })
    if (!res.ok) throw new Error('Failed to delete newsletter')
  }
}

// Members API
export const membersAPI = {
  async getAll() {
    const res = await fetch(`${API_BASE}/members`)
    if (!res.ok) throw new Error('Failed to fetch members')
    return res.json()
  },

  async getByNetlifyId(netlifyUserId: string) {
    const res = await fetch(`${API_BASE}/members?netlify_user_id=${netlifyUserId}`)
    if (!res.ok) throw new Error('Failed to fetch member')
    return res.json()
  },

  async getById(id: string) {
    const res = await fetch(`${API_BASE}/members?id=${id}`)
    if (!res.ok) throw new Error('Failed to fetch member')
    return res.json()
  },

  async create(member: any) {
    const res = await fetch(`${API_BASE}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member)
    })
    if (!res.ok) throw new Error('Failed to create member')
    return res.json()
  },

  async update(member: any) {
    const res = await fetch(`${API_BASE}/members`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member)
    })
    if (!res.ok) throw new Error('Failed to update member')
    return res.json()
  },

  async delete(id: string) {
    const res = await fetch(`${API_BASE}/members?id=${id}`, {
      method: 'DELETE'
    })
    if (!res.ok) throw new Error('Failed to delete member')
  }
}

// Member Activities API
export const memberActivitiesAPI = {
  async getAll(memberId?: string) {
    const url = memberId
      ? `${API_BASE}/member-activities?member_id=${memberId}`
      : `${API_BASE}/member-activities`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch activities')
    return res.json()
  },

  async create(activity: any) {
    const res = await fetch(`${API_BASE}/member-activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity)
    })
    if (!res.ok) throw new Error('Failed to create activity')
    return res.json()
  },

  async update(activity: any) {
    const res = await fetch(`${API_BASE}/member-activities`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity)
    })
    if (!res.ok) throw new Error('Failed to update activity')
    return res.json()
  },

  async delete(id: string) {
    const res = await fetch(`${API_BASE}/member-activities?id=${id}`, {
      method: 'DELETE'
    })
    if (!res.ok) throw new Error('Failed to delete activity')
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