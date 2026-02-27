"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, Clock, User, ArrowLeft, Loader2, AlertTriangle, FileText, CheckCircle, X, Phone, Stethoscope, Heart, FilePlus, MessageSquare, ChevronRight } from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';
import { appointmentApi } from '@/lib/api';

const statusConfig = {
    CONFIRMED: { label: 'Confirmed', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600', icon: CheckCircle },
    SCHEDULED: { label: 'Scheduled', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600', icon: Clock },
    PENDING: { label: 'Pending', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600', icon: Clock },
    CANCELLED: { label: 'Cancelled', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600', icon: X },
    COMPLETED: { label: 'Completed', color: 'bg-slate-100 dark:bg-slate-800 text-slate-500', icon: CheckCircle },
};

export default function DoctorAppointmentDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
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

    const handleStatusUpdate = async (newStatus) => {
        try {
            setUpdating(true);
            await appointmentApi.update(id, { status: newStatus });
            setAppointment(prev => ({ ...prev, status: newStatus }));
        } catch (err) {
            alert(err.message || 'Failed to update appointment');
        } finally {
            setUpdating(false);
        }
    };

    const sidebarItems = [
        { icon: Calendar, label: 'Schedule', href: '/doctor/schedule', active: true },
    ];

    const status = statusConfig[appointment?.status] || statusConfig.PENDING;
    const StatusIcon = status.icon;

    return (
        <DashboardShell role="doctor" sidebarItems={sidebarItems}>
            <div className="max-w-4xl mx-auto page-transition">
                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Schedule
                </motion.button>

                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                    </div>
                ) : error ? (
                    <div className="text-center py-32">
                        <AlertTriangle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
                        <p className="text-slate-500 mb-4">{error}</p>
                        <button onClick={() => router.back()} className="text-sm text-violet-500 font-semibold">Go Back</button>
                    </div>
                ) : appointment ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        {/* Header Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
                            <div className="h-2 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />
                            <div className="p-6 md:p-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-teal-500/30">
                                            {(appointment.patient?.firstName?.[0] || appointment.patient?.first_name?.[0] || 'P')}{(appointment.patient?.lastName?.[0] || appointment.patient?.last_name?.[0] || '')}
                                        </div>
                                        <div>
                                            <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                                                {appointment.patient?.firstName || appointment.patient?.first_name || 'Patient'} {appointment.patient?.lastName || appointment.patient?.last_name || ''}
                                            </h1>
                                            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                                <User className="w-4 h-4" />
                                                Patient ID: {appointment.patient?.id?.slice(-8) || appointment.patient_id || 'N/A'}
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
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Schedule</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-violet-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                                {appointment.scheduledAt ? new Date(appointment.scheduledAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : appointment.appointment_date || 'TBD'}
                                            </p>
                                            <p className="text-xs text-slate-400">Date</p>
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
                                            <p className="text-xs text-slate-400">Time</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Consultation Info */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Consultation</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
                                            <Stethoscope className="w-5 h-5 text-teal-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{appointment.type || 'General Consultation'}</p>
                                            <p className="text-xs text-slate-400">Type</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                                            <Heart className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{appointment.priority || 'Normal'}</p>
                                            <p className="text-xs text-slate-400">Priority</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {(appointment.notes || appointment.reason) && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 mb-6">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Patient Notes</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{appointment.notes || appointment.reason}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">Actions</h3>
                            <div className="flex flex-wrap gap-3">
                                {appointment.status === 'PENDING' || appointment.status === 'SCHEDULED' ? (
                                    <>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleStatusUpdate('CONFIRMED')}
                                            disabled={updating}
                                            className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all disabled:opacity-50"
                                        >
                                            {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                            Accept Appointment
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleStatusUpdate('CANCELLED')}
                                            disabled={updating}
                                            className="px-5 py-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 font-semibold text-sm flex items-center gap-2 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors disabled:opacity-50"
                                        >
                                            <X className="w-4 h-4" /> Decline
                                        </motion.button>
                                    </>
                                ) : null}

                                {appointment.status === 'CONFIRMED' && (
                                    <>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleStatusUpdate('COMPLETED')}
                                            disabled={updating}
                                            className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all disabled:opacity-50"
                                        >
                                            {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                            Mark Complete
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => router.push(`/doctor/prescriptions/new?patientId=${appointment.patient_id || appointment.patient?.id}`)}
                                            className="px-5 py-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-600 font-semibold text-sm flex items-center gap-2 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors"
                                        >
                                            <FilePlus className="w-4 h-4" /> Write Prescription
                                        </motion.button>
                                    </>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => router.push(`/doctor/patients/${appointment.patient_id || appointment.patient?.id}`)}
                                    className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-sm flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <User className="w-4 h-4" /> View Patient Profile
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                ) : null}
            </div>
        </DashboardShell>
    );
}
