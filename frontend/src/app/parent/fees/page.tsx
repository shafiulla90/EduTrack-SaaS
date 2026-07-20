'use client';

import React, { useState, useEffect } from 'react';
import { useParent } from '../ParentContext';
import { api } from '@/lib/api';
import { dispatchSchoolSetupUpdated } from '@/lib/events';
import {
  CreditCard,
  CheckCircle,
  ShieldCheck,
  HelpCircle,
  X,
  ArrowRight,
  Printer,
  Download,
  Eye,
  History,
  CheckSquare,
  Square,
  Building2,
  QrCode,
  AlertCircle
} from 'lucide-react';

export default function FeesPage() {
  const { selectedChild } = useParent();
  const [feesData, setFeesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Partial fee product selection state
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());

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

      // Default select all items in unpaid fee statements
      const invoices = res.data?.invoices || [];
      const unpaid = invoices.find((inv: any) => inv.status !== 'PAID');
      if (unpaid && unpaid.items) {
        const itemIds = new Set<string>(unpaid.items.map((i: any) => i.id));
        setSelectedItemIds(itemIds);
      } else {
        setSelectedItemIds(new Set());
      }
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

  const toggleItemSelect = (itemId: string) => {
    const next = new Set(selectedItemIds);
    if (next.has(itemId)) {
      next.delete(itemId);
    } else {
      next.add(itemId);
    }
    setSelectedItemIds(next);
  };

  const handleSelectAll = (items: any[]) => {
    const allIds = items.map(i => i.id);
    setSelectedItemIds(new Set(allIds));
  };

  const handleDeselectAll = () => {
    setSelectedItemIds(new Set());
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild || !activeInvoice || payLoading) return;

    if (selectedItemIds.size === 0) {
      setMessage('Please select at least one fee item to pay.');
      return;
    }

    setPayLoading(true);
    setMessage('');
    try {
      const res = await api.post(`/parent-portal/children/${selectedChild.id}/invoices/${activeInvoice.id}/pay`, {
        paymentMethod,
        selectedItemIds: Array.from(selectedItemIds),
      });

      setMessage(res.data?.message || 'Payment processed successfully! Invoice updated.');
      
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
  const paymentDetails = feesData?.paymentDetails;
  const unpaidInvoices = invoices.filter((inv: any) => inv.status !== 'PAID');
  const paidInvoices = invoices.filter((inv: any) => inv.status === 'PAID');

  const activeUnpaidInv = unpaidInvoices[0];
  const items = activeUnpaidInv?.items || [];

  // Calculate selected total
  const selectedItemsList = items.filter((item: any) => selectedItemIds.has(item.id));
  const selectedTotal = selectedItemsList.reduce((sum: number, item: any) => sum + Number(item.amount), 0);

  const hasBankDetails = paymentDetails && (
    paymentDetails.bankName ||
    paymentDetails.bankAccountNo ||
    paymentDetails.bankIFSC ||
    paymentDetails.googlePayId ||
    paymentDetails.phonePeId ||
    paymentDetails.upiQrId
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in relative">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          Billing Ledger: <span className="text-[#2E5BFF] font-extrabold">{selectedChild.name}</span>
        </h2>
        <p className="text-slate-500 text-xs mt-1 font-light">Select individual fee components to make partial or full online payments, view detailed statements, and access past receipts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Unpaid Invoices & Selectable Fee Products */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#2E5BFF]" />
                Outstanding Fee Statements
              </h3>

              {items.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => handleSelectAll(items)}
                    className="text-[#2E5BFF] hover:underline font-semibold text-[11px]"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    onClick={handleDeselectAll}
                    className="text-slate-400 hover:underline font-medium text-[11px]"
                  >
                    Deselect All
                  </button>
                </div>
              )}
            </div>
            
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
                        <span className="text-sm font-black text-slate-800">₹{inv.remainingBalance.toLocaleString('en-IN')}</span>
                        <span className="text-[9px] text-slate-400 block font-medium mt-0.5">Total Dues</span>
                      </div>
                    </div>

                    {/* Selectable Particulars Breakdown */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                        Select Fee Components to Pay:
                      </span>
                      {inv.items.map((item: any) => {
                        const isChecked = selectedItemIds.has(item.id);
                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleItemSelect(item.id)}
                            className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isChecked 
                                ? 'bg-blue-50/70 border-blue-200 text-slate-800' 
                                : 'bg-white border-slate-200/60 text-slate-500 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-[#2E5BFF] shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300 shrink-0" />
                              )}
                              <span className="text-xs font-semibold">{item.name}</span>
                            </div>
                            <span className={`text-xs font-bold ${isChecked ? 'text-[#2E5BFF]' : 'text-slate-600'}`}>
                              ₹{item.amount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Running Selection Summary & Action */}
                    <div className="border-t border-slate-100 pt-3.5 flex items-center justify-between">
                      <div className="text-xs">
                        <span className="text-slate-400 font-medium">Selected ({selectedItemIds.size}/{inv.items.length}): </span>
                        <strong className="text-slate-800 font-bold">₹{selectedTotal.toLocaleString('en-IN')}</strong>
                      </div>

                      <button
                        onClick={() => setActiveInvoice(inv)}
                        disabled={selectedItemIds.size === 0}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 ${
                          selectedItemIds.size > 0
                            ? 'bg-[#2E5BFF] hover:bg-blue-600 text-white cursor-pointer'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        <span>Pay Selected Fees (₹{selectedTotal.toLocaleString('en-IN')})</span>
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

        {/* Dynamic School Bank & UPI Info Panel */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            School Bank & UPI
          </h3>
          
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-5">
            {!hasBankDetails ? (
              <div className="text-center py-6 space-y-2 text-slate-400">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-xs font-medium text-slate-600">School payment details are not configured.</p>
                <p className="text-[11px] font-light text-slate-400">Please contact the school administrator for direct bank details.</p>
              </div>
            ) : (
              <>
                {/* Bank Account Section */}
                {(paymentDetails.bankName || paymentDetails.bankAccountNo) && (
                  <div className="space-y-3.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Direct Bank Transfer</span>
                    <div className="space-y-2.5 text-xs text-slate-600">
                      {paymentDetails.name && (
                        <div>
                          <span className="text-slate-400 block text-[10px]">Beneficiary Name</span>
                          <strong className="text-slate-700">{paymentDetails.name}</strong>
                        </div>
                      )}
                      {paymentDetails.bankName && (
                        <div>
                          <span className="text-slate-400 block text-[10px]">Bank Name</span>
                          <strong className="text-slate-700">{paymentDetails.bankName}</strong>
                        </div>
                      )}
                      {paymentDetails.bankIFSC && (
                        <div>
                          <span className="text-slate-400 block text-[10px]">IFSC Code</span>
                          <strong className="text-slate-700 font-mono">{paymentDetails.bankIFSC}</strong>
                        </div>
                      )}
                      {paymentDetails.bankAccountNo && (
                        <div>
                          <span className="text-slate-400 block text-[10px]">Account Number</span>
                          <strong className="text-slate-700 font-mono">{paymentDetails.bankAccountNo}</strong>
                        </div>
                      )}
                      {paymentDetails.bankBranch && (
                        <div>
                          <span className="text-slate-400 block text-[10px]">Branch Name</span>
                          <strong className="text-slate-700">{paymentDetails.bankBranch}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* UPI Handles Section */}
                {(paymentDetails.googlePayId || paymentDetails.phonePeId || paymentDetails.upiQrId) && (
                  <div className="border-t border-slate-100 pt-5 space-y-3.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">UPI Merchant Handles</span>
                    <div className="space-y-2.5 text-xs text-slate-600">
                      {paymentDetails.googlePayId && (
                        <div>
                          <span className="text-slate-400 block text-[10px]">Google Pay ID</span>
                          <strong className="text-slate-700 font-mono">{paymentDetails.googlePayId}</strong>
                        </div>
                      )}
                      {paymentDetails.phonePeId && (
                        <div>
                          <span className="text-slate-400 block text-[10px]">PhonePe ID</span>
                          <strong className="text-slate-700 font-mono">{paymentDetails.phonePeId}</strong>
                        </div>
                      )}
                      {paymentDetails.upiQrId && (
                        <div>
                          <span className="text-slate-400 block text-[10px]">UPI QR Handle</span>
                          <strong className="text-slate-700 font-mono">{paymentDetails.upiQrId}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
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
              <h3 className="text-base font-bold text-slate-800">Checkout Fee Payment</h3>
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

            {/* Selected items summary */}
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Selected Components ({selectedItemIds.size})</span>
                <strong className="text-base font-black text-[#2E5BFF]">₹{selectedTotal.toLocaleString('en-IN')}</strong>
              </div>
              <div className="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-200/60">
                {selectedItemsList.map((item: any) => (
                  <div key={item.id} className="flex justify-between">
                    <span>• {item.name}</span>
                    <span>₹{item.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'GPAY', label: 'Google Pay', icon: '💳' },
                  { id: 'PHONEPE', label: 'PhonePe UPI', icon: '📱' },
                  { id: 'UPI', label: 'Any UPI App', icon: '⚡' },
                  { id: 'BANK', label: 'Net Banking', icon: '🏦' },
                ].map(method => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === method.id 
                        ? 'border-[#2E5BFF] bg-blue-50/60 text-[#2E5BFF]' 
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <span>{method.icon}</span>
                    <span>{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="pt-2">
              <button
                type="submit"
                disabled={payLoading || selectedItemIds.size === 0}
                className="w-full py-3.5 rounded-2xl bg-[#2E5BFF] hover:bg-blue-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {payLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Payment Gateway...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Pay ₹{selectedTotal.toLocaleString('en-IN')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Receipt Details Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-xl p-6 relative animate-scale-up space-y-5">
            <button
              onClick={() => setViewingReceipt(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100 inline-block">
                OFFICIAL PAYMENT RECEIPT
              </span>
              <h3 className="text-lg font-black text-slate-800">{feesData?.paymentDetails?.name || 'Cambridge International School'}</h3>
              <p className="text-xs text-slate-400 font-mono">Receipt No: {viewingReceipt.receiptNo}</p>
            </div>

            <div className="border-t border-b border-slate-100 py-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Student Name:</span>
                <strong className="text-slate-800">{viewingReceipt.studentName}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Roll Number:</span>
                <strong className="text-slate-800">{viewingReceipt.rollNo}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Class & Section:</span>
                <strong className="text-slate-800">{viewingReceipt.className} - {viewingReceipt.sectionName}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Transaction ID:</span>
                <strong className="text-slate-800 font-mono">{viewingReceipt.transactionId}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Payment Date:</span>
                <strong className="text-slate-800">{new Date(viewingReceipt.invoiceDate).toLocaleDateString()}</strong>
              </div>
            </div>

            {/* Paid items breakdown */}
            <div className="space-y-1.5 bg-slate-50 border border-slate-100 p-3 rounded-2xl text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Fee Particulars Paid</span>
              {viewingReceipt.items.map((item: any) => (
                <div key={item.id} className="flex justify-between text-slate-600 font-medium">
                  <span>{item.name}</span>
                  <span>₹{item.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-sm text-emerald-800">
                <span>Total Paid:</span>
                <span>₹{viewingReceipt.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => handleOpenPrintReceipt(viewingReceipt.id)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => handleOpenPrintReceipt(viewingReceipt.id)}
                className="px-4 py-2 bg-[#1a365d] hover:bg-[#2a4365] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
