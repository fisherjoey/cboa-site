'use client'

import { useState, useEffect } from 'react'
import { useRole } from '@/contexts/RoleContext'
import { membersAPI, memberActivitiesAPI } from '@/lib/api'
import { IconUser, IconSearch, IconPlus, IconEdit, IconTrash, IconCalendar, IconX, IconCheck, IconFilter } from '@tabler/icons-react'
import { useToast } from '@/hooks/useToast'
import { ToastContainer } from '@/components/Toast'
import {
  validateMemberForm,
  validateActivityForm,
  getFieldError,
  hasErrors,
  formatValidationErrors
} from '@/lib/portalValidation'
import { parseAPIError, sanitize, ValidationError } from '@/lib/errorHandling'

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
  id?: string
  member_id: string
  activity_type: string
  activity_date: string
  activity_data?: Record<string, any>
  notes?: string
}

export default function MembersPage() {
  const { user } = useRole()
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [memberActivities, setMemberActivities] = useState<Activity[]>([])
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState<Member>({
    name: '',
    email: '',
    phone: '',
    certification_level: '',
    status: 'active',
    role: 'official'
  })
  const [activityForm, setActivityForm] = useState<Activity>({
    member_id: '',
    activity_type: 'meeting',
    activity_date: new Date().toISOString().split('T')[0],
    notes: ''
  })
  const { toasts, dismissToast, success, error, warning, info } = useToast()
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [activityValidationErrors, setActivityValidationErrors] = useState<ValidationError[]>([])

  // Check if user has admin/executive access
  const hasAccess = user.role === 'admin' || user.role === 'executive'

  useEffect(() => {
    if (hasAccess) {
      loadMembers()
    }
  }, [hasAccess])

  useEffect(() => {
    filterMembers()
  }, [members, searchQuery, statusFilter])

  const loadMembers = async () => {
    try {
      setIsLoading(true)
      const data = await membersAPI.getAll()
      setMembers(data)
    } catch (error) {
      const errorMessage = parseAPIError(error)
      error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const filterMembers = () => {
    let filtered = [...members]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query) ||
        (member.phone && member.phone.includes(query))
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(member => member.status === statusFilter)
    }

    setFilteredMembers(filtered)
  }

  const handleViewMember = async (member: Member) => {
    setSelectedMember(member)
    setEditForm(member)
    setIsEditing(false)
    setShowMemberModal(true)

    // Load member activities
    if (member.id) {
      try {
        const activities = await memberActivitiesAPI.getAll(member.id)
        setMemberActivities(activities)
      } catch (error) {
        console.error('Error loading activities:', error)
      }
    }
  }

  const handleAddMember = () => {
    setSelectedMember(null)
    setEditForm({
      name: '',
      email: '',
      phone: '',
      certification_level: '',
      status: 'active',
      role: 'official'
    })
    setIsEditing(true)
    setShowMemberModal(true)
    setMemberActivities([])
  }

  const handleEditMember = () => {
    setIsEditing(true)
  }

  const handleSaveMember = async () => {
    try {
      setIsSaving(true)
      setValidationErrors([])

      // Validate form
      const errors = validateMemberForm(editForm)
      if (hasErrors(errors)) {
        setValidationErrors(errors)
        error(formatValidationErrors(errors))
        return
      }

      // Sanitize text inputs
      const sanitizedForm = {
        ...editForm,
        name: sanitize(editForm.name),
        email: sanitize(editForm.email),
        phone: editForm.phone ? sanitize(editForm.phone) : undefined,
        address: editForm.address ? sanitize(editForm.address) : undefined,
        city: editForm.city ? sanitize(editForm.city) : undefined,
        province: editForm.province ? sanitize(editForm.province) : undefined,
        postal_code: editForm.postal_code ? sanitize(editForm.postal_code) : undefined,
        emergency_contact_name: editForm.emergency_contact_name ? sanitize(editForm.emergency_contact_name) : undefined,
        emergency_contact_phone: editForm.emergency_contact_phone ? sanitize(editForm.emergency_contact_phone) : undefined,
        notes: editForm.notes ? sanitize(editForm.notes) : undefined
      }

      if (selectedMember?.id) {
        // Update existing member
        await membersAPI.update({
          id: selectedMember.id,
          ...sanitizedForm
        })
        success('Member updated successfully')
      } else {
        // Create new member
        await membersAPI.create(sanitizedForm)
        success('Member created successfully')
      }

      await loadMembers()
      setShowMemberModal(false)
      setIsEditing(false)
      setValidationErrors([])
    } catch (error) {
      const errorMessage = parseAPIError(error)
      error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this member? This will also delete all their activities.')) {
      return
    }

    try {
      await membersAPI.delete(memberId)
      success('Member deleted successfully')
      await loadMembers()
      setShowMemberModal(false)
    } catch (error) {
      const errorMessage = parseAPIError(error)
      error(errorMessage)
    }
  }

  const handleAddActivity = () => {
    if (!selectedMember?.id) return

    setActivityForm({
      member_id: selectedMember.id,
      activity_type: 'meeting',
      activity_date: new Date().toISOString().split('T')[0],
      notes: ''
    })
    setShowActivityModal(true)
  }

  const handleSaveActivity = async () => {
    try {
      setIsSaving(true)
      setActivityValidationErrors([])

      // Validate form
      const errors = validateActivityForm(activityForm)
      if (hasErrors(errors)) {
        setActivityValidationErrors(errors)
        error(formatValidationErrors(errors))
        return
      }

      await memberActivitiesAPI.create(activityForm)
      success('Activity added successfully')

      // Reload activities
      if (selectedMember?.id) {
        const activities = await memberActivitiesAPI.getAll(selectedMember.id)
        setMemberActivities(activities)
      }

      setShowActivityModal(false)
      setActivityValidationErrors([])
    } catch (error) {
      const errorMessage = parseAPIError(error)
      error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) {
      return
    }

    try {
      await memberActivitiesAPI.delete(activityId)
      success('Activity deleted successfully')

      // Reload activities
      if (selectedMember?.id) {
        const activities = await memberActivitiesAPI.getAll(selectedMember.id)
        setMemberActivities(activities)
      }
    } catch (error) {
      const errorMessage = parseAPIError(error)
      error(errorMessage)
    }
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading members...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Members Directory</h1>
          <button
            onClick={handleAddMember}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <IconPlus size={20} />
            Add Member
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <IconFilter size={20} className="text-gray-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Members Count */}
        <p className="text-gray-600 mb-4">
          Showing {filteredMembers.length} of {members.length} members
        </p>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => handleViewMember(member)}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <IconUser size={24} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{member.name}</h3>
                <p className="text-sm text-gray-600 truncate">{member.email}</p>
                {member.phone && (
                  <p className="text-sm text-gray-600">{member.phone}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    member.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {member.status || 'active'}
                  </span>
                  {member.certification_level && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {member.certification_level}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">No members found.</p>
        </div>
      )}

      {/* Member Detail Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? (selectedMember ? 'Edit Member' : 'Add Member') : 'Member Details'}
              </h2>
              <div className="flex gap-2">
                {!isEditing && selectedMember && (
                  <>
                    <button
                      onClick={handleEditMember}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <IconEdit size={20} />
                      Edit
                    </button>
                    <button
                      onClick={() => selectedMember.id && handleDeleteMember(selectedMember.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <IconTrash size={20} />
                      Delete
                    </button>
                  </>
                )}
                {isEditing && (
                  <>
                    <button
                      onClick={handleSaveMember}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <IconCheck size={20} />
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    {selectedMember && (
                      <button
                        onClick={() => setIsEditing(false)}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
                      >
                        <IconX size={20} />
                        Cancel
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={() => setShowMemberModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <IconX size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Name *</label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            getFieldError(validationErrors, 'name')
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                          required
                        />
                        {getFieldError(validationErrors, 'name') && (
                          <p className="mt-1 text-sm text-red-600">
                            {getFieldError(validationErrors, 'name')}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-900">{selectedMember?.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Email *</label>
                    {isEditing ? (
                      <>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            getFieldError(validationErrors, 'email')
                              ? 'border-red-500'
                              : 'border-gray-300'
                          }`}
                          required
                        />
                        {getFieldError(validationErrors, 'email') && (
                          <p className="mt-1 text-sm text-red-600">
                            {getFieldError(validationErrors, 'email')}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-gray-900">{selectedMember?.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phone || ''}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{selectedMember?.phone || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">NOCP Level</label>
                    {isEditing ? (
                      <select
                        value={editForm.certification_level || ''}
                        onChange={(e) => setEditForm({ ...editForm, certification_level: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                      <p className="text-gray-900">{selectedMember?.certification_level || 'Not specified'}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Rank</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.rank || ''}
                        onChange={(e) => setEditForm({ ...editForm, rank: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter numeric rank"
                        min="0"
                      />
                    ) : (
                      <p className="text-gray-900">{selectedMember?.rank || 'Not set'}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                    {isEditing ? (
                      <select
                        value={editForm.status || 'active'}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    ) : (
                      <p className="text-gray-900">{selectedMember?.status || 'active'}</p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Address</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.address || ''}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{selectedMember?.address || 'Not provided'}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">City</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.city || ''}
                          onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{selectedMember?.city || 'N/A'}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Province</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.province || ''}
                          onChange={(e) => setEditForm({ ...editForm, province: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{selectedMember?.province || 'N/A'}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Postal Code</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.postal_code || ''}
                        onChange={(e) => setEditForm({ ...editForm, postal_code: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">{selectedMember?.postal_code || 'Not provided'}</p>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold text-gray-900 mb-3">Emergency Contact</h4>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Name</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.emergency_contact_name || ''}
                            onChange={(e) => setEditForm({ ...editForm, emergency_contact_name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-gray-900">{selectedMember?.emergency_contact_name || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={editForm.emergency_contact_phone || ''}
                            onChange={(e) => setEditForm({ ...editForm, emergency_contact_phone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-gray-900">{selectedMember?.emergency_contact_phone || 'Not provided'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                {isEditing ? (
                  <textarea
                    value={editForm.notes || ''}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Add notes about this member..."
                  />
                ) : (
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedMember?.notes || 'No notes'}</p>
                )}
              </div>

              {/* Activities Section - Only show when viewing existing member */}
              {selectedMember && !isEditing && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Activity History</h3>
                    <button
                      onClick={handleAddActivity}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      <IconPlus size={16} />
                      Add Activity
                    </button>
                  </div>

                  {memberActivities.length === 0 ? (
                    <p className="text-gray-600">No activities recorded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {memberActivities.map((activity) => (
                        <div key={activity.id} className="flex items-start justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <IconCalendar size={16} className="text-gray-500" />
                              <span className="font-semibold text-gray-900 capitalize">{activity.activity_type}</span>
                              <span className="text-gray-600 text-sm">
                                {new Date(activity.activity_date).toLocaleDateString()}
                              </span>
                            </div>
                            {activity.notes && (
                              <p className="text-gray-700 text-sm mt-1 ml-6">{activity.notes}</p>
                            )}
                          </div>
                          <button
                            onClick={() => activity.id && handleDeleteActivity(activity.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <IconTrash size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Add Activity</h2>
              <button
                onClick={() => setShowActivityModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <IconX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Activity Type *</label>
                <select
                  value={activityForm.activity_type}
                  onChange={(e) => setActivityForm({ ...activityForm, activity_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="game">Regular Game</option>
                  <option value="special_game">Special Game (Finals, Zones, Provincials)</option>
                  <option value="training">Training</option>
                  <option value="evaluation">Evaluation</option>
                  <option value="suspension">Suspension</option>
                  <option value="meeting">Meeting</option>
                  <option value="certification">Certification</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Date *</label>
                <input
                  type="date"
                  value={activityForm.activity_date}
                  onChange={(e) => setActivityForm({ ...activityForm, activity_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Notes</label>
                <textarea
                  value={activityForm.notes || ''}
                  onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Add details about this activity..."
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveActivity}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Activity'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
