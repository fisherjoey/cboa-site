import { publicTrainingAPI } from '@/lib/api'
import TrainingClient from './TrainingClient'

export const dynamic = 'force-dynamic'

export default async function TrainingPage() {
  try {
    // Fetch upcoming active training events from database
    const events = await publicTrainingAPI.getUpcoming()

    // Convert to format expected by TrainingClient
    const formattedEvents = events.map(event => ({
      title: event.title,
      date: event.event_date,
      startTime: event.event_time || '9:00 AM',
      endTime: event.event_time ? (
        // Add 2 hours to start time as default duration
        new Date(new Date(`2000-01-01 ${event.event_time}`).getTime() + 2 * 60 * 60 * 1000)
          .toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      ) : '11:00 AM',
      location: event.location || 'TBD',
      type: 'workshop' as const, // Default type, could be enhanced in DB schema
      description: event.description,
      registrationLink: event.registration_url,
      instructor: event.instructor,
      slug: event.slug
    }))

    return <TrainingClient trainingEvents={formattedEvents} />
  } catch (error) {
    console.error('Failed to load training events:', error)
    // Return empty state on error
    return <TrainingClient trainingEvents={[]} />
  }
}