"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Calendar, Heart, Droplets, 
  AlertTriangle, Shield, Edit3, Save, X, Camera, Loader2 
} from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';
import { useMyPatientProfile, useUpdatePatient } from '@/lib/hooks';
import useAuthStore from '@/store/useAuthStore';

export default function PatientProfilePage() {
  const { user } = useAuthStore();
  const { data: profileData, isLoading } = useMyPatientProfile();
  const updatePatient = useUpdatePatient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const patient = profileData?.data || profileData || user?.patient || {};

  const handleEdit = () => {
    setFormData({
      firstName: patient.firstName || '',
      lastName: patient.lastName || '',
      phone: patient.phone || '',
      address: patient.address || '',
      city: patient.city || '',
      state: patient.state || '',
      zipCode: patient.zipCode || '',
      bloodType: patient.bloodType || '',
      allergies: patient.allergies || '',
      emergencyContact: patient.emergencyContact || '',
      emergencyPhone: patient.emergencyPhone || '',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (patient.id) {
      await updatePatient.mutateAsync({ id: patient.id, data: formData });
    }
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (isLoading) {
    return (
      <DashboardShell role="patient">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-health-teal" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="patient">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4 text-health-teal">
            <div className="w-10 h-10 rounded-2xl bg-health-teal/10 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Identity Mesh Node</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">MY PROFILE</h1>
          <p className="text-slate-500 font-medium">Manage your personal information and medical preferences.</p>
        </header>

        {/* Profile Card */}
        <div className="glass rounded-3xl p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-health-teal to-health-teal-dark flex items-center justify-center text-white text-4xl font-black">
                {patient.firstName?.[0]}{patient.lastName?.[0]}
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold">{patient.firstName} {patient.lastName}</h2>
                  <p className="text-slate-500 text-sm">{user?.email}</p>
                </div>
                {!isEditing ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-health-teal text-white rounded-xl font-semibold text-sm"
                  >
                    <Edit3 className="w-4 h-4" /> Edit Profile
                  </motion.button>
                ) : (
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSave}
                      disabled={updatePatient.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-trust-verified text-white rounded-xl font-semibold text-sm"
                    >
                      {updatePatient.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                    </motion.button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl font-semibold text-sm"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar className="w-4 h-4" />
                  <span>{patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'Not set'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <User className="w-4 h-4" />
                  <span>{patient.gender || 'Not set'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Droplets className="w-4 h-4" />
                  <span>{patient.bloodType || 'Not set'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="glass rounded-3xl p-8 mb-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Phone className="w-5 h-5 text-health-teal" /> Contact Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              ) : (
                <p className="mt-1 font-medium">{patient.phone || 'Not set'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
              <p className="mt-1 font-medium">{user?.email}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Address</label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              ) : (
                <p className="mt-1 font-medium">{patient.address || 'Not set'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">City</label>
              {isEditing ? (
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              ) : (
                <p className="mt-1 font-medium">{patient.city || 'Not set'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">State / ZIP</label>
              {isEditing ? (
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    placeholder="ZIP"
                    className="w-24 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              ) : (
                <p className="mt-1 font-medium">{patient.state} {patient.zipCode}</p>
              )}
            </div>
          </div>
        </div>

        {/* Medical Information */}
        <div className="glass rounded-3xl p-8 mb-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Heart className="w-5 h-5 text-emergency-red" /> Medical Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Blood Type</label>
              {isEditing ? (
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="">Select</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bt => (
                    <option key={bt} value={bt}>{bt}</option>
                  ))}
                </select>
              ) : (
                <p className="mt-1 font-medium text-lg">{patient.bloodType || 'Not set'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Allergies</label>
              {isEditing ? (
                <input
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  placeholder="e.g., Penicillin, Peanuts"
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              ) : (
                <p className="mt-1 font-medium">{patient.allergies || 'None recorded'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="glass rounded-3xl p-8 border-l-4 border-emergency-red">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-emergency-red" /> Emergency Contact
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              ) : (
                <p className="mt-1 font-medium">{patient.emergencyContact || 'Not set'}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Emergency Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              ) : (
                <p className="mt-1 font-medium">{patient.emergencyPhone || 'Not set'}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
