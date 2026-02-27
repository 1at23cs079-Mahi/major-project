"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Clock, User, MapPin, FileText, ArrowLeft, X, RefreshCw, Loader2, CheckCircle, AlertTriangle, Phone, Stethoscope, ChevronRight } from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';
import { appointmentApi } from '@/lib/api';

const statusConfig = {
    CONFIRMED: { label: 'Confirmed', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600', icon: CheckCircle },
    SCHEDULED: { label: 'Scheduled', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600', icon: Clock },
    PENDING: { label: 'Pending', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600', icon: Clock },
    CANCELLED: { label: 'Cancelled', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600', icon: X },
    COMPLETED: { label: 'Completed', color: 'bg-slate-100 dark:bg-slate-800 text-slate-500', icon: CheckCircle },
};

export default function AppointmentDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAppointment = async () => {
            try {
                setLoading(true);
                const res = await appointmentApi.getOne(id);
                setAppointment(res.data || res.appointment || res);
            } catch (err) {
                setError(err.message || 'Failed to load appointment');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchAppointment();
    }, [id]);

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel this appointment?')) return;
        try {
            setCancelling(true);
            await appointmentApi.cancel(id);
            setAppointment(prev => ({ ...prev, status: 'CANCELLED' }));
        } catch (err) {
            alert(err.message || 'Failed to cancel appointment');
        } finally {
            setCancelling(false);
        }
    };

    const sidebarItems = [
        { icon: Calendar, label: 'Appointments', href: '/patient/appointments', active: true },
    ];

    const status = statusConfig[appointment?.status] || statusConfig.PENDING;
    const StatusIcon = status.icon;

    return (
        <DashboardShell role="patient" sidebarItems={sidebarItems}>
            <div className="max-w-4xl mx-auto page-transition">
                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Appointments
                </motion.button>

                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                    </div>
                ) : error ? (
                    <div className="text-center py-32">
                        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
                        <p className="text-slate-500 mb-4">{error}</p>
                        <button onClick={() => router.back()} className="text-sm text-teal-500 font-semibold">Go Back</button>
                    </div>
                ) : appointment ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        {/* Header Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
                            {/* Gradient header */}
                            <div className="h-2 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500" />
                            <div className="p-6 md:p-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/30">
                                            {(appointment.doctor?.firstName?.[0] || 'D')}{(appointment.doctor?.lastName?.[0] || '')}
                                        </div>
                                        <div>
                                            <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                                                Dr. {appointment.doctor?.firstName || 'Doctor'} {appointment.doctor?.lastName || ''}
                                            </h1>
                                            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                                <Stethoscope className="w-4 h-4" />
                                                {appointment.doctor?.specialization || appointment.type || 'General Consultation'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${status.color}`}>
                                        <StatusIcon className="w-4 h-4" />
                                        {status.label}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Date & Time Card */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Date & Time</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-teal-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                {appointment.scheduledAt ? new Date(appointment.scheduledAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : appointment.appointment_date || 'TBD'}
                                            </p>
                                            <p className="text-xs text-slate-400">Appointment Date</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                            <Clock className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                {appointment.scheduledAt ? new Date(appointment.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : appointment.appointment_time || 'TBD'}
                                            </p>
                                            <p className="text-xs text-slate-400">Appointment Time</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Appointment Info Card */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Appointment Info</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-violet-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{appointment.type || 'General Consultation'}</p>
                                            <p className="text-xs text-slate-400">Type</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{appointment.location || appointment.method || 'In-Person'}</p>
                                            <p className="text-xs text-slate-400">Location / Method</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes Section */}
                        {(appointment.notes || appointment.reason) && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 mb-6">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Notes</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{appointment.notes || appointment.reason}</p>
                            </div>
                        )}

                        {/* Actions */}
                        {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
                            <div className="flex flex-wrap gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleCancel}
                                    disabled={cancelling}
                                    className="px-6 py-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 font-semibold text-sm flex items-center gap-2 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors disabled:opacity-50"
                                >
                                    {cancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                                    Cancel Appointment
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => router.push(`/patient/appointments?reschedule=${id}`)}
                                    className="px-6 py-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 text-teal-600 font-semibold text-sm flex items-center gap-2 hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4" /> Reschedule
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                ) : null}
            </div>
        </DashboardShell>
    );
}
