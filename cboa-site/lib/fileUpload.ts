export async function uploadFile(file: File, path?: string): Promise<{ url: string; fileName: string; size: number }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('path', path || `/portal/resources/`)

  const API_BASE = process.env.NODE_ENV === 'production'
    ? '/.netlify/functions'
    : 'http://localhost:9000/.netlify/functions'

  try {
    console.log('Uploading to:', `${API_BASE}/upload-file`)
    const response = await fetch(`${API_BASE}/upload-file`, {
      method: 'POST',
      body: formData
    })

    console.log('Upload response status:', response.status)

    if (!response.ok) {
      let errorMessage = `Upload failed with status ${response.status}`
      try {
        const errorData = await response.json()
        console.error('Upload error data:', errorData)
        errorMessage = errorData.error || errorMessage
      } catch {
        // If JSON parsing fails, try to get text
        try {
          const errorText = await response.text()
          console.error('Upload error text:', errorText)
          if (errorText) errorMessage = errorText
        } catch {
          // Use default error message
        }
      }
      throw new Error(errorMessage)
    }

    const result = await response.json()
    return {
      url: result.url,
      fileName: result.fileName,
      size: result.size
    }
  } catch (error) {
    console.error('File upload error:', error)
    throw error instanceof Error ? error : new Error('File upload failed')
  }
}