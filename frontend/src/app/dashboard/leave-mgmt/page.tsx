'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import {
  CalendarDays, Plus, Trash2, X, AlertCircle, CheckCircle,
  FileText, Filter, Eye, Check, Clock, User, ShieldAlert, Paperclip, MessageSquare,
  ChevronDown, ChevronUp, Download, ArrowUpDown
} from 'lucide-react';
import { useTenant } from '@/app/providers/TenantContext';

function LeaveMgmtContent() {
  const { currentUser } = useTenant();
  const searchParams = useSearchParams();
  const highlightId = searchParams ? searchParams.get('id') : null;

  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    pending: 0,
    approvedToday: 0,
    rejectedToday: 0,
    totalThisMonth: 0,
    totalThisYear: 0,
  });

  // Admin Search & Pagination Filters
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [applicantTypeFilter, setApplicantTypeFilter] = useState<string>('ALL');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>('ALL');
  const [academicYearFilter, setAcademicYearFilter] = useState<string>('ALL');
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('appliedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Multi-select for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkActionType, setBulkActionType] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [bulkRemarks, setBulkRemarks] = useState('');
  const [isProcessingBulk, setIsProcessingBulk] = useState(false);

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

  // Applicant History
  const [applicantHistory, setApplicantHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const isAdmin = currentUser?.role === 'SCHOOL_ADMIN' || currentUser?.role === 'SUPER_ADMIN';

  // Search Debouncer
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Load Lookup Data
  useEffect(() => {
    if (isAdmin) {
      api.get('/academics/academic-years')
        .then(res => setAcademicYears(res.data || []))
        .catch(err => console.error('Failed to load academic years:', err));
    }
  }, [isAdmin]);

  // Load Leaves List & Stats
  async function loadLeaves() {
    try {
      if (isAdmin) {
        const params: any = {
          page,
          limit,
          status: statusFilter,
          applicantType: applicantTypeFilter,
          leaveType: leaveTypeFilter,
          academicYearId: academicYearFilter,
          startDate: startDateFilter || undefined,
          endDate: endDateFilter || undefined,
          search: debouncedSearch || undefined,
          sortBy,
          sortOrder,
        };
        const [leavesRes, statsRes] = await Promise.all([
          api.get('/leave-management', { params }),
          api.get('/leave-management/stats')
        ]);
        setLeaves(leavesRes.data.data || []);
        setTotalPages(leavesRes.data.totalPages || 1);
        setStats(statsRes.data);
      } else {
        const res = await api.get('/teacher-portal/leave');
        setLeaves(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load leaves:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeaves();
  }, [
    page,
    statusFilter,
    applicantTypeFilter,
    leaveTypeFilter,
    academicYearFilter,
    startDateFilter,
    endDateFilter,
    debouncedSearch,
    sortBy,
    sortOrder,
    isAdmin
  ]);

  // Highlight URL ID
  useEffect(() => {
    if (highlightId && leaves.length > 0) {
      const match = leaves.find(l => l.id === highlightId);
      if (match) {
        setSelectedLeave(match);
      }
    }
  }, [highlightId, leaves]);

  // Fetch applicant history when modal is open
  useEffect(() => {
    if (selectedLeave && isAdmin) {
      const isStudent = selectedLeave.applicantType === 'STUDENT' || !!selectedLeave.student;
      const applicantId = isStudent ? selectedLeave.studentId : selectedLeave.teacherId;
      const applicantType = isStudent ? 'STUDENT' : 'TEACHER';

      if (applicantId) {
        setLoadingHistory(true);
        api.get(`/leave-management/history/${applicantType}/${applicantId}`)
          .then(res => setApplicantHistory(res.data || []))
          .catch(err => console.error('Failed to load applicant history:', err))
          .finally(() => setLoadingHistory(false));
      }
    } else {
      setApplicantHistory([]);
    }
  }, [selectedLeave, isAdmin]);

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
      await api.patch(`/leave-management/${selectedLeave.id}/status`, {
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

  const handleBulkAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0 || !bulkActionType) return;
    setIsProcessingBulk(true);
    try {
      const statusText = bulkActionType === 'APPROVED' ? 'Approved' : 'Rejected';
      await api.post('/leave-management/bulk-status', {
        ids: selectedIds,
        status: statusText,
        comments: bulkRemarks,
      });
      setSelectedIds([]);
      setBulkActionType(null);
      setBulkRemarks('');
      await loadLeaves();
    } catch (err) {
      console.error('Failed to process bulk actions:', err);
      alert('Failed to process bulk actions.');
    } finally {
      setIsProcessingBulk(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(leaves.map(l => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Leave ID', 'Applicant Name', 'Type', 'Student Name', 'Class/Section',
      'Leave Type', 'Start Date', 'End Date', 'Days', 'Reason', 'Applied Date',
      'Status', 'Reviewed By', 'Reviewed Date'
    ];

    const rows = leaves.map(l => {
      const isStudent = l.applicantType === 'STUDENT' || !!l.student;
      const applicantName = isStudent ? (l.student?.user?.name || 'Student') : (l.teacher?.user?.name || 'Teacher');
      const applicantType = isStudent ? 'Parent' : 'Teacher';
      const studentName = isStudent ? (l.student?.user?.name || '') : '';
      const classSection = l.student?.classSection ? `${l.student.classSection.class?.name || ''} - ${l.student.classSection.section?.name || ''}` : '';
      const diffTime = Math.abs(new Date(l.endDate).getTime() - new Date(l.startDate).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      return [
        l.id,
        applicantName,
        applicantType,
        studentName,
        classSection,
        l.leaveType,
        l.startDate?.split('T')[0] || '',
        l.endDate?.split('T')[0] || '',
        diffDays,
        l.reason?.replace(/"/g, '""') || '',
        l.createdAt?.split('T')[0] || '',
        l.status,
        l.approver || '',
        l.approvedDate || l.rejectedDate || ''
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(r => r.map(val => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leave_requests_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculatedLeaves = useMemo(() => {
    if (isAdmin) return leaves;
    // Teacher filters locally
    return leaves.filter(lv => {
      const st = (lv.status || 'PENDING').toUpperCase();
      if (statusFilter !== 'ALL' && st !== statusFilter) return false;
      const type = (lv.applicantType || 'STAFF').toUpperCase();
      if (applicantTypeFilter !== 'ALL' && type !== applicantTypeFilter) return false;
      return true;
    });
  }, [leaves, isAdmin, statusFilter, applicantTypeFilter]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-t-[#2E5BFF] border-slate-200 rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Loading leave requests dashboard...</p>
      </div>
    );
  }

  // --- SCHOOL ADMIN RENDER ---
  if (isAdmin) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-20 font-sans text-slate-800">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-7 h-7 text-[#2E5BFF]" />
              Leave Requests Hub
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Centralized Leave Management system to process and audit Teacher and Parent leave requests.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-all"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button
              onClick={openCreateModal}
              className="px-4 py-2.5 bg-[#2E5BFF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" /> Apply Staff Leave
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Pending Requests</span>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{stats.pending}</div>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Approved Today</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.approvedToday}</div>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Rejected Today</span>
            <div className="text-2xl font-extrabold text-rose-600 mt-1">{stats.rejectedToday}</div>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total This Month</span>
            <div className="text-2xl font-extrabold text-blue-600 mt-1">{stats.totalThisMonth}</div>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total This Year</span>
            <div className="text-2xl font-extrabold text-purple-600 mt-1">{stats.totalThisYear}</div>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-[#2E5BFF]" />
            Search and Filter Filters
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Applicant Type</label>
              <select
                value={applicantTypeFilter}
                onChange={(e) => { setApplicantTypeFilter(e.target.value); setPage(1); }}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none"
              >
                <option value="ALL">All Applicants</option>
                <option value="TEACHER">Teacher</option>
                <option value="PARENT">Parent</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Leave Type</label>
              <select
                value={leaveTypeFilter}
                onChange={(e) => { setLeaveTypeFilter(e.target.value); setPage(1); }}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none"
              >
                <option value="ALL">All Types</option>
                <option value="Casual">Casual</option>
                <option value="Medical">Medical</option>
                <option value="Emergency">Emergency</option>
                <option value="HalfDay">Half Day</option>
                <option value="Maternity">Maternity</option>
                <option value="Paternity">Paternity</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Academic Year</label>
              <select
                value={academicYearFilter}
                onChange={(e) => { setAcademicYearFilter(e.target.value); setPage(1); }}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none"
              >
                <option value="ALL">All Years</option>
                {academicYears.map(yr => (
                  <option key={yr.id} value={yr.id}>{yr.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Start Date</label>
              <input
                type="date"
                value={startDateFilter}
                onChange={(e) => { setStartDateFilter(e.target.value); setPage(1); }}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">End Date</label>
              <input
                type="date"
                value={endDateFilter}
                onChange={(e) => { setEndDateFilter(e.target.value); setPage(1); }}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 p-2.5 rounded-xl outline-none"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Applicant Name, Employee ID, or Student ID..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-[#2E5BFF]"
            />
          </div>
        </div>

        {/* Bulk Actions Panel */}
        {selectedIds.length > 0 && (
          <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top-4">
            <span className="text-xs font-bold">{selectedIds.length} Leave Request(s) Selected</span>
            <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
              <button
                onClick={() => { setBulkActionType('APPROVED'); setBulkRemarks(''); }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Bulk Approve
              </button>
              <button
                onClick={() => { setBulkActionType('REJECTED'); setBulkRemarks(''); }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Bulk Reject
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Deselect All
              </button>
            </div>
          </div>
        )}

        {/* Leaves Table (Desktop view) */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hidden md:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={leaves.length > 0 && selectedIds.length === leaves.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded"
                  />
                </th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort('applicantName')}>
                  <span className="flex items-center gap-1">Applicant Name <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="p-4">Type</th>
                <th className="p-4">Student / Class</th>
                <th className="p-4">Leave Type</th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort('startDate')}>
                  <span className="flex items-center gap-1">Date Range <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="p-4">Days</th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort('appliedDate')}>
                  <span className="flex items-center gap-1">Applied Date <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort('status')}>
                  <span className="flex items-center gap-1">Status <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-600">
              {calculatedLeaves.map((l) => {
                const isStudent = l.applicantType === 'STUDENT' || !!l.student;
                const name = isStudent ? (l.student?.user?.name || 'Student') : (l.teacher?.user?.name || 'Teacher');
                const rollNoOrEmpId = isStudent ? (l.student?.rollNo || 'N/A') : (l.teacher?.employeeId || 'N/A');
                const studentDetail = isStudent ? name : '';
                const classSectionStr = l.student?.classSection ? `${l.student.classSection.class?.name || ''} - ${l.student.classSection.section?.name || ''}` : '';
                const diffTime = Math.abs(new Date(l.endDate).getTime() - new Date(l.startDate).getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                const statusUpper = (l.status || 'PENDING').toUpperCase();

                return (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(l.id)}
                        onChange={(e) => handleSelectOne(l.id, e.target.checked)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">ID: {rollNoOrEmpId}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-lg border text-[10px] uppercase font-bold ${
                        isStudent ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'
                      }`}>
                        {isStudent ? 'Parent' : 'Teacher'}
                      </span>
                    </td>
                    <td className="p-4">
                      {isStudent ? (
                        <>
                          <div className="text-slate-800">{studentDetail}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{classSectionStr}</div>
                        </>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="p-4 text-[#2E5BFF] font-bold">{l.leaveType}</td>
                    <td className="p-4 text-slate-500 font-semibold font-mono">
                      {l.startDate?.split('T')[0]} to {l.endDate?.split('T')[0]}
                    </td>
                    <td className="p-4 font-bold">{diffDays} Days</td>
                    <td className="p-4 text-slate-400 font-mono">
                      {l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${
                        statusUpper === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        statusUpper === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {statusUpper === 'APPROVED' ? 'Approved' : statusUpper === 'REJECTED' ? 'Rejected' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedLeave(l)}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {statusUpper === 'PENDING' && (
                          <>
                            <button
                              onClick={() => { setSelectedLeave(l); setActionStatus('APPROVED'); setRemarks(''); }}
                              className="p-1.5 hover:bg-emerald-50 text-emerald-600 hover:text-emerald-750 rounded-lg cursor-pointer"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setSelectedLeave(l); setActionStatus('REJECTED'); setRemarks(''); }}
                              className="p-1.5 hover:bg-rose-50 text-rose-600 hover:text-rose-750 rounded-lg cursor-pointer"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Responsive Mobile Layout Cards */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {calculatedLeaves.map((l) => {
            const isStudent = l.applicantType === 'STUDENT' || !!l.student;
            const name = isStudent ? (l.student?.user?.name || 'Student') : (l.teacher?.user?.name || 'Teacher');
            const classSectionStr = l.student?.classSection ? `${l.student.classSection.class?.name || ''} - ${l.student.classSection.section?.name || ''}` : '';
            const statusUpper = (l.status || 'PENDING').toUpperCase();

            return (
              <div
                key={l.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${
                    statusUpper === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    statusUpper === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {statusUpper}
                  </span>
                  <span className={`px-2 py-0.5 rounded-lg border text-[9px] uppercase font-bold ${
                    isStudent ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'
                  }`}>
                    {isStudent ? 'Parent' : 'Teacher'}
                  </span>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{name}</h3>
                  {isStudent && classSectionStr && (
                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Class: {classSectionStr}</p>
                  )}
                  <p className="text-xs text-slate-800 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <strong className="text-blue-600 block mb-1">{l.leaveType} Leave</strong>
                    {l.startDate?.split('T')[0]} to {l.endDate?.split('T')[0]}
                  </p>
                </div>
                <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedLeave(l)}
                    className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Details
                  </button>
                  {statusUpper === 'PENDING' && (
                    <>
                      <button
                        onClick={() => { setSelectedLeave(l); setActionStatus('APPROVED'); setRemarks(''); }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => { setSelectedLeave(l); setActionStatus('REJECTED'); setRemarks(''); }}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Server-Side Pagination Controls */}
        <div className="flex justify-between items-center pt-4">
          <span className="text-xs text-slate-400 font-bold uppercase">Page {page} of {totalPages}</span>
          <div className="flex gap-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-50 text-xs font-bold rounded-xl cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-50 text-xs font-bold rounded-xl cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>

        {/* Leave Details Modal with Applicant History and Audit Trail */}
        {selectedLeave && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4 animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl space-y-0">
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
                {/* Applicant Info */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-150">
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Applicant</span>
                    <p className="font-extrabold text-slate-900 mt-0.5">
                      {selectedLeave.student?.user?.name || selectedLeave.teacher?.user?.name || 'Applicant'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Role / Type</span>
                    <p className="font-extrabold text-slate-800 mt-0.5">
                      {selectedLeave.student ? 'Parent/Student' : 'Teacher/Staff'}
                    </p>
                  </div>
                  {selectedLeave.student && (
                    <div className="col-span-2 border-t border-slate-200 pt-2 grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Class &amp; Section</span>
                        <p className="font-bold text-slate-800 mt-0.5">
                          {selectedLeave.student.classSection ? `${selectedLeave.student.classSection.class?.name} - ${selectedLeave.student.classSection.section?.name}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Student ID (Roll No)</span>
                        <p className="font-bold text-slate-800 mt-0.5">{selectedLeave.student.rollNo || 'N/A'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Leave Info */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Leave Type</span>
                    <p className="font-extrabold text-blue-600 mt-0.5">{selectedLeave.leaveType} Leave</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Applied Date &amp; Time</span>
                    <p className="font-bold text-slate-850 mt-0.5">
                      {selectedLeave.createdAt ? new Date(selectedLeave.createdAt).toLocaleString() : 'N/A'}
                    </p>
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

                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1">Reason Description</span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-wrap">
                    {selectedLeave.reason}
                  </p>
                </div>

                {selectedLeave.attachment && (
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1">Attached Document</span>
                    <a
                      href={selectedLeave.attachment}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-100"
                    >
                      <Paperclip className="w-4 h-4" /> View Medical Certificate / Document
                    </a>
                  </div>
                )}

                {/* Audit Trail Timeline */}
                {selectedLeave.statusHistories && selectedLeave.statusHistories.length > 0 && (
                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">Audit Trail Logs</span>
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

                {/* Previous Leave Requests */}
                <div className="border-t border-slate-100 pt-4 space-y-2">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">Applicant Leave History</span>
                  {loadingHistory ? (
                    <div className="text-xs text-slate-400 italic">Loading previous request logs...</div>
                  ) : applicantHistory.length <= 1 ? (
                    <div className="text-xs text-slate-400 italic">No previous leave requests on record.</div>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {applicantHistory.filter(h => h.id !== selectedLeave.id).map((prevLeave, i) => (
                        <div key={i} className="flex justify-between items-center text-xs bg-slate-50/50 p-2.5 rounded-xl border border-slate-150">
                          <div>
                            <span className="font-bold text-slate-700">{prevLeave.leaveType} Leave</span>
                            <span className="text-[10px] text-slate-400 ml-2 font-mono">
                              ({prevLeave.startDate?.split('T')[0]} to {prevLeave.endDate?.split('T')[0]})
                            </span>
                          </div>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase ${
                            prevLeave.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            prevLeave.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                            'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                            {prevLeave.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

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
                        placeholder="Enter remarks for applicant..."
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

        {/* Bulk Action Remarks Modal */}
        {bulkActionType && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[110] p-4 animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5 mb-3">
                {bulkActionType === 'APPROVED' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                Bulk Process {selectedIds.length} Leave Request(s)
              </h4>

              <form onSubmit={handleBulkAction} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Remarks / Comments (Optional)
                  </label>
                  <textarea
                    value={bulkRemarks}
                    onChange={(e) => setBulkRemarks(e.target.value)}
                    placeholder="Enter remarks for all selected applicants..."
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-[#2E5BFF]"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setBulkActionType(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessingBulk}
                    className={`px-5 py-2 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm ${
                      bulkActionType === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {isProcessingBulk ? 'Processing...' : `Confirm Bulk ${bulkActionType === 'APPROVED' ? 'Approval' : 'Rejection'}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- TEACHER / STAFF RENDER ---
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
            Manage and track your leave history or submit a new leave request.
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
      {calculatedLeaves.length === 0 ? (
        <div className="bg-white p-16 text-center rounded-3xl border border-slate-200 shadow-xs text-slate-400 space-y-2">
          <FileText className="w-12 h-12 mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">No leave applications found matching filters.</p>
          <p className="text-xs text-slate-400">Applications submitted by parents or staff will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {calculatedLeaves.map((lv) => {
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

                  {statusUpper === 'PENDING' && !isAdmin && (
                    <button
                      onClick={() => handleDelete(lv.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Cancel Request
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Details & Action Modal for Staff view */}
      {selectedLeave && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl space-y-0">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-base leading-none">
                  Leave Application Details
                </h3>
                <p className="text-slate-400 text-xs mt-1">Reference ID: {selectedLeave.id}</p>
              </div>
              <button
                onClick={() => { setSelectedLeave(null); }}
                className="p-1.5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
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

              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block mb-1">Reason Description</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {selectedLeave.reason}
                </p>
              </div>

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
            </div>
          </div>
        </div>
      )}

      {/* Apply Leave Modal for Staff (teacher view) */}
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

export default function LeaveMgmtPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-t-[#2E5BFF] border-slate-200 rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Loading Leave Management...</p>
      </div>
    }>
      <LeaveMgmtContent />
    </Suspense>
  );
}
