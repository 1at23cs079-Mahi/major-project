'use client';

import { useState } from 'react';
import {
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ClockIcon,
  HeartIcon,
  CalendarDaysIcon,
  BuildingOffice2Icon,
  BeakerIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

export default function HospitalAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const departments = [
    { id: 'all', name: 'All Departments' },
    { id: 'emergency', name: 'Emergency' },
    { id: 'surgery', name: 'Surgery' },
    { id: 'cardiology', name: 'Cardiology' },
    { id: 'oncology', name: 'Oncology' },
    { id: 'pediatrics', name: 'Pediatrics' }
  ];

  const keyMetrics = [
    { label: 'Total Patients', value: '2,847', change: '+12.5%', trend: 'up', icon: UserGroupIcon, color: 'cyan' },
    { label: 'Avg. Stay Duration', value: '4.2 days', change: '-8.3%', trend: 'up', icon: ClockIcon, color: 'green' },
    { label: 'Bed Occupancy', value: '78.5%', change: '+3.2%', trend: 'neutral', icon: BuildingOffice2Icon, color: 'blue' },
    { label: 'Revenue', value: '$4.2M', change: '+15.7%', trend: 'up', icon: CurrencyDollarIcon, color: 'purple' }
  ];

  const departmentStats = [
    { name: 'Emergency', patients: 845, revenue: 1250000, occupancy: 92, satisfaction: 4.2 },
    { name: 'Surgery', patients: 423, revenue: 980000, occupancy: 85, satisfaction: 4.5 },
    { name: 'Cardiology', patients: 312, revenue: 750000, occupancy: 78, satisfaction: 4.6 },
    { name: 'Oncology', patients: 287, revenue: 620000, occupancy: 82, satisfaction: 4.4 },
    { name: 'Pediatrics', patients: 456, revenue: 380000, occupancy: 65, satisfaction: 4.7 },
    { name: 'Orthopedics', patients: 234, revenue: 420000, occupancy: 71, satisfaction: 4.3 }
  ];

  const monthlyTrend = [
    { month: 'Aug', patients: 2100, revenue: 3.2 },
    { month: 'Sep', patients: 2350, revenue: 3.5 },
    { month: 'Oct', patients: 2200, revenue: 3.3 },
    { month: 'Nov', patients: 2500, revenue: 3.8 },
    { month: 'Dec', patients: 2750, revenue: 4.0 },
    { month: 'Jan', patients: 2847, revenue: 4.2 }
  ];

  const patientOutcomes = [
    { outcome: 'Discharged - Recovered', count: 2145, percentage: 75.4 },
    { outcome: 'Discharged - Improved', count: 498, percentage: 17.5 },
    { outcome: 'Transferred', count: 112, percentage: 3.9 },
    { outcome: 'Ongoing Treatment', count: 92, percentage: 3.2 }
  ];

  const topProcedures = [
    { name: 'General Consultation', count: 1250, revenue: 250000 },
    { name: 'Diagnostic Imaging', count: 890, revenue: 445000 },
    { name: 'Laboratory Tests', count: 2340, revenue: 351000 },
    { name: 'Minor Surgery', count: 345, revenue: 517500 },
    { name: 'Emergency Care', count: 678, revenue: 542400 }
  ];

  const maxPatients = Math.max(...monthlyTrend.map(m => m.patients));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Hospital Analytics</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Comprehensive performance metrics and insights</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
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
          {keyMetrics.map((metric, index) => (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{metric.label}</p>
                  <div className="flex items-end gap-2 mt-1">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
                    <div className={`flex items-center gap-0.5 text-sm ${
                      metric.trend === 'up' ? 'text-green-600' :
                      metric.trend === 'down' ? 'text-red-600' : 'text-slate-500'
                    }`}>
                      {metric.trend === 'up' && <ArrowTrendingUpIcon className="w-4 h-4" />}
                      {metric.trend === 'down' && <ArrowTrendingDownIcon className="w-4 h-4" />}
                      {metric.change}
                    </div>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-${metric.color}-100 dark:bg-${metric.color}-900/30 flex items-center justify-center`}>
                  <metric.icon className={`w-6 h-6 text-${metric.color}-600 dark:text-${metric.color}-400`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Department Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setSelectedDepartment(dept.id)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedDepartment === dept.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {dept.name}
            </button>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Trend Chart */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Patient Volume Trend</h2>
            <div className="h-64 flex items-end justify-between gap-2">
              {monthlyTrend.map((month, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-cyan-500 rounded-t-lg transition-all hover:bg-cyan-600"
                    style={{ height: `${(month.patients / maxPatients) * 200}px` }}
                  ></div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{month.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Patient Outcomes Pie */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Patient Outcomes</h2>
            <div className="space-y-4">
              {patientOutcomes.map((outcome, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{outcome.outcome}</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{outcome.percentage}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        index === 0 ? 'bg-green-500' :
                        index === 1 ? 'bg-cyan-500' :
                        index === 2 ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${outcome.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Department Performance Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Department Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Patients</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Revenue</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Occupancy</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Satisfaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {departmentStats.map((dept, index) => (
                  <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                          <BuildingOffice2Icon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{dept.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-900 dark:text-white">{dept.patients.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-900 dark:text-white">${(dept.revenue / 1000000).toFixed(2)}M</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              dept.occupancy >= 90 ? 'bg-red-500' :
                              dept.occupancy >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${dept.occupancy}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">{dept.occupancy}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-medium text-slate-900 dark:text-white">{dept.satisfaction}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Procedures */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Top Procedures</h2>
              <BeakerIcon className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-4">
              {topProcedures.map((procedure, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{procedure.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{procedure.count.toLocaleString()} procedures</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900 dark:text-white">${(procedure.revenue / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Insights */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Key Insights</h2>
              <DocumentTextIcon className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-300">Revenue Growth</p>
                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">Revenue increased 15.7% compared to last period, driven by cardiology and surgery departments.</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <ClockIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900 dark:text-yellow-300">Wait Time Alert</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">Emergency department wait times are 12% higher than target. Consider additional staffing during peak hours.</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <HeartIcon className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-cyan-900 dark:text-cyan-300">Patient Satisfaction</p>
                    <p className="text-sm text-cyan-700 dark:text-cyan-400 mt-1">Overall satisfaction score of 4.5/5.0 - Pediatrics leading with highest ratings.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Banner */}
        <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl p-6 text-white">
          <h2 className="text-lg font-semibold mb-4">Monthly Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-cyan-100 text-sm">Total Admissions</p>
              <p className="text-3xl font-bold mt-1">2,847</p>
            </div>
            <div>
              <p className="text-cyan-100 text-sm">Discharge Rate</p>
              <p className="text-3xl font-bold mt-1">92.9%</p>
            </div>
            <div>
              <p className="text-cyan-100 text-sm">Surgeries Performed</p>
              <p className="text-3xl font-bold mt-1">423</p>
            </div>
            <div>
              <p className="text-cyan-100 text-sm">Staff Utilization</p>
              <p className="text-3xl font-bold mt-1">87.3%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
