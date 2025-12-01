import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const migrationSecret = process.env.MIGRATION_SECRET

interface UserToEmail {
  name: string
  email: string
}

const handler: Handler = async (event) => {
  // CORS headers
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
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  // Verify migration secret
  const authHeader = event.headers.authorization
  if (!authHeader || authHeader !== `Bearer ${migrationSecret}`) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' })
    }
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  try {
    const body = JSON.parse(event.body || '{}')
    const { users, dryRun = false } = body as { users: UserToEmail[], dryRun?: boolean }

    if (!users || !Array.isArray(users)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'users array is required' })
      }
    }

    // First, fetch all Supabase users to verify they exist
    let allSupabaseUsers: any[] = []
    let page = 1
    const perPage = 1000

    while (true) {
      const { data: { users: pageUsers }, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage
      })

      if (error) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: `Failed to fetch users: ${error.message}` })
        }
      }

      if (!pageUsers || pageUsers.length === 0) break
      allSupabaseUsers = allSupabaseUsers.concat(pageUsers)
      if (pageUsers.length < perPage) break
      page++
    }

    // Create a map of emails (lowercase) to user objects for quick lookup
    const supabaseUserMap = new Map(
      allSupabaseUsers.map(u => [u.email?.toLowerCase(), u])
    )

    const results: { email: string; status: string; error?: string }[] = []
    const siteUrl = process.env.URL || 'https://cboa.ca'

    for (const user of users) {
      try {
        const emailLower = user.email.toLowerCase()
        const supabaseUser = supabaseUserMap.get(emailLower)

        // Check if user exists in Supabase
        if (!supabaseUser) {
          results.push({ email: user.email, status: 'skipped', error: 'User not found in Supabase' })
          continue
        }

        if (dryRun) {
          results.push({ email: user.email, status: 'dry_run' })
          continue
        }

        // Send password reset email (acts as welcome/setup email for migrated users)
        const { error } = await supabaseAdmin.auth.resetPasswordForEmail(emailLower, {
          redirectTo: `${siteUrl}/auth/reset-password`
        })

        if (error) {
          results.push({ email: user.email, status: 'error', error: error.message })
        } else {
          results.push({ email: user.email, status: 'sent' })
        }

        // Rate limiting - wait 100ms between emails
        await new Promise(resolve => setTimeout(resolve, 100))

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
        summary: {
          total: users.length,
          sent,
          errors,
          skipped,
          dryRun: dryRunCount,
          supabaseUsersFound: allSupabaseUsers.length
        },
        results
      })
    }

  } catch (error: any) {
    console.error('Error sending emails:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    }
  }
}

export { handler }
