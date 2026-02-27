'use client';

import { useState } from 'react';
import {
  TrashIcon,
  BeakerIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  MapPinIcon,
  ScaleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

export default function HospitalWastePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const wasteCategories = [
    { id: 'all', name: 'All Waste', icon: TrashIcon },
    { id: 'biohazard', name: 'Biohazardous', icon: ShieldExclamationIcon, color: 'red' },
    { id: 'sharps', name: 'Sharps', icon: ExclamationTriangleIcon, color: 'orange' },
    { id: 'pharmaceutical', name: 'Pharmaceutical', icon: BeakerIcon, color: 'purple' },
    { id: 'general', name: 'General Medical', icon: TrashIcon, color: 'blue' },
    { id: 'recyclable', name: 'Recyclable', icon: ArrowPathIcon, color: 'green' }
  ];

  const containers = [
    {
      id: 'BIO-001',
      type: 'biohazard',
      location: 'ER - Bay 1',
      capacity: 85,
      lastCollected: '2024-01-15 06:00',
      nextCollection: '2024-01-15 18:00',
      status: 'near-full'
    },
    {
      id: 'SHP-001',
      type: 'sharps',
      location: 'Surgery - OR 2',
      capacity: 65,
      lastCollected: '2024-01-15 08:00',
      nextCollection: '2024-01-16 08:00',
      status: 'normal'
    },
    {
      id: 'BIO-002',
      type: 'biohazard',
      location: 'ICU - Room 3',
      capacity: 92,
      lastCollected: '2024-01-15 06:00',
      nextCollection: '2024-01-15 14:00',
      status: 'critical'
    },
    {
      id: 'PHR-001',
      type: 'pharmaceutical',
      location: 'Pharmacy',
      capacity: 45,
      lastCollected: '2024-01-14 16:00',
      nextCollection: '2024-01-17 16:00',
      status: 'normal'
    },
    {
      id: 'GEN-001',
      type: 'general',
      location: 'Ward A - Nursing Station',
      capacity: 70,
      lastCollected: '2024-01-15 07:00',
      nextCollection: '2024-01-15 19:00',
      status: 'normal'
    },
    {
      id: 'RCY-001',
      type: 'recyclable',
      location: 'Cafeteria',
      capacity: 55,
      lastCollected: '2024-01-15 05:00',
      nextCollection: '2024-01-15 17:00',
      status: 'normal'
    },
    {
      id: 'SHP-002',
      type: 'sharps',
      location: 'Lab - Blood Draw',
      capacity: 88,
      lastCollected: '2024-01-15 06:00',
      nextCollection: '2024-01-15 15:00',
      status: 'near-full'
    },
    {
      id: 'BIO-003',
      type: 'biohazard',
      location: 'Oncology - Treatment',
      capacity: 40,
      lastCollected: '2024-01-15 10:00',
      nextCollection: '2024-01-16 10:00',
      status: 'normal'
    }
  ];

  const recentPickups = [
    { id: 1, container: 'BIO-001', type: 'biohazard', weight: '12.5 kg', time: '06:00 AM', handler: 'Team A' },
    { id: 2, container: 'SHP-001', type: 'sharps', weight: '3.2 kg', time: '08:00 AM', handler: 'Team B' },
    { id: 3, container: 'GEN-001', type: 'general', weight: '8.7 kg', time: '07:00 AM', handler: 'Team A' },
    { id: 4, container: 'RCY-001', type: 'recyclable', weight: '15.3 kg', time: '05:00 AM', handler: 'Team C' }
  ];

  const typeConfig = {
    biohazard: { color: 'red', label: 'Biohazardous', icon: ShieldExclamationIcon },
    sharps: { color: 'orange', label: 'Sharps', icon: ExclamationTriangleIcon },
    pharmaceutical: { color: 'purple', label: 'Pharmaceutical', icon: BeakerIcon },
    general: { color: 'blue', label: 'General', icon: TrashIcon },
    recyclable: { color: 'green', label: 'Recyclable', icon: ArrowPathIcon }
  };

  const statusConfig = {
    normal: { color: 'green', label: 'Normal' },
    'near-full': { color: 'yellow', label: 'Near Full' },
    critical: { color: 'red', label: 'Critical' }
  };

  const filteredContainers = containers.filter(c => 
    selectedCategory === 'all' || c.type === selectedCategory
  );

  const stats = [
    { label: 'Total Containers', value: containers.length, icon: TrashIcon, color: 'cyan' },
    { label: 'Critical Level', value: containers.filter(c => c.status === 'critical').length, icon: ExclamationTriangleIcon, color: 'red' },
    { label: 'Today\'s Pickups', value: recentPickups.length, icon: TruckIcon, color: 'green' },
    { label: 'Total Weight', value: '39.7 kg', icon: ScaleIcon, color: 'blue' }
  ];

  const getCapacityColor = (capacity) => {
    if (capacity >= 90) return 'red';
    if (capacity >= 70) return 'yellow';
    return 'green';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Waste Management</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Medical waste tracking and disposal management</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
              <DocumentTextIcon className="w-5 h-5" />
              Generate Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
              <TruckIcon className="w-5 h-5" />
              Schedule Pickup
            </button>
          </div>
        </div>

        {/* Critical Alerts */}
        {containers.filter(c => c.status === 'critical').length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              <div>
                <h2 className="font-semibold text-red-900 dark:text-red-300">Critical Containers</h2>
                <p className="text-sm text-red-700 dark:text-red-400">
                  {containers.filter(c => c.status === 'critical').length} container(s) require immediate attention
                </p>
              </div>
            </div>
          </div>
        )}

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

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {wasteCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <cat.icon className="w-5 h-5" />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Container Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredContainers.map((container) => {
            const TypeIcon = typeConfig[container.type].icon;
            const capacityColor = getCapacityColor(container.capacity);
            
            return (
              <div
                key={container.id}
                className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden ${
                  container.status === 'critical' ? 'ring-2 ring-red-500' : ''
                }`}
              >
                <div className={`h-2 bg-${typeConfig[container.type].color}-500`}></div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-lg bg-${typeConfig[container.type].color}-100 dark:bg-${typeConfig[container.type].color}-900/30 flex items-center justify-center`}>
                        <TypeIcon className={`w-5 h-5 text-${typeConfig[container.type].color}-600 dark:text-${typeConfig[container.type].color}-400`} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{container.id}</p>
                        <p className={`text-xs text-${typeConfig[container.type].color}-600 dark:text-${typeConfig[container.type].color}-400`}>
                          {typeConfig[container.type].label}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${statusConfig[container.status].color}-100 dark:bg-${statusConfig[container.status].color}-900/30 text-${statusConfig[container.status].color}-700 dark:text-${statusConfig[container.status].color}-400`}>
                      {statusConfig[container.status].label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-3">
                    <MapPinIcon className="w-4 h-4" />
                    <span className="truncate">{container.location}</span>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-500 dark:text-slate-400">Capacity</span>
                      <span className={`font-bold text-${capacityColor}-600 dark:text-${capacityColor}-400`}>{container.capacity}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-${capacityColor}-500 rounded-full transition-all`}
                        style={{ width: `${container.capacity}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      Next: {container.nextCollection.split(' ')[1]}
                    </span>
                    <button className="text-cyan-600 hover:text-cyan-700 font-medium">Request Pickup</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Pickups & Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Pickups */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Pickups</h2>
              <TruckIcon className="w-5 h-5 text-slate-400" />
            </div>
            <div className="space-y-3">
              {recentPickups.map((pickup) => (
                <div key={pickup.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-${typeConfig[pickup.type].color}-100 dark:bg-${typeConfig[pickup.type].color}-900/30 flex items-center justify-center`}>
                      {(() => {
                        const Icon = typeConfig[pickup.type].icon;
                        return <Icon className={`w-5 h-5 text-${typeConfig[pickup.type].color}-600 dark:text-${typeConfig[pickup.type].color}-400`} />;
                      })()}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{pickup.container}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{pickup.handler} • {pickup.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-900 dark:text-white">{pickup.weight}</p>
                    <p className="text-xs text-slate-500">{typeConfig[pickup.type].label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Status */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Compliance Status</h2>
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900 dark:text-green-300">EPA Regulations</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-400">All biohazardous waste properly segregated and disposed</p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900 dark:text-green-300">OSHA Standards</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-400">Sharps containers meeting all safety requirements</p>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <ClockIcon className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-900 dark:text-yellow-300">Annual Audit</span>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">Due in 45 days - Schedule inspection</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Last Inspection</span>
                <span className="text-slate-900 dark:text-white">January 5, 2024</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-slate-500 dark:text-slate-400">Inspection Score</span>
                <span className="text-green-600 dark:text-green-400 font-bold">98/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
