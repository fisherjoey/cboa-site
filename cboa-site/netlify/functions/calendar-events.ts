import { createHandler, supabase } from './_shared/handler'

export const handler = createHandler({
  name: 'calendar-events',
  auth: { GET: 'authenticated', POST: 'admin_or_executive', PUT: 'admin_or_executive', DELETE: 'admin_or_executive' },
  handler: async ({ event, logger, user }) => {
    switch (event.httpMethod) {
      case 'GET': {
        const { data, error } = await supabase
          .from('calendar_events')
          .select('*')
          .order('start_date', { ascending: true })
          .limit(500)

        if (error) throw error

        return {
          statusCode: 200,
          body: JSON.stringify(data)
        }
      }

      case 'POST': {
        const body = JSON.parse(event.body || '{}')
        logger.info('crud', 'create_calendar_event', `Creating event: ${body.title || 'untitled'}`, {
          metadata: { title: body.title }
        })

        const { data, error } = await supabase
          .from('calendar_events')
          .insert([body])
          .select()

        if (error) throw error

        await logger.audit('CREATE', 'calendar_event', data[0].id, {
          actorId: user!.id,
          actorEmail: user!.email,
          newValues: { title: body.title, start_date: body.start_date },
          description: `Created calendar event: ${body.title}`
        })

        return {
          statusCode: 201,
          body: JSON.stringify(data[0])
        }
      }

      case 'PUT': {
        const body = JSON.parse(event.body || '{}')
        const { id, ...updateData } = body

        if (!id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'ID is required for update' })
          }
        }

        logger.info('crud', 'update_calendar_event', `Updating event ${id}`, {
          metadata: { id, updates: Object.keys(updateData) }
        })

        const { data, error } = await supabase
          .from('calendar_events')
          .update({ ...updateData, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()

        if (error) throw error

        await logger.audit('UPDATE', 'calendar_event', id, {
          actorId: user!.id,
          actorEmail: user!.email,
          newValues: updateData,
          description: `Updated calendar event ${id}`
        })

        return {
          statusCode: 200,
          body: JSON.stringify(data[0])
        }
      }

      case 'DELETE': {
        const { id } = event.queryStringParameters || {}

        if (!id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'ID is required for deletion' })
          }
        }

        logger.info('crud', 'delete_calendar_event', `Deleting event ${id}`, { metadata: { id } })

        const { error } = await supabase
          .from('calendar_events')
          .delete()
          .eq('id', id)

        if (error) throw error

        await logger.audit('DELETE', 'calendar_event', id, {
          actorId: user!.id,
          actorEmail: user!.email,
          description: `Deleted calendar event ${id}`
        })

        return {
          statusCode: 204,
          body: ''
        }
      }

      default:
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
    }
  }
})
