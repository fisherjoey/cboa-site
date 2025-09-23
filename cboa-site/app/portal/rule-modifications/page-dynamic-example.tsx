// EXAMPLE: Dynamic Server-Side Rendering (SSR) approach
// This would fetch content on EVERY request, no rebuild needed

import { getAllContent, sortByDate } from '@/lib/content'
import RuleModificationsClient from './RuleModificationsClient'

// Force dynamic rendering - content fetched on each request
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RuleModificationsPage() {
  // This runs on the SERVER for every request
  const modifications = sortByDate(getAllContent('portal/rule-modifications'))
    .filter(mod => mod.active !== false)

  const categories = Array.from(new Set(modifications.map(mod => mod.category)))
    .filter(Boolean)
    .sort()

  return <RuleModificationsClient modifications={modifications} categories={categories} />
}

// OR: Use Incremental Static Regeneration (ISR)
// export const revalidate = 60 // Regenerate page every 60 seconds

// This approach means:
// 1. Content updates show immediately (or within revalidate period)
// 2. No rebuild required
// 3. But higher server costs and slower initial page loads