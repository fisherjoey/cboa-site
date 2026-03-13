import { Handler } from '@netlify/functions'
import { supabase as supabaseAdmin, getCorsHeaders } from './_shared/handler'
import { checkRateLimit, getClientIp } from './_shared/rateLimit'
import { Logger } from '../../lib/logger'

export const handler: Handler = async (event) => {
  const logger = Logger.fromEvent('check-migrated-user', event)

  const origin = event.headers.origin || event.headers.Origin
  const headers = {
    ...getCorsHeaders(origin, ['GET']),
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  // Rate limit: 10 checks per minute per IP
  const clientIp = getClientIp(event.headers)
  if (checkRateLimit(clientIp, { maxRequests: 10, windowMs: 60_000, prefix: 'check-user' })) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: 'Too many requests' }) }
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  const email = event.queryStringParameters?.email

  if (!email) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email required' }) }
  }

  try {
    // Find user by email - paginate through all users
    let allUsers: any[] = []
    let page = 1
    const perPage = 1000

    while (true) {
      const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage
      })

      if (error) throw error
      if (!users || users.length === 0) break

      allUsers = allUsers.concat(users)
      if (users.length < perPage) break
      page++
    }

    const user = allUsers.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (!user) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ isMigrated: false, exists: false })
      }
    }

    // Check if user is migrated (has the flag in user_metadata)
    const isMigrated = user.user_metadata?.migrated_from_netlify === true
    const needsPasswordChange = user.user_metadata?.needs_password_change === true

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        isMigrated: isMigrated && needsPasswordChange,
        exists: true
      })
    }
  } catch (error: any) {
    logger.error('auth', 'check_migrated_user_error', 'Check migrated user error', error instanceof Error ? error : new Error(String(error)))
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}
