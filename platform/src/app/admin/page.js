"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ShieldCheck, Users, Activity, Globe,
    CheckCircle, XCircle, Clock, Search,
    BarChart3, Database, Fingerprint, Lock,
    ChevronRight, AlertTriangle
} from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('monitor'); // 'monitor', 'approvals', 'audit'

    const stats = [
        { label: "Total Nodes", value: "1,240", icon: Database, color: "text-health-teal" },
        { label: "Active Sessions", value: "48.2k", icon: Users, color: "text-insurance-blue" },
        { label: "Block Height", value: "892,102", icon: Lock, color: "text-doctor-purple" },
        { label: "System Health", value: "99.9%", icon: Activity, color: "text-trust-verified" },
    ];

    const pendingApprovals = [
        { id: "DOC-492", name: "Dr. Julian Bashir", type: "Doctor", specialty: "Genetics", applied: "2h ago" },
        { id: "PHM-102", name: "Starfleet Medical Supply", type: "Pharmacy", specialty: "Logistics", applied: "5h ago" },
        { id: "HSP-882", name: "Deep Space 9 Infirmary", type: "Hospital", specialty: "Multi-Species", applied: "1d ago" },
    ];

    const auditLogs = [
        { id: "TX-99218", actor: "System Agent", action: "Edge Node Sync", target: "Sector 4-B", time: "Just now", status: "Verified" },
        { id: "TX-99215", actor: "Dr. Thorne", action: "Record Access", target: "Patient #9021", time: "4m ago", status: "Blockchain Logged" },
        { id: "TX-99210", actor: "Insurance Bot", action: "Auto-Verification", target: "Claim #CLM-902", time: "12m ago", status: "Immutable" },
    ];

    const sidebarItems = [
        { name: 'Governance Hub', href: '/admin', icon: Globe },
        { name: 'Node Mesh', href: '/admin/nodes', icon: Database },
        { name: 'User Directory', href: '/admin/users', icon: Users },
        { name: 'Audit Protocols', href: '/admin/audit', icon: ShieldCheck },
    ];

    return (
        <DashboardShell role="admin" sidebarItems={sidebarItems}>
            <header className="mb-10">
                <div className="flex items-center gap-3 mb-3 text-slate-500">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-semibold">National Sovereignty Mesh</span>
                </div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">Governance Dashboard</h1>
                <p className="text-slate-500 max-w-2xl leading-relaxed">
                    Command center for the Unified Healthcare Mesh. Oversee health trends, authorize entities, and audit system-wide provenance.
                </p>
            </header>

            {/* Real-time Infrastructure Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -4 }}
                        className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm group"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                stat.label === 'Total Nodes' ? 'bg-gradient-to-br from-teal-500 to-cyan-500' :
                                stat.label === 'Active Sessions' ? 'bg-gradient-to-br from-blue-500 to-indigo-500' :
                                stat.label === 'Block Height' ? 'bg-gradient-to-br from-violet-500 to-purple-600' :
                                'bg-gradient-to-br from-emerald-500 to-teal-500'
                            }`}>
                                <stat.icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</h2>
                    </motion.div>
                ))}
            </div>


            <div className="grid lg:grid-cols-3 gap-6">
                {/* National Health Monitor */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-white" />
                                </div>
                                National Health Monitor
                            </h3>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg text-xs font-semibold">Heatmap</button>
                                <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-500">Trend</button>
                            </div>
                        </div>

                        <div className="h-64 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900 rounded-xl relative flex items-center justify-center border border-dashed border-slate-300 dark:border-slate-700">
                            <div className="absolute inset-0 p-6 flex flex-wrap gap-3 opacity-30 pointer-events-none">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 blur-2xl animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                                ))}
                            </div>
                            <div className="text-center z-10">
                                <Globe className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                                <p className="text-sm font-medium text-slate-500">Live Spatial Data Active</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-6">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">Critical Load</p>
                                <p className="text-lg font-bold text-rose-500">Sector 4-B</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">Asset Buffer</p>
                                <p className="text-lg font-bold text-teal-500">+12%</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <p className="text-xs text-slate-500 mb-1">Mesh Sync</p>
                                <p className="text-lg font-bold text-violet-500">0.02ms</p>
                            </div>
                        </div>
                    </section>

                    {/* Blockchain Audit Log */}
                    <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                    <Fingerprint className="w-5 h-5 text-white" />
                                </div>
                                System Audit Log
                            </h3>
                            <Search className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="space-y-3">
                            {auditLogs.map((log) => (
                                <motion.div 
                                    key={log.id} 
                                    whileHover={{ x: 4 }}
                                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                            <Fingerprint className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">{log.actor}</p>
                                                <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-500">{log.id}</span>
                                            </div>
                                            <p className="text-xs text-slate-500">{log.action} → {log.target}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-0.5">{log.time}</p>
                                        <p className="text-xs font-medium text-emerald-500">{log.status}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Approval Engine Sidebar */}
                <div className="space-y-6">
                    <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
                        <h3 className="font-bold mb-6 flex items-center gap-3 text-slate-800 dark:text-white">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                            Entity Authorization
                        </h3>
                        <div className="space-y-4">
                            {pendingApprovals.map((item) => (
                                <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl relative">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">{item.name}</p>
                                            <p className="text-xs text-slate-500">{item.type} • {item.specialty}</p>
                                        </div>
                                        <span className="text-xs font-medium px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full">Pending</span>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-4">Applied {item.applied}</p>
                                    <div className="flex gap-2">
                                        <button className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white py-2.5 rounded-lg text-xs font-semibold hover:shadow-lg hover:shadow-violet-500/30 transition-all">Authorize</button>
                                        <button className="p-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-500 transition-colors">
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-2.5 text-xs font-medium text-slate-500 flex items-center justify-center gap-2 hover:text-violet-500 transition-colors">
                            View All Queue <ChevronRight className="w-4 h-4" />
                        </button>
                    </section>

                    {/* System Broadcast */}
                    <section className="bg-gradient-to-br from-rose-500 to-pink-600 p-6 rounded-2xl relative overflow-hidden shadow-lg shadow-rose-500/30">
                        <h3 className="font-bold mb-4 flex items-center gap-3 text-white">
                            <AlertTriangle className="w-5 h-5" />
                            Mesh Broadcast
                        </h3>
                        <textarea
                            placeholder="Transmit system-wide alert..."
                            className="w-full h-24 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-sm text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-white/30 transition-all mb-4"
                        />
                        <button className="w-full bg-white text-rose-600 py-3 rounded-xl text-sm font-semibold hover:bg-rose-50 transition-colors">
                            Execute Global Alert
                        </button>
                    </section>
                </div>
            </div>
        </DashboardShell>
    );
}
