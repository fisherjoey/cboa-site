import { createHandler, supabase } from './_shared/handler'

export const handler = createHandler({
  name: 'contact-submissions',
  methods: ['GET', 'PATCH'],
  auth: 'admin',
  handler: async ({ event }) => {
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {}
      const {
        category,
        status,
        search,
        startDate,
        endDate,
        page = '1',
        pageSize = '50',
      } = params

      const pageNum = parseInt(page, 10)
      const pageSizeNum = Math.min(parseInt(pageSize, 10), 100)
      const offset = (pageNum - 1) * pageSizeNum

      let query = supabase
        .from('contact_submissions')
        .select('*', { count: 'exact' })

      if (category) query = query.eq('category', category)
      if (status) query = query.eq('status', status)
      if (startDate) query = query.gte('created_at', startDate)
      if (endDate) query = query.lte('created_at', endDate)
      if (search) {
        query = query.or(
          `sender_name.ilike.%${search}%,sender_email.ilike.%${search}%,subject.ilike.%${search}%,message.ilike.%${search}%`
        )
      }

      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSizeNum - 1)

      const { data, error, count } = await query

      if (error) throw error

      return {
        statusCode: 200,
        body: JSON.stringify({
          submissions: data,
          pagination: {
            page: pageNum,
            pageSize: pageSizeNum,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / pageSizeNum),
          },
        }),
      }
    }

    // PATCH - Update submission (status, notes)
    const body = JSON.parse(event.body || '{}')
    const { id, status, notes } = body

    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Submission ID is required' }) }
    }

    const updates: Record<string, string> = {}
    if (status !== undefined) updates.status = status
    if (notes !== undefined) updates.notes = notes

    const { error } = await supabase
      .from('contact_submissions')
      .update(updates)
      .eq('id', id)

    if (error) throw error

    return { statusCode: 200, body: JSON.stringify({ success: true }) }
  }
})
