import { createHandler, supabase } from './_shared/handler'

export const handler = createHandler({
  name: 'announcements',
  auth: { GET: 'public', POST: 'admin_or_executive', PUT: 'admin_or_executive', DELETE: 'admin_or_executive' },
  handler: async ({ event, logger, user }) => {
    switch (event.httpMethod) {
      case 'GET': {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('date', { ascending: false })

        if (error) throw error

        return {
          statusCode: 200,
          body: JSON.stringify(data)
        }
      }

      case 'POST': {
        const body = JSON.parse(event.body || '{}')

        logger.info('crud', 'create_announcement', `Creating announcement: ${body.title || 'untitled'}`, {
          metadata: { title: body.title, type: body.type }
        })

        const { data, error } = await supabase
          .from('announcements')
          .insert([{
            ...body,
            date: body.date || new Date().toISOString()
          }])
          .select()

        if (error) throw error

        await logger.audit('CREATE', 'announcement', data[0].id, {
          actorId: user!.id,
          actorEmail: user!.email,
          newValues: { title: body.title, type: body.type },
          description: `Created announcement: ${body.title}`
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

        logger.info('crud', 'update_announcement', `Updating announcement ${id}`, {
          metadata: { id, updates: Object.keys(updateData) }
        })

        const { data, error } = await supabase
          .from('announcements')
          .update({ ...updateData, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()

        if (error) throw error

        await logger.audit('UPDATE', 'announcement', id, {
          actorId: user!.id,
          actorEmail: user!.email,
          newValues: updateData,
          description: `Updated announcement ${id}`
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

        logger.info('crud', 'delete_announcement', `Deleting announcement ${id}`, {
          metadata: { id }
        })

        const { error } = await supabase
          .from('announcements')
          .delete()
          .eq('id', id)

        if (error) throw error

        await logger.audit('DELETE', 'announcement', id, {
          actorId: user!.id,
          actorEmail: user!.email,
          description: `Deleted announcement ${id}`
        })

        return {
          statusCode: 204,
          body: ''
        }
      }

      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' })
        }
    }
  }
})
