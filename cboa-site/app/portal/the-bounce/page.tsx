'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface Newsletter {
  id: string;
  title: string;
  date: string;
  year: number;
  month: string;
  pdfUrl: string;
  coverImage?: string;
  highlights?: string[];
  fileSize?: string;
  issueNumber?: number;
}

// Mock data for demonstration - replace with actual CMS data
const mockNewsletters: Newsletter[] = [
  {
    id: '2024-12',
    title: 'The Bounce - December 2024',
    date: '2024-12-01',
    year: 2024,
    month: 'December',
    pdfUrl: '/newsletters/2024/december.pdf',
    highlights: ['Year-end review', 'Holiday schedule', 'New rules for 2025'],
    fileSize: '2.3 MB',
    issueNumber: 36,
  },
  {
    id: '2024-11',
    title: 'The Bounce - November 2024',
    date: '2024-11-01',
    year: 2024,
    month: 'November',
    pdfUrl: '/newsletters/2024/november.pdf',
    highlights: ['Playoff assignments', 'Training updates', 'Member spotlight'],
    fileSize: '1.8 MB',
    issueNumber: 35,
  },
  {
    id: '2024-10',
    title: 'The Bounce - October 2024',
    date: '2024-10-01',
    year: 2024,
    month: 'October',
    pdfUrl: '/newsletters/2024/october.pdf',
    highlights: ['Season kickoff', 'New officials welcome', 'Rule changes'],
    fileSize: '2.1 MB',
    issueNumber: 34,
  },
];

export default function TheBounceArchive() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>(mockNewsletters);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

  // Get unique years from newsletters
  const availableYears = Array.from(
    new Set(newsletters.map(n => n.year))
  ).sort((a, b) => b - a);

  // Filter newsletters based on search and year
  const filteredNewsletters = newsletters.filter(newsletter => {
    const matchesSearch = newsletter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      newsletter.highlights?.some(h => h.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesYear = selectedYear === 'all' || newsletter.year === selectedYear;
    return matchesSearch && matchesYear;
  });

  // Group newsletters by year
  const groupedNewsletters = filteredNewsletters.reduce((acc, newsletter) => {
    if (!acc[newsletter.year]) {
      acc[newsletter.year] = [];
    }
    acc[newsletter.year].push(newsletter);
    return acc;
  }, {} as Record<number, Newsletter[]>);

  return (
    <div className="px-4 py-5 sm:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">The Bounce Newsletter Archive</h1>
        <p className="mt-2 text-gray-600">Your monthly source for CBOA news and updates</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search newsletters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="all">All Years</option>
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 rounded-md ${
              viewMode === 'grid' 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-md ${
              viewMode === 'list' 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Newsletter Display */}
      {Object.keys(groupedNewsletters).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No newsletters found matching your criteria.</p>
        </div>
      ) : (
        Object.entries(groupedNewsletters)
          .sort(([a], [b]) => parseInt(b) - parseInt(a))
          .map(([year, yearNewsletters]) => (
            <div key={year} className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{year}</h2>
              
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {yearNewsletters.map(newsletter => (
                    <NewsletterCard
                      key={newsletter.id}
                      newsletter={newsletter}
                      onView={() => setSelectedPdf(newsletter.pdfUrl)}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {yearNewsletters.map(newsletter => (
                      <NewsletterListItem
                        key={newsletter.id}
                        newsletter={newsletter}
                        onView={() => setSelectedPdf(newsletter.pdfUrl)}
                      />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
      )}

      {/* PDF Viewer Modal */}
      {selectedPdf && (
        <PDFViewerModal
          pdfUrl={selectedPdf}
          onClose={() => setSelectedPdf(null)}
        />
      )}
    </div>
  );
}

function NewsletterCard({ newsletter, onView }: { newsletter: Newsletter; onView: () => void }) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium text-gray-900">{newsletter.month} {newsletter.year}</h3>
          {newsletter.issueNumber && (
            <span className="text-sm text-gray-500">Issue #{newsletter.issueNumber}</span>
          )}
        </div>
        
        {newsletter.highlights && newsletter.highlights.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Highlights:</p>
            <ul className="text-sm text-gray-600 space-y-1">
              {newsletter.highlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-orange-500 mr-2">•</span>
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>{new Date(newsletter.date).toLocaleDateString()}</span>
          {newsletter.fileSize && <span>{newsletter.fileSize}</span>}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
          >
            View
          </button>
          <a
            href={newsletter.pdfUrl}
            download
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors text-center"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
}

function NewsletterListItem({ newsletter, onView }: { newsletter: Newsletter; onView: () => void }) {
  return (
    <li>
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-600 truncate">
              {newsletter.title}
            </p>
            {newsletter.highlights && newsletter.highlights.length > 0 && (
              <p className="mt-1 text-sm text-gray-500">
                {newsletter.highlights.join(' • ')}
              </p>
            )}
          </div>
          <div className="ml-4 flex items-center gap-2">
            <button
              onClick={onView}
              className="text-orange-600 hover:text-orange-700"
            >
              View
            </button>
            <a
              href={newsletter.pdfUrl}
              download
              className="text-gray-600 hover:text-gray-700"
            >
              Download
            </a>
          </div>
        </div>
      </div>
    </li>
  );
}

function PDFViewerModal({ pdfUrl, onClose }: { pdfUrl: string; onClose: () => void }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* PDF Toolbar */}
          <div className="bg-gray-100 px-4 py-3 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                disabled={pageNumber <= 1}
                className="px-3 py-1 bg-white rounded border hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3">
                Page {pageNumber} of {numPages}
              </span>
              <button
                onClick={() => setPageNumber(prev => Math.min(numPages || 1, prev + 1))}
                disabled={pageNumber >= (numPages || 1)}
                className="px-3 py-1 bg-white rounded border hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
                className="px-3 py-1 bg-white rounded border hover:bg-gray-50"
              >
                Zoom Out
              </button>
              <button
                onClick={() => setScale(1.0)}
                className="px-3 py-1 bg-white rounded border hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                onClick={() => setScale(prev => Math.min(2, prev + 0.1))}
                className="px-3 py-1 bg-white rounded border hover:bg-gray-50"
              >
                Zoom In
              </button>
              <a
                href={pdfUrl}
                download
                className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Download
              </a>
              <button
                onClick={onClose}
                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>

          {/* PDF Display */}
          <div className="bg-gray-200 p-4 overflow-auto" style={{ maxHeight: '70vh' }}>
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                </div>
              }
              error={
                <div className="text-center p-8">
                  <p className="text-red-600">Failed to load PDF. Please try downloading instead.</p>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="mx-auto"
              />
            </Document>
          </div>
        </div>
      </div>
    </div>
  );
}