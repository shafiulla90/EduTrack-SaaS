// frontend/src/app/attendance/history/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AttendanceHistory() {
  const [sessions, setSessions] = useState([] as any[]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/attendance/recent');
      setSessions(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load attendance history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex justify-between items-center pb-4 border-b border-slate-800">
          <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Attendance History
          </h1>
          <Link href="/attendance/dashboard" className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200">
            Back to Dashboard
          </Link>
        </header>
        {isLoading && (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <RefreshCw className="w-6 h-6 mr-2 animate-spin" /> Loading history…
          </div>
        )}
        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-900 text-rose-300 rounded">
            <AlertCircle className="inline w-4 h-4 mr-2" />{error}
          </div>
        )}
        {!isLoading && !error && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm text-slate-300 border-collapse">
              <thead className="bg-slate-800 text-slate-400">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Class / Section</th>
                  <th className="px-4 py-2 text-left">Present</th>
                  <th className="px-4 py-2 text-left">Absent</th>
                  <th className="px-4 py-2 text-left">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {sessions.map(s => (
                  <tr key={s.id} className="hover:bg-slate-800 transition-colors">
                    <td className="px-4 py-2">{new Date(s.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{s.classSection?.class?.name} - {s.classSection?.section?.name}</td>
                    <td className="px-4 py-2">{s.presentCount}</td>
                    <td className="px-4 py-2 text-rose-400">{s.absentCount}</td>
                    <td className="px-4 py-2">{s.totalStudents}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
