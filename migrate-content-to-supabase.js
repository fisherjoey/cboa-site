// Script to migrate all CMS content to Supabase
// Run this once to move all your content to the database

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for admin access
)

async function migrateRuleModifications() {
  console.log('Migrating rule modifications...')

  const rulesDir = path.join(process.cwd(), 'content/portal/rule-modifications')
  const files = fs.readdirSync(rulesDir)

  for (const file of files) {
    if (!file.endsWith('.md')) continue

    const filePath = path.join(rulesDir, file)
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const { data: frontmatter, content } = matter(fileContent)

    const ruleData = {
      title: frontmatter.title,
      slug: frontmatter.slug || file.replace('.md', ''),
      category: frontmatter.category,
      summary: frontmatter.summary,
      content: content,
      effective_date: frontmatter.effectiveDate,
      priority: frontmatter.priority || 0,
      active: frontmatter.active !== false,
      tags: frontmatter.tags || []
    }

    const { error } = await supabase
      .from('rule_modifications')
      .upsert(ruleData, { onConflict: 'slug' })

    if (error) {
      console.error(`Error migrating ${file}:`, error)
    } else {
      console.log(`✓ Migrated ${frontmatter.title}`)
    }
  }
}

async function migrateAnnouncements() {
  console.log('Migrating announcements...')

  const announcementsDir = path.join(process.cwd(), 'content/portal/announcements')

  if (!fs.existsSync(announcementsDir)) {
    console.log('No announcements to migrate')
    return
  }

  const files = fs.readdirSync(announcementsDir)

  for (const file of files) {
    if (!file.endsWith('.md')) continue

    const filePath = path.join(announcementsDir, file)
    const fileContent = fs.readFileSync(filePath, 'utf8')
    const { data: frontmatter, content } = matter(fileContent)

    const announcementData = {
      title: frontmatter.title,
      content: content,
      category: frontmatter.category || 'general',
      priority: frontmatter.urgent ? 'high' : 'normal',
      author: frontmatter.author || 'CBOA Executive',
      urgent: frontmatter.urgent || false,
      audience: frontmatter.audience || ['all'],
      expires: frontmatter.expires || null
    }

    const { error } = await supabase
      .from('announcements')
      .insert(announcementData)

    if (error) {
      console.error(`Error migrating ${file}:`, error)
    } else {
      console.log(`✓ Migrated ${frontmatter.title}`)
    }
  }
}

// Run migrations
async function migrate() {
  console.log('Starting migration to Supabase...\n')

  await migrateRuleModifications()
  console.log('')
  await migrateAnnouncements()

  console.log('\n✅ Migration complete!')
  console.log('Your content is now in Supabase. No more rebuild tokens!')
}

migrate().catch(console.error)