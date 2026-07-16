'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { dispatchSchoolSetupUpdated } from '@/lib/events';
import { useTenant } from '@/app/providers/TenantContext';
import { 
  Receipt, Search, CreditCard, Sparkles, X, CheckCircle2, 
  QrCode, User, ArrowRight, CornerDownRight, RotateCcw,
  BookOpen, Calendar, Printer, ShieldCheck
} from 'lucide-react';

interface StagedInvoice {
  id: string;
  name: string;
  rollNo: string;
  dateStr: string;
  totalAmount: number;
  paymentMethod: string;
  status: string;
}

export default function FeesBillingPage() {
  const { setupStats } = useTenant();
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [academicYears, setAcademicYears] = useState<{ label: string; value: string }[]>([]);

  // Fee particulars checklist states
  const [feeItems, setFeeItems] = useState<any[]>([]);

  // Payment Channels
  const paymentChannels = [
    { value: 'GPAY_UPI', label: 'GPay UPI', icon: '⚡' },
    { value: 'PHONEPE_UPI', label: 'PhonePe UPI', icon: '📱' },
    { value: 'CASH', label: 'Physical Cash', icon: '💵' },
    { value: 'NET_BANKING', label: 'Net Banking', icon: '🏦' }
  ];
  const [selectedChannel, setSelectedChannel] = useState('GPAY_UPI');

  // Net Banking Form
  const [bankName, setBankName] = useState('HDFC Bank');
  const [ifscCode, setIfscCode] = useState('HDFC0000120');
  const [accountNo, setAccountNo] = useState('50100239485729');

  // History logs
  const [transactions, setTransactions] = useState<StagedInvoice[]>([]);
  const [matchingStudents, setMatchingStudents] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial options & recent invoices
  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [yRes, txRes] = await Promise.all([
          api.get('/billing/options/years'),
          api.get('/billing/invoices/recent')
        ]);
        setAcademicYears(yRes.data);
        if (yRes.data.length > 0) {
          setSelectedYear(yRes.data[0].value);
        }
        setTransactions(txRes.data);
      } catch (err) {
        console.error('Failed to fetch initial billing data', err);
      }
    };
    fetchInit();
  }, []);

  // Search students
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (search.trim().length >= 2) {
        try {
          const res = await api.get(`/billing/students/search`, {
            params: { searchTerm: search }
          });
          setMatchingStudents(res.data);
        } catch (err) {
          console.error('Error searching students', err);
        }
      } else {
        setMatchingStudents([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const loadUnpaidFees = async (oppId: string) => {
    try {
      setIsLoading(true);
      const res = await api.get(`/billing/unpaid-fees/${oppId}`);
      setFeeItems(res.data.map((item: any) => ({
        id: item.oliId,
        name: item.productName,
        total: item.totalAmount,
        discount: item.discountAmount,
        paid: item.paidAmount,
        balance: item.balanceDue,
        input: item.balanceDue,
        isSelected: item.balanceDue > 0,
        productId: item.productId,
        discountPercent: item.discountPercent
      })));
    } catch (err) {
      console.error('Failed to load unpaid fees', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectStudent = (student: any) => {
    setSelectedStudent(student);
    setSearch('');
    setMatchingStudents([]);
    
    const openOpp = student.account.opportunities?.[0];
    if (openOpp) {
      loadUnpaidFees(openOpp.id);
    } else {
      setFeeItems([]);
    }
  };

  const handleCheckboxChange = (id: string) => {
    setFeeItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, isSelected: !item.isSelected };
      }
      return item;
    }));
  };

  const handleInputChange = (id: string, val: number) => {
    setFeeItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, input: Math.min(val, item.balance) };
      }
      return item;
    }));
  };

  // Calculation total
  const billingTotal = feeItems.reduce((sum, item) => {
    return sum + (item.isSelected ? item.input : 0);
  }, 0);

  const handleFinalizePayment = async () => {
    if (!selectedStudent || billingTotal <= 0) return;

    const openOpp = selectedStudent.account.opportunities?.[0];
    if (!openOpp) return;

    const itemsToPay = feeItems
      .filter(item => item.isSelected && item.input > 0)
      .map(item => ({
        oliId: item.id,
        productId: item.productId,
        amount: item.input
      }));

    try {
      setIsLoading(true);
      await api.post('/billing/invoices', {
        opportunityId: openOpp.id,
        studentId: selectedStudent.account.id,
        items: itemsToPay,
        paymentMethod: selectedChannel,
        bankDetails: selectedChannel === 'NET_BANKING' ? {
          bankName,
          bankIfsc: ifscCode,
          bankAccountNumber: accountNo,
          bankBranch: 'Main Branch'
        } : null
      });

      setToastMessage(`Success: Payment of ₹${billingTotal.toLocaleString()} logged for ${selectedStudent.account.name}.`);
      
      // Dispatch event to refresh dashboard in real-time
      dispatchSchoolSetupUpdated();

      // Clear select & reload history
      setSelectedStudent(null);
      setFeeItems([]);
      
      const txRes = await api.get('/billing/invoices/recent');
      setTransactions(txRes.data);

      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('Payment failed', err);
      alert(`Payment registration failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRollback = async (id: string) => {
    if (!confirm('Are you sure you want to void this invoice payment?')) return;
    try {
      setIsLoading(true);
      await api.post(`/billing/invoices/${id}/void`);
      // Dispatch event to refresh dashboard in real-time
      dispatchSchoolSetupUpdated();
      alert(`Rollback: Transaction invoice voided successfully.`);
      
      const txRes = await api.get('/billing/invoices/recent');
      setTransactions(txRes.data);
    } catch (err: any) {
      console.error('Voiding failed', err);
      alert(`Failed to void invoice: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-[28px] font-bold text-slate-900 leading-none">
            Fee Management & Invoicing
          </h2>
          <p className="text-slate-500 text-[13px] font-medium mt-2">
            Collect school tuition fees, issue transaction logs, and generate invoice bills.
          </p>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-3 text-sm animate-pulse">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="font-semibold">{toastMessage} Ledger balances updated.</div>
        </div>
      )}

      {/* QUICK STUDENT SEARCH */}
      <div className="space-y-2 relative max-w-lg">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Quick Student Search</label>
        <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus-within:border-[#2E5BFF] transition-all">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Type student name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-[13px] font-semibold text-slate-800 outline-none w-full placeholder-slate-400"
          />
        </div>

        {/* Autocomplete Dropdown list */}
        {matchingStudents.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {matchingStudents.map((s) => (
              <div
                key={s.account.id}
                onClick={() => handleSelectStudent(s)}
                className="p-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center text-xs font-medium"
              >
                <div>
                  <span className="font-bold text-slate-800 block">{s.account.name}</span>
                  <span className="text-slate-400 text-[10px]">{s.account.class} {s.account.section} · Roll: {s.account.rollNo || 'N/A'}</span>
                </div>
                <span className="text-amber-600 font-bold font-mono">Due: ₹{s.totalPendingBalance.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACTIVE BILLING SUITE PANEL */}
      {selectedStudent ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-850 text-base flex items-center gap-1.5">
                <User className="w-5 h-5 text-blue-500 shrink-0" />
                Ledger: <span className="text-blue-600 font-black">{selectedStudent.account.name}</span>
              </h3>
              <p className="text-[11px] text-slate-450 mt-1 font-semibold">
                Roll: {selectedStudent.account.rollNo || 'N/A'} · {selectedStudent.account.class} {selectedStudent.account.section}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 font-bold bg-white"
              >
                {academicYears.map(ay => (
                  <option key={ay.value} value={ay.value}>{ay.label}</option>
                ))}
              </select>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 text-xs font-bold font-mono">
                PENDING: ₹{selectedStudent.totalPendingBalance.toLocaleString()}
              </span>
            </div>
          </div>

          {selectedStudent.feeSummary && (
            <div className="bg-slate-50/50 border border-slate-200 rounded-2xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Current Year */}
              <div className="bg-white p-3.5 border border-slate-150 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Academic Year</span>
                <div className="divide-y divide-slate-100 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between py-1">
                    <span>Fee Products:</span>
                    <strong className="text-slate-800 font-mono">₹{selectedStudent.feeSummary.currentYear.feeProductsAmount.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Paid Amount:</span>
                    <strong className="text-emerald-600 font-mono">₹{selectedStudent.feeSummary.currentYear.paidAmount.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between py-1 pt-1.5">
                    <span className="font-bold">Pending Amount:</span>
                    <strong className="text-rose-600 font-bold font-mono">₹{selectedStudent.feeSummary.currentYear.pendingAmount.toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              {/* Card 2: Previous Year Outstanding */}
              <div className="bg-white p-3.5 border border-slate-150 rounded-xl space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Previous Year Outstanding</span>
                  <div className="max-h-20 overflow-y-auto divide-y divide-slate-100 text-xs text-slate-650 mt-1 font-semibold space-y-1">
                    {selectedStudent.feeSummary.previousYears.length > 0 ? (
                      selectedStudent.feeSummary.previousYears.map((py: any, idx: number) => (
                        <div key={idx} className="flex justify-between py-1">
                          <span className="text-slate-500 font-medium">Session {py.academicYearName}:</span>
                          <strong className="text-rose-600 font-mono">₹{py.outstandingBalance.toLocaleString()}</strong>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-400 py-3 text-center italic text-[11px] font-medium">
                        No previous year outstanding dues
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 3: Overall Outstanding */}
              <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white p-4 rounded-xl space-y-2 flex flex-col justify-between shadow-md">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overall Outstanding</span>
                <div className="text-xs text-slate-300 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Current Year Due:</span>
                    <strong className="text-slate-200 font-mono">₹{selectedStudent.feeSummary.overall.totalCurrentYearDue.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Previous Year Due:</span>
                    <strong className="text-amber-400 font-mono">₹{selectedStudent.feeSummary.overall.totalPreviousYearDue.toLocaleString()}</strong>
                  </div>
                  <div className="border-t border-slate-700/50 my-1 pt-1.5 flex justify-between">
                    <span className="font-bold text-slate-100">Grand Total Due:</span>
                    <strong className="text-rose-400 text-sm font-black font-mono">₹{selectedStudent.feeSummary.overall.grandTotalBalanceDue.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="py-12 text-center text-slate-400 font-medium text-xs animate-pulse">
              Processing fees query...
            </div>
          ) : feeItems.length === 0 ? (
            <div className="py-8 text-center text-slate-400 bg-slate-50 border border-slate-250 border-dashed rounded-xl text-xs font-medium">
              No outstanding fee structures or open opportunities found for this student.
            </div>
          ) : (
            <>
              {/* ── Fee Table: Desktop (sm and above) ── */}
              <div className="hidden sm:block overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-4 py-3" style={{ width: '40px' }}></th>
                      <th className="px-4 py-3">Fee Particulars</th>
                      <th className="px-4 py-3 text-right">Total Amt</th>
                      <th className="px-4 py-3 text-right">Discount</th>
                      <th className="px-4 py-3 text-right">Paid</th>
                      <th className="px-4 py-3 text-right">Balance</th>
                      <th className="px-4 py-3 text-right" style={{ width: '130px' }}>Payment Input</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-650 font-semibold">
                    {feeItems.map((fee) => {
                      const isPaid = fee.balance <= 0;
                      return (
                        <tr key={fee.id} className={`${fee.isSelected ? 'bg-blue-50/10' : ''}`}>
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={fee.isSelected}
                              disabled={isPaid}
                              onChange={() => handleCheckboxChange(fee.id)}
                              className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-800">{fee.name}</td>
                          <td className="px-4 py-3 text-right font-mono">₹{fee.total.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-mono text-slate-400">₹{fee.discount.toLocaleString()} ({fee.discountPercent}%)</td>
                          <td className="px-4 py-3 text-right font-mono text-slate-500">₹{fee.paid.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right font-mono text-rose-600 font-bold">₹{fee.balance.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right">
                            <input
                              type="number"
                              value={fee.isSelected ? fee.input : 0}
                              disabled={!fee.isSelected || isPaid}
                              onChange={(e) => handleInputChange(fee.id, Number(e.target.value))}
                              className="w-24 bg-white border border-slate-200 rounded px-2 py-1 text-right font-mono text-slate-800 font-bold outline-none"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ── Fee Cards: Mobile only (below sm) ── */}
              <div className="sm:hidden space-y-2.5">
                {feeItems.map((fee) => {
                  const isPaid = fee.balance <= 0;
                  return (
                    <div
                      key={fee.id}
                      className={`border rounded-xl p-3 space-y-2.5 transition-all ${
                        fee.isSelected
                          ? 'bg-blue-50/40 border-blue-200'
                          : 'bg-white border-slate-200'
                      } ${isPaid ? 'opacity-60' : ''}`}
                    >
                      {/* Primary row: Checkbox + Name + Total */}
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={fee.isSelected}
                          disabled={isPaid}
                          onChange={() => handleCheckboxChange(fee.id)}
                          className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="font-bold text-slate-800 text-[13px] block leading-tight">{fee.name}</span>
                          {isPaid && (
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100 mt-0.5 inline-block">
                              ✓ Fully Paid
                            </span>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[13px] font-bold text-slate-700 font-mono">₹{fee.total.toLocaleString()}</span>
                          <span className="text-[9px] text-slate-400 font-medium block">Total</span>
                        </div>
                      </div>

                      {/* Secondary row: Balance + Payment input */}
                      <div className="flex items-end justify-between gap-3 pl-8">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide block">Balance Due</span>
                          <span className={`text-sm font-bold font-mono ${fee.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            ₹{fee.balance.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Pay Now</span>
                          <input
                            type="number"
                            value={fee.isSelected ? fee.input : 0}
                            disabled={!fee.isSelected || isPaid}
                            onChange={(e) => handleInputChange(fee.id, Number(e.target.value))}
                            className="w-28 bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-right font-mono text-slate-800 font-bold text-sm outline-none focus:border-blue-400 disabled:opacity-50 disabled:bg-slate-50"
                          />
                        </div>
                      </div>

                      {/* Tertiary row: Discount + Paid (collapsed info) */}
                      <div className="flex gap-4 pl-8 text-[10px] text-slate-400 font-medium border-t border-slate-100 pt-2">
                        <span>Disc: <span className="text-slate-600 font-semibold">₹{fee.discount.toLocaleString()} ({fee.discountPercent}%)</span></span>
                        <span>Paid: <span className="text-slate-600 font-semibold">₹{fee.paid.toLocaleString()}</span></span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Total Summary Banner ── */}
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl px-4 py-3.5 shadow-md shadow-blue-500/20">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">Total Settlement</span>
                  <span className="text-2xl font-black font-mono">₹{billingTotal.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-blue-200 block">{feeItems.filter(f => f.isSelected).length} fee(s) selected</span>
                  <span className="text-xs font-bold text-blue-100">Ready to collect</span>
                </div>
              </div>

              {/* Payment Method selector */}
              <div className="space-y-3 pt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Choose Collection Channel</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {paymentChannels.map((c) => {
                    const isSelected = selectedChannel === c.value;
                    return (
                      <div
                        key={c.value}
                        onClick={() => setSelectedChannel(c.value)}
                        className={`p-3 sm:p-4 border rounded-xl cursor-pointer flex flex-col items-center justify-center gap-1 transition-all ${
                          isSelected 
                            ? 'bg-blue-50 border-[#2E5BFF] text-[#2E5BFF] font-bold shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold'
                        }`}
                      >
                        <span className="text-xl">{c.icon}</span>
                        <span className="text-xs text-center leading-tight">{c.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic details for UPI and Bank */}
              {selectedChannel.includes('UPI') && (() => {
                const tenant = setupStats?.setup?.tenant;
                const merchantName = setupStats?.setup?.schoolName || tenant?.name || 'School Merchant';
                let activeUpiId = '';
                if (selectedChannel === 'GPAY_UPI') {
                  activeUpiId = tenant?.googlePayId || '';
                } else if (selectedChannel === 'PHONEPE_UPI') {
                  activeUpiId = tenant?.phonePeId || '';
                }
                if (!activeUpiId) {
                  activeUpiId = tenant?.upiQrId || '';
                }
                const isMockUpi = !activeUpiId;
                const displayUpiId = activeUpiId || 'gpay-vikas-edu@okaxis';

                // UPI standard transaction payload format
                const upiLink = `upi://pay?pa=${encodeURIComponent(displayUpiId)}&pn=${encodeURIComponent(merchantName)}&am=${billingTotal}&cu=INR`;
                const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

                return (
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl max-w-sm mx-auto flex flex-col items-center text-center space-y-3">
                    <span className="text-xs font-bold text-slate-650 uppercase tracking-wider">Scan Standee QR</span>
                    <div className="w-36 h-36 bg-white p-2 border border-slate-200 rounded-xl shadow-sm flex items-center justify-center overflow-hidden">
                      <img 
                        src={qrCodeUrl} 
                        alt="UPI Payment QR Code" 
                        className="w-32 h-32 object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-500 font-mono block">
                        UPI ID: <span className="font-bold text-slate-800">{displayUpiId}</span>
                      </span>
                      {isMockUpi && (
                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 block">
                          ⚠️ Demo Mode: Configure your merchant UPI ID in Settings
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-blue-600 font-bold bg-blue-50/50 px-3 py-1 rounded-full border border-blue-100">
                      Scan to complete physical ₹{billingTotal.toLocaleString()} collection
                    </p>
                  </div>
                );
              })()}

              {selectedChannel === 'NET_BANKING' && (
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-3 text-xs">
                  <h4 className="font-bold text-slate-700">Net Banking Settlement details:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-semibold">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Bank Name</span>
                      <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full bg-white border border-slate-200 rounded p-1.5" />
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">IFSC Code</span>
                      <input type="text" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} className="w-full bg-white border border-slate-200 rounded p-1.5" />
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 block mb-0.5">Account Number</span>
                      <input type="text" value={accountNo} onChange={(e) => setAccountNo(e.target.value)} className="w-full bg-white border border-slate-200 rounded p-1.5" />
                    </div>
                  </div>
                </div>
              )}

              {/* Footer action buttons */}
              <div className="border-t border-slate-100 pt-4 flex gap-2">
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm bg-white hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFinalizePayment}
                  className="flex-1 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-500/10"
                >
                  ✓ Finalize Payment
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="p-8 text-center bg-white border border-slate-200 border-dashed rounded-2xl space-y-2 max-w-lg">
          <span className="text-2xl block">🔎</span>
          <h4 className="text-sm font-bold text-slate-700">Find a Student to begin</h4>
          <p className="text-xs text-slate-450 font-light">
            Type at least 2 characters in the quick search input to find outstanding records.
          </p>
        </div>
      )}

      {/* RECENT TRANSACTION HISTORY */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-850 text-base">Recent Transaction History</h3>
        
        {transactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-xs font-semibold">
            No recent payment transactions recorded.
          </div>
        ) : (
          <>
            {/* ── Transactions Table: Desktop ── */}
            <div className="hidden sm:block overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="px-4 py-3">Invoice ID</th>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Channel</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Management Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-650 font-semibold">
                  {transactions.map((t) => {
                    const isCancelled = t.status === 'Cancelled';
                    return (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-slate-800">{t.id.slice(0, 8)}...</td>
                        <td className="px-4 py-3">
                          <div>{t.name}</div>
                          <div className="text-[10px] text-slate-400">Roll: {t.rollNo || 'N/A'}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-450">{t.dateStr}</td>
                        <td className="px-4 py-3 font-bold text-slate-800 font-mono">₹{t.totalAmount.toLocaleString()}</td>
                        <td className="px-4 py-3 text-slate-500">{t.paymentMethod}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                            isCancelled 
                              ? 'bg-rose-50 text-rose-600 border-rose-100'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/dashboard/billing/invoices/${t.id}`}
                              className="px-2.5 py-1 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-[10px] font-bold border border-slate-200 inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Printer className="w-3 h-3" /> Print
                            </Link>
                            {!isCancelled && (
                              <button
                                onClick={() => handleRollback(t.id)}
                                className="px-2.5 py-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100/30 text-[10px] font-bold border border-rose-100 inline-flex items-center gap-1 cursor-pointer"
                              >
                                <RotateCcw className="w-3 h-3" /> Rollback
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Transaction Cards: Mobile ── */}
            <div className="sm:hidden space-y-2.5">
              {transactions.map((t) => {
                const isCancelled = t.status === 'Cancelled';
                return (
                  <div key={t.id} className="border border-slate-200 rounded-xl p-3 space-y-2 bg-white">
                    {/* Row 1: Student + Amount */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-bold text-slate-800 text-[13px] block truncate">{t.name}</span>
                        <span className="text-[10px] text-slate-400">Roll: {t.rollNo || 'N/A'}</span>
                      </div>
                      <span className="font-bold text-slate-800 font-mono text-sm shrink-0">₹{t.totalAmount.toLocaleString()}</span>
                    </div>

                    {/* Row 2: Invoice ID, Date, Channel, Status */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                        #{t.id.slice(0, 8)}
                      </span>
                      <span className="text-[10px] text-slate-400">{t.dateStr}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{t.paymentMethod}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        isCancelled 
                          ? 'bg-rose-50 text-rose-600 border-rose-100'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    {/* Row 3: Full-width action buttons */}
                    <div className="flex gap-2 pt-0.5">
                      <Link
                        href={`/dashboard/billing/invoices/${t.id}`}
                        className="flex-1 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 inline-flex items-center justify-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print Invoice
                      </Link>
                      {!isCancelled && (
                        <button
                          onClick={() => handleRollback(t.id)}
                          className="flex-1 py-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100/50 text-xs font-bold border border-rose-100 inline-flex items-center justify-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Rollback
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
