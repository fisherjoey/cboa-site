/**
 * Set roles using gotrue-js library
 *
 * Usage:
 * node scripts/set-roles-with-gotrue.js <admin-email> <admin-password>
 */

const fs = require('fs');
const path = require('path');
const GoTrue = require('gotrue-js').default;

const SITE_URL = 'https://cboa.ca';
const USER_LIST_FILE = path.join(__dirname, '..', '.claude', 'list of users.txt');

const adminEmail = process.argv[2];
const adminPassword = process.argv[3];

if (!adminEmail || !adminPassword) {
  console.error('❌ Error: Admin email and password required');
  console.error('Usage: node scripts/set-roles-with-gotrue.js <admin-email> <admin-password>');
  process.exit(1);
}

// Read the user list
function readUserList() {
  try {
    const content = fs.readFileSync(USER_LIST_FILE, 'utf8');
    const emails = content
      .split('\n')
      .map(line => line.trim().toLowerCase())
      .filter(line => line && line.includes('@'));

    console.log(`Found ${emails.length} email addresses in list`);
    return new Set(emails);
  } catch (error) {
    console.error('Error reading user list:', error.message);
    process.exit(1);
  }
}

// Delay function
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function
async function main() {
  console.log('🚀 GoTrue Role Assignment Script\n');
  console.log(`Site: ${SITE_URL}\n`);

  // Read email list
  const emailList = readUserList();

  // Initialize GoTrue
  const auth = new GoTrue({
    APIUrl: `${SITE_URL}/.netlify/identity`,
    audience: '',
    setCookie: false,
  });

  // Login as admin
  console.log('🔐 Logging in as admin...');
  let currentUser;
  try {
    currentUser = await auth.login(adminEmail, adminPassword, true);
    console.log('✅ Logged in successfully\n');
  } catch (error) {
    console.error(`❌ Login failed: ${error.message}`);
    process.exit(1);
  }

  // Check if user is admin
  if (currentUser.app_metadata?.role !== 'admin') {
    console.error('❌ Error: You must be an admin to run this script');
    process.exit(1);
  }

  // Fetch all users using admin API
  console.log('📋 Fetching all users...');
  const token = currentUser.token.access_token;

  let allUsers;
  try {
    const response = await fetch(`${SITE_URL}/.netlify/identity/admin/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    const data = await response.json();
    allUsers = data.users || data;
    console.log(`✅ Found ${allUsers.length} total users\n`);
  } catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  }

  // Filter to users in list
  const usersToUpdate = allUsers.filter(user =>
    emailList.has(user.email.toLowerCase())
  );

  console.log(`📧 Found ${usersToUpdate.length} users matching the email list\n`);

  if (usersToUpdate.length === 0) {
    console.log('No matching users found. Exiting.');
    return;
  }

  console.log('🔄 Updating user roles to "official"...\n');

  const results = {
    success: [],
    failed: [],
    skipped: []
  };

  // Process users
  for (let i = 0; i < usersToUpdate.length; i++) {
    const user = usersToUpdate[i];
    const email = user.email;
    const currentRole = user.app_metadata?.role;

    console.log(`[${i + 1}/${usersToUpdate.length}] Processing: ${email}`);

    if (currentRole === 'official') {
      console.log(`  ⏭️  Already official`);
      results.skipped.push({ email, currentRole });
    } else {
      try {
        const response = await fetch(`${SITE_URL}/.netlify/identity/admin/users/${user.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            app_metadata: {
              role: 'official'
            }
          })
        });

        if (response.ok) {
          console.log(`  ✅ Updated: ${currentRole || 'none'} → official`);
          results.success.push({ email, oldRole: currentRole, newRole: 'official' });
        } else {
          const errorText = await response.text();
          console.log(`  ❌ Failed: ${errorText}`);
          results.failed.push({ email, error: errorText });
        }
      } catch (error) {
        console.log(`  ❌ Failed: ${error.message}`);
        results.failed.push({ email, error: error.message });
      }
    }

    // Rate limiting
    if (i < usersToUpdate.length - 1) {
      await delay(200);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successfully updated: ${results.success.length}`);
  console.log(`⏭️  Already had role: ${results.skipped.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log('='.repeat(50));

  if (results.failed.length > 0) {
    console.log('\n❌ Failed updates:');
    results.failed.forEach(({ email, error }) => {
      console.log(`  - ${email}: ${error}`);
    });
  }

  // Save results
  const resultsFile = path.join(__dirname, 'role-update-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log(`\n📝 Results saved to: ${resultsFile}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
