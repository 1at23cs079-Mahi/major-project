"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Hotel, Siren, Truck, Trash2, ShieldAlert, BarChart3, Activity, ShieldCheck, Info } from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';

export default function HospitalDashboard() {
    const metrics = [
        { label: "ICU Available", value: "12/40", status: "Critical", color: "bg-emergency-red" },
        { label: "General Beds", value: "158/200", status: "Stable", color: "bg-health-teal" },
        { label: "Emergency Inflow", value: "High", status: "Active", color: "bg-amber-500" },
    ];

    const sidebarItems = [
        { name: 'Ops Center', href: '/hospital', icon: Hotel },
        { name: 'Emergency Grid', href: '/hospital/emergency', icon: Siren },
        { name: 'Waste Mgt', href: '/hospital/waste', icon: Trash2 },
        { name: 'Analytics', href: '/hospital/analytics', icon: BarChart3 },
    ];

    return (
        <DashboardShell role="hospital" sidebarItems={sidebarItems}>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-blue-500">
                        <Hotel className="w-4 h-4" /> Facility Management Active
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                        Hospital Operations
                    </h1>
                </div>

                <motion.div
                    whileHover={{ y: -2 }}
                    className="px-6 py-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-5"
                >
                    <div className="text-xs font-medium text-slate-500 leading-tight">Waste Compliance</div>
                    <div className="text-3xl font-bold text-emerald-500">94<span className="text-sm opacity-60">%</span></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
                </motion.div>
            </header>

            {/* Global Facility Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {metrics.map((m, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -5 }}
                        className="bg-white dark:bg-slate-900 p-6 rounded-2xl relative overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm group"
                    >
                        <div className={`absolute top-0 left-0 w-1 h-full ${m.status === 'Critical' ? 'bg-gradient-to-b from-rose-500 to-pink-600' : m.status === 'Stable' ? 'bg-gradient-to-b from-teal-500 to-cyan-500' : 'bg-gradient-to-b from-amber-500 to-orange-500'}`} />
                        <p className="text-xs font-medium text-slate-500 mb-1 ml-3">{m.label}</p>
                        <h2 className="text-3xl font-bold mb-4 ml-3 text-slate-800 dark:text-white">{m.value}</h2>
                        <div className="flex items-center gap-2 ml-3">
                            <div className={`w-2 h-2 rounded-full animate-pulse ${m.status === 'Critical' ? 'bg-rose-500 shadow-lg shadow-rose-500/50' : m.status === 'Stable' ? 'bg-teal-500 shadow-lg shadow-teal-500/50' : 'bg-amber-500 shadow-lg shadow-amber-500/50'}`} />
                            <span className="text-xs font-medium text-slate-400">{m.status}</span>
                        </div>
                    </motion.div>
                ))}
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Emergency Timelines */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl relative overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-pink-600" />
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-3 text-slate-800 dark:text-white">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                            <Siren className="w-5 h-5 text-white" />
                        </div>
                        Emergency Inflow
                    </h3>
                    <div className="space-y-5 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                        {[
                            { id: "AMB-201", status: "En Route", time: "4 mins", severity: "High" },
                            { id: "AMB-112", status: "Arrived", time: "Done", severity: "Medium" },
                            { id: "AMB-094", status: "Dispatched", time: "12 mins", severity: "Critical" },
                        ].map((amb, i) => (
                            <motion.div 
                                key={i} 
                                whileHover={{ x: 4 }}
                                className="relative pl-10 group cursor-pointer"
                            >
                                <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 transition-transform group-hover:scale-110 ${amb.status === 'En Route' ? 'bg-amber-400' : amb.status === 'Arrived' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-200">Ambulance {amb.id}</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">{amb.status} • <span className={amb.severity === 'Critical' ? 'text-rose-500' : amb.severity === 'High' ? 'text-amber-500' : 'text-emerald-500'}>{amb.severity}</span></p>
                                    </div>
                                    <div className="text-sm font-semibold text-slate-400">{amb.time}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Medical Waste Management */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-3 text-slate-800 dark:text-white">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-white" />
                            </div>
                            Waste Management
                        </h3>
                        <span className="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <ShieldCheck className="w-3.5 h-3.5" /> Verified
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {[
                            { label: "Infectious", weight: "124kg", color: "from-orange-500 to-amber-500", trend: "+2%" },
                            { label: "Sharps", weight: "42kg", color: "from-rose-500 to-red-500", trend: "-5%" },
                            { label: "Chemical", weight: "18kg", color: "from-blue-500 to-indigo-500", trend: "0%" },
                            { label: "Pharma", weight: "31kg", color: "from-violet-500 to-purple-500", trend: "+12%" },
                        ].map((w, i) => (
                            <motion.div 
                                key={i} 
                                whileHover={{ scale: 1.02 }}
                                className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${w.color} flex items-center justify-center`}>
                                        <Trash2 className="w-4 h-4 text-white" />
                                    </div>
                                    <span className={`text-xs font-medium ${w.trend.startsWith('+') ? 'text-rose-500' : w.trend.startsWith('-') ? 'text-emerald-500' : 'text-slate-400'}`}>{w.trend}</span>
                                </div>
                                <p className="text-xs text-slate-500 mb-0.5">{w.label}</p>
                                <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{w.weight}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800 relative overflow-hidden">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Next Pickup</span>
                            <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">1h 42m</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                <Truck className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">EcoDisposal Unit #4910</p>
                                <p className="text-xs text-slate-500">En Route to Dock B</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Operational Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Staff on Duty", value: "48", desc: "6 Cardiologists", icon: Activity, color: "from-blue-500 to-indigo-500" },
                    { label: "Active Bills", value: "24", desc: "Insurance pending", icon: BarChart3, color: "from-violet-500 to-purple-500" },
                    { label: "Ventilators", value: "08", desc: "All in use", icon: ShieldAlert, color: "from-rose-500 to-pink-500" },
                    { label: "Lab Requests", value: "112", desc: "85% processed", icon: Info, color: "from-teal-500 to-cyan-500" },
                ].map((item, i) => (
                    <motion.div
                        whileHover={{ y: -4 }}
                        key={i}
                        className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
                    >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3`}>
                            <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                        <h4 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{item.value}</h4>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                    </motion.div>
                ))}
            </div>
        </DashboardShell>
    );
}

