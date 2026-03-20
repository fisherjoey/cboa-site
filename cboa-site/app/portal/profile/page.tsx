'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { membersAPI } from '@/lib/api'
import { useToast } from '@/hooks/useToast'
import { IconUser, IconMail, IconShield, IconPhone, IconHome, IconUserHeart, IconEdit, IconDeviceFloppy, IconX, IconLoader2 } from '@tabler/icons-react'

interface ProfileForm {
  name: string
  phone: string
  address: string
  city: string
  province: string
  postal_code: string
  emergency_contact_name: string
  emergency_contact_phone: string
}

const PROVINCES = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'ON', label: 'Ontario' },
  { value: 'QC', label: 'Quebec' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'YT', label: 'Yukon' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
]

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth()
  const { success, error: showError } = useToast()
  const [member, setMember] = useState<any>(null)
  const [isLoadingMember, setIsLoadingMember] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState<ProfileForm>({
    name: '',
    phone: '',
    address: '',
    city: '',
    province: 'AB',
    postal_code: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  })

  // Load member data
  useEffect(() => {
    if (!user?.id) return
    loadMember()
  }, [user?.id])

  const loadMember = async () => {
    try {
      const data = await membersAPI.getByUserId(user!.id)
      if (data) {
        setMember(data)
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          province: data.province || 'AB',
          postal_code: data.postal_code || '',
          emergency_contact_name: data.emergency_contact_name || '',
          emergency_contact_phone: data.emergency_contact_phone || '',
        })
      }
    } catch (err) {
      // Member record may not exist for this auth user
      console.error('Failed to load member data:', err)
    } finally {
      setIsLoadingMember(false)
    }
  }

  const handleSave = async () => {
    if (!member?.id) return
    if (!form.name.trim()) {
      showError('Name is required')
      return
    }

    setIsSaving(true)
    try {
      const updated = await membersAPI.update({
        id: member.id,
        ...form,
        postal_code: form.postal_code.toUpperCase(),
      })
      setMember(updated)
      setIsEditing(false)
      success('Profile updated')
    } catch (err) {
      showError('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form to current member data
    if (member) {
      setForm({
        name: member.name || '',
        phone: member.phone || '',
        address: member.address || '',
        city: member.city || '',
        province: member.province || 'AB',
        postal_code: member.postal_code || '',
        emergency_contact_name: member.emergency_contact_name || '',
        emergency_contact_phone: member.emergency_contact_phone || '',
      })
    }
    setIsEditing(false)
  }

  const formatRole = (role: string) => role.charAt(0).toUpperCase() + role.slice(1)

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'executive': return 'bg-purple-100 text-purple-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  if (authLoading || isLoadingMember) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <IconLoader2 className="h-8 w-8 text-orange-500 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p className="text-gray-600 dark:text-gray-300">Please log in to view your profile.</p>
      </div>
    )
  }

  const inputClass = "w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-orange-500 focus:outline-none"

  return (
    <div className="max-w-lg mx-auto px-3 py-3 sm:p-5">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cboa-blue to-slate-700 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <IconUser size={20} className="text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-white truncate">{member?.name || user.name}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${getRoleBadgeColor(user.role)}`}>
                    {formatRole(user.role)}
                  </span>
                  <span className="text-white/60 text-xs truncate">{user.email}</span>
                </div>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-md transition-colors flex-shrink-0"
                title="Edit Profile"
              >
                <IconEdit size={18} />
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          /* Edit Mode */
          <div className="p-4 space-y-4">
            {/* Basic Info */}
            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                <IconUser size={12} /> Basic Information
              </p>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-0.5">Full Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClass}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-0.5">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={inputClass}
                    placeholder="403-555-1234"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                <IconHome size={12} /> Address
              </p>
              <div className="space-y-2">
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className={inputClass}
                  placeholder="Street address"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className={inputClass}
                    placeholder="City"
                  />
                  <select
                    value={form.province}
                    onChange={(e) => setForm({ ...form, province: e.target.value })}
                    className={inputClass}
                  >
                    {PROVINCES.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  value={form.postal_code}
                  onChange={(e) => setForm({ ...form, postal_code: e.target.value.toUpperCase() })}
                  className={`${inputClass} max-w-[140px]`}
                  placeholder="T2P 1A1"
                  maxLength={7}
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                <IconUserHeart size={12} /> Emergency Contact
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={form.emergency_contact_name}
                  onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })}
                  className={inputClass}
                  placeholder="Contact name"
                />
                <input
                  type="tel"
                  value={form.emergency_contact_phone}
                  onChange={(e) => setForm({ ...form, emergency_contact_phone: e.target.value })}
                  className={inputClass}
                  placeholder="Contact phone"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-orange-500 text-white px-4 py-1.5 rounded-md hover:bg-orange-600 flex items-center gap-1.5 text-sm disabled:opacity-50"
              >
                {isSaving ? <IconLoader2 size={16} className="animate-spin" /> : <IconDeviceFloppy size={16} />}
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                className="text-gray-600 dark:text-gray-400 px-4 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {/* Basic Info */}
            {(member?.phone) && (
              <div className="flex items-center gap-3 px-4 py-2.5">
                <IconPhone size={16} className="text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="text-sm text-gray-900 dark:text-white">{member.phone}</p>
                </div>
              </div>
            )}

            {/* Address */}
            {(member?.address || member?.city) && (
              <div className="flex items-start gap-3 px-4 py-2.5">
                <IconHome size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Address</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {[member.address, member.city, member.province, member.postal_code].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            )}

            {/* Emergency Contact */}
            {(member?.emergency_contact_name || member?.emergency_contact_phone) && (
              <div className="flex items-center gap-3 px-4 py-2.5">
                <IconUserHeart size={16} className="text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Emergency Contact</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {[member.emergency_contact_name, member.emergency_contact_phone].filter(Boolean).join(' — ')}
                  </p>
                </div>
              </div>
            )}

            {/* Empty state if no details filled in */}
            {!member?.phone && !member?.address && !member?.city && !member?.emergency_contact_name && (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">No profile details yet.</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-2 text-sm text-orange-500 hover:text-orange-600 font-medium"
                >
                  Complete your profile
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
