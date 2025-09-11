'use client';

import { useState } from 'react';

interface Newsletter {
  id: string;
  title: string;
  date: string;
  year: number;
  month: string;
  description: string;
  pdfUrl: string;
  coverImage?: string;
  fileSize?: string;
  issueNumber?: number;
  featured?: boolean;
}

// Mock newsletters - replace with actual data from CMS
const mockNewsletters: Newsletter[] = [
  {
    id: '2024-12',
    title: 'December 2024 - Year in Review',
    date: '2024-12-01',
    year: 2024,
    month: 'December',
    description: 'Reflecting on a successful 2024 season, upcoming rule changes, and holiday greetings from the executive team.',
    pdfUrl: '/newsletters/2024/december.pdf',
    fileSize: '2.3 MB',
    issueNumber: 48,
    featured: true
  },
  {
    id: '2024-11',
    title: 'November 2024 - Playoff Preparation',
    date: '2024-11-01',
    year: 2024,
    month: 'November',
    description: 'Getting ready for playoff basketball, managing high-pressure games, and tips from veteran officials.',
    pdfUrl: '/newsletters/2024/november.pdf',
    fileSize: '1.8 MB',
    issueNumber: 47
  },
  {
    id: '2024-10',
    title: 'October 2024 - Season Kickoff',
    date: '2024-10-01',
    year: 2024,
    month: 'October',
    description: 'Welcome to the new season! Meet our new officials, review rule changes, and get your season schedule.',
    pdfUrl: '/newsletters/2024/october.pdf',
    fileSize: '2.1 MB',
    issueNumber: 46
  },
  {
    id: '2024-09',
    title: 'September 2024 - Training Camp',
    date: '2024-09-01',
    year: 2024,
    month: 'September',
    description: 'Pre-season training highlights, certification updates, and preparing for the upcoming season.',
    pdfUrl: '/newsletters/2024/september.pdf',
    fileSize: '1.9 MB',
    issueNumber: 45
  },
  {
    id: '2024-08',
    title: 'August 2024 - Summer Update',
    date: '2024-08-01',
    year: 2024,
    month: 'August',
    description: 'Summer basketball recap, training opportunities, and important dates for the fall.',
    pdfUrl: '/newsletters/2024/august.pdf',
    fileSize: '1.5 MB',
    issueNumber: 44
  },
  {
    id: '2024-07',
    title: 'July 2024 - Mid-Summer Edition',
    date: '2024-07-01',
    year: 2024,
    month: 'July',
    description: 'Summer league updates, professional development opportunities, and member spotlights.',
    pdfUrl: '/newsletters/2024/july.pdf',
    fileSize: '1.7 MB',
    issueNumber: 43
  }
];

