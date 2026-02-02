# OSA Form Setup Guide - Tally.so Integration

This guide explains how to set up the CBOA Officiating Services Agreement (OSA) form using Tally.so.

## Overview

The OSA system uses:
- **Tally.so** - Free form builder with conditional logic
- **Netlify Function** - Webhook handler (`osa-webhook.ts`)
- **Supabase** - Database storage
- **Microsoft Graph API** - Email sending

## Step 1: Create the Tally Form

1. Go to [tally.so](https://tally.so) and create a free account
2. Click "Create form" and start from scratch
3. Build the form with the following structure:

### Form Fields Structure

**Page 1: Organization Information**
- Organization Name (Short text, required)

**Page 2: Billing Information**
Add description: "To secure CBOA services, we require accurate billing contact information."
- Billing Contact Name (Short text, required)
- Billing Email (Email, required)
- Billing Phone (Phone number, optional)
- Billing Address (Short text, required)
- Billing City (Short text, required)
- Billing Province (Dropdown, required)
  - Options: AB, BC, SK, MB, ON, QC, NB, NS, PE, NL, NT, NU, YT
- Billing Postal Code (Short text, required)

**Page 3: Event Contact**
- Event Contact Name (Short text, required)
- Event Contact Email (Email, required)
- Event Contact Phone (Phone number, optional)

**Page 4: Event Type**
- Event Type (Multiple choice - single select, required)
  - Exhibition Game(s)
  - League
  - Tournament

**Page 5: League Details** (Conditional: Show only if Event Type = "League")
- League Name (Short text, required)
- League Start Date (Date, required)
- League End Date (Date, required)
- Days of Week (Multiple choice - multi-select, required)
  - Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
- Player Gender (Multiple choice - multi-select, required)
  - Male, Female
- Level of Play (Multiple choice - multi-select, required)
  - U11, U13, U15, U17, U19, Junior High, HS-JV, HS-SV, College/University, Adult, Other

**Page 6: Exhibition Details** (Conditional: Show only if Event Type = "Exhibition Game(s)")
- Game Location (Short text, required)
- Number of Games (Number, required)
- Game Date (Date, required)
- Start Time (Time, required)
- Player Gender (Multiple choice - multi-select, required)
- Level of Play (Multiple choice - multi-select, required)

**Page 7: Tournament Details** (Conditional: Show only if Event Type = "Tournament")
- Tournament Name (Short text, required)
- Start Date (Date, required)
- End Date (Date, required)
- Estimated Number of Games (Number, required)
- Player Gender (Multiple choice - multi-select, required)
- Level of Play (Multiple choice - multi-select, required)

**Page 8: Policies**
- Discipline Policy (Multiple choice - single select, required)
  - "CHSAA / Rockyview / Foothills policy"
  - "Own Policy (will provide copy)"
- Agreement (Checkbox, required)
  - Label: "I agree that CBOA will be the exclusive provider of basketball officials for this event."

### Setting Up Conditional Logic

In Tally:
1. Click on the League Details page
2. Click the "..." menu → "Logic" → "Page logic"
3. Set: "Show this page when Event Type is League"
4. Repeat for Exhibition and Tournament pages

## Step 2: Configure Tally Webhook

1. In your Tally form, go to **Settings** → **Integrations**
2. Click **Webhooks**
3. Add a new webhook with these settings:

```
URL: https://cboa.ca/.netlify/functions/osa-webhook
Method: POST
Headers:
  - X-Webhook-Secret: [your OSA_WEBHOOK_SECRET value from Netlify env vars]
  - Content-Type: application/json
```

4. Enable "Send submission data"
5. Test the webhook with a test submission

## Step 3: Map Tally Fields to Webhook

Tally sends data in this format:
```json
{
  "eventId": "submission-id",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "data": {
    "fields": [
      {
        "key": "question_abc123",
        "label": "Organization Name",
        "type": "INPUT_TEXT",
        "value": "Calgary Youth Basketball"
      },
      // ... more fields
    ]
  }
}
```

The webhook (`osa-webhook.ts`) has been updated to handle both formats:
- Direct field names (from Power Automate)
- Tally's nested format (auto-detected and transformed)

### Field Mapping Reference

| Tally Label | Webhook Field |
|-------------|---------------|
| Organization Name | organizationName |
| Billing Contact Name | billingContactName |
| Billing Email | billingEmail |
| Billing Phone | billingPhone |
| Billing Address | billingAddress |
| Billing City | billingCity |
| Billing Province | billingProvince |
| Billing Postal Code | billingPostalCode |
| Event Contact Name | eventContactName |
| Event Contact Email | eventContactEmail |
| Event Contact Phone | eventContactPhone |
| Event Type | eventType |
| League Name | leagueName |
| League Start Date | leagueStartDate |
| League End Date | leagueEndDate |
| Days of Week | leagueDaysOfWeek |
| Player Gender (League) | leaguePlayerGender |
| Level of Play (League) | leagueLevelOfPlay |
| Game Location | exhibitionGameLocation |
| Number of Games | exhibitionNumberOfGames |
| Game Date | exhibitionGameDate |
| Start Time | exhibitionStartTime |
| Player Gender (Exhibition) | exhibitionPlayerGender |
| Level of Play (Exhibition) | exhibitionLevelOfPlay |
| Tournament Name | tournamentName |
| Start Date (Tournament) | tournamentStartDate |
| End Date (Tournament) | tournamentEndDate |
| Estimated Number of Games | tournamentNumberOfGames |
| Player Gender (Tournament) | tournamentPlayerGender |
| Level of Play (Tournament) | tournamentLevelOfPlay |
| Discipline Policy | disciplinePolicy |
| Agreement | agreement |

## Step 4: Configure Environment Variables

In Netlify, add these environment variables:

```bash
# Required - Tally Form ID (from URL: tally.so/r/[FORM_ID])
NEXT_PUBLIC_OSA_TALLY_FORM_ID=your-form-id

# Required - Webhook security
OSA_WEBHOOK_SECRET=generate-a-random-secret-string

# Required - Email recipients
OSA_SENDER_EMAIL=scheduler@cboa.ca
OSA_SCHEDULER_EMAIL=scheduler@cboa.ca
OSA_TREASURER_EMAIL=treasurer@cboa.ca

# Optional - CC the president
OSA_PRESIDENT_EMAIL=president@cboa.ca

# Required - Microsoft Graph (already configured)
MICROSOFT_TENANT_ID=xxx
MICROSOFT_CLIENT_ID=xxx
MICROSOFT_CLIENT_SECRET=xxx

# Required - Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

## Step 5: Upload PDF Documents

Ensure these files exist in `/public/documents/`:
- `CBOA-Fee-Schedule-2025-2028.pdf`
- `CBOA-Invoice-Policy.pdf`

These are attached to the confirmation email sent to clients.

## Step 6: Configure Thank You Page

In Tally form settings:
1. Go to **Settings** → **After submit**
2. Select "Redirect to URL"
3. Enter: `https://cboa.ca/get-officials/success`

## Step 7: Test the Integration

1. Submit a test form on Tally
2. Check:
   - [ ] Submission appears in Supabase `osa_submissions` table
   - [ ] Client receives confirmation email with PDF attachments
   - [ ] Scheduler receives notification email
   - [ ] Treasurer receives billing info email
   - [ ] Submission appears in Portal at `/portal/admin/osa-submissions`

## Troubleshooting

### Form not loading on page
- Verify `NEXT_PUBLIC_OSA_TALLY_FORM_ID` is set correctly
- Check browser console for errors
- Try opening form directly: `tally.so/r/[FORM_ID]`

### Webhook not receiving data
- Check Tally webhook logs in Settings → Integrations → Webhooks
- Verify the webhook URL is correct
- Check `X-Webhook-Secret` header matches env var

### Emails not sending
- Verify Microsoft Graph credentials
- Check `OSA_SENDER_EMAIL` has send permissions
- Check Netlify function logs for errors

### Data not saving to database
- Verify Supabase credentials
- Check that `osa_submissions` table exists (run migration)
- Check Netlify function logs for database errors

## Form Customization

### Branding
In Tally:
1. Go to **Design** tab
2. Set colors to match CBOA branding:
   - Primary: #ff6b35 (CBOA Orange)
   - Background: White
   - Text: #1a1a1a

### Success Message
The form redirects to `/get-officials/success` which shows:
- Confirmation message
- What happens next steps
- Contact information
- Links to fee schedule

## Costs

Tally.so free tier includes:
- Unlimited forms
- Unlimited submissions
- Webhooks
- Conditional logic
- File uploads (100MB storage)

This is more than sufficient for <500 submissions/year.
