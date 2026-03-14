/**
 * One-time backfill: sync all existing OSA submissions to Excel.
 * Invoke via: POST /.netlify/functions/backfill-excel
 * Requires admin auth token.
 * DELETE THIS FUNCTION after use.
 */
import { createHandler, supabase } from './_shared/handler'
import { osaExcelSync, type OSASubmissionData } from '../../lib/excel-sync'

export const handler = createHandler({
  name: 'backfill-excel',
  methods: ['POST'],
  auth: 'admin',
  handler: async ({ logger }) => {
    if (!osaExcelSync.isConfigured()) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Excel sync not configured' }) }
    }

    // Fetch all submissions
    const { data: submissions, error } = await supabase
      .from('osa_submissions')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw error
    if (!submissions?.length) {
      return { statusCode: 200, body: JSON.stringify({ message: 'No submissions to sync', count: 0 }) }
    }

    const results = { synced: 0, failed: 0, errors: [] as string[] }

    for (const sub of submissions) {
      try {
        // Build the Excel data from the submission
        let eventName = ''
        let startDate = ''
        let endDate = ''
        let numberOfGames: number | undefined
        let daysOfWeek = ''
        let playerGender = ''
        let levelOfPlay = ''
        let gameLocation = ''
        let startTime = ''

        if (sub.event_type === 'League') {
          eventName = sub.league_name || 'League'
          startDate = sub.league_start_date || ''
          endDate = sub.league_end_date || ''
          daysOfWeek = sub.league_days_of_week || ''
          playerGender = sub.league_player_gender || ''
          levelOfPlay = sub.league_level_of_play || ''
        } else if (sub.event_type === 'Tournament') {
          eventName = sub.tournament_name || 'Tournament'
          startDate = sub.tournament_start_date || ''
          endDate = sub.tournament_end_date || ''
          numberOfGames = sub.tournament_number_of_games
          playerGender = sub.tournament_player_gender || ''
          levelOfPlay = sub.tournament_level_of_play || ''
        } else {
          eventName = sub.exhibition_game_location || 'Exhibition'
          startDate = sub.exhibition_game_date || ''
          numberOfGames = sub.exhibition_number_of_games
          playerGender = sub.exhibition_player_gender || ''
          levelOfPlay = sub.exhibition_level_of_play || ''
          gameLocation = sub.exhibition_game_location || ''
          startTime = sub.exhibition_start_time || ''
        }

        const excelData: OSASubmissionData = {
          id: sub.id,
          created_at: sub.created_at,
          organization_name: sub.organization_name,
          event_type: sub.event_type,
          submission_group_id: sub.submission_group_id,
          event_index: sub.event_index,
          event_name: eventName,
          start_date: startDate,
          end_date: endDate,
          number_of_games: numberOfGames,
          days_of_week: daysOfWeek,
          player_gender: playerGender,
          level_of_play: levelOfPlay,
          game_location: gameLocation,
          start_time: startTime,
          event_contact_name: sub.event_contact_name,
          event_contact_email: sub.event_contact_email,
          event_contact_phone: sub.event_contact_phone,
          billing_contact_name: sub.billing_contact_name,
          billing_email: sub.billing_email,
          billing_phone: sub.billing_phone,
          billing_address: sub.billing_address,
          billing_city: sub.billing_city,
          billing_province: sub.billing_province,
          billing_postal_code: sub.billing_postal_code,
          discipline_policy: sub.discipline_policy || '',
          status: sub.status || 'new',
          notes: sub.notes || ''
        }

        await osaExcelSync.addSubmission(excelData)
        results.synced++
        logger.info('osa', 'backfill_synced', `Synced submission ${sub.id} (${sub.organization_name})`)
      } catch (err: any) {
        results.failed++
        results.errors.push(`${sub.id}: ${err.message}`)
        logger.error('osa', 'backfill_failed', `Failed to sync ${sub.id}`, err)
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Backfill complete: ${results.synced} synced, ${results.failed} failed out of ${submissions.length}`,
        ...results
      })
    }
  }
})
