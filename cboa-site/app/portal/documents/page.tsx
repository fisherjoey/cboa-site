'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import RoleGate from '@/components/auth/RoleGate';

interface Document {
  id: string;
  title: string;
  category: 'rulebook' | 'policy' | 'form' | 'meeting' | 'training';
  description?: string;
  fileUrl: string;
  fileSize?: string;
  lastUpdated: string;
  accessLevel: 'official' | 'executive' | 'admin';
  version?: string;
}

const mockDocuments: Document[] = [
  // Rulebooks
  {
    id: '1',
    title: 'FIBA Official Basketball Rules 2024',
    category: 'rulebook',
    description: 'Complete FIBA rulebook for the 2024 season',
    fileUrl: '/documents/fiba-rules-2024.pdf',
    fileSize: '4.2 MB',
    lastUpdated: '2024-09-01',
    accessLevel: 'official',
    version: '2024.1'
  },
  {
    id: '2',
    title: 'CBOA Local Rules & Modifications',
    category: 'rulebook',
    description: 'Calgary-specific rule modifications and clarifications',
    fileUrl: '/documents/cboa-local-rules.pdf',
    fileSize: '1.1 MB',
    lastUpdated: '2024-10-15',
    accessLevel: 'official',
    version: '2024-25'
  },
  
  // Policies
  {
    id: '3',
    title: 'CBOA Code of Conduct',
    category: 'policy',
    description: 'Professional standards and ethics for officials',
    fileUrl: '/documents/code-of-conduct.pdf',
    fileSize: '245 KB',
    lastUpdated: '2024-08-01',
    accessLevel: 'official'
  },
  {
    id: '4',
    title: 'Assignment & Payment Policy',
    category: 'policy',
    description: 'Guidelines for game assignments and compensation',
    fileUrl: '/documents/assignment-policy.pdf',
    fileSize: '312 KB',
    lastUpdated: '2024-09-15',
    accessLevel: 'official'
  },
  
  // Forms
  {
    id: '5',
    title: 'Expense Reimbursement Form',
    category: 'form',
    description: 'Submit travel and equipment expenses',
    fileUrl: '/documents/expense-form.pdf',
    fileSize: '125 KB',
    lastUpdated: '2024-01-01',
    accessLevel: 'official'
  },
  {
    id: '6',
    title: 'Availability Update Form',
    category: 'form',
    description: 'Update your game availability',
    fileUrl: '/documents/availability-form.pdf',
    fileSize: '98 KB',
    lastUpdated: '2024-01-01',
    accessLevel: 'official'
  },
  
  // Meeting Minutes (Executive only)
  {
    id: '7',
    title: 'Board Meeting Minutes - November 2024',
    category: 'meeting',
    description: 'Monthly board meeting minutes',
    fileUrl: '/documents/minutes-2024-11.pdf',
    fileSize: '156 KB',
    lastUpdated: '2024-11-15',
    accessLevel: 'executive'
  },
  {
    id: '8',
    title: 'AGM Minutes - September 2024',
    category: 'meeting',
    description: 'Annual General Meeting minutes and resolutions',
    fileUrl: '/documents/agm-2024.pdf',
    fileSize: '203 KB',
    lastUpdated: '2024-09-30',
    accessLevel: 'executive'
  },
  
  // Training Materials
  {
    id: '9',
    title: 'Three-Person Mechanics Manual',
    category: 'training',
    description: 'Complete guide to 3-person officiating system',
    fileUrl: '/documents/3-person-mechanics.pdf',
    fileSize: '8.7 MB',
    lastUpdated: '2024-10-01',
    accessLevel: 'official'
  },
  {
    id: '10',
    title: 'New Official Training Guide',
    category: 'training',
    description: 'Comprehensive training manual for new officials',
    fileUrl: '/documents/new-official-guide.pdf',
    fileSize: '5.3 MB',
    lastUpdated: '2024-09-01',
    accessLevel: 'official'
  }
];

const categoryLabels = {
  rulebook: 'Rulebooks',
  policy: 'Policies',
  form: 'Forms',
  meeting: 'Meeting Minutes',
  training: 'Training Materials'
};

const categoryIcons = {
  rulebook: '📚',
  policy: '📋',
  form: '📝',
  meeting: '👥',
  training: '🎓'
};

export default function DocumentsPage() {
  const { user, hasRole } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter documents based on access level
  const accessibleDocuments = mockDocuments.filter(doc => {
    if (doc.accessLevel === 'official') return true;
    if (doc.accessLevel === 'executive') return hasRole('executive');
    if (doc.accessLevel === 'admin') return hasRole('admin');
    return false;
  });

  // Apply category and search filters
  const filteredDocuments = accessibleDocuments.filter(doc => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group documents by category
  const groupedDocuments = filteredDocuments.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <div className="px-4 py-5 sm:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Document Library</h1>
        <p className="mt-2 text-gray-600">Access official documents, forms, and resources</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="all">All Categories</option>
          {Object.entries(categoryLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {Object.entries(categoryLabels).map(([category, label]) => {
          const count = accessibleDocuments.filter(doc => doc.category === category).length;
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`p-4 rounded-lg border transition-colors ${
                selectedCategory === category 
                  ? 'bg-orange-50 border-orange-500 text-orange-700'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">{categoryIcons[category as keyof typeof categoryIcons]}</div>
              <div className="text-sm font-medium">{label}</div>
              <div className="text-xs text-gray-500">{count} {count === 1 ? 'document' : 'documents'}</div>
            </button>
          );
        })}
      </div>

      {/* Documents List */}
      {Object.keys(groupedDocuments).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No documents found matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedDocuments).map(([category, docs]) => (
            <div key={category}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span>{categoryIcons[category as keyof typeof categoryIcons]}</span>
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h2>
              
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {docs.map(doc => (
                    <li key={doc.id}>
                      <div className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-orange-600 truncate">
                                {doc.title}
                              </p>
                              {doc.version && (
                                <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  v{doc.version}
                                </span>
                              )}
                              {doc.accessLevel === 'executive' && (
                                <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                                  Executive
                                </span>
                              )}
                            </div>
                            {doc.description && (
                              <p className="mt-1 text-sm text-gray-600">{doc.description}</p>
                            )}
                            <div className="mt-2 flex items-center text-xs text-gray-500 gap-4">
                              {doc.fileSize && <span>Size: {doc.fileSize}</span>}
                              <span>Updated: {new Date(doc.lastUpdated).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="ml-4 flex items-center gap-2">
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange-600 hover:text-orange-700"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </a>
                            <a
                              href={doc.fileUrl}
                              download
                              className="text-gray-600 hover:text-gray-700"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Need a document that's not listed?</strong> Contact the CBOA office at{' '}
          <a href="mailto:info@cboa.ca" className="underline">info@cboa.ca</a> or speak with your assignor.
        </p>
      </div>
    </div>
  );
}