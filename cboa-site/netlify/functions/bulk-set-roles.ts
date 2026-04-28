/**
 * Bulk Set User Roles (Legacy Netlify Identity)
 *
 * One-time migration utility that uses Netlify Identity admin API to
 * bulk-update user roles to "official". Requires a valid GoTrue JWT.
 *
 * Invoke locally with:
 * npx netlify functions:invoke bulk-set-roles --port 9000
 */

import { Handler } from '@netlify/functions'
import { getCorsHeaders, errorResponse } from './_shared/handler'

interface UserRecord {
  id: string
  email: string
  app_metadata?: { role?: string }
}

interface BulkResults {
  success: Array<{ email: string; oldRole: string | undefined; newRole: string }>
  failed: Array<{ email: string; error: string }>
  skipped: Array<{ email: string; currentRole: string | undefined }>
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const handler: Handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin
  const headers = getCorsHeaders(origin, ['POST'])

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return errorResponse({ code: 'method_not_allowed', headers })
  }

  const SITE_URL = process.env.URL || process.env.SITE_URL || 'https://cboa.ca'
  const GOTRUE_URL = `${SITE_URL}/.netlify/identity`

  try {
    // Get JWT token from request body or Authorization header
    let token: string | undefined

    if (event.body) {
      try {
        const body = JSON.parse(event.body)
        token = body.token
      } catch {
        // Not JSON or no token in body
      }
    }

    if (!token && event.headers.authorization) {
      token = event.headers.authorization.replace(/^Bearer\s+/i, '')
    }

    if (!token) {
      return errorResponse({ code: 'unauthorized', headers })
    }

    // Fetch all users
    const usersResponse = await fetch(`${GOTRUE_URL}/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })

    if (!usersResponse.ok) {
      throw new Error(`Failed to fetch users: ${usersResponse.status}`)
    }

    const data = await usersResponse.json()
    const usersToUpdate: UserRecord[] = data.users || data

    if (usersToUpdate.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'No matching users found', results: { success: [], failed: [], skipped: [] } })
      }
    }

    const results: BulkResults = { success: [], failed: [], skipped: [] }

    for (let i = 0; i < usersToUpdate.length; i++) {
      const user = usersToUpdate[i]
      const currentRole = user.app_metadata?.role

      if (currentRole === 'official') {
        results.skipped.push({ email: user.email, currentRole })
      } else {
        try {
          const response = await fetch(`${GOTRUE_URL}/admin/users/${user.id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ app_metadata: { role: 'official' } })
          })

          if (response.ok) {
            results.success.push({ email: user.email, oldRole: currentRole, newRole: 'official' })
          } else {
            results.failed.push({ email: user.email, error: `HTTP ${response.status}` })
          }
        } catch (error: any) {
          results.failed.push({ email: user.email, error: error.message })
        }
      }

      if (i < usersToUpdate.length - 1) await delay(200)
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Bulk role assignment complete',
        summary: {
          total: usersToUpdate.length,
          success: results.success.length,
          skipped: results.skipped.length,
          failed: results.failed.length
        },
        results
      })
    }
  } catch (error: any) {
    console.error('[BulkSetRoles] Error:', error)
    return errorResponse({ code: 'server_error', headers })
  }
}
