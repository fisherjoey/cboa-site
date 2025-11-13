import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const TABLE_NAME = 'public_news'

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
        const { slug } = event.queryStringParameters || {}

        // Get single item by slug
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
              body: JSON.stringify({ error: 'News article not found' })
            }
          }

          return { statusCode: 200, headers, body: JSON.stringify(data) }
        }

        // Get all items
        const { data, error } = await supabase
          .from(TABLE_NAME)
          .select('*')
          .order('priority', { ascending: false })
          .order('published_date', { ascending: false })

        if (error) throw error
        return { statusCode: 200, headers, body: JSON.stringify(data) }
      }

      case 'POST': {
        const body = JSON.parse(event.body || '{}')

        // Validate required fields
        if (!body.title || !body.slug || !body.published_date || !body.author || !body.excerpt || !body.body) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              error: 'Missing required fields: title, slug, published_date, author, excerpt, body'
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
