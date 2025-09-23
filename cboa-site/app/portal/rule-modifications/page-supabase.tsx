// Supabase-powered Rule Modifications Page
// NO REBUILDS NEEDED - Updates are instant

import { supabase } from '@/lib/supabase'
import RuleModificationsClient from './RuleModificationsClient'

// Force dynamic rendering - no static generation
export const dynamic = 'force-dynamic'

export default async function RuleModificationsPage() {
  // Fetch from Supabase instead of files
  const { data: modifications, error } = await supabase
    .from('rule_modifications')
    .select('*')
    .eq('active', true)
    .order('priority', { ascending: false })

  if (error) {
    console.error('Error fetching rule modifications:', error)
    return <div>Error loading rule modifications</div>
  }

  const categories = ['School League', 'School Tournament', 'Club League', 'Club Tournament', 'Adult']

  return <RuleModificationsClient
    modifications={modifications || []}
    categories={categories}
  />
}

// Benefits:
// 1. NO rebuilds ever needed
// 2. NO token usage for builds
// 3. Instant updates when content changes
// 4. Can still use CMS UI (point it to Supabase)