// frontend/src/app/attendance/class-report/page.tsx
'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Calendar, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ClassAttendanceReport() {
  const [classSectionId, setClassSectionId] = useState('');
  const [date, setDate] = useState('');
  const [report, setReport] = useState<{ totalStudents: number; present: number; absent: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setReport(null);
    try {
      const params: any = { classSectionId };
      if (date) params.date = date;
      const res = await api.get('/attendance/report/class', { params });
      setReport(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load class attendance report');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="flex justify-between items-center pb-4 border-b border-slate-800">
          <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Class Attendance Report
          </h1>
          <Link href="/attendance/dashboard" className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200">
            Dashboard
          </Link>
        </header>
        <form onSubmit={fetchReport} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Class Section ID</label>
            <input
              required
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm"
              value={classSectionId}
              onChange={e => setClassSectionId(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Date (optional)</label>
            <input
              type="date"
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center"
          >
            {isLoading ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Calendar className="w-5 h-5 mr-2" />} Generate Report
          </button>
        </form>
        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-900 text-rose-300 rounded mt-4">
            <AlertCircle className="inline w-4 h-4 mr-2" />{error}
          </div>
        )}
        {report && (
          <div className="mt-6 p-4 bg-slate-850 rounded-xl border border-slate-800">
            <h2 className="text-xl font-bold mb-2 text-slate-100 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-emerald-400" /> Report Summary
            </h2>
            <p>Total Students: {report.totalStudents}</p>
            <p>Present: {report.present}</p>
            <p>Absent: {report.absent}</p>
            <p>Attendance %: {report.totalStudents ? ((report.present / report.totalStudents) * 100).toFixed(2) : '0'}%</p>
          </div>
        )}
      </div>
    </main>
  );
}
