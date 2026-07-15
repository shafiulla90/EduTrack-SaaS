'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Mail, Plus, Trash2, X, AlertCircle, CheckCircle, FileText, CalendarDays, Check, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useTenant } from '@/app/providers/TenantContext';

export default function LeaveMgmtPage() {
  const { currentUser } = useTenant();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filter state for Admin
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [adminComments, setAdminComments] = useState<Record<string, string>>({});

  // Form modal (Teacher)
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states (Teacher)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('Casual'); // Casual, Medical, Emergency, HalfDay
  const [reason, setReason] = useState('');

  const isAdmin = currentUser?.role === 'ADMIN';

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

  // Admin status update handler (Approve / Reject)
  const handleUpdateStatus = async (id: string, newStatus: 'Approved' | 'Rejected') => {
    try {
      const comments = adminComments[id] || '';
      await api.patch(`/teacher-portal/leave/${id}/status`, {
        status: newStatus,
        comments
      });
      await loadLeaves();
    } catch (err) {
      console.error('Failed to update leave status:', err);
      alert('Failed to update leave status.');
    }
  };

  const getFilteredLeaves = () => {
    if (filterStatus === 'ALL') return leaves;
    return leaves.filter(lv => lv.status?.toUpperCase() === filterStatus);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-t-[#2E5BFF] border-slate-200 rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Loading leave requests...</p>
      </div>
    );
  }

  // --- ADMIN VIEW PANEL ---
  if (isAdmin) {
    const filteredLeaves = getFilteredLeaves();
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 pb-20 font-sans text-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-indigo-650" />
              Staff Leave Requests Console
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Review, comment on, and approve or reject staff leave applications.</p>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === status
                    ? 'bg-white text-slate-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {filteredLeaves.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-xs text-slate-400 italic text-xs">
            No leave requests found under the selected filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredLeaves.map((lv) => {
              const teacherName = lv.teacher?.user?.name || 'Unknown Staff';
              const teacherEmail = lv.teacher?.user?.email || 'No email';
              const statusUpper = lv.status?.toUpperCase() || 'PENDING';
              
              return (
                <div key={lv.id} className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-650 text-xs">
                          {teacherName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-slate-800">{teacherName}</h4>
                          <span className="text-[10px] text-slate-400 font-semibold">{teacherEmail}</span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase ${
                        statusUpper === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        statusUpper === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {lv.status}
                      </span>
                    </div>

                    <div className="border-t border-slate-100 pt-2.5 flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{lv.leaveType} Leave</span>
                      <span className="text-slate-300 font-light">•</span>
                      <span className="text-[11px] text-slate-500 font-medium">{lv.startDate.split('T')[0]} to {lv.endDate.split('T')[0]}</span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/50 whitespace-pre-wrap">{lv.reason}</p>
                  </div>

                  {statusUpper === 'PENDING' ? (
                    <div className="border-t border-slate-100 pt-3 space-y-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Approver Comments</label>
                        <input
                          type="text"
                          placeholder="Add approval notes or rejection reason..."
                          value={adminComments[lv.id] || ''}
                          onChange={(e) => setAdminComments({ ...adminComments, [lv.id]: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-semibold outline-none focus:border-blue-500 focus:bg-white placeholder-slate-400"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateStatus(lv.id, 'Approved')}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Approve Leave
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(lv.id, 'Rejected')}
                          className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <X className="w-3.5 h-3.5 stroke-[3]" /> Reject Leave
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-slate-100 pt-2.5 space-y-1.5 text-[10px] font-semibold text-slate-500">
                      <div className="flex justify-between">
                        <span>Reviewed By: <strong className="text-slate-700">{lv.approver || 'System Admin'}</strong></span>
                        <span>Date: {lv.approvedDate?.split('T')[0] || lv.rejectedDate?.split('T')[0] || 'N/A'}</span>
                      </div>
                      {lv.comments && (
                        <div className="bg-indigo-50/20 p-2.5 rounded-lg border border-indigo-100/10 text-indigo-900 leading-normal font-medium">
                          <strong>Admin Note:</strong> {lv.comments}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // --- TEACHER VIEW PANEL (EXISTING) ---
  return (
    <div className="space-y-6 max-w-md mx-auto sm:max-w-none pb-20 font-sans text-slate-800">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-[#2E5BFF]" />
            My Leave Management
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">Apply for casual, medical, or emergency leaves and track request updates.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="p-2.5 bg-[#2E5BFF] hover:bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" /> Apply Leave
        </button>
      </div>

      {leaves.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 shadow-sm text-slate-500 italic text-sm">
          No leave requests submitted.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leaves.map((lv) => {
            const statusUpper = lv.status?.toUpperCase() || 'PENDING';
            return (
              <div key={lv.id} className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 relative hover:border-slate-350 transition-colors">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded border uppercase ${
                      statusUpper === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      statusUpper === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      {lv.status}
                    </span>
                    
                    {statusUpper === 'PENDING' && (
                      <button onClick={() => handleDelete(lv.id)} className="text-slate-400 hover:text-red-650 transition-colors p-1 cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                    <span>{lv.leaveType} Leave</span>
                    <span className="text-slate-300 font-light">•</span>
                    <span className="text-[11px] text-slate-500 font-medium">{lv.startDate.split('T')[0]} to {lv.endDate.split('T')[0]}</span>
                  </div>
                  
                  <p className="text-xs text-slate-500 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/50 whitespace-pre-wrap">{lv.reason}</p>

                  {lv.comments && (
                    <div className="bg-indigo-50/20 p-2.5 rounded-lg border border-indigo-100/10 text-[10px] leading-normal font-medium text-slate-650">
                      <strong>Admin Note:</strong> {lv.comments}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
                  className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2E5BFF] text-sm font-semibold"
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
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-850 focus:outline-none focus:ring-1 focus:ring-[#2E5BFF] text-sm font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">To Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-850 focus:outline-none focus:ring-1 focus:ring-[#2E5BFF] text-sm font-semibold"
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
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2E5BFF] text-sm font-semibold leading-relaxed"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-[#2E5BFF] hover:bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-50 mt-4 transition-all"
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
