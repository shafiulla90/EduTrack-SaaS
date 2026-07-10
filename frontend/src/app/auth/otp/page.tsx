'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';

function OtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const phone = searchParams.get('phone') || '';
  const devOtp = searchParams.get('dev_otp') || '';
  const [schoolName, setSchoolName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSchoolName(sessionStorage.getItem('otp_schoolName') || searchParams.get('schoolName') || '');
      setLogoUrl(sessionStorage.getItem('otp_logoUrl') || searchParams.get('logoUrl') || '');
    }
  }, [searchParams]);

  // Refs for auto-focusing next input
  const inputRefs = useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    if (!phone) {
      router.push('/auth/login');
    }
  }, [phone, router]);

  const handleChange = (index: number, value: string) => {
    // Only accept numeric inputs
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value.substring(value.length - 1); // keep only last digit
    setOtpCode(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    
    const codeStr = otpCode.join('');
    if (codeStr.length < 6) {
      setError('Please enter all 6 digits of the OTP code.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', {
        phone,
        otpCode: codeStr,
      });

      const data = response.data;
      if (data.registered) {
        setSuccessMsg('Authenticated! Loading school profile...');
        // Store JWT token and Tenant ID in local storage
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('tenantId', data.user.tenantId);
        if (data.user.phone) {
          localStorage.setItem('userPhone', data.user.phone);
        }
        
        setSuccessMsg('Authenticated! Redirecting...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
      } else {
        setSuccessMsg('Verification successful! Opening registration wizard...');
        // Redirect to School Onboarding Wizard
        setTimeout(() => {
          router.push(`/register-school?phone=${encodeURIComponent(phone)}`);
        }, 800);
      }
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto trigger verification when all 6 digits are entered
  useEffect(() => {
    if (otpCode.join('').length === 6) {
      handleSubmit();
    }
  }, [otpCode]);

  const handleResend = async () => {
    setError('');
    setSuccessMsg('Resending OTP...');
    try {
      const response = await api.post('/auth/send-otp', { phone });
      setSuccessMsg('OTP resent successfully.');
      const newDevOtp = response.data?.otpCode;
      if (newDevOtp) {
        // Update URL with new dev OTP
        router.replace(`/auth/otp?phone=${encodeURIComponent(phone)}&dev_otp=${newDevOtp}`);
      }
    } catch (err: any) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Ornamentations */}
      <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] rounded-full bg-brand-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

      {/* Main card wrapper */}
      <div className="w-full max-w-md z-10">
         <div className="flex flex-col items-center justify-center mb-8 text-center">
          {logoUrl ? (
            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-800 p-2 overflow-hidden shadow-lg mb-3">
              <img src={logoUrl} alt={schoolName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 mb-3">
              <span className="font-extrabold text-white text-xl tracking-tight">ET</span>
            </div>
          )}
          <h1 className="font-black text-2xl bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent tracking-tight max-w-sm">
            {schoolName || 'EduTrack Application'}
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            {schoolName ? 'School Portal' : 'Powered By Covenant Synergy'}
          </p>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-slate-900/50 bg-slate-900/40 backdrop-blur-xl relative">
          <button
            onClick={() => router.push('/auth/login')}
            className="absolute top-6 left-6 text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="mb-6 mt-4 text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">Verify Code</h2>
            <p className="text-slate-400 text-sm mt-1.5 font-light">
              We sent a 6-digit OTP code to <span className="text-slate-200 font-normal">{phone}</span>.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs mb-5">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs mb-5">
              <ShieldCheck className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Development Helper Banner */}
          {devOtp && (
            <div className="mb-6 p-3 bg-brand-500/10 border border-brand-500/30 rounded-xl text-center text-xs text-brand-300">
              Development Helper OTP Code: <strong className="text-white text-sm ml-1 select-all">{devOtp}</strong>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between gap-2.5">
              {otpCode.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  ref={(el) => {
                    inputRefs.current[idx] = el as HTMLInputElement;
                  }}
                  className="w-full h-13 text-center bg-slate-950/80 border border-slate-800 rounded-xl text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder-slate-700"
                  disabled={loading}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.join('').length < 6}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 text-white rounded-xl font-semibold text-sm hover:from-brand-500 hover:to-indigo-500 shadow-lg shadow-brand-500/15 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying OTP...
                </>
              ) : (
                'Verify & Proceed'
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors bg-none border-none p-0 cursor-pointer disabled:opacity-50"
            >
              Didn't receive code? Resend OTP
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function OtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    }>
      <OtpContent />
    </Suspense>
  );
}
