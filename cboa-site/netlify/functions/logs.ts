import { createHandler, supabase } from './_shared/handler'

export const handler = createHandler({
  name: 'logs',
  methods: ['GET'],
  auth: 'admin',
  handler: async ({ event }) => {
    const params = event.queryStringParameters || {}
    const {
      type = 'app',
      level,
      source,
      category,
      action,
      search,
      startDate,
      endDate,
      page = '1',
      pageSize = '50'
    } = params

    const pageNum = parseInt(page, 10)
    const pageSizeNum = Math.min(parseInt(pageSize, 10), 100)
    const offset = (pageNum - 1) * pageSizeNum

    const tableName = type === 'audit' ? 'audit_logs' : 'app_logs'

    let query = supabase
      .from(tableName)
      .select('*', { count: 'exact' })

    if (type === 'app') {
      if (level) query = query.eq('level', level)
      if (source) query = query.eq('source', source)
      if (category) query = query.eq('category', category)
    } else {
      if (action) query = query.eq('action', action)
    }

    if (startDate) query = query.gte('timestamp', startDate)
    if (endDate) query = query.lte('timestamp', endDate)

    if (search) {
      if (type === 'app') {
        query = query.or(`message.ilike.%${search}%,function_name.ilike.%${search}%,user_email.ilike.%${search}%`)
      } else {
        query = query.or(`description.ilike.%${search}%,actor_email.ilike.%${search}%,target_user_email.ilike.%${search}%`)
      }
    }

    query = query
      .order('timestamp', { ascending: false })
      .range(offset, offset + pageSizeNum - 1)

    const { data, error, count } = await query

    if (error) throw error

    return {
      statusCode: 200,
      body: JSON.stringify({
        logs: data,
        pagination: {
          page: pageNum,
          pageSize: pageSizeNum,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSizeNum)
        }
      })
    }
  }
})
