'use client';

import { useState } from 'react';
import { IconX, IconDownload, IconExternalLink, IconMaximize } from '@tabler/icons-react';

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
  onClose: () => void;
}

export default function PDFViewer({ pdfUrl, title, onClose }: PDFViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  const renderContent = () => {
    if (iframeError) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-gray-600">Unable to preview PDF in browser</p>
          <div className="flex gap-3">
            <a
              href={pdfUrl}
              download
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <IconDownload className="h-5 w-5" />
              Download PDF
            </a>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <IconExternalLink className="h-5 w-5" />
              Open in New Tab
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full">
        <object
          data={pdfUrl}
          type="application/pdf"
          className="w-full h-full"
        >
          <iframe
            src={`${pdfUrl}#view=FitH`}
            className="w-full h-full"
            title={title}
          />
        </object>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-lg shadow-xl ${isFullscreen ? 'w-full h-full' : 'w-full max-w-6xl h-[80vh]'} flex flex-col`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold truncate">{title}</h2>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
              title="Toggle fullscreen"
            >
              <IconMaximize className="h-5 w-5" />
            </button>
            <a
              href={pdfUrl}
              download
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
              title="Download"
            >
              <IconDownload className="h-5 w-5" />
            </a>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
              title="Open in new tab"
            >
              <IconExternalLink className="h-5 w-5" />
            </a>
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
      </div>
    </div>
  );
}
