export async function uploadFile(file: File): Promise<{ url: string; fileName: string; size: number }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('path', `/portal/resources/`)

  const API_BASE = process.env.NODE_ENV === 'production' 
    ? '/.netlify/functions' 
    : 'http://localhost:8888/.netlify/functions'

  try {
    const response = await fetch(`${API_BASE}/upload-file`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      let errorMessage = `Upload failed with status ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorMessage
      } catch {
        // If JSON parsing fails, try to get text
        try {
          const errorText = await response.text()
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