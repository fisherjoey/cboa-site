// Compare Supabase auth users with members table
// Run with: AUTH_TOKEN=xxx node scripts/compare-auth-and-members.js

const API_BASE = process.env.API_URL || 'http://localhost:9000/.netlify/functions'
const AUTH_TOKEN = process.env.AUTH_TOKEN

async function main() {
  if (!AUTH_TOKEN) {
    console.log('No AUTH_TOKEN provided - using local API which may require auth')
  }

  try {
    // Fetch all members
    const membersRes = await fetch(`${API_BASE}/members`)
    const members = await membersRes.json()
    const memberEmails = new Set(members.map(m => m.email.toLowerCase()))
    console.log(`Total members in database: ${members.length}`)

    // Fetch auth users
    const headers = AUTH_TOKEN ? { 'Authorization': `Bearer ${AUTH_TOKEN}` } : {}
    const authRes = await fetch(`${API_BASE}/supabase-auth-admin?action=list`, { headers })

    if (!authRes.ok) {
      console.log('Could not fetch auth users (need auth token)')
      console.log('Use: AUTH_TOKEN=<your-jwt> node scripts/compare-auth-and-members.js')
      return
    }

    const authData = await authRes.json()
    const authUsers = authData.users || []
    console.log(`Total Supabase auth users: ${authUsers.length}`)

    // Find auth users not in members
    const authWithoutMembers = authUsers.filter(u =>
      !memberEmails.has(u.email?.toLowerCase())
    )

    // Find members not in auth
    const authEmails = new Set(authUsers.map(u => u.email?.toLowerCase()))
    const membersWithoutAuth = members.filter(m =>
      !authEmails.has(m.email.toLowerCase())
    )

    console.log(`\nAuth users WITHOUT member records: ${authWithoutMembers.length}`)
    if (authWithoutMembers.length > 0) {
      authWithoutMembers.forEach(u => {
        console.log(`  - ${u.name || 'No name'} <${u.email}> ${u.confirmed ? '✓' : '(pending)'}`)
      })
    }

    console.log(`\nMembers WITHOUT auth accounts: ${membersWithoutAuth.length}`)
    if (membersWithoutAuth.length > 0 && membersWithoutAuth.length <= 20) {
      membersWithoutAuth.forEach(m => {
        console.log(`  - ${m.name} <${m.email}>`)
      })
    }

    // Save for import
    if (authWithoutMembers.length > 0) {
      const fs = require('fs')
      const toImport = authWithoutMembers.map(u => ({
        email: u.email,
        name: u.name || u.email.split('@')[0],
        user_id: u.id,
        confirmed: u.confirmed
      }))
      fs.writeFileSync('scripts/auth-users-to-import.json', JSON.stringify(toImport, null, 2))
      console.log(`\nSaved ${toImport.length} auth users to scripts/auth-users-to-import.json`)
    }

  } catch (err) {
    console.error('Error:', err.message)
  }
}

main()
