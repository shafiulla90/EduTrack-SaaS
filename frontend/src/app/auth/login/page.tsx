'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useTenant } from '../../providers/TenantContext';

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useTenant();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic Indian/International mobile number validation
    const cleanedPhone = phone.trim().replace(/[\s\-()]/g, '');
    if (!cleanedPhone || cleanedPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    // Check if session is already active for this phone number
    const adminToken = localStorage.getItem('admin_token');
    const adminPhone = localStorage.getItem('admin_userPhone');
    const teacherToken = localStorage.getItem('teacher_token');
    const teacherPhone = localStorage.getItem('teacher_userPhone');

    let matchingToken = null;
    let matchingRole = '';

    const normCleaned = cleanedPhone.slice(-10);

    if (adminToken && adminPhone) {
      const normCached = adminPhone.replace(/\D/g, '').slice(-10);
      if (normCleaned === normCached) {
        matchingToken = adminToken;
        matchingRole = 'SCHOOL_ADMIN';
      }
    }
    if (!matchingToken && teacherToken && teacherPhone) {
      const normCached = teacherPhone.replace(/\D/g, '').slice(-10);
      if (normCleaned === normCached) {
        matchingToken = teacherToken;
        matchingRole = 'TEACHER';
      }
    }

    if (matchingToken) {
      setLoading(true);
      try {
        // Verify token validity by calling profile endpoint
        await api.get('/auth/profile', {
          headers: {
            'Authorization': `Bearer ${matchingToken}`
          }
        });
        
        sessionStorage.setItem('active_role', matchingRole);
        
        // Session is valid, load tenant branding and go directly to dashboard
        try {
          await refresh();
        } catch (e) {
          console.error('Failed to pre-fetch school profile:', e);
        }
        router.push('/dashboard');
        return;
      } catch (err) {
        // Token is expired or invalid, clear specific cache and proceed to normal OTP flow
        if (matchingRole === 'TEACHER') {
          localStorage.removeItem('teacher_token');
          localStorage.removeItem('teacher_tenantId');
          localStorage.removeItem('teacher_userPhone');
        } else {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_tenantId');
          localStorage.removeItem('admin_userPhone');
        }
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/send-otp', { phone: cleanedPhone });
      // In development, the API will return the OTP code for convenience
      const otpCode = response.data?.otpCode;
      const schoolName = response.data?.schoolName || '';
      const logoUrl = response.data?.logoUrl || '';

      // Store schoolName and logoUrl in sessionStorage to prevent HTTP 431 on large base64 data URIs
      sessionStorage.setItem('otp_schoolName', schoolName);
      sessionStorage.setItem('otp_logoUrl', logoUrl);

      // Build OTP page URL
      let otpUrl = `/auth/otp?phone=${encodeURIComponent(cleanedPhone)}`;
      if (otpCode) otpUrl += `&dev_otp=${otpCode}`;

      // Navigate to verification screen
      router.push(otpUrl);
    } catch (err: any) {
      console.error('Send OTP error:', err);
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] rounded-full bg-brand-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center justify-center mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 mb-3">
            <span className="font-extrabold text-white text-xl tracking-tight">ET</span>
          </div>
          <h1 className="font-black text-2xl bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent tracking-tight max-w-sm">
            EduTrack Application
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            Powered By Covenant Synergy
          </p>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-slate-900/50 bg-slate-900/40 backdrop-blur-xl relative">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">OTP Authentication</h2>
            <p className="text-slate-400 text-sm mt-1.5 font-light">
              Enter your mobile phone number to log in or register.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs mb-5">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="block w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 text-sm transition-all font-light"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:from-brand-500 hover:to-indigo-500 shadow-lg shadow-brand-500/15 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  Get OTP Code
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
