'use client';

import { useState } from 'react';
import Link from 'next/link';

interface TrainingResource {
  id: string;
  title: string;
  type: 'video' | 'document' | 'quiz' | 'webinar';
  description: string;
  duration?: string;
  instructor?: string;
  date?: string;
  url?: string;
  completed?: boolean;
  progress?: number;
}

const trainingResources: TrainingResource[] = [
  // Videos
  {
    id: '1',
    title: 'Three-Person Mechanics Fundamentals',
    type: 'video',
    description: 'Complete overview of 3-person positioning and rotations',
    duration: '45 min',
    instructor: 'John Smith',
    url: '/training/videos/3-person-mechanics',
    completed: true,
    progress: 100
  },
  {
    id: '2',
    title: 'Managing Difficult Coaches',
    type: 'video',
    description: 'Techniques for handling confrontational situations',
    duration: '30 min',
    instructor: 'Sarah Johnson',
    url: '/training/videos/coach-management',
    completed: false,
    progress: 65
  },
  {
    id: '3',
    title: 'Block/Charge Decisions',
    type: 'video',
    description: 'Breaking down one of basketball\'s toughest calls',
    duration: '25 min',
    instructor: 'Mike Wilson',
    url: '/training/videos/block-charge',
    completed: false,
    progress: 0
  },
  
  // Documents
  {
    id: '4',
    title: 'FIBA Rules Changes 2024-25',
    type: 'document',
    description: 'Summary of all rule changes for the new season',
    url: '/training/docs/rule-changes-2024',
    completed: true
  },
  {
    id: '5',
    title: 'Pre-Game Conference Guide',
    type: 'document',
    description: 'Checklist and topics for effective pre-game meetings',
    url: '/training/docs/pregame-guide',
    completed: false
  },
  
  // Quizzes
  {
    id: '6',
    title: 'Rules Knowledge Test - Level 2',
    type: 'quiz',
    description: '50 questions covering intermediate rule knowledge',
    duration: '60 min',
    completed: true,
    progress: 100
  },
  {
    id: '7',
    title: 'Video Play Analysis Quiz',
    type: 'quiz',
    description: 'Analyze 10 game situations and make the correct call',
    duration: '30 min',
    completed: false,
    progress: 0
  },
  
  // Webinars
  {
    id: '8',
    title: 'Season Kickoff Meeting',
    type: 'webinar',
    description: 'Important updates and Q&A for the upcoming season',
    date: '2024-09-15 7:00 PM',
    instructor: 'CBOA Executive',
    completed: true
  },
  {
    id: '9',
    title: 'Advanced Mechanics Workshop',
    type: 'webinar',
    description: 'Deep dive into complex game situations',
    date: '2024-12-10 7:00 PM',
    instructor: 'Guest: NBA Referee',
    completed: false
  }
];

const upcomingSessions = [
  {
    id: '1',
    title: 'Level 3 Certification Clinic',
    date: '2024-12-15',
    time: '9:00 AM - 4:00 PM',
    location: 'University of Calgary',
    spots: 5,
    registered: false
  },
  {
    id: '2',
    title: 'New Official Orientation',
    date: '2025-01-08',
    time: '6:00 PM - 9:00 PM',
    location: 'CBOA Office',
    spots: 12,
    registered: false
  },
  {
    id: '3',
    title: 'Mid-Season Rules Review',
    date: '2025-01-20',
    time: '7:00 PM - 8:30 PM',
    location: 'Virtual (Zoom)',
    spots: 'Unlimited',
    registered: true
  }
];

export default function TrainingPage() {
  const [filter, setFilter] = useState<'all' | 'video' | 'document' | 'quiz' | 'webinar'>('all');
  const [showCompleted, setShowCompleted] = useState(true);

  const filteredResources = trainingResources.filter(resource => {
    const matchesType = filter === 'all' || resource.type === filter;
    const matchesCompleted = showCompleted || !resource.completed;
    return matchesType && matchesCompleted;
  });

  const typeIcons = {
    video: '🎥',
    document: '📄',
    quiz: '✏️',
    webinar: '🖥️'
  };

  const typeColors = {
    video: 'bg-blue-100 text-blue-800',
    document: 'bg-green-100 text-green-800',
    quiz: 'bg-purple-100 text-purple-800',
    webinar: 'bg-orange-100 text-orange-800'
  };

  // Calculate progress stats
  const totalResources = trainingResources.length;
  const completedResources = trainingResources.filter(r => r.completed).length;
  const completionRate = Math.round((completedResources / totalResources) * 100);

  return (
    <div className="px-4 py-5 sm:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Training Center</h1>
        <p className="mt-2 text-gray-600">Access training materials and track your professional development</p>
      </div>

      {/* Progress Overview */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Your Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Overall Completion</p>
              <div className="mt-2">
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-900">{completionRate}%</span>
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{completedResources}/{totalResources}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Certification Level</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">Level 2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Training Sessions</h2>
            <Link href="/portal/training/schedule" className="text-sm text-orange-600 hover:text-orange-700">
              View Full Schedule →
            </Link>
          </div>
          
          <div className="space-y-3">
            {upcomingSessions.map(session => (
              <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{session.title}</h3>
                    <div className="mt-1 text-sm text-gray-500">
                      <p>{new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p>{session.time} • {session.location}</p>
                      {typeof session.spots === 'number' && (
                        <p className="mt-1 text-orange-600">{session.spots} spots remaining</p>
                      )}
                    </div>
                  </div>
                  <button
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      session.registered
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    {session.registered ? 'Registered ✓' : 'Register'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Training Resources */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Training Resources</h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                  className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="ml-2">Show completed</span>
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="text-sm rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              >
                <option value="all">All Types</option>
                <option value="video">Videos</option>
                <option value="document">Documents</option>
                <option value="quiz">Quizzes</option>
                <option value="webinar">Webinars</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredResources.map(resource => (
              <div key={resource.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{typeIcons[resource.type]}</span>
                      <h3 className="font-medium text-gray-900">{resource.title}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${typeColors[resource.type]}`}>
                        {resource.type}
                      </span>
                      {resource.completed && (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Completed ✓
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{resource.description}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                      {resource.duration && <span>Duration: {resource.duration}</span>}
                      {resource.instructor && <span>Instructor: {resource.instructor}</span>}
                      {resource.date && <span>Date: {resource.date}</span>}
                    </div>
                    {resource.progress !== undefined && resource.progress > 0 && resource.progress < 100 && (
                      <div className="mt-2">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-xs">
                            <div 
                              className="bg-orange-500 h-1.5 rounded-full" 
                              style={{ width: `${resource.progress}%` }}
                            />
                          </div>
                          <span className="ml-2 text-xs text-gray-500">{resource.progress}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <button className="ml-4 text-orange-600 hover:text-orange-700 font-medium text-sm">
                    {resource.completed ? 'Review' : resource.progress ? 'Continue' : 'Start'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Certification Path */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Next Certification Level</h3>
        <p className="text-sm text-blue-700">
          You're currently at Level 2. To advance to Level 3, complete 3 more training modules and attend a Level 3 clinic.
        </p>
        <Link href="/portal/training/certification" className="mt-2 inline-block text-sm font-medium text-blue-900 hover:text-blue-700">
          View certification requirements →
        </Link>
      </div>
    </div>
  );
}