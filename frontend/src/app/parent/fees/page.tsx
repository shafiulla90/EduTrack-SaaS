'use client';

import React, { useState, useEffect } from 'react';
import { useParent } from '../ParentContext';
import { api } from '@/lib/api';
import { dispatchSchoolSetupUpdated } from '@/lib/events';
import {
  CreditCard,
  CheckCircle,
  Clock,
  ShieldCheck,
  HelpCircle,
  X,
  Loader2,
  ArrowRight,
  QrCode,
  FileText,
  Printer,
  Download,
  Eye,
  History
} from 'lucide-react';

export default function FeesPage() {
  const { selectedChild } = useParent();
  const [feesData, setFeesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Pay modal states
  const [activeInvoice, setActiveInvoice] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'GPAY' | 'PHONEPE' | 'BANK'>('GPAY');
  const [payLoading, setPayLoading] = useState(false);
  const [message, setMessage] = useState('');

  // View Receipt Modal state
  const [viewingReceipt, setViewingReceipt] = useState<any>(null);

  const fetchFees = async (childId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/parent-portal/children/${childId}/fees`);
      setFeesData(res.data);
    } catch (err) {
      console.error('Failed to fetch fees details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChild) {
      fetchFees(selectedChild.id);
    }
  }, [selectedChild]);

  // Listen to switcher events
  useEffect(() => {
    const handleChildChange = (e: any) => {
      fetchFees(e.detail);
    };
    window.addEventListener('parentChildChanged', handleChildChange);
    return () => window.removeEventListener('parentChildChanged', handleChildChange);
  }, []);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild || !activeInvoice || payLoading) return;

    setPayLoading(true);
    setMessage('');
    try {
      const res = await api.post(`/parent-portal/children/${selectedChild.id}/invoices/${activeInvoice.id}/pay`, {
        paymentMethod,
      });

      setMessage(res.data?.message || 'Payment processed successfully! Invoice status updated.');
      
      // Dispatch real-time update event for School Admin Fee Management synchronization
      dispatchSchoolSetupUpdated();

      // Refresh latest fees and invoice history
      await fetchFees(selectedChild.id);

      setTimeout(() => {
        setActiveInvoice(null);
        setMessage('');
      }, 1800);
    } catch (err: any) {
      console.error('Payment processing failed:', err);
      setMessage(err.response?.data?.message || 'Failed to process payment. Please try again.');
    } finally {
      setPayLoading(false);
    }
  };

  const handleOpenPrintReceipt = (invId: string) => {
    window.open(`/dashboard/billing/invoices/${invId}`, '_blank');
  };

  if (!selectedChild) {
    return (
      <div className="text-slate-500 text-sm text-center py-12">
        Please select a child to view fees and invoices.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-t-[#2E5BFF] border-r-[#2E5BFF] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const invoices = feesData?.invoices || [];
  const paymentDetails = feesData?.paymentDetails || {};
  const unpaidInvoices = invoices.filter((inv: any) => inv.status !== 'PAID');
  const paidInvoices = invoices.filter((inv: any) => inv.status === 'PAID');

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in relative">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          Billing Ledger: <span className="text-[#2E5BFF] font-extrabold">{selectedChild.name}</span>
        </h2>
        <p className="text-slate-500 text-xs mt-1 font-light">Pay outstanding invoices online, view detailed statements, and access past payment receipts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Unpaid Invoices */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#2E5BFF]" />
              Outstanding Fee Statements
            </h3>
            
            {unpaidInvoices.length === 0 ? (
              <div className="bg-white border border-slate-200 p-8 rounded-3xl text-center text-slate-500 shadow-sm flex items-center justify-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
                <span className="text-xs font-semibold text-slate-700">No outstanding dues! All fee statements for this child are fully paid.</span>
              </div>
            ) : (
              <div className="space-y-3.5">
                {unpaidInvoices.map((inv: any) => (
                  <div
                    key={inv.id}
                    className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all space-y-4"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border bg-rose-50 border-rose-100 text-rose-700">
                          {inv.status}
                        </span>
                        <h4 className="text-sm font-bold text-slate-700 mt-2 truncate">{inv.description}</h4>
                        <p className="text-[10px] text-slate-400 font-light mt-0.5">Due date: {new Date(inv.dueDate).toLocaleDateString()}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-slate-800">₹{inv.totalAmount.toLocaleString('en-IN')}</span>
                        {inv.remainingBalance > 0 && (
                          <span className="text-[9px] text-rose-600 block font-bold mt-0.5">Balance: ₹{inv.remainingBalance.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </div>

                    {/* Particulars Breakdown */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-xs space-y-1.5">
                      {inv.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-slate-500 font-light text-[11px]">
                          <span>{item.name}</span>
                          <span>₹{item.amount.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex justify-end">
                      <button
                        onClick={() => setActiveInvoice(inv)}
                        className="px-4 py-2 rounded-xl bg-[#2E5BFF] hover:bg-blue-600 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Pay Fee Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invoice History & Paid Receipts */}
          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              Invoice History & Paid Receipts
            </h3>

            {paidInvoices.length === 0 ? (
              <div className="bg-white border border-slate-200 p-8 rounded-3xl text-center text-slate-400 shadow-sm text-xs">
                No past payment history or paid invoices found.
              </div>
            ) : (
              <div className="space-y-3.5">
                {paidInvoices.map((inv: any) => (
                  <div
                    key={inv.id}
                    className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm space-y-3 hover:border-slate-300 transition-all"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-100 text-emerald-700">
                            PAID RECEIPT
                          </span>
                          <span className="text-xs font-bold text-slate-800 font-mono">{inv.invoiceNo}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-700 mt-2">{inv.description}</h4>
                        <p className="text-[10px] text-slate-400 font-light mt-0.5">
                          Paid on {new Date(inv.invoiceDate).toLocaleDateString()} • Txn: <code className="font-mono text-slate-600">{inv.transactionId}</code>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-emerald-700">₹{inv.totalAmount.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">{inv.paymentMethod}</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setViewingReceipt(inv)}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-blue-600" />
                        <span>View Details</span>
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenPrintReceipt(inv.id)}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-600" />
                          <span>Print</span>
                        </button>
                        <button
                          onClick={() => handleOpenPrintReceipt(inv.id)}
                          className="px-3 py-1.5 bg-[#1a365d] text-white hover:bg-[#2a4365] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Bank & Payment setup info */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest">School Bank & UPI</h3>
          
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-5">
            <div className="space-y-3.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Direct Bank Transfer</span>
              <div className="space-y-2.5 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">Bank Name</span>
                  <strong className="text-slate-700">{paymentDetails.bankName || 'Covenant Synergy Bank'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">IFSC Code</span>
                  <strong className="text-slate-700">{paymentDetails.bankIFSC || 'COVB0007890'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Account Number</span>
                  <strong className="text-slate-700">{paymentDetails.bankAccountNo || '1234 5678 9012'}</strong>
                </div>
                {paymentDetails.bankBranch && (
                  <div>
                    <span className="text-slate-400 block text-[10px]">Branch Name</span>
                    <strong className="text-slate-700">{paymentDetails.bankBranch}</strong>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5 space-y-3.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">UPI Merchant Handles</span>
              <div className="space-y-2.5 text-xs text-slate-600">
                <div>
                  <span className="text-slate-400 block text-[10px]">Google Pay ID</span>
                  <strong className="text-slate-700">{paymentDetails.googlePayId || 'gpay@edutrack'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">PhonePe ID</span>
                  <strong className="text-slate-700">{paymentDetails.phonePeId || 'phonepe@edutrack'}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Pay Invoice Checkout Modal */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-6 relative animate-scale-up space-y-5">
            <button
              onClick={() => {
                if (!payLoading) {
                  setActiveInvoice(null);
                  setMessage('');
                }
              }}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <h3 className="text-base font-bold text-slate-800">Pay Outstanding Fee</h3>
              <p className="text-xs text-slate-400 font-light mt-0.5">{activeInvoice.description}</p>
            </div>

            {message && (
              <div className={`p-3.5 border rounded-2xl text-xs font-semibold leading-relaxed flex items-center gap-2 ${
                message.includes('success') 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                  : 'bg-rose-50 border-rose-100 text-rose-700'
              }`}>
                {message.includes('success') ? <ShieldCheck className="w-4.5 h-4.5 shrink-0" /> : <HelpCircle className="w-4.5 h-4.5 shrink-0" />}
                <span>{message}</span>
              </div>
            )}

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Amount to Pay</span>
              <strong className="text-lg font-black text-slate-800 font-sans">₹{activeInvoice.remainingBalance.toLocaleString('en-IN')}</strong>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Method</span>
                <div className="grid grid-cols-2 gap-3.5">
                  {[
                    { key: 'GPAY', name: 'Google Pay' },
                    { key: 'PHONEPE', name: 'PhonePe' },
                    { key: 'UPI', name: 'BHIM UPI' },
                    { key: 'BANK', name: 'Bank Transfer' }
                  ].map(method => (
                    <button
                      key={method.key}
                      type="button"
                      disabled={payLoading}
                      onClick={() => setPaymentMethod(method.key as any)}
                      className={`py-3 rounded-2xl text-xs font-semibold border transition-all cursor-pointer ${
                        paymentMethod === method.key
                          ? 'bg-blue-50 border-blue-200 text-[#2E5BFF]'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                      }`}
                    >
                      {method.name}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod !== 'BANK' && (
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-2xl gap-2">
                  <QrCode className="w-20 h-20 text-slate-400 animate-pulse" />
                  <span className="text-[10px] text-slate-500 font-light select-none">Scan merchant QR to complete payment</span>
                </div>
              )}

              <button
                type="submit"
                disabled={payLoading}
                className="w-full py-3 bg-[#2E5BFF] hover:bg-blue-600 text-white rounded-xl font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {payLoading ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  'Confirm Fee Payment'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Receipt Details Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-xl p-6 relative animate-scale-up space-y-4 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewingReceipt(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-slate-100 pb-3">
              <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                OFFICIAL FEE RECEIPT
              </span>
              <h3 className="text-lg font-black text-slate-800 mt-2">{viewingReceipt.invoiceNo}</h3>
              <p className="text-xs text-slate-400">{paymentDetails.name || 'Cambridge International School'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Student Name</span>
                <strong className="text-slate-800">{viewingReceipt.studentName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Roll Number</span>
                <strong className="text-slate-800">{viewingReceipt.rollNo}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Class & Section</span>
                <strong className="text-slate-800">{viewingReceipt.className} - {viewingReceipt.sectionName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Academic Year</span>
                <strong className="text-slate-800">{viewingReceipt.academicYear}</strong>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Fee Particulars</span>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-xs space-y-2">
                {viewingReceipt.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-slate-700 font-medium">
                    <span>{item.name}</span>
                    <span className="font-bold">₹{item.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-100 pt-3">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Payment Method</span>
                <span className="font-bold text-slate-700">{viewingReceipt.paymentMethod}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Transaction ID</span>
                <span className="font-mono text-slate-700 text-[11px] font-bold">{viewingReceipt.transactionId}</span>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex justify-between items-center text-xs">
              <span className="font-bold text-emerald-800">Grand Total Paid</span>
              <strong className="text-lg font-black text-emerald-700 font-sans">₹{viewingReceipt.totalAmount.toLocaleString('en-IN')}</strong>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-end gap-2">
              <button
                onClick={() => handleOpenPrintReceipt(viewingReceipt.id)}
                className="px-4 py-2 rounded-xl bg-[#1a365d] text-white hover:bg-[#2a4365] font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
