'use client'

import { Editor } from '@tinymce/tinymce-react'
import { useRef } from 'react'

interface TinyMCEEditorProps {
  value: string
  onChange: (value: string) => void
  height?: number
  placeholder?: string
  readOnly?: boolean
}

export function TinyMCEEditor({
  value,
  onChange,
  height = 500,
  placeholder = 'Start typing here...',
  readOnly = false
}: TinyMCEEditorProps) {
  const editorRef = useRef<any>(null)

  return (
    <Editor
      apiKey="3qrvs2mrxhabanj8u4ub1lllalhogawo5kje2l6w6asoz3xu"
      onInit={(_evt, editor) => editorRef.current = editor}
      value={value}
      onEditorChange={onChange}
      disabled={readOnly}
      init={{
        height: height,
        menubar: true,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
          'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
          'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
          'bold italic forecolor | alignleft aligncenter ' +
          'alignright alignjustify | bullist numlist outdent indent | ' +
          'removeformat | image link | table | code | help',
        content_style: `
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: #374151;
          }
          h1 { color: #003DA5; font-size: 2.5rem; font-weight: bold; margin-top: 1.5rem; margin-bottom: 1rem; }
          h2 { color: #003DA5; font-size: 1.875rem; font-weight: bold; margin-top: 1.25rem; margin-bottom: 0.875rem; }
          h3 { color: #003DA5; font-size: 1.5rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.75rem; }
          h4 { color: #003DA5; font-size: 1.25rem; font-weight: 600; margin-top: 0.875rem; margin-bottom: 0.625rem; }
          p { margin-bottom: 1rem; }
          a { color: #F97316; text-decoration: underline; }
          a:hover { color: #003DA5; }
          strong { color: #003DA5; font-weight: 600; }
          table { border-collapse: collapse; width: 100%; margin: 1.5rem 0; }
          th { background-color: #003DA5; color: white; font-weight: 600; padding: 0.75rem; text-align: left; }
          td { border: 1px solid #E5E7EB; padding: 0.75rem; }
          blockquote { border-left: 4px solid #F97316; background-color: #FFF7ED; padding: 1rem 1.5rem; margin: 1.5rem 0; font-style: italic; }
          ul, ol { margin: 1rem 0; padding-left: 2rem; }
          li { margin: 0.5rem 0; }
          img { max-width: 100%; height: auto; }
        `,
        placeholder: placeholder,
        branding: false,
        promotion: false,
        // Image upload handling - convert to base64
        images_upload_handler: async (blobInfo, progress) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
              resolve(reader.result as string)
            }
            reader.onerror = () => reject('Failed to read image')
            reader.readAsDataURL(blobInfo.blob())
          })
        },
        // Disable automatic uploads on paste
        automatic_uploads: false,
        // Cache images in browser
        images_reuse_filename: true,
        // Prevent image proxy
        images_file_types: 'jpg,jpeg,png,gif,svg,webp',
        // Color picker with CBOA brand colors
        color_map: [
          '#003DA5', 'CBOA Blue',
          '#F97316', 'CBOA Orange',
          '#000000', 'Black',
          '#374151', 'Gray',
          '#FFFFFF', 'White',
          '#EF4444', 'Red',
          '#10B981', 'Green',
          '#3B82F6', 'Blue',
        ],
      }}
    />
  )
}

interface HTMLViewerProps {
  content: string
  className?: string
}

export function HTMLViewer({ content, className = '' }: HTMLViewerProps) {
  return (
    <div
      className={`tinymce-content ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
