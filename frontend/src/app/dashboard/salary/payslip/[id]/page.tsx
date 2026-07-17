'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Printer, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

interface PayslipData {
  schoolLogo: string;
  schoolName: string;
  teacherName: string;
  employeeId: string;
  designation: string;
  department: string;
  salaryMonth: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  pfDeduction: number;
  bonus: number;
  grossSalary: number;
  netSalary: number;
  paymentDate: string;
  paymentMethod: string;
  payrollReference: string;
  authorizedSignature: string;
}

export default function PayslipPrintPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const expenseId = params.id as string;
  const shouldPrint = searchParams.get('print') === 'true';

  const [payslip, setPayslip] = useState<PayslipData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayslip = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/teacher-portal/salary/payslip/${expenseId}`);
        setPayslip(res.data);
      } catch (err: any) {
        console.error('Failed to load payslip data', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch payslip details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayslip();
  }, [expenseId]);

  // Trigger print once data is loaded if ?print=true was set
  useEffect(() => {
    if (payslip && shouldPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [payslip, shouldPrint]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-medium text-xs text-slate-400">
        Loading printable payslip stub data...
      </div>
    );
  }

  if (error || !payslip) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center gap-4">
        <div className="text-rose-600 font-bold text-sm">Error: {error || 'Payslip not found.'}</div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-750 dark:text-slate-200 font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 print:bg-white print:p-0 p-3 sm:p-6 flex flex-col items-center">
      {/* ── Print Sizing Styles Override ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 12mm !important;
          }
          html, body {
            height: auto !important;
            overflow: visible !important;
            background: white !important;
          }
          .print-card {
            border: none !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            transform: scale(0.92);
            transform-origin: top center;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
          }
        }
      `}} />

      {/* ── Top Action Bar (hidden during print) ── */}
      <div className="w-full max-w-[800px] mb-4 sm:mb-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 sm:p-4 shadow-sm print:hidden">
        <button
          onClick={() => router.back()}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 font-semibold text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Salary List
        </button>
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[13px] flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </button>
      </div>

      {/* ── Payslip Sheet (A4-styled printable card) ── */}
      <div className="print-card w-full max-w-[800px] bg-white text-slate-800 border border-slate-200 print:border-none shadow-lg print:shadow-none print:min-h-0 relative font-sans print:m-0 flex flex-col print:block">
        {/* Header Block with Navy blue bar */}
        <div className="bg-[#1e3a8a] text-white border-b-[6px] border-amber-500 relative p-6 sm:p-8 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-[20px] sm:text-[24px] font-black uppercase tracking-tight leading-tight">
              {payslip.schoolName}
            </h1>
            <p className="text-[11px] sm:text-[12px] text-slate-350 font-semibold italic">
              Powered by Covenant Synergy
            </p>
          </div>
          <div className="w-[80px] h-[80px] bg-white rounded-full border-2 border-white shadow-md p-1.5 flex items-center justify-center overflow-hidden shrink-0">
            {payslip.schoolLogo ? (
              <img src={payslip.schoolLogo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <svg className="w-[50px] h-[50px] stroke-[#1e3a8a] stroke-[2] fill-none" viewBox="0 0 24 24">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
              </svg>
            )}
          </div>
        </div>

        {/* Payslip Details Body */}
        <div className="p-5 sm:p-8 space-y-6 sm:space-y-8 flex-1">
          {/* Title */}
          <div className="text-center border-b border-slate-200 pb-4">
            <h2 className="text-[16px] sm:text-[18px] font-black uppercase tracking-widest text-[#1e3a8a]">
              PAYSLIP / SALARY RECEIPT
            </h2>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Salary Statement for the Month of <span className="font-extrabold text-slate-800">{payslip.salaryMonth}</span>
            </p>
          </div>

          {/* Teacher employee info metadata section */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs border-b border-slate-200 pb-5">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wide text-[9px] block">Teacher Name</span>
              <span className="font-bold text-slate-800">{payslip.teacherName}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wide text-[9px] block">Employee ID</span>
              <span className="font-bold text-slate-800 font-mono">{payslip.employeeId}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wide text-[9px] block">Designation</span>
              <span className="font-medium text-slate-800">{payslip.designation}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wide text-[9px] block">Department</span>
              <span className="font-medium text-slate-800">{payslip.department}</span>
            </div>
          </div>

          {/* Earnings & Deductions Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Earnings */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-[#1e3a8a] text-[10px] font-black uppercase tracking-wider">
                Earnings / Allowances
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="px-4 py-3 flex justify-between">
                  <span className="font-semibold text-slate-600">Basic Salary</span>
                  <span className="font-bold text-slate-900">₹{payslip.basicSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="px-4 py-3 flex justify-between">
                  <span className="font-semibold text-slate-600">Allowances</span>
                  <span className="font-bold text-slate-900">₹{payslip.allowances.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="px-4 py-3 flex justify-between">
                  <span className="font-semibold text-slate-600">Bonus / Incentives</span>
                  <span className="font-bold text-slate-900">₹{payslip.bonus.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="bg-[#f0fdf4] px-4 py-3 flex justify-between text-emerald-800 font-bold border-t border-slate-250">
                  <span>Gross Salary</span>
                  <span>₹{payslip.grossSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-[#1e3a8a] text-[10px] font-black uppercase tracking-wider">
                Deductions
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="px-4 py-3 flex justify-between">
                  <span className="font-semibold text-slate-600">Provident Fund (PF)</span>
                  <span className="font-bold text-slate-900">₹{payslip.pfDeduction.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="px-4 py-3 flex justify-between">
                  <span className="font-semibold text-slate-600">Other Deductions</span>
                  <span className="font-bold text-slate-900">₹{payslip.deductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="bg-[#fdf2f2] px-4 py-3 flex justify-between text-rose-800 font-bold border-t border-slate-250">
                  <span>Total Deductions</span>
                  <span>₹{(payslip.deductions + payslip.pfDeduction).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment metadata summary */}
          <div className="bg-[#f8fafc] border border-slate-200 p-4 rounded-xl text-xs space-y-2">
            <h3 className="font-bold text-[#1e3a8a] text-[10px] uppercase tracking-wider">Disbursement transaction details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6 text-slate-700">
              <div>
                <span className="font-semibold text-slate-400 mr-2">Payment Date:</span>
                <span className="font-bold text-slate-800">{payslip.paymentDate}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400 mr-2">Payment Method:</span>
                <span className="font-bold text-slate-850 font-mono uppercase">{payslip.paymentMethod.replace('_', ' ')}</span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="font-semibold text-slate-400 mr-2">Reference No:</span>
                <span className="font-mono text-slate-850 break-all">{payslip.payrollReference}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Net Salary Take Home & Signature Block */}
        <div className="p-5 sm:p-8 border-t border-slate-150 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 sm:gap-0 bg-slate-50/50">
          <div>
            <div className="bg-[#1e3a8a] text-white rounded-lg px-6 py-4 flex items-center justify-between gap-6 sm:gap-8 min-w-[280px]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-350">Net Take Home Salary</span>
              <span className="text-[20px] font-black font-mono">
                ₹{payslip.netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-2 text-center sm:text-left max-w-xs">
              Secure digital payroll statement. Fully integrated with covenant school management protocols.
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end text-center sm:text-right shrink-0 pr-2">
            <div className="h-10"></div> {/* Signature placeholder */}
            <div className="w-[160px] border-b-2 border-slate-400 mb-1.5"></div>
            <span className="text-[11px] font-black text-slate-800">{payslip.authorizedSignature}</span>
            <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wide">Authorized Signatory</span>
          </div>
        </div>
      </div>
    </div>
  );
}
