'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useTenant } from '../../providers/TenantContext';
import { User, KeyRound, CheckCircle, AlertCircle, Sparkles, Mail, Phone, BookOpen, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { refresh } = useTenant();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [qualification, setQualification] = useState('');

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  async function loadProfile() {
    try {
      const res = await api.get('/teacher-portal/profile');
      setProfile(res.data);
      setName(res.data.user.name);
      setPhone(res.data.user.phone || '');
      setQualification(res.data.qualification || '');
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setUpdating(true);
    try {
      await api.put('/teacher-portal/profile', { name, phone, qualification });
      setSuccessMsg('Profile updated successfully.');
      await refresh();
      await loadProfile();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }
    setUpdating(true);
    try {
      await api.post('/teacher-portal/profile/change-password', { oldPassword, newPassword });
      setSuccessMsg('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-t-[#2E5BFF] border-slate-200 rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md mx-auto sm:max-w-none">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <User className="w-6 h-6 text-[#2E5BFF]" />
          My Profile & Settings
        </h2>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 text-xs font-semibold">
          <CheckCircle className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-semibold">
          <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card Summary */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4">
          {profile?.user?.avatarUrl ? (
            <img src={profile.user.avatarUrl} alt={profile.user.name} className="w-24 h-24 rounded-full object-cover border-2 border-[#2E5BFF]" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-black text-3xl select-none shadow-lg">
              {profile?.user?.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="font-bold text-slate-800 text-lg">{profile?.user?.name}</h3>
            <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wide">{profile?.designation || 'Faculty Teacher'}</p>
          </div>

          <div className="w-full border-t border-slate-100 pt-4 space-y-2 text-left">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <Shield className="w-4 h-4 text-slate-400" />
              <span>Employee ID: <strong>{profile?.employeeId || 'N/A'}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{profile?.user?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>+91 {profile?.user?.phone || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>Subjects: {profile?.subjectsTaught?.join(', ') || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Update Profile Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-[15px] flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sparkles className="w-4.5 h-4.5 text-[#2E5BFF]" />
            Edit Profile Information
          </h3>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2E5BFF] text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Mobile</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2E5BFF] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Academic Qualifications</label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g. M.Sc. Mathematics, B.Ed."
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2E5BFF] text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full py-2.5 px-4 bg-[#2E5BFF] text-white rounded-xl font-semibold text-xs hover:bg-blue-600 transition-all cursor-pointer disabled:opacity-50"
            >
              Save Changes
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-[15px] flex items-center gap-2 pb-2 border-b border-slate-100">
            <KeyRound className="w-4.5 h-4.5 text-[#2E5BFF]" />
            Change Security Password
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Password</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2E5BFF] text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2E5BFF] text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2E5BFF] text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={updating}
              className="w-full py-2.5 px-4 bg-slate-800 text-white rounded-xl font-semibold text-xs hover:bg-slate-700 transition-all cursor-pointer disabled:opacity-50"
            >
              Update Password
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
