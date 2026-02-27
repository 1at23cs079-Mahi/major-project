"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserCheck, FilePlus, Brain, Clipboard, Calendar, ShieldCheck, Activity, ChevronRight, Info, Loader2 } from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';
import ExplainableAI from '@/components/clinical/ExplainableAI';
import ProgressiveDisclosure from '@/components/ui/ProgressiveDisclosure';
import NeuralDiagnostics from '@/components/clinical/NeuralDiagnostics';
import { useAppointments, usePrescriptions, usePatients } from '@/lib/hooks';
import useAuthStore from '@/store/useAuthStore';


export default function DoctorDashboard() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuthStore();
    const [density, setDensity] = useState('standard'); // 'standard' or 'clinical'

    // Redirect if not authenticated or not a doctor
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login');
        } else if (user?.role !== 'DOCTOR') {
            router.push('/');
        }
    }, [isAuthenticated, user, router]);

    // Fetch real data
    const { data: appointmentsData, isLoading: appointmentsLoading } = useAppointments({ status: 'SCHEDULED' });
    const { data: prescriptionsData, isLoading: prescriptionsLoading } = usePrescriptions();
    const { data: patientsData, isLoading: patientsLoading } = usePatients({ limit: 5 });

    const appointments = appointmentsData?.items || [];
    const prescriptions = prescriptionsData?.items || [];
    const patients = patientsData?.items || [];

    const todayAppointments = appointments.filter(a => {
        const today = new Date();
        const apptDate = new Date(a.scheduledAt);
        return apptDate.toDateString() === today.toDateString();
    });

    const sidebarItems = [
        { name: 'Patient Roster', href: '/doctor', icon: Clipboard },
        { name: 'Consent Hub', href: '/doctor/consents', icon: UserCheck },
        { name: 'Prescriptions', href: '/doctor/prescriptions', icon: FilePlus },
        { name: 'Schedule', href: '/doctor/schedule', icon: Calendar },
    ];

    return (
        <DashboardShell role="doctor" sidebarItems={sidebarItems}>
            <header className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 ${density === 'clinical' ? 'mb-6' : ''}`}>
                <div>
                    <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-violet-500">
                        <Activity className="w-4 h-4" /> Clinical Mesh Node Active
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                        Clinical Dashboard
                    </h1>
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <span className="text-xs font-medium px-3 text-slate-500">View</span>
                    <button
                        onClick={() => setDensity('standard')}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${density === 'standard' ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        Standard
                    </button>
                    <button
                        onClick={() => setDensity('clinical')}
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${density === 'clinical' ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                        Clinical
                    </button>
                </div>
            </header>

            {/* Stats Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Today's Queue", value: appointmentsLoading ? '...' : String(todayAppointments.length), icon: Calendar, gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/20' },
                    { label: "Total Patients", value: patientsLoading ? '...' : String(patients.length), icon: UserCheck, gradient: 'from-teal-500 to-cyan-500', shadow: 'shadow-teal-500/20' },
                    { label: "Prescriptions", value: prescriptionsLoading ? '...' : String(prescriptions.length), icon: FilePlus, gradient: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-500/20' },
                    { label: "Recovery Rate", value: '88%', icon: Activity, gradient: 'from-emerald-500 to-green-500', shadow: 'shadow-emerald-500/20' },
                ].map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}
                        className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm hover:shadow-xl transition-all group">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{s.label}</p>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{s.value}</h2>
                        </div>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.gradient} shadow-lg ${s.shadow} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <s.icon className="w-6 h-6 text-white" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Today's Appointment Queue */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        Today&apos;s Appointments
                    </h3>
                    <button onClick={() => router.push('/doctor/schedule')} className="text-xs font-semibold text-violet-500 hover:text-violet-600 flex items-center gap-1">
                        View Full Schedule <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
                {appointmentsLoading ? (
                    <div className="flex items-center justify-center py-8 text-slate-400">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading appointments...
                    </div>
                ) : todayAppointments.length === 0 ? (
                    <div className="text-center py-8">
                        <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">No appointments scheduled for today</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {todayAppointments.slice(0, 5).map((appt, i) => (
                            <motion.div key={appt.id || i} whileHover={{ x: 4 }}
                                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-all"
                                onClick={() => router.push(`/doctor/appointments/${appt.id}`)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                                        {(appt.patient?.firstName?.[0] || 'P')}{(appt.patient?.lastName?.[0] || '')}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                                            {appt.patient?.firstName || 'Patient'} {appt.patient?.lastName || ''}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &middot; {appt.type || 'Consultation'}
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

            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${density === 'clinical' ? 'gap-4' : ''}`}>
                {/* Priority Insights & XAI */}
                <div className="lg:col-span-2 space-y-6">
                    <NeuralDiagnostics />
                    <div className="space-y-4">
                        <ExplainableAI
                            recommendation="Severe Drug-Drug Interaction: Lisinopril + Naproxen. High risk of hyperkalemia and acute kidney injury."
                            confidence={98}
                            sources={["Mayo Clinic Interaction DB", "FDA Sentinel Mesh", "Clinical Journal of Nephrology 2023"]}
                        />
                        <ExplainableAI
                            recommendation="Consider escalation of statin dosage. Patient's LDL levels (142mg/dL) are above the target for their CVD risk profile."
                            confidence={84}
                            sources={["AHA/ACC 2024 Guidelines", "Semantic Health Log v1.2"]}
                        />
                    </div>

                    {/* Consent & Blockchain Record Hub */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                    <ShieldCheck className="w-5 h-5 text-white" />
                                </div>
                                Consent Queue
                            </h3>
                            <span className="text-xs font-medium text-violet-500 bg-violet-50 dark:bg-violet-900/20 px-3 py-1 rounded-full">2 Pending</span>
                        </div>
                        <div className="space-y-3">
                            {[
                                { name: "Robert Miller", id: "#9921", status: "PENDING", time: "12m ago", initials: "RM" },
                                { name: "Alice Zhang", id: "#3302", status: "EXPIRED", time: "2h ago", initials: "AZ" },
                            ].map((req, i) => (
                                <motion.div 
                                    key={i} 
                                    whileHover={{ x: 4 }}
                                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center font-semibold text-white text-xs">
                                            {req.initials}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">{req.name} <span className="text-slate-400 font-normal text-xs">{req.id}</span></p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-slate-400">{req.time}</span>
                                                <span className="text-xs text-emerald-500 flex items-center gap-1 font-medium"><ShieldCheck className="w-3 h-3" /> Verified</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${req.status === 'PENDING' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                                            {req.status}
                                        </span>
                                        <button className="text-violet-500 font-semibold text-xs hover:text-violet-600">Authorize</button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Clinical Context & Productivity */}
                <div className="space-y-6">
                    <motion.div 
                        whileHover={{ y: -4 }}
                        className="bg-gradient-to-br from-rose-500 to-pink-600 p-6 rounded-2xl relative overflow-hidden shadow-lg shadow-rose-500/30"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <Activity className="w-20 h-20 text-white" />
                        </div>
                        <h3 className="font-bold mb-3 flex items-center gap-2 text-white">
                            <Activity className="w-5 h-5" />
                            Emergency Handover
                        </h3>
                        <p className="text-sm text-white/80 mb-5 leading-relaxed">Patient #991 incoming via ambulance. ETA 4 mins. Vitals synced.</p>
                        <button className="w-full bg-white text-rose-600 py-3 rounded-xl font-semibold shadow-lg hover:bg-rose-50 transition-colors text-sm">
                            Join Handover Session
                        </button>
                    </motion.div>

                    <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm ${density === 'clinical' ? 'p-5' : 'p-6'}`}>
                        <h3 className="font-bold mb-6 text-sm text-slate-400 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                <Activity className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-slate-800 dark:text-white">Outcome Statistics</span>
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm font-medium mb-2">
                                    <span className="text-slate-600 dark:text-slate-400">Recovery Rate</span>
                                    <span className="text-teal-500 font-semibold">88%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "88%" }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm font-medium mb-2">
                                    <span className="text-slate-600 dark:text-slate-400">Follow-up Compliance</span>
                                    <span className="text-violet-500 font-semibold">92%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "92%" }}
                                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                        className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
