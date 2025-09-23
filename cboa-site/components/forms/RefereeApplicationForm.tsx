'use client'

import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function RefereeApplicationForm() {
  const [submitted, setSubmitted] = useState(false)
  
  if (submitted) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-cboa-blue mb-2">Application Submitted!</h3>
          <p className="text-gray-600 mb-4">
            Thank you for your interest in becoming a CBOA official. We&apos;ll review your application and contact you soon with next steps.
          </p>
          <p className="text-sm text-gray-500">
            Check your email for confirmation and further instructions.
          </p>
        </div>
      </Card>
    )
  }
  
  return (
    <Card>
      <form 
        name="referee-application"
        method="POST"
        data-netlify="true"
        netlify-honeypot="bot-field"
        action="/become-a-referee?success=true"
        onSubmit={(e) => {
          // For static export, we need to handle this differently
          const form = e.target as HTMLFormElement
          fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams(new FormData(form) as any).toString()
          })
          .then(() => setSubmitted(true))
          .catch((error) => alert('Error submitting form. Please try again.'))
          e.preventDefault()
        }}
      >
        <input type="hidden" name="form-name" value="referee-application" />
        <input type="hidden" name="bot-field" />
        
        <h3 className="text-xl font-bold text-cboa-blue mb-6">Contact Information</h3>
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
            />
          </div>
          <div>
            <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
            />
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-cboa-blue mb-6 mt-8">Eligibility Questions</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Are you over the age of 17 at the time of this submission? *
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="overSeventeen"
                value="yes"
                required
                className="mr-2"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="overSeventeen"
                value="no"
                required
                className="mr-2"
              />
              <span>No</span>
            </label>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Do you have basketball officiating experience? *
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="hasExperience"
                value="yes"
                required
                className="mr-2"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="hasExperience"
                value="no"
                required
                className="mr-2"
              />
              <span>No</span>
            </label>
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="howHeard" className="block text-sm font-semibold text-gray-700 mb-2">
            How did you hear about us? *
          </label>
          <select
            id="howHeard"
            name="howHeard"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-cboa-orange"
          >
            <option value="">Select an option</option>
            <option value="websearch">Web Search</option>
            <option value="friend">Friend</option>
            <option value="cboamember">Current CBOA Member</option>
            <option value="cmba">Calgary Minor Basketball Association</option>
            <option value="surge">Calgary Surge</option>
            <option value="kidsport">Kid Sport / Project REF</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            <strong>Next Steps:</strong> After submitting your application, we will review it and contact you with information about upcoming training sessions and orientation.
          </p>
        </div>
        
        <Button type="submit" size="lg" className="w-full">
          Submit Application
        </Button>
      </form>
    </Card>
  )
}