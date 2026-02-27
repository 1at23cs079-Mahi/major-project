"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Siren, ShieldAlert, Activity, Users, Zap, Info, X, AlertTriangle, Hammer, Bone, Thermometer } from 'lucide-react';
import useConfigStore from '@/store/useConfigStore';
import DashboardShell from '@/components/layout/DashboardShell';

export default function CrisisConsole() {
    const [crisisType, setCrisisType] = useState(null); // 'mass-casualty', 'pandemic', 'natural-disaster'
    const { setCrisisMode } = useConfigStore();

    const playbooks = [
        {
            id: 'mass-casualty',
            title: 'Mass Casualty Event',
            icon: Users,
            color: 'bg-emergency-red',
            desc: 'Activate triage mesh, bypass non-critical consent, and lock ICU allocations.',
            impact: 'Critical Response',
            protocols: ['Triage-4 Protocol', 'Aero-Med Dispatch', 'Trauma-Node Sync']
        },
        {
            id: 'pandemic',
            title: 'Active Outbreak',
            icon: Thermometer,
            color: 'bg-amber-600',
            desc: 'Enable bio-hazard tracking, quarantine zones, and real-time infection heatmaps.',
            impact: 'Containment Logic',
            protocols: ['Isolation Mesh-7', 'Asset Sterilization', 'Contact-Trace Alpha']
        },
        {
            id: 'natural-disaster',
            title: 'Disaster Recovery',
            icon: Zap,
            color: 'bg-blue-600',
            desc: 'Switch to offline-first edge nodes, deploy mobile clinics, and mesh comms.',
            impact: 'Resilience Mode',
            protocols: ['Edge-Node Sovereignty', 'Mobile Node Deployment', 'Satellite Comms']
        }
    ];

    return (
        <DashboardShell role="hospital">
            <div className="max-w-6xl mx-auto">
                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-emergency-red/10 flex items-center justify-center text-emergency-red">
                            <Siren className="w-6 h-6 animate-pulse" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter">CRISIS OPERATIONS CENTER</h1>
                    </div>
                    <p className="text-slate-500 font-medium max-w-2xl text-lg">
                        Deploy WHO-certified response playbooks. Activating a playbook shifts the entire platform's layout, information density, and governance rules.
                    </p>
                </header>

                {/* Playbook Selection */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {playbooks.map((pb) => (
                        <motion.div
                            key={pb.id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => setCrisisType(pb.id)}
                            className={`glass p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 cursor-pointer overflow-hidden relative group ${crisisType === pb.id ? 'ring-4 ring-emergency-red' : ''}`}
                        >
                            <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform ${pb.color}`}>
                                <pb.icon className="w-32 h-32" />
                            </div>

                            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-8 ${pb.color} text-white shadow-xl`}>
                                <pb.icon className="w-8 h-8" />
                            </div>

                            <h3 className="text-2xl font-black mb-1">{pb.title}</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-slate-400">{pb.impact}</p>
                            <p className="text-sm text-slate-500 leading-relaxed mb-8">{pb.desc}</p>

                            <div className="space-y-3">
                                {pb.protocols.map((p, i) => (
                                    <div key={i} className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" /> {p}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Global Override Monitor */}
                {crisisType && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass p-12 rounded-[4rem] border-4 border-emergency-red bg-emergency-red/5 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8">
                            <ShieldAlert className="w-20 h-20 text-emergency-red opacity-10 animate-pulse" />
                        </div>

                        <div className="max-w-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-2.5 h-2.5 rounded-full bg-emergency-red animate-ping" />
                                <span className="text-xs font-black text-emergency-red uppercase tracking-[0.3em]">Critical Protocol Prepared</span>
                            </div>
                            <h2 className="text-4xl font-black mb-6 uppercase tracking-tighter">Confirm Platform-Wide Deployment?</h2>
                            <p className="text-slate-600 dark:text-slate-400 font-medium text-lg mb-10 leading-relaxed italic">
                                Activating <span className="text-emergency-red font-black">"{playbooks.find(p => p.id === crisisType).title}"</span> will shift the UI for all stakeholders into "Crisis-Ready" high-density mode. Audit logs will be frozen for immediate clinical prioritization.
                            </p>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 bg-white dark:bg-slate-950 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Impacted Nodes</p>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white tabular-nums">1,240+</p>
                                </div>
                                <div className="p-6 bg-white dark:bg-slate-950 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Drift</p>
                                    <p className="text-2xl font-black text-health-teal tabular-nums">0.02ms</p>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-12">
                                <button
                                    onClick={() => setCrisisType(null)}
                                    className="flex-1 glass py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Abort Operations
                                </button>
                                <button
                                    onClick={() => setCrisisMode(crisisType)}
                                    className="flex-1 bg-emergency-red text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:scale-[1.02] transition-transform"
                                >
                                    Execute Deployment
                                </button>

                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </DashboardShell>
    );
}
