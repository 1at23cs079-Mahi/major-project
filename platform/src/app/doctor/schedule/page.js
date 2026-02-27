"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, MapPin, User, ChevronRight, CheckCircle, XCircle, Loader2, AlertCircle, Phone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/layout/DashboardShell';
import { useAppointments, useConfirmAppointment, useCompleteAppointment, useCancelAppointment } from '@/lib/hooks';
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
  PHONE: Phone,
};

export default function DoctorSchedulePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (user?.role !== 'DOCTOR') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  const { data: appointmentsData, isLoading, error, refetch } = useAppointments();
  const confirmMutation = useConfirmAppointment();
  const completeMutation = useCompleteAppointment();
  const cancelMutation = useCancelAppointment();

  const appointments = appointmentsData?.items || [];
  
  // Filter by date and status
  const filteredAppointments = appointments.filter(a => {
    const apptDate = new Date(a.scheduledAt).toISOString().split('T')[0];
    const dateMatch = apptDate === selectedDate;
    const statusMatch = filter === 'all' || a.status === filter;
    return dateMatch && statusMatch;
  });

  // Sort by time
  const sortedAppointments = [...filteredAppointments].sort((a, b) => 
    new Date(a.scheduledAt) - new Date(b.scheduledAt)
  );

  const handleConfirm = async (id) => {
    await confirmMutation.mutateAsync(id);
    refetch();
  };

  const handleComplete = async (id) => {
    await completeMutation.mutateAsync({ id, notes: 'Completed successfully' });
    refetch();
  };

  const handleCancel = async (id) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      await cancelMutation.mutateAsync({ id, reason: 'Doctor cancelled' });
      refetch();
    }
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Generate date options for the week
  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = -1; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  return (
    <DashboardShell role="doctor">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Calendar className="w-8 h-8 text-doctor-purple" />
            My Schedule
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage your appointments and patient visits</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            {sortedAppointments.length} appointment(s) on this day
          </span>
        </div>
      </header>

      {/* Date Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {getWeekDates().map((date) => {
          const dateStr = date.toISOString().split('T')[0];
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === new Date().toISOString().split('T')[0];
          
          return (
            <motion.button
              key={dateStr}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDate(dateStr)}
              className={`flex flex-col items-center p-3 rounded-xl min-w-[70px] transition-all ${
                isSelected
                  ? 'bg-doctor-purple text-white shadow-lg'
                  : isToday
                    ? 'bg-doctor-purple/10 text-doctor-purple'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className="text-xs font-bold uppercase">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </span>
              <span className="text-xl font-black">
                {date.getDate()}
              </span>
              <span className="text-[10px]">
                {date.toLocaleDateString('en-US', { month: 'short' })}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {['all', 'SCHEDULED', 'CONFIRMED', 'COMPLETED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              filter === status
                ? 'bg-doctor-purple text-white shadow-lg'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-doctor-purple" />
          <span className="ml-3 font-semibold">Loading schedule...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-4">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <div>
            <p className="font-bold text-red-600">Failed to load schedule</p>
            <p className="text-sm text-red-500">{error.message}</p>
          </div>
          <button onClick={() => refetch()} className="ml-auto px-4 py-2 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200">
            Retry
          </button>
        </div>
      )}

      {/* Appointments Timeline */}
      {!isLoading && !error && (
        <div className="space-y-4">
          {sortedAppointments.length === 0 ? (
            <div className="glass p-12 rounded-3xl text-center">
              <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Appointments</h3>
              <p className="text-slate-500">
                No appointments scheduled for {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          ) : (
            sortedAppointments.map((appointment, index) => {
              const TypeIcon = TYPE_ICONS[appointment.type] || MapPin;
              return (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass p-6 rounded-2xl hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Time Column */}
                    <div className="flex items-center gap-4 md:w-32">
                      <div className="w-2 h-2 rounded-full bg-doctor-purple" />
                      <div>
                        <span className="font-bold text-lg">{formatTime(appointment.scheduledAt)}</span>
                        <p className="text-xs text-slate-500">{appointment.duration} min</p>
                      </div>
                    </div>

                    {/* Patient Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 bg-health-teal/10 rounded-xl flex items-center justify-center">
                          <User className="w-5 h-5 text-health-teal" />
                        </div>
                        <div>
                          <span className="font-bold">
                            {appointment.patient?.firstName} {appointment.patient?.lastName}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_COLORS[appointment.status]}`}>
                              {appointment.status.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <TypeIcon className="w-3 h-3" />
                              {appointment.type.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                      {appointment.reason && (
                        <p className="text-sm text-slate-600 mt-2 ml-13">{appointment.reason}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {appointment.status === 'SCHEDULED' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleConfirm(appointment.id)}
                          disabled={confirmMutation.isPending}
                          className="px-4 py-2 bg-green-500 text-white rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Confirm
                        </motion.button>
                      )}
                      {appointment.status === 'CONFIRMED' && (
                        <>
                          {appointment.type === 'VIDEO' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 bg-doctor-purple text-white rounded-xl font-semibold text-sm flex items-center gap-2"
                            >
                              <Video className="w-4 h-4" />
                              Start Call
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleComplete(appointment.id)}
                            disabled={completeMutation.isPending}
                            className="px-4 py-2 bg-health-teal text-white rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Complete
                          </motion.button>
                        </>
                      )}
                      {['SCHEDULED', 'CONFIRMED'].includes(appointment.status) && (
                        <button
                          onClick={() => handleCancel(appointment.id)}
                          disabled={cancelMutation.isPending}
                          className="px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-semibold text-sm text-slate-600 hover:border-red-300 hover:text-red-500 transition-all disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
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
    </DashboardShell>
  );
}
