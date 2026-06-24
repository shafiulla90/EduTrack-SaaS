'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
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
      window.dispatchEvent(new CustomEvent('school-setup-updated'));

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
      window.dispatchEvent(new CustomEvent('school-setup-updated'));
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
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-850 text-base flex items-center gap-1.5">
                <User className="w-5 h-5 text-blue-500" />
                Ledger: <span className="text-blue-600 font-black">{selectedStudent.account.name}</span>
              </h3>
              <p className="text-[11px] text-slate-450 mt-1 font-semibold">
                Roll: {selectedStudent.account.rollNo || 'N/A'} · {selectedStudent.account.class} {selectedStudent.account.section}
              </p>
            </div>
            
            <div className="flex gap-2 items-center">
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
              {/* Fee Table */}
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
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

              {/* Payment Method selector */}
              <div className="space-y-4 pt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Choose Collection Channel</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {paymentChannels.map((c) => {
                    const isSelected = selectedChannel === c.value;
                    return (
                      <div
                        key={c.value}
                        onClick={() => setSelectedChannel(c.value)}
                        className={`p-4 border rounded-xl cursor-pointer flex flex-col items-center justify-center gap-1 transition-all ${
                          isSelected 
                            ? 'bg-blue-50 border-[#2E5BFF] text-[#2E5BFF] font-bold shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold'
                        }`}
                      >
                        <span className="text-xl">{c.icon}</span>
                        <span className="text-xs">{c.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic details for UPI and Bank */}
              {selectedChannel.includes('UPI') && (
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl max-w-sm mx-auto flex flex-col items-center text-center space-y-3">
                  <span className="text-xs font-bold text-slate-500">Scan Standee QR</span>
                  <div className="w-28 h-28 bg-white p-3 border border-slate-200 rounded-xl shadow-xs flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-slate-900" />
                  </div>
                  <span className="text-[10px] text-slate-450 font-mono">UPI ID: gpay-vikas-edu@upi</span>
                  <p className="text-[10px] text-blue-600 font-bold">Scan to complete physical ₹{billingTotal.toLocaleString()} collection</p>
                </div>
              )}

              {selectedChannel === 'NET_BANKING' && (
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-3 text-xs max-w-md">
                  <h4 className="font-bold text-slate-700">Net Banking Settlement details:</h4>
                  <div className="grid grid-cols-2 gap-3 font-semibold">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Bank Name</span>
                      <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full bg-white border border-slate-200 rounded p-1" />
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">IFSC Code</span>
                      <input type="text" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} className="w-full bg-white border border-slate-200 rounded p-1" />
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block mb-0.5">Account Number</span>
                      <input type="text" value={accountNo} onChange={(e) => setAccountNo(e.target.value)} className="w-full bg-white border border-slate-200 rounded p-1" />
                    </div>
                  </div>
                </div>
              )}

              {/* Footer total info & confirmation */}
              <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Settlement:</span>
                  <span className="text-2xl font-black text-slate-800 font-mono">₹{billingTotal.toLocaleString()}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs bg-white hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFinalizePayment}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/10"
                  >
                    ✓ Finalize Payment
                  </button>
                </div>
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
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-850 text-base">Recent Transaction History</h3>
        
        {transactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-xs font-semibold">
            No recent payment transactions recorded.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
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
        )}
      </div>
    </div>
  );
}
