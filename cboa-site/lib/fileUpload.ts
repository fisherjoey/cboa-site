import { validators, AppError } from './errorHandling'

const MAX_FILE_SIZE_MB = 25
const ALLOWED_FILE_TYPES = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'mp4', 'avi', 'mov', 'jpg', 'jpeg', 'png']

export async function uploadFile(file: File, path?: string): Promise<{ url: string; fileName: string; size: number }> {
  // Frontend validation before upload
  const fileSizeError = validators.fileSize(file, MAX_FILE_SIZE_MB)
  if (fileSizeError) {
    throw new AppError(fileSizeError, 'VALIDATION_ERROR')
  }

  const fileTypeError = validators.fileType(file, ALLOWED_FILE_TYPES)
  if (fileTypeError) {
    throw new AppError(fileTypeError, 'VALIDATION_ERROR')
  }

  // Check for potentially dangerous file names
  const fileName = file.name
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    throw new AppError('Invalid file name. File names cannot contain path separators.', 'VALIDATION_ERROR')
  }

  // Prepare upload
  const formData = new FormData()
  formData.append('file', file)
  formData.append('path', path || `/portal/resources/`)

  const API_BASE = process.env.NODE_ENV === 'production'
    ? '/.netlify/functions'
    : 'http://localhost:9000/.netlify/functions'

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
      throw new AppError(errorMessage, 'UPLOAD_ERROR', response.status)
    }

    const result = await response.json()
    return {
      url: result.url,
      fileName: result.fileName,
      size: result.size
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    // Handle network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new AppError(
        'Network error during file upload. Please check your connection and try again.',
        'NETWORK_ERROR'
      )
    }

    throw new AppError(
      error instanceof Error ? error.message : 'File upload failed',
      'UPLOAD_ERROR'
    )
  }
}