# SharePoint Forms Integration Setup Guide

## Overview
This guide walks you through setting up SharePoint/Excel Online integration for your CBOA forms.

## Prerequisites
- Microsoft 365 account with SharePoint access
- Admin access to Azure Active Directory
- An Excel file in SharePoint to store form submissions

## Step 1: Create Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to Azure Active Directory > App registrations
3. Click "New registration"
4. Configure:
   - Name: "CBOA Forms Integration"
   - Account types: "Single tenant"
   - Redirect URI: Leave blank
5. After creation, note down:
   - Application (client) ID
   - Directory (tenant) ID

## Step 2: Create Client Secret

1. In your app registration, go to "Certificates & secrets"
2. Click "New client secret"
3. Add description and expiry
4. Copy the secret value immediately (won't be shown again)

## Step 3: Grant API Permissions

1. Go to "API permissions" in your app
2. Click "Add a permission"
3. Choose "Microsoft Graph"
4. Select "Application permissions"
5. Add these permissions:
   - Files.ReadWrite.All
   - Sites.ReadWrite.All
6. Click "Grant admin consent"

## Step 4: Get SharePoint IDs

### Get Site ID:
```bash
# Using Graph Explorer or curl
GET https://graph.microsoft.com/v1.0/sites/{hostname}:/sites/{site-name}
```

### Get Drive ID:
```bash
GET https://graph.microsoft.com/v1.0/sites/{site-id}/drives
```

### Get Workbook ID:
Navigate to your Excel file in SharePoint, the ID is in the URL.

## Step 5: Setup Excel File

Create an Excel file in SharePoint with these columns:
- Timestamp
- Organization Name
- Contact Name
- Email
- Phone
- Event Date
- Event Type
- Venue
- Number of Games
- Game Level
- Special Requirements

Create a table named "Table1" with these columns.

## Step 6: Configure Environment Variables

Add to `.env.local`:
```env
SHAREPOINT_CLIENT_ID=your-client-id
SHAREPOINT_CLIENT_SECRET=your-client-secret
SHAREPOINT_TENANT_ID=your-tenant-id
SHAREPOINT_SITE_ID=your-site-id
SHAREPOINT_DRIVE_ID=your-drive-id
SHAREPOINT_WORKBOOK_ID=your-workbook-id
```

## Step 7: Update Form Component

Replace the form submission handler with:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  try {
    const response = await fetch('/api/submit-to-sharepoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    if (response.ok) {
      setSubmitted(true)
    } else {
      throw new Error('Submission failed')
    }
  } catch (error) {
    console.error('Error:', error)
    alert('Failed to submit form. Please try again.')
  }
}
```

## Alternative Options

### Option 2: Power Automate (No-Code)
1. Keep using Netlify Forms
2. Create a Power Automate flow that:
   - Triggers on email receipt (Netlify sends form notifications)
   - Parses the email content
   - Adds row to SharePoint Excel

### Option 3: Webhook Integration
1. Use Netlify Functions to receive form submissions
2. Forward to Power Automate HTTP webhook
3. Power Automate adds to Excel

### Option 4: Zapier/Make.com
1. Connect Netlify Forms to SharePoint
2. Automated, but requires paid subscription

## Testing

1. Submit a test form
2. Check SharePoint Excel file for new row
3. Monitor API logs for errors

## Security Considerations

- Never expose credentials in client-side code
- Use environment variables for sensitive data
- Regularly rotate client secrets
- Implement rate limiting on API endpoints
- Add input validation and sanitization

## Troubleshooting

### Common Issues:

**401 Unauthorized**: Check permissions and consent
**404 Not Found**: Verify all IDs are correct
**400 Bad Request**: Check Excel table structure matches data

## Support

For Microsoft Graph API issues:
- [Microsoft Graph Documentation](https://docs.microsoft.com/en-us/graph/)
- [SharePoint REST API](https://docs.microsoft.com/en-us/sharepoint/dev/sp-add-ins/working-with-lists-and-list-items-with-rest)