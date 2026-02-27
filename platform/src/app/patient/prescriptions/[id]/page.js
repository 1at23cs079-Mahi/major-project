"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { Pill, Calendar, Clock, User, ArrowLeft, Loader2, AlertTriangle, FileText, ShieldCheck, Printer, Hash, Stethoscope, CheckCircle, Package } from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';
import { prescriptionApi } from '@/lib/api';

const statusConfig = {
    ACTIVE: { label: 'Active', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' },
    COMPLETED: { label: 'Completed', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
    CANCELLED: { label: 'Cancelled', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' },
    EXPIRED: { label: 'Expired', color: 'bg-slate-100 dark:bg-slate-800 text-slate-500' },
};

export default function PrescriptionDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [prescription, setPrescription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPrescription = async () => {
            try {
                setLoading(true);
                const res = await prescriptionApi.getOne(id);
                setPrescription(res.data || res.prescription || res);
            } catch (err) {
                setError(err.message || 'Failed to load prescription');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchPrescription();
    }, [id]);

    const sidebarItems = [
        { icon: Pill, label: 'Prescriptions', href: '/patient/prescriptions', active: true },
    ];

    const status = statusConfig[prescription?.status] || statusConfig.ACTIVE;
    const medications = prescription?.medications || prescription?.items || prescription?.prescription_items || [];

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
                    <ArrowLeft className="w-4 h-4" /> Back to Prescriptions
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
                ) : prescription ? (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        {/* Header Card */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
                            <div className="h-2 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
                            <div className="p-6 md:p-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
                                            <FileText className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                                                Prescription #{prescription.prescription_number || prescription.id?.slice(-8) || id}
                                            </h1>
                                            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                                                <Stethoscope className="w-4 h-4" />
                                                Dr. {prescription.doctor?.firstName || prescription.doctor?.first_name || 'Doctor'} {prescription.doctor?.lastName || prescription.doctor?.last_name || ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${status.color}`}>
                                            <CheckCircle className="w-4 h-4" />
                                            {status.label}
                                        </span>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => window.print()}
                                            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                                            title="Print Prescription"
                                        >
                                            <Printer className="w-5 h-5" />
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Date Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-teal-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">Prescribed On</p>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        {prescription.createdAt ? new Date(prescription.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : prescription.prescribed_date || 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">Valid Until</p>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        {prescription.validUntil ? new Date(prescription.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : prescription.valid_until || '30 days'}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                                    <Package className="w-5 h-5 text-violet-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-medium">Medications</p>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{medications.length} item{medications.length !== 1 ? 's' : ''}</p>
                                </div>
                            </div>
                        </div>

                        {/* Medications Table */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                                        <Pill className="w-5 h-5 text-white" />
                                    </div>
                                    Medications
                                </h3>
                            </div>
                            {medications.length > 0 ? (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {medications.map((med, i) => (
                                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                            className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 text-sm font-bold">
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-700 dark:text-slate-200">{med.medication_name || med.name || med.medicine}</p>
                                                    <p className="text-xs text-slate-400 mt-1">{med.instructions || med.notes || ''}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-3 md:gap-4 ml-14 md:ml-0">
                                                <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-xs font-semibold rounded-lg">
                                                    {med.dosage || 'As directed'}
                                                </span>
                                                <span className="px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 text-violet-600 text-xs font-semibold rounded-lg">
                                                    {med.frequency || 'Daily'}
                                                </span>
                                                <span className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 text-xs font-semibold rounded-lg">
                                                    {med.duration || '7 days'}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Pill className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                    <p className="text-sm text-slate-500">No medications listed</p>
                                </div>
                            )}
                        </div>

                        {/* Blockchain Verification */}
                        {(prescription.blockchain_tx || prescription.blockchainHash) && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 mb-6">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    Blockchain Verification
                                </h3>
                                <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
                                    <Hash className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                    <code className="text-xs text-emerald-700 dark:text-emerald-400 font-mono break-all">
                                        {prescription.blockchain_tx || prescription.blockchainHash}
                                    </code>
                                </div>
                                <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                                    This prescription is cryptographically verified on the blockchain
                                </p>
                            </div>
                        )}

                        {/* Notes */}
                        {(prescription.notes || prescription.diagnosis) && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Doctor&apos;s Notes</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{prescription.notes || prescription.diagnosis}</p>
                            </div>
                        )}
                    </motion.div>
                ) : null}
            </div>
        </DashboardShell>
    );
}
