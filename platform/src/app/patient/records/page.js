"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Eye, Calendar, Filter, Search,
  ShieldCheck, Clock, User, Stethoscope, Loader2, ChevronRight
} from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';

export default function PatientRecordsPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const records = [
    { 
      id: 1, 
      type: 'Lab Report', 
      title: 'Complete Blood Count (CBC)', 
      date: '2025-12-15', 
      provider: 'City Labs', 
      doctor: 'Dr. Smith',
      status: 'verified',
      category: 'lab'
    },
    { 
      id: 2, 
      type: 'Prescription', 
      title: 'Amoxicillin 500mg', 
      date: '2025-12-10', 
      provider: 'Metro Hospital', 
      doctor: 'Dr. Johnson',
      status: 'verified',
      category: 'prescription'
    },
    { 
      id: 3, 
      type: 'Imaging', 
      title: 'Chest X-Ray', 
      date: '2025-11-28', 
      provider: 'Radiology Center', 
      doctor: 'Dr. Wilson',
      status: 'verified',
      category: 'imaging'
    },
    { 
      id: 4, 
      type: 'Consultation', 
      title: 'Annual Physical Exam', 
      date: '2025-11-15', 
      provider: 'Family Clinic', 
      doctor: 'Dr. Brown',
      status: 'verified',
      category: 'consultation'
    },
    { 
      id: 5, 
      type: 'Vaccination', 
      title: 'Flu Shot', 
      date: '2025-10-20', 
      provider: 'Community Health', 
      doctor: 'Nurse Adams',
      status: 'verified',
      category: 'vaccination'
    },
  ];

  const filteredRecords = records.filter(record => {
    const matchesFilter = filter === 'all' || record.category === filter;
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.provider.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <DashboardShell role="patient">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4 text-health-teal">
            <div className="w-10 h-10 rounded-2xl bg-health-teal/10 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Medical Records Vault</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">MY RECORDS</h1>
          <p className="text-slate-500 font-medium">Access and manage your complete medical history with blockchain verification.</p>
        </header>

        {/* Filters & Search */}
        <div className="glass rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {['all', 'lab', 'prescription', 'imaging', 'consultation', 'vaccination'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  filter === f
                    ? 'bg-health-teal text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-health-teal/10'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-12 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Records List */}
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <motion.div
              key={record.id}
              whileHover={{ y: -2 }}
              className="glass rounded-2xl p-6 cursor-pointer group"
              onClick={() => setSelectedRecord(record)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-health-teal/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-health-teal" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-health-teal transition-colors">
                      {record.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {record.provider}
                      </span>
                      <span className="flex items-center gap-1">
                        <Stethoscope className="w-4 h-4" />
                        {record.doctor}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-health-teal/10 text-health-teal text-xs font-bold rounded-full">
                    {record.type}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-trust-verified">
                    <ShieldCheck className="w-4 h-4" /> Verified
                  </span>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <Eye className="w-5 h-5 text-slate-400" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <Download className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No Records Found</h3>
            <p className="text-slate-500">Try adjusting your filters or search term.</p>
          </div>
        )}

        {/* Blockchain Verification */}
        <div className="glass rounded-2xl p-6 mt-8 border-l-4 border-trust-verified">
          <div className="flex items-center gap-4">
            <ShieldCheck className="w-8 h-8 text-trust-verified" />
            <div>
              <h3 className="font-bold">Blockchain Verified Records</h3>
              <p className="text-sm text-slate-500">
                All medical records are cryptographically secured on the HealthChain network. 
                Each record has an immutable audit trail for complete transparency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
