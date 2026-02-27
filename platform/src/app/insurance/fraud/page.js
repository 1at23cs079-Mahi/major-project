'use client';

import { useState } from 'react';
import {
  ShieldExclamationIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentMagnifyingGlassIcon,
  UserCircleIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  CalendarDaysIcon,
  FlagIcon,
  EyeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function InsuranceFraudPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRisk, setFilterRisk] = useState('all');
  const [selectedCase, setSelectedCase] = useState(null);

  const fraudCases = [
    {
      id: 'FRD-2024-001',
      claimId: 'CLM-78945',
      claimant: 'John Doe',
      provider: 'City Medical Center',
      claimAmount: 45000,
      flaggedAmount: 32000,
      riskScore: 92,
      status: 'investigating',
      flaggedDate: '2024-01-14',
      type: 'Billing Fraud',
      indicators: ['Duplicate billing', 'Unbundling services', 'Upcoding'],
      description: 'Multiple instances of duplicate billing detected for the same procedures across different dates.'
    },
    {
      id: 'FRD-2024-002',
      claimId: 'CLM-78952',
      claimant: 'Jane Smith',
      provider: 'Premier Healthcare',
      claimAmount: 28500,
      flaggedAmount: 15000,
      riskScore: 78,
      status: 'pending',
      flaggedDate: '2024-01-15',
      type: 'Identity Fraud',
      indicators: ['Address mismatch', 'Multiple claims same day', 'New provider'],
      description: 'Patient address does not match insurance records. Multiple claims submitted on same day from different locations.'
    },
    {
      id: 'FRD-2024-003',
      claimId: 'CLM-78901',
      claimant: 'Robert Wilson',
      provider: 'Sunrise Clinic',
      claimAmount: 12000,
      flaggedAmount: 12000,
      riskScore: 95,
      status: 'confirmed',
      flaggedDate: '2024-01-10',
      type: 'Phantom Billing',
      indicators: ['No service rendered', 'Patient deceased', 'Fabricated records'],
      description: 'Services billed for a patient who was confirmed deceased 3 months prior to the service date.'
    },
    {
      id: 'FRD-2024-004',
      claimId: 'CLM-78967',
      claimant: 'Emily Brown',
      provider: 'Regional Medical',
      claimAmount: 8500,
      flaggedAmount: 3200,
      riskScore: 45,
      status: 'cleared',
      flaggedDate: '2024-01-12',
      type: 'Upcoding',
      indicators: ['Higher complexity codes', 'Pattern deviation'],
      description: 'Initial flag for potential upcoding. Investigation revealed documentation supported billing codes.'
    },
    {
      id: 'FRD-2024-005',
      claimId: 'CLM-78980',
      claimant: 'Michael Chen',
      provider: 'Wellness Partners',
      claimAmount: 67000,
      flaggedAmount: 45000,
      riskScore: 88,
      status: 'investigating',
      flaggedDate: '2024-01-13',
      type: 'Kickback Scheme',
      indicators: ['Referral patterns', 'Unusual provider relationships', 'High volume'],
      description: 'Unusual referral patterns detected between providers suggesting potential kickback arrangement.'
    }
  ];

  const statusConfig = {
    pending: { color: 'yellow', label: 'Pending Review', icon: ClockIcon },
    investigating: { color: 'blue', label: 'Under Investigation', icon: DocumentMagnifyingGlassIcon },
    confirmed: { color: 'red', label: 'Fraud Confirmed', icon: XCircleIcon },
    cleared: { color: 'green', label: 'Cleared', icon: CheckCircleIcon }
  };

  const getRiskColor = (score) => {
    if (score >= 80) return 'red';
    if (score >= 50) return 'yellow';
    return 'green';
  };

  const filteredCases = fraudCases.filter(c => {
    const matchesSearch = c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.claimant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
    const matchesRisk = filterRisk === 'all' ||
                       (filterRisk === 'high' && c.riskScore >= 80) ||
                       (filterRisk === 'medium' && c.riskScore >= 50 && c.riskScore < 80) ||
                       (filterRisk === 'low' && c.riskScore < 50);
    return matchesSearch && matchesStatus && matchesRisk;
  });

  const stats = [
    { label: 'Active Cases', value: fraudCases.filter(c => c.status === 'investigating').length, icon: DocumentMagnifyingGlassIcon, color: 'blue' },
    { label: 'Pending Review', value: fraudCases.filter(c => c.status === 'pending').length, icon: ClockIcon, color: 'yellow' },
    { label: 'Confirmed Fraud', value: fraudCases.filter(c => c.status === 'confirmed').length, icon: XCircleIcon, color: 'red' },
    { label: 'Total Flagged', value: `$${(fraudCases.reduce((sum, c) => sum + c.flaggedAmount, 0) / 1000).toFixed(0)}K`, icon: CurrencyDollarIcon, color: 'cyan' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Fraud Detection Monitor</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">AI-powered fraud detection and investigation</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm">
              <ShieldExclamationIcon className="w-4 h-4" />
              {fraudCases.filter(c => c.riskScore >= 80).length} High Risk Alerts
            </span>
          </div>
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

        {/* Risk Overview */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Risk Distribution</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
              <div className="bg-red-500 h-full" style={{ width: `${(fraudCases.filter(c => c.riskScore >= 80).length / fraudCases.length) * 100}%` }}></div>
              <div className="bg-yellow-500 h-full" style={{ width: `${(fraudCases.filter(c => c.riskScore >= 50 && c.riskScore < 80).length / fraudCases.length) * 100}%` }}></div>
              <div className="bg-green-500 h-full" style={{ width: `${(fraudCases.filter(c => c.riskScore < 50).length / fraudCases.length) * 100}%` }}></div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                High
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                Medium
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                Low
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by case ID, claimant, or provider..."
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
            <option value="investigating">Investigating</option>
            <option value="confirmed">Confirmed</option>
            <option value="cleared">Cleared</option>
          </select>
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
          >
            <option value="all">All Risk Levels</option>
            <option value="high">High Risk (80+)</option>
            <option value="medium">Medium Risk (50-79)</option>
            <option value="low">Low Risk (&lt;50)</option>
          </select>
        </div>

        {/* Cases Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Case ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Claimant / Provider</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Flagged Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Risk Score</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredCases.map((caseItem) => {
                  const StatusIcon = statusConfig[caseItem.status].icon;
                  const riskColor = getRiskColor(caseItem.riskScore);
                  
                  return (
                    <tr 
                      key={caseItem.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-mono font-medium text-slate-900 dark:text-white">{caseItem.id}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{caseItem.claimId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                            <UserCircleIcon className="w-6 h-6 text-slate-500" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{caseItem.claimant}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{caseItem.provider}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm">
                          {caseItem.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900 dark:text-white">${caseItem.flaggedAmount.toLocaleString()}</p>
                        <p className="text-xs text-slate-500">of ${caseItem.claimAmount.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-${riskColor}-500 rounded-full`}
                              style={{ width: `${caseItem.riskScore}%` }}
                            ></div>
                          </div>
                          <span className={`font-bold text-${riskColor}-600 dark:text-${riskColor}-400`}>
                            {caseItem.riskScore}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full w-fit bg-${statusConfig[caseItem.status].color}-100 dark:bg-${statusConfig[caseItem.status].color}-900/30`}>
                          <StatusIcon className={`w-4 h-4 text-${statusConfig[caseItem.status].color}-600 dark:text-${statusConfig[caseItem.status].color}-400`} />
                          <span className={`text-sm font-medium text-${statusConfig[caseItem.status].color}-700 dark:text-${statusConfig[caseItem.status].color}-400`}>
                            {statusConfig[caseItem.status].label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedCase(caseItem)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            <EyeIcon className="w-4 h-4 text-slate-500" />
                          </button>
                          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                            <FlagIcon className="w-4 h-4 text-slate-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Case Detail Modal */}
        {selectedCase && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCase(null)}>
            <div 
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`h-2 ${selectedCase.riskScore >= 80 ? 'bg-red-500' : selectedCase.riskScore >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
              
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-mono text-slate-500">{selectedCase.id}</p>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{selectedCase.type}</h2>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-${statusConfig[selectedCase.status].color}-100 dark:bg-${statusConfig[selectedCase.status].color}-900/30`}>
                    {(() => {
                      const Icon = statusConfig[selectedCase.status].icon;
                      return <Icon className={`w-4 h-4 text-${statusConfig[selectedCase.status].color}-600`} />;
                    })()}
                    <span className={`text-sm font-medium text-${statusConfig[selectedCase.status].color}-700 dark:text-${statusConfig[selectedCase.status].color}-400`}>
                      {statusConfig[selectedCase.status].label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Risk Score</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-3xl font-bold text-${getRiskColor(selectedCase.riskScore)}-600`}>
                        {selectedCase.riskScore}
                      </span>
                      <span className="text-slate-500">/100</span>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Flagged Amount</p>
                    <p className="text-2xl font-bold text-red-600">${selectedCase.flaggedAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Claimant</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedCase.claimant}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Provider</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedCase.provider}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-3">Description</h3>
                  <p className="text-slate-700 dark:text-slate-300">{selectedCase.description}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-3">Fraud Indicators</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCase.indicators.map((indicator, idx) => (
                      <span key={idx} className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm">
                        {indicator}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                <button className="flex-1 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium">
                  Start Investigation
                </button>
                <button 
                  onClick={() => setSelectedCase(null)}
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
