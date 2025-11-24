/**
 * Bulk invite users to Netlify Identity using Admin API
 *
 * This script reads the list of users from .claude/list of users.txt
 * and invites them to Netlify Identity using the Admin API.
 *
 * Prerequisites:
 * - NETLIFY_ADMIN_TOKEN environment variable or passed as argument
 *
 * Usage:
 * node scripts/invite-users-admin.js <admin-token>
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SITE_URL = 'https://cboa.ca';
const ADMIN_TOKEN = process.argv[2] || process.env.NETLIFY_ADMIN_TOKEN;
const USER_LIST_FILE = path.join(__dirname, '..', '.claude', 'list of users.txt');

if (!ADMIN_TOKEN) {
  console.error('❌ Error: Admin token required');
  console.error('Usage: node scripts/invite-users-admin.js <admin-token>');
  process.exit(1);
}

// Read the user list
function readUserList() {
  try {
    const content = fs.readFileSync(USER_LIST_FILE, 'utf8');
    const emails = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && line.includes('@'));

    console.log(`Found ${emails.length} email addresses`);
    return emails;
  } catch (error) {
    console.error('Error reading user list:', error.message);
    process.exit(1);
  }
}

// Invite a single user using Admin API
async function inviteUser(email, token) {
  const inviteUrl = `${SITE_URL}/.netlify/identity/admin/users`;

  try {
    const response = await fetch(inviteUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: email,
        confirm: false, // Send confirmation email
      })
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, email, data };
    } else {
      const errorText = await response.text();
      let errorMsg = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMsg = errorJson.msg || errorJson.message || errorText;
      } catch (e) {
        // Keep original error text
      }
      return { success: false, email, error: errorMsg };
    }
  } catch (error) {
    return { success: false, email, error: error.message };
  }
}

// Delay function to avoid rate limiting
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function
async function main() {
  console.log('🚀 Starting Netlify Identity bulk invite process...\n');
  console.log(`Site URL: ${SITE_URL}`);
  console.log(`Using Admin API with token: ${ADMIN_TOKEN.substring(0, 10)}...\n`);

  const emails = readUserList();

  console.log('📧 Inviting users via Admin API...');
  console.log('Users will receive invitation emails to set up their accounts.\n');

  const results = {
    success: [],
    failed: [],
    skipped: []
  };

  // Process emails with rate limiting
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    console.log(`[${i + 1}/${emails.length}] Processing: ${email}`);

    const result = await inviteUser(email, ADMIN_TOKEN);

    if (result.success) {
      console.log(`  ✅ Invited successfully`);
      results.success.push(email);
    } else if (result.error && (result.error.includes('already') || result.error.includes('exists'))) {
      console.log(`  ⏭️  Already exists`);
      results.skipped.push(email);
    } else {
      console.log(`  ❌ Failed: ${result.error}`);
      results.failed.push({ email, error: result.error });
    }

    // Rate limiting: wait 300ms between requests
    if (i < emails.length - 1) {
      await delay(300);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successfully invited: ${results.success.length}`);
  console.log(`⏭️  Already existed: ${results.skipped.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`📧 Total processed: ${emails.length}`);
  console.log('='.repeat(50));

  if (results.failed.length > 0) {
    console.log('\n❌ Failed invitations:');
    results.failed.forEach(({ email, error }) => {
      console.log(`  - ${email}: ${error}`);
    });
  }

  // Save results to file
  const resultsFile = path.join(__dirname, 'invite-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  console.log(`\n📝 Detailed results saved to: ${resultsFile}`);
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
