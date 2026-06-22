'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { mockStudents } from '@/lib/mockData';
import BulkImportModal from '@/components/BulkImportModal';

export default function DashboardOverview() {
  const [admissionsLimit, setAdmissionsLimit] = useState(5);
  const [paymentsLimit, setPaymentsLimit] = useState(5);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Dynamic calculations from mockData
  const totalStudents = mockStudents.length;
  
  // Format revenue formatted in Lacs if > 100,000
  const rawRevenue = mockStudents.reduce((sum, s) => sum + s.paidAmount, 0);
  const totalRevenue = rawRevenue > 100000 
    ? '₹' + (rawRevenue / 100000).toFixed(1) + 'L'
    : '₹' + rawRevenue.toLocaleString();

  // Trends mapped exactly from LWC defaults
  const studentTrend = { value: '12.4%', isUp: true };
  const revenueTrend = { value: '8.2%', isUp: true };
  const attendanceTrend = { value: '1.5%', isUp: true };
  const scoreTrend = { value: '0.8%', isUp: false };

  // Recent Admissions List
  const recentAdmissions = mockStudents.slice(0, 15).map((student, idx) => ({
    id: student.id,
    name: student.name,
    avatar: student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
    class: student.class + ' - ' + student.section.replace('Section ', ''),
    status: 'Active'
  }));

  // Payment Overview List
  const paymentOverview = mockStudents.filter(s => s.paidAmount > 0).slice(0, 15).map((student, idx) => {
    const isFull = student.balanceDue === 0;
    return {
      id: `INV-2026-${String(idx + 1).padStart(3, '0')}`,
      name: `${student.name} - Tuition Fees`,
      amount: '₹' + student.paidAmount.toLocaleString(),
      status: isFull ? 'Paid' : 'Partial',
      statusClass: isFull ? 'badge-status badge-paid' : 'badge-status badge-partial'
    };
  });

  const displayAdmissions = recentAdmissions.slice(0, admissionsLimit);
  const displayPayments = paymentOverview.slice(0, paymentsLimit);

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

      {/* STATS GRID - Replicates exactly the blue/green/purple/orange design cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between h-40">
          <div className="flex justify-between items-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2E5BFF] flex items-center justify-center">
              <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" strokeWidth="2"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5" strokeWidth="2"></path>
              </svg>
            </div>
            <div className="flex items-center gap-1 text-[12px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[#00C48C]">
              <svg className="w-3 h-3 stroke-current fill-none" viewBox="0 0 24 24">
                <polyline points="18 15 12 9 6 15" strokeWidth="3"></polyline>
              </svg>
              {studentTrend.value}
            </div>
          </div>
          <div>
            <div className="text-[32px] font-extrabold text-slate-800 leading-none">{totalStudents}</div>
            <div className="text-[14px] text-slate-500 font-semibold mt-1">Total Students</div>
          </div>
          <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-400 font-medium">
            <strong>Real-time</strong> from Org
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between h-40">
          <div className="flex justify-between items-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#00C48C] flex items-center justify-center">
              <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24">
                <line x1="12" y1="1" x2="12" y2="23" strokeWidth="2"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeWidth="2"></path>
              </svg>
            </div>
            <div className="flex items-center gap-1 text-[12px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[#00C48C]">
              <svg className="w-3 h-3 stroke-current fill-none" viewBox="0 0 24 24">
                <polyline points="18 15 12 9 6 15" strokeWidth="3"></polyline>
              </svg>
              {revenueTrend.value}
            </div>
          </div>
          <div>
            <div className="text-[32px] font-extrabold text-slate-800 leading-none">{totalRevenue}</div>
            <div className="text-[14px] text-slate-500 font-semibold mt-1">Total Revenue</div>
          </div>
          <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-400 font-medium">
            <strong>Real-time</strong> from Org
          </div>
        </div>

        {/* Average Attendance */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between h-40">
          <div className="flex justify-between items-center">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#8B5CF6] flex items-center justify-center">
              <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24">
                <line x1="18" y1="20" x2="18" y2="10" strokeWidth="2"></line>
                <line x1="12" y1="20" x2="12" y2="4" strokeWidth="2"></line>
                <line x1="6" y1="20" x2="6" y2="14" strokeWidth="2"></line>
              </svg>
            </div>
            <div className="flex items-center gap-1 text-[12px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[#00C48C]">
              <svg className="w-3 h-3 stroke-current fill-none" viewBox="0 0 24 24">
                <polyline points="18 15 12 9 6 15" strokeWidth="3"></polyline>
              </svg>
              {attendanceTrend.value}
            </div>
          </div>
          <div>
            <div className="text-[32px] font-extrabold text-slate-800 leading-none">95.2%</div>
            <div className="text-[14px] text-slate-500 font-semibold mt-1">Average Attendance</div>
          </div>
          <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-400 font-medium">
            <strong>Real-time</strong> from Org
          </div>
        </div>

        {/* Avg. Academic Score */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between h-40">
          <div className="flex justify-between items-center">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF6B35] flex items-center justify-center">
              <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" strokeWidth="2"></path>
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" strokeWidth="2"></path>
                <path d="M4 22h16" strokeWidth="2"></path>
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" strokeWidth="2"></path>
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" strokeWidth="2"></path>
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" strokeWidth="2"></path>
              </svg>
            </div>
            <div className="flex items-center gap-1 text-[12px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-[#FF647C]">
              <svg className="w-3 h-3 stroke-current fill-none" viewBox="0 0 24 24">
                <polyline points="6 9 12 15 18 9" strokeWidth="3"></polyline>
              </svg>
              {scoreTrend.value}
            </div>
          </div>
          <div>
            <div className="text-[32px] font-extrabold text-slate-800 leading-none">84.5%</div>
            <div className="text-[14px] text-slate-500 font-semibold mt-1">Avg. Academic Score</div>
          </div>
          <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-400 font-medium">
            <strong>Real-time</strong> from Org
          </div>
        </div>
      </div>

      {/* SECTION GRID - admissions and billing lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RECENT ADMISSIONS */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[450px]">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <div className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 stroke-[#2E5BFF] fill-none" viewBox="0 0 24 24">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeWidth="2"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2"></path>
                </svg>
                Recent Admissions
              </div>
              <div className="flex gap-2">
                {admissionsLimit > 5 && (
                  <button
                    onClick={() => setAdmissionsLimit(5)}
                    className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-500 font-semibold text-[12px] rounded-lg transition-colors border border-slate-200"
                  >
                    Show Less
                  </button>
                )}
                {admissionsLimit < recentAdmissions.length && (
                  <button
                    onClick={() => setAdmissionsLimit(prev => prev + 5)}
                    className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-500 font-semibold text-[12px] rounded-lg transition-colors border border-slate-200"
                  >
                    Show More
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto max-h-[320px] border border-slate-100 rounded-xl">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">Student</th>
                    <th className="px-4 py-3 text-left">Class</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px] text-slate-600 font-medium">
                  {displayAdmissions.map((adm) => (
                    <tr key={adm.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-xs">
                            {adm.avatar}
                          </div>
                          <div className="font-semibold text-slate-800">{adm.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{adm.class}</td>
                      <td className="px-4 py-3">
                        <span className="bg-emerald-50 text-[#00C48C] text-[11px] font-bold px-2 py-0.5 rounded-md border border-emerald-100">
                          {adm.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* PAYMENT OVERVIEW */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[450px]">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <div className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 stroke-[#2E5BFF] fill-none" viewBox="0 0 24 24">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" strokeWidth="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10" strokeWidth="2"></line>
                </svg>
                Payment Overview
              </div>
              <div className="flex gap-2">
                {paymentsLimit > 5 && (
                  <button
                    onClick={() => setPaymentsLimit(5)}
                    className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-500 font-semibold text-[12px] rounded-lg transition-colors border border-slate-200"
                  >
                    Show Less
                  </button>
                )}
                {paymentsLimit < paymentOverview.length && (
                  <button
                    onClick={() => setPaymentsLimit(prev => prev + 5)}
                    className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-500 font-semibold text-[12px] rounded-lg transition-colors border border-slate-200"
                  >
                    Show More
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto max-h-[320px] border border-slate-100 rounded-xl">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">Invoice</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px] text-slate-600 font-medium">
                  {displayPayments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-800">{pay.name}</td>
                      <td className="px-4 py-3 font-bold text-slate-900 font-mono">{pay.amount}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                          pay.status === 'Paid'
                            ? 'bg-emerald-50 text-[#00C48C] border-emerald-100'
                            : 'bg-blue-50 text-[#2E5BFF] border-blue-100'
                        }`}>
                          {pay.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
        }}
      />
    </div>
  );
}
