# How to Get SharePoint Environment Variables - Detailed Guide

## Prerequisites
- Microsoft 365 account with SharePoint access
- Admin access to Azure Active Directory (or have an admin do this)
- Excel file already created in SharePoint

## STEP 1: Get CLIENT_ID and TENANT_ID

1. **Go to Azure Portal**
   - Navigate to: https://portal.azure.com
   - Sign in with your Microsoft work account

2. **Create App Registration**
   - In the search bar at top, type "App registrations"
   - Click on "App registrations" service
   - Click "+ New registration" button
   - Fill in:
     - Name: `CBOA Forms Integration`
     - Supported account types: Select "Single tenant"
     - Redirect URI: Leave empty
   - Click "Register"

3. **Copy Your IDs**
   - You'll see the app overview page
   - **COPY THESE VALUES:**
     ```
     Application (client) ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
     Directory (tenant) ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
     ```
   - Save these to notepad

## STEP 2: Get CLIENT_SECRET

1. **In your app registration** (still in Azure Portal)
   - Click "Certificates & secrets" in left menu
   - Click "New client secret"
   - Description: `CBOA Forms Secret`
   - Expires: Choose "24 months"
   - Click "Add"

2. **IMMEDIATELY COPY THE SECRET**
   ```
   Value: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   ⚠️ **IMPORTANT**: Copy this NOW! It won't be shown again!

## STEP 3: Grant Permissions

1. **Still in your app registration**
   - Click "API permissions" in left menu
   - Click "Add a permission"
   - Choose "Microsoft Graph"
   - Choose "Application permissions" (NOT Delegated)
   - Search and check these permissions:
     - `Files.ReadWrite.All`
     - `Sites.ReadWrite.All`
   - Click "Add permissions"

2. **Grant Admin Consent**
   - Click "Grant admin consent for [Your Organization]"
   - Click "Yes"
   - You should see green checkmarks ✓

## STEP 4: Get SITE_ID

1. **Find Your SharePoint Site URL**
   - Go to your SharePoint site
   - Copy the URL, it looks like:
     ```
     https://yourcompany.sharepoint.com/sites/CBOA
     ```

2. **Use Graph Explorer**
   - Go to: https://developer.microsoft.com/en-us/graph/graph-explorer
   - Sign in with your Microsoft account
   - In the request bar, enter:
     ```
     https://graph.microsoft.com/v1.0/sites/yourcompany.sharepoint.com:/sites/CBOA
     ```
   - Click "Run query"
   - In the response, find and copy:
     ```json
     "id": "yourcompany.sharepoint.com,xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx,xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
     ```
   - This entire string is your SITE_ID

## STEP 5: Get DRIVE_ID

1. **In Graph Explorer**
   - Use your SITE_ID from Step 4
   - Enter this request:
     ```
     https://graph.microsoft.com/v1.0/sites/{your-site-id}/drives
     ```
   - Click "Run query"
   - Look for the drive named "Documents" or where your Excel file is
   - Copy the "id":
     ```json
     "id": "b!xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
     ```

## STEP 6: Get WORKBOOK_ID

### Method 1: From SharePoint URL
1. **Navigate to your Excel file in SharePoint**
2. **Click on the file to open it in Excel Online**
3. **Look at the URL**, it will look like:
   ```
   https://yourcompany.sharepoint.com/:x:/s/CBOA/ExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxQ
   ```
4. **The WORKBOOK_ID is the long string after /E and before ?**
   - In this example: `ExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxQ`

### Method 2: From Graph Explorer
1. **In Graph Explorer**, enter:
   ```
   https://graph.microsoft.com/v1.0/sites/{site-id}/drives/{drive-id}/root/children
   ```
2. **Find your Excel file in the response**
3. **Copy its "id"**

## STEP 7: Create Your Excel File Structure

1. **Go to your SharePoint site**
2. **Create a new Excel file** or use existing
3. **Name it**: `FormSubmissions.xlsx`
4. **Create these column headers in Row 1**:
   ```
   A1: Timestamp
   B1: Organization Name
   C1: Contact Name
   D1: Email
   E1: Phone
   F1: Event Date
   G1: Event Type
   H1: Venue
   I1: Number of Games
   J1: Game Level
   K1: Special Requirements
   ```

5. **Create a Table**:
   - Select all headers (A1:K1)
   - Insert → Table
   - Name it "Table1" (important!)
   - Save the file

## FINAL: Your .env.local File

Create/update `.env.local` in your project root:

```env
# From Step 1
SHAREPOINT_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
SHAREPOINT_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# From Step 2
SHAREPOINT_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# From Step 4
SHAREPOINT_SITE_ID=yourcompany.sharepoint.com,xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx,xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# From Step 5
SHAREPOINT_DRIVE_ID=b!xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# From Step 6
SHAREPOINT_WORKBOOK_ID=ExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxQ
```

## Testing Your Configuration

Run this test script to verify everything works:

```javascript
// test-sharepoint.js
const { SharePointClient } = require('./lib/sharepoint/client')

const client = new SharePointClient({
  clientId: process.env.SHAREPOINT_CLIENT_ID,
  clientSecret: process.env.SHAREPOINT_CLIENT_SECRET,
  tenantId: process.env.SHAREPOINT_TENANT_ID,
  siteId: process.env.SHAREPOINT_SITE_ID,
  driveId: process.env.SHAREPOINT_DRIVE_ID,
  workbookId: process.env.SHAREPOINT_WORKBOOK_ID
})

// Test adding a row
client.addRowToExcel('Sheet1', [
  new Date().toISOString(),
  'Test Organization',
  'Test Contact',
  'test@email.com',
  '403-555-0123',
  '2024-01-15',
  'Tournament',
  'Test Venue',
  '5',
  'U15',
  'Test submission'
])
.then(() => console.log('Success! Check your Excel file'))
.catch(err => console.error('Error:', err))
```

## Common Issues & Solutions

### "401 Unauthorized"
- Check that admin consent was granted
- Verify CLIENT_SECRET is correct and not expired

### "404 Not Found"
- Double-check all IDs are copied correctly
- Ensure Excel file exists at the specified location
- Verify Table1 exists in your Excel file

### "400 Bad Request"
- Check that your Excel table has the correct columns
- Ensure data types match (dates as strings, numbers as strings)

## Need Help?

If you get stuck on any step:
1. Check the exact error message
2. Verify each ID one by one
3. Make sure permissions are granted (green checkmarks in Azure)
4. Ensure your Excel file has Table1 created

## Alternative: Use Microsoft's Own Tools

If this seems complex, consider using:
- **Microsoft Forms** (automatically syncs to Excel)
- **Power Apps** (build forms that write directly to SharePoint)
- **Power Automate** (connect any form to SharePoint)