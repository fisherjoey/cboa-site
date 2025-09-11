'use client';

import { useState } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'public' | 'official' | 'executive' | 'admin';
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: string;
  joinedDate: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    role: 'official',
    status: 'active',
    lastLogin: '2024-12-01 10:30 AM',
    joinedDate: '2023-09-15'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    role: 'executive',
    status: 'active',
    lastLogin: '2024-12-02 2:15 PM',
    joinedDate: '2022-01-10'
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike.w@example.com',
    role: 'official',
    status: 'pending',
    joinedDate: '2024-11-28'
  },
  {
    id: '4',
    name: 'Emily Chen',
    email: 'emily.chen@example.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2024-12-02 4:45 PM',
    joinedDate: '2021-05-20'
  },
  {
    id: '5',
    name: 'David Brown',
    email: 'david.b@example.com',
    role: 'official',
    status: 'inactive',
    lastLogin: '2024-10-15 9:00 AM',
    joinedDate: '2023-03-12'
  }
];

export default function AdminDashboard() {
  const [users] = useState<User[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const systemStats = {
    totalUsers: 127,
    activeUsers: 98,
    pendingApprovals: 5,
    systemHealth: 'Good',
    lastBackup: '2024-12-01 03:00 AM',
    storageUsed: '2.3 GB / 10 GB',
    apiCalls: '12,456 this month',
    errorRate: '0.02%'
  };

  const recentAuditLogs = [
    { id: 1, action: 'User role changed', user: 'Admin', target: 'John Smith (official → executive)', time: '1 hour ago' },
    { id: 2, action: 'Content updated', user: 'Emily Chen', target: 'News post: "Season Update"', time: '3 hours ago' },
    { id: 3, action: 'User approved', user: 'Admin', target: 'New member: Mike Wilson', time: '1 day ago' },
    { id: 4, action: 'Settings changed', user: 'Emily Chen', target: 'Email notifications enabled', time: '2 days ago' },
    { id: 5, action: 'Document uploaded', user: 'Sarah Johnson', target: 'Meeting Minutes Nov 2024', time: '3 days ago' },
  ];

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    console.log(`Changing role for user ${userId} to ${newRole}`);
    // TODO: Implement role change
    alert(`Role updated to ${newRole}`);
  };

  const handleStatusChange = (userId: string, newStatus: string) => {
    console.log(`Changing status for user ${userId} to ${newStatus}`);
    // TODO: Implement status change
    alert(`Status updated to ${newStatus}`);
  };

  return (
    <div className="px-4 py-5 sm:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
        <p className="mt-2 text-gray-600">Manage users, monitor system health, and configure settings</p>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">System Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">System Health</p>
              <p className="mt-1 text-xl font-semibold text-green-600">✓ {systemStats.systemHealth}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Backup</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{systemStats.lastBackup}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Storage Used</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{systemStats.storageUsed}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Error Rate</p>
              <p className="mt-1 text-sm font-medium text-gray-900">{systemStats.errorRate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{systemStats.totalUsers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{systemStats.activeUsers}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Approvals</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{systemStats.pendingApprovals}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">User Management</h2>
            <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors text-sm">
              Add User
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'executive' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'official' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' :
                        user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin || 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleUserClick(user)}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            <Link href="/portal/admin/audit" className="text-sm text-orange-600 hover:text-orange-700">
              View all logs →
            </Link>
          </div>
          
          <div className="space-y-3">
            {recentAuditLogs.map(log => (
              <div key={log.id} className="flex items-start space-x-3 py-2 border-b last:border-0">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{log.action}</p>
                  <p className="text-sm text-gray-500">{log.target}</p>
                  <p className="text-xs text-gray-400 mt-1">by {log.user} • {log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/portal/admin/users" className="bg-white rounded-lg shadow p-4 text-center hover:shadow-lg transition-shadow">
          <svg className="h-8 w-8 mx-auto mb-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="text-sm font-medium text-gray-900">Manage Users</span>
        </Link>
        
        <Link href="/portal/admin/settings" className="bg-white rounded-lg shadow p-4 text-center hover:shadow-lg transition-shadow">
          <svg className="h-8 w-8 mx-auto mb-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm font-medium text-gray-900">System Settings</span>
        </Link>
        
        <Link href="/portal/admin/backup" className="bg-white rounded-lg shadow p-4 text-center hover:shadow-lg transition-shadow">
          <svg className="h-8 w-8 mx-auto mb-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="text-sm font-medium text-gray-900">Backup & Restore</span>
        </Link>
        
        <Link href="/admin" className="bg-white rounded-lg shadow p-4 text-center hover:shadow-lg transition-shadow">
          <svg className="h-8 w-8 mx-auto mb-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span className="text-sm font-medium text-gray-900">CMS Admin</span>
        </Link>
      </div>

      {/* User Edit Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowUserModal(false)}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      value={selectedUser.name}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={selectedUser.email}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      value={selectedUser.role}
                      onChange={(e) => handleRoleChange(selectedUser.id, e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                    >
                      <option value="public">Public</option>
                      <option value="official">Official</option>
                      <option value="executive">Executive</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={selectedUser.status}
                      onChange={(e) => handleStatusChange(selectedUser.id, e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}