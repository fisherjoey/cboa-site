'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function ExecutiveDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Mock data - would come from API
  const stats = {
    totalMembers: 127,
    activeOfficials: 98,
    newThisMonth: 5,
    upcomingGames: 234,
    completedGames: 1456,
    revenue: 45230,
    expenses: 38500,
  };

  const recentActivity = [
    { id: 1, type: 'member', action: 'New member joined', name: 'John Smith', time: '2 hours ago' },
    { id: 2, type: 'training', action: 'Training completed', name: 'Sarah Johnson - Level 3 Certification', time: '5 hours ago' },
    { id: 3, type: 'document', action: 'Document updated', name: 'Assignment Policy v2.1', time: '1 day ago' },
    { id: 4, type: 'meeting', action: 'Meeting scheduled', name: 'Board Meeting - December 15', time: '2 days ago' },
  ];

  const upcomingMeetings = [
    { id: 1, title: 'Executive Committee', date: '2024-12-10', time: '7:00 PM', location: 'Virtual' },
    { id: 2, title: 'Finance Review', date: '2024-12-12', time: '6:00 PM', location: 'CBOA Office' },
    { id: 3, title: 'Board Meeting', date: '2024-12-15', time: '7:00 PM', location: 'Virtual' },
  ];

  return (
    <div className="px-4 py-5 sm:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
        <p className="mt-2 text-gray-600">Overview of CBOA operations and member statistics</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Members</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">{stats.totalMembers}</div>
                  <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="sr-only">Increased by</span>
                    {stats.newThisMonth}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Active Officials</dt>
                <dd className="text-2xl font-semibold text-gray-900">{stats.activeOfficials}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-orange-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Games This Season</dt>
                <dd className="text-2xl font-semibold text-gray-900">{stats.completedGames}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Net Revenue</dt>
                <dd className="text-2xl font-semibold text-gray-900">
                  ${((stats.revenue - stats.expenses) / 1000).toFixed(1)}k
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Member Growth Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Member Growth</h2>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="text-sm rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          {/* Placeholder for chart */}
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-500">
            [Member Growth Chart]
          </div>
        </div>

        {/* Game Assignment Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Game Assignments by Level</h2>
          {/* Placeholder for chart */}
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center text-gray-500">
            [Assignment Distribution Chart]
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity.map((activity, idx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {idx !== recentActivity.length - 1 && (
                        <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            activity.type === 'member' ? 'bg-blue-500' :
                            activity.type === 'training' ? 'bg-green-500' :
                            activity.type === 'document' ? 'bg-yellow-500' :
                            'bg-purple-500'
                          }`}>
                            {activity.type === 'member' && '👤'}
                            {activity.type === 'training' && '🎓'}
                            {activity.type === 'document' && '📄'}
                            {activity.type === 'meeting' && '📅'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-500">{activity.name}</p>
                          <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Upcoming Meetings</h2>
              <Link href="/portal/executive/meetings" className="text-sm text-orange-600 hover:text-orange-700">
                View all →
              </Link>
            </div>
            <div className="space-y-3">
              {upcomingMeetings.map(meeting => (
                <div key={meeting.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{meeting.title}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
                      </p>
                      <p className="text-sm text-gray-500">{meeting.location}</p>
                    </div>
                    <button className="text-sm text-orange-600 hover:text-orange-700">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/portal/executive/announcements" className="text-center p-4 border rounded-lg hover:bg-gray-50">
              <svg className="h-8 w-8 mx-auto mb-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Post Announcement</span>
            </Link>
            
            <Link href="/portal/executive/members" className="text-center p-4 border rounded-lg hover:bg-gray-50">
              <svg className="h-8 w-8 mx-auto mb-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">View Members</span>
            </Link>
            
            <Link href="/portal/executive/finance" className="text-center p-4 border rounded-lg hover:bg-gray-50">
              <svg className="h-8 w-8 mx-auto mb-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Financial Reports</span>
            </Link>
            
            <Link href="/admin" className="text-center p-4 border rounded-lg hover:bg-gray-50">
              <svg className="h-8 w-8 mx-auto mb-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-sm font-medium text-gray-900">Edit Content</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}