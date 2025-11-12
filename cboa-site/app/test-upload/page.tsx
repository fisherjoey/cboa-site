'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestUploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first')
      return
    }

    setUploading(true)
    setResult(null)
    setError(null)

    try {
      // Generate a unique filename
      const timestamp = Date.now()
      const fileName = `test-${timestamp}-${file.name}`

      console.log('📤 Uploading file:', fileName)
      console.log('📦 File size:', file.size, 'bytes')
      console.log('📝 File type:', file.type)

      // Upload to portal-resources bucket
      const { data, error: uploadError } = await supabase.storage
        .from('portal-resources')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('❌ Upload error:', uploadError)
        setError(`Upload failed: ${uploadError.message}`)
        setUploading(false)
        return
      }

      console.log('✅ Upload successful:', data)

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('portal-resources')
        .getPublicUrl(data.path)

      console.log('🔗 Public URL:', urlData.publicUrl)
      setResult(urlData.publicUrl)

    } catch (err: any) {
      console.error('❌ Exception:', err)
      setError(`Exception: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          📤 Supabase Storage Upload Test
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Upload File</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select a file to upload:
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
            </div>

            {file && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">
                  <strong>Selected:</strong> {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md
                hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload to Supabase'}
            </button>
          </div>

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded p-4 text-red-800">
              <strong>Error:</strong> {error}
            </div>
          )}

          {result && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded p-4">
              <p className="text-green-800 font-semibold mb-2">✅ Upload successful!</p>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Public URL:</strong>
              </p>
              <a
                href={result}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all text-sm"
              >
                {result}
              </a>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <h3 className="font-semibold mb-2">ℹ️ Info:</h3>
          <p className="text-sm text-gray-700">
            This test uploads directly to Supabase Storage from the browser,
            bypassing the Netlify function. If this works, it means Supabase Storage
            is configured correctly and the issue is with the Netlify function setup.
          </p>
        </div>
      </div>
    </div>
  )
}
