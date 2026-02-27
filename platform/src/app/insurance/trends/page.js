'use client';

import { useState } from 'react';
import {
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  BuildingOffice2Icon,
  ClockIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

export default function InsuranceTrendsPage() {
  const [dateRange, setDateRange] = useState('6m');
  const [selectedMetric, setSelectedMetric] = useState('claims');

  const metrics = [
    { id: 'claims', label: 'Total Claims', value: '12,847', change: '+12.5%', trend: 'up' },
    { id: 'paid', label: 'Amount Paid', value: '$4.2M', change: '+8.3%', trend: 'up' },
    { id: 'avg', label: 'Avg. Claim Value', value: '$3,267', change: '-2.1%', trend: 'down' },
    { id: 'time', label: 'Avg. Processing', value: '4.2 days', change: '-15%', trend: 'up' }
  ];

  const claimsByType = [
    { type: 'Hospitalization', count: 2847, amount: 1250000, percentage: 30 },
    { type: 'Surgery', count: 1523, amount: 980000, percentage: 23 },
    { type: 'Outpatient', count: 4521, amount: 750000, percentage: 18 },
    { type: 'Emergency', count: 1892, amount: 620000, percentage: 15 },
    { type: 'Diagnostic', count: 1456, amount: 380000, percentage: 9 },
    { type: 'Preventive', count: 608, amount: 220000, percentage: 5 }
  ];

  const topProviders = [
    { name: 'City General Hospital', claims: 1847, amount: 1250000, trend: 'up' },
    { name: 'Regional Medical Center', claims: 1523, amount: 980000, trend: 'up' },
    { name: 'Premier Healthcare', claims: 1245, amount: 750000, trend: 'down' },
    { name: 'Wellness Partners', claims: 892, amount: 420000, trend: 'up' },
    { name: 'Sunrise Clinic', claims: 756, amount: 320000, trend: 'stable' }
  ];

  const monthlyTrend = [
    { month: 'Aug', claims: 1850, amount: 580000 },
    { month: 'Sep', claims: 2100, amount: 650000 },
    { month: 'Oct', claims: 1950, amount: 620000 },
    { month: 'Nov', claims: 2300, amount: 720000 },
    { month: 'Dec', claims: 2450, amount: 780000 },
    { month: 'Jan', claims: 2197, amount: 850000 }
  ];

  const denialReasons = [
    { reason: 'Missing Documentation', count: 342, percentage: 28 },
    { reason: 'Not Covered', count: 256, percentage: 21 },
    { reason: 'Pre-existing Condition', count: 189, percentage: 15 },
    { reason: 'Out of Network', count: 165, percentage: 13 },
    { reason: 'Coding Errors', count: 152, percentage: 12 },
    { reason: 'Other', count: 134, percentage: 11 }
  ];

  const maxClaims = Math.max(...monthlyTrend.map(m => m.claims));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics & Trends</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Insurance claims analytics and insights</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value="1m">Last Month</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
              <ArrowDownTrayIcon className="w-5 h-5" />
              Export Report
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <div 
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm cursor-pointer transition-all ${
                selectedMetric === metric.id ? 'ring-2 ring-cyan-500' : ''
              }`}
            >
              <p className="text-sm text-slate-500 dark:text-slate-400">{metric.label}</p>
              <div className="flex items-end justify-between mt-2">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
                <div className={`flex items-center gap-1 text-sm ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metric.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="w-4 h-4" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-4 h-4" />
                  )}
                  {metric.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Claims Trend</h2>
            <div className="h-64 flex items-end justify-between gap-2">
              {monthlyTrend.map((month, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-cyan-500 rounded-t-lg transition-all hover:bg-cyan-600"
                    style={{ height: `${(month.claims / maxClaims) * 200}px` }}
                  ></div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{month.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-cyan-500 rounded"></span>
                Claims Volume
              </span>
            </div>
          </div>

          {/* Claims by Type */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Claims by Type</h2>
            <div className="space-y-4">
              {claimsByType.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{item.type}</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{item.percentage}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        index === 0 ? 'bg-cyan-500' :
                        index === 1 ? 'bg-blue-500' :
                        index === 2 ? 'bg-green-500' :
                        index === 3 ? 'bg-yellow-500' :
                        index === 4 ? 'bg-orange-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Providers */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Top Providers</h2>
              <BuildingOffice2Icon className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-4">
              {topProviders.map((provider, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{provider.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{provider.claims.toLocaleString()} claims</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900 dark:text-white">${(provider.amount / 1000).toFixed(0)}K</p>
                    <div className={`flex items-center justify-end gap-1 text-xs ${
                      provider.trend === 'up' ? 'text-green-600' :
                      provider.trend === 'down' ? 'text-red-600' : 'text-slate-500'
                    }`}>
                      {provider.trend === 'up' && <ArrowTrendingUpIcon className="w-3 h-3" />}
                      {provider.trend === 'down' && <ArrowTrendingDownIcon className="w-3 h-3" />}
                      {provider.trend === 'up' ? 'Increasing' : provider.trend === 'down' ? 'Decreasing' : 'Stable'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Denial Reasons */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Denial Reasons</h2>
              <DocumentTextIcon className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-3">
              {denialReasons.map((reason, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-700 dark:text-slate-300">{reason.reason}</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">{reason.count}</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full"
                        style={{ width: `${reason.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white w-12 text-right">
                    {reason.percentage}%
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                <strong>Insight:</strong> Missing documentation accounts for 28% of all denials. Consider implementing automated document verification.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Summary */}
        <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl p-6 text-white">
          <h2 className="text-lg font-semibold mb-4">Quick Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-cyan-100 text-sm">Approval Rate</p>
              <p className="text-3xl font-bold mt-1">87.3%</p>
              <p className="text-cyan-200 text-sm mt-1">+2.1% vs last period</p>
            </div>
            <div>
              <p className="text-cyan-100 text-sm">Avg. Processing Time</p>
              <p className="text-3xl font-bold mt-1">4.2 days</p>
              <p className="text-cyan-200 text-sm mt-1">-0.8 days improvement</p>
            </div>
            <div>
              <p className="text-cyan-100 text-sm">Active Members</p>
              <p className="text-3xl font-bold mt-1">24,567</p>
              <p className="text-cyan-200 text-sm mt-1">+1,234 new this month</p>
            </div>
            <div>
              <p className="text-cyan-100 text-sm">Loss Ratio</p>
              <p className="text-3xl font-bold mt-1">72.4%</p>
              <p className="text-cyan-200 text-sm mt-1">Within target range</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
