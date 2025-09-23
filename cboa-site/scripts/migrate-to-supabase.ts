import { FileSystemAdapter } from '../lib/adapters/FileSystemAdapter'
import { SupabaseAdapter } from '../lib/adapters/SupabaseAdapter'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') })

async function migrate() {
  console.log('Starting migration to Supabase...')
  
  // Check for Supabase credentials
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase credentials in .env.local')
    console.error('Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    process.exit(1)
  }

  try {
    // Initialize adapters
    const fileAdapter = new FileSystemAdapter()
    const supabaseAdapter = new SupabaseAdapter()

    // Migrate Rule Modifications
    console.log('\nMigrating Rule Modifications...')
    const rules = await fileAdapter.getRuleModifications()
    console.log(`Found ${rules.length} rule modifications to migrate`)

    for (const rule of rules) {
      try {
        // Remove id field as Supabase will generate its own
        const { id, ...ruleData } = rule
        await supabaseAdapter.createRuleModification(ruleData)
        console.log(`✓ Migrated: ${rule.title}`)
      } catch (error: any) {
        console.error(`✗ Failed to migrate ${rule.title}: ${error.message}`)
      }
    }

    // Migrate Announcements if you have any
    // Note: Since we converted to CMS-based announcements, 
    // you might need to read from content/announcements/*.md
    console.log('\nMigration complete!')
    console.log('\nNext steps:')
    console.log('1. Update your app to use SupabaseAdapter instead of FileSystemAdapter')
    console.log('2. Test the application thoroughly')
    console.log('3. Consider implementing authentication for write operations')

  } catch (error: any) {
    console.error('Migration failed:', error.message)
    process.exit(1)
  }
}

// Run migration
migrate()