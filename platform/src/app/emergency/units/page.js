'use client';

import { useState, useEffect } from 'react';
import {
  TruckIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  UserGroupIcon,
  HeartIcon,
  BoltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  SignalIcon
} from '@heroicons/react/24/outline';

export default function EmergencyUnitsPage() {
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const units = [
    {
      id: 'AMB-001',
      name: 'Ambulance Unit 1',
      type: 'ALS',
      status: 'responding',
      crew: ['John Smith (Paramedic)', 'Emily Davis (EMT)'],
      currentLocation: '42nd Street & Broadway',
      destination: 'City General Hospital',
      eta: '5 mins',
      patient: { name: 'Michael Chen', condition: 'Cardiac Emergency', age: 62 },
      lastUpdate: '30 seconds ago'
    },
    {
      id: 'AMB-002',
      name: 'Ambulance Unit 2',
      type: 'BLS',
      status: 'available',
      crew: ['Sarah Wilson (EMT)', 'Robert Lee (EMT)'],
      currentLocation: 'Station 5 - Downtown',
      destination: null,
      eta: null,
      patient: null,
      lastUpdate: '1 minute ago'
    },
    {
      id: 'AMB-003',
      name: 'Ambulance Unit 3',
      type: 'ALS',
      status: 'at-scene',
      crew: ['James Brown (Paramedic)', 'Lisa Taylor (Paramedic)'],
      currentLocation: '125 Oak Street',
      destination: 'Memorial Hospital',
      eta: '12 mins',
      patient: { name: 'Anna Williams', condition: 'Trauma - Fall', age: 78 },
      lastUpdate: '2 minutes ago'
    },
    {
      id: 'AMB-004',
      name: 'Ambulance Unit 4',
      type: 'BLS',
      status: 'transporting',
      crew: ['Mark Johnson (EMT)', 'Karen White (EMT)'],
      currentLocation: 'En Route - Highway 101',
      destination: 'University Medical Center',
      eta: '8 mins',
      patient: { name: 'David Brown', condition: 'Respiratory Distress', age: 45 },
      lastUpdate: '45 seconds ago'
    },
    {
      id: 'AMB-005',
      name: 'Ambulance Unit 5',
      type: 'ALS',
      status: 'maintenance',
      crew: [],
      currentLocation: 'Station 2 - Maintenance Bay',
      destination: null,
      eta: null,
      patient: null,
      lastUpdate: '15 minutes ago'
    },
    {
      id: 'AMB-006',
      name: 'Ambulance Unit 6',
      type: 'MICU',
      status: 'available',
      crew: ['Dr. Amanda Clark', 'Peter Evans (Paramedic)', 'Nancy Adams (RN)'],
      currentLocation: 'Station 1 - Main',
      destination: null,
      eta: null,
      patient: null,
      lastUpdate: '3 minutes ago'
    }
  ];

  const statusConfig = {
    available: { color: 'green', label: 'Available', bg: 'bg-green-500' },
    responding: { color: 'yellow', label: 'Responding', bg: 'bg-yellow-500' },
    'at-scene': { color: 'orange', label: 'At Scene', bg: 'bg-orange-500' },
    transporting: { color: 'blue', label: 'Transporting', bg: 'bg-blue-500' },
    maintenance: { color: 'slate', label: 'Maintenance', bg: 'bg-slate-500' }
  };

  const typeConfig = {
    ALS: { label: 'Advanced Life Support', color: 'cyan' },
    BLS: { label: 'Basic Life Support', color: 'green' },
    MICU: { label: 'Mobile ICU', color: 'purple' }
  };

  const filteredUnits = units.filter(unit => 
    filterStatus === 'all' || unit.status === filterStatus
  );

  const stats = [
    { label: 'Total Units', value: units.length, icon: TruckIcon, color: 'cyan' },
    { label: 'Available', value: units.filter(u => u.status === 'available').length, icon: CheckCircleIcon, color: 'green' },
    { label: 'Active Calls', value: units.filter(u => ['responding', 'at-scene', 'transporting'].includes(u.status)).length, icon: BoltIcon, color: 'yellow' },
    { label: 'In Maintenance', value: units.filter(u => u.status === 'maintenance').length, icon: ExclamationTriangleIcon, color: 'slate' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Emergency Unit Tracking</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Real-time monitoring of emergency response units</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live Tracking
            </span>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
              <ArrowPathIcon className="w-5 h-5" />
              Refresh
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
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30 flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Map Placeholder */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Live Map View</h2>
          </div>
          <div className="h-64 bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <div className="text-center">
              <MapPinIcon className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-500 dark:text-slate-400">Interactive map showing unit locations</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">Integration with mapping service required</p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {['all', 'available', 'responding', 'at-scene', 'transporting', 'maintenance'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                filterStatus === status
                  ? 'bg-cyan-600 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {status === 'all' ? 'All Units' : statusConfig[status]?.label || status}
            </button>
          ))}
        </div>

        {/* Unit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUnits.map((unit) => (
            <div
              key={unit.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedUnit(unit)}
            >
              <div className={`h-2 ${statusConfig[unit.status].bg}`}></div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{unit.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{unit.id}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium bg-${typeConfig[unit.type].color}-100 dark:bg-${typeConfig[unit.type].color}-900/30 text-${typeConfig[unit.type].color}-700 dark:text-${typeConfig[unit.type].color}-400`}>
                    {unit.type}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPinIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400 truncate">{unit.currentLocation}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <UserGroupIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">{unit.crew.length} crew members</span>
                  </div>
                  {unit.eta && (
                    <div className="flex items-center gap-2 text-sm">
                      <ClockIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">ETA: {unit.eta}</span>
                    </div>
                  )}
                </div>

                {unit.patient && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <HeartIcon className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-red-700 dark:text-red-400">Active Patient</span>
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-400">{unit.patient.condition}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium bg-${statusConfig[unit.status].color}-100 dark:bg-${statusConfig[unit.status].color}-900/30 text-${statusConfig[unit.status].color}-700 dark:text-${statusConfig[unit.status].color}-400`}>
                    {statusConfig[unit.status].label}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <SignalIcon className="w-3 h-3" />
                    {unit.lastUpdate}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Unit Detail Modal */}
        {selectedUnit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUnit(null)}>
            <div 
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`h-3 ${statusConfig[selectedUnit.status].bg} rounded-t-2xl`}></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedUnit.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400">{selectedUnit.id} • {typeConfig[selectedUnit.type].label}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium bg-${statusConfig[selectedUnit.status].color}-100 dark:bg-${statusConfig[selectedUnit.status].color}-900/30 text-${statusConfig[selectedUnit.status].color}-700 dark:text-${statusConfig[selectedUnit.status].color}-400`}>
                    {statusConfig[selectedUnit.status].label}
                  </span>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Current Location</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedUnit.currentLocation}</p>
                  </div>

                  {selectedUnit.destination && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Destination</p>
                      <p className="font-medium text-slate-900 dark:text-white">{selectedUnit.destination}</p>
                      {selectedUnit.eta && <p className="text-sm text-cyan-600 dark:text-cyan-400 mt-1">ETA: {selectedUnit.eta}</p>}
                    </div>
                  )}

                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-2">Crew Members</p>
                    {selectedUnit.crew.length > 0 ? (
                      <ul className="space-y-1">
                        {selectedUnit.crew.map((member, idx) => (
                          <li key={idx} className="text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <UserGroupIcon className="w-4 h-4 text-slate-400" />
                            {member}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">No crew assigned</p>
                    )}
                  </div>

                  {selectedUnit.patient && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <HeartIcon className="w-5 h-5 text-red-500" />
                        <span className="font-medium text-red-700 dark:text-red-400">Patient Information</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-red-600/70 dark:text-red-400/70">Name</p>
                          <p className="text-red-700 dark:text-red-300">{selectedUnit.patient.name}</p>
                        </div>
                        <div>
                          <p className="text-red-600/70 dark:text-red-400/70">Age</p>
                          <p className="text-red-700 dark:text-red-300">{selectedUnit.patient.age} years</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-red-600/70 dark:text-red-400/70">Condition</p>
                          <p className="text-red-700 dark:text-red-300 font-medium">{selectedUnit.patient.condition}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium">
                    <PhoneIcon className="w-4 h-4" />
                    Contact Unit
                  </button>
                  <button 
                    onClick={() => setSelectedUnit(null)}
                    className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
