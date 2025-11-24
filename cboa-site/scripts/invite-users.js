/**
 * Bulk invite users to Netlify Identity
 *
 * This script reads the list of users from .claude/list of users.txt
 * and invites them to Netlify Identity using the GoTrue API.
 *
 * Prerequisites:
 * - Set NETLIFY_SITE_URL environment variable (e.g., https://cboa.ca)
 *
 * Usage:
 * node scripts/invite-users.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SITE_URL = process.env.NETLIFY_SITE_URL || 'https://cboa.ca';
const IDENTITY_API_URL = `${SITE_URL}/.netlify/identity/admin`;
const USER_LIST_FILE = path.join(__dirname, '..', '.claude', 'list of users.txt');

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

// Invite a single user
async function inviteUser(email, siteUrl) {
  const inviteUrl = `${siteUrl}/.netlify/identity/signup`;

  try {
    const response = await fetch(inviteUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
      })
    });

    if (response.ok) {
      return { success: true, email };
    } else {
      const errorText = await response.text();
      return { success: false, email, error: errorText };
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
  console.log(`Site URL: ${SITE_URL}\n`);

  const emails = readUserList();

  console.log('Note: This uses the public signup endpoint.');
  console.log('Users will receive invitation emails to create their accounts.\n');

  const results = {
    success: [],
    failed: [],
    skipped: []
  };

  // Process emails with rate limiting
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    console.log(`[${i + 1}/${emails.length}] Processing: ${email}`);

    const result = await inviteUser(email, SITE_URL);

    if (result.success) {
      console.log(`  ✅ Invited successfully`);
      results.success.push(email);
    } else if (result.error && result.error.includes('already')) {
      console.log(`  ⏭️  Already exists`);
      results.skipped.push(email);
    } else {
      console.log(`  ❌ Failed: ${result.error}`);
      results.failed.push({ email, error: result.error });
    }

    // Rate limiting: wait 500ms between requests
    if (i < emails.length - 1) {
      await delay(500);
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successfully invited: ${results.success.length}`);
  console.log(`⏭️  Already existed: ${results.skipped.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
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
