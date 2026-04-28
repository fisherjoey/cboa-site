import { createHandler, supabase, errorResponse } from './_shared/handler'
import { osaExcelSync } from '../../lib/excel-sync'

export const handler = createHandler({
  name: 'osa-submissions',
  methods: ['GET', 'PATCH'],
  auth: 'admin',
  handler: async ({ event }) => {
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {}
      const {
        event_type,
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
        .from('osa_submissions')
        .select('*', { count: 'exact' })

      if (event_type) query = query.eq('event_type', event_type)
      if (status) query = query.eq('status', status)
      if (startDate) query = query.gte('created_at', startDate)
      if (endDate) query = query.lte('created_at', endDate)
      if (search) {
        query = query.or(`organization_name.ilike.%${search}%,event_contact_email.ilike.%${search}%,event_contact_name.ilike.%${search}%,league_name.ilike.%${search}%,tournament_name.ilike.%${search}%`)
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
            totalPages: Math.ceil((count || 0) / pageSizeNum)
          }
        })
      }
    }

    // PATCH - Update submission (status, notes)
    const body = JSON.parse(event.body || '{}')
    const { id, status, notes } = body

    if (!id) {
      return errorResponse({ code: 'invalid_input', message: 'A submission must be selected.' })
    }

    const updateData: Record<string, any> = {}
    if (status !== undefined) updateData.status = status
    if (notes !== undefined) updateData.notes = notes

    if (Object.keys(updateData).length === 0) {
      return errorResponse({ code: 'invalid_input', message: 'No update data was provided.' })
    }

    const { data, error } = await supabase
      .from('osa_submissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Sync update to Excel (if configured)
    if (data && osaExcelSync.isConfigured()) {
      try {
        let eventName = ''
        let startDate = ''
        let endDate = ''
        let numberOfGames: number | undefined
        let daysOfWeek = ''
        let playerGender = ''
        let levelOfPlay = ''
        let gameLocation = ''
        let startTime = ''

        if (data.event_type === 'League') {
          eventName = data.league_name || 'League'
          startDate = data.league_start_date || ''
          endDate = data.league_end_date || ''
          daysOfWeek = data.league_days_of_week || ''
          playerGender = data.league_player_gender || ''
          levelOfPlay = data.league_level_of_play || ''
        } else if (data.event_type === 'Tournament') {
          eventName = data.tournament_name || 'Tournament'
          startDate = data.tournament_start_date || ''
          endDate = data.tournament_end_date || ''
          numberOfGames = data.tournament_number_of_games
          playerGender = data.tournament_player_gender || ''
          levelOfPlay = data.tournament_level_of_play || ''
        } else {
          eventName = data.exhibition_game_location || 'Exhibition'
          startDate = data.exhibition_game_date || ''
          numberOfGames = data.exhibition_number_of_games
          playerGender = data.exhibition_player_gender || ''
          levelOfPlay = data.exhibition_level_of_play || ''
          gameLocation = data.exhibition_game_location || ''
          startTime = data.exhibition_start_time || ''
        }

        await osaExcelSync.updateSubmission({
          id: data.id,
          created_at: data.created_at,
          organization_name: data.organization_name,
          event_type: data.event_type,
          event_name: eventName,
          start_date: startDate,
          end_date: endDate,
          number_of_games: numberOfGames,
          days_of_week: daysOfWeek,
          player_gender: playerGender,
          level_of_play: levelOfPlay,
          game_location: gameLocation,
          start_time: startTime,
          event_contact_name: data.event_contact_name,
          event_contact_email: data.event_contact_email,
          event_contact_phone: data.event_contact_phone,
          billing_contact_name: data.billing_contact_name,
          billing_email: data.billing_email,
          billing_phone: data.billing_phone,
          billing_address: data.billing_address,
          billing_city: data.billing_city,
          billing_province: data.billing_province,
          billing_postal_code: data.billing_postal_code,
          discipline_policy: data.discipline_policy,
          status: data.status,
          notes: data.notes
        })
      } catch (excelError) {
        // Log but don't fail the request
        console.error('Excel sync error (non-fatal):', excelError)
      }
    }

    return { statusCode: 200, body: JSON.stringify({ submission: data }) }
  }
})
