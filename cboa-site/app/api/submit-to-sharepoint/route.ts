import { NextRequest, NextResponse } from 'next/server'
import { SharePointClient } from '@/lib/sharepoint/client'

// Initialize SharePoint client with environment variables
const sharePointClient = new SharePointClient({
  clientId: process.env.SHAREPOINT_CLIENT_ID!,
  clientSecret: process.env.SHAREPOINT_CLIENT_SECRET!,
  tenantId: process.env.SHAREPOINT_TENANT_ID!,
  siteId: process.env.SHAREPOINT_SITE_ID!,
  driveId: process.env.SHAREPOINT_DRIVE_ID!,
  workbookId: process.env.SHAREPOINT_WORKBOOK_ID!
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    // Map form data to Excel row format
    const rowData = [
      new Date().toISOString(), // Timestamp
      formData.organizationName,
      formData.contactName,
      formData.email,
      formData.phone,
      formData.eventDate,
      formData.eventType,
      formData.venue,
      formData.numberOfGames,
      formData.gameLevel,
      formData.specialRequirements || ''
    ]

    // Add row to Excel worksheet
    await sharePointClient.addRowToExcel('OfficialsRequests', rowData)

    // Optionally send email notification
    // await sendEmailNotification(formData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error submitting to SharePoint:', error)
    return NextResponse.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    )
  }
}