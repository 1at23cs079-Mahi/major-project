"use client";
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, History, Calendar, ShieldCheck, AlertTriangle, Plus, ChevronRight, CornerDownRight, Loader2, Users, FileText, HeartPulse } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import BlockchainEvidence from '@/components/blockchain/BlockchainEvidence';
import { useMyPatientProfile, useAppointments, usePrescriptions } from '@/lib/hooks';
import useAuthStore from '@/store/useAuthStore';


export default function PatientDashboard() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    
    // Redirect if not authenticated or not a patient
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login');
        } else if (user?.role !== 'PATIENT') {
            router.push('/');
        }
    }, [isAuthenticated, user, router]);

    // Fetch real data from API
    const { data: patientData, isLoading: patientLoading } = useMyPatientProfile();
    const { data: appointmentsData, isLoading: appointmentsLoading } = useAppointments({ status: 'SCHEDULED' });
    const { data: prescriptionsData, isLoading: prescriptionsLoading } = usePrescriptions({ status: 'ACTIVE' });

    const patient = patientData?.data || patientData;
    const appointments = appointmentsData?.items || [];
    const prescriptions = prescriptionsData?.items || [];

    const stats = [
        { label: "Active Prescriptions", value: prescriptionsLoading ? "..." : String(prescriptions.length), icon: Activity, gradient: "from-teal-500 to-cyan-500", shadow: "shadow-teal-500/20" },
        { label: "Upcoming Appointments", value: appointmentsLoading ? "..." : String(appointments.length), icon: Calendar, gradient: "from-blue-500 to-indigo-500", shadow: "shadow-blue-500/20" },
        { label: "Insurance Status", value: patient?.insuranceProvider ? "Verified" : "Not Set", icon: ShieldCheck, gradient: "from-emerald-500 to-green-500", shadow: "shadow-emerald-500/20" },
    ];

    return (
        <DashboardShell role="patient">
            {/* Loading State */}
            {(patientLoading || appointmentsLoading || prescriptionsLoading) && (
                <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl flex items-center gap-4 shadow-2xl border border-slate-200 dark:border-slate-800">
                        <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
                        <span className="font-semibold text-slate-700 dark:text-slate-200">Loading your health data...</span>
                    </div>
                </div>
            )}

            {/* Urgent Action Area */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                <div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3"
                    >
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-cyan-500">{patient?.firstName || user?.patient?.firstName || 'Patient'}</span>
                    </motion.h1>
                    <p className="text-slate-500 mt-1">Your health data is synchronized across the global network.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 transition-all"
                >
                    <AlertTriangle className="w-5 h-5" />
                    Emergency SOS
                </motion.button>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm hover:shadow-xl transition-all group"
                    >
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
                            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{s.value}</h2>
                        </div>
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${s.gradient} shadow-lg ${s.shadow} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <s.icon className="w-7 h-7 text-white" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {[
                    { name: 'Book Appointment', icon: Calendar, color: 'from-teal-500 to-cyan-500', href: '/patient/appointments' },
                    { name: 'Prescriptions', icon: Activity, color: 'from-violet-500 to-purple-600', href: '/patient/prescriptions' },
                    { name: 'Upload Report', icon: Plus, color: 'from-blue-500 to-indigo-500', href: '/patient/records' },
                    { name: 'Emergency SOS', icon: AlertTriangle, color: 'from-rose-500 to-pink-600', href: '/emergency' },
                    { name: 'Manage Consent', icon: ShieldCheck, color: 'from-emerald-500 to-green-500', href: '/patient/consents' },
                    { name: 'Family', icon: Users, color: 'from-amber-400 to-orange-500', href: '/patient/family' },
                ].map((action, i) => (
                    <motion.button key={i} whileHover={{ y: -4, scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.05 }}
                        onClick={() => router.push(action.href)}
                        className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-3 group hover:shadow-xl transition-all"
                    >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                            <action.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 text-center">{action.name}</span>
                    </motion.button>
                ))}
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        Upcoming Appointments
                    </h3>
                    <button onClick={() => router.push('/patient/appointments')} className="text-xs font-semibold text-teal-500 hover:text-teal-600 flex items-center gap-1">
                        View All <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
                {appointmentsLoading ? (
                    <div className="flex items-center justify-center py-8 text-slate-400">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading appointments...
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="text-center py-8">
                        <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 mb-3">No upcoming appointments</p>
                        <button onClick={() => router.push('/patient/appointments')} className="text-xs font-semibold text-teal-500 bg-teal-50 dark:bg-teal-900/20 px-4 py-2 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors">
                            Book an Appointment
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {appointments.slice(0, 4).map((appt, i) => (
                            <motion.div key={appt.id || i} whileHover={{ x: 4 }}
                                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-all"
                                onClick={() => router.push(`/patient/appointments/${appt.id}`)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                                        {(appt.doctor?.firstName?.[0] || 'D')}{(appt.doctor?.lastName?.[0] || '')}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                                            Dr. {appt.doctor?.firstName || 'Doctor'} {appt.doctor?.lastName || ''}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {new Date(appt.scheduledAt).toLocaleDateString()} &middot; {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &middot; {appt.type || 'Consultation'}
                                        </p>
                                    </div>
                                </div>
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                    appt.status === 'CONFIRMED' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                                    appt.status === 'SCHEDULED' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                                    'bg-slate-200 dark:bg-slate-700 text-slate-500'
                                }`}>
                                    {appt.status}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* AI Insights Card */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-2xl relative overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 to-cyan-500" />
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-3 text-slate-800 dark:text-white">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                            <span className="text-white text-lg">✨</span>
                        </div>
                        AI Health Analysis
                    </h3>
                    <div className="space-y-4">
                        <div className="p-5 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border border-teal-100 dark:border-teal-800 rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                                <p className="font-semibold text-sm text-teal-700 dark:text-teal-400">Nutritional Insight</p>
                                <span className="text-[10px] bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 px-2 py-1 rounded-full font-semibold">94% Confidence</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                Based on your last 3 blood reports, your Vitamin D levels are stabilizing. We recommend maintaining your current supplement schedule for another 30 days.
                            </p>
                            <button className="mt-3 text-xs font-semibold text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline">Why this recommendation? <ChevronRight className="w-3 h-3" /></button>
                        </div>
                    </div>
                </div>

                {/* Treatment Reminders */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500 to-purple-600" />
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-3 text-slate-800 dark:text-white">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white text-lg">⏰</span>
                        </div>
                        Reminders
                    </h3>
                    <div className="space-y-3">
                        <motion.div 
                            whileHover={{ x: 4 }}
                            className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer group"
                        >
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 group-hover:scale-125 transition-transform" />
                            <div>
                                <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-200">Take Vitamin D3</h4>
                                <p className="text-xs text-slate-400">09:00 AM</p>
                            </div>
                        </motion.div>
                        <motion.div 
                            whileHover={{ x: 4 }}
                            className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer group"
                        >
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 group-hover:scale-125 transition-transform" />
                            <div>
                                <h4 className="font-semibold text-sm text-slate-700 dark:text-slate-200">Blood Pressure Log</h4>
                                <p className="text-xs text-slate-400">12:00 PM</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Medical History Section */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <h3 className="text-lg font-bold flex items-center gap-3 text-slate-800 dark:text-white">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                            <History className="w-5 h-5 text-white" />
                        </div>
                        Medical History
                    </h3>
                    <div className="flex gap-3">
                        <span className="text-xs font-medium flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-800">
                            <ShieldCheck className="w-3 h-3" /> Blockchain Verified
                        </span>
                        <button className="text-sm font-semibold text-blue-500 hover:text-blue-600 px-4">Export</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-500 text-xs font-medium uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                                <th className="pb-4">Date</th>
                                <th className="pb-4">Provider</th>
                                <th className="pb-4">Treatment</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {[
                                { date: "Oct 12, 2025", provider: "Metro Hospital Hub", type: "Full Checkup", status: "Verified" },
                                { date: "Sep 28, 2025", provider: "Dr. Smith Clinic", type: "Vaccination", status: "Verified" },
                            ].map((record, i) => (
                                <tr key={i} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="py-5 font-semibold text-slate-700 dark:text-slate-200">{record.date}</td>
                                    <td className="py-5 text-slate-500">{record.provider}</td>
                                    <td className="py-5 text-slate-600 dark:text-slate-300">{record.type}</td>
                                    <td className="py-5">
                                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                            <ShieldCheck className="w-3.5 h-3.5" /> {record.status}
                                        </span>
                                    </td>
                                    <td className="py-5 text-right">
                                        <button className="text-blue-500 hover:text-blue-600 font-semibold text-xs">View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8">
                    <BlockchainEvidence />
                </div>
            </div>

        </DashboardShell>
    );
}
