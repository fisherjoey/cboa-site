'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { membersAPI } from '@/lib/api'
import { IconUser, IconPhone, IconHome, IconAlertCircle, IconLogout } from '@tabler/icons-react'

interface MemberRegistrationProps {
  onComplete: () => void
}

interface ValidationErrors {
  first_name?: string
  last_name?: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
}

export default function MemberRegistration({ onComplete }: MemberRegistrationProps) {
  const { user, logout } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: 'Calgary',
    province: 'AB',
    postal_code: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear validation error when user starts typing
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const validatePhone = (phone: string): boolean => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '')
    // Must have at least 10 digits
    return digits.length >= 10
  }

  const validatePostalCode = (postalCode: string): boolean => {
    // Canadian postal code format: A1A 1A1 or A1A1A1
    const postalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/
    return postalRegex.test(postalCode.trim())
  }

  const validateName = (name: string): boolean => {
    // Must be at least 2 characters, only letters, spaces, hyphens, apostrophes
    const nameRegex = /^[A-Za-z][A-Za-z\s\-']{0,}[A-Za-z]$/
    return name.trim().length >= 2 && nameRegex.test(name.trim())
  }

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {}

    // First name validation
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required'
    } else if (!validateName(formData.first_name)) {
      errors.first_name = 'Please enter a valid first name (letters only, at least 2 characters)'
    }

    // Last name validation
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required'
    } else if (!validateName(formData.last_name)) {
      errors.last_name = 'Please enter a valid last name (letters only, at least 2 characters)'
    }

    // Phone validation
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required'
    } else if (!validatePhone(formData.phone)) {
      errors.phone = 'Please enter a valid phone number (at least 10 digits)'
    }

    // Address validation
    if (!formData.address.trim()) {
      errors.address = 'Street address is required'
    } else if (formData.address.trim().length < 5) {
      errors.address = 'Please enter a valid street address'
    }

    // City validation
    if (!formData.city.trim()) {
      errors.city = 'City is required'
    } else if (formData.city.trim().length < 2) {
      errors.city = 'Please enter a valid city name'
    }

    // Postal code validation
    if (!formData.postal_code.trim()) {
      errors.postal_code = 'Postal code is required'
    } else if (!validatePostalCode(formData.postal_code)) {
      errors.postal_code = 'Please enter a valid postal code (e.g., T2P 1J9)'
    }

    // Emergency contact name validation
    if (!formData.emergency_contact_name.trim()) {
      errors.emergency_contact_name = 'Emergency contact name is required'
    } else if (formData.emergency_contact_name.trim().length < 2) {
      errors.emergency_contact_name = 'Please enter a valid contact name'
    }

    // Emergency contact phone validation
    if (!formData.emergency_contact_phone.trim()) {
      errors.emergency_contact_phone = 'Emergency contact phone is required'
    } else if (!validatePhone(formData.emergency_contact_phone)) {
      errors.emergency_contact_phone = 'Please enter a valid phone number (at least 10 digits)'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      setError('Please correct the errors below before submitting.')
      return
    }

    setIsSubmitting(true)

    try {
      const fullName = `${formData.first_name.trim()} ${formData.last_name.trim()}`

      await membersAPI.create({
        netlify_user_id: user?.id,
        email: user?.email,
        name: fullName,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        province: formData.province,
        postal_code: formData.postal_code.trim().toUpperCase(),
        emergency_contact_name: formData.emergency_contact_name.trim(),
        emergency_contact_phone: formData.emergency_contact_phone.trim(),
        status: 'active',
        role: 'official'
      })

      onComplete()
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err.message || 'Failed to complete registration. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClassName = (fieldName: keyof ValidationErrors) => {
    const baseClass = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
    return validationErrors[fieldName]
      ? `${baseClass} border-red-500 bg-red-50`
      : `${baseClass} border-gray-300`
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconUser size={32} className="text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-gray-600 mt-2">
            Welcome to CBOA! Please fill in your information to complete your registration.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            All fields are required.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <IconAlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <IconUser size={20} />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="John"
                  className={inputClassName('first_name')}
                />
                {validationErrors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.first_name}</p>
                )}
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Smith"
                  className={inputClassName('last_name')}
                />
                {validationErrors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.last_name}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(403) 555-0100"
                className={inputClassName('phone')}
              />
              {validationErrors.phone && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
              )}
            </div>

            <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {user?.email}
              </p>
              <button
                type="button"
                onClick={logout}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <IconLogout size={16} />
                Sign out
              </button>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <IconHome size={20} />
              Address
            </h2>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Street Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main Street"
                className={inputClassName('address')}
              />
              {validationErrors.address && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={inputClassName('city')}
                />
                {validationErrors.city && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.city}</p>
                )}
              </div>

              <div>
                <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                  Province <span className="text-red-500">*</span>
                </label>
                <select
                  id="province"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="AB">AB</option>
                  <option value="BC">BC</option>
                  <option value="SK">SK</option>
                  <option value="MB">MB</option>
                  <option value="ON">ON</option>
                  <option value="QC">QC</option>
                  <option value="NB">NB</option>
                  <option value="NS">NS</option>
                  <option value="PE">PE</option>
                  <option value="NL">NL</option>
                  <option value="YT">YT</option>
                  <option value="NT">NT</option>
                  <option value="NU">NU</option>
                </select>
              </div>

              <div>
                <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="postal_code"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                  placeholder="T2P 1J9"
                  className={`${inputClassName('postal_code')} uppercase`}
                />
                {validationErrors.postal_code && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.postal_code}</p>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <IconPhone size={20} />
              Emergency Contact
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="emergency_contact_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="emergency_contact_name"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  placeholder="Jane Smith"
                  className={inputClassName('emergency_contact_name')}
                />
                {validationErrors.emergency_contact_name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.emergency_contact_name}</p>
                )}
              </div>

              <div>
                <label htmlFor="emergency_contact_phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="emergency_contact_phone"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                  placeholder="(403) 555-0100"
                  className={inputClassName('emergency_contact_phone')}
                />
                {validationErrors.emergency_contact_phone && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.emergency_contact_phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Completing Registration...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
