'use client'

import { useState } from 'react'
import { IconX, IconDownload, IconExternalLink, IconMaximize } from '@tabler/icons-react'

interface ResourceViewerProps {
  resource: {
    title: string
    fileUrl?: string
    externalLink?: string
    description?: string
    fileSize?: string
  }
  onClose: () => void
}

export default function ResourceViewer({ resource, onClose }: ResourceViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [iframeError, setIframeError] = useState(false)

  // Debug logging
  console.log('ResourceViewer - resource:', resource)
  console.log('ResourceViewer - fileUrl:', resource.fileUrl)
  console.log('ResourceViewer - externalLink:', resource.externalLink)

  const getFileType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase()
    
    if (['pdf'].includes(extension || '')) return 'pdf'
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) return 'image'
    if (['mp4', 'webm', 'ogg', 'mov'].includes(extension || '')) return 'video'
    if (['mp3', 'wav', 'ogg'].includes(extension || '')) return 'audio'
    if (['doc', 'docx'].includes(extension || '')) return 'word'
    if (['xls', 'xlsx'].includes(extension || '')) return 'excel'
    if (['ppt', 'pptx'].includes(extension || '')) return 'powerpoint'
    
    return 'other'
  }
  
  const fileType = resource.fileUrl ? getFileType(resource.fileUrl) : null
  
  const renderContent = () => {
    if (resource.externalLink && !resource.fileUrl) {
      // For external links, show in iframe if it's a video platform
      if (resource.externalLink.includes('youtube.com') || resource.externalLink.includes('youtu.be')) {
        const videoId = resource.externalLink.includes('youtu.be') 
          ? resource.externalLink.split('/').pop()
          : resource.externalLink.split('v=')[1]?.split('&')[0]
          
        return (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        )
      }
      
      if (resource.externalLink.includes('vimeo.com')) {
        const videoId = resource.externalLink.split('/').pop()
        return (
          <iframe
            src={`https://player.vimeo.com/video/${videoId}`}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
          />
        )
      }
      
      // For other external links, show in iframe
      return (
        <iframe
          src={resource.externalLink}
          className="w-full h-full"
          title={resource.title}
        />
      )
    }
    
    if (!resource.fileUrl) return null
    
    switch (fileType) {
      case 'pdf':
        if (iframeError) {
          return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <p className="text-gray-600">Unable to preview PDF in browser</p>
              <div className="flex gap-3">
                <a
                  href={resource.fileUrl}
                  download
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <IconDownload className="h-5 w-5" />
                  Download PDF
                </a>
                <a
                  href={resource.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
                >
                  <IconExternalLink className="h-5 w-5" />
                  Open in New Tab
                </a>
              </div>
            </div>
          )
        }
        return (
          <div className="w-full h-full">
            <object
              data={resource.fileUrl}
              type="application/pdf"
              className="w-full h-full"
            >
              <iframe
                src={`${resource.fileUrl}#view=FitH`}
                className="w-full h-full"
                title={resource.title}
              />
            </object>
          </div>
        )
        
      case 'image':
        return (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <img
              src={resource.fileUrl}
              alt={resource.title}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )
        
      case 'video':
        return (
          <video
            src={resource.fileUrl}
            controls
            className="w-full h-full"
            controlsList="nodownload"
          >
            Your browser does not support the video tag.
          </video>
        )
        
      case 'audio':
        return (
          <div className="flex items-center justify-center h-full">
            <audio
              src={resource.fileUrl}
              controls
              className="w-full max-w-md"
            >
              Your browser does not support the audio tag.
            </audio>
          </div>
        )
        
      case 'word':
      case 'excel':
      case 'powerpoint':
        // For Office files, show preview using Office Online viewer
        const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(window.location.origin + resource.fileUrl)}`
        return (
          <iframe
            src={officeUrl}
            className="w-full h-full"
            title={resource.title}
          />
        )
        
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <p className="text-gray-600">Preview not available for this file type</p>
            <a
              href={resource.fileUrl}
              download
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <IconDownload className="h-5 w-5" />
              Download File
            </a>
          </div>
        )
    }
  }
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-lg shadow-xl ${isFullscreen ? 'w-full h-full' : 'w-full max-w-6xl h-[80vh]'} flex flex-col`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold truncate">{resource.title}</h2>
            {resource.description && (
              <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{resource.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
              title="Toggle fullscreen"
            >
              <IconMaximize className="h-5 w-5" />
            </button>
            {resource.fileUrl && (
              <a
                href={resource.fileUrl}
                download
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                title="Download"
              >
                <IconDownload className="h-5 w-5" />
              </a>
            )}
            {resource.externalLink && (
              <a
                href={resource.externalLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                title="Open in new tab"
              >
                <IconExternalLink className="h-5 w-5" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
              title="Close"
            >
              <IconX className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
        
        {/* Footer */}
        {resource.fileSize && (
          <div className="px-4 py-2 border-t text-sm text-gray-500">
            File size: {resource.fileSize}
          </div>
        )}
      </div>
    </div>
  )
}