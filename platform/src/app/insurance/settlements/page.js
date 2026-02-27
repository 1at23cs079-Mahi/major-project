'use client';

import { useState } from 'react';
import {
  BanknotesIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentTextIcon,
  UserCircleIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  PaperAirplaneIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

export default function InsuranceSettlementsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSettlement, setSelectedSettlement] = useState(null);

  const settlements = [
    {
      id: 'SET-2024-001',
      claimId: 'CLM-78945',
      patient: 'Sarah Johnson',
      provider: 'City General Hospital',
      claimType: 'Hospitalization',
      claimAmount: 45000,
      approvedAmount: 42500,
      patientResponsibility: 2500,
      status: 'approved',
      submittedDate: '2024-01-05',
      processedDate: '2024-01-15',
      paymentDate: '2024-01-18',
      notes: 'Full coverage minus standard deductible.'
    },
    {
      id: 'SET-2024-002',
      claimId: 'CLM-78952',
      patient: 'Michael Chen',
      provider: 'Premier Healthcare',
      claimType: 'Surgery',
      claimAmount: 85000,
      approvedAmount: 78000,
      patientResponsibility: 7000,
      status: 'pending',
      submittedDate: '2024-01-10',
      processedDate: null,
      paymentDate: null,
      notes: 'Awaiting additional documentation from provider.'
    },
    {
      id: 'SET-2024-003',
      claimId: 'CLM-78901',
      patient: 'Emily Brown',
      provider: 'Sunrise Clinic',
      claimType: 'Outpatient',
      claimAmount: 3500,
      approvedAmount: 3200,
      patientResponsibility: 300,
      status: 'paid',
      submittedDate: '2024-01-02',
      processedDate: '2024-01-08',
      paymentDate: '2024-01-12',
      notes: 'Standard copay applied.'
    },
    {
      id: 'SET-2024-004',
      claimId: 'CLM-78967',
      patient: 'Robert Wilson',
      provider: 'Regional Medical',
      claimType: 'Emergency',
      claimAmount: 12500,
      approvedAmount: 0,
      patientResponsibility: 12500,
      status: 'denied',
      submittedDate: '2024-01-08',
      processedDate: '2024-01-14',
      paymentDate: null,
      notes: 'Pre-existing condition exclusion. Patient may appeal.'
    },
    {
      id: 'SET-2024-005',
      claimId: 'CLM-78980',
      patient: 'Lisa Thompson',
      provider: 'Wellness Partners',
      claimType: 'Preventive Care',
      claimAmount: 1200,
      approvedAmount: 1200,
      patientResponsibility: 0,
      status: 'paid',
      submittedDate: '2024-01-03',
      processedDate: '2024-01-06',
      paymentDate: '2024-01-10',
      notes: 'Fully covered under preventive care benefits.'
    },
    {
      id: 'SET-2024-006',
      claimId: 'CLM-78995',
      patient: 'James Miller',
      provider: 'Metro Hospital',
      claimType: 'Diagnostic',
      claimAmount: 4800,
      approvedAmount: 4200,
      patientResponsibility: 600,
      status: 'processing',
      submittedDate: '2024-01-12',
      processedDate: null,
      paymentDate: null,
      notes: 'Under medical review for necessity verification.'
    }
  ];

  const statusConfig = {
    pending: { color: 'yellow', label: 'Pending', icon: ClockIcon },
    processing: { color: 'blue', label: 'Processing', icon: DocumentTextIcon },
    approved: { color: 'cyan', label: 'Approved', icon: CheckCircleIcon },
    paid: { color: 'green', label: 'Paid', icon: BanknotesIcon },
    denied: { color: 'red', label: 'Denied', icon: XCircleIcon }
  };

  const filteredSettlements = settlements.filter(s => {
    const matchesSearch = s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalClaimed = settlements.reduce((sum, s) => sum + s.claimAmount, 0);
  const totalApproved = settlements.reduce((sum, s) => sum + s.approvedAmount, 0);
  const totalPaid = settlements.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.approvedAmount, 0);
  const approvalRate = ((settlements.filter(s => ['approved', 'paid'].includes(s.status)).length / settlements.length) * 100).toFixed(1);

  const stats = [
    { label: 'Total Claimed', value: `$${(totalClaimed / 1000).toFixed(0)}K`, icon: DocumentTextIcon, color: 'slate', trend: null },
    { label: 'Total Approved', value: `$${(totalApproved / 1000).toFixed(0)}K`, icon: CheckCircleIcon, color: 'cyan', trend: 'up' },
    { label: 'Total Paid', value: `$${(totalPaid / 1000).toFixed(0)}K`, icon: BanknotesIcon, color: 'green', trend: 'up' },
    { label: 'Approval Rate', value: `${approvalRate}%`, icon: ArrowTrendingUpIcon, color: 'blue', trend: null }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Claims Settlements</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage and track insurance claim settlements</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
              <ArrowDownTrayIcon className="w-5 h-5" />
              Export
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
              <DocumentTextIcon className="w-5 h-5" />
              New Claim
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                    {stat.trend === 'up' && <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />}
                    {stat.trend === 'down' && <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />}
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, patient, or provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="denied">Denied</option>
          </select>
        </div>

        {/* Settlements Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Settlement ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Patient / Provider</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Claimed</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Approved</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredSettlements.map((settlement) => {
                  const StatusIcon = statusConfig[settlement.status].icon;
                  
                  return (
                    <tr 
                      key={settlement.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-mono font-medium text-slate-900 dark:text-white">{settlement.id}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{settlement.claimId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                            <UserCircleIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{settlement.patient}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{settlement.provider}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm">
                          {settlement.claimType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900 dark:text-white">${settlement.claimAmount.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`font-medium ${settlement.approvedAmount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          ${settlement.approvedAmount.toLocaleString()}
                        </p>
                        {settlement.patientResponsibility > 0 && (
                          <p className="text-xs text-slate-500">Patient: ${settlement.patientResponsibility.toLocaleString()}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full w-fit bg-${statusConfig[settlement.status].color}-100 dark:bg-${statusConfig[settlement.status].color}-900/30`}>
                          <StatusIcon className={`w-4 h-4 text-${statusConfig[settlement.status].color}-600 dark:text-${statusConfig[settlement.status].color}-400`} />
                          <span className={`text-sm font-medium text-${statusConfig[settlement.status].color}-700 dark:text-${statusConfig[settlement.status].color}-400`}>
                            {statusConfig[settlement.status].label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedSettlement(settlement)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <EyeIcon className="w-4 h-4 text-slate-500" />
                          </button>
                          {settlement.status === 'approved' && (
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Process Payment">
                              <PaperAirplaneIcon className="w-4 h-4 text-cyan-500" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Settlement Detail Modal */}
        {selectedSettlement && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedSettlement(null)}>
            <div 
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`h-2 ${
                selectedSettlement.status === 'paid' ? 'bg-green-500' :
                selectedSettlement.status === 'approved' ? 'bg-cyan-500' :
                selectedSettlement.status === 'denied' ? 'bg-red-500' :
                'bg-yellow-500'
              }`}></div>
              
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-mono text-slate-500">{selectedSettlement.id}</p>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{selectedSettlement.claimType} Claim</h2>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-${statusConfig[selectedSettlement.status].color}-100 dark:bg-${statusConfig[selectedSettlement.status].color}-900/30`}>
                    {(() => {
                      const Icon = statusConfig[selectedSettlement.status].icon;
                      return <Icon className={`w-4 h-4 text-${statusConfig[selectedSettlement.status].color}-600`} />;
                    })()}
                    <span className={`text-sm font-medium text-${statusConfig[selectedSettlement.status].color}-700 dark:text-${statusConfig[selectedSettlement.status].color}-400`}>
                      {statusConfig[selectedSettlement.status].label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {/* Amount Summary */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                    <p className="text-xs text-slate-500 mb-1">Claimed</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">${selectedSettlement.claimAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                    <p className="text-xs text-green-600 mb-1">Approved</p>
                    <p className="text-xl font-bold text-green-700 dark:text-green-400">${selectedSettlement.approvedAmount.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                    <p className="text-xs text-orange-600 mb-1">Patient Owes</p>
                    <p className="text-xl font-bold text-orange-700 dark:text-orange-400">${selectedSettlement.patientResponsibility.toLocaleString()}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <UserCircleIcon className="w-8 h-8 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Patient</p>
                      <p className="font-medium text-slate-900 dark:text-white">{selectedSettlement.patient}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <BuildingOffice2Icon className="w-8 h-8 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Healthcare Provider</p>
                      <p className="font-medium text-slate-900 dark:text-white">{selectedSettlement.provider}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-3">Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                        <CalendarDaysIcon className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-900 dark:text-white">Submitted</p>
                        <p className="text-xs text-slate-500">{selectedSettlement.submittedDate}</p>
                      </div>
                    </div>
                    {selectedSettlement.processedDate && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <DocumentTextIcon className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-900 dark:text-white">Processed</p>
                          <p className="text-xs text-slate-500">{selectedSettlement.processedDate}</p>
                        </div>
                      </div>
                    )}
                    {selectedSettlement.paymentDate && (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <BanknotesIcon className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-900 dark:text-white">Payment Sent</p>
                          <p className="text-xs text-slate-500">{selectedSettlement.paymentDate}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Notes</p>
                  <p className="text-slate-700 dark:text-slate-300">{selectedSettlement.notes}</p>
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                {selectedSettlement.status === 'approved' && (
                  <button className="flex-1 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                    Process Payment
                  </button>
                )}
                {selectedSettlement.status === 'denied' && (
                  <button className="flex-1 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium">
                    File Appeal
                  </button>
                )}
                <button 
                  onClick={() => setSelectedSettlement(null)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
