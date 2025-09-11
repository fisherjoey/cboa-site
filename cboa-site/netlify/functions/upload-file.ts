import { Handler } from '@netlify/functions'
import * as fs from 'fs'
import * as path from 'path'
import busboy from 'busboy'

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
        
        // In production, you would:
        // 1. Upload to a CDN or storage service
        // 2. Or commit to git repository via GitHub API
        // 3. Or save to Netlify Large Media
        
        // For local development, we'll save to the public folder
        const publicPath = path.join(process.cwd(), 'public', 'portal', 'resources')
        
        // Ensure directory exists
        if (!fs.existsSync(publicPath)) {
          fs.mkdirSync(publicPath, { recursive: true })
        }
        
        // Save file
        const fullPath = path.join(publicPath, fileName)
        fs.writeFileSync(fullPath, fullBuffer)
        
        // Return the public URL
        const publicUrl = `/portal/resources/${fileName}`
        
        resolve({
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            fileName,
            url: publicUrl,
            size: fileSize
          })
        })
      } catch (error) {
        console.error('Error saving file:', error)
        resolve({
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to save file' })
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