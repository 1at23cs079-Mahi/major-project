"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, Clock, RefreshCw, Calendar, User, ChevronRight, AlertCircle, Loader2, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import { usePrescriptions, useRefillPrescriptionItem } from '@/lib/hooks';
import useAuthStore from '@/store/useAuthStore';

const STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-600 dark:bg-green-900/30',
  FILLED: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
  EXPIRED: 'bg-slate-100 text-slate-600 dark:bg-slate-800',
  CANCELLED: 'bg-red-100 text-red-600 dark:bg-red-900/30',
};

export default function PatientPrescriptionsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (user?.role !== 'PATIENT') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  const { data: prescriptionsData, isLoading, error, refetch } = usePrescriptions();
  const refillMutation = useRefillPrescriptionItem();

  const prescriptions = prescriptionsData?.items || [];
  const filteredPrescriptions = filter === 'all'
    ? prescriptions
    : prescriptions.filter(p => p.status === filter);

  const handleRefill = async (prescriptionId, itemId) => {
    await refillMutation.mutateAsync({ prescriptionId, itemId });
    refetch();
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <DashboardShell role="patient">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Pill className="w-8 h-8 text-doctor-purple" />
            My Prescriptions
          </h1>
          <p className="text-slate-500 font-medium mt-1">View and manage your prescriptions and refills</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <ShieldCheck className="w-5 h-5 text-trust-verified" />
          <span className="text-slate-500">All prescriptions are blockchain verified</span>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {['all', 'ACTIVE', 'FILLED', 'EXPIRED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              filter === status
                ? 'bg-doctor-purple text-white shadow-lg'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {status === 'all' ? 'All' : status}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-doctor-purple" />
          <span className="ml-3 font-semibold">Loading prescriptions...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <div>
            <p className="font-bold text-red-600">Failed to load prescriptions</p>
            <p className="text-sm text-red-500">{error.message}</p>
          </div>
          <button onClick={() => refetch()} className="ml-auto px-4 py-2 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200">
            Retry
          </button>
        </div>
      )}

      {/* Prescriptions List */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {filteredPrescriptions.length === 0 ? (
            <div className="glass p-12 rounded-3xl text-center">
              <Pill className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Prescriptions Found</h3>
              <p className="text-slate-500">
                {filter === 'all'
                  ? "You don't have any prescriptions yet."
                  : `No ${filter.toLowerCase()} prescriptions.`}
              </p>
            </div>
          ) : (
            filteredPrescriptions.map((prescription) => (
              <motion.div
                key={prescription.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl overflow-hidden"
              >
                {/* Prescription Header */}
                <div
                  onClick={() => setExpandedId(expandedId === prescription.id ? null : prescription.id)}
                  className="p-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Doctor & Date */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-doctor-purple/10 rounded-2xl flex items-center justify-center">
                        <User className="w-7 h-7 text-doctor-purple" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold">
                            Dr. {prescription.doctor?.firstName} {prescription.doctor?.lastName}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_COLORS[prescription.status]}`}>
                            {prescription.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(prescription.createdAt)}
                          </span>
                          {prescription.doctor?.specialization && (
                            <>
                              <span>•</span>
                              <span>{prescription.doctor.specialization}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Center: Diagnosis */}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {prescription.diagnosis}
                      </p>
                      <p className="text-sm text-slate-500">
                        {prescription.items?.length || 0} medication(s)
                      </p>
                    </div>

                    {/* Right: Valid Until & Arrow */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-slate-400 uppercase font-bold">Valid Until</p>
                        <p className={`font-semibold ${
                          new Date(prescription.validUntil) < new Date() ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {formatDate(prescription.validUntil)}
                        </p>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedId === prescription.id ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="w-6 h-6 text-slate-400" />
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Expanded: Medication Items */}
                {expandedId === prescription.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-slate-200 dark:border-slate-700"
                  >
                    <div className="p-6 space-y-4">
                      {/* Notes */}
                      {prescription.notes && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Doctor's Notes:</p>
                          <p className="text-sm text-amber-600 dark:text-amber-300">{prescription.notes}</p>
                        </div>
                      )}

                      {/* Medications */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Medications</h4>
                        {prescription.items?.map((item) => (
                          <div
                            key={item.id}
                            className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-doctor-purple/10 rounded-xl flex items-center justify-center">
                                <Pill className="w-6 h-6 text-doctor-purple" />
                              </div>
                              <div>
                                <p className="font-bold">{item.medicineName}</p>
                                <p className="text-sm text-slate-500">
                                  {item.dosage} • {item.frequency} • {item.duration}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-6">
                              <div className="text-center">
                                <p className="text-xs text-slate-400 uppercase">Qty</p>
                                <p className="font-bold">{item.quantity}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-slate-400 uppercase">Refills</p>
                                <p className="font-bold">{item.refillsUsed} / {item.refillsAllowed}</p>
                              </div>
                              {item.refillsUsed < item.refillsAllowed && prescription.status === 'ACTIVE' && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleRefill(prescription.id, item.id)}
                                  disabled={refillMutation.isPending}
                                  className="px-4 py-2 bg-doctor-purple text-white rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-50"
                                >
                                  <RefreshCw className={`w-4 h-4 ${refillMutation.isPending ? 'animate-spin' : ''}`} />
                                  Refill
                                </motion.button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Instructions */}
                      {prescription.items?.some(i => i.instructions) && (
                        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                          <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">Instructions:</p>
                          <ul className="space-y-1">
                            {prescription.items.filter(i => i.instructions).map((item) => (
                              <li key={item.id} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-health-teal shrink-0 mt-0.5" />
                                <span><strong>{item.medicineName}:</strong> {item.instructions}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </div>
      )}
    </DashboardShell>
  );
}