export default function TheBounceArchive() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get unique years for filter
  const availableYears = Array.from(new Set(mockNewsletters.map(n => n.year))).sort((a, b) => b - a);

  // Filter newsletters
  const filteredNewsletters = mockNewsletters.filter(newsletter => {
    const matchesSearch = searchTerm === '' || 
      newsletter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      newsletter.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === 'all' || newsletter.year === selectedYear;
    return matchesSearch && matchesYear;
  });

  // Group by year
  const groupedNewsletters = filteredNewsletters.reduce((acc, newsletter) => {
    if (!acc[newsletter.year]) {
      acc[newsletter.year] = [];
    }
    acc[newsletter.year].push(newsletter);
    return acc;
  }, {} as Record<number, Newsletter[]>);

  const handleDownload = (newsletter: Newsletter) => {
    // In production, this would download the actual PDF
    window.open(newsletter.pdfUrl, '_blank');
  };

  const handleView = (newsletter: Newsletter) => {
    setSelectedNewsletter(newsletter);
  };

  return (
    <div className="px-4 py-5 sm:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">The Bounce</h1>
        <p className="mt-2 text-gray-600">
          Your monthly source for CBOA news, officiating tips, and member updates
        </p>
      </div>

      {/* Featured Issue */}
      {mockNewsletters.find(n => n.featured) && (
        <div className="mb-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg text-white">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium opacity-90">Latest Issue</span>
                <h2 className="text-2xl font-bold mt-1">
                  {mockNewsletters.find(n => n.featured)?.title}
                </h2>
                <p className="mt-2 opacity-90">
                  {mockNewsletters.find(n => n.featured)?.description}
                </p>
                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => handleView(mockNewsletters.find(n => n.featured)!)}
                    className="bg-white text-orange-600 px-4 py-2 rounded-md font-medium hover:bg-orange-50 transition-colors"
                  >
                    Read Now
                  </button>
                  <button
                    onClick={() => handleDownload(mockNewsletters.find(n => n.featured)!)}
                    className="border border-white text-white px-4 py-2 rounded-md font-medium hover:bg-white hover:text-orange-600 transition-colors"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
              <div className="hidden md:block">
                <svg className="h-24 w-24 opacity-25" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3h-6.528c-.382 0-.749.152-1.02.422L7.02 7.855A1.44 1.44 0 016 8.277V20a2 2 0 002 2h11a2 2 0 002-2V5a2 2 0 00-2-2zm-7 16l-4-4h3V9h2v6h3l-4 4z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
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
      </div>

      {/* Newsletter Archive */}
      {Object.keys(groupedNewsletters).length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500">No newsletters found matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedNewsletters)
            .sort(([a], [b]) => parseInt(b) - parseInt(a))
            .map(([year, newsletters]) => (
              <div key={year}>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{year}</h2>
                
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {newsletters.map(newsletter => (
                      <div key={newsletter.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">Issue #{newsletter.issueNumber}</span>
                            <span className="text-sm text-gray-500">{newsletter.fileSize}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {newsletter.month} {newsletter.year}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {newsletter.description}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleView(newsletter)}
                              className="flex-1 bg-orange-500 text-white px-3 py-2 rounded-md text-sm hover:bg-orange-600 transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDownload(newsletter)}
                              className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-300 transition-colors"
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                      {newsletters.map(newsletter => (
                        <li key={newsletter.id} className="hover:bg-gray-50">
                          <div className="px-6 py-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <h3 className="text-sm font-medium text-gray-900">
                                    {newsletter.title}
                                  </h3>
                                  <span className="ml-2 text-xs text-gray-500">
                                    Issue #{newsletter.issueNumber}
                                  </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-600">
                                  {newsletter.description}
                                </p>
                              </div>
                              <div className="ml-4 flex items-center gap-2">
                                <button
                                  onClick={() => handleView(newsletter)}
                                  className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                                >
                                  View
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                  onClick={() => handleDownload(newsletter)}
                                  className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                                >
                                  Download
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}

      {/* PDF Viewer Modal */}
      {selectedNewsletter && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setSelectedNewsletter(null)}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedNewsletter.title}
                  </h3>
                  <button
                    onClick={() => setSelectedNewsletter(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* PDF Embed */}
                <div className="bg-gray-100 rounded-lg p-4">
                  <div className="aspect-[8.5/11] bg-white rounded shadow-lg flex items-center justify-center">
                    <div className="text-center">
                      <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-600 mb-4">PDF Preview</p>
                      <p className="text-sm text-gray-500 mb-4">
                        In production, the PDF would be displayed here using a PDF viewer library
                      </p>
                      <button
                        onClick={() => handleDownload(selectedNewsletter)}
                        className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
                      >
                        Download Full PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Newsletter Info */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">About The Bounce</h3>
        <p className="text-sm text-blue-700 mb-3">
          The Bounce is CBOA's monthly newsletter, featuring:
        </p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• In-depth articles on officiating techniques</li>
          <li>• Rule interpretations and clarifications</li>
          <li>• Member spotlights and achievements</li>
          <li>• Training tips from experienced officials</li>
          <li>• Important dates and upcoming events</li>
        </ul>
        <p className="text-sm text-blue-700 mt-3">
          New issues are published on the first Monday of each month.
        </p>
      </div>
    </div>
  );
}