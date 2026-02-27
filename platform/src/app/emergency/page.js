"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Siren, MapPin, Ambulance, Clock, Navigation2, CheckCircle2, PhoneCall, ShieldAlert, Activity, Wifi } from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';

export default function EmergencyDashboard() {
    const [activeIncident, setActiveIncident] = useState(null);
    const [responseMode, setResponseMode] = useState('standard'); // 'standard' or 'crisis'

    const incidents = [
        { id: "INC-991", type: "Vehicle Accident", loc: "Sector 4-B Junction", severity: "Critical", time: "3m ago", status: "Ambulance Dispatched" },
        { id: "INC-402", type: "Cardiac Arrest", loc: "Central Mall - L2", severity: "Critical", time: "8m ago", status: "En Route to Hospital" },
        { id: "INC-122", type: "Construction Injury", loc: "Highrise Hub Site", severity: "Medium", time: "15m ago", status: "Handover Complete" },
    ];

    const sidebarItems = [
        { name: 'Incident Grid', href: '/emergency', icon: Siren },
        { name: 'Unit Tracking', href: '/emergency/units', icon: Ambulance },
        { name: 'Comm Link', href: '/emergency/comms', icon: PhoneCall },
        { name: 'Protocol Hub', href: '/emergency/protocols', icon: ShieldAlert },
    ];

    return (
        <DashboardShell role="emergency" sidebarItems={sidebarItems}>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-rose-500">
                        <Siren className="w-4 h-4 animate-pulse" /> Live Operations Active
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                        Emergency Response
                    </h1>
                </div>

                <div className="flex gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <button
                        onClick={() => setResponseMode('standard')}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${responseMode === 'standard' ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        Standard
                    </button>
                    <button
                        onClick={() => setResponseMode('crisis')}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${responseMode === 'crisis' ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        Crisis Mode
                    </button>
                </div>
            </header>

            {/* Tactical Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {[
                    { label: "Response SLA", value: "6:42", color: "from-rose-500 to-pink-600", trend: "Within Benchmark" },
                    { label: "Active Assets", value: "18", total: "/24", color: "from-teal-500 to-cyan-500" },
                    { label: "Incoming SOS", value: "03", color: "from-amber-500 to-orange-500", animate: true },
                    { label: "Mesh Status", value: "STABLE", color: "from-emerald-500 to-teal-500", icon: Wifi },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -4 }}
                        className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
                    >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                            {stat.icon ? <stat.icon className="w-5 h-5 text-white" /> : <Activity className="w-5 h-5 text-white" />}
                        </div>
                        <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                        <h2 className={`text-2xl font-bold text-slate-800 dark:text-white ${stat.animate ? 'animate-pulse' : ''}`}>
                            {stat.value}{stat.total && <span className="text-sm text-slate-400">{stat.total}</span>}
                        </h2>
                        {stat.trend && <p className="text-xs text-emerald-500 mt-1">{stat.trend}</p>}
                    </motion.div>
                ))}
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Incident Stream */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                        Real-Time Feed
                    </h3>
                    {incidents.map((incident, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => setActiveIncident(incident.id)}
                            className={`bg-white dark:bg-slate-900 p-6 rounded-2xl border transition-all cursor-pointer group hover:shadow-lg ${activeIncident === incident.id ? 'ring-2 ring-rose-500 border-transparent' : 'border-slate-200 dark:border-slate-800'}`}
                        >
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex gap-4">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${incident.severity === 'Critical' ? 'bg-gradient-to-br from-rose-500 to-pink-600' : 'bg-gradient-to-br from-amber-500 to-orange-500'}`}>
                                        <ShieldAlert className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="text-lg font-bold text-slate-800 dark:text-white">{incident.type}</h4>
                                            <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">{incident.id}</span>
                                        </div>
                                        <p className="text-slate-500 flex items-center gap-2 text-sm mb-3">
                                            <MapPin className="w-4 h-4" /> {incident.loc}
                                        </p>
                                        <div className="flex gap-2">
                                            <span className="text-xs font-medium px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">{incident.time}</span>
                                            <span className={`text-xs font-semibold px-3 py-1 rounded-full text-white ${incident.severity === 'Critical' ? 'bg-gradient-to-r from-rose-500 to-pink-600' : 'bg-gradient-to-r from-amber-500 to-orange-500'}`}>{incident.severity}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end justify-between">
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400 mb-1">Status</p>
                                        <div className="flex items-center gap-2 justify-end">
                                            <div className="w-2 h-2 rounded-full bg-teal-500 shadow-lg shadow-teal-500/50" />
                                            <p className="text-sm font-semibold text-teal-500">{incident.status}</p>
                                        </div>
                                    </div>
                                    <button className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors">Deploy Unit →</button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Asset Tracking & Routing */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-cyan-500" />
                        <h3 className="font-bold mb-6 flex items-center gap-3 text-slate-800 dark:text-white">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                                <Ambulance className="w-5 h-5 text-white" />
                            </div>
                            Live Asset Telemetry
                        </h3>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl relative">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">UNIT-AMB-402</p>
                                    <p className="text-xs text-slate-500">Crew: John D. | Sarah L.</p>
                                </div>
                                <span className="text-xs font-medium px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">En Route</span>
                            </div>
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">SLA Timer</span>
                                    <span className="text-teal-500 font-semibold">4:12 Remaining</span>
                                </div>
                                <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "65%" }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex-1 bg-gradient-to-r from-slate-700 to-slate-800 text-white py-2.5 rounded-lg text-xs font-semibold hover:shadow-lg transition-all">Open Comms</button>
                                <button className="p-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors">
                                    <Navigation2 className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-6 rounded-2xl relative overflow-hidden shadow-lg shadow-rose-500/30">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <Navigation2 className="w-20 h-20 text-white" />
                        </div>
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-white">
                            <Navigation2 className="w-5 h-5" />
                            Intelligent Routing
                        </h3>
                        <p className="text-sm text-white/80 mb-4">Priority routing for <span className="font-semibold">#INC-402</span> based on ICU availability.</p>
                        <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl relative">
                            <div className="absolute top-3 right-3"><CheckCircle2 className="w-4 h-4 text-white" /></div>
                            <p className="text-xs text-white/70 mb-0.5">Optimal Facility</p>
                            <p className="text-lg font-bold text-white mb-1">Metro City General</p>
                            <div className="flex items-center gap-3 text-xs text-white/80">
                                <span>12 Beds Available</span>
                                <span className="opacity-50">|</span>
                                <span>2.4 KM</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}

