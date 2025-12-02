// Find Supabase auth users who don't have member records
// Run with: node scripts/find-auth-users-without-members.js

const API_BASE = process.env.API_URL || 'http://localhost:9001/.netlify/functions'

async function main() {
  try {
    // Fetch all members
    const membersRes = await fetch(`${API_BASE}/members`)
    const members = await membersRes.json()
    const memberEmails = new Set(members.map(m => m.email.toLowerCase()))
    console.log(`Total members: ${members.length}`)

    // We need to check Supabase auth users - let's read from the backup file
    const fs = require('fs')

    // Check if we have the supabase users backup
    if (fs.existsSync('scripts/supabase-users-backup.json')) {
      const authUsers = JSON.parse(fs.readFileSync('scripts/supabase-users-backup.json', 'utf8'))
      console.log(`Total Supabase auth users: ${authUsers.length}`)

      // Find auth users not in members
      const authWithoutMembers = authUsers.filter(u =>
        !memberEmails.has(u.email?.toLowerCase())
      )

      console.log(`Auth users without member records: ${authWithoutMembers.length}`)
      console.log('\n--- Auth users needing member records ---')

      authWithoutMembers.forEach(u => {
        console.log(`  ${u.user_metadata?.full_name || u.user_metadata?.name || 'No name'} <${u.email}> - ${u.email_confirmed_at ? 'confirmed' : 'pending'}`)
      })

      // Save to file
      const toImport = authWithoutMembers.map(u => ({
        email: u.email,
        name: u.user_metadata?.full_name || u.user_metadata?.name || u.email.split('@')[0],
        confirmed: !!u.email_confirmed_at,
        user_id: u.id
      }))

      fs.writeFileSync('scripts/auth-users-to-import.json', JSON.stringify(toImport, null, 2))
      console.log(`\nSaved to scripts/auth-users-to-import.json`)
    } else {
      console.log('No supabase-users-backup.json found. Need to fetch from API.')
      console.log('You can use the Portal Users modal to see and import auth users.')
    }

  } catch (err) {
    console.error('Error:', err.message)
  }
}

main()
