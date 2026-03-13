import { Handler } from '@netlify/functions'
import busboy from 'busboy'
import { supabase, getUserRole } from './_shared/handler'
import { Logger } from '../../lib/logger'
import { SITE_URL } from '../../lib/siteConfig'

const ALLOWED_ORIGINS = [
  SITE_URL,
  'http://localhost:3000',
  'http://localhost:8888',
  'http://localhost:9000',
].filter(Boolean) as string[]

export const handler: Handler = async (event) => {
  const logger = Logger.fromEvent('upload-file', event)
  const origin = event.headers.origin || event.headers.Origin

  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  // Verify authentication — any logged-in user can upload
  const authHeader = event.headers.authorization || event.headers.Authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) }
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)

  if (authError || !authUser) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) }
  }

  const userRole = getUserRole(authUser)
  const userEmail = authUser.email || 'unknown'

  return new Promise((resolve) => {
    const bb = busboy({
      headers: { 'content-type': event.headers['content-type'] || '' }
    })

    let fileName = ''
    let filePath = ''
    let fileBuffer: Buffer[] = []
    let fileSize = 0
    let originalFileName = ''

    bb.on('file', (name, file, info) => {
      const { filename, mimeType } = info
      originalFileName = filename
      logger.info('file', 'file_receiving', `Receiving file: ${filename}`, {
        metadata: { filename, mimeType }
      })

      const timestamp = Date.now()
      const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
      fileName = `${timestamp}-${safeFilename}`

      file.on('data', (data) => {
        fileBuffer.push(data)
        fileSize += data.length

        if (fileSize > 10 * 1024 * 1024) {
          file.destroy()
          logger.warn('file', 'file_too_large', `File too large: ${originalFileName}`, {
            metadata: { filename: originalFileName, size: fileSize }
          })
          resolve({ statusCode: 413, headers, body: JSON.stringify({ error: 'File too large (max 10MB)' }) })
        }
      })

      file.on('end', () => {
        logger.info('file', 'file_received', `File received: ${fileName}`, {
          metadata: { filename: fileName, size: fileSize }
        })
      })
    })

    bb.on('field', (name, val) => {
      if (name === 'path') filePath = val
    })

    bb.on('finish', async () => {
      if (!fileBuffer.length) {
        resolve({ statusCode: 400, headers, body: JSON.stringify({ error: 'No file received' }) })
        return
      }

      try {
        const fullBuffer = Buffer.concat(fileBuffer)

        const bucket = filePath && filePath.includes('email-images')
          ? 'email-images'
          : filePath && filePath.includes('newsletter')
          ? 'newsletters'
          : filePath && filePath.includes('training')
          ? 'training-materials'
          : 'portal-resources'

        const getContentType = (filename: string) => {
          const ext = filename.split('.').pop()?.toLowerCase()
          const types: Record<string, string> = {
            'pdf': 'application/pdf',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt': 'application/vnd.ms-powerpoint',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
          }
          return types[ext || ''] || 'application/octet-stream'
        }

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, fullBuffer, {
            contentType: getContentType(originalFileName),
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          logger.error('file', 'upload_failed', `Upload failed: ${originalFileName}`, new Error(error.message), {
            metadata: { filename: originalFileName, bucket }
          })
          resolve({ statusCode: 500, headers, body: JSON.stringify({ error: 'Upload failed' }) })
          return
        }

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path)

        await logger.audit('CREATE', 'file', data.path, {
          actorId: authUser.id,
          actorEmail: userEmail,
          newValues: { filename: fileName, bucket, size: fileSize, path: data.path },
          description: `Uploaded file: ${fileName} to ${bucket}`
        })

        logger.info('file', 'upload_success', `File uploaded: ${fileName}`, {
          metadata: { filename: fileName, bucket, size: fileSize, path: data.path }
        })

        resolve({
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            fileName,
            url: publicUrl,
            publicUrl,
            size: fileSize,
            bucket,
            path: data.path
          })
        })
      } catch (error) {
        logger.error('file', 'upload_error', 'Error uploading file', error instanceof Error ? error : new Error(String(error)), {
          metadata: { filename: originalFileName }
        })
        resolve({ statusCode: 500, headers, body: JSON.stringify({ error: 'Failed to upload file' }) })
      }
    })

    bb.on('error', (error) => {
      logger.error('file', 'busboy_error', 'File parsing error', error instanceof Error ? error : new Error(String(error)))
      resolve({ statusCode: 500, headers, body: JSON.stringify({ error: 'File upload failed' }) })
    })

    if (event.body) {
      const buffer = event.isBase64Encoded
        ? Buffer.from(event.body, 'base64')
        : Buffer.from(event.body)
      bb.end(buffer)
    } else {
      resolve({ statusCode: 400, headers, body: JSON.stringify({ error: 'No body received' }) })
    }
  })
}
