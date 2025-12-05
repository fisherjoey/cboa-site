import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import { Logger } from '../../lib/logger'

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
  // Calculate expiration time (24 hours from now) in Mountain Time
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const expiresFormatted = expiresAt.toLocaleString('en-US', {
    timeZone: 'America/Edmonton',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

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
            <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #666666; text-align: center;"><em>This link expires on ${expiresFormatted} (Mountain Time).</em></p>
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
  const logger = Logger.fromEvent('supabase-auth-admin', event)

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
    logger.warn('auth', 'unauthorized_request', 'Request without token')
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
      logger.warn('auth', 'invalid_token', 'Invalid or expired token')
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized - Invalid token' })
      }
    }

    // Check if caller has admin role
    const callerRole = callerUser.app_metadata?.role || callerUser.user_metadata?.role
    if (callerRole !== 'admin' && callerRole !== 'Admin') {
      logger.warn('auth', 'forbidden_access', 'Non-admin attempted admin operation', {
        userEmail: callerUser.email,
        metadata: { role: callerRole }
      })
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Forbidden - Admin access required' })
      }
    }

    // Set caller context for subsequent logs
    logger.info('auth', 'admin_request', `Admin request: ${event.httpMethod}`, {
      userEmail: callerUser.email,
      userId: callerUser.id
    })

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

        // Bulk resend invites to all members who haven't signed in yet
        if (postAction === 'resend_pending') {
          logger.info('auth', 'resend_pending_start', 'Starting bulk resend of pending invites', {
            userEmail: callerUser.email
          })

          // Check Microsoft Graph credentials
          if (!process.env.MICROSOFT_TENANT_ID || !process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET) {
            return {
              statusCode: 500,
              headers,
              body: JSON.stringify({ error: 'Microsoft Graph credentials not configured' })
            }
          }

          // Get all members who haven't signed in yet
          const { data: pendingMembers, error: queryError } = await supabaseAdmin
            .from('members')
            .select('id, name, email, role, user_id')
            .eq('status', 'active')
            .not('user_id', 'is', null)

          if (queryError) {
            logger.error('auth', 'resend_pending_query_failed', 'Failed to query pending members', new Error(queryError.message))
            return {
              statusCode: 500,
              headers,
              body: JSON.stringify({ error: 'Failed to query members' })
            }
          }

          // Get all auth users to check who hasn't signed in
          const { data: { users: authUsers } } = await supabaseAdmin.auth.admin.listUsers()

          // Filter to members whose auth user has never signed in
          const pendingInvites = pendingMembers?.filter(member => {
            const authUser = authUsers.find(u => u.id === member.user_id)
            return authUser && !authUser.last_sign_in_at
          }) || []

          if (pendingInvites.length === 0) {
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify({
                success: true,
                message: 'No pending invites to resend',
                results: []
              })
            }
          }

          const results: Array<{ email: string; success: boolean; message: string }> = []
          const msToken = await getMicrosoftAccessToken()

          for (const member of pendingInvites) {
            try {
              // Find and delete existing auth user
              const existingUser = authUsers.find(u => u.email?.toLowerCase() === member.email.toLowerCase())
              if (existingUser) {
                await supabaseAdmin.auth.admin.deleteUser(existingUser.id)
              }

              // Generate new invite link
              const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
                type: 'invite',
                email: member.email,
                options: {
                  data: {
                    full_name: member.name,
                    name: member.name,
                    role: member.role || 'official'
                  },
                  redirectTo: `${siteUrl}/auth/callback`
                }
              })

              if (linkError) {
                results.push({ email: member.email, success: false, message: linkError.message })
                continue
              }

              // Update member's user_id
              if (linkData.user?.id) {
                await supabaseAdmin
                  .from('members')
                  .update({ user_id: linkData.user.id })
                  .eq('id', member.id)
              }

              // Send email
              const inviteUrl = linkData.properties?.action_link || ''
              const emailHtml = generateInviteEmailHtml(inviteUrl, member.name)
              await sendEmailViaMicrosoftGraph(msToken, member.email, "You're Invited to Join CBOA!", emailHtml)

              results.push({ email: member.email, success: true, message: 'Invite resent' })
            } catch (err: any) {
              results.push({ email: member.email, success: false, message: err.message || 'Unknown error' })
            }
          }

          // Audit log
          const successCount = results.filter(r => r.success).length
          await logger.audit('INVITE', 'auth_user', null, {
            actorId: callerUser.id,
            actorEmail: callerUser.email!,
            actorRole: callerRole,
            description: `Bulk resent ${successCount}/${results.length} pending invites`
          })

          logger.info('auth', 'resend_pending_complete', `Bulk resend complete: ${successCount}/${results.length} successful`, {
            userEmail: callerUser.email,
            metadata: { total: results.length, successful: successCount }
          })

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              message: `Resent ${successCount} of ${results.length} invites`,
              results
            })
          }
        }

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
          logger.info('auth', 'resend_invite_start', `Resending invite to ${email}`, {
            userEmail: callerUser.email,
            metadata: { targetEmail: email, name }
          })

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
            logger.error('auth', 'resend_invite_failed', `Failed to generate invite link for ${email}`, new Error(linkError.message))
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({ success: false, error: linkError.message })
            }
          }

          // Update the member record's user_id to match the new auth user
          if (linkData.user?.id) {
            const { error: updateError } = await supabaseAdmin
              .from('members')
              .update({ user_id: linkData.user.id })
              .eq('email', email.toLowerCase())

            if (updateError) {
              logger.warn('auth', 'resend_invite_member_update_failed',
                `Failed to update member user_id for ${email}`, {
                userEmail: callerUser.email,
                metadata: { targetEmail: email, error: updateError.message }
              })
            } else {
              logger.info('auth', 'resend_invite_member_updated',
                `Updated member user_id for ${email}`, {
                userEmail: callerUser.email,
                metadata: { targetEmail: email, newUserId: linkData.user.id }
              })
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

          // Audit log
          await logger.audit('INVITE', 'auth_user', linkData.user?.id || null, {
            actorId: callerUser.id,
            actorEmail: callerUser.email!,
            actorRole: callerRole,
            targetUserEmail: email,
            newValues: { email, name, role: role || 'official' },
            description: `Resent invite to ${email}`
          })

          logger.info('auth', 'resend_invite_success', `Invite resent to ${email}`, {
            userEmail: callerUser.email,
            metadata: { targetEmail: email }
          })

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
        logger.info('auth', 'invite_user_start', `Inviting new user ${email}`, {
          userEmail: callerUser.email,
          metadata: { targetEmail: email, name, role: role || 'official' }
        })

        // First check if user already exists
        const { data: { users: existingUsers } } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = existingUsers.find(u => u.email?.toLowerCase() === email.toLowerCase())

        if (existingUser) {
          logger.warn('auth', 'invite_user_exists', `User already exists: ${email}`, {
            userEmail: callerUser.email,
            metadata: { targetEmail: email }
          })
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
          logger.error('auth', 'invite_user_failed', `Failed to generate invite for ${email}`, new Error(linkError.message))
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

        // Audit log
        await logger.audit('INVITE', 'auth_user', linkData.user?.id || null, {
          actorId: callerUser.id,
          actorEmail: callerUser.email!,
          actorRole: callerRole,
          targetUserEmail: email,
          newValues: { email, name, role: role || 'official' },
          description: `Invited new user ${email}`
        })

        logger.info('auth', 'invite_user_success', `Invite sent to ${email}`, {
          userEmail: callerUser.email,
          metadata: { targetEmail: email, userId: linkData.user?.id }
        })

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
          logger.info('auth', 'password_reset_start', `Initiating password reset for ${email}`, {
            userEmail: callerUser.email,
            metadata: { targetEmail: email }
          })

          // Check Microsoft Graph credentials
          if (!process.env.MICROSOFT_TENANT_ID || !process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET) {
            logger.error('auth', 'password_reset_config_error', 'Microsoft Graph credentials not configured')
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
            logger.error('auth', 'password_reset_failed', `Failed to generate reset link for ${email}`, new Error(linkError.message))
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

          // Audit log
          await logger.audit('PASSWORD_RESET', 'auth_user', linkData.user?.id || null, {
            actorId: callerUser.id,
            actorEmail: callerUser.email!,
            actorRole: callerRole,
            targetUserEmail: email,
            description: `Password reset email sent to ${email}`
          })

          logger.info('auth', 'password_reset_success', `Password reset email sent to ${email}`, {
            userEmail: callerUser.email,
            metadata: { targetEmail: email }
          })

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

        logger.info('auth', 'update_user_start', `Updating user ${userId}`, {
          userEmail: callerUser.email,
          metadata: { targetUserId: userId, role, name }
        })

        const updates: any = {}

        if (role) {
          updates.app_metadata = { role }
        }

        if (name) {
          updates.user_metadata = { full_name: name, name }
        }

        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, updates)

        if (error) {
          logger.error('auth', 'update_user_failed', `Failed to update user ${userId}`, new Error(error.message))
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: error.message })
          }
        }

        // Audit log for role change
        if (role) {
          await logger.audit('ROLE_CHANGE', 'auth_user', userId, {
            actorId: callerUser.id,
            actorEmail: callerUser.email!,
            actorRole: callerRole,
            targetUserId: userId,
            targetUserEmail: data.user?.email,
            newValues: { role },
            description: `Changed role to ${role} for user ${data.user?.email || userId}`
          })
        }

        // Audit log for name update
        if (name) {
          await logger.audit('UPDATE', 'auth_user', userId, {
            actorId: callerUser.id,
            actorEmail: callerUser.email!,
            actorRole: callerRole,
            targetUserId: userId,
            targetUserEmail: data.user?.email,
            newValues: { name },
            description: `Updated name to ${name} for user ${data.user?.email || userId}`
          })
        }

        logger.info('auth', 'update_user_success', `User ${userId} updated`, {
          userEmail: callerUser.email,
          metadata: { targetUserId: userId, targetEmail: data.user?.email }
        })

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

        logger.info('auth', 'delete_user_start', `Deleting user ${email}`, {
          userEmail: callerUser.email,
          metadata: { targetEmail: email }
        })

        // Find user by email
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
        const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())

        if (!user) {
          logger.warn('auth', 'delete_user_not_found', `User not found: ${email}`, {
            userEmail: callerUser.email,
            metadata: { targetEmail: email }
          })
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ success: false, error: 'User not found' })
          }
        }

        const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id)

        if (error) {
          logger.error('auth', 'delete_user_failed', `Failed to delete user ${email}`, new Error(error.message))
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ success: false, error: error.message })
          }
        }

        // Audit log
        await logger.audit('DELETE', 'auth_user', user.id, {
          actorId: callerUser.id,
          actorEmail: callerUser.email!,
          actorRole: callerRole,
          targetUserId: user.id,
          targetUserEmail: email,
          oldValues: { email, name: user.user_metadata?.name, role: user.app_metadata?.role },
          description: `Deleted user ${email}`
        })

        logger.info('auth', 'delete_user_success', `User ${email} deleted`, {
          userEmail: callerUser.email,
          metadata: { targetEmail: email, targetUserId: user.id }
        })

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
    logger.error('auth', 'api_error', 'Supabase Auth Admin API error', error instanceof Error ? error : new Error(String(error)))
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error'
      })
    }
  }
}
