"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, Plus, User, Calendar, Search, Loader2, AlertCircle, ChevronRight, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import { usePrescriptions, usePatients, useCreatePrescription } from '@/lib/hooks';
import useAuthStore from '@/store/useAuthStore';

const STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-600 dark:bg-green-900/30',
  FILLED: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
  EXPIRED: 'bg-slate-100 text-slate-600 dark:bg-slate-800',
  CANCELLED: 'bg-red-100 text-red-600 dark:bg-red-900/30',
};

export default function DoctorPrescriptionsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (user?.role !== 'DOCTOR') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  const { data: prescriptionsData, isLoading, error, refetch } = usePrescriptions();
  const { data: patientsData } = usePatients();
  const createMutation = useCreatePrescription();

  const prescriptions = prescriptionsData?.items || [];
  const patients = patientsData?.items || [];

  // Filter prescriptions
  const filteredPrescriptions = prescriptions.filter(p => {
    const statusMatch = filter === 'all' || p.status === filter;
    const searchMatch = !searchQuery || 
      `${p.patient?.firstName} ${p.patient?.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <DashboardShell role="doctor">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Pill className="w-8 h-8 text-doctor-purple" />
            Prescriptions
          </h1>
          <p className="text-slate-500 font-medium mt-1">Create and manage patient prescriptions</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="bg-doctor-purple text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-5 h-5" />
          New Prescription
        </motion.button>
      </header>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name or diagnosis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-doctor-purple focus:border-transparent transition-all outline-none"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'ACTIVE', 'FILLED', 'EXPIRED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                filter === status
                  ? 'bg-doctor-purple text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
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

      {/* Prescriptions Table */}
      {!isLoading && !error && (
        <div className="glass rounded-2xl overflow-hidden">
          {filteredPrescriptions.length === 0 ? (
            <div className="p-12 text-center">
              <Pill className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Prescriptions Found</h3>
              <p className="text-slate-500 mb-6">
                {searchQuery 
                  ? 'No prescriptions match your search.'
                  : 'You haven\'t created any prescriptions yet.'}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="bg-doctor-purple text-white px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create First Prescription
              </motion.button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr className="text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <th className="p-4">Patient</th>
                    <th className="p-4">Diagnosis</th>
                    <th className="p-4">Medications</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Valid Until</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPrescriptions.map((prescription) => (
                    <motion.tr
                      key={prescription.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-health-teal/10 rounded-xl flex items-center justify-center">
                            <User className="w-5 h-5 text-health-teal" />
                          </div>
                          <div>
                            <p className="font-bold">{prescription.patient?.firstName} {prescription.patient?.lastName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-sm">{prescription.diagnosis}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-500">{prescription.items?.length || 0} item(s)</p>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${STATUS_COLORS[prescription.status]}`}>
                          {prescription.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-500">{formatDate(prescription.createdAt)}</p>
                      </td>
                      <td className="p-4">
                        <p className={`text-sm font-medium ${
                          new Date(prescription.validUntil) < new Date() ? 'text-red-500' : 'text-slate-600'
                        }`}>
                          {formatDate(prescription.validUntil)}
                        </p>
                      </td>
                      <td className="p-4">
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {prescriptionsData?.pagination && prescriptionsData.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: prescriptionsData.pagination.totalPages }, (_, i) => (
            <button
              key={i}
              className={`w-10 h-10 rounded-xl font-bold ${
                prescriptionsData.pagination.page === i + 1
                  ? 'bg-doctor-purple text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
