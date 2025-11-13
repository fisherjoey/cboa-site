import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const TABLE_NAME = 'officials'

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
        const { level } = event.queryStringParameters || {}

        let query = supabase
          .from(TABLE_NAME)
          .select('*')
          .order('priority', { ascending: false })
          .order('name', { ascending: true })

        if (level) {
          query = query.eq('level', parseInt(level))
        }

        const { data, error } = await query

        if (error) throw error
        return { statusCode: 200, headers, body: JSON.stringify(data) }
      }

      case 'POST': {
        const body = JSON.parse(event.body || '{}')

        if (!body.name) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              error: 'Missing required field: name'
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
