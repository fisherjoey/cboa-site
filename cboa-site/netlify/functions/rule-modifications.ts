import { createHandler, supabase } from './_shared/handler'

export const handler = createHandler({
  name: 'rule-modifications',
  auth: { GET: 'authenticated', POST: 'admin_or_executive', PUT: 'admin_or_executive', DELETE: 'admin_or_executive' },
  handler: async ({ event, logger, user }) => {
    switch (event.httpMethod) {
      case 'GET': {
        const { data, error } = await supabase
          .from('rule_modifications')
          .select('*')
          .eq('active', true)
          .order('priority', { ascending: false })

        if (error) throw error

        return { statusCode: 200, body: JSON.stringify(data) }
      }

      case 'POST': {
        const body = JSON.parse(event.body || '{}')
        logger.info('crud', 'create_rule_modification', `Creating rule modification: ${body.title || 'untitled'}`, {
          metadata: { title: body.title, league: body.league }
        })

        const { data, error } = await supabase
          .from('rule_modifications')
          .insert([body])
          .select()
          .single()

        if (error) throw error

        await logger.audit('CREATE', 'rule_modification', data.id, {
          actorId: user!.id,
          actorEmail: user!.email,
          newValues: { title: body.title, league: body.league },
          description: `Created rule modification: ${body.title}`
        })

        return { statusCode: 201, body: JSON.stringify(data) }
      }

      case 'PUT': {
        const body = JSON.parse(event.body || '{}')
        const { id, ...updates } = body

        if (!id) {
          return { statusCode: 400, body: JSON.stringify({ error: 'ID is required for updates' }) }
        }

        logger.info('crud', 'update_rule_modification', `Updating rule modification ${id}`, {
          metadata: { id, updates: Object.keys(updates) }
        })

        const { data, error } = await supabase
          .from('rule_modifications')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        await logger.audit('UPDATE', 'rule_modification', id, {
          actorId: user!.id,
          actorEmail: user!.email,
          newValues: updates,
          description: `Updated rule modification ${id}`
        })

        return { statusCode: 200, body: JSON.stringify(data) }
      }

      case 'DELETE': {
        const id = event.queryStringParameters?.id

        if (!id) {
          return { statusCode: 400, body: JSON.stringify({ error: 'ID is required for deletion' }) }
        }

        logger.info('crud', 'delete_rule_modification', `Deleting rule modification ${id}`, { metadata: { id } })

        const { error } = await supabase
          .from('rule_modifications')
          .delete()
          .eq('id', id)

        if (error) throw error

        await logger.audit('DELETE', 'rule_modification', id, {
          actorId: user!.id,
          actorEmail: user!.email,
          description: `Deleted rule modification ${id}`
        })

        return { statusCode: 204, body: '' }
      }

      default:
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
    }
  }
})
