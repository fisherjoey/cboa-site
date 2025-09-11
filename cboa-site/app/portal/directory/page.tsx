'use client';

import { useState } from 'react';

interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  certificationLevel: string;
  position?: string;
  joinedYear: number;
}

const mockMembers: Member[] = [
  { id: '1', name: 'John Smith', email: 'john@example.com', phone: '403-555-0101', certificationLevel: 'Level 3', position: 'Lead', joinedYear: 2018 },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '403-555-0102', certificationLevel: 'Level 4', position: 'Center', joinedYear: 2015 },
  { id: '3', name: 'Mike Wilson', email: 'mike@example.com', certificationLevel: 'Level 2', joinedYear: 2022 },
  { id: '4', name: 'Emily Chen', email: 'emily@example.com', phone: '403-555-0104', certificationLevel: 'Level 5', position: 'Trail', joinedYear: 2012 },
  { id: '5', name: 'David Brown', email: 'david@example.com', certificationLevel: 'Level 1', joinedYear: 2024 },
];

export default function DirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');

  const filteredMembers = mockMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || member.certificationLevel === filterLevel;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="px-4 py-5 sm:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Member Directory</h1>
        <p className="mt-2 text-gray-600">Connect with fellow CBOA officials</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="all">All Levels</option>
          <option value="Level 1">Level 1</option>
          <option value="Level 2">Level 2</option>
          <option value="Level 3">Level 3</option>
          <option value="Level 4">Level 4</option>
          <option value="Level 5">Level 5</option>
        </select>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map(member => (
          <div key={member.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.certificationLevel}</p>
              </div>
            </div>
            <div className="mt-4 space-y-1">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {member.email}
              </p>
              {member.phone && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Phone:</span> {member.phone}
                </p>
              )}
              <p className="text-sm text-gray-600">
                <span className="font-medium">Member since:</span> {member.joinedYear}
              </p>
              {member.position && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Preferred:</span> {member.position}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No members found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}