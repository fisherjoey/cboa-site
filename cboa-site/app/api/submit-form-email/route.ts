import { NextRequest, NextResponse } from 'next/server'

// Simple email notification for form submissions
// This sends an email with form data that can be manually added to Excel

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    // Format the email body
    const emailBody = `
      New Official Request Received:

      Organization: ${formData.organizationName}
      Contact Name: ${formData.contactName}
      Email: ${formData.email}
      Phone: ${formData.phone}
      Event Date: ${formData.eventDate}
      Event Type: ${formData.eventType}
      Venue: ${formData.venue}
      Number of Games: ${formData.numberOfGames}
      Game Level: ${formData.gameLevel}
      Special Requirements: ${formData.specialRequirements || 'None'}

      Submitted at: ${new Date().toISOString()}
    `

    // For now, just log it (in production, you'd send an actual email)
    console.log('Form submission:', emailBody)

    // You could use a service like SendGrid, Resend, or SMTP here
    // Example with fetch to a webhook:
    if (process.env.WEBHOOK_URL) {
      await fetch(process.env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: emailBody,
          formData: formData
        })
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully. You will be contacted within 24-48 hours.'
    })
  } catch (error) {
    console.error('Error submitting form:', error)
    return NextResponse.json(
      { error: 'Failed to submit form' },
      { status: 500 }
    )
  }
}