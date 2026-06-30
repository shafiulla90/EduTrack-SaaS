'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import BulkImportModal from '@/components/BulkImportModal';
import { api } from '@/lib/api';
import { useSchoolSetupUpdate, dispatchSchoolSetupUpdated } from '@/lib/events';

export default function DashboardOverview() {
  const [admissionsLimit, setAdmissionsLimit] = useState(5);
  const [paymentsLimit, setPaymentsLimit] = useState(5);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [setupStatus, setSetupStatus] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(true);
  
  const [stats, setStats] = useState({
    studentsCount: 0,
    teachersCount: 0,
    classesCount: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netIncome: 0,
    attendanceRate: 0,
    academicAverage: 0,
    trends: {
      students: { value: '0%', isUp: true },
      revenue: { value: '0%', isUp: true },
      attendance: { value: '1.5%', isUp: true },
      academic: { value: '0.8%', isUp: false }
    }
  });
  const [recentAdmissions, setRecentAdmissions] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const loadDashboardData = useCallback(async () => {
    try {
      const [setupRes, summaryRes] = await Promise.all([
        api.get('/tenant/setup-status'),
        api.get('/dashboard/summary')
      ]);

      setSetupStatus(setupRes.data);
      setStats(summaryRes.data.stats);
      setRecentAdmissions(summaryRes.data.recentAdmissions);
      setRecentPayments(summaryRes.data.recentPayments);
      setChartData(summaryRes.data.chartData);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useSchoolSetupUpdate(loadDashboardData);

  const formatCurrency = (val: number) => {
    return '₹' + val.toLocaleString('en-IN');
  };

  const displayAdmissions = recentAdmissions.slice(0, admissionsLimit);
  const displayPayments = recentPayments.slice(0, paymentsLimit);

  // Calculate max value for chart height scaling
  const maxFinancialVal = Math.max(
    ...chartData.map(d => Math.max(d.feeCollection, d.salaryExpense, d.netRevenue)),
    10000
  );

  return (
    <div className="space-y-6 animate-in">
      {/* Page Header matching LWC layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-4">
          <h2 className="text-[28px] font-bold text-slate-900 leading-none">
            Dashboard Overview
          </h2>
          <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
            ✨ New Features
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/billing/setup"
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[13px] flex items-center gap-2 transition-all shadow-xs"
          >
            <svg className="w-4 h-4 stroke-slate-500 fill-none" viewBox="0 0 24 24">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            Pricebook Setup
          </Link>
          <Link
            href="/dashboard/admissions"
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[13px] flex items-center gap-2 transition-all shadow-xs"
          >
            <svg className="w-4 h-4 stroke-slate-500 fill-none" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Admission
          </Link>
          <button
            onClick={() => setIsImportOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[13px] flex items-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <svg className="w-4 h-4 stroke-slate-500 fill-none" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Import Students
          </button>
        </div>
      </div>

      {setupStatus && !setupStatus.setupCompleted && showBanner && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm relative">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
                <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"></line>
                <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"></line>
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-amber-800 text-sm">School Setup Incomplete</h4>
              <p className="text-amber-700 text-xs mt-0.5 font-light">
                Complete the remaining school profile details to finish activation of your cloud instance.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/setup-checklist"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-amber-500/10 transition-all"
            >
              Complete Setup
            </Link>
            <button
              onClick={() => setShowBanner(false)}
              className="text-amber-400 hover:text-amber-600 transition-colors p-1 cursor-pointer"
            >
              <svg className="w-4 h-4 stroke-current fill-none" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2"></line>
                <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2"></line>
              </svg>
            </button>
          </div>
        </div>
      )}

      {setupStatus && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 stroke-blue-600 fill-none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
              <polyline points="12 6 12 12 16 14" strokeWidth="2"></polyline>
            </svg>
            Instance Setup Progress
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Completion Rate */}
            <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl flex items-center gap-4">
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="#e2e8f0" strokeWidth="3.5" fill="transparent" />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#2563eb"
                    strokeWidth="3.5"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 20}`}
                    strokeDashoffset={`${2 * Math.PI * 20 * (1 - setupStatus.completionPercentage / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-[11px] font-bold text-slate-700">{setupStatus.completionPercentage}%</span>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Profile Setup</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">
                  {setupStatus.setupCompleted ? 'Completed' : 'Complete Profile'}
                </div>
                {!setupStatus.setupCompleted && (
                  <Link href="/dashboard/setup-checklist" className="text-[11px] text-blue-600 hover:underline font-medium mt-0.5 block">
                    Complete now
                  </Link>
                )}
              </div>
            </div>

            {/* Classes Created */}
            <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg shrink-0">
                {setupStatus.classesCount}
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Classes Created</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">
                  {setupStatus.classesCount > 0 ? `${setupStatus.classesCount} Active Class(es)` : 'No classes added'}
                </div>
                <Link href="/dashboard/teachers" className="text-[11px] text-blue-600 hover:underline font-medium mt-0.5 block">
                  Add Classes
                </Link>
              </div>
            </div>

            {/* Teachers Added */}
            <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg shrink-0">
                {setupStatus.teachersCount}
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Teachers Added</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">
                  {setupStatus.teachersCount > 0 ? `${setupStatus.teachersCount} Faculty Registered` : 'No faculty added'}
                </div>
                <Link href="/dashboard/teachers" className="text-[11px] text-blue-600 hover:underline font-medium mt-0.5 block">
                  Add Teachers
                </Link>
              </div>
            </div>

            {/* Students Added */}
            <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
                {setupStatus.studentsCount}
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Students Added</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">
                  {setupStatus.studentsCount > 0 ? `${setupStatus.studentsCount} Active Student(s)` : 'No students added'}
                </div>
                <Link href="/dashboard/admissions" className="text-[11px] text-blue-600 hover:underline font-medium mt-0.5 block">
                  New Admission
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC KPI STATS GRID - 8 Harmonious Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2"></path>
                <circle cx="9" cy="7" r="4" strokeWidth="2"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2"></path>
              </svg>
            </div>
            <div className={`flex items-center gap-1 text-[12px] font-bold px-2 py-0.5 rounded-md ${stats.trends.students.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <svg className="w-3 h-3 stroke-current fill-none" viewBox="0 0 24 24">
                <polyline points={stats.trends.students.isUp ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} strokeWidth="3"></polyline>
              </svg>
              {stats.trends.students.value}
            </div>
          </div>
          <div>
            <div className="text-[32px] font-extrabold text-slate-800 leading-none">{stats.studentsCount}</div>
            <div className="text-[14px] text-slate-500 font-semibold mt-1">Total Students</div>
          </div>
          <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-400 font-medium">
            <strong>Real-time</strong> from Org
          </div>
        </div>

        {/* Total Teachers */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-center">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" strokeWidth="2"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" strokeWidth="2"></path>
              </svg>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 uppercase">Faculty</span>
          </div>
          <div>
            <div className="text-[32px] font-extrabold text-slate-800 leading-none">{stats.teachersCount}</div>
            <div className="text-[14px] text-slate-500 font-semibold mt-1">Total Teachers</div>
          </div>
          <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-400 font-medium">
            <strong>Real-time</strong> from Org
          </div>
        </div>

        {/* Total Classes */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeWidth="2"></path>
                <polyline points="9 22 9 12 15 12 15 22" strokeWidth="2"></polyline>
              </svg>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 uppercase">Academics</span>
          </div>
          <div>
            <div className="text-[32px] font-extrabold text-slate-800 leading-none">{stats.classesCount}</div>
            <div className="text-[14px] text-slate-500 font-semibold mt-1">Total Classes</div>
          </div>
          <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-400 font-medium">
            <strong>Real-time</strong> from Org
          </div>
        </div>

        {/* Average Attendance */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-40">
          <div className="flex justify-between items-center">
            <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
              <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24">
                <line x1="18" y1="20" x2="18" y2="10" strokeWidth="2"></line>
                <line x1="12" y1="20" x2="12" y2="4" strokeWidth="2"></line>
                <line x1="6" y1="20" x2="6" y2="14" strokeWidth="2"></line>
              </svg>
            </div>
            <div className="flex items-center gap-1 text-[12px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600">
              <svg className="w-3 h-3 stroke-current fill-none" viewBox="0 0 24 24">
                <polyline points="18 15 12 9 6 15" strokeWidth="3"></polyline>
              </svg>
              {stats.trends.attendance.value}
            </div>
          </div>
          <div>
            <div className="text-[32px] font-extrabold text-slate-800 leading-none">{stats.attendanceRate}%</div>
            <div className="text-[14px] text-slate-500 font-semibold mt-1">Average Attendance</div>
          </div>
          <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-400 font-medium">
            <strong>Real-time</strong> from Org
          </div>
        </div>

      </div>

      {/* SECTION GRID - admissions and transaction lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RECENT ADMISSIONS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[450px]">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <div className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 stroke-[#2E5BFF] fill-none" viewBox="0 0 24 24">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2"></path>
                  <circle cx="9" cy="7" r="4" strokeWidth="2"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2"></path>
                </svg>
                Recent Admissions
              </div>
              <div className="flex gap-2">
                {admissionsLimit > 5 && (
                  <button
                    onClick={() => setAdmissionsLimit(5)}
                    className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-500 font-semibold text-[12px] rounded-lg transition-colors border border-slate-200 cursor-pointer"
                  >
                    Show Less
                  </button>
                )}
                {admissionsLimit < recentAdmissions.length && (
                  <button
                    onClick={() => setAdmissionsLimit(prev => prev + 5)}
                    className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-500 font-semibold text-[12px] rounded-lg transition-colors border border-slate-200 cursor-pointer"
                  >
                    Show More
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto overflow-x-auto max-h-[320px] border border-slate-100 rounded-xl w-full">
              {displayAdmissions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs italic">No recent admissions found.</div>
              ) : (
                <table className="w-full border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-4 py-3 text-left">Student</th>
                      <th className="px-4 py-3 text-left">Roll No</th>
                      <th className="px-4 py-3 text-left">Class</th>
                      <th className="px-4 py-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[13px] text-slate-600 font-medium">
                    {displayAdmissions.map((adm) => (
                      <tr key={adm.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs select-none">
                              {adm.avatar}
                            </div>
                            <div className="font-semibold text-slate-800">{adm.name}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-mono">{adm.rollNo}</td>
                        <td className="px-4 py-3 text-slate-500">{adm.class}</td>
                        <td className="px-4 py-3 text-slate-400 font-mono text-xs">{adm.joiningDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* RECENT PAYMENTS / TRANSACTIONS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[450px]">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <div className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 stroke-[#2E5BFF] fill-none" viewBox="0 0 24 24">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" strokeWidth="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10" strokeWidth="2"></line>
                </svg>
                Recent Transactions
              </div>
              <div className="flex gap-2">
                {paymentsLimit > 5 && (
                  <button
                    onClick={() => setPaymentsLimit(5)}
                    className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-500 font-semibold text-[12px] rounded-lg transition-colors border border-slate-200 cursor-pointer"
                  >
                    Show Less
                  </button>
                )}
                {paymentsLimit < recentPayments.length && (
                  <button
                    onClick={() => setPaymentsLimit(prev => prev + 5)}
                    className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-500 font-semibold text-[12px] rounded-lg transition-colors border border-slate-200 cursor-pointer"
                  >
                    Show More
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto overflow-x-auto max-h-[320px] border border-slate-100 rounded-xl w-full">
              {displayPayments.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs italic">No transactions found.</div>
              ) : (
                <table className="w-full border-collapse min-w-[500px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-4 py-3 text-left">Type</th>
                      <th className="px-4 py-3 text-left">Particulars</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[13px] text-slate-600 font-medium">
                    {displayPayments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase ${
                            pay.type === 'Fee Payment'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                              : 'bg-rose-50 text-rose-600 border-rose-100'
                          }`}>
                            {pay.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-800 truncate max-w-[150px]" title={pay.name}>{pay.name}</td>
                        <td className={`px-4 py-3 font-bold font-mono text-right ${
                          pay.type === 'Fee Payment' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {pay.type === 'Fee Payment' ? '+' : '-'}{formatCurrency(pay.amount)}
                        </td>
                        <td className="px-4 py-3 text-slate-400 font-mono text-xs">{pay.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-[16px] font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
          <svg className="w-5 h-5 stroke-[#2E5BFF] fill-none" viewBox="0 0 24 24">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" strokeWidth="2"></polygon>
          </svg>
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button onClick={() => alert('Dispatched emergency alert SMS to students registry.')} className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-blue-50 hover:text-[#2E5BFF] rounded-xl border border-slate-200 transition-all gap-2 group h-24">
            <svg className="w-6 h-6 stroke-slate-500 group-hover:stroke-[#2E5BFF] fill-none" viewBox="0 0 24 24">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" strokeWidth="2"></rect>
              <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2"></line>
            </svg>
            <span className="text-xs font-bold text-slate-700 group-hover:text-[#2E5BFF]">Send SMS Alert</span>
          </button>

          <button onClick={() => alert('Aggregated academic report card grades. Sent PDFs to guardians.')} className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-blue-50 hover:text-[#2E5BFF] rounded-xl border border-slate-200 transition-all gap-2 group h-24">
            <svg className="w-6 h-6 stroke-slate-500 group-hover:stroke-[#2E5BFF] fill-none" viewBox="0 0 24 24">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeWidth="2"></path>
              <polyline points="22,6 12,13 2,6" strokeWidth="2"></polyline>
            </svg>
            <span className="text-xs font-bold text-slate-700 group-hover:text-[#2E5BFF]">Email Report Card</span>
          </button>

          <Link href="/dashboard/billing" className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-blue-50 hover:text-[#2E5BFF] rounded-xl border border-slate-200 transition-all gap-2 group h-24">
            <svg className="w-6 h-6 stroke-slate-500 group-hover:stroke-[#2E5BFF] fill-none" viewBox="0 0 24 24">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" strokeWidth="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10" strokeWidth="2"></line>
            </svg>
            <span className="text-xs font-bold text-slate-700 group-hover:text-[#2E5BFF]">Process Payment</span>
          </Link>

          <Link href="/dashboard/reports" className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-blue-50 hover:text-[#2E5BFF] rounded-xl border border-slate-200 transition-all gap-2 group h-24">
            <svg className="w-6 h-6 stroke-slate-500 group-hover:stroke-[#2E5BFF] fill-none" viewBox="0 0 24 24">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83" strokeWidth="2"></path>
              <path d="M22 12A10 10 0 0 0 12 2v10z" strokeWidth="2"></path>
            </svg>
            <span className="text-xs font-bold text-slate-700 group-hover:text-[#2E5BFF]">Generate Analytics</span>
          </Link>
        </div>
      </div>

      {/* ROADMAP CARD */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-[16px] font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
          <span>✨</span>
          Trending Features & Roadmap
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2E5BFF] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" strokeWidth="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2"></line>
              </svg>
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-slate-850 flex items-center gap-2">
                Parent Mobile App
                <span className="bg-emerald-50 text-[#00C48C] text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100">Live Now</span>
              </h4>
              <p className="text-slate-500 text-xs mt-1 font-light leading-relaxed">
                Real-time updates on attendance, grades, and fee payments.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#8B5CF6] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" strokeWidth="2"></path>
                <circle cx="12" cy="13" r="4" strokeWidth="2"></circle>
              </svg>
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-slate-850 flex items-center gap-2">
                Face Recognition
                <span className="bg-purple-50 text-[#8B5CF6] text-[10px] font-bold px-2 py-0.5 rounded border border-purple-100">Beta</span>
              </h4>
              <p className="text-slate-500 text-xs mt-1 font-light leading-relaxed">
                Automated attendance marking using facial recognition.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00C48C] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24">
                <line x1="12" y1="1" x2="12" y2="23" strokeWidth="2"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeWidth="2"></path>
              </svg>
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-slate-850 flex items-center gap-2">
                Auto-Debit Setup
                <span className="bg-indigo-50 text-indigo-500 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-100">Premium</span>
              </h4>
              <p className="text-slate-500 text-xs mt-1 font-light leading-relaxed">
                Automated quarterly fee deduction with UPI autopay.
              </p>
            </div>
          </div>
        </div>
      </div>

      <BulkImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={(count) => {
          alert(`Successfully imported ${count} student records!`);
          dispatchSchoolSetupUpdated();
        }}
      />
    </div>
  );
}
