"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Eye, EyeOff, Lock, Unlock, Clock, History, AlertTriangle, ChevronRight, Check, X, ArrowRight } from 'lucide-react';

import DashboardShell from '@/components/layout/DashboardShell';

export default function ConsentHub() {
    const [activeConsent, setActiveConsent] = useState(null);

    const categories = [
        {
            id: "clinical",
            title: "Clinical Records",
            desc: "Diagnosis, prescriptions, and lab results.",
            status: "granted",
            lastModified: "2 days ago",
            sharableWith: ["Doctors", "Hospitals"]
        },
        {
            id: "financial",
            title: "Billing & Insurance",
            desc: "Claims history and payment records.",
            status: "restricted",
            lastModified: "1 week ago",
            sharableWith: ["Insurance"]
        },
        {
            id: "emergency",
            title: "Emergency Profile",
            desc: "Allergies, blood group, and SOS contacts.",
            status: "global",
            lastModified: "Manual",
            sharableWith: ["Emergency Workers"]
        }
    ];

    return (
        <DashboardShell role="patient">
            <div className="max-w-4xl mx-auto">
                <header className="mb-16">
                    <div className="flex items-center gap-3 mb-4 text-health-teal">
                        <div className="w-10 h-10 rounded-2xl bg-health-teal/10 flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]">Privacy Governance Mesh</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 leading-none">DATA SOVEREIGNTY</h1>
                    <p className="text-slate-500 font-medium max-w-xl text-lg leading-relaxed">
                        Granular control over your clinical mesh nodes. Authorize, restrict, or revoke access in real-time with deterministic finality.
                    </p>
                </header>

                {/* Categories Grid */}
                <div className="grid gap-8 mb-16">
                    {categories.map((cat) => (
                        <motion.div
                            key={cat.id}
                            layoutId={cat.id}
                            onClick={() => setActiveConsent(cat)}
                            className="glass p-10 rounded-platinum cursor-pointer hover:shadow-2xl transition-all duration-500 group border-white/10 dark:hover:border-white/20"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-8">
                                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110 shadow-inner ${cat.status === 'granted' ? 'bg-health-teal/10 text-health-teal' : cat.status === 'restricted' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                        {cat.status === 'granted' ? <Unlock className="w-9 h-9" /> : <Lock className="w-9 h-9" />}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tighter mb-2 group-hover:text-health-teal transition-colors">{cat.title}</h3>
                                        <p className="text-slate-500 font-medium">{cat.desc}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-10">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Audit Status</p>
                                        <p className="text-xs font-black uppercase tracking-tighter text-trust-verified">VERIFIED MESH</p>
                                    </div>
                                    <ArrowRight className="w-6 h-6 text-slate-300 group-hover:translate-x-3 group-hover:text-health-teal transition-all duration-500" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>


                {/* Audit Log Preview */}
                <section className="glass p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black uppercase tracking-widest text-slate-400">Access Audit Log</h2>
                        <button className="text-xs font-black text-health-teal uppercase tracking-widest hover:underline">Full Report</button>
                    </div>
                    <div className="space-y-6">
                        {[
                            { entity: "Dr. Elizabeth Thorne", action: "Accessed Lab Results", time: "14:20 PM", trust: "Verified" },
                            { entity: "Metro General Hospital", action: "Updated ICU Protocol", time: "Yesterday", trust: "Blockchain Sync" },
                            { entity: "Shield Insurance Co.", action: "Verification Failed (Denied)", time: "2 days ago", trust: "Blocked", risk: true },
                        ].map((log, i) => (
                            <div key={i} className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-900 last:border-0">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${log.risk ? 'bg-emergency-red animate-pulse' : 'bg-health-teal'}`} />
                                    <div>
                                        <p className="font-bold text-sm">{log.entity}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{log.action}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black tabular-nums">{log.time}</p>
                                    <p className={`text-[9px] font-black uppercase ${log.risk ? 'text-emergency-red' : 'text-trust-verified'}`}>{log.trust}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Consent Modal (AnimatePresence) */}
            <AnimatePresence>
                {activeConsent && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveConsent(null)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
                        />
                        <motion.div
                            layoutId={activeConsent.id}
                            className="relative glass w-full max-w-2xl bg-white dark:bg-slate-900 p-12 rounded-[3rem] border border-slate-200 dark:border-slate-800"
                        >
                            <button
                                onClick={() => setActiveConsent(null)}
                                className="absolute top-8 right-8 p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="mb-10">
                                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 ${activeConsent.status === 'granted' ? 'bg-health-teal/20 text-health-teal' : 'bg-amber-500/20 text-amber-500'}`}>
                                    <ShieldCheck className="w-10 h-10" />
                                </div>
                                <h2 className="text-3xl font-black tracking-tighter mb-2">{activeConsent.title}</h2>
                                <p className="text-slate-500 font-medium">{activeConsent.desc}</p>
                            </div>

                            <div className="space-y-8 mb-12">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Active Sharable Entities</p>
                                    <div className="flex flex-wrap gap-3">
                                        {activeConsent.sharableWith.map((entity, idx) => (
                                            <span key={idx} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold flex items-center gap-2">
                                                <Check className="w-3 h-3 text-health-teal" /> {entity}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                                    <div className="flex items-start gap-4">
                                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-amber-600 mb-1">Privacy Advisory</p>
                                            <p className="text-[10px] text-amber-700/70 font-medium leading-relaxed">Revoking access will immediately disconnect existing peer-to-peer data nodes. Some synchronization latency may occur.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button className="flex-1 bg-emergency-red text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-transform">Revoke All Access</button>
                                <button className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] transition-transform">Save Rule</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardShell>
    );
}
