import Link from 'next/link';

export default function PortalDashboard() {
  return (
    <div className="px-4 py-5 sm:p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Member Portal
      </h1>
      <p className="text-gray-600 mb-8">Access exclusive content and resources for CBOA officials</p>

      {/* Main Portal Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Resources */}
        <Link href="/portal/resources" className="block">
          <div className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow h-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">Resources</h2>
              <p className="text-gray-600 text-center text-sm">
                Access rulebooks, training materials, forms, and official documents
              </p>
              <div className="mt-4 text-center">
                <span className="text-blue-600 text-sm font-medium">View Resources →</span>
              </div>
            </div>
          </div>
        </Link>

        {/* News & Announcements */}
        <Link href="/portal/news" className="block">
          <div className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow h-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">News & Announcements</h2>
              <p className="text-gray-600 text-center text-sm">
                Stay updated with the latest CBOA news, events, and important announcements
              </p>
              <div className="mt-4 text-center">
                <span className="text-green-600 text-sm font-medium">Read Updates →</span>
              </div>
            </div>
          </div>
        </Link>

        {/* The Bounce */}
        <Link href="/portal/the-bounce" className="block">
          <div className="bg-white overflow-hidden shadow-lg rounded-lg hover:shadow-xl transition-shadow h-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
                  <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">The Bounce</h2>
              <p className="text-gray-600 text-center text-sm">
                Read our monthly newsletter with in-depth articles and officiating insights
              </p>
              <div className="mt-4 text-center">
                <span className="text-orange-600 text-sm font-medium">View Archive →</span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Links Section */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/portal/resources#rulebooks" className="text-sm text-blue-600 hover:text-blue-800">
            • Rulebooks
          </a>
          <a href="/portal/resources#forms" className="text-sm text-blue-600 hover:text-blue-800">
            • Forms & Documents
          </a>
          <a href="/portal/resources#training" className="text-sm text-blue-600 hover:text-blue-800">
            • Training Materials
          </a>
          <a href="/portal/news#announcements" className="text-sm text-blue-600 hover:text-blue-800">
            • Latest Announcements
          </a>
        </div>
      </div>
    </div>
  );
}