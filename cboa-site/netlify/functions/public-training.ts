import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const TABLE_NAME = 'public_training_events'

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    switch (event.httpMethod) {
      case 'GET': {
        const { slug } = event.queryStringParameters || {}

        if (slug) {
          const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('slug', slug)
            .single()

          if (error) throw error

          if (!data) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ error: 'Training event not found' })
            }
          }

          return { statusCode: 200, headers, body: JSON.stringify(data) }
        }

        const { data, error } = await supabase
          .from(TABLE_NAME)
          .select('*')
          .order('priority', { ascending: false })
          .order('event_date', { ascending: true })

        if (error) throw error
        return { statusCode: 200, headers, body: JSON.stringify(data) }
      }

      case 'POST': {
        const body = JSON.parse(event.body || '{}')

        if (!body.title || !body.slug || !body.event_date || !body.start_time || !body.end_time || !body.location || !body.event_type || !body.description) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              error: 'Missing required fields: title, slug, event_date, start_time, end_time, location, event_type, description'
            })
          }
        }

        const { data, error } = await supabase
          .from(TABLE_NAME)
          .insert([body])
          .select()
          .single()

        if (error) throw error
        return { statusCode: 201, headers, body: JSON.stringify(data) }
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
          .from(TABLE_NAME)
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return { statusCode: 200, headers, body: JSON.stringify(data) }
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
          .from(TABLE_NAME)
          .delete()
          .eq('id', id)

        if (error) throw error
        return { statusCode: 204, headers, body: '' }
      }

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' })
        }
    }
  } catch (error) {
    console.error(`${TABLE_NAME} API error:`, error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error'
      })
    }
  }
}
