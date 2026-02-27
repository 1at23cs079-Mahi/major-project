'use client';

import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  EllipsisVerticalIcon,
  ChevronRightIcon,
  HeartIcon,
  ClockIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

export default function DoctorPatientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);

  const patients = [
    {
      id: 1,
      name: 'Sarah Johnson',
      age: 45,
      gender: 'Female',
      phone: '+1 (555) 123-4567',
      email: 'sarah.j@email.com',
      condition: 'Hypertension',
      lastVisit: '2024-01-15',
      nextAppointment: '2024-02-01',
      status: 'active',
      riskLevel: 'moderate',
      avatar: 'SJ'
    },
    {
      id: 2,
      name: 'Michael Chen',
      age: 62,
      gender: 'Male',
      phone: '+1 (555) 234-5678',
      email: 'michael.c@email.com',
      condition: 'Coronary Artery Disease',
      lastVisit: '2024-01-10',
      nextAppointment: '2024-01-25',
      status: 'critical',
      riskLevel: 'high',
      avatar: 'MC'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      age: 34,
      gender: 'Female',
      phone: '+1 (555) 345-6789',
      email: 'emily.r@email.com',
      condition: 'Arrhythmia',
      lastVisit: '2024-01-08',
      nextAppointment: '2024-02-15',
      status: 'active',
      riskLevel: 'low',
      avatar: 'ER'
    },
    {
      id: 4,
      name: 'James Wilson',
      age: 58,
      gender: 'Male',
      phone: '+1 (555) 456-7890',
      email: 'james.w@email.com',
      condition: 'Heart Failure',
      lastVisit: '2024-01-12',
      nextAppointment: '2024-01-28',
      status: 'monitoring',
      riskLevel: 'high',
      avatar: 'JW'
    },
    {
      id: 5,
      name: 'Lisa Thompson',
      age: 41,
      gender: 'Female',
      phone: '+1 (555) 567-8901',
      email: 'lisa.t@email.com',
      condition: 'Post-Surgery Recovery',
      lastVisit: '2024-01-05',
      nextAppointment: '2024-01-30',
      status: 'recovering',
      riskLevel: 'moderate',
      avatar: 'LT'
    },
    {
      id: 6,
      name: 'Robert Kim',
      age: 55,
      gender: 'Male',
      phone: '+1 (555) 678-9012',
      email: 'robert.k@email.com',
      condition: 'Valve Disease',
      lastVisit: '2024-01-14',
      nextAppointment: '2024-02-10',
      status: 'active',
      riskLevel: 'moderate',
      avatar: 'RK'
    }
  ];

  const statusColors = {
    active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    critical: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    monitoring: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    recovering: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
  };

  const riskColors = {
    low: 'text-green-600 dark:text-green-400',
    moderate: 'text-yellow-600 dark:text-yellow-400',
    high: 'text-red-600 dark:text-red-400'
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         patient.condition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { label: 'Total Patients', value: patients.length, icon: UserGroupIcon, color: 'cyan' },
    { label: 'Critical', value: patients.filter(p => p.status === 'critical').length, icon: HeartIcon, color: 'red' },
    { label: 'This Week', value: 12, icon: CalendarDaysIcon, color: 'green' },
    { label: 'Pending Reports', value: 5, icon: DocumentTextIcon, color: 'orange' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Patient Roster</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage and monitor your patients</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
            <UserGroupIcon className="w-5 h-5" />
            Add Patient
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patients by name or condition..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-slate-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="critical">Critical</option>
              <option value="monitoring">Monitoring</option>
              <option value="recovering">Recovering</option>
            </select>
          </div>
        </div>

        {/* Patient List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Risk Level
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Next Appointment
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredPatients.map((patient) => (
                  <tr 
                    key={patient.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white font-medium text-sm">
                          {patient.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{patient.name}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{patient.age} yrs • {patient.gender}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-900 dark:text-white">{patient.condition}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[patient.status]}`}>
                        {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          patient.riskLevel === 'high' ? 'bg-red-500' :
                          patient.riskLevel === 'moderate' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></span>
                        <span className={`text-sm font-medium ${riskColors[patient.riskLevel]}`}>
                          {patient.riskLevel.charAt(0).toUpperCase() + patient.riskLevel.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <CalendarDaysIcon className="w-4 h-4" />
                        <span className="text-sm">{patient.nextAppointment}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Call">
                          <PhoneIcon className="w-4 h-4 text-slate-500" />
                        </button>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Message">
                          <ChatBubbleLeftRightIcon className="w-4 h-4 text-slate-500" />
                        </button>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Records">
                          <DocumentTextIcon className="w-4 h-4 text-slate-500" />
                        </button>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                          <EllipsisVerticalIcon className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPatients.length === 0 && (
            <div className="text-center py-12">
              <UserGroupIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">No patients found matching your criteria</p>
            </div>
          )}
        </div>

        {/* Patient Quick View Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPatient(null)}>
            <div 
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl">
                    {selectedPatient.avatar}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedPatient.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400">{selectedPatient.age} years • {selectedPatient.gender}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedPatient.status]}`}>
                  {selectedPatient.status.charAt(0).toUpperCase() + selectedPatient.status.slice(1)}
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Primary Condition</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedPatient.condition}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Last Visit</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedPatient.lastVisit}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Next Appointment</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedPatient.nextAppointment}</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Contact Information</p>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <PhoneIcon className="w-4 h-4 text-slate-400" />
                      {selectedPatient.phone}
                    </p>
                    <p className="text-sm text-slate-900 dark:text-white">
                      ✉️ {selectedPatient.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button className="flex-1 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium">
                  View Full Record
                </button>
                <button className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium">
                  Schedule Appointment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
