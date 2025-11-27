/**
 * Resend invites to all pending Netlify Identity users
 *
 * This script fetches all users from Netlify Identity, filters for those
 * who haven't confirmed their accounts, and resends invitation emails.
 *
 * Prerequisites:
 * - GoTrue Admin JWT Token (get from browser DevTools - see instructions below)
 *
 * Usage:
 * node scripts/resend-pending-invites.js <gotrue-admin-token> [--dry-run]
 *
 * Options:
 * --dry-run    List pending users without resending invites
 *
 * How to get the GoTrue Admin Token:
 * 1. Go to Netlify Dashboard > Your Site > Integrations > Identity
 * 2. Open browser DevTools (F12) > Network tab
 * 3. Click on any user in the Identity users list
 * 4. Find a request to /.netlify/identity/admin/users
 * 5. Copy the Authorization header value (after "Bearer ")
 *    It looks like: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SITE_URL = 'https://cboa.ca';
const ADMIN_TOKEN = process.argv.find(arg => !arg.startsWith('--') && arg !== process.argv[0] && arg !== process.argv[1]) || process.env.GOTRUE_ADMIN_TOKEN;
const DRY_RUN = process.argv.includes('--dry-run');

if (!ADMIN_TOKEN) {
  console.error('❌ Error: GoTrue admin token required');
  console.error('Usage: node scripts/resend-pending-invites.js <gotrue-admin-token> [--dry-run]');
  console.error('\nHow to get the token:');
  console.error('1. Go to Netlify Dashboard > Your Site > Integrations > Identity');
  console.error('2. Open browser DevTools (F12) > Network tab');
  console.error('3. Click on any user in the Identity users list');
  console.error('4. Find a request to /.netlify/identity/admin/users');
  console.error('5. Copy the Authorization header value (after "Bearer ")');
  console.error('   It looks like: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
  process.exit(1);
}

// Check if token looks like a JWT
function isValidJWT(token) {
  const parts = token.split('.');
  return parts.length === 3;
}

if (!isValidJWT(ADMIN_TOKEN)) {
  console.error('❌ Error: Token does not appear to be a valid JWT');
  console.error('   JWT tokens have 3 parts separated by dots (.)');
  console.error('   Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U');
  console.error('\n   You provided a token starting with:', ADMIN_TOKEN.substring(0, 20) + '...');
  process.exit(1);
}

// Fetch all users from Netlify Identity
async function fetchAllUsers(token) {
  const users = [];
  let page = 1;
  const perPage = 100;

  console.log('📥 Fetching users from Netlify Identity...');

  while (true) {
    const url = `${SITE_URL}/.netlify/identity/admin/users?page=${page}&per_page=${perPage}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch users: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.users || data.users.length === 0) {
        break;
      }

      users.push(...data.users);
      console.log(`  Fetched page ${page}: ${data.users.length} users (total: ${users.length})`);

      if (data.users.length < perPage) {
        break;
      }

      page++;
    } catch (error) {
      throw new Error(`Error fetching page ${page}: ${error.message}`);
    }
  }

  return users;
}

// Filter for pending/unconfirmed users
function filterPendingUsers(users) {
  return users.filter(user => {
    // Users who haven't confirmed their email
    const isUnconfirmed = !user.confirmed_at;
    // Users who were invited but haven't set up their account
    const isInvited = user.invited_at && !user.confirmed_at;

    return isUnconfirmed || isInvited;
  });
}

// Resend invite to a user by re-creating them (GoTrue will send a new invite)
async function resendInvite(email, token) {
  const inviteUrl = `${SITE_URL}/.netlify/identity/admin/users`;

  try {
    // First, try to delete the user
    // We need to get the user ID first
    const usersResponse = await fetch(`${inviteUrl}?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    // Create/invite the user again - this should resend the invite
    const response = await fetch(`${SITE_URL}/.netlify/identity/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: email,
      })
    });

    if (response.ok) {
      return { success: true, email };
    } else {
      const errorText = await response.text();

      // Try the admin endpoint as fallback
      const adminResponse = await fetch(`${SITE_URL}/.netlify/identity/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: email,
          confirm: false, // Don't auto-confirm, send invite email
        })
      });

      if (adminResponse.ok) {
        return { success: true, email, method: 'admin' };
      }

      const adminError = await adminResponse.text();
      return { success: false, email, error: `invite: ${errorText}, admin: ${adminError}` };
    }
  } catch (error) {
    return { success: false, email, error: error.message };
  }
}

// Alternative: Delete and re-invite user
async function deleteAndReinvite(userId, email, token) {
  try {
    // Delete the user
    const deleteResponse = await fetch(`${SITE_URL}/.netlify/identity/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      return { success: false, email, error: `Delete failed: ${errorText}` };
    }

    // Small delay before re-inviting
    await delay(200);

    // Re-invite the user
    const inviteResponse = await fetch(`${SITE_URL}/.netlify/identity/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: email,
        confirm: false,
      })
    });

    if (inviteResponse.ok) {
      return { success: true, email };
    } else {
      const errorText = await inviteResponse.text();
      return { success: false, email, error: `Re-invite failed: ${errorText}` };
    }
  } catch (error) {
    return { success: false, email, error: error.message };
  }
}

// Delay function to avoid rate limiting
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Format date for display
function formatDate(dateString) {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Main function
async function main() {
  console.log('🔄 Resend Pending Invites Script');
  console.log('='.repeat(50));
  console.log(`Site URL: ${SITE_URL}`);
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no invites will be sent)' : 'LIVE'}`);
  console.log('='.repeat(50) + '\n');

  try {
    // Fetch all users
    const allUsers = await fetchAllUsers(ADMIN_TOKEN);
    console.log(`\n📊 Total users in Identity: ${allUsers.length}`);

    // Filter pending users
    const pendingUsers = filterPendingUsers(allUsers);
    console.log(`📋 Pending/unconfirmed users: ${pendingUsers.length}\n`);

    if (pendingUsers.length === 0) {
      console.log('✅ No pending invites to resend!');
      return;
    }

    // Display pending users
    console.log('Pending users:');
    console.log('-'.repeat(70));
    pendingUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   Invited: ${formatDate(user.invited_at)}`);
      console.log(`   Created: ${formatDate(user.created_at)}`);
      console.log(`   Confirmed: ${user.confirmed_at ? formatDate(user.confirmed_at) : 'Not confirmed'}`);
    });
    console.log('-'.repeat(70) + '\n');

    if (DRY_RUN) {
      console.log('🔍 DRY RUN - No invites sent');
      console.log('Run without --dry-run to resend invites');
      return;
    }

    // Resend invites
    console.log('📧 Resending invites...\n');

    const results = {
      success: [],
      failed: []
    };

    for (let i = 0; i < pendingUsers.length; i++) {
      const user = pendingUsers[i];
      console.log(`[${i + 1}/${pendingUsers.length}] ${user.email}`);

      const result = await deleteAndReinvite(user.id, user.email, ADMIN_TOKEN);

      if (result.success) {
        console.log(`  ✅ Invite resent successfully`);
        results.success.push(user.email);
      } else {
        console.log(`  ❌ Failed: ${result.error}`);
        results.failed.push({ email: user.email, error: result.error });
      }

      // Rate limiting
      if (i < pendingUsers.length - 1) {
        await delay(500);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successfully resent: ${results.success.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log('='.repeat(50));

    if (results.failed.length > 0) {
      console.log('\n❌ Failed resends:');
      results.failed.forEach(({ email, error }) => {
        console.log(`  - ${email}: ${error}`);
      });
    }

    // Save results
    const resultsFile = path.join(__dirname, 'resend-results.json');
    fs.writeFileSync(resultsFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      totalPending: pendingUsers.length,
      results
    }, null, 2));
    console.log(`\n📝 Results saved to: ${resultsFile}`);

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
