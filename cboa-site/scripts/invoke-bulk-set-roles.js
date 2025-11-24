/**
 * Helper script to invoke the bulk-set-roles Netlify function
 *
 * Usage:
 * node scripts/invoke-bulk-set-roles.js <jwt-token> [port]
 */

const jwtToken = process.argv[2];
const port = process.argv[3] || '8889';

if (!jwtToken) {
  console.error('❌ Error: JWT token required');
  console.error('Usage: node scripts/invoke-bulk-set-roles.js <jwt-token> [port]');
  process.exit(1);
}

async function invokeFunct() {
  try {
    console.log(`🚀 Invoking bulk-set-roles function on port ${port}...`);
    console.log(`Token: ${jwtToken.substring(0, 50)}...`);

    const response = await fetch(`http://localhost:${port}/.netlify/functions/bulk-set-roles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({})
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Function invocation failed:');
      console.error(JSON.stringify(data, null, 2));
      process.exit(1);
    }

    console.log('\n✅ Function invocation successful!');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error invoking function:', error.message);
    process.exit(1);
  }
}

invokeFunct();
