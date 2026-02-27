"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, FileCheck, AlertOctagon, TrendingUp, Search, User, ShieldAlert, BadgeCheck, Activity, Info } from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';

export default function InsuranceDashboard() {
    const claims = [
        { id: "CLM-9021", patient: "Ethan Hunt", hospital: "City General", amount: "$4,200", status: "Auto-Approved", date: "Today", proof: "vB-112" },
        { id: "CLM-8834", patient: "Sarah Connor", hospital: "Metro Health", amount: "$12,850", status: "Manual Review", date: "Yesterday", proof: "vB-492" },
        { id: "CLM-7712", patient: "Neo Anderson", hospital: "Zion Medical", amount: "$940", status: "Settled", date: "2 days ago", proof: "vB-001" },
    ];

    const sidebarItems = [
        { name: 'Claims Engine', href: '/insurance', icon: ShieldCheck },
        { name: 'Fraud Monitor', href: '/insurance/fraud', icon: AlertOctagon },
        { name: 'Settlements', href: '/insurance/settlements', icon: FileCheck },
        { name: 'Analytics', href: '/insurance/trends', icon: TrendingUp },
    ];

    return (
        <DashboardShell role="insurance" sidebarItems={sidebarItems}>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-amber-500">
                        <BadgeCheck className="w-4 h-4" /> Claims Verification Active
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                        Claims Dashboard
                    </h1>
                </div>

                <motion.div
                    whileHover={{ y: -2 }}
                    className="bg-white dark:bg-slate-900 px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4"
                >
                    <div className="text-xs text-slate-500">Auto-Auth Rate</div>
                    <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold text-amber-500">82%</p>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shadow-lg shadow-amber-500/50" />
                    </div>
                </motion.div>
            </header>

            {/* Financial Integrity Monitor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                {[
                    { label: "Pipeline Claims", value: "142", icon: Activity, color: "from-amber-500 to-orange-500" },
                    { label: "24h Settlement", value: "$2.4M", icon: FileCheck, color: "from-teal-500 to-cyan-500" },
                    { label: "High-Risk Alerts", value: "05", icon: ShieldAlert, color: "from-rose-500 to-pink-600" },
                ].map((item, i) => (
                    <motion.div
                        whileHover={{ y: -4 }}
                        key={i}
                        className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group"
                    >
                        <div>
                            <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{item.value}</h2>
                        </div>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                            <item.icon className="w-6 h-6 text-white" />
                        </div>
                    </motion.div>
                ))}
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Claims Activity Feed */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                            Claims Activity
                        </h3>
                        <div className="relative w-full md:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Filter by ID" className="pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-sm w-full md:w-60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500" />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs font-medium text-slate-500 border-b border-slate-200 dark:border-slate-800">
                                    <th className="pb-4">Claim ID</th>
                                    <th className="pb-4">Patient</th>
                                    <th className="pb-4">Value</th>
                                    <th className="pb-4">Status</th>
                                    <th className="pb-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {claims.map((claim, i) => (
                                    <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="py-5">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-700 dark:text-slate-200">{claim.id}</span>
                                                <span className="text-xs text-emerald-500 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> {claim.proof}</span>
                                            </div>
                                        </td>
                                        <td className="py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-xs font-semibold text-white">
                                                    {claim.patient.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <span className="text-slate-600 dark:text-slate-300">{claim.patient}</span>
                                            </div>
                                        </td>
                                        <td className="py-5 font-semibold text-slate-700 dark:text-slate-200">{claim.amount}</td>
                                        <td className="py-5">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${claim.status === 'Auto-Approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                                                claim.status === 'Manual Review' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                                                    'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                                }`}>
                                                {claim.status}
                                            </span>
                                        </td>
                                        <td className="py-5 text-right">
                                            <button className="text-amber-500 font-semibold text-xs hover:text-amber-600">Verify</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Fraud Shield Sidebar */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-6 rounded-2xl relative overflow-hidden shadow-lg shadow-rose-500/30">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <AlertOctagon className="w-20 h-20 text-white" />
                        </div>
                        <h3 className="font-bold mb-4 flex items-center gap-2 text-white">
                            <ShieldAlert className="w-5 h-5" />
                            Fraud Shield
                        </h3>
                        <div className="p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl relative">
                            <p className="font-semibold text-sm text-white mb-1">Collision Policy Breach</p>
                            <p className="text-xs text-white/70 mb-3">Record #F-492 flags concurrent claims across multiple nodes.</p>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-semibold text-white">Risk: 92%</span>
                                <button className="text-xs font-semibold text-white hover:underline">Freeze Claim</button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            Quarterly Outflow
                        </h3>
                        <div className="h-32 flex items-end gap-2 mb-4 px-1">
                            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    key={i}
                                    className="flex-1 bg-gradient-to-t from-teal-500 to-cyan-400 hover:from-teal-400 hover:to-cyan-300 transition-colors rounded-t-md cursor-pointer"
                                />
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 px-1">
                            <span>Oct</span>
                            <span>Nov</span>
                            <span>Dec</span>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}

