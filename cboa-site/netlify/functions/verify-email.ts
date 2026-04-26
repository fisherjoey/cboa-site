import { Handler } from '@netlify/functions'
import { getCorsHeaders } from './_shared/handler'
import { checkRateLimit, getClientIp } from './_shared/rateLimit'
import { createHmac } from 'crypto'
import { generateCBOAEmailTemplate } from '../../lib/emailTemplate'
import { validateEmail } from '../../lib/emailValidation'
import { EMAIL_NO_REPLY, EMAIL_ANNOUNCEMENTS, ORG_NAME } from '../../lib/siteConfig'

const VERIFICATION_TTL_MS = 10 * 60 * 1000 // 10 minutes

function getHmacSecret(): string {
  // Use a dedicated secret or fall back to the MS client secret
  return process.env.EMAIL_VERIFY_SECRET || process.env.MICROSOFT_CLIENT_SECRET || ''
}

/**
 * Generate HMAC token containing email + code + expiry
 * This is stateless — no database needed
 */
function generateVerificationToken(email: string, code: string): string {
  const expiry = Date.now() + VERIFICATION_TTL_MS
  const payload = `${email.toLowerCase()}:${code}:${expiry}`
  const hmac = createHmac('sha256', getHmacSecret()).update(payload).digest('hex')
  // Encode as base64: payload + hmac
  return Buffer.from(`${payload}:${hmac}`).toString('base64')
}

/**
 * Verify HMAC token and code
 */
export function verifyEmailToken(token: string, email: string, code: string): { valid: boolean; reason?: string } {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8')
    const parts = decoded.split(':')
    if (parts.length !== 4) return { valid: false, reason: 'Invalid verification token' }

    const [tokenEmail, tokenCode, expiryStr, tokenHmac] = parts
    const expiry = parseInt(expiryStr, 10)

    // Check expiry
    if (Date.now() > expiry) {
      return { valid: false, reason: 'Verification code has expired. Please request a new one.' }
    }

    // Check email matches
    if (tokenEmail !== email.toLowerCase()) {
      return { valid: false, reason: 'Email address does not match the verified email.' }
    }

    // Check code matches
    if (tokenCode !== code) {
      return { valid: false, reason: 'Incorrect verification code.' }
    }

    // Verify HMAC
    const payload = `${tokenEmail}:${tokenCode}:${expiryStr}`
    const expectedHmac = createHmac('sha256', getHmacSecret()).update(payload).digest('hex')
    if (tokenHmac !== expectedHmac) {
      return { valid: false, reason: 'Invalid verification token.' }
    }

    return { valid: true }
  } catch {
    return { valid: false, reason: 'Invalid verification token.' }
  }
}

async function getAccessToken(): Promise<string> {
  const tokenEndpoint = `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`

  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID || '',
    client_secret: process.env.MICROSOFT_CLIENT_SECRET || '',
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  })

  const response = await fetch(tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to get access token: ${error}`)
  }

  const data = await response.json()
  return data.access_token
}

export const handler: Handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin
  const headers = {
    ...getCorsHeaders(origin, ['POST']),
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  // Rate limit: 5 verification requests per minute per IP
  const clientIp = getClientIp(event.headers)
  if (checkRateLimit(clientIp, { maxRequests: 5, windowMs: 60_000, prefix: 'verify-email' })) {
    return { statusCode: 429, headers, body: JSON.stringify({ error: 'Too many requests. Please try again later.' }) }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const { email, code: providedCode, token: providedToken } = JSON.parse(event.body || '{}')

    if (!email) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Email is required' }) }
    }

    // Verification mode: caller has a token and a 6-digit code, wants
    // to know if they match. Used by the ContactForm to confirm the
    // code server-side before showing a "verified" UI state.
    if (providedCode && providedToken) {
      const result = verifyEmailToken(providedToken, email, providedCode)
      if (result.valid) {
        return { statusCode: 200, headers, body: JSON.stringify({ success: true, valid: true }) }
      }
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, valid: false, error: result.reason || 'Invalid code' }) }
    }

    // Validate the email first (MX check, disposable blocking)
    const emailValidation = await validateEmail(email)
    if (!emailValidation.valid) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: emailValidation.reason, suggestion: emailValidation.suggestion }),
      }
    }

    // Generate 6-digit code
    const code = String(Math.floor(100000 + Math.random() * 900000))
    const token = generateVerificationToken(email, code)

    // Build verification email
    const emailContent = `
      <h1>Your Verification Code</h1>
      <p>You requested a verification code to submit a message through the ${ORG_NAME} contact form.</p>
      <div style="text-align: center; margin: 30px 0;">
        <div style="display: inline-block; background-color: #f3f4f6; border: 2px solid #d1d5db; border-radius: 12px; padding: 20px 40px;">
          <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #111827; font-family: monospace;">${code}</span>
        </div>
      </div>
      <p style="color: #6b7280; font-size: 14px;">This code expires in 10 minutes. If you did not request this code, you can safely ignore this email.</p>
    `

    const emailHtml = generateCBOAEmailTemplate({
      subject: 'Your Verification Code',
      content: emailContent,
      previewText: `Your verification code is ${code}`,
      external: true,
    })

    // Send via MS Graph
    const accessToken = await getAccessToken()
    const senderEmail = EMAIL_NO_REPLY
    const graphEndpoint = `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`

    const emailMessage = {
      message: {
        subject: `${ORG_NAME} - Verification Code`,
        body: { contentType: 'HTML', content: emailHtml },
        from: { emailAddress: { address: senderEmail } },
        toRecipients: [{ emailAddress: { address: email } }],
      },
      saveToSentItems: false,
    }

    const response = await fetch(graphEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailMessage),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to send verification email: ${error}`)
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, token }),
    }
  } catch (error) {
    console.error('[VerifyEmail] Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to send verification email. Please try again.' }),
    }
  }
}
