'use client';

import { useState } from 'react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'announcement' | 'news' | 'event' | 'update';
  priority: 'high' | 'normal' | 'low';
  date: string;
  author: string;
}

const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Important: 2024-25 Season Rule Changes',
    content: 'The FIBA rules committee has approved several significant changes for the upcoming season. All officials must review these changes before their first assignment. A mandatory online training session will be held on December 15th.',
    category: 'announcement',
    priority: 'high',
    date: '2024-12-01',
    author: 'CBOA Executive'
  },
  {
    id: '2',
    title: 'Holiday Schedule - Office Closure',
    content: 'The CBOA office will be closed from December 23rd through January 2nd for the holiday season. Emergency contacts will be available for urgent matters.',
    category: 'announcement',
    priority: 'normal',
    date: '2024-11-28',
    author: 'Admin'
  },
  {
    id: '3',
    title: 'Level 3 Certification Clinic - Registration Open',
    content: 'Registration is now open for the Level 3 certification clinic scheduled for January 15th, 2025. Space is limited to 20 participants. Register through your member portal by December 31st.',
    category: 'event',
    priority: 'normal',
    date: '2024-11-25',
    author: 'Training Committee'
  },
  {
    id: '4',
    title: 'New Officials Welcome!',
    content: 'We are pleased to welcome 12 new officials who completed their Level 1 certification this month. Please help them feel welcome at games and offer mentorship when possible.',
    category: 'news',
    priority: 'normal',
    date: '2024-11-20',
    author: 'CBOA Executive'
  },
  {
    id: '5',
    title: 'Assignment System Update',
    content: 'The online assignment system will undergo maintenance on December 10th from 2-4 AM. The system will be unavailable during this time.',
    category: 'update',
    priority: 'low',
    date: '2024-11-15',
    author: 'IT Admin'
  }
];

export default function NewsAnnouncementsPage() {
  const [filter, setFilter] = useState<'all' | 'announcement' | 'news' | 'event' | 'update'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAnnouncements = mockAnnouncements.filter(item => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'announcement': return 'bg-red-100 text-red-800';
      case 'news': return 'bg-blue-100 text-blue-800';
      case 'event': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴 High Priority';
      case 'normal': return '🟡 Normal';
      case 'low': return '🟢 Low';
      default: return '';
    }
  };

  return (
    <div className="px-4 py-5 sm:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">News & Announcements</h1>
        <p className="mt-2 text-gray-600">Stay informed with the latest CBOA updates</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          
          <div className="flex gap-2">
            {(['all', 'announcement', 'news', 'event', 'update'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-2 rounded-md capitalize text-sm ${
                  filter === cat 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Important Announcements Banner */}
      {filteredAnnouncements.some(a => a.priority === 'high') && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Important Updates</h3>
              <p className="mt-1 text-sm text-red-700">
                There are high-priority announcements that require your attention.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map(announcement => (
          <div key={announcement.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(announcement.category)}`}>
                      {announcement.category}
                    </span>
                    {announcement.priority === 'high' && (
                      <span className="text-xs font-medium text-red-600">
                        {getPriorityBadge(announcement.priority)}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {announcement.title}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {announcement.content}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{new Date(announcement.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                    <span className="mx-2">•</span>
                    <span>Posted by {announcement.author}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAnnouncements.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500">No announcements found matching your criteria.</p>
        </div>
      )}

      {/* Subscription Notice */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Stay Updated</h3>
        <p className="text-sm text-blue-700">
          Important announcements are also sent via email. Make sure your contact information is up to date.
        </p>
      </div>
    </div>
  );
}