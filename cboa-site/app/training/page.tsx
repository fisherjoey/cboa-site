import { getUpcomingTrainingEvents } from '@/lib/training'
import TrainingClient from './TrainingClient'

export default function TrainingPage() {
  const trainingEvents = getUpcomingTrainingEvents()
  
  return <TrainingClient trainingEvents={trainingEvents} />
}