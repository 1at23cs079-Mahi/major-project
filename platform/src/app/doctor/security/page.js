'use client';

import { useState } from 'react';
import {
  ShieldCheckIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  FingerPrintIcon
} from '@heroicons/react/24/outline';

export default function DoctorSecurityPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const activeSessions = [
    {
      id: 1,
      device: 'Windows PC - Chrome',
      location: 'New York, USA',
      lastActive: 'Active now',
      current: true,
      icon: ComputerDesktopIcon
    },
    {
      id: 2,
      device: 'iPhone 14 Pro - Safari',
      location: 'New York, USA',
      lastActive: '2 hours ago',
      current: false,
      icon: DevicePhoneMobileIcon
    },
    {
      id: 3,
      device: 'MacBook Pro - Chrome',
      location: 'Boston, USA',
      lastActive: 'Yesterday',
      current: false,
      icon: ComputerDesktopIcon
    }
  ];

  const securityLog = [
    { id: 1, event: 'Password changed', time: '2024-01-15 10:30 AM', status: 'success' },
    { id: 2, event: 'Login from new device', time: '2024-01-14 3:45 PM', status: 'warning' },
    { id: 3, event: 'Two-factor authentication enabled', time: '2024-01-10 9:00 AM', status: 'success' },
    { id: 4, event: 'Failed login attempt', time: '2024-01-08 11:20 PM', status: 'danger' },
    { id: 5, event: 'Session terminated', time: '2024-01-05 2:15 PM', status: 'success' }
  ];

  const handlePasswordChange = (e) => {
    e.preventDefault();
    // Handle password change
    console.log('Password change requested');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleTerminateSession = (sessionId) => {
    console.log('Terminating session:', sessionId);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Security Settings</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your account security and authentication</p>
        </div>

        {/* Security Score */}
        <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium opacity-90">Security Score</h2>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-5xl font-bold">92</span>
                <span className="text-xl opacity-80">/100</span>
              </div>
              <p className="mt-2 opacity-80">Your account is well protected</p>
            </div>
            <div className="w-24 h-24 rounded-full border-4 border-white/30 flex items-center justify-center">
              <ShieldCheckIcon className="w-12 h-12" />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Strong Password</span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">2FA Enabled</span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Regular Audits</span>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
              <KeyIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Change Password</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Update your password regularly for better security</p>
            </div>
          </div>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showCurrentPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showNewPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Two-Factor & Biometric Authentication */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <DevicePhoneMobileIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Two-Factor Auth</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Extra security layer</p>
                </div>
              </div>
              <button
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  twoFactorEnabled ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    twoFactorEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {twoFactorEnabled 
                ? 'Your account is protected with 2FA using an authenticator app.'
                : 'Enable 2FA to add an extra layer of security to your account.'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <FingerPrintIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Biometric Login</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Face ID / Fingerprint</p>
                </div>
              </div>
              <button
                onClick={() => setBiometricEnabled(!biometricEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  biometricEnabled ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    biometricEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {biometricEnabled 
                ? 'Biometric authentication is enabled for quick secure access.'
                : 'Enable biometric login for faster and secure authentication.'}
            </p>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <ComputerDesktopIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Active Sessions</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage your active login sessions</p>
              </div>
            </div>
            <button className="text-sm text-red-600 hover:text-red-700 font-medium">
              Terminate All
            </button>
          </div>

          <div className="space-y-4">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <session.icon className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 dark:text-white">{session.device}</p>
                      {session.current && (
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {session.location} • {session.lastActive}
                    </p>
                  </div>
                </div>
                {!session.current && (
                  <button
                    onClick={() => handleTerminateSession(session.id)}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Terminate
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security Log */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Security Log</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Recent security events</p>
            </div>
          </div>

          <div className="space-y-3">
            {securityLog.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0"
              >
                <div className="flex items-center gap-3">
                  {log.status === 'success' && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                  {log.status === 'warning' && <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />}
                  {log.status === 'danger' && <XCircleIcon className="w-5 h-5 text-red-500" />}
                  <span className="text-slate-900 dark:text-white">{log.event}</span>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">{log.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* HIPAA Compliance */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <ShieldCheckIcon className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-300">HIPAA Compliant</h3>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                Your account meets all HIPAA security requirements. All patient data is encrypted and access is logged for compliance auditing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
