'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  CalendarDays, Plus, Trash2, X, AlertCircle, CheckCircle,
  FileText, Filter, Eye, Check, Clock, User, ShieldAlert, Paperclip, MessageSquare
} from 'lucide-react';
import { useTenant } from '@/app/providers/TenantContext';

export default function LeaveMgmtPage() {
  const { currentUser } = useTenant();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [applicantTypeFilter, setApplicantTypeFilter] = useState<'ALL' | 'STUDENT' | 'STAFF'>('ALL');

  // Form modal (Teacher Apply Leave)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('Casual');
  const [reason, setReason] = useState('');

  // Action / Audit Modal
  const [selectedLeave, setSelectedLeave] = useState<any | null>(null);
  const [actionStatus, setActionStatus] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  async function loadLeaves() {
    try {
      const res = await api.get('/teacher-portal/leave');
      setLeaves(res.data || []);
    } catch (err) {
      console.error('Failed to load leaves:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeaves();
    const interval = setInterval(loadLeaves, 5000);
    return () => clearInterval(interval);
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
    try {
      await api.post('/teacher-portal/leave', {
        startDate,
        endDate,
        leaveType,
        reason,
      });
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

  const handleProcessAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave || !actionStatus) return;
    setIsProcessingAction(true);
    try {
      const statusText = actionStatus === 'APPROVED' ? 'Approved' : 'Rejected';
      await api.patch(`/teacher-portal/leave/${selectedLeave.id}/status`, {
        status: statusText,
        comments: remarks,
      });
      setSelectedLeave(null);
      setActionStatus(null);
      setRemarks('');
      await loadLeaves();
    } catch (err) {
      console.error('Failed to update leave status:', err);
      alert('Failed to update leave status.');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const filteredLeaves = leaves.filter(lv => {
    const st = (lv.status || 'PENDING').toUpperCase();
    if (statusFilter !== 'ALL' && st !== statusFilter) return false;
    const type = (lv.applicantType || 'STAFF').toUpperCase();
    if (applicantTypeFilter !== 'ALL' && type !== applicantTypeFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-t-[#2E5BFF] border-slate-200 rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Loading leave applications...</p>
      </div>
    );
  }

  const isAdmin = currentUser?.role === 'SCHOOL_ADMIN' || currentUser?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-7 h-7 text-[#2E5BFF]" />
            Leave Management Center
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage, review, approve, and track leave applications submitted by parents, students, and staff.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-[#2E5BFF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" /> Apply Staff Leave
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-[#2E5BFF]" />
          Filter Applications
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          {/* Status Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st ? 'bg-white text-[#2E5BFF] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st === 'ALL' ? 'All Status' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Applicant Type Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['ALL', 'STUDENT', 'STAFF'] as const).map(tp => (
              <button
                key={tp}
                onClick={() => setApplicantTypeFilter(tp)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  applicantTypeFilter === tp ? 'bg-[#2E5BFF] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tp === 'ALL' ? 'All Types' : tp === 'STUDENT' ? 'Student Leaves' : 'Staff Leaves'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leave Applications Grid */}
      {filteredLeaves.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-3xl border border-slate-200 shadow-xs text-slate-400 space-y-2">
          <FileText className="w-12 h-12 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">No leave applications found matching filters.</p>
          <p className="text-xs text-slate-400">Applications submitted by parents or staff will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLeaves.map((lv) => {
            const statusUpper = (lv.status || 'PENDING').toUpperCase();
            const isStudentLeave = lv.applicantType === 'STUDENT' || !!lv.student;
            const studentName = lv.student?.user?.name || 'Student';
            const className = lv.student?.classSection ? `${lv.student.classSection.class?.name || ''} - ${lv.student.classSection.section?.name || ''}` : '';
            const parentName = lv.submittedBy?.name || 'Parent';
            const teacherName = lv.teacher?.user?.name || 'Staff Member';
            const startDateStr = lv.startDate ? lv.startDate.split('T')[0] : 'N/A';
            const endDateStr = lv.endDate ? lv.endDate.split('T')[0] : 'N/A';

            return (
              <div
                key={lv.id}
                className={`bg-white p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 shadow-sm hover:shadow-md ${
                  statusUpper === 'PENDING' ? 'border-amber-200 bg-amber-50/10' :
                  statusUpper === 'APPROVED' ? 'border-emerald-200' : 'border-rose-200'
                }`}
              >
                <div className="space-y-3">
                  {/* Status & Type Header */}
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${
                      statusUpper === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      statusUpper === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {statusUpper === 'APPROVED' ? 'Approved' : statusUpper === 'REJECTED' ? 'Rejected' : 'Pending Approval'}
                    </span>

                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border uppercase ${
                      isStudentLeave ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'
                    }`}>
                      {isStudentLeave ? 'Student Leave' : 'Staff Leave'}
                    </span>
                  </div>

                  {/* Applicant Details */}
                  <div>
                    {isStudentLeave ? (
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">{studentName}</h3>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                          Class: {className || 'N/A'} &nbsp;·&nbsp; Parent: {parentName}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm">{teacherName}</h3>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Staff / Faculty Member</p>
                      </div>
                    )}
                  </div>

                  {/* Leave Details */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#2E5BFF]">{lv.leaveType} Leave</span>
                      <span className="text-slate-500 font-semibold text-[11px]">{startDateStr} to {endDateStr}</span>
                    </div>
                    <p className="text-slate-600 font-normal leading-relaxed whitespace-pre-wrap">{lv.reason}</p>
                    {lv.attachment && (
                      <a
                        href={lv.attachment}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline pt-1"
                      >
                        <Paperclip className="w-3 h-3" /> View Attachment / Certificate
                      </a>
                    )}
                  </div>

                  {/* Comments / Admin Remarks */}
                  {lv.comments && (
                    <div className="bg-blue-50/40 p-2.5 rounded-xl border border-blue-100 text-[11px] text-slate-700 space-y-0.5">
                      <strong className="text-blue-800 font-bold block">
                        Remarks by {lv.approver || lv.approvedBy?.name || 'Approver'}:
                      </strong>
                      <p className="italic">{lv.comments}</p>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedLeave(lv)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" /> Details &amp; History
                  </button>

                  {statusUpper === 'PENDING' ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setSelectedLeave(lv); setActionStatus('APPROVED'); setRemarks(''); }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => { setSelectedLeave(lv); setActionStatus('REJECTED'); setRemarks(''); }}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Processed
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details & Action Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-0">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-base leading-none">
                  Leave Application Details
                </h3>
                <p className="text-slate-400 text-xs mt-1">Reference ID: {selectedLeave.id}</p>
              </div>
              <button
                onClick={() => { setSelectedLeave(null); setActionStatus(null); }}
                className="p-1.5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Application Details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Applicant</span>
                  <p className="font-extrabold text-slate-900 mt-0.5">
                    {selectedLeave.student?.user?.name || selectedLeave.teacher?.user?.name || 'Applicant'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Type</span>
                  <p className="font-extrabold text-blue-600 mt-0.5">{selectedLeave.leaveType} Leave</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">From Date</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedLeave.startDate ? selectedLeave.startDate.split('T')[0] : 'N/A'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">To Date</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedLeave.endDate ? selectedLeave.endDate.split('T')[0] : 'N/A'}</p>
                </div>
              </div>

              {/* Reason */}
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1">Reason Description</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {selectedLeave.reason}
                </p>
              </div>

              {/* Audit Trail Timeline */}
              {selectedLeave.statusHistories && selectedLeave.statusHistories.length > 0 && (
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">Audit Trail History</span>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedLeave.statusHistories.map((h: any, i: number) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                        <Clock className="w-3.5 h-3.5 text-[#2E5BFF] shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 text-[11px]">
                            Status changed to <strong className="text-blue-600">{h.currentStatus}</strong> by {h.updatedBy?.name || 'User'} ({h.updatedBy?.role || 'Staff'})
                          </p>
                          {h.remarks && <p className="text-slate-500 text-[10px] italic mt-0.5">"{h.remarks}"</p>}
                          <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{new Date(h.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Form */}
              {actionStatus && (
                <form onSubmit={handleProcessAction} className="border-t border-slate-200 pt-4 space-y-3">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    {actionStatus === 'APPROVED' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                    Confirm {actionStatus === 'APPROVED' ? 'Approval' : 'Rejection'}
                  </h4>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Remarks / Comments (Optional)
                    </label>
                    <textarea
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="Enter remarks for parent/teacher..."
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-[#2E5BFF]"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setActionStatus(null)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessingAction}
                      className={`px-5 py-2 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm ${
                        actionStatus === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                      }`}
                    >
                      {isProcessingAction ? 'Processing...' : `Confirm ${actionStatus === 'APPROVED' ? 'Approval' : 'Rejection'}`}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Apply Leave Modal for Staff */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-end z-[100] transition-opacity duration-300 animate-in">
          <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl relative overflow-hidden animate-slide-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-900 text-lg leading-none">Apply Staff Leave Request</h3>
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
