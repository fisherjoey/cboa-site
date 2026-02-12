// CBOA Email Template
// Creates a professional, branded HTML email wrapper

export interface EmailTemplateOptions {
  subject: string
  content: string
  previewText?: string
  previewMode?: boolean // When true, uses dark outer background for preview display
  external?: boolean // When true, hides Member Portal link and member-specific footer text
}

export function generateCBOAEmailTemplate(options: EmailTemplateOptions): string {
  const { subject, content, previewText, previewMode, external } = options
  const outerBgColor = previewMode ? '#1f2937' : '#f5f5f5'

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${subject}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
  </style>
  <![endif]-->
  <!--[if mso | IE]>
  <style>
    /* Force Outlook to respect background colors */
    .email-container { background-color: #ffffff !important; }
  </style>
  <![endif]-->
  <style>
    /* Prevent dark mode color inversion in Outlook/Windows Mail */
    :root {
      color-scheme: light;
      supported-color-schemes: light;
    }
    /* Dark mode meta override */
    [data-ogsc] body,
    [data-ogsb] body {
      background-color: ${outerBgColor} !important;
    }
    /* Force light mode on content area */
    [data-ogsc] .email-content,
    [data-ogsb] .email-content {
      background-color: #ffffff !important;
      color: #333333 !important;
    }
    /* Outlook.com dark mode overrides */
    [data-ogsc] h1, [data-ogsc] h2, [data-ogsc] h3,
    [data-ogsb] h1, [data-ogsb] h2, [data-ogsb] h3 {
      color: #003DA5 !important;
    }
    [data-ogsc] p, [data-ogsc] li, [data-ogsc] td,
    [data-ogsb] p, [data-ogsb] li, [data-ogsb] td {
      color: #333333 !important;
    }
    [data-ogsc] a, [data-ogsb] a {
      color: #F97316 !important;
    }
    /* Base styles - these serve as fallbacks for email clients that support <style> */
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: ${outerBgColor};
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    /* Content typography */
    h1 {
      color: #003DA5;
      font-size: 24px;
      margin-top: 0;
      margin-bottom: 16px;
      font-weight: 700;
      line-height: 1.3;
    }
    h2 {
      color: #003DA5;
      font-size: 20px;
      margin-top: 24px;
      margin-bottom: 12px;
      font-weight: 600;
      border-bottom: 2px solid #F97316;
      padding-bottom: 8px;
    }
    h3 {
      color: #1f2937;
      font-size: 18px;
      margin-top: 20px;
      margin-bottom: 10px;
      font-weight: 600;
    }
    p {
      margin: 0 0 16px 0;
      font-size: 16px;
      line-height: 1.6;
    }
    ul, ol {
      margin: 0 0 16px 0;
      padding-left: 20px;
    }
    li {
      margin-bottom: 8px;
      font-size: 16px;
      line-height: 1.5;
    }
    a {
      color: #F97316;
      text-decoration: underline;
    }
    strong {
      color: #003DA5;
      font-weight: 600;
    }
    /* Tables in content */
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th {
      background-color: #003DA5;
      color: #ffffff;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 14px;
    }
    td {
      padding: 10px 12px;
      border: 1px solid #E5E7EB;
      font-size: 14px;
    }
    blockquote {
      border-left: 4px solid #F97316;
      background-color: #FFF7ED;
      padding: 12px 16px;
      margin: 16px 0;
      font-style: italic;
    }
    /* Button - mobile-friendly with larger tap target */
    .button {
      display: inline-block;
      padding: 14px 28px;
      min-height: 44px;
      background-color: #F97316;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 16px 0;
      text-align: center;
    }
    /* Responsive adjustments for clients that support media queries */
    @media only screen and (max-width: 480px) {
      h1 {
        font-size: 22px !important;
      }
      h2 {
        font-size: 18px !important;
      }
      .button {
        display: block !important;
        width: 100% !important;
        padding: 16px 20px !important;
        box-sizing: border-box !important;
      }
    }
  </style>
</head>
<body>
  ${previewText ? `<div style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</div>` : ''}

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${outerBgColor};">
    <tr>
      <td style="padding: 20px 10px;">
        <table role="presentation" class="email-container" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff;" align="center">

          <!-- Header -->
          <tr>
            <td style="background-color: #1f2937; padding: 24px 20px; border-bottom: 3px solid #F97316; text-align: center;">
              <img src="https://i.imgur.com/BQe360J.png" alt="CBOA Logo" style="max-width: 70px; height: auto; display: inline-block; margin-bottom: 12px;">
              <h1 style="color: #ffffff; margin: 0 0 4px 0; font-size: 18px; font-weight: 700; letter-spacing: -0.5px; line-height: 1.3;">Calgary Basketball Officials Association</h1>
              <p style="color: #ffffff; margin: 0; font-size: 14px; font-weight: 500; opacity: 0.95;">Excellence in Basketball Officiating</p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td class="email-content" style="padding: 30px 20px; color: #333333; background-color: #ffffff; font-size: 16px; line-height: 1.6;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1F2937; color: #D1D5DB; padding: 30px 20px; text-align: center; font-size: 14px; line-height: 1.7; border-top: 3px solid #F97316;">
              <p style="margin: 0 0 10px 0; font-weight: 600; color: #ffffff;">Calgary Basketball Officials Association</p>
              <p style="margin: 0 0 15px 0;">Calgary, Alberta, Canada</p>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 20px auto;">
                <tr>
                  <td style="padding: 0 8px;">
                    <a href="https://cboa.ca" style="color: #F97316; text-decoration: none; font-size: 14px;">Website</a>
                  </td>
                  ${external ? `
                  <td style="padding: 0 8px;">
                    <a href="https://cboa.ca/contact" style="color: #F97316; text-decoration: none; font-size: 14px;">Contact Us</a>
                  </td>
                  ` : `
                  <td style="padding: 0 8px;">
                    <a href="https://cboa.ca/portal" style="color: #F97316; text-decoration: none; font-size: 14px;">Member Portal</a>
                  </td>
                  <td style="padding: 0 8px;">
                    <a href="https://cboa.ca/contact?category=general" style="color: #F97316; text-decoration: none; font-size: 14px;">Contact Us</a>
                  </td>
                  `}
                </tr>
              </table>

              ${external ? `
              <p style="margin: 20px 0 10px 0; font-size: 13px; color: #9ca3af;">
                You are receiving this email because you submitted a request through the CBOA website.
              </p>
              ` : `
              <p style="margin: 20px 0 10px 0; font-size: 13px; color: #9ca3af;">
                You are receiving this email because you are a member of the Calgary Basketball Officials Association.
              </p>
              `}

              <p style="margin: 0; font-size: 13px; color: #9ca3af;">
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
        <a href="https://cboa.ca/portal/calendar" class="button">Register Now</a>
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
        <a href="https://cboa.ca/portal" class="button">Visit Portal</a>
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

      <p>If you have any conflicts or questions, please <a href="https://cboa.ca/contact?category=scheduling">contact the assignor</a> immediately.</p>

      <p style="text-align: center;">
        <a href="https://cboa.ca/portal/calendar" class="button">View Full Schedule</a>
      </p>

      <p>Good luck!</p>

      <p>Best regards,<br>
      <strong>CBOA Scheduling</strong></p>
    `
  })
}
