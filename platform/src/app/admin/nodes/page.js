'use client';

import { useState } from 'react';
import {
  ServerStackIcon,
  SignalIcon,
  CpuChipIcon,
  CircleStackIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ChartBarIcon,
  GlobeAltIcon,
  ClockIcon,
  CogIcon
} from '@heroicons/react/24/outline';

export default function AdminNodesPage() {
  const [selectedNode, setSelectedNode] = useState(null);

  const nodes = [
    {
      id: 'node-1',
      name: 'Primary Node',
      type: 'Master',
      status: 'online',
      ip: '192.168.1.100',
      location: 'US-East',
      cpu: 45,
      memory: 62,
      storage: 38,
      uptime: '99.9%',
      lastSync: '2 seconds ago',
      connections: 156
    },
    {
      id: 'node-2',
      name: 'Secondary Node',
      type: 'Replica',
      status: 'online',
      ip: '192.168.1.101',
      location: 'US-West',
      cpu: 32,
      memory: 48,
      storage: 35,
      uptime: '99.8%',
      lastSync: '5 seconds ago',
      connections: 89
    },
    {
      id: 'node-3',
      name: 'Backup Node',
      type: 'Replica',
      status: 'online',
      ip: '192.168.1.102',
      location: 'EU-West',
      cpu: 28,
      memory: 41,
      storage: 32,
      uptime: '99.7%',
      lastSync: '8 seconds ago',
      connections: 45
    },
    {
      id: 'node-4',
      name: 'Analytics Node',
      type: 'Worker',
      status: 'warning',
      ip: '192.168.1.103',
      location: 'US-East',
      cpu: 78,
      memory: 85,
      storage: 67,
      uptime: '98.5%',
      lastSync: '1 minute ago',
      connections: 23
    },
    {
      id: 'node-5',
      name: 'Archive Node',
      type: 'Storage',
      status: 'offline',
      ip: '192.168.1.104',
      location: 'US-Central',
      cpu: 0,
      memory: 0,
      storage: 89,
      uptime: '95.2%',
      lastSync: '15 minutes ago',
      connections: 0
    }
  ];

  const statusConfig = {
    online: { color: 'green', icon: CheckCircleIcon, label: 'Online' },
    warning: { color: 'yellow', icon: ExclamationTriangleIcon, label: 'Warning' },
    offline: { color: 'red', icon: XCircleIcon, label: 'Offline' }
  };

  const networkStats = [
    { label: 'Total Nodes', value: nodes.length, icon: ServerStackIcon, color: 'cyan' },
    { label: 'Online', value: nodes.filter(n => n.status === 'online').length, icon: CheckCircleIcon, color: 'green' },
    { label: 'Warnings', value: nodes.filter(n => n.status === 'warning').length, icon: ExclamationTriangleIcon, color: 'yellow' },
    { label: 'Offline', value: nodes.filter(n => n.status === 'offline').length, icon: XCircleIcon, color: 'red' }
  ];

  const getProgressColor = (value) => {
    if (value < 50) return 'bg-green-500';
    if (value < 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Node Mesh Management</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Monitor and manage distributed nodes</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
              <ArrowPathIcon className="w-5 h-5" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
              <ServerStackIcon className="w-5 h-5" />
              Add Node
            </button>
          </div>
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {networkStats.map((stat, index) => (
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

        {/* Network Topology Visualization */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Network Topology</h2>
          <div className="relative h-64 bg-slate-50 dark:bg-slate-700/50 rounded-lg overflow-hidden">
            {/* Simple visualization */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Center Master Node */}
                <div className="w-20 h-20 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold shadow-lg z-10 relative">
                  Master
                </div>
                
                {/* Connected Nodes */}
                {[0, 1, 2, 3].map((i) => {
                  const angle = (i * 90) * (Math.PI / 180);
                  const x = Math.cos(angle) * 100;
                  const y = Math.sin(angle) * 80;
                  const node = nodes[i + 1];
                  const isOnline = node?.status === 'online';
                  
                  return (
                    <div key={i}>
                      {/* Connection Line */}
                      <div 
                        className={`absolute w-24 h-0.5 ${isOnline ? 'bg-green-400' : 'bg-slate-300'} origin-left`}
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: `rotate(${i * 90}deg)`
                        }}
                      />
                      {/* Node Circle */}
                      <div
                        className={`absolute w-12 h-12 rounded-full ${
                          node?.status === 'online' ? 'bg-green-500' : 
                          node?.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        } flex items-center justify-center text-white text-xs font-medium shadow-md`}
                        style={{
                          left: `calc(50% + ${x}px - 24px)`,
                          top: `calc(50% + ${y}px - 24px)`
                        }}
                      >
                        N{i + 2}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Node List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">All Nodes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Node</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">CPU</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Memory</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Storage</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Uptime</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {nodes.map((node) => {
                  const StatusIcon = statusConfig[node.status].icon;
                  return (
                    <tr 
                      key={node.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                      onClick={() => setSelectedNode(node)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                            <ServerStackIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{node.name}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{node.ip} • {node.location}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-5 h-5 text-${statusConfig[node.status].color}-500`} />
                          <span className={`text-sm font-medium text-${statusConfig[node.status].color}-600 dark:text-${statusConfig[node.status].color}-400`}>
                            {statusConfig[node.status].label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-24">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">{node.cpu}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full ${getProgressColor(node.cpu)} rounded-full`} style={{ width: `${node.cpu}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-24">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">{node.memory}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full ${getProgressColor(node.memory)} rounded-full`} style={{ width: `${node.memory}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-24">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">{node.storage}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full ${getProgressColor(node.storage)} rounded-full`} style={{ width: `${node.storage}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-900 dark:text-white">{node.uptime}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg" title="Settings">
                            <CogIcon className="w-4 h-4 text-slate-500" />
                          </button>
                          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg" title="Restart">
                            <ArrowPathIcon className="w-4 h-4 text-slate-500" />
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

        {/* Node Detail Modal */}
        {selectedNode && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedNode(null)}>
            <div 
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                    <ServerStackIcon className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedNode.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400">{selectedNode.type} • {selectedNode.ip}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-${statusConfig[selectedNode.status].color}-100 dark:bg-${statusConfig[selectedNode.status].color}-900/30`}>
                  {(() => {
                    const StatusIcon = statusConfig[selectedNode.status].icon;
                    return <StatusIcon className={`w-4 h-4 text-${statusConfig[selectedNode.status].color}-600`} />;
                  })()}
                  <span className={`text-sm font-medium text-${statusConfig[selectedNode.status].color}-700 dark:text-${statusConfig[selectedNode.status].color}-400`}>
                    {statusConfig[selectedNode.status].label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                  <CpuChipIcon className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedNode.cpu}%</p>
                  <p className="text-xs text-slate-500">CPU Usage</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                  <ChartBarIcon className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedNode.memory}%</p>
                  <p className="text-xs text-slate-500">Memory</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                  <CircleStackIcon className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedNode.storage}%</p>
                  <p className="text-xs text-slate-500">Storage</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                  <SignalIcon className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{selectedNode.connections}</p>
                  <p className="text-xs text-slate-500">Connections</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <GlobeAltIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Location</span>
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedNode.location}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <ClockIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Last Sync</span>
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedNode.lastSync}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium">
                  View Logs
                </button>
                <button className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium">
                  Restart Node
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
