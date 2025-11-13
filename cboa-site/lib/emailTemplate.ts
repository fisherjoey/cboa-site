// CBOA Email Template
// Creates a professional, branded HTML email wrapper

export interface EmailTemplateOptions {
  subject: string
  content: string
  previewText?: string
}

export function generateCBOAEmailTemplate(options: EmailTemplateOptions): string {
  const { subject, content, previewText } = options

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${subject}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #1f2937;
      padding: 20px 30px;
      border-bottom: 3px solid #F97316;
    }
    .header table {
      width: 100%;
    }
    .header img {
      max-width: 80px;
      height: auto;
      display: block;
    }
    .header h1 {
      color: #ffffff;
      margin: 0 0 4px 0;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.5px;
      line-height: 1.2;
    }
    .header p {
      color: #ffffff;
      margin: 0;
      font-size: 13px;
      font-weight: 500;
      opacity: 0.95;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
      font-size: 16px;
      line-height: 1.6;
    }
    .content h1 {
      color: #003DA5;
      font-size: 28px;
      margin-top: 0;
      margin-bottom: 20px;
      font-weight: 700;
      line-height: 1.3;
    }
    .content h2 {
      color: #003DA5;
      font-size: 22px;
      margin-top: 30px;
      margin-bottom: 15px;
      font-weight: 600;
      border-bottom: 2px solid #F97316;
      padding-bottom: 8px;
    }
    .content h3 {
      color: #1f2937;
      font-size: 19px;
      margin-top: 20px;
      margin-bottom: 12px;
      font-weight: 600;
    }
    .content p {
      margin: 0 0 15px 0;
    }
    .content ul, .content ol {
      margin: 0 0 15px 0;
      padding-left: 25px;
    }
    .content li {
      margin-bottom: 8px;
    }
    .content a {
      color: #F97316;
      text-decoration: underline;
    }
    .content a:hover {
      color: #003DA5;
    }
    .content strong {
      color: #003DA5;
      font-weight: 600;
    }
    .content table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    .content th {
      background-color: #003DA5;
      color: #ffffff;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    .content td {
      padding: 10px 12px;
      border: 1px solid #E5E7EB;
    }
    .content blockquote {
      border-left: 4px solid #F97316;
      background-color: #FFF7ED;
      padding: 15px 20px;
      margin: 20px 0;
      font-style: italic;
    }
    .button {
      display: inline-block;
      padding: 16px 36px;
      background-color: #F97316;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      box-shadow: 0 4px 6px rgba(249, 115, 22, 0.3);
    }
    .button:hover {
      background-color: #EA580C;
      box-shadow: 0 6px 8px rgba(249, 115, 22, 0.4);
    }
    .footer {
      background-color: #1F2937;
      color: #D1D5DB;
      padding: 35px 30px;
      text-align: center;
      font-size: 14px;
      line-height: 1.7;
      border-top: 3px solid #F97316;
    }
    .footer a {
      color: #F97316;
      text-decoration: none;
      transition: color 0.2s;
    }
    .footer a:hover {
      color: #FED7AA;
    }
    .footer-links {
      margin: 20px 0;
    }
    .footer-links a {
      color: #D1D5DB;
      text-decoration: none;
      margin: 0 12px;
      padding: 8px 12px;
      border-radius: 4px;
      display: inline-block;
    }
    .footer-links a:hover {
      background-color: #1f2937;
      color: #F97316;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-links a {
      display: inline-block;
      margin: 0 8px;
      color: #9ca3af;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .content {
        padding: 25px 20px;
      }
      .header h1 {
        font-size: 20px;
      }
      .content h1 {
        font-size: 20px;
      }
      .content h2 {
        font-size: 18px;
      }
    }
  </style>
</head>
<body>
  ${previewText ? `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</div>` : ''}

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" class="email-container" cellspacing="0" cellpadding="0" border="0" width="600" align="center">

          <!-- Header -->
          <tr>
            <td class="header">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="width: 80px; vertical-align: middle; padding-right: 20px;">
                    <img src="https://i.imgur.com/BQe360J.png" alt="CBOA Logo" style="max-width: 80px; height: auto; display: block;">
                  </td>
                  <td style="vertical-align: middle;">
                    <h1 style="color: #ffffff; margin: 0 0 4px 0; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; line-height: 1.2;">Calgary Basketball Officials Association</h1>
                    <p style="color: #ffffff; margin: 0; font-size: 13px; font-weight: 500; opacity: 0.95;">Excellence in Basketball Officiating</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td class="content">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer">
              <p style="margin: 0 0 10px 0; font-weight: 600; color: #ffffff;">Calgary Basketball Officials Association</p>
              <p style="margin: 0 0 15px 0;">Calgary, Alberta, Canada</p>

              <div class="footer-links">
                <a href="https://refalberta.ca">Website</a>
                <a href="https://refalberta.ca/portal">Member Portal</a>
                <a href="https://refalberta.ca/contact">Contact Us</a>
              </div>

              <p style="margin: 20px 0 10px 0; font-size: 12px; color: #6b7280;">
                You are receiving this email because you are a member of the Calgary Basketball Officials Association.
              </p>

              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                © ${new Date().getFullYear()} Calgary Basketball Officials Association. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

