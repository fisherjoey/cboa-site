import { createHandler, supabase, type UserRole } from './_shared/handler'

// Fine-grained role checks for evaluations
function canViewAllEvaluations(role: UserRole): boolean {
  return ['admin', 'executive', 'evaluator'].includes(role)
}
function canCreateEvaluations(role: UserRole): boolean {
  return ['admin', 'executive', 'evaluator'].includes(role)
}
function canModifyEvaluations(role: UserRole): boolean {
  return ['admin', 'executive'].includes(role)
}

const EVAL_SELECT = `
  *,
  member:members!member_id(id, name, email),
  evaluator:members!evaluator_id(id, name, email)
`

export const handler = createHandler({
  name: 'evaluations',
  auth: 'authenticated',
  handler: async ({ event, logger, user }) => {
    const userRole = user!.role
    const userEmail = user!.email

    switch (event.httpMethod) {
      case 'GET': {
        const { member_id, evaluator_id, id } = event.queryStringParameters || {}

        if (id) {
          const { data, error } = await supabase
            .from('evaluations')
            .select(EVAL_SELECT)
            .eq('id', id)
            .single()

          if (error) throw error

          if (!canViewAllEvaluations(userRole)) {
            const { data: memberData } = await supabase
              .from('members')
              .select('id')
              .eq('user_id', user!.id)
              .single()

            if (!memberData || data.member_id !== memberData.id) {
              return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden - You can only view your own evaluations' }) }
            }
          }

          return { statusCode: 200, body: JSON.stringify(data) }
        }

        if (member_id) {
          if (!canViewAllEvaluations(userRole)) {
            const { data: memberData } = await supabase
              .from('members')
              .select('id')
              .eq('user_id', user!.id)
              .single()

            if (!memberData || member_id !== memberData.id) {
              return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden - You can only view your own evaluations' }) }
            }
          }

          const { data, error } = await supabase
            .from('evaluations')
            .select(EVAL_SELECT)
            .eq('member_id', member_id)
            .order('evaluation_date', { ascending: false })

          if (error) throw error
          return { statusCode: 200, body: JSON.stringify(data) }
        }

        if (evaluator_id) {
          if (!canViewAllEvaluations(userRole)) {
            return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden - Insufficient permissions' }) }
          }

          const { data, error } = await supabase
            .from('evaluations')
            .select(EVAL_SELECT)
            .eq('evaluator_id', evaluator_id)
            .order('evaluation_date', { ascending: false })

          if (error) throw error
          return { statusCode: 200, body: JSON.stringify(data) }
        }

        if (!canViewAllEvaluations(userRole)) {
          return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden - You can only view your own evaluations' }) }
        }

        const { data, error } = await supabase
          .from('evaluations')
          .select(EVAL_SELECT)
          .order('evaluation_date', { ascending: false })

        if (error) throw error
        return { statusCode: 200, body: JSON.stringify(data) }
      }

      case 'POST': {
        if (!canCreateEvaluations(userRole)) {
          return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden - You do not have permission to create evaluations' }) }
        }

        const body = JSON.parse(event.body || '{}')
        logger.info('crud', 'create_evaluation', `Creating evaluation for member ${body.member_id} by ${userEmail} (${userRole})`, {
          metadata: { member_id: body.member_id, evaluator_id: body.evaluator_id, title: body.title, actor_role: userRole }
        })

        if (!body.member_id || !body.file_url || !body.file_name) {
          return { statusCode: 400, body: JSON.stringify({ error: 'member_id, file_url, and file_name are required' }) }
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
          .select(EVAL_SELECT)
          .single()

        if (error) throw error

        await logger.audit('CREATE', 'evaluation', data.id, {
          actorId: body.evaluator_id || user!.id,
          actorEmail: userEmail,
          targetUserId: body.member_id,
          newValues: { title: body.title, file_name: body.file_name },
          description: `Created evaluation for member ${body.member_id} by ${userEmail} (${userRole})`
        })

        return { statusCode: 201, body: JSON.stringify(data) }
      }

      case 'PUT': {
        if (!canModifyEvaluations(userRole)) {
          return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden - Only administrators and executives can edit evaluations' }) }
        }

        const body = JSON.parse(event.body || '{}')
        const { id, ...updateData } = body

        if (!id) {
          return { statusCode: 400, body: JSON.stringify({ error: 'ID is required for update' }) }
        }

        logger.info('crud', 'update_evaluation', `Updating evaluation ${id} by ${userEmail} (${userRole})`, {
          metadata: { id, updates: Object.keys(updateData), actor_role: userRole }
        })

        const { data, error } = await supabase
          .from('evaluations')
          .update({ ...updateData, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select(EVAL_SELECT)
          .single()

        if (error) throw error

        await logger.audit('UPDATE', 'evaluation', id, {
          actorId: user!.id,
          actorEmail: userEmail,
          newValues: updateData,
          description: `Updated evaluation ${id} by ${userEmail} (${userRole})`
        })

        return { statusCode: 200, body: JSON.stringify(data) }
      }

      case 'DELETE': {
        if (!canModifyEvaluations(userRole)) {
          return { statusCode: 403, body: JSON.stringify({ error: 'Forbidden - Only administrators and executives can delete evaluations' }) }
        }

        const { id } = event.queryStringParameters || {}

        if (!id) {
          return { statusCode: 400, body: JSON.stringify({ error: 'ID is required for deletion' }) }
        }

        logger.info('crud', 'delete_evaluation', `Deleting evaluation ${id} by ${userEmail} (${userRole})`, { metadata: { id, actor_role: userRole } })

        const { error } = await supabase
          .from('evaluations')
          .delete()
          .eq('id', id)

        if (error) throw error

        await logger.audit('DELETE', 'evaluation', id, {
          actorId: user!.id,
          actorEmail: userEmail,
          description: `Deleted evaluation ${id} by ${userEmail} (${userRole})`
        })

        return { statusCode: 204, body: '' }
      }

      default:
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
    }
  }
})
