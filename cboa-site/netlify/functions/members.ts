import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    switch (event.httpMethod) {
      case 'GET': {
        const { netlify_user_id, user_id, id, email } = event.queryStringParameters || {}

        // Get member by email
        if (email) {
          const { data, error } = await supabase
            .from('members')
            .select('*')
            .eq('email', email)
            .single()

          // PGRST116 = no rows found - return null, not an error
          if (error && error.code !== 'PGRST116') throw error

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data || null)
          }
        }

        // Get member by Supabase Auth user ID
        if (user_id) {
          const { data, error } = await supabase
            .from('members')
            .select('*')
            .eq('user_id', user_id)
            .single()

          // PGRST116 = no rows found - return null, not an error
          if (error && error.code !== 'PGRST116') throw error

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data || null)
          }
        }

        // Get member by Netlify user ID (legacy support)
        if (netlify_user_id) {
          const { data, error } = await supabase
            .from('members')
            .select('*')
            .eq('netlify_user_id', netlify_user_id)
            .single()

          // PGRST116 = no rows found - return null, not an error
          if (error && error.code !== 'PGRST116') throw error

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data || null)
          }
        }

        // Get member by ID
        if (id) {
          const { data, error } = await supabase
            .from('members')
            .select('*')
            .eq('id', id)
            .single()

          if (error) throw error

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data)
          }
        }

        // Get all members
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .order('name', { ascending: true })

        if (error) throw error

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        }
      }

      case 'POST': {
        const body = JSON.parse(event.body || '{}')

        // Check if member with this user_id already exists (Supabase Auth)
        if (body.user_id) {
          const { data: existing } = await supabase
            .from('members')
            .select('id')
            .eq('user_id', body.user_id)
            .single()

          if (existing) {
            return {
              statusCode: 409,
              headers,
              body: JSON.stringify({ error: 'Member already exists' })
            }
          }
        }

        // Check if member with this netlify_user_id already exists (legacy)
        if (body.netlify_user_id) {
          const { data: existing } = await supabase
            .from('members')
            .select('id')
            .eq('netlify_user_id', body.netlify_user_id)
            .single()

          if (existing) {
            return {
              statusCode: 409,
              headers,
              body: JSON.stringify({ error: 'Member already exists' })
            }
          }
        }

        const { data, error } = await supabase
          .from('members')
          .insert([body])
          .select()
          .single()

        if (error) throw error

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(data)
        }
      }

      case 'PUT': {
        const body = JSON.parse(event.body || '{}')
        const { id, ...updates } = body

        if (!id) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'ID is required for updates' })
          }
        }

        const { data, error } = await supabase
          .from('members')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        }
      }

      case 'DELETE': {
        const id = event.queryStringParameters?.id

        if (!id) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'ID is required for deletion' })
          }
        }

        const { error } = await supabase
          .from('members')
          .delete()
          .eq('id', id)

        if (error) throw error

        return {
          statusCode: 204,
          headers,
          body: ''
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
    console.error('Members API error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error'
      })
    }
  }
}
