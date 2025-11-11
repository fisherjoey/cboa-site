import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import busboy from 'busboy'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  return new Promise((resolve) => {
    const bb = busboy({ 
      headers: { 
        'content-type': event.headers['content-type'] || ''
      } 
    })
    
    let fileName = ''
    let filePath = ''
    let fileBuffer: Buffer[] = []
    let fileSize = 0
    
    bb.on('file', (name, file, info) => {
      const { filename, mimeType } = info
      console.log(`Receiving file: ${filename}, type: ${mimeType}`)
      
      // Generate safe filename with timestamp
      const timestamp = Date.now()
      const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
      fileName = `${timestamp}-${safeFilename}`
      
      file.on('data', (data) => {
        fileBuffer.push(data)
        fileSize += data.length
        
        // Limit file size to 10MB
        if (fileSize > 10 * 1024 * 1024) {
          file.destroy()
          resolve({
            statusCode: 413,
            headers,
            body: JSON.stringify({ error: 'File too large (max 10MB)' })
          })
        }
      })
      
      file.on('end', () => {
        console.log(`File received: ${fileName}, size: ${fileSize} bytes`)
      })
    })
    
    bb.on('field', (name, val) => {
      if (name === 'path') {
        filePath = val
      }
    })
    
    bb.on('finish', async () => {
      if (!fileBuffer.length) {
        resolve({
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'No file received' })
        })
        return
      }

      try {
        // Combine buffer chunks
        const fullBuffer = Buffer.concat(fileBuffer)

        // Determine bucket based on path or default to portal-resources
        const bucket = filePath && filePath.includes('newsletter')
          ? 'newsletters'
          : filePath && filePath.includes('training')
          ? 'training-materials'
          : 'portal-resources'

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, fullBuffer, {
            contentType: 'application/octet-stream',
            cacheControl: '3600',
            upsert: false
          })

        if (error) {
          console.error('Supabase upload error:', error)
          resolve({
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: `Upload failed: ${error.message}` })
          })
          return
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(data.path)

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
        console.error('Error uploading file:', error)
        resolve({
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to upload file' })
        })
      }
    })
    
    bb.on('error', (error) => {
      console.error('Busboy error:', error)
      resolve({
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'File upload failed' })
      })
    })
    
    // Parse the request
    if (event.body) {
      // If body is base64 encoded (from API Gateway)
      const buffer = event.isBase64Encoded 
        ? Buffer.from(event.body, 'base64')
        : Buffer.from(event.body)
      
      bb.end(buffer)
    } else {
      resolve({
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No body received' })
      })
    }
  })
}