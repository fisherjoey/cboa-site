// Local file storage using localStorage (for demo/development)
export async function uploadFileLocal(file: File): Promise<{ url: string; fileName: string; size: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = () => {
      try {
        const base64 = reader.result as string
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        
        // Store in localStorage with metadata
        const fileData = {
          fileName,
          originalName: file.name,
          size: file.size,
          type: file.type,
          data: base64,
          uploadedAt: new Date().toISOString()
        }
        
        // Get existing files
        const existingFiles = JSON.parse(localStorage.getItem('cboa_uploaded_files') || '[]')
        existingFiles.push(fileData)
        
        // Store updated files list
        localStorage.setItem('cboa_uploaded_files', JSON.stringify(existingFiles))
        
        resolve({
          url: base64, // Return the base64 data URL directly
          fileName,
          size: file.size
        })
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    // Read file as data URL (base64)
    reader.readAsDataURL(file)
  })
}