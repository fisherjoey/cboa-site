/**
 * Set roles using GoTrue API directly
 *
 * This script uses your admin credentials to get a JWT token,
 * then uses that token to update user roles via GoTrue API
 *
 * Usage:
 * node scripts/set-roles-gotrue.js
 *
 * You'll be prompted for your admin email and password
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const SITE_URL = 'https://cboa.ca';
const GOTRUE_URL = `${SITE_URL}/.netlify/identity`;
const USER_LIST_FILE = path.join(__dirname, '..', '.claude', 'list of users.txt');

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

// Prompt for password
function promptPassword(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Hide input
    const stdin = process.stdin;
    stdin.on('data', (char) => {
      char = char + '';
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.pause();
          break;
        default:
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          process.stdout.write(query + '*'.repeat(rl.line.length));
          break;
      }
    });

    rl.question(query, (value) => {
      rl.close();
      console.log('');
      resolve(value);
    });
  });
}

// Login as admin
async function loginAsAdmin(email, password) {
  try {
    const response = await fetch(`${GOTRUE_URL}/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Login failed: ${error}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    throw new Error(`Error logging in: ${error.message}`);
  }
}

// Get all users
async function getAllUsers(token) {
  try {
    const response = await fetch(`${GOTRUE_URL}/admin/users`, {
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

    const data = await response.json();
    return data.users || data;
  } catch (error) {
    throw new Error(`Error fetching users: ${error.message}`);
  }
}

// Update user role
async function updateUserRole(token, userId, role) {
  try {
    const response = await fetch(`${GOTRUE_URL}/admin/users/${userId}`, {
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

  // Get admin credentials
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const adminEmail = await new Promise((resolve) => {
    rl.question('Admin email: ', resolve);
  });

  const adminPassword = await promptPassword('Admin password: ');
  rl.close();

  // Login
  console.log('\n🔐 Logging in...');
  let token;
  try {
    token = await loginAsAdmin(adminEmail, adminPassword);
    console.log('✅ Logged in successfully\n');
  } catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  }

  // Fetch all users
  console.log('📋 Fetching all users...');
  let allUsers;
  try {
    allUsers = await getAllUsers(token);
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
      const result = await updateUserRole(token, user.id, 'official');

      if (result.success) {
        console.log(`  ✅ Updated: ${currentRole || 'none'} → official`);
        results.success.push({ email, oldRole: currentRole, newRole: 'official' });
      } else {
        console.log(`  ❌ Failed: ${result.error}`);
        results.failed.push({ email, error: result.error });
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
