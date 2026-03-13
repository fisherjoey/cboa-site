import { createHandler, supabase } from './_shared/handler'

export const handler = createHandler({
  name: 'resources',
  auth: { GET: 'authenticated', POST: 'admin_or_executive', PUT: 'admin_or_executive', DELETE: 'admin_or_executive' },
  handler: async ({ event, logger, user }) => {
    switch (event.httpMethod) {
      case 'GET': {
        const { featured } = event.queryStringParameters || {}

        let query = supabase.from('resources').select('*')

        if (featured === 'true') {
          query = query.eq('is_featured', true)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) throw error

        return { statusCode: 200, body: JSON.stringify(data) }
      }

      case 'POST': {
        const body = JSON.parse(event.body || '{}')
        logger.info('crud', 'create_resource', `Creating resource: ${body.title || 'untitled'}`, {
          metadata: { title: body.title, category: body.category }
        })

        const { data, error } = await supabase
          .from('resources')
          .insert([body])
          .select()

        if (error) throw error

        await logger.audit('CREATE', 'resource', data[0].id, {
          actorId: user!.id,
          actorEmail: user!.email,
          newValues: { title: body.title, category: body.category },
          description: `Created resource: ${body.title}`
        })

        return { statusCode: 201, body: JSON.stringify(data[0]) }
      }

      case 'PUT': {
        const body = JSON.parse(event.body || '{}')
        const { id, ...updateData } = body

        if (!id) {
          return { statusCode: 400, body: JSON.stringify({ error: 'ID is required for update' }) }
        }

        logger.info('crud', 'update_resource', `Updating resource ${id}`, {
          metadata: { id, updates: Object.keys(updateData) }
        })

        const { data, error } = await supabase
          .from('resources')
          .update({ ...updateData, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()

        if (error) throw error

        await logger.audit('UPDATE', 'resource', id, {
          actorId: user!.id,
          actorEmail: user!.email,
          newValues: updateData,
          description: `Updated resource ${id}`
        })

        return { statusCode: 200, body: JSON.stringify(data[0]) }
      }

      case 'DELETE': {
        const { id } = event.queryStringParameters || {}

        if (!id) {
          return { statusCode: 400, body: JSON.stringify({ error: 'ID is required for deletion' }) }
        }

        logger.info('crud', 'delete_resource', `Deleting resource ${id}`, { metadata: { id } })

        const { error } = await supabase
          .from('resources')
          .delete()
          .eq('id', id)

        if (error) throw error

        await logger.audit('DELETE', 'resource', id, {
          actorId: user!.id,
          actorEmail: user!.email,
          description: `Deleted resource ${id}`
        })

        return { statusCode: 204, body: '' }
      }

      default:
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
    }
  }
})
