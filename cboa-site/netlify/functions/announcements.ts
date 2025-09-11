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
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('date', { ascending: false })
        
        if (error) throw error
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        }
      }

      case 'POST': {
        const body = JSON.parse(event.body || '{}')
        const { data, error } = await supabase
          .from('announcements')
          .insert([{
            ...body,
            date: body.date || new Date().toISOString()
          }])
          .select()
        
        if (error) throw error
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(data[0])
        }
      }

      case 'PUT': {
        const body = JSON.parse(event.body || '{}')
        const { id, ...updateData } = body
        
        if (!id) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'ID is required for update' })
          }
        }

        const { data, error } = await supabase
          .from('announcements')
          .update({ ...updateData, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
        
        if (error) throw error
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data[0])
        }
      }

      case 'DELETE': {
        const { id } = event.queryStringParameters || {}
        
        if (!id) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'ID is required for deletion' })
          }
        }

        const { error } = await supabase
          .from('announcements')
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
    console.error('Announcements API Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    }
  }
}