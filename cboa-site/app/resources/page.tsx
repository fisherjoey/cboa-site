import { getAllContent } from '@/lib/content'
import ResourcesClient from './resources-client'

export default function ResourcesPage() {
  const resources = getAllContent('resources')
  
  return <ResourcesClient resources={resources} />
}