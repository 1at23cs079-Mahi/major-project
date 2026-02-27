'use client';

import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserPlusIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
  PhoneIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const users = [
    {
      id: 1,
      name: 'Dr. John Smith',
      email: 'dr.smith@healthcare.com',
      phone: '+1 (555) 123-4567',
      role: 'doctor',
      department: 'Cardiology',
      status: 'active',
      lastLogin: '2024-01-15 09:30 AM',
      createdAt: '2023-06-15',
      avatar: 'JS'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 234-5678',
      role: 'patient',
      department: null,
      status: 'active',
      lastLogin: '2024-01-15 10:15 AM',
      createdAt: '2023-08-20',
      avatar: 'SJ'
    },
    {
      id: 3,
      name: 'Admin User',
      email: 'admin@healthcare.com',
      phone: '+1 (555) 345-6789',
      role: 'admin',
      department: 'IT',
      status: 'active',
      lastLogin: '2024-01-15 08:00 AM',
      createdAt: '2023-01-01',
      avatar: 'AU'
    },
    {
      id: 4,
      name: 'Dr. Emily Chen',
      email: 'emily.chen@healthcare.com',
      phone: '+1 (555) 456-7890',
      role: 'doctor',
      department: 'Neurology',
      status: 'active',
      lastLogin: '2024-01-14 04:45 PM',
      createdAt: '2023-09-10',
      avatar: 'EC'
    },
    {
      id: 5,
      name: 'Michael Brown',
      email: 'michael.b@email.com',
      phone: '+1 (555) 567-8901',
      role: 'patient',
      department: null,
      status: 'inactive',
      lastLogin: '2024-01-10 11:20 AM',
      createdAt: '2023-11-05',
      avatar: 'MB'
    },
    {
      id: 6,
      name: 'Nurse Lisa Williams',
      email: 'lisa.w@healthcare.com',
      phone: '+1 (555) 678-9012',
      role: 'staff',
      department: 'Emergency',
      status: 'active',
      lastLogin: '2024-01-15 07:00 AM',
      createdAt: '2023-07-22',
      avatar: 'LW'
    },
    {
      id: 7,
      name: 'James Wilson',
      email: 'james.w@email.com',
      phone: '+1 (555) 789-0123',
      role: 'patient',
      department: null,
      status: 'pending',
      lastLogin: null,
      createdAt: '2024-01-14',
      avatar: 'JW'
    }
  ];

  const roleConfig = {
    admin: { color: 'purple', label: 'Admin', icon: ShieldCheckIcon },
    doctor: { color: 'cyan', label: 'Doctor', icon: UserGroupIcon },
    patient: { color: 'green', label: 'Patient', icon: UserGroupIcon },
    staff: { color: 'orange', label: 'Staff', icon: UserGroupIcon }
  };

  const statusConfig = {
    active: { color: 'green', label: 'Active' },
    inactive: { color: 'slate', label: 'Inactive' },
    pending: { color: 'yellow', label: 'Pending' }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const stats = [
    { label: 'Total Users', value: users.length, color: 'cyan' },
    { label: 'Doctors', value: users.filter(u => u.role === 'doctor').length, color: 'blue' },
    { label: 'Patients', value: users.filter(u => u.role === 'patient').length, color: 'green' },
    { label: 'Staff', value: users.filter(u => u.role === 'staff').length, color: 'orange' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Directory</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage system users and permissions</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            <UserPlusIcon className="w-5 h-5" />
            Add User
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
              <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-slate-500" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>
              <option value="staff">Staff</option>
            </select>
          </div>
        </div>

        {/* User List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Last Login</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredUsers.map((user) => (
                  <tr 
                    key={user.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-${roleConfig[user.role].color}-500 to-${roleConfig[user.role].color}-600 flex items-center justify-center text-white font-medium text-sm`}>
                          {user.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium bg-${roleConfig[user.role].color}-100 dark:bg-${roleConfig[user.role].color}-900/30 text-${roleConfig[user.role].color}-700 dark:text-${roleConfig[user.role].color}-400`}>
                        {roleConfig[user.role].label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-900 dark:text-white">
                        {user.department || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full bg-${statusConfig[user.status].color}-500`}></span>
                        <span className={`text-sm text-${statusConfig[user.status].color}-600 dark:text-${statusConfig[user.status].color}-400`}>
                          {statusConfig[user.status].label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {user.lastLogin || 'Never'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="Edit"
                          onClick={() => setSelectedUser(user)}
                        >
                          <PencilIcon className="w-4 h-4 text-slate-500" />
                        </button>
                        <button 
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <KeyIcon className="w-4 h-4 text-slate-500" />
                        </button>
                        <button 
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <TrashIcon className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UserGroupIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">No users found matching your criteria</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Showing {filteredUsers.length} of {users.length} users
          </p>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg">1</button>
            <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">
              Next
            </button>
          </div>
        </div>

        {/* User Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
            <div 
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-${roleConfig[selectedUser.role].color}-500 to-${roleConfig[selectedUser.role].color}-600 flex items-center justify-center text-white font-bold text-xl`}>
                  {selectedUser.avatar}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedUser.name}</h2>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium bg-${roleConfig[selectedUser.role].color}-100 dark:bg-${roleConfig[selectedUser.role].color}-900/30 text-${roleConfig[selectedUser.role].color}-700 dark:text-${roleConfig[selectedUser.role].color}-400`}>
                    {roleConfig[selectedUser.role].label}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <EnvelopeIcon className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-slate-900 dark:text-white">{selectedUser.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <PhoneIcon className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="text-slate-900 dark:text-white">{selectedUser.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <ClockIcon className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Member Since</p>
                    <p className="text-slate-900 dark:text-white">{selectedUser.createdAt}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button className="flex-1 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium">
                  Edit User
                </button>
                <button className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium">
                  View Activity
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
            <div 
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Add New User</h2>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                  <select className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500">
                    <option value="">Select role</option>
                    <option value="admin">Admin</option>
                    <option value="doctor">Doctor</option>
                    <option value="patient">Patient</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter department (optional)"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
                  >
                    Add User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
