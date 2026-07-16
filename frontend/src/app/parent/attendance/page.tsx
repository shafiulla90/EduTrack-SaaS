'use client';

import React, { useState, useEffect } from 'react';
import { useParent } from '../ParentContext';
import { api } from '@/lib/api';
import { Calendar as CalendarIcon, CheckCircle, AlertCircle, Clock, Info } from 'lucide-react';

export default function AttendancePage() {
  const { selectedChild } = useParent();
  const [attendance, setAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async (childId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/parent-portal/children/${childId}/attendance`);
      setAttendance(res.data);
    } catch (err) {
      console.error('Failed to fetch attendance records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChild) {
      fetchAttendance(selectedChild.id);
    }
  }, [selectedChild]);

  // Listen to switcher events
  useEffect(() => {
    const handleChildChange = (e: any) => {
      fetchAttendance(e.detail);
    };
    window.addEventListener('parentChildChanged', handleChildChange);
    return () => window.removeEventListener('parentChildChanged', handleChildChange);
  }, []);

  if (!selectedChild) {
    return (
      <div className="text-slate-400 text-sm text-center py-12">
        Please select a child to view attendance records.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-t-brand-500 border-r-brand-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const summary = attendance?.summary || { total: 0, present: 0, absent: 0, late: 0, excused: 0, attendanceRate: 100 };
  const records = attendance?.records || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            Attendance Log: <span className="text-brand-300 font-extrabold">{selectedChild.name}</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-light">Monitor monthly attendance, late checkins, and absenteeism rates.</p>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl text-center shadow-md">
          <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Attendance Rate</span>
          <h4 className="text-2xl font-black text-brand-400 mt-1.5">{summary.attendanceRate}%</h4>
        </div>
        <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl text-center shadow-md">
          <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Total Session</span>
          <h4 className="text-2xl font-black text-slate-200 mt-1.5">{summary.total}</h4>
        </div>
        <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl text-center shadow-md">
          <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Present</span>
          <h4 className="text-2xl font-black text-emerald-400 mt-1.5">{summary.present}</h4>
        </div>
        <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl text-center shadow-md">
          <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Late</span>
          <h4 className="text-2xl font-black text-amber-400 mt-1.5">{summary.late}</h4>
        </div>
        <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl text-center shadow-md col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase block tracking-wider">Absent</span>
          <h4 className="text-2xl font-black text-rose-400 mt-1.5">{summary.absent}</h4>
        </div>
      </div>

      {/* Detailed logs */}
      <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl shadow-xl space-y-4">
        <h3 className="font-bold text-sm text-slate-200 border-b border-slate-900 pb-2 flex items-center gap-2">
          <CalendarIcon className="w-4.5 h-4.5 text-brand-400" />
          Attendance History
        </h3>
        
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 text-center">
            <Info className="w-10 h-10 text-slate-700 mb-2" />
            <p className="text-xs font-light">No attendance sessions registered for this child yet.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {records.map((rec: any) => {
              let badgeColor = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
              let Icon = CheckCircle;
              if (rec.status === 'ABSENT') {
                badgeColor = 'bg-rose-500/10 border-rose-500/20 text-rose-400';
                Icon = AlertCircle;
              } else if (rec.status === 'LATE') {
                badgeColor = 'bg-amber-500/10 border-amber-500/20 text-amber-400';
                Icon = Clock;
              } else if (rec.status === 'EXCUSED') {
                badgeColor = 'bg-blue-500/10 border-blue-500/20 text-blue-400';
                Icon = Info;
              }

              return (
                <div
                  key={rec.id}
                  className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-900 rounded-2xl hover:border-slate-800 transition-all gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${badgeColor.split(' ')[0]} ${badgeColor.split(' ')[1]}`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">
                        {new Date(rec.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-light mt-0.5">Taken by: {rec.markedBy}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider ${badgeColor}`}>
                    {rec.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
