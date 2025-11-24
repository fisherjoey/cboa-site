/**
 * Set roles using Netlify Platform API with Personal Access Token
 *
 * Usage:
 * node scripts/set-roles-netlify-api.js <personal-access-token>
 */

const fs = require('fs');
const path = require('path');

const SITE_ID = '71d20597-f02e-40d9-8ad3-f1b2938d8dfe';
const NETLIFY_API = 'https://api.netlify.com/api/v1';
const USER_LIST_FILE = path.join(__dirname, '..', '.claude', 'list of users.txt');

const accessToken = process.argv[2];

if (!accessToken) {
  console.error('❌ Error: Personal access token required');
  console.error('Usage: node scripts/set-roles-netlify-api.js <personal-access-token>');
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
  console.log('🚀 Netlify API Role Assignment Script\n');
  console.log(`Site ID: ${SITE_ID}\n`);

  // Read email list
  const emailList = readUserList();

  // Fetch all users using Netlify API
  console.log('📋 Fetching all users...');
  let allUsers;
  try {
    const response = await fetch(`${NETLIFY_API}/sites/${SITE_ID}/identity/users?per_page=1000`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch users: ${response.status} ${errorText}`);
    }

    allUsers = await response.json();
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
        const response = await fetch(`${NETLIFY_API}/sites/${SITE_ID}/identity/users/${user.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
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
