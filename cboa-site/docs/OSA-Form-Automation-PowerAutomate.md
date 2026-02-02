# OSA Form Automation - Full Power Automate Setup

## Overview

This guide sets up automated email responses entirely within Power Automate when a client submits an OSA request via Microsoft Forms.

**Recipients:**
- **Client:** Confirmation + Fee Schedule PDF + Invoice Policy PDF
- **Scheduler:** All form details
- **Treasurer:** Billing details only
- **President:** (Optional) Same as scheduler

---

## Prerequisites

1. Microsoft Forms with OSA form created
2. Access to Power Automate (https://make.powerautomate.com)
3. PDFs uploaded to OneDrive/SharePoint:
   - `CBOA Fee Schedule 2025-2028.pdf`
   - `CBOA Invoice Policy.pdf`
4. Send As permissions for `scheduler@cboa.ca`

---

## Step 1: Find Your Form ID

1. Go to https://forms.office.com
2. Open your OSA form in edit mode
3. Copy the `id=` value from the URL:
   ```
   O4QwwSXMLUK61n7sRzXMG90UxUbHk41CjnSD9RUY-NZUMVFIOERVVE1KSTI3SUE1QTUzUUZFQ01RQiQlQCN0PWcu
   ```

---

## Step 2: Create the Flow

1. Go to https://make.powerautomate.com
2. Click **+ Create** → **Automated cloud flow**
3. Name: `OSA Form - Auto Response`
4. Trigger: **When a new response is submitted** (Microsoft Forms)
5. Click **Create**

---

## Step 3: Configure Trigger & Get Response

### 3.1 Trigger
- **Form Id:** Select your form or paste ID using "Enter custom value"

### 3.2 Add "Get response details"
1. Click **+ New step**
2. Search: `Microsoft Forms` → **Get response details**
3. **Form Id:** Same form
4. **Response Id:** Click field → Lightning bolt → Select **Response Id**

---

## Step 4: Send Email to CLIENT

1. Click **+ New step**
2. Search: `Office 365 Outlook` → **Send an email (V2)**

### Configure:

| Field | Value |
|-------|-------|
| **To** | `[Event Contact Email from Dynamic Content]` |
| **Subject** | See below |
| **Body** | See HTML below |
| **From (Send as)** | `scheduler@cboa.ca` |
| **Attachments** | Add both PDFs from OneDrive |

### Subject Line:
```
Confirmation of booking - @{outputs('Get_response_details')?['body/rXXX']} @{outputs('Get_response_details')?['body/rYYY']}
```
Replace with your Event Name/League Name/Tournament Name field and Event Type field.

Or simpler:
```
Confirmation of booking - @{outputs('Get_response_details')?['body/rORGANIZATION']} @{outputs('Get_response_details')?['body/rEVENTTYPE']}
```

### Client Email HTML Body:

Copy this entire HTML. In Power Automate, click the `</>` code view button in the Body field and paste:

```html
<html>
<head>
<style>
body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
h1 { color: #003DA5; border-bottom: 3px solid #F97316; padding-bottom: 10px; }
h2 { color: #003DA5; margin-top: 25px; }
table { width: 100%; border-collapse: collapse; margin: 15px 0; }
th { background-color: #003DA5; color: white; padding: 12px; text-align: left; }
td { padding: 10px 12px; border: 1px solid #ddd; }
tr:nth-child(even) { background-color: #f9f9f9; }
.highlight { background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px; margin: 15px 0; }
.footer { background-color: #1F2937; color: white; padding: 20px; margin-top: 30px; text-align: center; }
.footer a { color: #F97316; }
</style>
</head>
<body>

<h1>Booking Confirmation</h1>

<p>Thank you for booking your <strong>@{outputs('Get_response_details')?['body/r12_EVENT_TYPE']}</strong> with the Calgary Basketball Officials Association.</p>

<h2>Organization Information</h2>
<table>
<tr><td style="width:40%; font-weight:bold;">Organization</td><td>@{outputs('Get_response_details')?['body/r1_ORG_NAME']}</td></tr>
<tr><td style="font-weight:bold;">Event Contact</td><td>@{outputs('Get_response_details')?['body/r9_CONTACT_NAME']}</td></tr>
<tr><td style="font-weight:bold;">Email</td><td>@{outputs('Get_response_details')?['body/r10_CONTACT_EMAIL']}</td></tr>
<tr><td style="font-weight:bold;">Phone</td><td>@{outputs('Get_response_details')?['body/r11_CONTACT_PHONE']}</td></tr>
</table>

<h2>Event Details</h2>
<table>
<tr><td style="width:40%; font-weight:bold;">Event Type</td><td>@{outputs('Get_response_details')?['body/r12_EVENT_TYPE']}</td></tr>
<tr><td style="font-weight:bold;">Start Date</td><td>@{coalesce(outputs('Get_response_details')?['body/r14_LEAGUE_START'], outputs('Get_response_details')?['body/r21_EXHIB_DATE'], outputs('Get_response_details')?['body/r26_TOURN_START'], 'TBD')}</td></tr>
<tr><td style="font-weight:bold;">Level of Play</td><td>@{coalesce(outputs('Get_response_details')?['body/r18_LEAGUE_LEVEL'], outputs('Get_response_details')?['body/r24_EXHIB_LEVEL'], outputs('Get_response_details')?['body/r30_TOURN_LEVEL'], 'TBD')}</td></tr>
</table>

<h2>Discipline Policy</h2>
<p>You have indicated your discipline policy will be: <strong>@{outputs('Get_response_details')?['body/r31_DISCIPLINE']}</strong></p>

<p>The CBOA Scheduling &amp; Assigning team will be contacting you shortly to gather your schedule to be put into the assigning software.</p>

<h2>Attached Documents</h2>
<p>For your reference, we have attached:</p>
<ul>
<li>CBOA Fee Schedule (Sept 2025 - Aug 2028)</li>
<li>CBOA Invoice Policy</li>
</ul>

<h2>Payment Information</h2>
<p>Payments can be made by cheque or e-transfer to the CBOA Director of Finance at <a href="mailto:treasurer@cboa.ca">treasurer@cboa.ca</a>.</p>

<p>Thank you for booking your officials with the Calgary Basketball Officials Association. We look forward to providing our trained and certified referees to make your event a success.</p>

<div class="footer">
<p><strong>Calgary Basketball Officials Association</strong></p>
<p>Scheduling Group</p>
<p><a href="mailto:scheduler@cboa.ca">scheduler@cboa.ca</a> | <a href="https://www.cboa.ca">www.cboa.ca</a></p>
</div>

</body>
</html>
```

### Add Attachments:
1. Click **Show advanced options**
2. Under **Attachments**, click **Switch to input entire array**
3. Click the array input, then add:

**For each PDF:**
- Click **Add new item**
- **Name:** `CBOA Fee Schedule 2025-2028.pdf`
- **Content:** Use "Get file content" action from OneDrive, or directly reference the file

**Alternative - Use "Get file content" actions before this step:**
1. Add action: **OneDrive for Business** → **Get file content**
2. Select your Fee Schedule PDF
3. Rename the action to `Get_Fee_Schedule_PDF`
4. Repeat for Invoice Policy PDF
5. In the email attachments:
   - Name: `CBOA Fee Schedule 2025-2028.pdf`
   - Content: `@{outputs('Get_Fee_Schedule_PDF')?['body']}`

---

## Step 5: Send Email to SCHEDULER

1. Click **+ New step**
2. **Send an email (V2)**

| Field | Value |
|-------|-------|
| **To** | `scheduler@cboa.ca` |
| **Subject** | `New OSA Request: @{outputs('Get_response_details')?['body/r1_ORG']} - @{outputs('Get_response_details')?['body/r12_TYPE']}` |
| **Body** | See HTML below |
| **From (Send as)** | `scheduler@cboa.ca` |

### Scheduler Email HTML Body:

```html
<html>
<head>
<style>
body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
h1 { color: #003DA5; border-bottom: 3px solid #F97316; padding-bottom: 10px; }
h2 { color: #003DA5; margin-top: 25px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
table { width: 100%; border-collapse: collapse; margin: 15px 0; }
td { padding: 8px 12px; border: 1px solid #ddd; }
td:first-child { font-weight: bold; background-color: #f5f5f5; width: 40%; }
a { color: #F97316; }
.timestamp { color: #666; font-size: 0.9em; margin-top: 20px; }
</style>
</head>
<body>

<h1>New OSA Request: @{outputs('Get_response_details')?['body/r12_EVENT_TYPE']}</h1>

<p>A new Officiating Services Agreement request has been submitted.</p>

<h2>Organization</h2>
<table>
<tr><td>Organization Name</td><td>@{outputs('Get_response_details')?['body/r1_ORG_NAME']}</td></tr>
</table>

<h2>Event Contact</h2>
<table>
<tr><td>Contact Name</td><td>@{outputs('Get_response_details')?['body/r9_CONTACT_NAME']}</td></tr>
<tr><td>Contact Email</td><td><a href="mailto:@{outputs('Get_response_details')?['body/r10_CONTACT_EMAIL']}">@{outputs('Get_response_details')?['body/r10_CONTACT_EMAIL']}</a></td></tr>
<tr><td>Contact Phone</td><td>@{outputs('Get_response_details')?['body/r11_CONTACT_PHONE']}</td></tr>
</table>

<h2>Event Details</h2>
<table>
<tr><td>Event Type</td><td>@{outputs('Get_response_details')?['body/r12_EVENT_TYPE']}</td></tr>

<!-- League Fields -->
<tr><td>League Name</td><td>@{outputs('Get_response_details')?['body/r13_LEAGUE_NAME']}</td></tr>
<tr><td>Start Date</td><td>@{coalesce(outputs('Get_response_details')?['body/r14_LEAGUE_START'], outputs('Get_response_details')?['body/r21_EXHIB_DATE'], outputs('Get_response_details')?['body/r26_TOURN_START'], '')}</td></tr>
<tr><td>End Date</td><td>@{coalesce(outputs('Get_response_details')?['body/r15_LEAGUE_END'], outputs('Get_response_details')?['body/r27_TOURN_END'], '')}</td></tr>
<tr><td>Day(s) of Week</td><td>@{outputs('Get_response_details')?['body/r16_DAYS']}</td></tr>

<!-- Exhibition Fields -->
<tr><td>Game Location</td><td>@{outputs('Get_response_details')?['body/r19_EXHIB_LOCATION']}</td></tr>
<tr><td>Number of Games</td><td>@{coalesce(outputs('Get_response_details')?['body/r20_EXHIB_NUM'], outputs('Get_response_details')?['body/r28_TOURN_NUM'], '')}</td></tr>
<tr><td>Start Time</td><td>@{outputs('Get_response_details')?['body/r22_EXHIB_TIME']}</td></tr>

<!-- Tournament Fields -->
<tr><td>Tournament Name</td><td>@{outputs('Get_response_details')?['body/r25_TOURN_NAME']}</td></tr>

<!-- Common -->
<tr><td>Player Gender</td><td>@{coalesce(outputs('Get_response_details')?['body/r17_LEAGUE_GENDER'], outputs('Get_response_details')?['body/r23_EXHIB_GENDER'], outputs('Get_response_details')?['body/r29_TOURN_GENDER'], '')}</td></tr>
<tr><td>Level of Play</td><td>@{coalesce(outputs('Get_response_details')?['body/r18_LEAGUE_LEVEL'], outputs('Get_response_details')?['body/r24_EXHIB_LEVEL'], outputs('Get_response_details')?['body/r30_TOURN_LEVEL'], '')}</td></tr>
</table>

<h2>Discipline Policy</h2>
<p><strong>@{outputs('Get_response_details')?['body/r31_DISCIPLINE']}</strong></p>

<h2>Billing Information</h2>
<table>
<tr><td>Billing Contact</td><td>@{outputs('Get_response_details')?['body/r2_BILLING_NAME']}</td></tr>
<tr><td>Billing Email</td><td><a href="mailto:@{outputs('Get_response_details')?['body/r3_BILLING_EMAIL']}">@{outputs('Get_response_details')?['body/r3_BILLING_EMAIL']}</a></td></tr>
<tr><td>Billing Phone</td><td>@{outputs('Get_response_details')?['body/r4_BILLING_PHONE']}</td></tr>
<tr><td>Billing Address</td><td>@{outputs('Get_response_details')?['body/r5_BILLING_ADDR']}, @{outputs('Get_response_details')?['body/r6_BILLING_CITY']}, @{outputs('Get_response_details')?['body/r7_BILLING_PROV']} @{outputs('Get_response_details')?['body/r8_BILLING_POSTAL']}</td></tr>
</table>

<p class="timestamp"><em>Submitted: @{utcNow()}</em></p>

</body>
</html>
```

---

## Step 6: Send Email to TREASURER

1. Click **+ New step**
2. **Send an email (V2)**

| Field | Value |
|-------|-------|
| **To** | `treasurer@cboa.ca` |
| **Subject** | `OSA Billing Info: @{outputs('Get_response_details')?['body/r1_ORG']}` |
| **Body** | See HTML below |
| **From (Send as)** | `scheduler@cboa.ca` |

### Treasurer Email HTML Body:

```html
<html>
<head>
<style>
body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
h1 { color: #003DA5; border-bottom: 3px solid #F97316; padding-bottom: 10px; }
h2 { color: #003DA5; margin-top: 25px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
table { width: 100%; border-collapse: collapse; margin: 15px 0; }
td { padding: 8px 12px; border: 1px solid #ddd; }
td:first-child { font-weight: bold; background-color: #f5f5f5; width: 40%; }
a { color: #F97316; }
.timestamp { color: #666; font-size: 0.9em; margin-top: 20px; }
</style>
</head>
<body>

<h1>New OSA - Billing Information</h1>

<p>A new Officiating Services Agreement has been submitted. Below are the billing details.</p>

<h2>Event Summary</h2>
<table>
<tr><td>Organization</td><td>@{outputs('Get_response_details')?['body/r1_ORG_NAME']}</td></tr>
<tr><td>Event Type</td><td>@{outputs('Get_response_details')?['body/r12_EVENT_TYPE']}</td></tr>
<tr><td>Start Date</td><td>@{coalesce(outputs('Get_response_details')?['body/r14_LEAGUE_START'], outputs('Get_response_details')?['body/r21_EXHIB_DATE'], outputs('Get_response_details')?['body/r26_TOURN_START'], 'TBD')}</td></tr>
<tr><td>Level of Play</td><td>@{coalesce(outputs('Get_response_details')?['body/r18_LEAGUE_LEVEL'], outputs('Get_response_details')?['body/r24_EXHIB_LEVEL'], outputs('Get_response_details')?['body/r30_TOURN_LEVEL'], 'TBD')}</td></tr>
<tr><td>Number of Games</td><td>@{coalesce(outputs('Get_response_details')?['body/r20_EXHIB_NUM'], outputs('Get_response_details')?['body/r28_TOURN_NUM'], 'TBD')}</td></tr>
</table>

<h2>Billing Details</h2>
<table>
<tr><td>Billing Contact</td><td>@{outputs('Get_response_details')?['body/r2_BILLING_NAME']}</td></tr>
<tr><td>Billing Email</td><td><a href="mailto:@{outputs('Get_response_details')?['body/r3_BILLING_EMAIL']}">@{outputs('Get_response_details')?['body/r3_BILLING_EMAIL']}</a></td></tr>
<tr><td>Billing Phone</td><td>@{outputs('Get_response_details')?['body/r4_BILLING_PHONE']}</td></tr>
<tr><td>Street Address</td><td>@{outputs('Get_response_details')?['body/r5_BILLING_ADDR']}</td></tr>
<tr><td>City</td><td>@{outputs('Get_response_details')?['body/r6_BILLING_CITY']}</td></tr>
<tr><td>Province</td><td>@{outputs('Get_response_details')?['body/r7_BILLING_PROV']}</td></tr>
<tr><td>Postal Code</td><td>@{outputs('Get_response_details')?['body/r8_BILLING_POSTAL']}</td></tr>
</table>

<p class="timestamp"><em>Submitted: @{utcNow()}</em></p>

</body>
</html>
```

---

## Step 7: (Optional) Send Email to PRESIDENT

1. Click **+ New step**
2. **Send an email (V2)**
3. **To:** `president@cboa.ca`
4. **Subject:** Same as Scheduler
5. **Body:** Same as Scheduler email HTML
6. **From (Send as):** `scheduler@cboa.ca`

---

## Step 8: Replace Field References

In all the HTML above, you need to replace the placeholder field IDs with your actual form field IDs.

### How to find your field IDs:

1. In Power Automate, add a test "Send an email" action
2. Click in the Body field
3. Open **Dynamic content** panel
4. Under "Get response details", you'll see all your form fields
5. Click one - it inserts something like: `@{outputs('Get_response_details')?['body/r1234567890abcdef']}`
6. The `r1234567890abcdef` part is the field ID

### Field ID Mapping Table:

| Placeholder in HTML | Question # | Form Field | Your Field ID |
|--------------------|------------|------------|---------------|
| `r1_ORG_NAME` | Q1 | Organization Name | r___________ |
| `r2_BILLING_NAME` | Q2 | Billing Contact Name | r___________ |
| `r3_BILLING_EMAIL` | Q3 | Billing Email | r___________ |
| `r4_BILLING_PHONE` | Q4 | Billing Phone | r___________ |
| `r5_BILLING_ADDR` | Q5 | Billing Address | r___________ |
| `r6_BILLING_CITY` | Q6 | Billing City | r___________ |
| `r7_BILLING_PROV` | Q7 | Billing Province | r___________ |
| `r8_BILLING_POSTAL` | Q8 | Billing Postal Code | r___________ |
| `r9_CONTACT_NAME` | Q9 | Event Contact Name | r___________ |
| `r10_CONTACT_EMAIL` | Q10 | Event Contact Email | r___________ |
| `r11_CONTACT_PHONE` | Q11 | Event Contact Phone | r___________ |
| `r12_EVENT_TYPE` | Q12 | Event Type | r___________ |
| `r13_LEAGUE_NAME` | Q13 | League Name | r___________ |
| `r14_LEAGUE_START` | Q14 | League Start Date | r___________ |
| `r15_LEAGUE_END` | Q15 | League End Date | r___________ |
| `r16_DAYS` | Q16 | Day(s) of Week | r___________ |
| `r17_LEAGUE_GENDER` | Q17 | Player Gender (League) | r___________ |
| `r18_LEAGUE_LEVEL` | Q18 | Level of Play (League) | r___________ |
| `r19_EXHIB_LOCATION` | Q19 | Game Location | r___________ |
| `r20_EXHIB_NUM` | Q20 | Number of Games (Exhib) | r___________ |
| `r21_EXHIB_DATE` | Q21 | Game Date | r___________ |
| `r22_EXHIB_TIME` | Q22 | Start Time | r___________ |
| `r23_EXHIB_GENDER` | Q23 | Player Gender (Exhib) | r___________ |
| `r24_EXHIB_LEVEL` | Q24 | Level of Play (Exhib) | r___________ |
| `r25_TOURN_NAME` | Q25 | Tournament Name | r___________ |
| `r26_TOURN_START` | Q26 | Tournament Start Date | r___________ |
| `r27_TOURN_END` | Q27 | Tournament End Date | r___________ |
| `r28_TOURN_NUM` | Q28 | Number of Games (Tourn) | r___________ |
| `r29_TOURN_GENDER` | Q29 | Player Gender (Tourn) | r___________ |
| `r30_TOURN_LEVEL` | Q30 | Level of Play (Tourn) | r___________ |
| `r31_DISCIPLINE` | Q31 | Discipline Policy | r___________ |
| `r32_AGREEMENT` | Q32 | Agreement | r___________ |

---

## Step 9: Add PDF Attachments

Before the Client email action, add these steps:

### 9.1 Get Fee Schedule PDF
1. Click **+ New step** (insert before client email)
2. Search: `OneDrive for Business` → **Get file content**
3. **File:** Navigate to your Fee Schedule PDF
4. Rename action to: `Get_Fee_Schedule`

### 9.2 Get Invoice Policy PDF
1. Click **+ New step**
2. **OneDrive for Business** → **Get file content**
3. **File:** Navigate to your Invoice Policy PDF
4. Rename action to: `Get_Invoice_Policy`

### 9.3 Configure Email Attachments
In the Client email action:
1. Click **Show advanced options**
2. Find **Attachments**
3. Click **Switch to input entire array**
4. Enter:

```json
[
  {
    "Name": "CBOA Fee Schedule 2025-2028.pdf",
    "ContentBytes": "@{base64(outputs('Get_Fee_Schedule')?['body'])}"
  },
  {
    "Name": "CBOA Invoice Policy.pdf",
    "ContentBytes": "@{base64(outputs('Get_Invoice_Policy')?['body'])}"
  }
]
```

---

## Step 10: Configure Send As

For emails to come from `scheduler@cboa.ca`:

### Option A: Shared Mailbox
1. Go to Microsoft 365 Admin Center
2. Navigate to **Teams & groups** → **Shared mailboxes**
3. Select `scheduler@cboa.ca`
4. Under **Mailbox permissions** → **Send as**
5. Add the account running the Power Automate flow

### Option B: Direct Connection
1. In each email action, click **...** → **My connections**
2. Add a connection using credentials that have access to scheduler@cboa.ca

---

## Step 11: Save and Test

1. Click **Save**
2. Go to your Microsoft Form → **Preview**
3. Submit a test response
4. Check all recipients received emails correctly

---

## Complete Flow Structure

```
┌─────────────────────────────────────────┐
│ TRIGGER: When a new response is         │
│          submitted (Microsoft Forms)    │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ Get response details                    │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ Get Fee Schedule PDF (OneDrive)         │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ Get Invoice Policy PDF (OneDrive)       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ Send email to CLIENT                    │
│ To: Event Contact Email                 │
│ From: scheduler@cboa.ca                 │
│ Attachments: 2 PDFs                     │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ Send email to SCHEDULER                 │
│ To: scheduler@cboa.ca                   │
│ All details, no attachments             │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ Send email to TREASURER                 │
│ To: treasurer@cboa.ca                   │
│ Billing details only                    │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│ Send email to PRESIDENT (optional)      │
│ To: president@cboa.ca                   │
└─────────────────────────────────────────┘
```

---

## Troubleshooting

### Emails not sending
- Check flow run history for errors
- Verify "Send as" permissions for scheduler@cboa.ca
- Confirm email addresses are correct

### Attachments not appearing
- Verify PDF files exist in OneDrive
- Check "Get file content" actions succeeded
- Ensure base64 encoding is correct in attachment array

### Field values showing as blank
- Verify field IDs match your form
- Check that branching fields have values (League/Exhibition/Tournament specific)
- Use `coalesce()` function for fields that might be empty

### Form not triggering flow
- Ensure flow is turned ON
- Verify correct form is selected in trigger
- Check form is published and accepting responses
