'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Search, User, Filter, Plus, ShieldAlert, Award, Calendar, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';

interface BehaviorCase {
  id: string;
  caseNumber: string;
  studentId: string;
  studentName: string;
  className: string;
  behaviorType: 'Complaint' | 'Praise';
  category: string;
  description: string;
  status: 'New' | 'In Progress' | 'Closed';
  priority: 'High' | 'Medium' | 'Low';
  academicYear: string;
  submittedBy: string;
  createdDate: string;
}

export default function ComplaintsPage() {
  const [cases, setCases] = useState<BehaviorCase[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentSearchResults, setStudentSearchResults] = useState<any[]>([]);
  const [behaviorType, setBehaviorType] = useState<'Complaint' | 'Praise'>('Complaint');
  const [category, setCategory] = useState('Discipline');
  const [description, setDescription] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [submittedByTeacherId, setSubmittedByTeacherId] = useState('');
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  
  // Filter states
  const [filterClass, setFilterClass] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected case for detailed modal
  const [selectedCase, setSelectedCase] = useState<BehaviorCase | null>(null);

  // Success alert state
  const [alertMessage, setAlertMessage] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [casesRes, ayRes, teachersRes, classesRes] = await Promise.all([
        api.get('/complaint-box/pending-cases'),
        api.get('/complaint-box/academic-years'),
        api.get('/complaint-box/teachers'),
        api.get('/complaint-box/student-classes')
      ]);

      setAcademicYears(ayRes.data);
      if (ayRes.data.length > 0) {
        setAcademicYear(ayRes.data[0].name);
      }

      setTeachersList(teachersRes.data);
      setClassesList(classesRes.data);

      setCases(casesRes.data.map((c: any) => ({
        id: c.id,
        caseNumber: c.id.substring(0, 8).toUpperCase(),
        studentId: c.studentId,
        studentName: c.student?.user?.name || 'Unknown Student',
        className: c.student?.classSection ? `${c.student.classSection.class.name} - ${c.student.classSection.section.name}` : 'N/A',
        behaviorType: c.behaviorType,
        category: c.category,
        description: c.description || '',
        status: c.status,
        priority: c.priority,
        academicYear: c.academicYear,
        submittedBy: c.teacher?.user?.name || 'Admin',
        createdDate: new Date(c.createdAt).toISOString().split('T')[0]
      })));
    } catch (err) {
      console.error('Failed to load complaint data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Search students when input changes
  useEffect(() => {
    if (studentSearch.trim() === '' || selectedStudentId) {
      setStudentSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await api.get('/complaint-box/search-students', {
          params: { searchTerm: studentSearch }
        });
        setStudentSearchResults(res.data);
      } catch (err) {
        console.error('Error searching students:', err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [studentSearch, selectedStudentId]);

  // Auto-calculated statistics
  const totalCases = cases.length;
  const totalComplaints = cases.filter(c => c.behaviorType === 'Complaint').length;
  const totalPraises = cases.filter(c => c.behaviorType === 'Praise').length;
  const totalResolved = cases.filter(c => c.status === 'Closed').length;

  // Filtered cases list
  const filteredCases = cases.filter(c => {
    const matchesClass = filterClass === 'All' || c.className.includes(filterClass);
    const matchesType = filterType === 'All' || c.behaviorType === filterType;
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    const matchesSearch = c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesType && matchesStatus && matchesSearch;
  });

  const handleSelectStudent = (student: any) => {
    setSelectedStudentId(student.id);
    setStudentSearch(student.user.name);
    setStudentSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      alert('Please search and select a valid student from the suggestions list.');
      return;
    }
    if (!submittedByTeacherId) {
      alert('Please select a submitting teacher.');
      return;
    }
    if (description.length < 10) {
      alert('Description must be at least 10 characters long.');
      return;
    }

    try {
      const res = await api.post('/complaint-box/submit-behavior', {
        studentId: selectedStudentId,
        behaviorType,
        category,
        description,
        academicYear,
        teacherId: submittedByTeacherId
      });

      setShowAddForm(false);
      
      // Reset form fields
      setSelectedStudentId('');
      setStudentSearch('');
      setDescription('');
      setBehaviorType('Complaint');
      setCategory('Discipline');
      setSubmittedByTeacherId('');

      setAlertMessage(`Record created successfully.`);
      setTimeout(() => setAlertMessage(''), 4000);
      loadData();
    } catch (err) {
      console.error('Failed to submit behavior:', err);
      alert('Failed to submit behavior record');
    }
  };

  const handleUpdateStatus = async (caseId: string, newStatus: 'New' | 'In Progress' | 'Closed') => {
    try {
      await api.patch(`/complaint-box/case-status/${caseId}`, { status: newStatus });
      setCases(prev => prev.map(c => c.id === caseId ? { ...c, status: newStatus } : c));
      if (selectedCase && selectedCase.id === caseId) {
        setSelectedCase({ ...selectedCase, status: newStatus });
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update case status');
    }
  };

  // Get unique classes for the filter dropdown
  const uniqueClasses = Array.from(new Set(classesList.map(cs => cs.class.name))).sort();

  return (
    <div className="space-y-8 animate-in">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-[28px] font-bold text-slate-950 leading-none">
            Complaint Box
          </h1>
          <p className="text-slate-500 text-[13px] font-medium mt-2">
            Replicates `complaintbox` LWC. Record behavior infractions, praises, and log disciplinary action items.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-xl bg-[#2E5BFF] text-white hover:bg-blue-600 font-semibold text-[13px] flex items-center gap-2 transition-all shadow-md shadow-blue-500/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Log New Behavior Record
        </button>
      </div>

      {alertMessage && (
        <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-[13px] shadow-xs">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{alertMessage}</span>
        </div>
      )}

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2E5BFF] flex items-center justify-center shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[24px] font-bold text-slate-900 leading-tight">{totalCases}</div>
            <div className="text-[12px] text-slate-400 font-semibold uppercase tracking-wider">Total Logs</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[24px] font-bold text-slate-900 leading-tight">{totalComplaints}</div>
            <div className="text-[12px] text-slate-400 font-semibold uppercase tracking-wider">Active Complaints</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[24px] font-bold text-slate-900 leading-tight">{totalPraises}</div>
            <div className="text-[12px] text-slate-400 font-semibold uppercase tracking-wider">Praises & Merits</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-500 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[24px] font-bold text-slate-900 leading-tight">{totalResolved}</div>
            <div className="text-[12px] text-slate-400 font-semibold uppercase tracking-wider">Closed Records</div>
          </div>
        </div>
      </div>

      {/* Add New Case Form */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-in space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-[16px] font-bold text-slate-900">Record Behavior or Discipline Incident</h3>
            <p className="text-slate-400 text-[12px] mt-0.5">Fills Apex `submitStudentBehavior` controller logic</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Student Lookup Input */}
              <div className="relative">
                <label className="block text-[12px] text-slate-500 font-semibold mb-1">Student Search *</label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Search by student name or roll number..."
                    value={studentSearch}
                    onChange={(e) => {
                      setStudentSearch(e.target.value);
                      if (selectedStudentId) setSelectedStudentId('');
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-slate-800 focus:outline-none focus:border-[#2E5BFF] focus:bg-white"
                  />
                </div>
                {/* Autocomplete Suggestions */}
                {!selectedStudentId && studentSearchResults.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden divide-y divide-slate-100">
                    {studentSearchResults.map(student => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => handleSelectStudent(student)}
                        className="w-full text-left px-4 py-2.5 text-[13px] text-slate-700 hover:bg-slate-50 flex justify-between items-center cursor-pointer"
                      >
                        <span className="font-medium">{student.user.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Roll: {student.rollNo || 'N/A'} • {student.classSection ? `${student.classSection.class.name} - ${student.classSection.section.name}` : 'N/A'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedStudentId && (
                  <div className="mt-1 text-[11px] text-[#2E5BFF] font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Student Selected: {studentSearch}
                  </div>
                )}
              </div>

              {/* Behavior Type Selection */}
              <div>
                <label className="block text-[12px] text-slate-500 font-semibold mb-2">Record Type *</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setBehaviorType('Complaint')}
                    className={`flex-1 py-3 px-4 rounded-xl border text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      behaviorType === 'Complaint'
                        ? 'border-rose-200 bg-rose-50/50 text-rose-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                    Infraction / Complaint
                  </button>
                  <button
                    type="button"
                    onClick={() => setBehaviorType('Praise')}
                    className={`flex-1 py-3 px-4 rounded-xl border text-[13px] font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      behaviorType === 'Praise'
                        ? 'border-emerald-200 bg-emerald-50/50 text-emerald-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    Praise / Merit
                  </button>
                </div>
              </div>

              {/* Category selector - matches Salesforce categoryOptions */}
              <div>
                <label className="block text-[12px] text-slate-500 font-semibold mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-800 focus:outline-none focus:border-[#2E5BFF]"
                >
                  <option value="Academic">Academic Performance</option>
                  <option value="Discipline">Discipline</option>
                  <option value="Sports">Sports & Athletics</option>
                  <option value="Extra-Curricular">Extra-Curricular Activities</option>
                  <option value="General">General Behavior</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 flex flex-col justify-between">
              <div>
                <div className="grid grid-cols-2 gap-4">
                  {/* Academic Year */}
                  <div>
                    <label className="block text-[12px] text-slate-500 font-semibold mb-1">Academic Year</label>
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-800 focus:outline-none"
                    >
                      {academicYears.map(ay => (
                        <option key={ay.id} value={ay.name}>{ay.name}</option>
                      ))}
                    </select>
                  </div>
                  {/* Submitting Teacher - matches Salesforce getTeachers */}
                  <div>
                    <label className="block text-[12px] text-slate-500 font-semibold mb-1">Submitting Teacher *</label>
                    <select
                      value={submittedByTeacherId}
                      onChange={(e) => setSubmittedByTeacherId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-800 focus:outline-none focus:border-[#2E5BFF]"
                    >
                      <option value="">-- Select a Teacher --</option>
                      {teachersList.map(t => (
                        <option key={t.id} value={t.id}>{t.user.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-4">
                  <label className="block text-[12px] text-slate-500 font-semibold mb-1">Description & Incident Details *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide description of behavior incident, location, time, and immediate actions taken (minimum 10 characters required)..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[13px] text-slate-800 focus:outline-none focus:border-[#2E5BFF] focus:bg-white resize-none"
                  />
                  {description && description.length < 10 && (
                    <p className="text-[11px] font-bold text-rose-600 mt-1">
                      Description must be at least 10 characters (currently: {description.length}).
                    </p>
                  )}
                </div>
              </div>

              {/* Submit triggers */}
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-[13px] cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={description.length < 10}
                  className="flex-1 py-2.5 rounded-xl bg-[#2E5BFF] text-white hover:bg-blue-600 font-semibold text-[13px] cursor-pointer text-center shadow-md shadow-blue-500/15 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Case Record
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Cases List Ledger */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Filters Header block */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-slate-700">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-[14px]">Filter Cases Log</span>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Search query */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search case no, student..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-[12px] text-slate-800 outline-none w-48 focus:border-[#2E5BFF]"
              />
            </div>

            {/* Class filter */}
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[12px] text-slate-700 outline-none focus:border-[#2E5BFF]"
            >
              <option value="All">All Grades</option>
              {uniqueClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>

            {/* Type filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[12px] text-slate-700 outline-none focus:border-[#2E5BFF]"
            >
              <option value="All">All Types</option>
              <option value="Complaint">Complaints</option>
              <option value="Praise">Praises</option>
            </select>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-[12px] text-slate-700 outline-none focus:border-[#2E5BFF]"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/35 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Case Details</th>
                <th className="px-6 py-4">Student & Class</th>
                <th className="px-6 py-4">Type & Category</th>
                <th className="px-6 py-4 text-center">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Submitted Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium text-[13px]">
                    No student behavior logs found matching filters.
                  </td>
                </tr>
              ) : (
                filteredCases.map(c => {
                  const isComplaint = c.behaviorType === 'Complaint';
                  const statusColors = {
                    New: 'bg-blue-50 text-blue-700 border-blue-100',
                    'In Progress': 'bg-amber-50 text-amber-700 border-amber-100',
                    Closed: 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  };

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50 text-[13px] text-slate-700 group transition-all">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-900 block">{c.caseNumber}</span>
                        <span className="text-[11px] text-slate-400 font-mono block mt-0.5">By: {c.submittedBy}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{c.studentName}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{c.className}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          isComplaint ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {isComplaint ? <AlertCircle className="w-3 h-3" /> : <Award className="w-3 h-3" />}
                          {c.behaviorType}
                        </span>
                        <div className="text-[11px] text-slate-500 font-medium mt-1">{c.category}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-md ${
                          c.priority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {c.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 border text-[11px] font-semibold rounded-full ${statusColors[c.status]}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium font-mono">
                        {c.createdDate}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 items-center">
                          {c.status !== 'Closed' && (
                            <button
                              onClick={() => handleUpdateStatus(c.id, 'Closed')}
                              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 border border-emerald-200 rounded-lg cursor-pointer"
                            >
                              Resolve
                            </button>
                          )}
                          {c.status === 'New' && (
                            <button
                              onClick={() => handleUpdateStatus(c.id, 'In Progress')}
                              className="px-2.5 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-50 border border-amber-200 rounded-lg cursor-pointer"
                            >
                              Investigate
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedCase(c)}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                            title="View Details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-4 border-t border-slate-100">
          {filteredCases.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-16 text-center text-slate-400 font-medium text-[13px]">
              No student behavior logs found matching filters.
            </div>
          ) : (
            filteredCases.map(c => {
              const isComplaint = c.behaviorType === 'Complaint';
              const statusColors = {
                New: 'bg-blue-50 text-blue-700 border-blue-100',
                'In Progress': 'bg-amber-50 text-amber-700 border-amber-100',
                Closed: 'bg-emerald-50 text-emerald-700 border-emerald-100'
              };

              return (
                <div key={c.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-slate-900 block text-sm">{c.caseNumber}</span>
                      <span className="text-[11px] text-slate-400 font-mono mt-0.5">By: {c.submittedBy} • {c.createdDate}</span>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isComplaint ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {isComplaint ? <AlertCircle className="w-3.5 h-3.5" /> : <Award className="w-3.5 h-3.5" />}
                      {c.behaviorType}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-205/10">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Student & Class</span>
                      <span className="font-bold text-slate-700 block mt-0.5">{c.studentName}</span>
                      <span className="text-slate-500 block text-[10px] mt-0.5">{c.className}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">Category & Priority</span>
                      <span className="font-bold text-slate-700 block mt-0.5">{c.category}</span>
                      <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase mt-1 ${
                        c.priority === 'High' ? 'bg-rose-50 border-rose-100 text-rose-700' : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}>
                        {c.priority}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                    <span className={`inline-flex px-2 py-0.5 border text-[10px] font-semibold rounded-full ${statusColors[c.status]}`}>
                      {c.status}
                    </span>

                    <div className="flex gap-2">
                      {c.status !== 'Closed' && (
                        <button
                          onClick={() => handleUpdateStatus(c.id, 'Closed')}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-50 border border-emerald-200 min-h-[44px] cursor-pointer"
                        >
                          Resolve
                        </button>
                      )}
                      {c.status === 'New' && (
                        <button
                          onClick={() => handleUpdateStatus(c.id, 'In Progress')}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-amber-700 hover:bg-amber-50 border border-amber-200 min-h-[44px] cursor-pointer"
                        >
                          Investigate
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedCase(c)}
                        className="flex items-center justify-center p-2 rounded-xl hover:bg-slate-100 text-slate-450 hover:text-slate-700 min-h-[44px] min-w-[44px] cursor-pointer"
                        title="View Details"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Case Details Drawer / Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in space-y-0">
            {/* Modal Header */}
            <div className={`p-6 border-b border-slate-100 text-white flex justify-between items-start ${
              selectedCase.behaviorType === 'Complaint' 
                ? 'bg-rose-600' 
                : 'bg-emerald-600'
            }`}>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
                  {selectedCase.behaviorType} LOG
                </span>
                <h3 className="text-[18px] font-bold mt-1.5">{selectedCase.caseNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="text-white/80 hover:text-white font-bold text-[18px] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-[13px]">
                <div>
                  <label className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Student Name</label>
                  <span className="text-slate-900 font-bold block mt-0.5">{selectedCase.studentName}</span>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Class & Section</label>
                  <span className="text-slate-900 font-semibold block mt-0.5">{selectedCase.className}</span>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Submitted By</label>
                  <span className="text-slate-900 font-medium block mt-0.5">{selectedCase.submittedBy}</span>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Category</label>
                  <span className="text-slate-900 font-semibold block mt-0.5">{selectedCase.category}</span>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Academic Year</label>
                  <span className="text-slate-800 font-mono block mt-0.5">{selectedCase.academicYear}</span>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Date Logged</label>
                  <span className="text-slate-800 font-mono block mt-0.5">{selectedCase.createdDate}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <label className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider mb-1">Description Details</label>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-[13px] leading-relaxed">
                  {selectedCase.description}
                </div>
              </div>

              {/* Status Update section in modal */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                <div>
                  <label className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">Current Status</label>
                  <span className={`inline-block mt-1 px-3 py-0.5 border text-[11px] font-bold rounded-full ${
                    selectedCase.status === 'New' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                    selectedCase.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    'bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}>
                    {selectedCase.status}
                  </span>
                </div>

                <div className="flex gap-2">
                  {selectedCase.status !== 'New' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedCase.id, 'New')}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-[12px] font-semibold cursor-pointer"
                    >
                      Set New
                    </button>
                  )}
                  {selectedCase.status !== 'In Progress' && selectedCase.status !== 'Closed' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedCase.id, 'In Progress')}
                      className="px-3 py-1.5 rounded-lg border border-amber-200 text-amber-700 bg-amber-50/30 hover:bg-amber-50 text-[12px] font-semibold cursor-pointer"
                    >
                      Investigate
                    </button>
                  )}
                  {selectedCase.status !== 'Closed' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedCase.id, 'Closed')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-semibold cursor-pointer"
                    >
                      Resolve Case
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-350 text-slate-700 rounded-xl text-[12px] font-bold cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
