import { createHandler, supabase } from './_shared/handler'

export const handler = createHandler({
  name: 'email-history',
  methods: ['GET'],
  auth: 'admin',
  handler: async ({ event }) => {
    const params = event.queryStringParameters || {}
    const {
      email_type,
      status,
      search,
      startDate,
      endDate,
      page = '1',
      pageSize = '50'
    } = params

    const pageNum = parseInt(page, 10)
    const pageSizeNum = Math.min(parseInt(pageSize, 10), 100)
    const offset = (pageNum - 1) * pageSizeNum

    let query = supabase
      .from('email_history')
      .select('*', { count: 'exact' })

    if (email_type) query = query.eq('email_type', email_type)
    if (status) query = query.eq('status', status)
    if (startDate) query = query.gte('created_at', startDate)
    if (endDate) query = query.lte('created_at', endDate)
    if (search) {
      query = query.or(`subject.ilike.%${search}%,sent_by_email.ilike.%${search}%,recipient_email.ilike.%${search}%`)
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSizeNum - 1)

    const { data, error, count } = await query

    if (error) throw error

    return {
      statusCode: 200,
      body: JSON.stringify({
        emails: data,
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
