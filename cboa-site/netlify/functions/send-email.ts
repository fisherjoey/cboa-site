import { createHandler, supabase } from './_shared/handler'
import { generateCBOAEmailTemplate } from '../../lib/emailTemplate'
import { recordBulkEmail } from '../../lib/emailHistory'
import { EMAIL_ANNOUNCEMENTS } from '../../lib/siteConfig'

/**
 * Normalize URLs in HTML content to ensure they have proper protocols.
 */
function normalizeUrlsInHtml(html: string): string {
  return html.replace(
    /href="(?!(https?:\/\/|mailto:|tel:|#|\/))/gi,
    'href="https://'
  )
}

interface EmailRequest {
  subject: string
  recipientGroups: string[]
  customEmails: string[]
  htmlContent: string
  rankFilter?: string
}

interface MemberRecord {
  email: string
  role: string
  certification_level?: string
  rank?: number
}

// Get Microsoft Graph access token
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
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  })

  if (!response.ok) {
    throw new Error('Failed to get Microsoft access token')
  }

  const data = await response.json()
  return data.access_token
}

// Send email via Microsoft Graph API
async function sendEmailViaGraph(
  accessToken: string,
  toAddresses: string[],
  subject: string,
  htmlContent: string
): Promise<void> {
  const senderEmail = EMAIL_ANNOUNCEMENTS
  const graphEndpoint = `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`

  const batchSize = 500
  const batches = []
  for (let i = 0; i < toAddresses.length; i += batchSize) {
    batches.push(toAddresses.slice(i, i + batchSize))
  }

  for (const batch of batches) {
    const emailMessage = {
      message: {
        subject,
        body: { contentType: 'HTML', content: htmlContent },
        from: { emailAddress: { address: senderEmail } },
        toRecipients: [{ emailAddress: { address: senderEmail } }],
        bccRecipients: batch.map(email => ({ emailAddress: { address: email } }))
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
      throw new Error('Failed to send email via Microsoft Graph')
    }
  }
}

// Get member emails from Supabase based on recipient groups
async function getRecipientEmails(
  recipientGroups: string[],
  customEmails: string[],
  rankFilter?: string
): Promise<string[]> {
  const emails = new Set<string>()

  customEmails.forEach(email => {
    if (email && email.includes('@')) {
      emails.add(email.toLowerCase())
    }
  })

  if (recipientGroups.length === 0) {
    return Array.from(emails)
  }

  // Paginate — PostgREST defaults to 1000 rows. Once the membership
  // grows past 1000, an unpaginated fetch would silently miss everyone
  // beyond row 1000 and the bulk send would stop including them.
  const PAGE = 1000
  const members: Array<{ email: string | null, role: string | null, certification_level: string | null, rank: string | null }> = []
  for (let start = 0; ; start += PAGE) {
    const { data, error } = await supabase
      .from('members')
      .select('email, role, certification_level, rank')
      .range(start, start + PAGE - 1)
    if (error) {
      console.error('Failed to fetch members:', error.message)
      return Array.from(emails)
    }
    if (!data || data.length === 0) break
    members.push(...data)
    if (data.length < PAGE) break
  }

  for (const member of members) {
    if (!member.email) continue

    let shouldInclude = false

    for (const group of recipientGroups) {
      if (group === 'all') { shouldInclude = true; break }
      if (group === 'officials' && member.role === 'official') { shouldInclude = true; break }
      if (group === 'executives' && member.role === 'executive') { shouldInclude = true; break }
      if (group === 'admins' && member.role === 'admin') { shouldInclude = true; break }
      if (group === 'evaluators' && member.role === 'evaluator') { shouldInclude = true; break }
      if (group === 'mentors' && member.role === 'mentor') { shouldInclude = true; break }
      if (group.startsWith('level') && member.certification_level) {
        const levelNum = group.replace('level', '')
        if (member.certification_level.includes(levelNum)) { shouldInclude = true; break }
      }
    }

    if (shouldInclude && rankFilter) {
      if (member.rank === undefined || member.rank === null) {
        shouldInclude = false
      } else {
        const threshold = parseInt(rankFilter.replace('+', ''))
        if (member.rank < threshold) shouldInclude = false
      }
    }

    if (shouldInclude) {
      emails.add(member.email.toLowerCase())
    }
  }

  return Array.from(emails)
}

export const handler = createHandler({
  name: 'send-email',
  methods: ['POST'],
  auth: 'admin',
  handler: async ({ event, logger, user }) => {
    const requestBody: EmailRequest = JSON.parse(event.body || '{}')
    const { subject, recipientGroups, customEmails, htmlContent, rankFilter } = requestBody

    logger.info('email', 'send_email_start', `Sending bulk email: ${subject}`, {
      metadata: { subject, recipientGroups, customEmailCount: customEmails?.length || 0, rankFilter }
    })

    // Validation
    if (!subject?.trim()) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Subject is required' }) }
    }
    if (!htmlContent?.trim()) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email content is required' }) }
    }
    if ((!recipientGroups || recipientGroups.length === 0) && (!customEmails || customEmails.length === 0)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'At least one recipient is required' }) }
    }

    if (!process.env.MICROSOFT_TENANT_ID || !process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET) {
      logger.error('email', 'send_email_config_error', 'Microsoft Graph credentials not configured')
      return { statusCode: 500, body: JSON.stringify({ error: 'Email service not configured' }) }
    }

    try {
      const recipientEmails = await getRecipientEmails(
        recipientGroups || [],
        customEmails || [],
        rankFilter
      )

      if (recipientEmails.length === 0) {
        return { statusCode: 400, body: JSON.stringify({ error: 'No valid recipients found' }) }
      }

      logger.info('email', 'send_email_recipients', `Found ${recipientEmails.length} recipients`, {
        metadata: { recipientCount: recipientEmails.length, recipientGroups }
      })

      const accessToken = await getAccessToken()
      const normalizedContent = normalizeUrlsInHtml(htmlContent)
      const emailHtml = generateCBOAEmailTemplate({
        subject,
        content: normalizedContent,
        previewText: subject
      })

      await sendEmailViaGraph(accessToken, recipientEmails, subject, emailHtml)

      await recordBulkEmail({
        sentByEmail: user!.email,
        subject,
        htmlContent: emailHtml,
        recipientCount: recipientEmails.length,
        recipientList: recipientEmails,
        recipientGroups: recipientGroups || [],
        rankFilter,
        status: 'sent',
      })

      await logger.audit('EMAIL_SENT', 'email', null, {
        actorId: user!.id,
        actorEmail: user!.email,
        newValues: { subject, recipientCount: recipientEmails.length, recipientGroups },
        description: `Bulk email sent: "${subject}" to ${recipientEmails.length} recipients`
      })

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          recipientCount: recipientEmails.length,
          message: `Email sent successfully to ${recipientEmails.length} recipients`
        })
      }
    } catch (error: any) {
      await recordBulkEmail({
        sentByEmail: user!.email,
        subject: requestBody.subject || 'Unknown',
        htmlContent: requestBody.htmlContent || '',
        recipientCount: 0,
        recipientList: [],
        recipientGroups: requestBody.recipientGroups || [],
        rankFilter: requestBody.rankFilter,
        status: 'failed',
        errorMessage: error.message || 'Unknown error',
      })

      // Re-throw so the shared handler logs it and returns generic error
      throw error
    }
  }
})
