'use client';

import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  UserIcon,
  ServerStackIcon,
  KeyIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function AdminAuditPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [selectedLog, setSelectedLog] = useState(null);

  const auditLogs = [
    {
      id: 1,
      timestamp: '2024-01-15 10:30:15',
      user: 'Dr. John Smith',
      userId: 'USR-001',
      action: 'Patient Record Access',
      resource: 'Medical Record #MR-2024-001',
      ipAddress: '192.168.1.100',
      severity: 'info',
      status: 'success',
      details: 'Accessed patient medical history for consultation purposes.'
    },
    {
      id: 2,
      timestamp: '2024-01-15 10:25:42',
      user: 'Admin User',
      userId: 'USR-003',
      action: 'User Permission Change',
      resource: 'User #USR-007',
      ipAddress: '192.168.1.50',
      severity: 'warning',
      status: 'success',
      details: 'Elevated user permissions from Staff to Admin role.'
    },
    {
      id: 3,
      timestamp: '2024-01-15 10:20:08',
      user: 'Unknown',
      userId: null,
      action: 'Failed Login Attempt',
      resource: 'Authentication System',
      ipAddress: '203.45.167.89',
      severity: 'critical',
      status: 'failure',
      details: 'Multiple failed login attempts detected. Account temporarily locked.'
    },
    {
      id: 4,
      timestamp: '2024-01-15 10:15:33',
      user: 'System',
      userId: 'SYSTEM',
      action: 'Automated Backup',
      resource: 'Database Server',
      ipAddress: 'localhost',
      severity: 'info',
      status: 'success',
      details: 'Scheduled daily backup completed successfully. 2.4GB data backed up.'
    },
    {
      id: 5,
      timestamp: '2024-01-15 10:10:22',
      user: 'Dr. Emily Chen',
      userId: 'USR-004',
      action: 'Prescription Created',
      resource: 'Prescription #RX-2024-156',
      ipAddress: '192.168.1.105',
      severity: 'info',
      status: 'success',
      details: 'New prescription created for patient Sarah Johnson.'
    },
    {
      id: 6,
      timestamp: '2024-01-15 10:05:11',
      user: 'Nurse Lisa Williams',
      userId: 'USR-006',
      action: 'Data Export',
      resource: 'Patient Reports',
      ipAddress: '192.168.1.110',
      severity: 'warning',
      status: 'success',
      details: 'Exported 15 patient reports to PDF format.'
    },
    {
      id: 7,
      timestamp: '2024-01-15 09:58:44',
      user: 'Admin User',
      userId: 'USR-003',
      action: 'System Configuration',
      resource: 'Security Settings',
      ipAddress: '192.168.1.50',
      severity: 'critical',
      status: 'success',
      details: 'Modified password policy: minimum length increased to 12 characters.'
    },
    {
      id: 8,
      timestamp: '2024-01-15 09:45:30',
      user: 'Sarah Johnson',
      userId: 'USR-002',
      action: 'Profile Update',
      resource: 'User Profile',
      ipAddress: '192.168.1.200',
      severity: 'info',
      status: 'success',
      details: 'Updated contact information and emergency contact details.'
    }
  ];

  const severityConfig = {
    info: { color: 'blue', icon: InformationCircleIcon, label: 'Info' },
    warning: { color: 'yellow', icon: ExclamationTriangleIcon, label: 'Warning' },
    critical: { color: 'red', icon: XCircleIcon, label: 'Critical' }
  };

  const statusConfig = {
    success: { color: 'green', icon: CheckCircleIcon },
    failure: { color: 'red', icon: XCircleIcon }
  };

  const actionIcons = {
    'Patient Record Access': DocumentTextIcon,
    'User Permission Change': ShieldCheckIcon,
    'Failed Login Attempt': KeyIcon,
    'Automated Backup': ServerStackIcon,
    'Prescription Created': DocumentTextIcon,
    'Data Export': ArrowDownTrayIcon,
    'System Configuration': ServerStackIcon,
    'Profile Update': UserIcon
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || log.action.toLowerCase().includes(filterType.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    return matchesSearch && matchesType && matchesSeverity;
  });

  const stats = [
    { label: 'Total Events', value: auditLogs.length, color: 'cyan' },
    { label: 'Info', value: auditLogs.filter(l => l.severity === 'info').length, color: 'blue' },
    { label: 'Warnings', value: auditLogs.filter(l => l.severity === 'warning').length, color: 'yellow' },
    { label: 'Critical', value: auditLogs.filter(l => l.severity === 'critical').length, color: 'red' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Audit Protocols</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Monitor system activities and security events</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
            <ArrowDownTrayIcon className="w-5 h-5" />
            Export Logs
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

        {/* HIPAA Compliance Banner */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-300">HIPAA Compliant Audit Trail</h3>
              <p className="text-sm text-green-700 dark:text-green-400">
                All access to protected health information (PHI) is logged and retained for 6 years.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by action, user, or resource..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Severity</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>

        {/* Audit Log List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Timestamp</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Resource</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Severity</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredLogs.map((log) => {
                  const SeverityIcon = severityConfig[log.severity].icon;
                  const StatusIcon = statusConfig[log.status].icon;
                  const ActionIcon = actionIcons[log.action] || DocumentTextIcon;
                  
                  return (
                    <tr 
                      key={log.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ClockIcon className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-900 dark:text-white font-mono">{log.timestamp}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{log.user}</p>
                          <p className="text-xs text-slate-500">{log.userId || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <ActionIcon className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-900 dark:text-white">{log.action}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600 dark:text-slate-400 text-sm">{log.resource}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <SeverityIcon className={`w-4 h-4 text-${severityConfig[log.severity].color}-500`} />
                          <span className={`text-sm font-medium text-${severityConfig[log.severity].color}-600 dark:text-${severityConfig[log.severity].color}-400`}>
                            {severityConfig[log.severity].label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 text-${statusConfig[log.status].color}-500`} />
                          <span className={`text-sm capitalize text-${statusConfig[log.status].color}-600 dark:text-${statusConfig[log.status].color}-400`}>
                            {log.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedLog(log)}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <EyeIcon className="w-4 h-4 text-slate-500" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <DocumentTextIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">No audit logs found matching your criteria</p>
            </div>
          )}
        </div>

        {/* Log Detail Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedLog(null)}>
            <div 
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Audit Log Details</h2>
                  <p className="text-sm text-slate-500 mt-1">ID: {selectedLog.id}</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-${severityConfig[selectedLog.severity].color}-100 dark:bg-${severityConfig[selectedLog.severity].color}-900/30`}>
                  {(() => {
                    const Icon = severityConfig[selectedLog.severity].icon;
                    return <Icon className={`w-4 h-4 text-${severityConfig[selectedLog.severity].color}-600`} />;
                  })()}
                  <span className={`text-sm font-medium text-${severityConfig[selectedLog.severity].color}-700 dark:text-${severityConfig[selectedLog.severity].color}-400`}>
                    {severityConfig[selectedLog.severity].label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Timestamp</p>
                  <p className="font-mono text-sm text-slate-900 dark:text-white">{selectedLog.timestamp}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">IP Address</p>
                  <p className="font-mono text-sm text-slate-900 dark:text-white">{selectedLog.ipAddress}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">User</p>
                  <p className="text-sm text-slate-900 dark:text-white">{selectedLog.user}</p>
                  <p className="text-xs text-slate-500">{selectedLog.userId || 'N/A'}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const StatusIcon = statusConfig[selectedLog.status].icon;
                      return <StatusIcon className={`w-4 h-4 text-${statusConfig[selectedLog.status].color}-500`} />;
                    })()}
                    <span className={`text-sm capitalize text-${statusConfig[selectedLog.status].color}-600 dark:text-${statusConfig[selectedLog.status].color}-400`}>
                      {selectedLog.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg mb-6">
                <p className="text-xs text-slate-500 mb-1">Action</p>
                <p className="font-medium text-slate-900 dark:text-white">{selectedLog.action}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Resource: {selectedLog.resource}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg mb-6">
                <p className="text-xs text-slate-500 mb-1">Details</p>
                <p className="text-sm text-slate-900 dark:text-white">{selectedLog.details}</p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                >
                  Close
                </button>
                <button className="flex-1 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium">
                  Export Log
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
