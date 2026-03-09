import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import { generateCBOAEmailTemplate } from '../../lib/emailTemplate'
import { Logger } from '../../lib/logger'
import { validateEmail } from '../../lib/emailValidation'
import { recordContactFormEmail } from '../../lib/emailHistory'
import { verifyEmailToken } from './verify-email'
import {
  CONTACT_CATEGORY_EMAILS,
  CONTACT_CATEGORY_LABELS,
  EMAIL_ANNOUNCEMENTS,
  ORG_NAME,
} from '../../lib/siteConfig'

interface ContactFormData {
  name: string
  email: string
  category: string
  subject: string
  message: string
  attachmentUrls?: string[]
  verificationToken?: string
  verificationCode?: string
  complaintDetected?: boolean
}

const categoryEmailMap = CONTACT_CATEGORY_EMAILS
const categoryLabels = CONTACT_CATEGORY_LABELS

async function getAccessToken(): Promise<string> {
  const tokenEndpoint = `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`

  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID || '',
    client_secret: process.env.MICROSOFT_CLIENT_SECRET || '',
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials'
  })

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get access token: ${error}`)
  }

  const data = await response.json()
  return data.access_token
}

async function sendContactEmail(
  accessToken: string,
  toAddress: string,
  fromName: string,
  fromEmail: string,
  subject: string,
  htmlContent: string
): Promise<void> {
  const senderEmail = EMAIL_ANNOUNCEMENTS
  const graphEndpoint = `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`

  const emailMessage = {
    message: {
      subject: subject,
      body: {
        contentType: 'HTML',
        content: htmlContent
      },
      from: {
        emailAddress: {
          address: senderEmail
        }
      },
      toRecipients: [
        {
          emailAddress: {
            address: toAddress
          }
        }
      ],
      replyTo: [
        {
          emailAddress: {
            name: fromName,
            address: fromEmail
          }
        }
      ]
    },
    saveToSentItems: true
  }

  const response = await fetch(graphEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailMessage)
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to send email: ${error}`)
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  const logger = Logger.fromEvent('contact-form', event)

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const body: ContactFormData = JSON.parse(event.body || '{}')
    const { name, email, category, subject, message } = body

    // Validation
    if (!name || name.trim().length < 2) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Name is required' })
      }
    }

    if (!email || !email.includes('@')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Valid email is required' })
      }
    }

    // Enhanced email validation: MX record lookup + disposable domain blocking
    const emailValidation = await validateEmail(email)
    if (!emailValidation.valid) {
      logger.info('email', 'contact_form_email_rejected', `Email rejected: ${emailValidation.reason}`, {
        metadata: { email, reason: emailValidation.reason, suggestion: emailValidation.suggestion }
      })
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: emailValidation.reason,
          suggestion: emailValidation.suggestion,
        })
      }
    }

    if (!category || !categoryEmailMap[category]) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Valid category is required' })
      }
    }

    if (!subject || subject.trim().length < 5) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Subject is required' })
      }
    }

    // If the client flagged this as a complaint, require email verification
    if (body.complaintDetected) {
      if (!body.verificationToken || !body.verificationCode) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Email verification is required for this type of message.' })
        }
      }
      const verification = verifyEmailToken(body.verificationToken, email, body.verificationCode)
      if (!verification.valid) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: verification.reason })
        }
      }
      logger.info('email', 'contact_form_verified', 'Complaint submission with verified email', {
        metadata: { email }
      })
    }

    if (!message || message.trim().length < 20) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message must be at least 20 characters' })
      }
    }

    // Validate attachment URLs
    if (body.attachmentUrls && body.attachmentUrls.length > 0) {
      const MAX_ATTACHMENTS = 5
      if (body.attachmentUrls.length > MAX_ATTACHMENTS) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: `Maximum ${MAX_ATTACHMENTS} attachment links allowed` })
        }
      }

      const allowedHosts = [
        'youtube.com', 'www.youtube.com', 'youtu.be',
        'vimeo.com', 'www.vimeo.com',
        'drive.google.com', 'docs.google.com',
        'dropbox.com', 'www.dropbox.com', 'dl.dropboxusercontent.com',
        'imgur.com', 'i.imgur.com',
        'onedrive.live.com', '1drv.ms',
      ]

      for (const url of body.attachmentUrls) {
        let parsed: URL
        try {
          parsed = new URL(url)
        } catch {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: `Invalid attachment URL: ${url}` })
          }
        }

        if (parsed.protocol !== 'https:') {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Attachment links must use HTTPS' })
          }
        }

        const host = parsed.hostname.toLowerCase()
        if (!allowedHosts.some(allowed => host === allowed || host.endsWith('.' + allowed))) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: `Attachment links must be from a supported service (YouTube, Vimeo, Google Drive, Dropbox, Imgur, or OneDrive)` })
          }
        }
      }

      // Check URLs against Google Safe Browsing API
      const safeBrowsingKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY
      if (safeBrowsingKey) {
        try {
          const sbResponse = await fetch(
            `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${safeBrowsingKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                client: { clientId: 'cboa-contact-form', clientVersion: '1.0.0' },
                threatInfo: {
                  threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
                  platformTypes: ['ANY_PLATFORM'],
                  threatEntryTypes: ['URL'],
                  threatEntries: body.attachmentUrls.map(url => ({ url })),
                },
              }),
            }
          )

          if (sbResponse.ok) {
            const sbData = await sbResponse.json()
            if (sbData.matches && sbData.matches.length > 0) {
              logger.info('email', 'contact_form_unsafe_url', 'Attachment URL flagged by Safe Browsing', {
                metadata: { matches: sbData.matches.map((m: { threat?: { url?: string }; threatType?: string }) => ({ url: m.threat?.url, type: m.threatType })) }
              })
              return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'One or more attachment links were flagged as unsafe. Please check your links and try again.' })
              }
            }
          }
        } catch (sbError) {
          // Don't block submission if Safe Browsing API is unreachable
          logger.error('email', 'safe_browsing_error', 'Safe Browsing API check failed', sbError instanceof Error ? sbError : new Error(String(sbError)))
        }
      }
    }

    // Check environment variables
    if (!process.env.MICROSOFT_TENANT_ID ||
        !process.env.MICROSOFT_CLIENT_ID ||
        !process.env.MICROSOFT_CLIENT_SECRET) {
      logger.error('email', 'contact_form_config_error', 'Microsoft Graph credentials not configured')
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Email service not configured' })
      }
    }

    const recipientEmail = categoryEmailMap[category]
    const categoryLabel = categoryLabels[category] || 'General Inquiry'

    logger.info('email', 'contact_form_submit', `Contact form submission: ${categoryLabel}`, {
      metadata: { category, recipientEmail, senderEmail: email }
    })

    // Build email content
    const emailContent = `
      <h1>New Contact Form Submission</h1>

      <p>A new message has been submitted through the ${ORG_NAME} website contact form.</p>

      <h2>Sender Information</h2>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600; width: 150px;">Name:</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${escapeHtml(name)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600;">Email:</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600;">Category:</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${escapeHtml(categoryLabel)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600;">Subject:</td>
          <td style="padding: 10px; border: 1px solid #e5e7eb;">${escapeHtml(subject)}</td>
        </tr>
      </table>

      <h2>Message</h2>
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
        <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(message)}</p>
      </div>

      ${body.attachmentUrls && body.attachmentUrls.length > 0 ? `
      <h2>Attachments</h2>
      <div style="background-color: #eff6ff; padding: 12px 16px; border-radius: 8px; border: 1px solid #bfdbfe;">
        ${body.attachmentUrls.map((url, i) => `
          <p style="margin: ${i > 0 ? '8px' : '0'} 0 0 0; font-size: 14px;">
            <a href="${escapeHtml(url)}" style="color: #2563eb; text-decoration: underline; word-break: break-all;">${escapeHtml(url)}</a>
          </p>
        `).join('')}
      </div>
      ` : ''}

      ${body.complaintDetected ? `
      <div style="margin-top: 20px; padding: 12px 16px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
        <p style="margin: 0; color: #166534; font-size: 14px;">
          <strong>&#10003; Verified Email</strong> &mdash; The sender verified ownership of this email address via a confirmation code before submitting.
        </p>
      </div>
      ` : ''}

      <p style="margin-top: 24px; color: #6b7280; font-size: 14px;">
        <strong>Note:</strong> You can reply directly to this email to respond to ${escapeHtml(name)}.
      </p>
    `

    const emailSubject = `[Contact Form] ${subject}`
    const emailHtml = generateCBOAEmailTemplate({
      subject: emailSubject,
      content: emailContent,
      previewText: `New contact form submission from ${name}`
    })

    // Get access token and send email
    const accessToken = await getAccessToken()
    await sendContactEmail(
      accessToken,
      recipientEmail,
      name,
      email,
      emailSubject,
      emailHtml
    )

    logger.info('email', 'contact_form_sent', `Contact form email sent to ${recipientEmail}`, {
      metadata: { category, recipientEmail, senderName: name }
    })

    // Send confirmation email to the sender (fire-and-forget)
    try {
      const confirmationContent = `
        <h1>We've Received Your Message</h1>

        <p>Hi ${escapeHtml(name)},</p>

        <p>Thank you for contacting ${ORG_NAME}. This is a confirmation that we've received your message and it has been forwarded to the appropriate person.</p>

        <h2>Your Submission</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600; width: 150px;">Category:</td>
            <td style="padding: 10px; border: 1px solid #e5e7eb;">${escapeHtml(categoryLabel)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600;">Subject:</td>
            <td style="padding: 10px; border: 1px solid #e5e7eb;">${escapeHtml(subject)}</td>
          </tr>
        </table>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(message)}</p>
        </div>

        ${body.attachmentUrls && body.attachmentUrls.length > 0 ? `
        <h2>Attachments</h2>
        <div style="background-color: #eff6ff; padding: 12px 16px; border-radius: 8px; border: 1px solid #bfdbfe;">
          ${body.attachmentUrls.map((url, i) => `
            <p style="margin: ${i > 0 ? '8px' : '0'} 0 0 0; font-size: 14px;">
              <a href="${escapeHtml(url)}" style="color: #2563eb; text-decoration: underline; word-break: break-all;">${escapeHtml(url)}</a>
            </p>
          `).join('')}
        </div>
        ` : ''}

        <p style="margin-top: 24px;">We typically respond within 1–2 business days. If your matter is urgent, please don't hesitate to follow up.</p>

        <p>Best regards,<br>
        <strong>${ORG_NAME}</strong></p>
      `

      const confirmationSubject = `We've received your message — ${ORG_NAME}`
      const confirmationHtml = generateCBOAEmailTemplate({
        subject: confirmationSubject,
        content: confirmationContent,
        previewText: `Thank you for contacting ${ORG_NAME}. We've received your message.`,
        external: true,
      })

      sendContactEmail(
        accessToken,
        email,
        ORG_NAME,
        EMAIL_ANNOUNCEMENTS,
        confirmationSubject,
        confirmationHtml
      ).catch((err) => {
        logger.error('email', 'contact_form_confirmation_error', 'Failed to send confirmation email', err instanceof Error ? err : new Error(String(err)))
      })
    } catch (confirmErr) {
      logger.error('email', 'contact_form_confirmation_error', 'Failed to build confirmation email', confirmErr instanceof Error ? confirmErr : new Error(String(confirmErr)))
    }

    // Record in email history (fire-and-forget)
    recordContactFormEmail({
      senderName: name,
      senderEmail: email,
      category,
      categoryLabel,
      recipientEmail,
      subject: emailSubject,
      message,
      htmlContent: emailHtml,
    })

    // Save to contact_submissions table for admin tracking (fire-and-forget)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey)
        supabase
          .from('contact_submissions')
          .insert({
            sender_name: name,
            sender_email: email,
            category,
            category_label: categoryLabel,
            subject: emailSubject,
            message,
            recipient_email: recipientEmail,
            attachment_urls: body.attachmentUrls && body.attachmentUrls.length > 0 ? body.attachmentUrls : null,
          })
          .then(({ error: insertError }) => {
            if (insertError) {
              console.error('[ContactForm] Failed to save submission:', insertError.message)
            }
          })
      }
    } catch (dbError) {
      console.error('[ContactForm] Failed to save submission:', dbError)
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Your message has been sent successfully'
      })
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('email', 'contact_form_error', 'Error processing contact form', error instanceof Error ? error : new Error(String(error)))

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to send message. Please try again later.'
      })
    }
  }
}
