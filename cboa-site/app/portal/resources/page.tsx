'use client';

export default function PortalResourcesPage() {
  const resources = [
    {
      category: 'Rulebooks & Guides',
      items: [
        { title: 'FIBA Official Rules 2024', url: '#', type: 'PDF', size: '4.2 MB' },
        { title: 'Three-Person Mechanics', url: '#', type: 'PDF', size: '8.7 MB' },
        { title: 'Two-Person Mechanics', url: '#', type: 'PDF', size: '6.3 MB' },
        { title: 'Signal Reference Guide', url: '#', type: 'PDF', size: '2.1 MB' },
      ]
    },
    {
      category: 'Videos & Tutorials',
      items: [
        { title: 'Block/Charge Decisions', url: '#', type: 'Video', duration: '25 min' },
        { title: 'Managing Game Flow', url: '#', type: 'Video', duration: '18 min' },
        { title: 'Pre-Game Conference', url: '#', type: 'Video', duration: '12 min' },
        { title: 'Post-Game Procedures', url: '#', type: 'Video', duration: '10 min' },
      ]
    },
    {
      category: 'Forms & Templates',
      items: [
        { title: 'Game Report Template', url: '#', type: 'DOC', size: '125 KB' },
        { title: 'Incident Report Form', url: '#', type: 'PDF', size: '98 KB' },
        { title: 'Expense Claim Form', url: '#', type: 'PDF', size: '156 KB' },
        { title: 'Availability Sheet', url: '#', type: 'XLS', size: '45 KB' },
      ]
    },
    {
      category: 'External Resources',
      items: [
        { title: 'FIBA Academy', url: 'https://academy.fiba.basketball', type: 'Link', external: true },
        { title: 'Basketball Canada', url: 'https://basketball.ca', type: 'Link', external: true },
        { title: 'CABO Website', url: 'https://cabo.ca', type: 'Link', external: true },
        { title: 'RefTown Portal', url: 'https://reftown.com', type: 'Link', external: true },
      ]
    }
  ];

  return (
    <div className="px-4 py-5 sm:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Official Resources</h1>
        <p className="mt-2 text-gray-600">Essential materials and references for officials</p>
      </div>

      <div className="space-y-8">
        {resources.map(section => (
          <div key={section.category}>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{section.category}</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {section.items.map((item, idx) => (
                  <li key={idx}>
                    <a
                      href={item.url}
                      target={item.external ? '_blank' : undefined}
                      rel={item.external ? 'noopener noreferrer' : undefined}
                      className="block hover:bg-gray-50 px-4 py-4 sm:px-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            {item.type === 'PDF' && '📄'}
                            {item.type === 'Video' && '🎥'}
                            {item.type === 'DOC' && '📝'}
                            {item.type === 'XLS' && '📊'}
                            {item.type === 'Link' && '🔗'}
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-orange-600">
                              {item.title}
                              {item.external && (
                                <svg className="inline-block ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              )}
                            </p>
                            <p className="text-sm text-gray-500">
                              {item.size && `Size: ${item.size}`}
                              {item.duration && `Duration: ${item.duration}`}
                              {item.external && 'External website'}
                            </p>
                          </div>
                        </div>
                        <div>
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Help Section */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Need Help?</h3>
        <p className="text-sm text-blue-700">
          If you're looking for a specific resource that's not listed here, contact the CBOA office at{' '}
          <a href="mailto:info@cboa.ca" className="underline">info@cboa.ca</a> or check the{' '}
          <a href="/portal/documents" className="underline">Documents Library</a>.
        </p>
      </div>
    </div>
  );
}