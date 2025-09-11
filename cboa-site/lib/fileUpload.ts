export async function uploadFile(file: File): Promise<{ url: string; fileName: string; size: number }> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('path', `/portal/resources/`)

  const API_BASE = process.env.NODE_ENV === 'production' 
    ? '/.netlify/functions' 
    : 'http://localhost:8888/.netlify/functions'

  const response = await fetch(`${API_BASE}/upload-file`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'File upload failed')
  }

  const result = await response.json()
  return {
    url: result.url,
    fileName: result.fileName,
    size: result.size
  }
}