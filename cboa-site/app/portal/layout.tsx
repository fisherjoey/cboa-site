import Link from 'next/link';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Portal Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <Link href="/portal" className="flex items-center text-gray-900 hover:text-orange-600 font-medium">
                Portal Home
              </Link>
              <Link href="/portal/resources" className="flex items-center text-gray-900 hover:text-orange-600">
                Resources
              </Link>
              <Link href="/portal/news" className="flex items-center text-gray-900 hover:text-orange-600">
                News & Announcements
              </Link>
              <Link href="/portal/the-bounce" className="flex items-center text-gray-900 hover:text-orange-600">
                The Bounce
              </Link>
            </div>
            
            <div className="flex items-center">
              <Link href="/" className="text-sm text-gray-600 hover:text-orange-600">
                ← Back to Main Site
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Portal Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}