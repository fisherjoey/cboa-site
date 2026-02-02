/**
 * Test OSA form submission email (full email with PDFs)
 *
 * Usage: npx netlify dev:exec node scripts/test-osa-email.js
 */

const fs = require('fs');
const path = require('path');

// Load PDF as base64
function loadPdfAsBase64(filename) {
  const possiblePaths = [
    path.join(process.cwd(), 'public', 'documents', filename),
    path.join(process.cwd(), 'public', filename),
  ];

  for (const filePath of possiblePaths) {
    try {
      const fileBuffer = fs.readFileSync(filePath);
      console.log(`   ✓ Loaded ${filename}`);
      return fileBuffer.toString('base64');
    } catch {
      // Try next path
    }
  }
  console.log(`   ✗ Could not find ${filename}`);
  return null;
}

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

// Generate the CBOA email template (simplified version)
function generateCBOAEmailTemplate({ subject, content, previewText }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <!--[if !mso]><!-->
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--<![endif]-->
  <style>
    body { margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
    table { border-spacing: 0; }
    td { padding: 0; }
    img { border: 0; }
    a { color: #F97316; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;">
  ${previewText ? `<div style="display: none; max-height: 0; overflow: hidden;">${previewText}</div>` : ''}

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 20px 10px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff;" align="center">
          <!-- Header -->
          <tr>
            <td style="background-color: #1f2937; padding: 24px 20px; border-bottom: 3px solid #F97316; text-align: center;">
              <img src="https://i.imgur.com/BQe360J.png" alt="CBOA Logo" style="max-width: 70px; height: auto; display: inline-block; margin-bottom: 12px;">
              <h1 style="color: #ffffff; margin: 0 0 4px 0; font-size: 18px; font-weight: 700;">Calgary Basketball Officials Association</h1>
              <p style="color: #ffffff; margin: 0; font-size: 14px; font-weight: 500; opacity: 0.95;">Excellence in Basketball Officiating</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 30px 20px; color: #333333; font-size: 16px; line-height: 1.6;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 20px; text-align: center;">
              <p style="color: #9ca3af; margin: 0 0 8px 0; font-size: 14px;">Calgary Basketball Officials Association</p>
              <p style="color: #6b7280; margin: 0; font-size: 12px;">
                <a href="https://cboa.ca" style="color: #F97316;">cboa.ca</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Generate client confirmation email content
function generateClientEmailContent(data) {
  const eventCount = data.events.length;

  const eventsHtml = data.events.map((event, index) => {
    let eventDetails = '';

    if (event.eventType === 'League') {
      eventDetails = `
        <tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">League Name:</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${event.leagueName}</td></tr>
        <tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Start Date:</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${event.leagueStartDate}</td></tr>
        <tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">End Date:</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${event.leagueEndDate}</td></tr>
        <tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Day(s) of Week:</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${event.leagueDaysOfWeek}</td></tr>
        <tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Player Gender:</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${event.leaguePlayerGender}</td></tr>
        <tr><td style="padding: 12px; font-weight: 600;">Level of Play:</td>
            <td style="padding: 12px;">${event.leagueLevelOfPlay}</td></tr>
      `;
    } else if (event.eventType === 'Tournament') {
      eventDetails = `
        <tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Tournament Name:</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${event.tournamentName}</td></tr>
        <tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Start Date:</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${event.tournamentStartDate}</td></tr>
        <tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">End Date:</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${event.tournamentEndDate}</td></tr>
        <tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Number of Games:</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${event.tournamentNumberOfGames}</td></tr>
        <tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Player Gender:</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${event.tournamentPlayerGender}</td></tr>
        <tr><td style="padding: 12px; font-weight: 600;">Level of Play:</td>
            <td style="padding: 12px;">${event.tournamentLevelOfPlay}</td></tr>
      `;
    } else {
      // Exhibition
      const games = event.exhibitionGames || [];
      let gamesHtml = '';
      if (games.length > 1) {
        gamesHtml = `
          <tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; vertical-align: top;">Game Schedule:</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
                <ul style="margin: 0; padding-left: 20px;">
                  ${games.map(g => `<li>${g.date} at ${g.time} (${g.numberOfGames} game${parseInt(g.numberOfGames) > 1 ? 's' : ''})</li>`).join('')}
                </ul>
              </td></tr>
        `;
      } else if (games.length === 1) {
        gamesHtml = `
          <tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Game Date:</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${games[0].date}</td></tr>
          <tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Start Time:</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${games[0].time}</td></tr>
          <tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Number of Games:</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${games[0].numberOfGames}</td></tr>
        `;
      }
      eventDetails = `
        <tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Event Type:</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">Exhibition Game(s)</td></tr>
        <tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Game Location:</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${event.exhibitionGameLocation}</td></tr>
        ${gamesHtml}
        <tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Player Gender:</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${event.exhibitionPlayerGender}</td></tr>
        <tr><td style="padding: 12px; font-weight: 600;">Level of Play:</td>
            <td style="padding: 12px;">${event.exhibitionLevelOfPlay}</td></tr>
      `;
    }

    return `
      <h3 style="color: #1e3a5f; margin-top: 24px; margin-bottom: 12px;">Event ${index + 1}: ${event.eventType}</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background-color: #f9fafb; border: 2px solid #e5e7eb;">
        ${eventDetails}
      </table>
    `;
  }).join('');

  return `
    <h1 style="color: #003DA5; margin-top: 0;">Booking Confirmation</h1>

    <p>Thank you for booking your <strong>${eventCount} event${eventCount > 1 ? 's' : ''}</strong> with the Calgary Basketball Officials Association.</p>

    <h2 style="color: #003DA5;">Organization Information</h2>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background-color: #f9fafb; border: 2px solid #e5e7eb;">
      <tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; width: 40%;">Organization:</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${data.organizationName}</td></tr>
      <tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Event Contact:</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${data.eventContactName}</td></tr>
      <tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Email:</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${data.eventContactEmail}</td></tr>
      ${data.eventContactPhone ? `<tr><td style="padding: 12px; font-weight: 600;">Phone:</td>
          <td style="padding: 12px;">${data.eventContactPhone}</td></tr>` : ''}
    </table>

    <h2 style="color: #003DA5;">Event Details</h2>
    ${eventsHtml}

    <h2 style="color: #003DA5;">Discipline Policy</h2>
    <p>You have indicated your discipline policy will be: <strong>${data.disciplinePolicy}</strong></p>

    <p>The CBOA Scheduling & Assigning team will be contacting you shortly to gather your schedule to be put into the assigning software. If your event is a League or Tournament, please provide your schedule in spreadsheet format to <a href="mailto:scheduler@cboa.ca">scheduler@cboa.ca</a>.</p>

    <h2 style="color: #003DA5;">Attached Documents</h2>
    <p>For your reference, we have attached:</p>
    <ul>
      <li>CBOA Fee Schedule (Sept 2025 - Aug 2028)</li>
      <li>CBOA Invoice Policy</li>
    </ul>

    <h2 style="color: #003DA5;">Payment Information</h2>
    <p>Payments can be made by cheque or e-transfer to the CBOA Director of Finance at <a href="mailto:treasurer@cboa.ca">treasurer@cboa.ca</a>.</p>

    <p>Thank you for booking your officials with the Calgary Basketball Officials Association. We look forward to providing our trained and certified referees to make your event${eventCount > 1 ? 's' : ''} a success.</p>

    <p>Best Regards,<br>
    <strong>Calgary Basketball Officials Association</strong><br>
    Scheduling Group<br>
    <a href="mailto:scheduler@cboa.ca">scheduler@cboa.ca</a><br>
    <a href="https://www.cboa.ca">www.cboa.ca</a></p>
  `;
}

async function sendEmail(accessToken, to, subject, htmlContent, attachments) {
  const senderEmail = 'scheduler@cboa.ca';
  const graphEndpoint = `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`;

  const emailMessage = {
    message: {
      subject: subject,
      body: {
        contentType: 'HTML',
        content: htmlContent
      },
      from: {
        emailAddress: { address: senderEmail }
      },
      toRecipients: [
        { emailAddress: { address: to } }
      ]
    },
    saveToSentItems: true
  };

  if (attachments && attachments.length > 0) {
    emailMessage.message.attachments = attachments.map(att => ({
      '@odata.type': '#microsoft.graph.fileAttachment',
      name: att.name,
      contentType: att.contentType,
      contentBytes: att.content
    }));
  }

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
}

async function main() {
  console.log('=== OSA Form Email Test ===\n');

  // Sample form data with 2 events (to show multi-event support)
  const testData = {
    organizationName: 'Calgary Youth Basketball League',
    billingContactName: 'Jane Smith',
    billingEmail: 'billing@cybl.ca',
    billingPhone: '(403) 555-1234',
    billingAddress: '123 Main Street',
    billingCity: 'Calgary',
    billingProvince: 'AB',
    billingPostalCode: 'T2P 1A1',
    eventContactName: 'John Doe',
    eventContactEmail: 'joey@streamdata.com',
    eventContactPhone: '(403) 555-5678',
    disciplinePolicy: 'CHSAA / Rockyview / Foothills policy',
    agreement: true,
    submissionTime: new Date().toISOString(),
    events: [
      {
        eventIndex: 1,
        eventType: 'League',
        leagueName: 'CYBL Spring Season 2026',
        leagueStartDate: '2026-03-01',
        leagueEndDate: '2026-05-31',
        leagueDaysOfWeek: 'Tuesday, Thursday, Saturday',
        leaguePlayerGender: 'Male, Female',
        leagueLevelOfPlay: 'U13, U15, U17'
      },
      {
        eventIndex: 2,
        eventType: 'Exhibition Game(s)',
        exhibitionGameLocation: 'Mount Royal University Gymnasium',
        exhibitionGames: [
          { date: '2026-02-15', time: '10:00', numberOfGames: '3' },
          { date: '2026-02-15', time: '14:00', numberOfGames: '2' },
          { date: '2026-02-16', time: '09:00', numberOfGames: '4' }
        ],
        exhibitionPlayerGender: 'Male',
        exhibitionLevelOfPlay: 'U15, U17'
      }
    ]
  };

  const recipient = 'joey@streamdata.com';

  console.log(`Recipient: ${recipient}`);
  console.log(`Organization: ${testData.organizationName}`);
  console.log(`Events: ${testData.events.length}\n`);

  try {
    console.log('1. Loading PDF attachments...');
    const feeSchedulePdf = loadPdfAsBase64('CBOA-Fee-Schedule-2025-2028.pdf');
    const invoicePolicyPdf = loadPdfAsBase64('CBOA-Invoice-Policy.pdf');

    const attachments = [];
    if (feeSchedulePdf) {
      attachments.push({
        name: 'CBOA Fee Schedule 2025-2028.pdf',
        content: feeSchedulePdf,
        contentType: 'application/pdf'
      });
    }
    if (invoicePolicyPdf) {
      attachments.push({
        name: 'CBOA Invoice Policy.pdf',
        content: invoicePolicyPdf,
        contentType: 'application/pdf'
      });
    }
    console.log(`   Loaded ${attachments.length} attachment(s)\n`);

    console.log('2. Getting access token...');
    const accessToken = await getAccessToken();
    console.log('   ✓ Access token obtained\n');

    console.log('3. Generating email content...');
    const emailContent = generateClientEmailContent(testData);
    const emailHtml = generateCBOAEmailTemplate({
      subject: `Confirmation of booking - ${testData.organizationName} (${testData.events.length} events)`,
      content: emailContent,
      previewText: `Thank you for booking ${testData.events.length} events with CBOA`
    });
    console.log('   ✓ Email content generated\n');

    console.log('4. Sending email...');
    await sendEmail(
      accessToken,
      recipient,
      `[TEST] Confirmation of booking - ${testData.organizationName} (${testData.events.length} events)`,
      emailHtml,
      attachments
    );
    console.log('   ✓ Email sent!\n');

    console.log('=== SUCCESS ===');
    console.log(`Check ${recipient} for the test email with ${attachments.length} PDF attachment(s).`);

  } catch (error) {
    console.error('\n=== FAILED ===');
    console.error(error.message);
    process.exit(1);
  }
}

main();
