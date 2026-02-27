'use client';

import { useState } from 'react';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  FireIcon,
  BeakerIcon,
  ShieldExclamationIcon,
  ClockIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  PrinterIcon,
  ShareIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

export default function EmergencyProtocolsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProtocol, setSelectedProtocol] = useState(null);

  const categories = [
    { id: 'all', name: 'All Protocols', icon: DocumentTextIcon, count: 24 },
    { id: 'cardiac', name: 'Cardiac', icon: HeartIcon, count: 6, color: 'red' },
    { id: 'trauma', name: 'Trauma', icon: ExclamationTriangleIcon, count: 8, color: 'orange' },
    { id: 'respiratory', name: 'Respiratory', icon: BeakerIcon, count: 4, color: 'blue' },
    { id: 'hazmat', name: 'HazMat', icon: ShieldExclamationIcon, count: 3, color: 'yellow' },
    { id: 'fire', name: 'Fire/Burn', icon: FireIcon, count: 3, color: 'orange' }
  ];

  const protocols = [
    {
      id: 1,
      title: 'Cardiac Arrest - Adult',
      category: 'cardiac',
      code: 'CARD-001',
      priority: 'critical',
      lastUpdated: '2024-01-10',
      version: '3.2',
      bookmarked: true,
      summary: 'Protocol for managing adult cardiac arrest including CPR, defibrillation, and ACLS algorithms.',
      steps: [
        'Confirm unresponsiveness and absence of pulse',
        'Begin high-quality CPR (100-120 compressions/min)',
        'Apply AED/defibrillator as soon as available',
        'Establish IV/IO access',
        'Administer epinephrine 1mg IV/IO every 3-5 minutes',
        'Consider advanced airway if trained',
        'Identify and treat reversible causes (Hs and Ts)'
      ]
    },
    {
      id: 2,
      title: 'STEMI Protocol',
      category: 'cardiac',
      code: 'CARD-002',
      priority: 'critical',
      lastUpdated: '2024-01-08',
      version: '2.1',
      bookmarked: false,
      summary: 'ST-Elevation Myocardial Infarction recognition and treatment protocol for pre-hospital care.',
      steps: [
        'Obtain 12-lead ECG within 10 minutes of patient contact',
        'Administer aspirin 324mg (chewed)',
        'Establish IV access',
        'Administer nitroglycerin if SBP > 90',
        'Transmit ECG to receiving facility',
        'Transport to PCI-capable facility',
        'Door-to-balloon time goal: < 90 minutes'
      ]
    },
    {
      id: 3,
      title: 'Severe Trauma - Adult',
      category: 'trauma',
      code: 'TRAU-001',
      priority: 'critical',
      lastUpdated: '2024-01-12',
      version: '4.0',
      bookmarked: true,
      summary: 'Comprehensive trauma assessment and management for adult patients with severe injuries.',
      steps: [
        'Scene safety assessment',
        'Primary survey: ABCDE',
        'Control life-threatening hemorrhage',
        'Cervical spine immobilization if indicated',
        'Establish large-bore IV access x2',
        'Administer TXA within 3 hours of injury',
        'Rapid transport to trauma center'
      ]
    },
    {
      id: 4,
      title: 'Respiratory Distress - Adult',
      category: 'respiratory',
      code: 'RESP-001',
      priority: 'high',
      lastUpdated: '2024-01-05',
      version: '2.5',
      bookmarked: false,
      summary: 'Assessment and treatment of acute respiratory distress in adult patients.',
      steps: [
        'Assess airway patency and breathing adequacy',
        'Position patient upright if tolerated',
        'Apply high-flow oxygen via NRB mask',
        'Obtain SpO2 and ETCO2 readings',
        'Administer bronchodilators if wheezing present',
        'Consider CPAP for pulmonary edema',
        'Prepare for advanced airway if deteriorating'
      ]
    },
    {
      id: 5,
      title: 'Chemical Exposure',
      category: 'hazmat',
      code: 'HAZ-001',
      priority: 'high',
      lastUpdated: '2023-12-20',
      version: '1.8',
      bookmarked: false,
      summary: 'Protocol for managing patients exposed to hazardous chemical substances.',
      steps: [
        'Ensure proper PPE before patient contact',
        'Remove patient from contaminated area',
        'Remove contaminated clothing',
        'Decontaminate with copious water irrigation',
        'Identify chemical agent if possible',
        'Contact Poison Control Center',
        'Provide supportive care based on agent'
      ]
    },
    {
      id: 6,
      title: 'Burn Injury Management',
      category: 'fire',
      code: 'BURN-001',
      priority: 'high',
      lastUpdated: '2024-01-02',
      version: '2.2',
      bookmarked: true,
      summary: 'Assessment and treatment of thermal burn injuries including fluid resuscitation.',
      steps: [
        'Stop the burning process',
        'Assess for airway involvement',
        'Estimate TBSA using Rule of Nines',
        'Establish IV access for burns > 20% TBSA',
        'Begin fluid resuscitation (Parkland formula)',
        'Cover burns with dry, sterile dressings',
        'Transport to burn center if criteria met'
      ]
    }
  ];

  const filteredProtocols = protocols.filter(protocol => {
    const matchesSearch = protocol.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         protocol.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || protocol.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const priorityColors = {
    critical: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Emergency Protocols</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Quick reference for emergency medical procedures</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
              <CheckCircleIcon className="w-4 h-4" />
              All protocols current
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search protocols by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 text-lg"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {categories.map((cat) => (
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
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                selectedCategory === cat.id
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}>{cat.count}</span>
            </button>
          ))}
        </div>

        {/* Protocol List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredProtocols.map((protocol) => (
            <div
              key={protocol.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedProtocol(protocol)}
            >
              <div className={`h-1 ${
                protocol.priority === 'critical' ? 'bg-red-500' :
                protocol.priority === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
              }`}></div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{protocol.code}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${priorityColors[protocol.priority]}`}>
                        {protocol.priority.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{protocol.title}</h3>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      // Toggle bookmark
                    }}
                    className="p-1"
                  >
                    {protocol.bookmarked ? (
                      <BookmarkSolidIcon className="w-5 h-5 text-cyan-600" />
                    ) : (
                      <BookmarkIcon className="w-5 h-5 text-slate-400 hover:text-cyan-600" />
                    )}
                  </button>
                </div>
                
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                  {protocol.summary}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      {protocol.lastUpdated}
                    </span>
                    <span>v{protocol.version}</span>
                  </div>
                  <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-medium">
                    View Protocol
                    <ChevronRightIcon className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProtocols.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl">
            <DocumentTextIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">No protocols found matching your criteria</p>
          </div>
        )}

        {/* Protocol Detail Modal */}
        {selectedProtocol && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedProtocol(null)}>
            <div 
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`h-2 ${
                selectedProtocol.priority === 'critical' ? 'bg-red-500' :
                selectedProtocol.priority === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
              }`}></div>
              
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-mono text-slate-500 dark:text-slate-400">{selectedProtocol.code}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${priorityColors[selectedProtocol.priority]}`}>
                        {selectedProtocol.priority.toUpperCase()}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedProtocol.title}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Version {selectedProtocol.version} • Last updated {selectedProtocol.lastUpdated}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                      <PrinterIcon className="w-5 h-5 text-slate-500" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                      <ShareIcon className="w-5 h-5 text-slate-500" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                      {selectedProtocol.bookmarked ? (
                        <BookmarkSolidIcon className="w-5 h-5 text-cyan-600" />
                      ) : (
                        <BookmarkIcon className="w-5 h-5 text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">Summary</h3>
                  <p className="text-slate-700 dark:text-slate-300">{selectedProtocol.summary}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase mb-4">Protocol Steps</h3>
                  <ol className="space-y-3">
                    {selectedProtocol.steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="text-slate-700 dark:text-slate-300 pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 dark:text-yellow-300">Important Note</h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                        Always follow local medical direction and protocols. Contact medical control for any questions or deviations from standard protocol.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                <button 
                  onClick={() => setSelectedProtocol(null)}
                  className="w-full py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
                >
                  Close Protocol
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
