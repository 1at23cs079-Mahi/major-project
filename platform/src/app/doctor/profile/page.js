'use client';

import { useState } from 'react';
import useAuthStore from '@/store/useAuthStore';
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  PhoneIcon,
  BuildingOffice2Icon,
  AcademicCapIcon,
  ClockIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  StarIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

export default function DoctorProfilePage() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: user?.firstName || 'Dr. John',
    lastName: user?.lastName || 'Smith',
    email: user?.email || 'dr.smith@healthcare.com',
    phone: '+1 (555) 123-4567',
    specialization: 'Cardiology',
    licenseNumber: 'MD-2024-78901',
    hospital: 'City General Hospital',
    department: 'Cardiovascular Medicine',
    yearsOfExperience: 15,
    education: 'Harvard Medical School',
    consultationFee: 150,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    consultationHours: '9:00 AM - 5:00 PM',
    bio: 'Board-certified cardiologist with over 15 years of experience in treating complex cardiovascular conditions. Specialized in interventional cardiology and heart failure management.',
    languages: ['English', 'Spanish'],
    certifications: ['American Board of Internal Medicine', 'Cardiovascular Disease Certification', 'Advanced Cardiac Life Support']
  });
  const [editedProfile, setEditedProfile] = useState({ ...profile });

  const handleSave = () => {
    setProfile({ ...editedProfile });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile({ ...profile });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Doctor Profile</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your professional information</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckIcon className="w-4 h-4" />
                Save
              </button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
          {/* Cover & Avatar */}
          <div className="h-32 bg-gradient-to-r from-cyan-600 to-teal-600"></div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16">
              <div className="w-32 h-32 rounded-2xl bg-white dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {profile.firstName[0]}{profile.lastName[0]}
                  </span>
                </div>
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Dr. {profile.firstName} {profile.lastName}
                  </h2>
                  <span className="px-2 py-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-xs font-medium rounded-full">
                    Verified
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400">{profile.specialization}</p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                  <span className="text-sm text-slate-600 dark:text-slate-400 ml-1">4.9 (127 reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                  <EnvelopeIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                      className="w-full px-2 py-1 text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 rounded border-0"
                    />
                  ) : (
                    <p className="font-medium text-slate-900 dark:text-white">{profile.email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <PhoneIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Phone</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedProfile.phone}
                      onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                      className="w-full px-2 py-1 text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 rounded border-0"
                    />
                  ) : (
                    <p className="font-medium text-slate-900 dark:text-white">{profile.phone}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <BuildingOffice2Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Hospital</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.hospital}
                      onChange={(e) => setEditedProfile({ ...editedProfile, hospital: e.target.value })}
                      className="w-full px-2 py-1 text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 rounded border-0"
                    />
                  ) : (
                    <p className="font-medium text-slate-900 dark:text-white">{profile.hospital}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Professional Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <AcademicCapIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Education</p>
                  <p className="font-medium text-slate-900 dark:text-white">{profile.education}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <CalendarDaysIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Experience</p>
                  <p className="font-medium text-slate-900 dark:text-white">{profile.yearsOfExperience} years</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <ClockIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Consultation Hours</p>
                  <p className="font-medium text-slate-900 dark:text-white">{profile.consultationHours}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">About</h3>
          {isEditing ? (
            <textarea
              value={editedProfile.bio}
              onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 rounded-lg border-0 resize-none"
            />
          ) : (
            <p className="text-slate-600 dark:text-slate-400">{profile.bio}</p>
          )}
        </div>

        {/* Certifications */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Certifications</h3>
          <div className="flex flex-wrap gap-2">
            {profile.certifications.map((cert, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-full text-sm font-medium"
              >
                {cert}
              </span>
            ))}
          </div>
        </div>

        {/* Languages */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Languages</h3>
          <div className="flex flex-wrap gap-2">
            {profile.languages.map((lang, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
