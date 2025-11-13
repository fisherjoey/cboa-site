'use client'

import { useRef } from 'react'
import { IconUpload, IconX } from '@tabler/icons-react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  selectedFile?: File | null
  accept?: string
  maxSize?: number // in MB
  className?: string
  buttonText?: string
  showFileName?: boolean
}

export default function FileUpload({
  onFileSelect,
  selectedFile,
  accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx',
  maxSize = 10,
  className = '',
  buttonText = 'Choose File',
  showFileName = true
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size
      const fileSizeMB = file.size / (1024 * 1024)
      if (fileSizeMB > maxSize) {
        alert(`File size exceeds ${maxSize}MB limit`)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      }
      onFileSelect(file)
    }
  }

  const handleClearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onFileSelect(null as any)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={accept}
      />

      <div className="flex gap-2 items-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg border border-gray-300 flex items-center gap-2 transition-colors text-sm font-medium text-gray-700"
        >
          <IconUpload className="h-4 w-4" />
          {buttonText}
        </button>

        {selectedFile && showFileName && (
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg flex-1">
            <span className="text-sm text-blue-900 truncate flex-1">{selectedFile.name}</span>
            <span className="text-xs text-blue-600 whitespace-nowrap">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </span>
            <button
              type="button"
              onClick={handleClearFile}
              className="text-blue-600 hover:text-blue-800 flex-shrink-0"
              title="Remove file"
            >
              <IconX className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Accepted formats: {accept.split(',').join(', ')} (max {maxSize}MB)
      </p>
    </div>
  )
}
