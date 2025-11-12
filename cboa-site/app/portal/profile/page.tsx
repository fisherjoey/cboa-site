'use client'

import { useState, useEffect } from 'react'
import { useRole } from '@/contexts/RoleContext'
import { membersAPI, memberActivitiesAPI } from '@/lib/api'
import { IconUser, IconMail, IconPhone, IconMapPin, IconCalendar, IconEdit, IconCheck, IconX } from '@tabler/icons-react'

interface Member {
  id?: string
  netlify_user_id?: string
  name: string
  email: string
  phone?: string
  certification_level?: string
  rank?: number
  status?: string
  role?: string
  address?: string
  city?: string
  province?: string
  postal_code?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  custom_fields?: Record<string, any>
  notes?: string
  created_at?: string
  updated_at?: string
}

interface Activity {
  id: string
  member_id: string
  activity_type: string
  activity_date: string
  activity_data?: Record<string, any>
  notes?: string
  created_at: string
}

export default function ProfilePage() {
  const { user } = useRole()
  const [member, setMember] = useState<Member | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editForm, setEditForm] = useState<Member>({
    name: '',
    email: '',
    phone: '',
    certification_level: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    notes: ''
  })

  useEffect(() => {
    if (user) {
      loadMemberProfile()
    }
  }, [user])

  const loadMemberProfile = async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)

      // Try to get member by netlify_user_id
      const existingMember = await membersAPI.getByNetlifyId(user.id)

      if (existingMember && existingMember.id) {
        // Member exists
        setMember(existingMember)
        setEditForm(existingMember)

        // Load activities
        const memberActivities = await memberActivitiesAPI.getAll(existingMember.id)
        setActivities(memberActivities)
      } else {
        // Member doesn't exist, create new record
        const newMember = {
          netlify_user_id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'New Member',
          email: user.email || '',
          status: 'active',
          role: 'official'
        }

        const created = await membersAPI.create(newMember)
        setMember(created)
        setEditForm(created)
      }
    } catch (error) {
      console.error('Error loading member profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    if (member) {
      setEditForm(member)
    }
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!member?.id) return

    try {
      setIsSaving(true)
      const updated = await membersAPI.update({
        id: member.id,
        ...editForm
      })
      setMember(updated)
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: keyof Member, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Unable to load profile. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <IconEdit size={20} />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <IconCheck size={20} />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                <IconX size={20} />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Basic Information</h2>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <IconUser size={16} />
                Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{member.name}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <IconMail size={16} />
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{member.email}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <IconPhone size={16} />
                Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editForm.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{member.phone || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                NOCP Level
              </label>
              {isEditing ? (
                <select
                  value={editForm.certification_level || ''}
                  onChange={(e) => handleChange('certification_level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select level</option>
                  <option value="None">None</option>
                  <option value="Level 1">Level 1</option>
                  <option value="Level 2">Level 2</option>
                  <option value="Level 3">Level 3</option>
                  <option value="Level 4">Level 4</option>
                  <option value="Level 5">Level 5</option>
                </select>
              ) : (
                <p className="text-gray-900">{member.certification_level || 'Not specified'}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Rank
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={editForm.rank || ''}
                  onChange={(e) => handleChange('rank', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter numeric rank"
                  min="0"
                />
              ) : (
                <p className="text-gray-900">{member.rank || 'Not set'}</p>
              )}
            </div>
          </div>

          {/* Address & Emergency Contact */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">Contact Information</h2>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <IconMapPin size={16} />
                Address
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{member.address || 'Not provided'}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">City</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{member.city || 'N/A'}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Province</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.province || ''}
                    onChange={(e) => handleChange('province', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{member.province || 'N/A'}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Postal Code</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.postal_code || ''}
                  onChange={(e) => handleChange('postal_code', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{member.postal_code || 'Not provided'}</p>
              )}
            </div>

            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Emergency Contact</h3>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.emergency_contact_name || ''}
                      onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{member.emergency_contact_name || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.emergency_contact_phone || ''}
                      onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{member.emergency_contact_phone || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="mt-6 pt-6 border-t">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Notes</h2>
          {isEditing ? (
            <textarea
              value={editForm.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add any personal notes..."
            />
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">{member.notes || 'No notes added yet.'}</p>
          )}
        </div>
      </div>

      {/* Activity History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <IconCalendar size={24} />
          <h2 className="text-2xl font-bold text-gray-900">Activity History</h2>
        </div>

        {activities.length === 0 ? (
          <p className="text-gray-600">No activities recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div key={activity.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-gray-900 capitalize">{activity.activity_type}</span>
                    <span className="text-gray-600 text-sm ml-2">
                      {new Date(activity.activity_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {activity.notes && (
                  <p className="text-gray-700 text-sm mt-1">{activity.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
