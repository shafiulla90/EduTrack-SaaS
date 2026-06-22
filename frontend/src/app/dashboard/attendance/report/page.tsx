'use client';

import React, { useState } from 'react';
import { 
  ArrowLeft, Search, Calendar, Info, CheckCircle, 
  X, AlertTriangle, TrendingUp, ChevronLeft, ChevronRight
} from 'lucide-react';
import { mockStudents } from '@/lib/mockData';
import Link from 'next/link';

export default function AttendanceReportPage() {
  const [selectedStudent, setSelectedStudent] = useState(mockStudents[0]);
  const [selectedMonth, setSelectedMonth] = useState('June 2026');
  const [search, setSearch] = useState('');

  // Auto-complete results
  const matchingStudents = search.trim().length >= 2
    ? mockStudents.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  // Month days array
  const monthDays = Array.from({ length: 30 }).map((_, idx) => {
    const dayNum = idx + 1;
    // Mock attendance statuses
    let status: 'Present' | 'Absent' | 'Late' = 'Present';
    if (dayNum % 11 === 0) status = 'Absent';
    else if (dayNum % 7 === 0) status = 'Late';

    return { day: dayNum, status };
  });

  const presentCount = monthDays.filter(d => d.status === 'Present').length;
  const absentCount = monthDays.filter(d => d.status === 'Absent').length;
  const lateCount = monthDays.filter(d => d.status === 'Late').length;
  const pct = Math.round((presentCount / monthDays.length) * 100);

  return (
    <div className="space-y-6 animate-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/attendance"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-[28px] font-bold text-slate-900 leading-none">
              Attendance Calendar Sheets
            </h2>
            <p className="text-slate-500 text-[13px] font-medium mt-2">
              Review monthly calendar attendance trends per student record.
            </p>
          </div>
        </div>
      </div>

      {/* Roster Search Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Search */}
        <div className="relative space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Find Student</label>
          <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 focus-within:border-[#2E5BFF]">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text" placeholder="Search by name..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none text-[13px] font-semibold text-slate-800 outline-none w-full placeholder-slate-400"
            />
          </div>

          {matchingStudents.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden divide-y divide-slate-100 max-h-40 overflow-y-auto">
              {matchingStudents.map(s => (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedStudent(s);
                    setSearch('');
                  }}
                  className="p-2.5 hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-800"
                >
                  {s.name} ({s.class})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Month select */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Select Month</label>
          <select
            value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-2.5 text-[13px] text-slate-750 font-bold bg-white"
          >
            <option>June 2026</option>
            <option>May 2026</option>
            <option>April 2026</option>
            <option>March 2026</option>
          </select>
        </div>
      </div>

      {/* Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar sheet */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-850 text-base flex items-center gap-1">
              <Calendar className="w-5 h-5 text-blue-500" />
              Calendar: {selectedStudent.name}
            </h3>
            <span className="text-xs text-slate-450 font-bold uppercase">{selectedMonth}</span>
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-7 gap-3 pt-2">
            {monthDays.map((d) => {
              let color = 'bg-slate-50 border-slate-200 text-slate-600';
              if (d.status === 'Present') color = 'bg-emerald-50 border-emerald-100 text-emerald-700 font-bold';
              else if (d.status === 'Absent') color = 'bg-rose-50 border-rose-100 text-rose-700 font-bold';
              else if (d.status === 'Late') color = 'bg-amber-50 border-amber-100 text-amber-700 font-bold';

              return (
                <div
                  key={d.day}
                  className={`h-16 border rounded-xl flex flex-col justify-between p-2.5 text-xs transition-all ${color}`}
                >
                  <span className="font-bold">{d.day}</span>
                  <span className="text-[9px] font-semibold uppercase self-end tracking-wider">{d.status}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats card */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-750 border-b border-slate-100 pb-3">Monthly Progression</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold block">Present Rate</span>
                <span className="text-lg font-black text-emerald-600 block mt-0.5">{presentCount} Days</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold block">Absent Rate</span>
                <span className="text-lg font-black text-rose-600 block mt-0.5">{absentCount} Days</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold block">Late Rate</span>
                <span className="text-lg font-black text-amber-600 block mt-0.5">{lateCount} Days</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-slate-400 text-[10px] font-bold block">Attendance %</span>
                <span className="text-lg font-black text-blue-600 block mt-0.5">{pct}%</span>
              </div>
            </div>

            <div className="p-4 bg-blue-50/20 border border-blue-100/30 rounded-xl text-xs text-slate-650 leading-relaxed font-semibold">
              ℹ️ Standard benchmark limits require a minimum of 75% attendance presence rate for final exams eligibility.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
