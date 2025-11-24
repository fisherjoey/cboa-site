/**
 * Set roles for users in the list of users.txt file
 *
 * This script reads emails from .claude/list of users.txt and sets their role to "official"
 *
 * Usage:
 * node scripts/set-roles-from-list.js <site-id> <access-token>
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SITE_ID = process.argv[2] || process.env.NETLIFY_SITE_ID;
const ACCESS_TOKEN = process.argv[3] || process.env.NETLIFY_ACCESS_TOKEN;
const ROLE = 'official'; // Set all users from list to official
const USER_LIST_FILE = path.join(__dirname, '..', '.claude', 'list of users.txt');

if (!SITE_ID || !ACCESS_TOKEN) {
  console.error('❌ Error: Site ID and Access Token required');
  console.error('Usage: node scripts/set-roles-from-list.js <site-id> <access-token>');
  process.exit(1);
}

// Netlify API endpoints
const NETLIFY_API = 'https://api.netlify.com/api/v1';

// Read the user list
function readUserList() {
  try {
    const content = fs.readFileSync(USER_LIST_FILE, 'utf8');
    const emails = content
      .split('\n')
      .map(line => line.trim().toLowerCase())
      .filter(line => line && line.includes('@'));

    console.log(`Found ${emails.length} email addresses in list`);
    return new Set(emails); // Use Set for fast lookup
  } catch (error) {
    console.error('Error reading user list:', error.message);
    process.exit(1);
  }
}

// Get all Identity users
async function getAllUsers(siteId, token) {
  try {
    const response = await fetch(`${NETLIFY_API}/sites/${siteId}/identity/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch users: ${error}`);
    }

    const users = await response.json();
    return users;
  } catch (error) {
    throw new Error(`Error fetching users: ${error.message}`);
  }
}

// Update user metadata
async function updateUserRole(siteId, token, userId, role) {
  try {
    const response = await fetch(`${NETLIFY_API}/sites/${siteId}/identity/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_metadata: {
          role: role
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return { success: false, error };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Delay function to avoid rate limiting
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function
async function main() {
  console.log('🚀 Starting role assignment for users in list...\n');
  console.log(`Site ID: ${SITE_ID}`);
  console.log(`Role to assign: ${ROLE}\n`);

  // Read email list
  const emailList = readUserList();

  // Fetch all users
  console.log('📋 Fetching all users from Netlify Identity...');
  let allUsers;
  try {
    allUsers = await getAllUsers(SITE_ID, ACCESS_TOKEN);
    console.log(`✅ Found ${allUsers.length} total users in Netlify Identity\n`);
  } catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  }

  if (allUsers.length === 0) {
    console.log('No users found in Netlify Identity. Exiting.');
    return;
  }

  // Filter to only users in the email list
  const usersToUpdate = allUsers.filter(user =>
    emailList.has(user.email.toLowerCase())
  );

  console.log(`📧 Found ${usersToUpdate.length} users matching the email list\n`);

  if (usersToUpdate.length === 0) {
    console.log('No matching users found. Exiting.');
    return;
  }

  console.log('🔄 Updating user roles...\n');

  const results = {
    success: [],
    failed: [],
    skipped: []
  };

  // Process users with rate limiting
  for (let i = 0; i < usersToUpdate.length; i++) {
    const user = usersToUpdate[i];
    const email = user.email;
    const currentRole = user.app_metadata?.role;

    console.log(`[${i + 1}/${usersToUpdate.length}] Processing: ${email}`);

    // Skip if already has the role
    if (currentRole === ROLE) {
      console.log(`  ⏭️  Already has role: ${ROLE}`);
      results.skipped.push({ email, currentRole });
    } else {
      const result = await updateUserRole(SITE_ID, ACCESS_TOKEN, user.id, ROLE);

      if (result.success) {
        console.log(`  ✅ Updated: ${currentRole || 'none'} → ${ROLE}`);
        results.success.push({ email, oldRole: currentRole, newRole: ROLE });
      } else {
        console.log(`  ❌ Failed: ${result.error}`);
        results.failed.push({ email, error: result.error });
      }
    }

    // Rate limiting: wait 200ms between requests
    if (i < usersToUpdate.length - 1) {
      await delay(200);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successfully updated: ${results.success.length}`);
  console.log(`⏭️  Already had role: ${results.skipped.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`📧 Total in list: ${emailList.size}`);
  console.log(`👥 Total processed: ${usersToUpdate.length}`);
  console.log('='.repeat(50));

  if (results.failed.length > 0) {
    console.log('\n❌ Failed updates:');
    results.failed.forEach(({ email, error }) => {
      console.log(`  - ${email}: ${error}`);
    });
  }

  // Save results to file
  const resultsFile = path.join(__dirname, 'role-update-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log(`\n📝 Detailed results saved to: ${resultsFile}`);
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
