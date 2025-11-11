/**
 * Storage Buckets Direct Access Test
 * Tests if buckets exist by trying to access them directly
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

console.log('\n🪣 Storage Buckets Direct Access Test\n')
console.log('=====================================\n')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testBucketAccess() {
  const bucketsToTest = ['portal-resources', 'newsletters', 'training-materials']

  console.log('Testing bucket access by listing files...\n')

  for (const bucketName of bucketsToTest) {
    try {
      // Try to list files in the bucket (even if empty)
      const { data, error } = await supabase
        .storage
        .from(bucketName)
        .list()

      if (error) {
        if (error.message.includes('not found') || error.message.includes('does not exist')) {
          console.log(`   ❌ Bucket "${bucketName}" - NOT FOUND`)
          console.log(`      → Create this bucket in Supabase Dashboard`)
        } else {
          console.log(`   ⚠️  Bucket "${bucketName}" - Access Error: ${error.message}`)
        }
      } else {
        console.log(`   ✅ Bucket "${bucketName}" - Accessible! (${data?.length || 0} files)`)
      }
    } catch (err) {
      console.log(`   ❌ Bucket "${bucketName}" - Exception: ${err}`)
    }
  }

  console.log('\n=====================================\n')
  console.log('✅ Bucket access test complete!\n')
  console.log('If all 3 buckets show ✅, you\'re ready to go!')
  console.log('If any show ❌, create them in Supabase Dashboard → Storage\n')
}

testBucketAccess()
