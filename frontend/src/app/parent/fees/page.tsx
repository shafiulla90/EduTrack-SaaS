'use client';

import React, { useState, useEffect } from 'react';
import { useParent } from '../ParentContext';
import { api } from '@/lib/api';
import { CreditCard, CheckCircle, Clock, ShieldCheck, HelpCircle, X, Loader2, ArrowRight, QrCode } from 'lucide-react';

export default function FeesPage() {
  const { selectedChild } = useParent();
  const [feesData, setFeesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Pay modal states
  const [activeInvoice, setActiveInvoice] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'GPAY' | 'PHONEPE' | 'BANK'>('GPAY');
  const [payLoading, setPayLoading] = useState(false);
  const [message, setMessage] = useState('');

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

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild || !activeInvoice) return;

    setPayLoading(true);
    setMessage('');
    try {
      await api.post(`/parent-portal/children/${selectedChild.id}/invoices/${activeInvoice.id}/pay`, {
        paymentMethod,
      });
      setMessage('Mock Payment completed successfully! Database invoice status updated.');
      
      // Update local invoice status instantly
      setFeesData((prev: any) => ({
        ...prev,
        invoices: prev.invoices.map((inv: any) => {
          if (inv.id === activeInvoice.id) {
            return {
              ...inv,
              status: 'PAID',
              paidAmount: inv.totalAmount,
              remainingBalance: 0,
            };
          }
          return inv;
        }),
      }));

      setTimeout(() => {
        setActiveInvoice(null);
        setMessage('');
      }, 1800);
    } catch (err) {
      console.error(err);
      setMessage('Failed to process payment. Please try again.');
    } finally {
      setPayLoading(false);
    }
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
  const totalPending = invoices.reduce((sum: number, inv: any) => sum + (inv.status !== 'PAID' ? inv.remainingBalance : 0), 0);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in relative">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          Billing Ledger: <span className="text-[#2E5BFF] font-extrabold">{selectedChild.name}</span>
        </h2>
        <p className="text-slate-500 text-xs mt-1 font-light">Pay outstanding invoices online and check past receipts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Invoice List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest flex items-center gap-2">
            Invoices & Statements
          </h3>
          
          {invoices.length === 0 ? (
            <div className="bg-white border border-slate-200 p-12 rounded-3xl text-center text-slate-500 shadow-sm">
              <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold">No invoices issued for this child.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {invoices.map((inv: any) => {
                const isPaid = inv.status === 'PAID';
                return (
                  <div
                    key={inv.id}
                    className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all space-y-4"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                          isPaid 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                            : 'bg-rose-50 border-rose-100 text-rose-700'
                        }`}>
                          {inv.status}
                        </span>
                        <h4 className="text-sm font-bold text-slate-700 mt-2.5 truncate">{inv.description || 'School Fees Statement'}</h4>
                        <p className="text-[10px] text-slate-400 font-light mt-0.5">Due date: {new Date(inv.dueDate).toLocaleDateString()}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-slate-800">₹{inv.totalAmount.toLocaleString('en-IN')}</span>
                        {inv.remainingBalance > 0 && (
                          <span className="text-[9px] text-slate-400 block font-light mt-0.5">Balance: ₹{inv.remainingBalance.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </div>

                    {/* Breakdown items */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 text-xs space-y-1.5">
                      {inv.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-slate-500 font-light text-[11px]">
                          <span>{item.name}</span>
                          <span>₹{item.amount.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    {!isPaid && (
                      <div className="border-t border-slate-100 pt-3 flex justify-end">
                        <button
                          onClick={() => setActiveInvoice(inv)}
                          className="px-4 py-2 rounded-xl bg-[#2E5BFF] hover:bg-blue-600 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Pay Invoice</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
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
                setActiveInvoice(null);
                setMessage('');
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

            <form onSubmit={handleSimulatePayment} className="space-y-4">
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
                  <span className="text-[10px] text-slate-500 font-light select-none">Scan generated merchant QR to pay</span>
                </div>
              )}

              <button
                type="submit"
                disabled={payLoading}
                className="w-full py-3 bg-[#2E5BFF] hover:bg-blue-600 text-white rounded-xl font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                {payLoading ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    Processing Simulated Gateway...
                  </>
                ) : (
                  'Confirm simulated Payment'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
