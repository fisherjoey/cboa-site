/**
 * Test sending email from scheduler@cboa.ca via Microsoft Graph API
 *
 * Usage: node scripts/test-scheduler-email.js
 *
 * Requires these env vars (from .env or Netlify):
 * - MICROSOFT_TENANT_ID
 * - MICROSOFT_CLIENT_ID
 * - MICROSOFT_CLIENT_SECRET
 */

require('dotenv').config({ path: '.env.local' });

async function getAccessToken() {
  const tokenEndpoint = `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`;

  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID || '',
    client_secret: process.env.MICROSOFT_CLIENT_SECRET || '',
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials'
  });

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function sendTestEmail(accessToken, senderEmail, recipients) {
  const graphEndpoint = `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`;

  const emailMessage = {
    message: {
      subject: `[TEST] Graph API Email Test from ${senderEmail}`,
      body: {
        contentType: 'HTML',
        content: `
          <h2>Test Email</h2>
          <p>This is a test email sent via Microsoft Graph API.</p>
          <ul>
            <li><strong>Sender:</strong> ${senderEmail}</li>
            <li><strong>Time:</strong> ${new Date().toISOString()}</li>
            <li><strong>Purpose:</strong> Verify Graph API can send from scheduler@cboa.ca</li>
          </ul>
          <p>If you received this, the configuration is working!</p>
        `
      },
      from: {
        emailAddress: { address: senderEmail }
      },
      toRecipients: recipients.map(email => ({
        emailAddress: { address: email }
      }))
    },
    saveToSentItems: true
  };

  const response = await fetch(graphEndpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(emailMessage)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return true;
}

async function main() {
  console.log('=== Graph API Email Test ===\n');

  // Check env vars
  const required = ['MICROSOFT_TENANT_ID', 'MICROSOFT_CLIENT_ID', 'MICROSOFT_CLIENT_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('Missing environment variables:', missing.join(', '));
    console.error('\nMake sure you have a .env.local file with these values.');
    process.exit(1);
  }

  const senderEmail = 'no-reply@cboa.ca';
  const recipients = ['webmaster@cboa.ca', 'joey@streamdata.com'];

  console.log(`Sender: ${senderEmail}`);
  console.log(`Recipients: ${recipients.join(', ')}\n`);

  try {
    console.log('1. Getting access token...');
    const accessToken = await getAccessToken();
    console.log('   ✓ Access token obtained\n');

    console.log('2. Sending test email...');
    await sendTestEmail(accessToken, senderEmail, recipients);
    console.log('   ✓ Email sent successfully!\n');

    console.log('=== SUCCESS ===');
    console.log(`Check ${recipients.join(' and ')} for the test email.`);

  } catch (error) {
    console.error('\n=== FAILED ===');
    console.error(error.message);

    if (error.message.includes('ErrorAccessDenied') || error.message.includes('403')) {
      console.error('\nThis likely means the app does not have permission to send from scheduler@cboa.ca.');
      console.error('You may need to create an Application Access Policy or use a different sender.');
    }

    process.exit(1);
  }
}

main();
