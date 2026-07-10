'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Mail, Plus, Trash2, X, AlertCircle, CheckCircle, FileText, CalendarDays } from 'lucide-react';

export default function LeaveMgmtPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('Casual'); // Casual, Medical, Emergency, HalfDay
  const [reason, setReason] = useState('');

  async function loadLeaves() {
    try {
      const res = await api.get('/teacher-portal/leave');
      setLeaves(res.data);
    } catch (err) {
      console.error('Failed to load leaves:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeaves();
  }, []);

  const openCreateModal = () => {
    setStartDate('');
    setEndDate('');
    setLeaveType('Casual');
    setReason('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      startDate,
      endDate,
      leaveType,
      reason,
    };

    try {
      await api.post('/teacher-portal/leave', payload);
      setIsModalOpen(false);
      await loadLeaves();
    } catch (err) {
      console.error('Failed to submit leave:', err);
      alert('Failed to submit leave request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this leave request?')) return;
    try {
      await api.delete(`/teacher-portal/leave/${id}`);
      await loadLeaves();
    } catch (err) {
      console.error('Failed to cancel leave:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-t-[#2E5BFF] border-slate-200 rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Loading your leaves...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md mx-auto sm:max-w-none pb-20">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-[#2E5BFF]" />
          My Leave Management
        </h2>
        <button
          onClick={openCreateModal}
          className="p-2.5 bg-[#2E5BFF] hover:bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Apply Leave
        </button>
      </div>

      {leaves.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-3xl border border-slate-200 shadow-sm text-slate-500 italic text-sm">
          No leave requests submitted.
        </div>
      ) : (
        <div className="space-y-4">
          {leaves.map((lv) => (
            <div key={lv.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 relative">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded border uppercase ${
                    lv.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    lv.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                    'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {lv.status}
                  </span>
                  
                  {lv.status === 'Pending' && (
                    <button onClick={() => handleDelete(lv.id)} className="text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer">
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[13px] font-bold text-slate-700">
                  <span>{lv.leaveType} Leave</span>
                  <span className="text-slate-400 font-light">•</span>
                  <span className="text-xs text-slate-500 font-semibold">{lv.startDate.split('T')[0]} to {lv.endDate.split('T')[0]}</span>
                </div>
                
                <p className="text-xs text-slate-500 font-light leading-relaxed whitespace-pre-wrap">{lv.reason}</p>

                {lv.approverComments && (
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] font-medium text-slate-500">
                    <strong>Admin Note:</strong> {lv.approverComments}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply Leave Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-end z-[100] transition-opacity duration-300 animate-in">
          <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl relative overflow-hidden animate-slide-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-900 text-lg leading-none">Apply Leave Request</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2E5BFF] text-sm"
                >
                  <option value="Casual">Casual Leave</option>
                  <option value="Medical">Medical Leave</option>
                  <option value="Emergency">Emergency Leave</option>
                  <option value="HalfDay">Half-Day Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">From Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2E5BFF] text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">To Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2E5BFF] text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reason for Leave</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain reason details clearly for administrator approval..."
                  rows={5}
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2E5BFF] text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#2E5BFF] hover:bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-50 mt-4"
              >
                {submitting ? 'Submitting...' : 'Submit Leave Request'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
