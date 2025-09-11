'use client';

import { useState } from 'react';

interface Assignment {
  id: string;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  venue: string;
  level: string;
  position: string;
  partners: string[];
  status: 'upcoming' | 'completed' | 'cancelled';
  fee?: number;
}

const mockAssignments: Assignment[] = [
  {
    id: '1',
    date: '2024-12-10',
    time: '7:00 PM',
    homeTeam: 'Churchill Bulldogs',
    awayTeam: 'Centennial Coyotes',
    venue: 'Churchill High School',
    level: 'Senior High',
    position: 'Lead',
    partners: ['Mike Wilson', 'Sarah Johnson'],
    status: 'upcoming',
    fee: 75
  },
  {
    id: '2',
    date: '2024-12-12',
    time: '6:00 PM',
    homeTeam: 'St. Mary\'s Saints',
    awayTeam: 'Bishop Carroll Cardinals',
    venue: 'St. Mary\'s High School',
    level: 'Junior High',
    position: 'Trail',
    partners: ['John Smith'],
    status: 'upcoming',
    fee: 60
  },
  {
    id: '3',
    date: '2024-12-05',
    time: '7:30 PM',
    homeTeam: 'Western Warriors',
    awayTeam: 'Forest Lawn Lions',
    venue: 'Western Canada High School',
    level: 'Senior High',
    position: 'Center',
    partners: ['Emily Chen', 'David Brown'],
    status: 'completed',
    fee: 75
  },
  {
    id: '4',
    date: '2024-12-08',
    time: '4:00 PM',
    homeTeam: 'Bowness Trojans',
    awayTeam: 'Ernest Manning Griffins',
    venue: 'Bowness High School',
    level: 'Junior High',
    position: 'Lead',
    partners: ['Alex Thompson'],
    status: 'cancelled'
  }
];

export default function AssignmentsPage() {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [selectedMonth, setSelectedMonth] = useState('2024-12');

  const filteredAssignments = mockAssignments.filter(assignment => {
    const matchesFilter = filter === 'all' || assignment.status === filter;
    const matchesMonth = assignment.date.startsWith(selectedMonth);
    return matchesFilter && matchesMonth;
  });

  const totalEarnings = mockAssignments
    .filter(a => a.status === 'completed' && a.fee)
    .reduce((sum, a) => sum + (a.fee || 0), 0);

  const upcomingCount = mockAssignments.filter(a => a.status === 'upcoming').length;

  return (
    <div className="px-4 py-5 sm:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
        <p className="mt-2 text-gray-600">View and manage your game assignments</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Upcoming Games</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{upcomingCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Completed This Month</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {mockAssignments.filter(a => a.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-500">Earnings This Month</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">${totalEarnings}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="2024-12">December 2024</option>
          <option value="2024-11">November 2024</option>
          <option value="2024-10">October 2024</option>
        </select>
        
        <div className="flex gap-2">
          {(['all', 'upcoming', 'completed', 'cancelled'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-2 rounded-md capitalize ${
                filter === status 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredAssignments.map(assignment => (
            <li key={assignment.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-orange-600 truncate">
                        {assignment.homeTeam} vs {assignment.awayTeam}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          assignment.status === 'upcoming' ? 'bg-green-100 text-green-800' :
                          assignment.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {assignment.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(assignment.date).toLocaleDateString()} at {assignment.time}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {assignment.venue}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          <span className="font-medium">Position:</span> {assignment.position} | 
                          <span className="font-medium ml-2">Level:</span> {assignment.level}
                          {assignment.fee && (
                            <span className="ml-2">| <span className="font-medium">Fee:</span> ${assignment.fee}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    {assignment.partners.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          <span className="font-medium">Partners:</span> {assignment.partners.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {filteredAssignments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No assignments found for the selected criteria.</p>
        </div>
      )}

      {/* Availability Notice */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Update your availability</strong> to receive more assignments. 
          <a href="/portal/profile" className="underline ml-1">Go to Profile Settings</a>
        </p>
      </div>
    </div>
  );
}