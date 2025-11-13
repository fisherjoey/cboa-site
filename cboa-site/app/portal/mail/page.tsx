'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { IconSend, IconUsers, IconMail, IconCheck, IconAlertCircle, IconEye, IconX } from '@tabler/icons-react'
import { useToast } from '@/contexts/ToastContext'
import { TinyMCEEditor } from '@/components/TinyMCEEditor'
import { generateCBOAEmailTemplate } from '@/lib/emailTemplate'

export default function MailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()

  const [subject, setSubject] = useState('')
  const [recipients, setRecipients] = useState<string[]>([])
  const [customEmails, setCustomEmails] = useState<string[]>([])
  const [content, setContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [rankFilter, setRankFilter] = useState('')
  const [emailSearch, setEmailSearch] = useState('')
  const [allMembers, setAllMembers] = useState<Array<{email: string, name: string}>>([])
  const [showEmailDropdown, setShowEmailDropdown] = useState(false)
  const [saveAsAnnouncement, setSaveAsAnnouncement] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Generate live preview HTML - content is now HTML from TinyMCE
  const previewHtml = content ? generateCBOAEmailTemplate({
    subject: subject || 'Email Subject',
    content: content, // TinyMCE already provides HTML
    previewText: subject
  }) : ''

  // Redirect non-executives
  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'executive') {
      router.push('/portal')
    }
  }, [user, router])

  // Fetch all members for email search
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const API_BASE = process.env.NODE_ENV === 'production'
          ? '/.netlify/functions'
          : 'http://localhost:9000/.netlify/functions'

        const response = await fetch(`${API_BASE}/members`)
        if (response.ok) {
          const data = await response.json()
          setAllMembers(data.map((m: any) => ({
            email: m.email,
            name: `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email
          })))
        }
      } catch (error) {
        console.error('Error fetching members:', error)
      }
    }
    fetchMembers()
  }, [])

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowEmailDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const recipientGroups = [
    { id: 'all', label: 'All Members', description: 'Send to all portal users', category: 'General' },
    { id: 'officials', label: 'All Officials', description: 'Officials only', category: 'General' },
    { id: 'executives', label: 'All Executives', description: 'Executive board members only', category: 'General' },
  ]

  // Group recipients by category
  const groupedRecipients = recipientGroups.reduce((acc, group) => {
    if (!acc[group.category]) {
      acc[group.category] = []
    }
    acc[group.category].push(group)
    return acc
  }, {} as Record<string, typeof recipientGroups>)

  const toggleRecipientGroup = (groupId: string) => {
    setRecipients(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    )
  }

  // Filter members based on search
  const filteredMembers = allMembers.filter(member =>
    member.email.toLowerCase().includes(emailSearch.toLowerCase()) ||
    member.name.toLowerCase().includes(emailSearch.toLowerCase())
  )

  // Check if search text is a valid email format
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const toggleEmailSelection = (email: string) => {
    setCustomEmails(prev =>
      prev.includes(email)
        ? prev.filter(e => e !== email)
        : [...prev, email]
    )
  }

  const addCustomEmail = (email: string) => {
    if (isValidEmail(email) && !customEmails.includes(email)) {
      setCustomEmails(prev => [...prev, email])
      setEmailSearch('')
      setShowEmailDropdown(false)
    }
  }

  const removeCustomEmail = (email: string) => {
    setCustomEmails(prev => prev.filter(e => e !== email))
  }

  const handleSend = async () => {
    // Validation
    if (!subject.trim()) {
      addToast('Please enter a subject line', 'error')
      return
    }

    if (recipients.length === 0 && customEmails.length === 0) {
      addToast('Please select at least one recipient group or enter email addresses', 'error')
      return
    }

    if (!content.trim()) {
      addToast('Please enter email content', 'error')
      return
    }

    setIsSending(true)

    try {
      // Content is already HTML from TinyMCE
      const htmlContent = content

      const API_BASE = process.env.NODE_ENV === 'production'
        ? '/.netlify/functions'
        : 'http://localhost:9000/.netlify/functions'

      const response = await fetch(`${API_BASE}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject,
          recipientGroups: recipients,
          customEmails: customEmails,
          htmlContent,
          rankFilter: rankFilter || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email')
      }

      addToast(`Email sent successfully to ${data.recipientCount} recipients!`, 'success')

      // Save as announcement if checkbox is selected
      if (saveAsAnnouncement) {
        try {
          await saveEmailAsAnnouncement(subject, content)
          addToast('Email sent and saved as announcement!', 'success')
        } catch (announcementError) {
          console.error('Failed to save announcement:', announcementError)
          addToast('Email sent but failed to save as announcement', 'warning')
        }
      }

      // Reset form
      setSubject('')
      setRecipients([])
      setCustomEmails([])
      setContent('')
      setRankFilter('')
      setSaveAsAnnouncement(false)
    } catch (error: any) {
      console.error('Error sending email:', error)
      addToast(error.message || 'Failed to send email', 'error')
    } finally {
      setIsSending(false)
    }
  }

  const saveEmailAsAnnouncement = async (title: string, htmlContent: string) => {
    const API_BASE = process.env.NODE_ENV === 'production'
      ? '/.netlify/functions'
      : 'http://localhost:9000/.netlify/functions'

    const response = await fetch(`${API_BASE}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        content: htmlContent, // Already HTML, no template wrapping needed
        category: 'general',
        priority: 'normal',
        author: 'CBOA Executive',
        date: new Date().toISOString()
      })
    })

    if (!response.ok) {
      throw new Error('Failed to save announcement')
    }
  }

  if (!user || (user.role !== 'admin' && user.role !== 'executive')) {
    return null
  }

  return (
    <div className="px-4 py-5 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">The Bounce</h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
          Send announcements and updates to members via email
        </p>
      </div>

      {/* Email Composer */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">

        {/* Subject Line */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Subject Line *
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Recipient Groups */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <IconUsers className="inline h-4 w-4 mr-1" />
            Recipient Groups *
          </label>
          <div className="space-y-6">
            {Object.entries(groupedRecipients).map(([category, groups]) => (
              <div key={category}>
                <h3 className="text-sm font-bold text-gray-800 mb-2 uppercase tracking-wide">
                  {category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {groups.map(group => (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => toggleRecipientGroup(group.id)}
                      className={`p-4 border-2 rounded-lg text-left transition-all ${
                        recipients.includes(group.id)
                          ? 'border-orange-600 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 text-sm">
                            {group.label}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {group.description}
                          </div>
                        </div>
                        {recipients.includes(group.id) && (
                          <IconCheck className="h-5 w-5 text-orange-600 flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter by Rank */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Filter by Rank (Optional)
          </label>
          <select
            value={rankFilter}
            onChange={(e) => setRankFilter(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">No rank filter</option>
            <option value="150+">Rank 150+</option>
            <option value="175+">Rank 175+</option>
            <option value="200+">Rank 200+</option>
            <option value="225+">Rank 225+</option>
            <option value="250+">Rank 250+</option>
            <option value="275+">Rank 275+</option>
            <option value="300+">Rank 300+</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Only send to officials with rank at or above this threshold
          </p>
        </div>

        {/* Custom Email Addresses */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Additional Email Addresses (Optional)
          </label>
          <div className="relative" ref={dropdownRef}>
            <input
              type="text"
              value={emailSearch}
              onChange={(e) => {
                setEmailSearch(e.target.value)
                setShowEmailDropdown(true)
              }}
              onFocus={() => setShowEmailDropdown(true)}
              placeholder="Search members or enter email..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />

            {/* Dropdown */}
            {showEmailDropdown && emailSearch && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {filteredMembers.length > 0 ? (
                  filteredMembers.slice(0, 10).map(member => (
                    <div
                      key={member.email}
                      onClick={() => toggleEmailSelection(member.email)}
                      className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={customEmails.includes(member.email)}
                        onChange={() => {}}
                        className="h-4 w-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{member.email}</div>
                        <div className="text-xs text-gray-500">{member.name}</div>
                      </div>
                    </div>
                  ))
                ) : isValidEmail(emailSearch) ? (
                  <div
                    onClick={() => addCustomEmail(emailSearch)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-sm"
                  >
                    <span className="text-lg">➕</span>
                    <span className="text-gray-700">Add "{emailSearch}"</span>
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No members found. Enter a valid email address to add.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Emails */}
          {customEmails.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="text-xs font-semibold text-gray-700 uppercase">
                Selected: {customEmails.length}
              </div>
              <div className="flex flex-wrap gap-2">
                {customEmails.map(email => (
                  <div
                    key={email}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg text-sm"
                  >
                    <span className="text-gray-900">{email}</span>
                    <button
                      type="button"
                      onClick={() => removeCustomEmail(email)}
                      className="text-orange-600 hover:text-orange-800 transition-colors"
                    >
                      <IconX className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Email Content Editor with Preview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Email Content *
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Use Markdown formatting. The CBOA email template will be applied automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <IconEye className="h-4 w-4" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {/* Editor */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <TinyMCEEditor
                value={content}
                onChange={setContent}
                placeholder="Write your email content here using Markdown..."
                height={500}
                preview={false}
              />
            </div>

            {/* Live Preview */}
            {showPreview && (
              <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                <div className="bg-gray-700 text-white px-4 py-2 text-sm font-semibold flex items-center gap-2">
                  <IconEye className="h-4 w-4" />
                  Email Preview
                </div>
                <div className="p-4">
                  {content ? (
                    <iframe
                      srcDoc={previewHtml}
                      className="w-full border-0 bg-white rounded"
                      style={{ height: '800px' }}
                      title="Email Preview"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-400">
                      <div className="text-center">
                        <IconMail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Start typing to see preview</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save as Announcement Checkbox */}
        <div className="border-t pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={saveAsAnnouncement}
              onChange={(e) => setSaveAsAnnouncement(e.target.checked)}
              className="h-5 w-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <div>
              <div className="font-medium text-gray-900">Also save as announcement</div>
              <div className="text-sm text-gray-600">Post this email content to News & Announcements</div>
            </div>
          </label>

          {saveAsAnnouncement && (
            <div className="mt-3 ml-8 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 mb-1">This will be saved as:</p>
              <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                <li>Title: <span className="font-medium">{subject || '(Email Subject)'}</span></li>
                <li>Category: <span className="font-medium">General</span></li>
                <li>Priority: <span className="font-medium">Normal</span></li>
              </ul>
              <p className="text-xs text-gray-500 mt-2">The content will be saved without the email template styling.</p>
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
          <IconAlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-orange-800">
            <p className="font-semibold mb-1">Email Sending Notes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Emails will be sent from: announcements@cboa.ca</li>
              <li>All sent emails will appear in the shared mailbox Sent Items</li>
              <li>Recipients are determined by their portal role and certification level</li>
              <li>Please review your content carefully before sending</li>
            </ul>
          </div>
        </div>

        {/* Send Button */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
          <button
            type="button"
            onClick={() => router.push('/portal')}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 flex items-center justify-center gap-2"
          >
            <IconX className="h-5 w-5" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSending ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Sending...
              </>
            ) : (
              <>
                <IconSend className="h-4 w-4" />
                Send Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
