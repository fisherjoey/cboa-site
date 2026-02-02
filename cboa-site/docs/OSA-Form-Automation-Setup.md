# OSA (Officiating Services Agreement) Form Automation Setup

## Overview

This guide sets up automated email responses when a client submits an OSA request via Microsoft Forms. Emails use the same branded CBOA template as the main email system.

**How it works:**
1. Client fills out Microsoft Form
2. Power Automate detects submission
3. Power Automate sends form data to Netlify function
4. Netlify function sends branded emails via Microsoft Graph API
5. Submission is saved to database and viewable in Portal

**Recipients (per Jerome's requirements):**
- **Client:** Confirmation + Fee Schedule PDF + Invoice Policy PDF
- **Scheduler:** All form details (no attachments)
- **Treasurer:** Billing details only
- **President:** Optional, same as scheduler

**Portal Integration:**
- All submissions are stored in the `osa_submissions` database table
- Admins can view/manage submissions at `/portal/admin/osa-submissions`
- Status tracking: New → Contacted → Scheduled → Completed (or Cancelled)
- CSV export available for spreadsheet workflows

---

## Part 1: Setup on CBOA Website

### 1.1 Upload the PDF Documents

Copy the PDFs to your website's public folder:

```
cboa-site/public/documents/CBOA-Fee-Schedule-2025-2028.pdf
cboa-site/public/documents/CBOA-Invoice-Policy.pdf
```

### 1.2 Add Environment Variables

Add these to your Netlify environment variables (Site Settings → Environment Variables):

```env
# Required (should already exist for email sender)
MICROSOFT_TENANT_ID=your-tenant-id
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret

# OSA-specific settings
OSA_SENDER_EMAIL=scheduler@cboa.ca
OSA_SCHEDULER_EMAIL=scheduler@cboa.ca
OSA_TREASURER_EMAIL=treasurer@cboa.ca
OSA_PRESIDENT_EMAIL=president@cboa.ca  # Optional - remove to disable

# Security (optional but recommended)
OSA_WEBHOOK_SECRET=your-random-secret-string
```

### 1.3 Deploy

Deploy the site to activate the new `osa-webhook` function.

The webhook URL will be:
```
https://cboa.ca/.netlify/functions/osa-webhook
```

---

## Part 2: Power Automate Setup

### 2.1 Find Your Form ID

1. Go to https://forms.office.com
2. Open your OSA form in **edit mode**
3. Look at the browser URL:
   ```
   https://forms.office.com/Pages/DesignPageV2.aspx?...&id=YOUR_FORM_ID_HERE
   ```
4. Copy the value after `id=`

**Tip:** Rename your form first (click ... → Rename) so it's easy to identify in Power Automate.

### 2.2 Create the Flow

1. Go to https://make.powerautomate.com
2. Click **+ Create** → **Automated cloud flow**
3. Name: `OSA Form - Webhook`
4. Trigger: Search `Microsoft Forms` → Select **When a new response is submitted**
5. Click **Create**

### 2.3 Configure the Trigger

1. **Form Id:** Select your OSA form from the dropdown
   - If forms show as "Untitled", use **Enter custom value** and paste your Form ID

### 2.4 Add "Get response details"

1. Click **+ New step**
2. Search: `Microsoft Forms`
3. Select: **Get response details**
4. **Form Id:** Same form as trigger
5. **Response Id:** Click field → Dynamic content → Select **Response Id**

### 2.5 Add HTTP Action (Webhook)

1. Click **+ New step**
2. Search: `HTTP`
3. Select: **HTTP** (not "HTTP + Swagger")
4. Configure:

| Field | Value |
|-------|-------|
| **Method** | `POST` |
| **URI** | `https://cboa.ca/.netlify/functions/osa-webhook` |
| **Headers** | See below |
| **Body** | See below |

#### Headers

Click **+ Add new parameter** → Check **Headers**

| Key | Value |
|-----|-------|
| `Content-Type` | `application/json` |
| `X-Webhook-Secret` | `your-random-secret-string` (same as OSA_WEBHOOK_SECRET) |

#### Body (JSON)

Click in the Body field and paste this JSON. Then replace each placeholder with Dynamic Content from your form:

```json
{
  "organizationName": "",

  "billingContactName": "",
  "billingEmail": "",
  "billingPhone": "",
  "billingAddress": "",
  "billingCity": "",
  "billingProvince": "",
  "billingPostalCode": "",

  "eventContactName": "",
  "eventContactEmail": "",
  "eventContactPhone": "",

  "eventType": "",

  "leagueName": "",
  "leagueStartDate": "",
  "leagueEndDate": "",
  "leagueDaysOfWeek": "",
  "leaguePlayerGender": "",
  "leagueLevelOfPlay": "",

  "exhibitionGameLocation": "",
  "exhibitionNumberOfGames": "",
  "exhibitionGameDate": "",
  "exhibitionStartTime": "",
  "exhibitionPlayerGender": "",
  "exhibitionLevelOfPlay": "",

  "tournamentName": "",
  "tournamentStartDate": "",
  "tournamentEndDate": "",
  "tournamentNumberOfGames": "",
  "tournamentPlayerGender": "",
  "tournamentLevelOfPlay": "",

  "disciplinePolicy": "",
  "agreement": "",
  "submissionTime": "@{utcNow()}"
}
```

**To insert Dynamic Content:**
1. Click inside the quotes for a field (e.g., after `"organizationName": "`)
2. The Dynamic Content panel appears on the right
3. Under **Get response details**, find and click the matching form question
4. Repeat for each field

**Example of completed Body:**
```json
{
  "organizationName": "@{outputs('Get_response_details')?['body/r1234']}",
  "contactName": "@{outputs('Get_response_details')?['body/r5678']}",
  ...
}
```

### 2.6 Map Your Form Fields

The form has **branching logic** based on Event Type (Q12):
- **Exhibition Game(s)** → Shows Q19-24
- **League** → Shows Q13-18
- **Tournament** → Shows Q25-30

Map ALL fields - empty/null values are handled automatically.

| Q# | Form Question | JSON Field | Required |
|----|---------------|------------|----------|
| 1 | Organization Name | `organizationName` | Yes |
| 2 | Billing Contact Name | `billingContactName` | Yes |
| 3 | Billing Email | `billingEmail` | Yes |
| 4 | Billing Phone Number | `billingPhone` | No |
| 5 | Billing Address | `billingAddress` | No |
| 6 | Billing City | `billingCity` | No |
| 7 | Billing Province | `billingProvince` | No |
| 8 | Billing Postal Code | `billingPostalCode` | No |
| 9 | Event Contact Name | `eventContactName` | Yes |
| 10 | Event Contact Email | `eventContactEmail` | Yes |
| 11 | Event Contact Phone | `eventContactPhone` | No |
| 12 | Event Type | `eventType` | Yes |
| **League Fields (Q13-18)** |||
| 13 | League Name | `leagueName` | If League |
| 14 | Start Date | `leagueStartDate` | If League |
| 15 | End Date | `leagueEndDate` | If League |
| 16 | Day(s) of Week | `leagueDaysOfWeek` | If League |
| 17 | Player Gender | `leaguePlayerGender` | If League |
| 18 | Level of Play | `leagueLevelOfPlay` | If League |
| **Exhibition Fields (Q19-24)** |||
| 19 | Game Location | `exhibitionGameLocation` | If Exhibition |
| 20 | Number of Games | `exhibitionNumberOfGames` | If Exhibition |
| 21 | Game Date | `exhibitionGameDate` | If Exhibition |
| 22 | Start Time | `exhibitionStartTime` | If Exhibition |
| 23 | Player Gender | `exhibitionPlayerGender` | If Exhibition |
| 24 | Level of Play | `exhibitionLevelOfPlay` | If Exhibition |
| **Tournament Fields (Q25-30)** |||
| 25 | Tournament Name | `tournamentName` | If Tournament |
| 26 | Start Date | `tournamentStartDate` | If Tournament |
| 27 | End Date | `tournamentEndDate` | If Tournament |
| 28 | Number of Games | `tournamentNumberOfGames` | If Tournament |
| 29 | Player Gender | `tournamentPlayerGender` | If Tournament |
| 30 | Level of Play | `tournamentLevelOfPlay` | If Tournament |
| **Common Fields** |||
| 31 | Discipline Policy | `disciplinePolicy` | Yes |
| 32 | Agreement | `agreement` | Yes |
| - | (auto-generated) | `submissionTime` | No |

### 2.7 Save and Test

1. Click **Save**
2. Go to your Microsoft Form → Click **Preview**
3. Fill out and submit a test response
4. Check:
   - [ ] Client email received (with CBOA branding and PDF attachments)
   - [ ] Scheduler email received
   - [ ] Treasurer email received
   - [ ] President email received (if enabled)

### 2.8 Check Flow Run History

If emails don't arrive:

1. In Power Automate, click **My flows**
2. Click your flow name
3. Look at **Run history** at the bottom
4. Click a run to see:
   - If the HTTP action succeeded (200 status)
   - The response body with results

---

## Part 3: Complete Flow Structure

```
┌─────────────────────────────────────────┐
│ TRIGGER: When a new response is         │
│          submitted (Microsoft Forms)    │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ ACTION 1: Get response details          │
│           (Microsoft Forms)             │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ ACTION 2: HTTP POST                     │
│           URL: cboa.ca/.netlify/        │
│                functions/osa-webhook    │
│           Body: Form data as JSON       │
└─────────────────────────────────────────┘
                  │
                  ▼
        ┌─────────────────┐
        │ Netlify Function │
        │ (osa-webhook.ts) │
        └────────┬────────┘
                 │
    ┌────────────┼────────────┬────────────┐
    ▼            ▼            ▼            ▼
┌────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐
│ Client │ │ Scheduler│ │ Treasurer│ │ President │
│ Email  │ │  Email   │ │  Email   │ │  Email    │
│ + PDFs │ │          │ │ (billing)│ │ (optional)│
└────────┘ └──────────┘ └──────────┘ └───────────┘
```

---

## Part 4: Code View (Power Automate JSON)

If you prefer to paste the entire flow definition, use **Code View** in Power Automate:

```json
{
  "definition": {
    "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
    "contentVersion": "1.0.0.0",
    "triggers": {
      "When_a_new_response_is_submitted": {
        "type": "OpenApiConnectionWebhook",
        "inputs": {
          "parameters": {
            "form_id": "YOUR_FORM_ID_HERE"
          },
          "host": {
            "apiId": "/providers/Microsoft.PowerApps/apis/shared_microsoftforms",
            "connection": "shared_microsoftforms",
            "operationId": "CreateFormWebhook"
          }
        },
        "splitOn": "@triggerOutputs()?['body/value']"
      }
    },
    "actions": {
      "Get_response_details": {
        "type": "OpenApiConnection",
        "inputs": {
          "parameters": {
            "form_id": "YOUR_FORM_ID_HERE",
            "response_id": "@triggerOutputs()?['body/resourceData/responseId']"
          },
          "host": {
            "apiId": "/providers/Microsoft.PowerApps/apis/shared_microsoftforms",
            "connection": "shared_microsoftforms",
            "operationId": "GetFormResponse"
          }
        },
        "runAfter": {}
      },
      "Send_to_CBOA_Webhook": {
        "type": "Http",
        "inputs": {
          "method": "POST",
          "uri": "https://cboa.ca/.netlify/functions/osa-webhook",
          "headers": {
            "Content-Type": "application/json",
            "X-Webhook-Secret": "YOUR_WEBHOOK_SECRET_HERE"
          },
          "body": {
            "organizationName": "@outputs('Get_response_details')?['body/Q1_FIELD_ID']",

            "billingContactName": "@outputs('Get_response_details')?['body/Q2_FIELD_ID']",
            "billingEmail": "@outputs('Get_response_details')?['body/Q3_FIELD_ID']",
            "billingPhone": "@outputs('Get_response_details')?['body/Q4_FIELD_ID']",
            "billingAddress": "@outputs('Get_response_details')?['body/Q5_FIELD_ID']",
            "billingCity": "@outputs('Get_response_details')?['body/Q6_FIELD_ID']",
            "billingProvince": "@outputs('Get_response_details')?['body/Q7_FIELD_ID']",
            "billingPostalCode": "@outputs('Get_response_details')?['body/Q8_FIELD_ID']",

            "eventContactName": "@outputs('Get_response_details')?['body/Q9_FIELD_ID']",
            "eventContactEmail": "@outputs('Get_response_details')?['body/Q10_FIELD_ID']",
            "eventContactPhone": "@outputs('Get_response_details')?['body/Q11_FIELD_ID']",

            "eventType": "@outputs('Get_response_details')?['body/Q12_FIELD_ID']",

            "leagueName": "@outputs('Get_response_details')?['body/Q13_FIELD_ID']",
            "leagueStartDate": "@outputs('Get_response_details')?['body/Q14_FIELD_ID']",
            "leagueEndDate": "@outputs('Get_response_details')?['body/Q15_FIELD_ID']",
            "leagueDaysOfWeek": "@outputs('Get_response_details')?['body/Q16_FIELD_ID']",
            "leaguePlayerGender": "@outputs('Get_response_details')?['body/Q17_FIELD_ID']",
            "leagueLevelOfPlay": "@outputs('Get_response_details')?['body/Q18_FIELD_ID']",

            "exhibitionGameLocation": "@outputs('Get_response_details')?['body/Q19_FIELD_ID']",
            "exhibitionNumberOfGames": "@outputs('Get_response_details')?['body/Q20_FIELD_ID']",
            "exhibitionGameDate": "@outputs('Get_response_details')?['body/Q21_FIELD_ID']",
            "exhibitionStartTime": "@outputs('Get_response_details')?['body/Q22_FIELD_ID']",
            "exhibitionPlayerGender": "@outputs('Get_response_details')?['body/Q23_FIELD_ID']",
            "exhibitionLevelOfPlay": "@outputs('Get_response_details')?['body/Q24_FIELD_ID']",

            "tournamentName": "@outputs('Get_response_details')?['body/Q25_FIELD_ID']",
            "tournamentStartDate": "@outputs('Get_response_details')?['body/Q26_FIELD_ID']",
            "tournamentEndDate": "@outputs('Get_response_details')?['body/Q27_FIELD_ID']",
            "tournamentNumberOfGames": "@outputs('Get_response_details')?['body/Q28_FIELD_ID']",
            "tournamentPlayerGender": "@outputs('Get_response_details')?['body/Q29_FIELD_ID']",
            "tournamentLevelOfPlay": "@outputs('Get_response_details')?['body/Q30_FIELD_ID']",

            "disciplinePolicy": "@outputs('Get_response_details')?['body/Q31_FIELD_ID']",
            "agreement": "@outputs('Get_response_details')?['body/Q32_FIELD_ID']",
            "submissionTime": "@utcNow()"
          }
        },
        "runAfter": {
          "Get_response_details": ["Succeeded"]
        }
      }
    },
    "outputs": {}
  }
}
```

**Note:** Replace:
- `YOUR_FORM_ID_HERE` with your actual Form ID
- `YOUR_WEBHOOK_SECRET_HERE` with your secret
- `Q1_FIELD_ID` through `Q32_FIELD_ID` with actual field IDs from your form (e.g., `r1234567890abcdef`)

**Tip:** The easiest way to get field IDs is to use the visual editor and insert Dynamic Content - it will auto-populate the correct field references.

---

## Troubleshooting

### Webhook returns 401 Unauthorized
- Check that `X-Webhook-Secret` header matches `OSA_WEBHOOK_SECRET` env var
- Or remove `OSA_WEBHOOK_SECRET` from Netlify to disable auth

### Webhook returns 400 Bad Request
- Verify required fields are mapped: `organizationName`, `contactEmail`, `eventName`
- Check JSON syntax in the HTTP body

### Emails not sending
- Verify Microsoft Graph credentials in Netlify env vars
- Check that `OSA_SENDER_EMAIL` has permission to send
- Look at Netlify function logs for errors

### PDFs not attaching
- Verify files exist at:
  - `public/documents/CBOA-Fee-Schedule-2025-2028.pdf`
  - `public/documents/CBOA-Invoice-Policy.pdf`
- Redeploy after adding files

### Flow not triggering
- Ensure flow is **turned on**
- Check that correct form is selected
- Verify form is published and accepting responses

---

## Document Updates Needed

| Document | Issue | Action |
|----------|-------|--------|
| Invoice Policy | References `cboatreasurer@gmail.com` | Update to `treasurer@cboa.ca` |
| Invoice Policy | Dated January 2022 | Update date |
| Fee Schedule | Signed by Ian Pollard | Consider current president's signature |

---

## Notes from Jerome (Jan 28, 2026)

> "The sender probably should be scheduler@cboa.ca instead of the president's email."
✅ Configured via `OSA_SENDER_EMAIL`

> "The client should get all details collected, the game fee memo, and invoicing policy."
✅ Client receives confirmation + both PDFs

> "The scheduler should get all the details collected. Probably don't need the game fee memo and the invoicing policy attachments."
✅ Scheduler gets full details, no attachments

> "The treasurer should get the billing details."
✅ Treasurer gets billing-only summary

> "As an aside the game fee memo and invoicing policy have the gmail addresses as links."
⚠️ Update PDFs to use @cboa.ca addresses

---

## Database Setup

Before deploying, run the migration to create the `osa_submissions` table:

```sql
-- Run in Supabase SQL Editor
-- File: supabase/migrations/add-osa-submissions-table.sql
```

The table stores all OSA form submissions with:
- Organization and contact information
- Event details (varies by event type)
- Billing information
- Status tracking (new, contacted, scheduled, completed, cancelled)
- Internal notes
- Email send status

---

## Portal Access

After deployment, admins can access OSA submissions at:
```
/portal/admin/osa-submissions
```

Features:
- Filter by event type, status, date range
- Search by organization, contact, event name
- View full submission details
- Update status and add notes
- Export to CSV for Excel workflows
