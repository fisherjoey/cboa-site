/**
 * Supabase Connection Test Script
 * Run this to verify your Supabase setup is working correctly
 *
 * Usage:
 *   npx ts-node scripts/test-supabase.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

console.log('\n🔧 CBOA Supabase Connection Test\n')
console.log('================================\n')

// Check environment variables
console.log('1. Checking environment variables...')
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}
console.log('✅ Environment variables found')
console.log(`   URL: ${supabaseUrl}`)
console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...\n`)

// Create Supabase client
console.log('2. Creating Supabase client...')
const supabase = createClient(supabaseUrl, supabaseAnonKey)
console.log('✅ Client created\n')

// Test database connection
async function testDatabaseConnection() {
  console.log('3. Testing database connection...')

  try {
    // Test each table
    const tables = [
      'rule_modifications',
      'announcements',
      'calendar_events',
      'resources',
      'newsletters'
    ]

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1)

      if (error) {
        console.error(`   ❌ Table "${table}" error: ${error.message}`)
      } else {
        console.log(`   ✅ Table "${table}" accessible`)
      }
    }

    console.log('\n')
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  }
}

// Test storage buckets
async function testStorageBuckets() {
  console.log('4. Testing storage buckets...')

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()

    if (error) {
      console.error('   ❌ Failed to list buckets:', error.message)
      return
    }

    if (!buckets || buckets.length === 0) {
      console.log('   ⚠️  No storage buckets found')
      console.log('   → Create buckets in Supabase Dashboard (see SUPABASE_SETUP_COMPLETE.md)')
      return
    }

    console.log(`   ✅ Found ${buckets.length} storage bucket(s):`)
    buckets.forEach(bucket => {
      console.log(`      - ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
    })

    // Check for required buckets
    const requiredBuckets = ['portal-resources', 'newsletters', 'training-materials']
    const missingBuckets = requiredBuckets.filter(
      name => !buckets.find(b => b.name === name)
    )

    if (missingBuckets.length > 0) {
      console.log(`\n   ⚠️  Missing recommended buckets: ${missingBuckets.join(', ')}`)
      console.log('   → See SUPABASE_SETUP_COMPLETE.md Step 2 for setup instructions')
    }

    console.log('\n')
  } catch (error) {
    console.error('❌ Storage test failed:', error)
  }
}

// Test data operations
async function testDataOperations() {
  console.log('5. Testing data operations...')

  try {
    // Try to insert a test rule modification
    const testRule = {
      slug: `test-${Date.now()}`,
      title: 'Test Rule (DELETE ME)',
      category: 'School League',
      description: 'This is a test rule modification - please delete',
      active: true,
      priority: 0
    }

    console.log('   → Attempting to insert test data...')
    const { data: inserted, error: insertError } = await supabase
      .from('rule_modifications')
      .insert([testRule])
      .select()
      .single()

    if (insertError) {
      console.error('   ❌ Insert failed:', insertError.message)
      console.log('   → This might be due to RLS policies. Check your Supabase policies.')
      return
    }

    console.log('   ✅ Insert successful')

    // Try to read it back
    console.log('   → Attempting to read test data...')
    const { data: fetched, error: fetchError } = await supabase
      .from('rule_modifications')
      .select('*')
      .eq('slug', testRule.slug)
      .single()

    if (fetchError) {
      console.error('   ❌ Read failed:', fetchError.message)
      return
    }

    console.log('   ✅ Read successful')

    // Clean up test data
    console.log('   → Cleaning up test data...')
    const { error: deleteError } = await supabase
      .from('rule_modifications')
      .delete()
      .eq('slug', testRule.slug)

    if (deleteError) {
      console.log('   ⚠️  Could not delete test data:', deleteError.message)
      console.log(`   → Please manually delete rule with slug: ${testRule.slug}`)
    } else {
      console.log('   ✅ Cleanup successful')
    }

    console.log('\n')
  } catch (error) {
    console.error('❌ Data operations test failed:', error)
  }
}

// Run all tests
async function runTests() {
  await testDatabaseConnection()
  await testStorageBuckets()
  await testDataOperations()

  console.log('================================\n')
  console.log('✅ Test suite completed!\n')
  console.log('Next steps:')
  console.log('1. If any tables are missing, run complete-schema.sql in Supabase')
  console.log('2. If buckets are missing, create them in Supabase Dashboard')
  console.log('3. Check SUPABASE_SETUP_COMPLETE.md for detailed instructions\n')
}

runTests()