// Sample usage examples
export const sampleEmails = {
  announcement: generateCBOAEmailTemplate({
    subject: 'Important Update: New Training Session',
    previewText: 'Join us for an upcoming Level 3 certification clinic...',
    content: `
      <h1>New Training Session Announced</h1>

      <p>Dear CBOA Members,</p>

      <p>We're excited to announce a new <strong>Level 3 Certification Clinic</strong> scheduled for next month.</p>

      <h2>Event Details</h2>
      <ul>
        <li><strong>Date:</strong> Saturday, December 14, 2025</li>
        <li><strong>Time:</strong> 9:00 AM - 4:00 PM</li>
        <li><strong>Location:</strong> Talisman Centre, Calgary</li>
        <li><strong>Cost:</strong> $75 (includes materials and lunch)</li>
      </ul>

      <h2>What You'll Learn</h2>
      <p>This comprehensive clinic will cover:</p>
      <ul>
        <li>Advanced positioning and mechanics</li>
        <li>Three-person officiating systems</li>
        <li>Game management and communication</li>
        <li>Rule interpretations and case plays</li>
      </ul>

      <p style="text-align: center;">
        <a href="https://refalberta.ca/portal/calendar" class="button">Register Now</a>
      </p>

      <p>Space is limited to 30 participants, so please register early to secure your spot.</p>

      <p>If you have any questions, please don't hesitate to reach out.</p>

      <p>Best regards,<br>
      <strong>CBOA Executive Board</strong></p>
    `
  }),

  newsletter: generateCBOAEmailTemplate({
    subject: 'The Bounce - November 2025',
    previewText: 'Your monthly update from CBOA...',
    content: `
      <h1>The Bounce - November 2025</h1>

      <p>Welcome to this month's edition of The Bounce, your source for all things CBOA!</p>

      <h2>📢 What's New</h2>
      <ul>
        <li><strong>New Officials:</strong> Welcome to our 5 new members who joined this month!</li>
        <li><strong>Season Kickoff:</strong> Winter league starts December 1st</li>
        <li><strong>Rule Changes:</strong> Review the latest FIBA rule modifications in the portal</li>
      </ul>

      <h2>📅 Upcoming Events</h2>
      <p><strong>Rules Refresher Workshop</strong><br>
      November 25, 2025 | 7:00 PM | Virtual<br>
      Mandatory for all Level 1 & 2 officials</p>

      <p><strong>Holiday Social</strong><br>
      December 15, 2025 | 6:00 PM | Boston Pizza Crowfoot<br>
      Bring the family!</p>

      <h2>🏆 Official of the Month</h2>
      <p>Congratulations to <strong>Sarah Johnson</strong> for her outstanding performance and professionalism during the tournament season. Sarah has been recognized by multiple coaches for her excellent communication and game management skills.</p>

      <h2>📚 Resources</h2>
      <p>Don't forget to check out the updated resources in the member portal:</p>
      <ul>
        <li>2025-26 FIBA Rulebook</li>
        <li>Pre-game checklist</li>
        <li>Mechanics manual (updated)</li>
      </ul>

      <p style="text-align: center;">
        <a href="https://refalberta.ca/portal" class="button">Visit Portal</a>
      </p>

      <p>Stay safe and see you on the court!</p>

      <p>Best regards,<br>
      <strong>CBOA Communications Team</strong></p>
    `
  }),

  reminder: generateCBOAEmailTemplate({
    subject: 'Reminder: Game Assignment Tomorrow',
    previewText: 'You have a game assignment tomorrow at 7:00 PM...',
    content: `
      <h1>Game Assignment Reminder</h1>

      <p>Hi there,</p>

      <p>This is a friendly reminder about your upcoming game assignment:</p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f9fafb; border: 2px solid #e5e7eb;">
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Date:</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">Saturday, November 16, 2025</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Time:</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">7:00 PM</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Venue:</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">Shouldice Athletic Park</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Address:</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">1515 Home Rd NW, Calgary</td>
        </tr>
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600;">Teams:</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">Central vs. Western</td>
        </tr>
        <tr>
          <td style="padding: 12px; font-weight: 600;">Level:</td>
          <td style="padding: 12px;">Senior Varsity</td>
        </tr>
      </table>

      <p><strong>Please arrive 30 minutes early for pre-game preparation.</strong></p>

      <p>If you have any conflicts or questions, please contact the assignor immediately at <a href="mailto:assignor@cboa.ca">assignor@cboa.ca</a>.</p>

      <p style="text-align: center;">
        <a href="https://refalberta.ca/portal/calendar" class="button">View Full Schedule</a>
      </p>

      <p>Good luck!</p>

      <p>Best regards,<br>
      <strong>CBOA Scheduling</strong></p>
    `
  })
}
