"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, MapPin, User, ChevronRight, Plus, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import { useAppointments, useCreateAppointment, useCancelAppointment } from '@/lib/hooks';
import useAuthStore from '@/store/useAuthStore';

const STATUS_COLORS = {
  SCHEDULED: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30',
  CONFIRMED: 'bg-green-100 text-green-600 dark:bg-green-900/30',
  COMPLETED: 'bg-slate-100 text-slate-600 dark:bg-slate-800',
  CANCELLED: 'bg-red-100 text-red-600 dark:bg-red-900/30',
  NO_SHOW: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30',
};

const TYPE_ICONS = {
  IN_PERSON: MapPin,
  VIDEO: Video,
  PHONE: User,
};

export default function PatientAppointmentsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [filter, setFilter] = useState('all');
  const [showBookModal, setShowBookModal] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (user?.role !== 'PATIENT') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  const { data: appointmentsData, isLoading, error, refetch } = useAppointments();
  const cancelMutation = useCancelAppointment();

  const appointments = appointmentsData?.items || [];
  const filteredAppointments = filter === 'all' 
    ? appointments 
    : appointments.filter(a => a.status === filter);

  const handleCancel = async (id) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      await cancelMutation.mutateAsync({ id, reason: 'Patient requested cancellation' });
      refetch();
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <DashboardShell role="patient">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="w-8 h-8 text-health-teal" />
            My Appointments
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage your upcoming and past appointments</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowBookModal(true)}
          className="bg-health-teal text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-teal-500/20"
        >
          <Plus className="w-5 h-5" />
          Book Appointment
        </motion.button>
      </header>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {['all', 'SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              filter === status
                ? 'bg-health-teal text-white shadow-lg'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-health-teal" />
          <span className="ml-3 font-semibold">Loading appointments...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <div>
            <p className="font-bold text-red-600">Failed to load appointments</p>
            <p className="text-sm text-red-500">{error.message}</p>
          </div>
          <button onClick={() => refetch()} className="ml-auto px-4 py-2 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200">
            Retry
          </button>
        </div>
      )}

      {/* Appointments List */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="glass p-12 rounded-3xl text-center">
              <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Appointments Found</h3>
              <p className="text-slate-500 mb-6">
                {filter === 'all' 
                  ? "You haven't booked any appointments yet."
                  : `No ${filter.toLowerCase().replace('_', ' ')} appointments.`}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowBookModal(true)}
                className="bg-health-teal text-white px-6 py-3 rounded-xl font-bold inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Book Your First Appointment
              </motion.button>
            </div>
          ) : (
            filteredAppointments.map((appointment) => {
              const TypeIcon = TYPE_ICONS[appointment.type] || MapPin;
              return (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass p-6 rounded-2xl hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Date & Time */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-health-teal/10 rounded-2xl flex flex-col items-center justify-center">
                        <span className="text-xs font-bold text-health-teal uppercase">
                          {new Date(appointment.scheduledAt).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className="text-2xl font-black text-health-teal">
                          {new Date(appointment.scheduledAt).getDate()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold">{formatTime(appointment.scheduledAt)}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-sm text-slate-500">{appointment.duration} min</span>
                        </div>
                        <p className="text-sm text-slate-500">{formatDate(appointment.scheduledAt)}</p>
                      </div>
                    </div>

                    {/* Center: Doctor & Type */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">
                          Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_COLORS[appointment.status]}`}>
                          {appointment.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <TypeIcon className="w-4 h-4" />
                        <span>{appointment.type.replace('_', ' ')}</span>
                        {appointment.doctor?.specialization && (
                          <>
                            <span>•</span>
                            <span>{appointment.doctor.specialization}</span>
                          </>
                        )}
                      </div>
                      {appointment.reason && (
                        <p className="text-sm text-slate-600 mt-1">{appointment.reason}</p>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                      {['SCHEDULED', 'CONFIRMED'].includes(appointment.status) && (
                        <>
                          {appointment.type === 'VIDEO' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="bg-health-teal text-white px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2"
                            >
                              <Video className="w-4 h-4" />
                              Join Call
                            </motion.button>
                          )}
                          <button
                            onClick={() => handleCancel(appointment.id)}
                            disabled={cancelMutation.isPending}
                            className="px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-semibold text-sm text-slate-600 hover:border-red-300 hover:text-red-500 transition-all"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Pagination */}
      {appointmentsData?.pagination && appointmentsData.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: appointmentsData.pagination.totalPages }, (_, i) => (
            <button
              key={i}
              className={`w-10 h-10 rounded-xl font-bold ${
                appointmentsData.pagination.page === i + 1
                  ? 'bg-health-teal text-white'
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
