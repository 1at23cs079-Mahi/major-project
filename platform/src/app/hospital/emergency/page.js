'use client';

import { useState } from 'react';
import {
  ExclamationTriangleIcon,
  HeartIcon,
  UserGroupIcon,
  ClockIcon,
  MapPinIcon,
  PhoneIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  BellAlertIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function HospitalEmergencyPage() {
  const [selectedBay, setSelectedBay] = useState(null);

  const emergencyBays = [
    { id: 'ER-01', status: 'occupied', patient: 'John D.', condition: 'Cardiac', severity: 'critical', arrivalTime: '09:15', waitTime: null, doctor: 'Dr. Smith' },
    { id: 'ER-02', status: 'occupied', patient: 'Sarah M.', condition: 'Trauma', severity: 'critical', arrivalTime: '09:30', waitTime: null, doctor: 'Dr. Chen' },
    { id: 'ER-03', status: 'available', patient: null, condition: null, severity: null, arrivalTime: null, waitTime: null, doctor: null },
    { id: 'ER-04', status: 'occupied', patient: 'Mike R.', condition: 'Respiratory', severity: 'urgent', arrivalTime: '09:45', waitTime: null, doctor: 'Dr. Wilson' },
    { id: 'ER-05', status: 'cleaning', patient: null, condition: null, severity: null, arrivalTime: null, waitTime: '10 min', doctor: null },
    { id: 'ER-06', status: 'occupied', patient: 'Emily K.', condition: 'Abdominal', severity: 'moderate', arrivalTime: '10:00', waitTime: null, doctor: 'Dr. Brown' },
    { id: 'ER-07', status: 'available', patient: null, condition: null, severity: null, arrivalTime: null, waitTime: null, doctor: null },
    { id: 'ER-08', status: 'occupied', patient: 'David L.', condition: 'Neurological', severity: 'critical', arrivalTime: '10:15', waitTime: null, doctor: 'Dr. Taylor' },
    { id: 'ER-09', status: 'maintenance', patient: null, condition: null, severity: null, arrivalTime: null, waitTime: 'N/A', doctor: null },
    { id: 'ER-10', status: 'occupied', patient: 'Lisa P.', condition: 'Orthopedic', severity: 'moderate', arrivalTime: '10:30', waitTime: null, doctor: 'Dr. Anderson' },
    { id: 'ER-11', status: 'available', patient: null, condition: null, severity: null, arrivalTime: null, waitTime: null, doctor: null },
    { id: 'ER-12', status: 'occupied', patient: 'James W.', condition: 'Burns', severity: 'urgent', arrivalTime: '10:45', waitTime: null, doctor: 'Dr. Martinez' }
  ];

  const waitingPatients = [
    { id: 1, name: 'Robert H.', condition: 'Chest Pain', severity: 'urgent', waitTime: '15 min', triage: 2 },
    { id: 2, name: 'Anna S.', condition: 'Laceration', severity: 'moderate', waitTime: '25 min', triage: 3 },
    { id: 3, name: 'Chris B.', condition: 'Fever', severity: 'low', waitTime: '45 min', triage: 4 },
    { id: 4, name: 'Nancy T.', condition: 'Allergic Reaction', severity: 'urgent', waitTime: '10 min', triage: 2 },
    { id: 5, name: 'Peter K.', condition: 'Sprain', severity: 'low', waitTime: '55 min', triage: 5 }
  ];

  const incomingAmbulances = [
    { id: 'AMB-001', eta: '3 min', patient: 'Unknown', condition: 'MVA - Multiple Trauma', severity: 'critical' },
    { id: 'AMB-003', eta: '8 min', patient: 'Female, 65', condition: 'Stroke Symptoms', severity: 'critical' }
  ];

  const statusConfig = {
    occupied: { color: 'red', label: 'Occupied' },
    available: { color: 'green', label: 'Available' },
    cleaning: { color: 'yellow', label: 'Cleaning' },
    maintenance: { color: 'slate', label: 'Maintenance' }
  };

  const severityConfig = {
    critical: { color: 'red', label: 'Critical' },
    urgent: { color: 'orange', label: 'Urgent' },
    moderate: { color: 'yellow', label: 'Moderate' },
    low: { color: 'green', label: 'Low' }
  };

  const stats = {
    available: emergencyBays.filter(b => b.status === 'available').length,
    occupied: emergencyBays.filter(b => b.status === 'occupied').length,
    critical: emergencyBays.filter(b => b.severity === 'critical').length,
    avgWait: '23 min'
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Emergency Department Grid</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Real-time ER capacity and patient monitoring</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live Updates
            </span>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
              <ArrowPathIcon className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Incoming Ambulances Alert */}
        {incomingAmbulances.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <TruckIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              <h2 className="font-semibold text-red-900 dark:text-red-300">Incoming Ambulances ({incomingAmbulances.length})</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {incomingAmbulances.map((amb) => (
                <div key={amb.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <TruckIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{amb.id}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{amb.condition}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">ETA: {amb.eta}</p>
                    <p className={`text-xs px-2 py-0.5 rounded-full bg-${severityConfig[amb.severity].color}-100 dark:bg-${severityConfig[amb.severity].color}-900/30 text-${severityConfig[amb.severity].color}-700 dark:text-${severityConfig[amb.severity].color}-400`}>
                      {severityConfig[amb.severity].label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Available Bays</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{stats.available}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Occupied Bays</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">{stats.occupied}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Critical Patients</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">{stats.critical}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <HeartIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Avg. Wait Time</p>
                <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">{stats.avgWait}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
          </div>
        </div>

        {/* ER Bay Grid */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Emergency Bay Status</h2>
            <div className="flex items-center gap-4 text-sm">
              {Object.entries(statusConfig).map(([key, config]) => (
                <span key={key} className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded-full bg-${config.color}-500`}></span>
                  {config.label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {emergencyBays.map((bay) => (
              <div
                key={bay.id}
                onClick={() => bay.status === 'occupied' && setSelectedBay(bay)}
                className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  bay.status === 'occupied' 
                    ? `border-${severityConfig[bay.severity]?.color || 'slate'}-500 bg-${severityConfig[bay.severity]?.color || 'slate'}-50 dark:bg-${severityConfig[bay.severity]?.color || 'slate'}-900/20 hover:shadow-md` 
                    : bay.status === 'available'
                    ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                    : bay.status === 'cleaning'
                    ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20'
                    : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 dark:text-white">{bay.id}</span>
                  <span className={`w-3 h-3 rounded-full ${
                    bay.status === 'occupied' && bay.severity === 'critical' ? 'bg-red-500 animate-pulse' :
                    `bg-${statusConfig[bay.status].color}-500`
                  }`}></span>
                </div>
                
                {bay.status === 'occupied' ? (
                  <>
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{bay.patient}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{bay.condition}</p>
                    <div className={`mt-2 px-2 py-0.5 rounded text-xs font-medium inline-block bg-${severityConfig[bay.severity].color}-100 dark:bg-${severityConfig[bay.severity].color}-900/30 text-${severityConfig[bay.severity].color}-700 dark:text-${severityConfig[bay.severity].color}-400`}>
                      {severityConfig[bay.severity].label}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{statusConfig[bay.status].label}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Waiting Room */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Waiting Room ({waitingPatients.length})</h2>
            <button className="text-sm text-cyan-600 hover:text-cyan-700 font-medium">View All</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Patient</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Condition</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Triage</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Wait Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {waitingPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 dark:text-white">{patient.name}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{patient.condition}</td>
                    <td className="px-4 py-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        patient.triage <= 2 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        patient.triage === 3 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {patient.triage}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <ClockIcon className="w-4 h-4" />
                        {patient.waitTime}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium bg-${severityConfig[patient.severity].color}-100 dark:bg-${severityConfig[patient.severity].color}-900/30 text-${severityConfig[patient.severity].color}-700 dark:text-${severityConfig[patient.severity].color}-400`}>
                        {severityConfig[patient.severity].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bay Detail Modal */}
        {selectedBay && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedBay(null)}>
            <div 
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`h-2 rounded-t-2xl bg-${severityConfig[selectedBay.severity]?.color || 'slate'}-500`}></div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-sm text-slate-500">{selectedBay.id}</p>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedBay.patient}</h2>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium bg-${severityConfig[selectedBay.severity].color}-100 dark:bg-${severityConfig[selectedBay.severity].color}-900/30 text-${severityConfig[selectedBay.severity].color}-700 dark:text-${severityConfig[selectedBay.severity].color}-400`}>
                    {severityConfig[selectedBay.severity].label}
                  </span>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Condition</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedBay.condition}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Arrival Time</p>
                      <p className="font-medium text-slate-900 dark:text-white">{selectedBay.arrivalTime}</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Attending Physician</p>
                      <p className="font-medium text-slate-900 dark:text-white">{selectedBay.doctor}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium">
                    View Full Record
                  </button>
                  <button 
                    onClick={() => setSelectedBay(null)}
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
