// frontend/src/app/attendance/dashboard/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Calendar, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

// Types
interface AttendanceSession {
  id: string;
  date: string;
  classSection: { class: { name: string }; section: { name: string } };
  presentCount: number;
  absentCount: number;
  totalStudents: number;
}

export default function AttendanceDashboard() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/attendance/recent');
      setSessions(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load attendance data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, []);

  const totalPresent = sessions.reduce((a, s) => a + s.presentCount, 0);
  const totalAbsent = sessions.reduce((a, s) => a + s.absentCount, 0);
  const totalStudents = sessions.reduce((a, s) => a + s.totalStudents, 0);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 pb-6 border-b border-slate-800">
          <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Attendance Dashboard
          </h1>
          <div className="flex gap-3">
            <Link href="/attendance/entry" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
              New Session
            </Link>
            <Link href="/attendance/history" className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold">
              History
            </Link>
          </div>
        </header>

        {isLoading && (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <RefreshCw className="w-6 h-6 mr-2 animate-spin" /> Loading attendance data…
          </div>
        )}
        {error && (
          <div className="p-4 bg-rose-950/80 border border-rose-900 text-rose-300 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" /> {error}
          </div>
        )}
        {!isLoading && !error && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-slate-850 rounded-xl p-5 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-indigo-400" />
                <div>
                  <div className="text-xl font-bold text-slate-100">{sessions.length}</div>
                  <div className="text-xs text-slate-400">Recent Sessions</div>
                </div>
              </div>
              <div className="bg-slate-850 rounded-xl p-5 flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
                <div>
                  <div className="text-xl font-bold text-slate-100">{totalPresent}</div>
                  <div className="text-xs text-slate-400">Total Present</div>
                </div>
              </div>
              <div className="bg-slate-850 rounded-xl p-5 flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-rose-400" />
                <div>
                  <div className="text-xl font-bold text-slate-100">{totalAbsent}</div>
                  <div className="text-xs text-slate-400">Total Absent</div>
                </div>
              </div>
            </div>

            {/* Sessions Table */}
            <div className="mt-8 bg-slate-850 rounded-xl overflow-hidden shadow-lg">
              <table className="w-full">
                <thead className="bg-slate-800 text-sm text-slate-400">
                  <tr>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Class / Section</th>
                    <th className="px-4 py-2 text-left">Present</th>
                    <th className="px-4 py-2 text-left">Absent</th>
                    <th className="px-4 py-2 text-left">Total</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-slate-300 divide-y divide-slate-700">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800 transition-colors">
                      <td className="px-4 py-2">{new Date(s.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2">{s.classSection.class.name} - {s.classSection.section.name}</td>
                      <td className="px-4 py-2">{s.presentCount}</td>
                      <td className="px-4 py-2 text-rose-400">{s.absentCount}</td>
                      <td className="px-4 py-2">{s.totalStudents}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
