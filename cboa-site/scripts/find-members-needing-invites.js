// Script to find members who need portal invites
// Run with: node scripts/find-members-needing-invites.js

const API_BASE = process.env.API_URL || 'http://localhost:9001/.netlify/functions'

async function main() {
  try {
    // Fetch all members
    const membersRes = await fetch(`${API_BASE}/members`)
    const members = await membersRes.json()
    console.log(`Total members: ${members.length}`)

    // Members without user_id = no auth account linked
    const membersWithoutAuth = members.filter(m => !m.user_id)
    console.log(`Members without portal account (no user_id): ${membersWithoutAuth.length}`)

    // Output the list
    console.log('\n--- Members needing invites ---')
    const needingInvites = membersWithoutAuth.map(m => ({
      name: m.name,
      email: m.email
    }))

    console.log(JSON.stringify(needingInvites, null, 2))

    // Save to file
    const fs = require('fs')
    fs.writeFileSync(
      'scripts/members-needing-invites.json',
      JSON.stringify(needingInvites, null, 2)
    )
    console.log(`\nSaved ${needingInvites.length} members to scripts/members-needing-invites.json`)

  } catch (err) {
    console.error('Error:', err.message)
  }
}

main()
