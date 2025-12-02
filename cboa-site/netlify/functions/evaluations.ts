import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import { Logger } from '../../lib/logger'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export const handler: Handler = async (event) => {
  const logger = Logger.fromEvent('evaluations', event)

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    switch (event.httpMethod) {
      case 'GET': {
        const { member_id, evaluator_id, id } = event.queryStringParameters || {}

        // Get single evaluation by ID
        if (id) {
          const { data, error } = await supabase
            .from('evaluations')
            .select(`
              *,
              member:members!member_id(id, name, email),
              evaluator:members!evaluator_id(id, name, email)
            `)
            .eq('id', id)
            .single()

          if (error) throw error

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data)
          }
        }

        // Get evaluations for a specific member (official viewing their own)
        if (member_id) {
          const { data, error } = await supabase
            .from('evaluations')
            .select(`
              *,
              member:members!member_id(id, name, email),
              evaluator:members!evaluator_id(id, name, email)
            `)
            .eq('member_id', member_id)
            .order('evaluation_date', { ascending: false })

          if (error) throw error

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data)
          }
        }

        // Get evaluations created by a specific evaluator
        if (evaluator_id) {
          const { data, error } = await supabase
            .from('evaluations')
            .select(`
              *,
              member:members!member_id(id, name, email),
              evaluator:members!evaluator_id(id, name, email)
            `)
            .eq('evaluator_id', evaluator_id)
            .order('evaluation_date', { ascending: false })

          if (error) throw error

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data)
          }
        }

        // Get all evaluations (for admin/evaluator view)
        const { data, error } = await supabase
          .from('evaluations')
          .select(`
            *,
            member:members!member_id(id, name, email),
            evaluator:members!evaluator_id(id, name, email)
          `)
          .order('evaluation_date', { ascending: false })

        if (error) throw error

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
        }
      }

      case 'POST': {
        const body = JSON.parse(event.body || '{}')
        logger.info('crud', 'create_evaluation', `Creating evaluation for member ${body.member_id}`, {
          metadata: { member_id: body.member_id, evaluator_id: body.evaluator_id, title: body.title }
        })

        // Validate required fields
        if (!body.member_id || !body.file_url || !body.file_name) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'member_id, file_url, and file_name are required' })
          }
        }

        const { data, error } = await supabase
          .from('evaluations')
          .insert([{
            member_id: body.member_id,
            evaluator_id: body.evaluator_id,
            evaluation_date: body.evaluation_date || new Date().toISOString().split('T')[0],
            file_url: body.file_url,
            file_name: body.file_name,
            title: body.title,
            notes: body.notes,
            activity_id: body.activity_id
          }])
          .select(`
            *,
            member:members!member_id(id, name, email),
            evaluator:members!evaluator_id(id, name, email)
          `)
          .single()

        if (error) throw error

        await logger.audit('CREATE', 'evaluation', data.id, {
          actorId: body.evaluator_id || 'system',
          actorEmail: 'system',
          targetUserId: body.member_id,
          newValues: { title: body.title, file_name: body.file_name },
          description: `Created evaluation for member ${body.member_id}`
        })

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify(data)
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

        logger.info('crud', 'update_evaluation', `Updating evaluation ${id}`, {
          metadata: { id, updates: Object.keys(updateData) }
        })

        const { data, error } = await supabase
          .from('evaluations')
          .update({ ...updateData, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select(`
            *,
            member:members!member_id(id, name, email),
            evaluator:members!evaluator_id(id, name, email)
          `)
          .single()

        if (error) throw error

        await logger.audit('UPDATE', 'evaluation', id, {
          actorId: 'system',
          actorEmail: 'system',
          newValues: updateData,
          description: `Updated evaluation ${id}`
        })

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(data)
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

        logger.info('crud', 'delete_evaluation', `Deleting evaluation ${id}`, { metadata: { id } })

        const { error } = await supabase
          .from('evaluations')
          .delete()
          .eq('id', id)

        if (error) throw error

        await logger.audit('DELETE', 'evaluation', id, {
          actorId: 'system',
          actorEmail: 'system',
          description: `Deleted evaluation ${id}`
        })

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
    logger.error('crud', 'evaluations_api_error', 'Evaluations API error', error instanceof Error ? error : new Error(String(error)))
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error'
      })
    }
  }
}
