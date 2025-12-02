// Script to send bulk invites to members without portal accounts
// Run with: node scripts/send-bulk-invites.js [--dry-run]
// Requires AUTH_TOKEN environment variable (admin JWT token)

const fs = require('fs')

const API_BASE = process.env.API_URL || 'https://cboa.ca/.netlify/functions'
const AUTH_TOKEN = process.env.AUTH_TOKEN // Admin JWT token

const DRY_RUN = process.argv.includes('--dry-run')
const DELAY_MS = 500 // Delay between requests to avoid rate limiting

// Emails to skip (test accounts, etc.)
const SKIP_EMAILS = [
  'joey@streamdata.com',
  'joey.fisherucalgary@gmail.com',
  'testinvite999@streamdata.com',
  'joeytest12345@streamdata.com'
]

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function sendInvite(email, name) {
  const response = await fetch(`${API_BASE}/supabase-auth-admin`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, name, role: 'official' })
  })

  const data = await response.json()
  return { status: response.status, data }
}

async function main() {
  if (!AUTH_TOKEN) {
    console.error('ERROR: AUTH_TOKEN environment variable required')
    console.error('Get it from browser DevTools: localStorage.getItem("sb-...-auth-token")')
    process.exit(1)
  }

  // Load members needing invites
  const membersFile = 'scripts/members-needing-invites.json'
  if (!fs.existsSync(membersFile)) {
    console.error('ERROR: Run find-members-needing-invites.js first')
    process.exit(1)
  }

  const members = JSON.parse(fs.readFileSync(membersFile, 'utf8'))

  // Filter out test emails
  const toInvite = members.filter(m =>
    !SKIP_EMAILS.includes(m.email.toLowerCase())
  )

  console.log(`\n=== Bulk Invite Script ===`)
  console.log(`Total members to invite: ${toInvite.length}`)
  console.log(`Skipped (test accounts): ${members.length - toInvite.length}`)
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`)
  console.log(`API: ${API_BASE}`)
  console.log('')

  if (DRY_RUN) {
    console.log('Members that would be invited:')
    toInvite.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.name} <${m.email}>`)
    })
    console.log('\nRun without --dry-run to send invites')
    return
  }

  // Send invites
  const results = {
    success: [],
    failed: [],
    skipped: []
  }

  for (let i = 0; i < toInvite.length; i++) {
    const member = toInvite[i]
    console.log(`[${i + 1}/${toInvite.length}] Inviting ${member.name} <${member.email}>...`)

    try {
      const result = await sendInvite(member.email, member.name)

      if (result.status === 200 && result.data.success) {
        console.log(`  ✓ Invite sent`)
        results.success.push(member)
      } else if (result.data.error?.includes('already exists')) {
        console.log(`  - Skipped (user already exists)`)
        results.skipped.push({ ...member, reason: 'already exists' })
      } else {
        console.log(`  ✗ Failed: ${result.data.error || 'Unknown error'}`)
        results.failed.push({ ...member, error: result.data.error })
      }
    } catch (err) {
      console.log(`  ✗ Error: ${err.message}`)
      results.failed.push({ ...member, error: err.message })
    }

    // Rate limiting
    if (i < toInvite.length - 1) {
      await sleep(DELAY_MS)
    }
  }

  // Summary
  console.log('\n=== Summary ===')
  console.log(`Invites sent: ${results.success.length}`)
  console.log(`Skipped (already exist): ${results.skipped.length}`)
  console.log(`Failed: ${results.failed.length}`)

  if (results.failed.length > 0) {
    console.log('\nFailed invites:')
    results.failed.forEach(m => {
      console.log(`  - ${m.name} <${m.email}>: ${m.error}`)
    })
  }

  // Save results
  fs.writeFileSync('scripts/invite-results.json', JSON.stringify(results, null, 2))
  console.log('\nResults saved to scripts/invite-results.json')
}

main()
