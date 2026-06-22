// frontend/src/app/attendance/entry/page.tsx
'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Calendar, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function AttendanceEntry() {
  const [classSectionId, setClassSectionId] = useState('');
  const [date, setDate] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [absentStudentIds, setAbsentStudentIds] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/attendance/save', {
        classSectionId,
        date,
        teacherId,
        presentCount,
        absentCount,
        totalStudents,
        absentStudentIds,
        reason,
      });
      setSuccess('Attendance saved successfully');
    } catch (err) {
      console.error(err);
      setError('Failed to save attendance');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="flex justify-between items-center pb-4 border-b border-slate-800">
          <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            New Attendance Session
          </h1>
          <a href="/attendance/dashboard" className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200">
            Back to Dashboard
          </a>
        </header>
        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-900 text-rose-300 rounded">
            <AlertCircle className="inline w-4 h-4 mr-2" />{error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-900 text-emerald-300 rounded">
            <CheckCircle className="inline w-4 h-4 mr-2" />{success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block mb-1 text-sm font-medium">Date</label>
            <input
              type="date"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Teacher (StaffProfile) ID</label>
            <input
              required
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm"
              value={teacherId}
              onChange={e => setTeacherId(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block mb-1 text-sm font-medium">Present Count</label>
              <input
                type="number"
                min="0"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm"
                value={presentCount}
                onChange={e => setPresentCount(parseInt(e.target.value, 10) || 0)}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Absent Count</label>
              <input
                type="number"
                min="0"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm"
                value={absentCount}
                onChange={e => setAbsentCount(parseInt(e.target.value, 10) || 0)}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Total Students</label>
              <input
                type="number"
                min="0"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm"
                value={totalStudents}
                onChange={e => setTotalStudents(parseInt(e.target.value, 10) || 0)}
              />
            </div>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Absent Student IDs (comma separated)</label>
            <input
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm"
              placeholder="e.g. abc123,def456"
              value={absentStudentIds.join(',')}
              onChange={e => setAbsentStudentIds(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Reason (optional)</label>
            <textarea
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm"
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center"
          >
            {isLoading ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Calendar className="w-5 h-5 mr-2" />} Save Attendance
          </button>
        </form>
      </div>
    </main>
  );
}
