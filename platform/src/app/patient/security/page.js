"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Lock, Key, Smartphone, Eye, EyeOff, 
  CheckCircle, AlertTriangle, History, LogOut, Loader2 
} from 'lucide-react';
import DashboardShell from '@/components/layout/DashboardShell';
import useAuthStore from '@/store/useAuthStore';

export default function PatientSecurityPage() {
  const { user, logout } = useAuthStore();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const recentSessions = [
    { device: 'Chrome on Windows', location: 'New York, US', time: 'Active now', current: true },
    { device: 'Safari on iPhone', location: 'New York, US', time: '2 hours ago', current: false },
    { device: 'Firefox on MacOS', location: 'Boston, US', time: '1 day ago', current: false },
  ];

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setIsChangingPassword(true);
    // API call would go here
    setTimeout(() => {
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password changed successfully');
    }, 1500);
  };

  return (
    <DashboardShell role="patient">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4 text-health-teal">
            <div className="w-10 h-10 rounded-2xl bg-health-teal/10 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Security Mesh</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">SECURITY SETTINGS</h1>
          <p className="text-slate-500 font-medium">Manage your account security and authentication preferences.</p>
        </header>

        {/* Password Section */}
        <div className="glass rounded-3xl p-8 mb-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Lock className="w-5 h-5 text-health-teal" /> Change Password
          </h3>
          
          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Password</label>
              <div className="relative mt-1">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Password</label>
                <div className="relative mt-1">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-trust-verified" /> Minimum 8 characters
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-trust-verified" /> At least 1 uppercase letter
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-trust-verified" /> At least 1 number
              </p>
            </div>

            <motion.button
              type="submit"
              disabled={isChangingPassword}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-health-teal text-white rounded-xl font-semibold flex items-center gap-2"
            >
              {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              Update Password
            </motion.button>
          </form>
        </div>

        {/* Two-Factor Authentication */}
        <div className="glass rounded-3xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-doctor-purple" /> Two-Factor Authentication
            </h3>
            <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 text-xs font-bold rounded-full">
              Not Enabled
            </span>
          </div>
          
          <p className="text-slate-500 mb-6">
            Add an extra layer of security to your account by requiring a verification code in addition to your password.
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-doctor-purple text-white rounded-xl font-semibold flex items-center gap-2"
          >
            <Smartphone className="w-4 h-4" /> Enable 2FA
          </motion.button>
        </div>

        {/* Active Sessions */}
        <div className="glass rounded-3xl p-8 mb-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <History className="w-5 h-5 text-insurance-blue" /> Active Sessions
          </h3>
          
          <div className="space-y-4">
            {recentSessions.map((session, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${session.current ? 'bg-trust-verified' : 'bg-slate-300'}`} />
                  <div>
                    <p className="font-semibold">{session.device}</p>
                    <p className="text-sm text-slate-500">{session.location} • {session.time}</p>
                  </div>
                </div>
                {session.current ? (
                  <span className="text-xs font-bold text-trust-verified">Current Session</span>
                ) : (
                  <button className="text-xs font-bold text-emergency-red hover:underline">Revoke</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="glass rounded-3xl p-8 border-l-4 border-emergency-red">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-emergency-red">
            <AlertTriangle className="w-5 h-5" /> Danger Zone
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-emergency-red/5 rounded-xl">
              <div>
                <p className="font-semibold">Sign out of all devices</p>
                <p className="text-sm text-slate-500">This will sign you out of all other active sessions.</p>
              </div>
              <button className="px-4 py-2 border-2 border-emergency-red text-emergency-red rounded-xl font-semibold text-sm hover:bg-emergency-red hover:text-white transition-colors">
                Sign Out All
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-emergency-red/5 rounded-xl">
              <div>
                <p className="font-semibold">Delete Account</p>
                <p className="text-sm text-slate-500">Permanently delete your account and all associated data.</p>
              </div>
              <button className="px-4 py-2 border-2 border-emergency-red text-emergency-red rounded-xl font-semibold text-sm hover:bg-emergency-red hover:text-white transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
