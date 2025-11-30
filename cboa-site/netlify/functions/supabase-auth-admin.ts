import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || 'https://cboa.ca'

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export interface AuthUser {
  id: string
  email: string
  name?: string
  confirmed: boolean
  confirmed_at?: string
  invited_at?: string
  created_at?: string
  role?: string
  roles?: string[]
}

// ============================================================================
// Microsoft Graph Email Integration
// ============================================================================

async function getMicrosoftAccessToken(): Promise<string> {
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
    throw new Error(`Failed to get Microsoft access token: ${error}`)
  }

  const data = await response.json()
  return data.access_token
}

async function sendEmailViaMicrosoftGraph(
  accessToken: string,
  toEmail: string,
  subject: string,
  htmlContent: string
): Promise<void> {
  const senderEmail = process.env.MICROSOFT_SENDER_EMAIL || 'announcements@cboa.ca'
  const graphEndpoint = `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`

  const emailMessage = {
    message: {
      subject,
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
    throw new Error(`Failed to send email via Microsoft Graph: ${error}`)
  }
}

// ============================================================================
// Email Templates
// ============================================================================

function generateInviteEmailHtml(inviteUrl: string, name?: string): string {
  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <tr>
    <td style="padding: 20px 10px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff;" align="center">
        <!-- Header -->
        <tr>
          <td style="background-color: #1f2937; padding: 24px 20px; border-bottom: 3px solid #F97316; text-align: center;">
            <img src="https://i.imgur.com/BQe360J.png" alt="CBOA Logo" style="max-width: 70px; height: auto; display: inline-block; margin-bottom: 12px;">
            <h1 style="color: #ffffff; margin: 0 0 4px 0; font-size: 18px; font-weight: 700; letter-spacing: -0.5px; line-height: 1.3;">Calgary Basketball Officials Association</h1>
            <p style="color: #ffffff; margin: 0; font-size: 14px; font-weight: 500; opacity: 0.95;">Excellence in Basketball Officiating</p>
          </td>
        </tr>
        <!-- Main Content -->
        <tr>
          <td style="padding: 30px 20px; color: #333333; font-size: 16px; line-height: 1.6;">
            <h1 style="color: #003DA5; font-size: 24px; margin-top: 0; margin-bottom: 16px; font-weight: 700; line-height: 1.3;">You're Invited to Join CBOA!</h1>
            <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">${name ? `Hi ${name},` : 'Hello,'}</p>
            <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">You have been invited to create an account on the <strong style="color: #003DA5; font-weight: 600;">Calgary Basketball Officials Association</strong> member portal.</p>
            <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">As a member, you'll have access to:</p>
            <ul style="margin: 0 0 16px 0; padding-left: 20px;">
              <li style="margin-bottom: 8px; font-size: 16px; line-height: 1.5;"><strong style="color: #003DA5;">Resources</strong> - Training materials, rulebooks, and guides</li>
              <li style="margin-bottom: 8px; font-size: 16px; line-height: 1.5;"><strong style="color: #003DA5;">The Bounce</strong> - Our official newsletter</li>
              <li style="margin-bottom: 8px; font-size: 16px; line-height: 1.5;"><strong style="color: #003DA5;">Calendar</strong> - Upcoming events and training sessions</li>
              <li style="margin-bottom: 8px; font-size: 16px; line-height: 1.5;"><strong style="color: #003DA5;">Rule Modifications</strong> - League-specific rule changes</li>
            </ul>
            <p style="text-align: center; margin: 24px 0;">
              <a href="${inviteUrl}" style="display: inline-block; padding: 14px 28px; min-height: 44px; background-color: #F97316; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Accept Invitation</a>
            </p>
            <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">If you have any questions about your membership, please don't hesitate to contact us.</p>
            <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">We look forward to having you on our team!</p>
            <p style="margin: 0; font-size: 16px; line-height: 1.6;">Best regards,<br><strong style="color: #003DA5; font-weight: 600;">CBOA Executive Board</strong></p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background-color: #1F2937; color: #D1D5DB; padding: 30px 20px; text-align: center; font-size: 14px; line-height: 1.7; border-top: 3px solid #F97316;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #ffffff;">Calgary Basketball Officials Association</p>
            <p style="margin: 0 0 15px 0;">Calgary, Alberta, Canada</p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 20px auto;">
              <tr>
                <td style="padding: 0 8px;"><a href="${siteUrl}" style="color: #F97316; text-decoration: none; font-size: 14px;">Website</a></td>
                <td style="padding: 0 8px;"><a href="${siteUrl}/portal" style="color: #F97316; text-decoration: none; font-size: 14px;">Member Portal</a></td>
                <td style="padding: 0 8px;"><a href="mailto:info@cboa.ca" style="color: #F97316; text-decoration: none; font-size: 14px;">Contact Us</a></td>
              </tr>
            </table>
            <p style="margin: 20px 0 0 0; font-size: 13px; color: #9ca3af;">&copy; 2025 Calgary Basketball Officials Association. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
  `.trim()
}

function generatePasswordResetEmailHtml(resetUrl: string, email: string): string {
  return `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <tr>
    <td style="padding: 20px 10px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff;" align="center">
        <!-- Header -->
        <tr>
          <td style="background-color: #1f2937; padding: 24px 20px; border-bottom: 3px solid #F97316; text-align: center;">
            <img src="https://i.imgur.com/BQe360J.png" alt="CBOA Logo" style="max-width: 70px; height: auto; display: inline-block; margin-bottom: 12px;">
            <h1 style="color: #ffffff; margin: 0 0 4px 0; font-size: 18px; font-weight: 700; letter-spacing: -0.5px; line-height: 1.3;">Calgary Basketball Officials Association</h1>
            <p style="color: #ffffff; margin: 0; font-size: 14px; font-weight: 500; opacity: 0.95;">Excellence in Basketball Officiating</p>
          </td>
        </tr>
        <!-- Main Content -->
        <tr>
          <td style="padding: 30px 20px; color: #333333; font-size: 16px; line-height: 1.6;">
            <h1 style="color: #003DA5; font-size: 24px; margin-top: 0; margin-bottom: 16px; font-weight: 700; line-height: 1.3;">Reset Your Password</h1>
            <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">We received a request to reset the password for your <strong style="color: #003DA5; font-weight: 600;">CBOA Member Portal</strong> account associated with <strong style="color: #003DA5;">${email}</strong>.</p>
            <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">Click the button below to set a new password:</p>
            <p style="text-align: center; margin: 24px 0;">
              <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; min-height: 44px; background-color: #F97316; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password</a>
            </p>
            <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">This link will expire in 24 hours for security purposes.</p>
            <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px 16px; margin: 16px 0;">
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #92400E;"><strong>Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
            <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">If you're having trouble with the button above, copy and paste this link into your browser:</p>
            <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; word-break: break-all; color: #6b7280;">${resetUrl}</p>
            <p style="margin: 0; font-size: 16px; line-height: 1.6;">Best regards,<br><strong style="color: #003DA5; font-weight: 600;">CBOA Executive Board</strong></p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background-color: #1F2937; color: #D1D5DB; padding: 30px 20px; text-align: center; font-size: 14px; line-height: 1.7; border-top: 3px solid #F97316;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #ffffff;">Calgary Basketball Officials Association</p>
            <p style="margin: 0 0 15px 0;">Calgary, Alberta, Canada</p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 20px auto;">
              <tr>
                <td style="padding: 0 8px;"><a href="${siteUrl}" style="color: #F97316; text-decoration: none; font-size: 14px;">Website</a></td>
                <td style="padding: 0 8px;"><a href="${siteUrl}/portal" style="color: #F97316; text-decoration: none; font-size: 14px;">Member Portal</a></td>
                <td style="padding: 0 8px;"><a href="mailto:info@cboa.ca" style="color: #F97316; text-decoration: none; font-size: 14px;">Contact Us</a></td>
              </tr>
            </table>
            <p style="margin: 20px 0 0 0; font-size: 13px; color: #9ca3af;">&copy; 2025 Calgary Basketball Officials Association. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
  `.trim()
}

// ============================================================================
// Main Handler
// ============================================================================

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  // Verify authorization - require a valid JWT token
  const authHeader = event.headers.authorization || event.headers.Authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized - No token provided' })
    }
  }

  const token = authHeader.split(' ')[1]

  try {
    // Verify the token and get the user
    const { data: { user: callerUser }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !callerUser) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized - Invalid token' })
      }
    }

    // Check if caller has admin role
    const callerRole = callerUser.app_metadata?.role || callerUser.user_metadata?.role
    if (callerRole !== 'admin' && callerRole !== 'Admin') {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Forbidden - Admin access required' })
      }
    }

    switch (event.httpMethod) {
      case 'GET': {
        const { action, email } = event.queryStringParameters || {}

        // List all users
        if (action === 'list') {
          const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()

          if (error) throw error

          const mappedUsers: AuthUser[] = users.map(user => ({
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.full_name || user.user_metadata?.name,
            confirmed: !!user.email_confirmed_at,
            confirmed_at: user.email_confirmed_at || undefined,
            invited_at: user.invited_at || undefined,
            created_at: user.created_at,
            role: user.app_metadata?.role || user.user_metadata?.role,
            roles: user.app_metadata?.roles || user.user_metadata?.roles || []
          }))

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ users: mappedUsers })
          }
        }

        // Get status for a specific email
        if (email) {
          const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()

          if (error) throw error

          const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

          if (!user) {
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({ exists: false })
            }
          }

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              exists: true,
              id: user.id,
              email: user.email,
              name: user.user_metadata?.full_name || user.user_metadata?.name,
              confirmed: !!user.email_confirmed_at,
              confirmed_at: user.email_confirmed_at,
              invited_at: user.invited_at,
              created_at: user.created_at,
              role: user.app_metadata?.role || user.user_metadata?.role,
              roles: user.app_metadata?.roles || user.user_metadata?.roles || []
            })
          }
        }

        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing action or email parameter' })
        }
      }

      case 'POST': {
        const body = JSON.parse(event.body || '{}')
        const { email, name, role, action: postAction } = body

        if (!email) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Email is required' })
          }
        }

        // Check Microsoft Graph credentials
        if (!process.env.MICROSOFT_TENANT_ID || !process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET) {
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Microsoft Graph credentials not configured' })
          }
        }

        // Resend invite - delete existing user and re-invite
        if (postAction === 'resend') {
          // Find and delete existing user
          const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
          const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

          if (existingUser) {
            await supabaseAdmin.auth.admin.deleteUser(existingUser.id)
          }

          // Generate new invite link (without sending Supabase's email)
          const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'invite',
            email,
            options: {
              data: {
                full_name: name,
                name: name,
                role: role || 'official'
              },
              redirectTo: `${siteUrl}/auth/callback`
            }
          })

          if (linkError) {
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({ success: false, error: linkError.message })
            }
          }

          // Send email via Microsoft Graph
          const msToken = await getMicrosoftAccessToken()
          const inviteUrl = linkData.properties?.action_link || ''
          const emailHtml = generateInviteEmailHtml(inviteUrl, name)

          await sendEmailViaMicrosoftGraph(
            msToken,
            email,
            "You're Invited to Join CBOA!",
            emailHtml
          )

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              message: `Invite resent to ${email}`,
              user: linkData.user
            })
          }
        }

        // Send new invite
        // First check if user already exists
        const { data: { users: existingUsers } } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = existingUsers.find(u => u.email?.toLowerCase() === email.toLowerCase())

        if (existingUser) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: 'User already exists' })
          }
        }

        // Generate invite link (without sending Supabase's email)
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'invite',
          email,
          options: {
            data: {
              full_name: name,
              name: name,
              role: role || 'official'
            },
            redirectTo: `${siteUrl}/auth/callback`
          }
        })

        if (linkError) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: linkError.message })
          }
        }

        // Send email via Microsoft Graph
        const msToken = await getMicrosoftAccessToken()
        const inviteUrl = linkData.properties?.action_link || ''
        const emailHtml = generateInviteEmailHtml(inviteUrl, name)

        await sendEmailViaMicrosoftGraph(
          msToken,
          email,
          "You're Invited to Join CBOA!",
          emailHtml
        )

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: `Invite sent to ${email}`,
            user: linkData.user
          })
        }
      }

      case 'PUT': {
        const body = JSON.parse(event.body || '{}')
        const { userId, role, name, action: putAction, email } = body

        // Handle password reset request
        if (putAction === 'reset_password' && email) {
          // Check Microsoft Graph credentials
          if (!process.env.MICROSOFT_TENANT_ID || !process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET) {
            return {
              statusCode: 500,
              headers,
              body: JSON.stringify({ error: 'Microsoft Graph credentials not configured' })
            }
          }

          // Generate password reset link
          const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email,
            options: {
              redirectTo: `${siteUrl}/auth/callback`
            }
          })

          if (linkError) {
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({ success: false, error: linkError.message })
            }
          }

          // Send email via Microsoft Graph
          const msToken = await getMicrosoftAccessToken()
          const resetUrl = linkData.properties?.action_link || ''
          const emailHtml = generatePasswordResetEmailHtml(resetUrl, email)

          await sendEmailViaMicrosoftGraph(
            msToken,
            email,
            'Reset Your CBOA Portal Password',
            emailHtml
          )

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              message: `Password reset email sent to ${email}`
            })
          }
        }

        // Update user metadata
        if (!userId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'userId is required' })
          }
        }

        const updates: any = {}

        if (role) {
          updates.app_metadata = { role }
        }

        if (name) {
          updates.user_metadata = { full_name: name, name }
        }

        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, updates)

        if (error) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: error.message })
          }
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'User updated successfully',
            user: data.user
          })
        }
      }

      case 'DELETE': {
        const { email } = event.queryStringParameters || {}

        if (!email) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Email is required' })
          }
        }

        // Find user by email
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
        const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

        if (!user) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ success: false, error: 'User not found' })
          }
        }

        const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)

        if (error) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: error.message })
          }
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: `User ${email} deleted successfully`
          })
        }
      }

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        }
    }
  } catch (error) {
    console.error('Supabase Auth Admin API error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error'
      })
    }
  }
}
