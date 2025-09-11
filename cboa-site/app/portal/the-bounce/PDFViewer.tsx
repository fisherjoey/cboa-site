'use client';

import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker - use local proxy to avoid CORS issues
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
  onClose: () => void;
}

export default function PDFViewer({ pdfUrl, title, onClose }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }

  function onDocumentLoadError(error: Error) {
    console.error('PDF Load Error:', error);
    setError('Failed to load PDF. Please try downloading instead.');
    setLoading(false);
  }

  const scrollToPage = (pageNum: number) => {
    const pageElement = document.getElementById(`pdf-page-${pageNum}`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setPageNumber(pageNum);
    }
  };

  const changePage = (offset: number) => {
    const newPageNumber = pageNumber + offset;
    if (newPageNumber >= 1 && newPageNumber <= (numPages || 1)) {
      scrollToPage(newPageNumber);
    }
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (viewerRef.current?.requestFullscreen) {
        viewerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle ESC key in fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isFullscreen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isFullscreen, onClose]);

  // Update page number on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!numPages) return;
      
      for (let i = 1; i <= numPages; i++) {
        const element = document.getElementById(`pdf-page-${i}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
            setPageNumber(i);
            break;
          }
        }
      }
    };

    const scrollContainer = document.querySelector('.overflow-auto');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [numPages]);

  return (
    <div ref={viewerRef} className={`fixed inset-0 z-50 overflow-y-auto ${isFullscreen ? 'bg-black' : 'bg-black bg-opacity-50'}`}>
      <div className={`flex items-center justify-center min-h-screen ${isFullscreen ? '' : 'p-4'}`}>
        <div className={`bg-white ${isFullscreen ? 'w-full h-screen' : 'rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh]'} flex flex-col`}>
          {/* Header */}
          <div className="bg-gray-100 px-4 py-3 border-b flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Toolbar */}
          <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={previousPage}
                disabled={pageNumber <= 1}
                className="px-3 py-1 bg-white rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <span className="px-3 text-sm">
                Page {pageNumber} of {numPages || '...'}
              </span>
              <button
                onClick={nextPage}
                disabled={pageNumber >= (numPages || 1)}
                className="px-3 py-1 bg-white rounded border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setScale(prev => Math.max(0.5, prev - 0.25))}
                className="px-3 py-1 bg-white rounded border hover:bg-gray-50"
                title="Zoom Out"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
              </button>
              <span className="text-sm">{Math.round(scale * 100)}%</span>
              <button
                onClick={() => setScale(prev => Math.min(2, prev + 0.25))}
                className="px-3 py-1 bg-white rounded border hover:bg-gray-50"
                title="Zoom In"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </button>
              <button
                onClick={() => setScale(1.0)}
                className="px-3 py-1 bg-white rounded border hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                onClick={toggleFullscreen}
                className="px-3 py-1 bg-white rounded border hover:bg-gray-50"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isFullscreen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 18L18 6L6 6L6 18Z M9 9L15 15M15 9L9 15" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  )}
                </svg>
              </button>
              <a
                href={pdfUrl}
                download
                className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Download
              </a>
            </div>
          </div>

          {/* PDF Display */}
          <div className="flex-1 overflow-auto bg-gray-200 p-4">
            <div className="flex justify-center">
              {loading && (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
              )}
              
              {error && (
                <div className="bg-white rounded-lg p-8 text-center">
                  <svg className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-600 mb-4">{error}</p>
                  <a
                    href={pdfUrl}
                    download
                    className="inline-block bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                  >
                    Download PDF Instead
                  </a>
                </div>
              )}

              {!error && (
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={null}
                  className="flex flex-col items-center gap-4"
                >
                  {Array.from(new Array(numPages), (el, index) => (
                    <div key={`page_${index + 1}`} id={`pdf-page-${index + 1}`}>
                      <Page
                        pageNumber={index + 1}
                        scale={scale}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        className="shadow-lg"
                      />
                    </div>
                  ))}
                </Document>
              )}
            </div>
          </div>

          {/* Page Navigation Thumbnails (optional, for multi-page docs) */}
          {numPages && numPages > 1 && (
            <div className="bg-gray-100 px-4 py-2 border-t">
              <div className="flex gap-2 overflow-x-auto">
                {Array.from(new Array(Math.min(numPages, 10)), (el, index) => (
                  <button
                    key={`page_${index + 1}`}
                    onClick={() => scrollToPage(index + 1)}
                    className={`px-3 py-1 rounded text-sm ${
                      pageNumber === index + 1
                        ? 'bg-orange-500 text-white'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                {numPages > 10 && (
                  <span className="px-3 py-1 text-sm text-gray-500">...</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}