import { publicResourcesAPI } from '@/lib/api'
import ResourcesClient from './resources-client'

export default async function ResourcesPage() {
  try {
    // Fetch active resources from database
    const dbResources = await publicResourcesAPI.getActive()

    // Sort by priority (desc) then title (asc)
    const sortedResources = dbResources.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority
      }
      return a.title.localeCompare(b.title)
    })

    // Convert to format expected by ResourcesClient
    const formattedResources = sortedResources.map(resource => ({
      title: resource.title,
      slug: resource.slug,
      category: resource.category,
      description: resource.description || '',
      fileType: resource.file_type,
      downloadLink: resource.file_url,
      accessLevel: 'public', // All resources in public table are public
      lastUpdated: resource.updated_at
    }))

    return <ResourcesClient resources={formattedResources} />
  } catch (error) {
    console.error('Failed to load resources:', error)
    // Return empty state on error
    return <ResourcesClient resources={[]} />
  }
}