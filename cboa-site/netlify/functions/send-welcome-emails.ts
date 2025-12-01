import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import { generateCBOAEmailTemplate } from '../../lib/emailTemplate'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const migrationSecret = process.env.MIGRATION_SECRET

interface UserToEmail {
  name: string
  email: string
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
    const error = await response.text()
    throw new Error(`Failed to get access token: ${error}`)
  }

  const data = await response.json()
  return data.access_token
}

// Send email via Microsoft Graph API
async function sendEmailViaGraph(
  accessToken: string,
  toEmail: string,
  subject: string,
  htmlContent: string
): Promise<void> {
  const senderEmail = process.env.MICROSOFT_SENDER_EMAIL || 'announcements@cboa.ca'
  const graphEndpoint = `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`

  const emailMessage = {
    message: {
      subject: subject,
      body: {
        contentType: 'HTML',
        content: htmlContent
      },
      from: {
        emailAddress: { address: senderEmail }
      },
      toRecipients: [
        { emailAddress: { address: toEmail } }
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

// Generate welcome email content
function generateWelcomeEmailContent(name: string, resetLink: string): string {
  const firstName = name.split(' ')[0]

  return `
    <h1>Welcome to the CBOA Member Portal!</h1>

    <p>Hi ${firstName},</p>

    <p>We've upgraded our member portal to provide you with a better experience. Your account has been migrated to our new system.</p>

    <p>To get started, please set up your new password by clicking the button below:</p>

    <p style="text-align: center;">
      <a href="${resetLink}" class="button">Set Up Your Password</a>
    </p>

    <p><strong>This link will expire in 24 hours.</strong> If you need a new link, you can request one from the login page using "Forgot Password".</p>

    <h2>What's New?</h2>
    <ul>
      <li><strong>Improved Dashboard:</strong> Quick access to your schedule, resources, and more</li>
      <li><strong>Calendar Integration:</strong> View all your assignments in one place</li>
      <li><strong>Mobile Friendly:</strong> Access the portal from any device</li>
    </ul>

    <p>If you have any questions or issues accessing your account, please contact us at <a href="mailto:webmaster@cboa.ca">webmaster@cboa.ca</a>.</p>

    <p>See you on the court!</p>

    <p>Best regards,<br>
    <strong>CBOA Executive Board</strong></p>
  `
}

const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  // Verify migration secret
  const authHeader = event.headers.authorization
  if (!authHeader || authHeader !== `Bearer ${migrationSecret}`) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) }
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    const body = JSON.parse(event.body || '{}')
    const { users, dryRun = false } = body as { users: UserToEmail[], dryRun?: boolean }

    if (!users || !Array.isArray(users)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'users array is required' }) }
    }

    // Fetch all Supabase users to verify they exist
    let allSupabaseUsers: any[] = []
    let page = 1
    const perPage = 1000

    while (true) {
      const { data: { users: pageUsers }, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage })
      if (error) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: `Failed to fetch users: ${error.message}` }) }
      }
      if (!pageUsers || pageUsers.length === 0) break
      allSupabaseUsers = allSupabaseUsers.concat(pageUsers)
      if (pageUsers.length < perPage) break
      page++
    }

    const supabaseUserMap = new Map(allSupabaseUsers.map(u => [u.email?.toLowerCase(), u]))
    const results: { email: string; status: string; error?: string }[] = []
    const siteUrl = process.env.URL || 'https://cboa.ca'

    // Get Graph API access token (only if not dry run)
    let accessToken: string | null = null
    if (!dryRun) {
      try {
        accessToken = await getAccessToken()
      } catch (err: any) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: `Graph API auth failed: ${err.message}` }) }
      }
    }

    for (const user of users) {
      try {
        const emailLower = user.email.toLowerCase()
        const supabaseUser = supabaseUserMap.get(emailLower)

        if (!supabaseUser) {
          results.push({ email: user.email, status: 'skipped', error: 'User not found in Supabase' })
          continue
        }

        if (dryRun) {
          results.push({ email: user.email, status: 'dry_run' })
          continue
        }

        // Generate password reset link via Supabase
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: emailLower,
          options: {
            redirectTo: `${siteUrl}/auth/reset-password`
          }
        })

        if (linkError || !linkData?.properties?.action_link) {
          results.push({ email: user.email, status: 'error', error: linkError?.message || 'Failed to generate reset link' })
          continue
        }

        const resetLink = linkData.properties.action_link

        // Generate email content with CBOA template
        const emailContent = generateWelcomeEmailContent(user.name, resetLink)
        const emailHtml = generateCBOAEmailTemplate({
          subject: 'Welcome to the New CBOA Member Portal',
          content: emailContent,
          previewText: 'Set up your password to access the new CBOA Member Portal'
        })

        // Send via Microsoft Graph
        await sendEmailViaGraph(accessToken!, user.email, 'Welcome to the New CBOA Member Portal', emailHtml)
        results.push({ email: user.email, status: 'sent' })

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200))

      } catch (err: any) {
        results.push({ email: user.email, status: 'error', error: err.message })
      }
    }

    const sent = results.filter(r => r.status === 'sent').length
    const errors = results.filter(r => r.status === 'error').length
    const skipped = results.filter(r => r.status === 'skipped').length
    const dryRunCount = results.filter(r => r.status === 'dry_run').length

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        summary: { total: users.length, sent, errors, skipped, dryRun: dryRunCount, supabaseUsersFound: allSupabaseUsers.length },
        results
      })
    }

  } catch (error: any) {
    console.error('Error sending emails:', error)
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) }
  }
}

export { handler }
