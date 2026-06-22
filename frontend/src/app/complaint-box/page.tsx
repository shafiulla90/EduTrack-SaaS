'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, CheckCircle, Search, User, Filter, Plus, 
  ShieldAlert, Award, Calendar, ChevronRight, BookOpen, Clock, 
  Activity, ArrowLeft, RefreshCw, Eye
} from 'lucide-react';
import { api } from '@/lib/api';

interface BehaviorCase {
  id: string;
  behaviorType: 'Complaint' | 'Praise';
  category: string;
  academicYear: string;
  status: string;
  priority: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  student?: {
    id: string;
    rollNo?: string;
    user: {
      name: string;
    };
    classSection?: {
      class: { name: string };
      section: { name: string };
    };
  };
  teacher?: {
    id: string;
    user: {
      name: string;
    };
  };
}

interface StudentOption {
  id: string;
  rollNo?: string;
  user: {
    name: string;
    email?: string;
    phone?: string;
  };
  classSection?: {
    id: string;
    class: { name: string };
    section: { name: string };
  };
}

interface TeacherOption {
  id: string;
  user: {
    name: string;
  };
}

interface AcademicYear {
  id: string;
  name: string;
}

interface StudentStats {
  studentId: string;
  totalCases: number;
  complaintCount: number;
  praiseCount: number;
  resolvedCount: number;
}

export default function ComplaintBoxPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'submit' | 'history'>('pending');

  // Backend data states
  const [pendingCases, setPendingCases] = useState<BehaviorCase[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [currentTeacher, setCurrentTeacher] = useState<TeacherOption | null>(null);

  // Form states
  const [selectedStudent, setSelectedStudent] = useState<StudentOption | null>(null);
  const [studentSearchInput, setStudentSearchInput] = useState('');
  const [studentSearchResults, setStudentSearchResults] = useState<StudentOption[]>([]);
  const [behaviorType, setBehaviorType] = useState<'Complaint' | 'Praise'>('Complaint');
  const [category, setCategory] = useState('Discipline');
  const [description, setDescription] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [submittingTeacherId, setSubmittingTeacherId] = useState('');

  // Filtering states
  const [filterAcademicYear, setFilterAcademicYear] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Student history & stats states
  const [historyStudent, setHistoryStudent] = useState<StudentOption | null>(null);
  const [historyStudentInput, setHistoryStudentInput] = useState('');
  const [historySearchResults, setHistorySearchResults] = useState<StudentOption[]>([]);
  const [studentCases, setStudentCases] = useState<BehaviorCase[]>([]);
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [historyAcademicYearFilter, setHistoryAcademicYearFilter] = useState('All');

  // UI state
  const [selectedCase, setSelectedCase] = useState<BehaviorCase | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Fetch initial configuration
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [yearsRes, teachersRes, currentTeacherRes] = await Promise.all([
        api.get('/complaint-box/academic-years'),
        api.get('/complaint-box/teachers'),
        api.get('/complaint-box/current-teacher').catch(() => null) // Ignore error if not teacher
      ]);

      setAcademicYears(yearsRes.data || []);
      setTeachers(teachersRes.data || []);

      if (currentTeacherRes && currentTeacherRes.data) {
        setCurrentTeacher(currentTeacherRes.data);
        setSubmittingTeacherId(currentTeacherRes.data.id);
      }

      if (yearsRes.data && yearsRes.data.length > 0) {
        const activeYear = yearsRes.data.find((y: any) => y.isActive) || yearsRes.data[0];
        setSelectedAcademicYear(activeYear.name);
      }

      await refreshPendingCases();
    } catch (err) {
      console.error('Failed to load initial data:', err);
      showAlert('Failed to connect to school data. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshPendingCases = async () => {
    try {
      const res = await api.get('/complaint-box/pending-cases', {
        params: filterAcademicYear !== 'All' ? { academicYear: filterAcademicYear } : {}
      });
      setPendingCases(res.data || []);
    } catch (err) {
      console.error('Failed to refresh pending cases:', err);
    }
  };

  useEffect(() => {
    refreshPendingCases();
  }, [filterAcademicYear]);

  // Autocomplete searches
  useEffect(() => {
    if (studentSearchInput.trim().length < 2) {
      setStudentSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await api.get('/complaint-box/search-students', {
          params: { searchTerm: studentSearchInput }
        });
        setStudentSearchResults(res.data || []);
      } catch (err) {
        console.error('Student search failed:', err);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [studentSearchInput]);

  useEffect(() => {
    if (historyStudentInput.trim().length < 2) {
      setHistorySearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await api.get('/complaint-box/search-students', {
          params: { searchTerm: historyStudentInput }
        });
        setHistorySearchResults(res.data || []);
      } catch (err) {
        console.error('Student search failed:', err);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [historyStudentInput]);

  // Load history and stats when target student is selected
  useEffect(() => {
    if (historyStudent) {
      loadStudentHistoryAndStats(historyStudent.id);
    } else {
      setStudentCases([]);
      setStudentStats(null);
    }
  }, [historyStudent, historyAcademicYearFilter]);

  const loadStudentHistoryAndStats = async (studentId: string) => {
    try {
      const [casesRes, statsRes] = await Promise.all([
        api.get(`/complaint-box/student-cases/${studentId}`, {
          params: historyAcademicYearFilter !== 'All' ? { academicYear: historyAcademicYearFilter } : {}
        }),
        api.get(`/complaint-box/student-stats/${studentId}`)
      ]);
      setStudentCases(casesRes.data || []);
      setStudentStats(statsRes.data || null);
    } catch (err) {
      console.error('Failed to load student history & stats:', err);
    }
  };

  const showAlert = (text: string, type: 'success' | 'error') => {
    setAlertMessage({ text, type });
    setTimeout(() => setAlertMessage(null), 4000);
  };

  const handleSubmitBehavior = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      showAlert('Please search and select a valid student.', 'error');
      return;
    }
    try {
      setIsLoading(true);
      await api.post('/complaint-box/submit-behavior', {
        studentId: selectedStudent.id,
        teacherId: submittingTeacherId || undefined,
        behaviorType,
        category,
        academicYear: selectedAcademicYear,
        description
      });

      showAlert(`Successfully submitted student behavior record for ${selectedStudent.user.name}.`, 'success');
      
      // Reset Form fields
      setSelectedStudent(null);
      setStudentSearchInput('');
      setDescription('');
      
      // Go back to pending view and refresh list
      await refreshPendingCases();
      setActiveTab('pending');
    } catch (err) {
      console.error('Failed to submit student behavior case:', err);
      showAlert('Failed to save student behavior log. Check required fields.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (caseId: string, newStatus: string) => {
    try {
      await api.patch(`/complaint-box/case-status/${caseId}`, {
        status: newStatus
      });
      showAlert(`Case status updated to ${newStatus}.`, 'success');
      
      // Update case status locally in modal if currently open
      if (selectedCase && selectedCase.id === caseId) {
        setSelectedCase(prev => prev ? { ...prev, status: newStatus } : null);
      }
      
      // Refresh grids
      await refreshPendingCases();
      if (historyStudent) {
        await loadStudentHistoryAndStats(historyStudent.id);
      }
    } catch (err) {
      console.error('Failed to update case status:', err);
      showAlert('Error updating case status.', 'error');
    }
  };

  // Local filtering based on query match (Search by student name or category or description)
  const filteredPendingCases = pendingCases.filter(c => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    
    const studentName = c.student?.user?.name?.toLowerCase() || '';
    const desc = c.description?.toLowerCase() || '';
    const cat = c.category?.toLowerCase() || '';
    const id = c.id.toLowerCase();
    
    return studentName.includes(term) || desc.includes(term) || cat.includes(term) || id.includes(term);
  });

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Alert Component */}
      {alertMessage && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl border flex items-center gap-3 text-sm animate-bounce ${
          alertMessage.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300' 
            : 'bg-rose-950/90 border-rose-500 text-rose-300'
        }`}>
          {alertMessage.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-semibold">{alertMessage.text}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Complaint Box
            </h1>
            <p className="text-slate-400 text-xs font-medium">
              Enterprise Parity Platform | Log and manage behavior records, praises, and disciplinary action logs.
            </p>
          </div>

          {/* Tab Selection buttons */}
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 w-fit">
            <button
              onClick={() => { setActiveTab('pending'); refreshPendingCases(); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'pending' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pending Cases
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'submit' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Submit Behavior Log
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'history' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Student History & Stats
            </button>
          </div>
        </div>

        {/* LOADING INDICATOR */}
        {isLoading && (
          <div className="w-full flex items-center justify-center p-12">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            <span className="ml-3 text-slate-400 text-sm font-semibold">Loading platform logs...</span>
          </div>
        )}

        {/* TAB 1: PENDING CASES LEDGER */}
        {!isLoading && activeTab === 'pending' && (
          <div className="space-y-6">
            {/* Filters Header bar */}
            <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 flex flex-wrap gap-4 items-center justify-between shadow-lg">
              <div className="flex items-center gap-2 text-slate-300">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="font-bold text-xs uppercase tracking-wider">Filters Ledger</span>
              </div>

              <div className="flex flex-wrap gap-3 items-center">
                {/* Search Term Filter */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-505" />
                  <input
                    type="text"
                    placeholder="Search by student, details..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-100 outline-none w-48 focus:border-indigo-500"
                  />
                </div>

                {/* Academic Year Selector */}
                <select
                  value={filterAcademicYear}
                  onChange={(e) => setFilterAcademicYear(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-350 outline-none focus:border-indigo-500"
                >
                  <option value="All">All Years</option>
                  {academicYears.map(year => (
                    <option key={year.id} value={year.name}>{year.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cases Card ledger grid */}
            {filteredPendingCases.length === 0 ? (
              <div className="bg-slate-850 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500 shadow-inner">
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-bold text-sm">No pending student behavior cases found.</p>
                <p className="text-xs text-slate-600 mt-1">Cases with status other than "Closed" appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPendingCases.map(c => {
                  const isComplaint = c.behaviorType === 'Complaint';
                  return (
                    <div 
                      key={c.id} 
                      className="bg-slate-850 border border-slate-800 hover:border-slate-700 transition-all rounded-2xl p-5 shadow-md hover:shadow-lg flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            isComplaint ? 'bg-rose-950/80 border border-rose-900 text-rose-300' : 'bg-emerald-950/80 border border-emerald-900 text-emerald-300'
                          }`}>
                            {isComplaint ? <ShieldAlert className="w-3.5 h-3.5" /> : <Award className="w-3.5 h-3.5" />}
                            {c.behaviorType}
                          </span>

                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase border ${
                            c.priority === 'High' ? 'bg-rose-950 border-rose-900 text-rose-300' : 'bg-amber-950 border-amber-900 text-amber-300'
                          }`}>
                            {c.priority} Priority
                          </span>
                        </div>

                        <div>
                          <h3 className="font-bold text-sm text-slate-100">{c.student?.user?.name || 'Unknown Student'}</h3>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Roll No: {c.student?.rollNo || 'N/A'} • {c.student?.classSection?.class.name} {c.student?.classSection?.section.name}
                          </p>
                        </div>

                        <div>
                          <span className="text-[11px] font-bold text-indigo-400">{c.category}</span>
                          <p className="text-slate-300 text-xs mt-1 line-clamp-3 leading-relaxed">
                            {c.description}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-slate-800 mt-4 pt-3 flex items-center justify-between text-xs">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 font-semibold uppercase">Logged By</span>
                          <span className="text-slate-300 font-medium">{c.teacher?.user.name || 'Admin'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedCase(c)}
                            className="p-1.5 rounded-lg bg-slate-805 border border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-colors"
                            title="View Case Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {c.status !== 'Closed' && (
                            <button
                              onClick={() => handleUpdateStatus(c.id, 'Closed')}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-950 border border-emerald-900 hover:bg-emerald-900 text-emerald-300 font-bold text-[11px] transition-colors"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LOG NEW BEHAVIOR RECORD */}
        {!isLoading && activeTab === 'submit' && (
          <div className="bg-slate-850 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 max-w-2xl mx-auto">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-slate-100">Log Behavior / Praise Record</h2>
              <p className="text-slate-500 text-xs mt-1">Submit behaviour case log. Matches Salesforce target metadata.</p>
            </div>

            <form onSubmit={handleSubmitBehavior} className="space-y-5">
              {/* Autocomplete Student Search */}
              <div className="relative">
                <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Search Student *</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required={!selectedStudent}
                    placeholder="Type student name or roll number to search..."
                    value={studentSearchInput}
                    onChange={(e) => {
                      setStudentSearchInput(e.target.value);
                      if (selectedStudent) setSelectedStudent(null);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Suggestions List */}
                {!selectedStudent && studentSearchResults.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-20 max-h-48 overflow-y-auto divide-y divide-slate-700">
                    {studentSearchResults.map(student => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => {
                          setSelectedStudent(student);
                          setStudentSearchInput(student.user.name);
                          setStudentSearchResults([]);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-slate-750 flex justify-between items-center transition-colors"
                      >
                        <span className="font-semibold">{student.user.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Roll: {student.rollNo || 'N/A'} • {student.classSection?.class.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {selectedStudent && (
                  <div className="mt-2 p-2 bg-indigo-950/40 border border-indigo-900 rounded-xl flex items-center gap-2 text-[11px] text-indigo-300">
                    <CheckCircle className="w-4 h-4" />
                    <span>
                      Selected: <strong>{selectedStudent.user.name}</strong> ({selectedStudent.classSection?.class.name} {selectedStudent.classSection?.section.name})
                    </span>
                  </div>
                )}
              </div>

              {/* Behavior Record Type */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setBehaviorType('Complaint')}
                  className={`py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    behaviorType === 'Complaint'
                      ? 'border-rose-500 bg-rose-950/40 text-rose-400'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  Complaint (High Priority)
                </button>

                <button
                  type="button"
                  onClick={() => setBehaviorType('Praise')}
                  className={`py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    behaviorType === 'Praise'
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-400'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  Praise (Medium Priority)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Academic Year Selection */}
                <div>
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Academic Year</label>
                  <select
                    value={selectedAcademicYear}
                    onChange={(e) => setSelectedAcademicYear(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-350 outline-none"
                  >
                    {academicYears.map(year => (
                      <option key={year.id} value={year.name}>{year.name}</option>
                    ))}
                  </select>
                </div>

                {/* Submitting Teacher */}
                <div className="sm:col-span-2">
                  <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Submitting Teacher</label>
                  <select
                    value={submittingTeacherId}
                    onChange={(e) => setSubmittingTeacherId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-300 outline-none focus:border-indigo-500"
                  >
                    {currentTeacher && (
                      <option value={currentTeacher.id}>
                        {currentTeacher.user.name} (Authenticated Teacher Profile)
                      </option>
                    )}
                    <option value="">-- Select Alternate Teacher --</option>
                    {teachers
                      .filter(t => currentTeacher ? t.id !== currentTeacher.id : true)
                      .map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.user.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-300 outline-none focus:border-indigo-500"
                >
                  <option value="Academic">Academic Performance</option>
                  <option value="Discipline">Classroom Discipline</option>
                  <option value="Attendance">Attendance & Punctuality</option>
                  <option value="Sports">Sports & Physical Education</option>
                  <option value="Dress Code">Uniform & Dress Code</option>
                  <option value="General">General Conduct</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Details & Description *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe the student behavior, location, circumstances, and actions taken..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Submits */}
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStudent(null);
                    setStudentSearchInput('');
                    setDescription('');
                    setActiveTab('pending');
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-400 font-bold text-xs transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer text-center"
                >
                  Log Case Record
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: STUDENT HISTORY & STATS DASHBOARD */}
        {!isLoading && activeTab === 'history' && (
          <div className="space-y-6">
            {/* Student Selector card */}
            <div className="bg-slate-850 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4 max-w-xl mx-auto">
              <div>
                <h3 className="font-bold text-sm text-slate-100">Select Student to view behavior ledger</h3>
                <p className="text-slate-500 text-[11px] mt-0.5">Fetches student stats dashboard and full historical log.</p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-505" />
                <input
                  type="text"
                  placeholder="Search student name..."
                  value={historyStudentInput}
                  onChange={(e) => {
                    setHistoryStudentInput(e.target.value);
                    if (historyStudent) setHistoryStudent(null);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 outline-none focus:border-indigo-500"
                />

                {!historyStudent && historySearchResults.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-20 max-h-48 overflow-y-auto divide-y divide-slate-700">
                    {historySearchResults.map(student => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => {
                          setHistoryStudent(student);
                          setHistoryStudentInput(student.user.name);
                          setHistorySearchResults([]);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-355 hover:bg-slate-750 flex justify-between items-center transition-colors"
                      >
                        <span className="font-semibold">{student.user.name}</span>
                        <span className="text-[10px] text-slate-505 font-mono">
                          Roll: {student.rollNo || 'N/A'} • {student.classSection?.class.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dashboard & History container */}
            {historyStudent ? (
              <div className="space-y-6">
                {/* Stats Dashboard cards */}
                {studentStats && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1 */}
                    <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 text-indigo-400 flex items-center justify-center">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xl font-black text-slate-100">{studentStats.totalCases}</div>
                        <div className="text-[9px] text-slate-505 uppercase tracking-widest font-bold">Total Logs</div>
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 text-rose-400 flex items-center justify-center">
                        <ShieldAlert className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xl font-black text-slate-100">{studentStats.complaintCount}</div>
                        <div className="text-[9px] text-slate-505 uppercase tracking-widest font-bold">Complaints</div>
                      </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xl font-black text-slate-100">{studentStats.praiseCount}</div>
                        <div className="text-[9px] text-slate-505 uppercase tracking-widest font-bold">Praises & Merits</div>
                      </div>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 text-teal-400 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xl font-black text-slate-100">{studentStats.resolvedCount}</div>
                        <div className="text-[9px] text-slate-505 uppercase tracking-widest font-bold">Resolved</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* History list block */}
                <div className="bg-slate-850 border border-slate-800 rounded-3xl overflow-hidden shadow-lg">
                  <div className="p-5 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-slate-100">Behavior Cases History</h4>
                      <p className="text-slate-505 text-[10px] mt-0.5">Historical logs for {historyStudent.user.name}</p>
                    </div>

                    {/* Academic year filter for student cases */}
                    <select
                      value={historyAcademicYearFilter}
                      onChange={(e) => setHistoryAcademicYearFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-indigo-500"
                    >
                      <option value="All">All Academic Years</option>
                      {academicYears.map(year => (
                        <option key={year.id} value={year.name}>{year.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="p-4">
                    {studentCases.length === 0 ? (
                      <p className="text-center text-slate-500 text-xs py-8 font-medium">
                        No cases logged for this student under selection year.
                      </p>
                    ) : (
                      <div className="divide-y divide-slate-800">
                        {studentCases.map(c => {
                          const isComplaint = c.behaviorType === 'Complaint';
                          return (
                            <div key={c.id} className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row justify-between gap-3 text-xs">
                              <div className="space-y-1.5 flex-1">
                                <div className="flex flex-wrap gap-2 items-center">
                                  <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                    isComplaint ? 'bg-rose-950/80 border border-rose-900 text-rose-400' : 'bg-emerald-950/80 border border-emerald-900 text-emerald-400'
                                  }`}>
                                    {c.behaviorType}
                                  </span>

                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase border ${
                                    c.status === 'Closed' 
                                      ? 'bg-slate-900 border-slate-800 text-slate-505' 
                                      : 'bg-indigo-950 border-indigo-900 text-indigo-300'
                                  }`}>
                                    Status: {c.status}
                                  </span>

                                  <span className="text-[10px] text-slate-505 font-medium font-mono">
                                    Logged on {new Date(c.createdAt).toLocaleDateString()}
                                  </span>
                                </div>

                                <div className="text-[11px] font-semibold text-indigo-400">
                                  Category: {c.category} • Academic Year: {c.academicYear}
                                </div>

                                <p className="text-slate-300 leading-relaxed text-xs">
                                  {c.description}
                                </p>
                              </div>

                              <div className="flex flex-col sm:items-end justify-between self-end sm:self-auto gap-2">
                                <button
                                  onClick={() => setSelectedCase(c)}
                                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 self-start"
                                >
                                  View Details <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                                
                                {c.status !== 'Closed' && (
                                  <button
                                    onClick={() => handleUpdateStatus(c.id, 'Closed')}
                                    className="px-2 py-1 rounded border border-emerald-900 bg-emerald-950/40 text-emerald-400 font-bold text-[10px] hover:bg-emerald-900 hover:text-emerald-200 transition-colors"
                                  >
                                    Resolve Case
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-850 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500 shadow-inner max-w-xl mx-auto">
                <User className="w-10 h-10 mx-auto mb-3 opacity-30 animate-pulse" />
                <p className="font-bold text-sm">Please search and select a student above.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CASE DETAILS MODAL / DRAWER */}
      {selectedCase && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in-95">
          <div className="bg-slate-905 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
            {/* Modal Header banner */}
            <div className={`p-6 text-white flex justify-between items-start ${
              selectedCase.behaviorType === 'Complaint' 
                ? 'bg-rose-950 border-b border-rose-900/60' 
                : 'bg-emerald-950 border-b border-emerald-900/60'
            }`}>
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-widest bg-white/10 px-2.5 py-0.5 rounded-full">
                  {selectedCase.behaviorType} Incident Record
                </span>
                <h3 className="text-lg font-black">{selectedCase.student?.user.name || 'Unknown Student'}</h3>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="text-slate-400 hover:text-white font-semibold text-sm bg-slate-900/60 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border border-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Properties Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-505 font-semibold block text-[10px] uppercase tracking-wider">Student Name</span>
                  <span className="text-slate-200 font-bold block mt-0.5">{selectedCase.student?.user.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-505 font-semibold block text-[10px] uppercase tracking-wider">Class & Section</span>
                  <span className="text-slate-200 font-semibold block mt-0.5">
                    {selectedCase.student?.classSection?.class.name} {selectedCase.student?.classSection?.section.name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-550 font-semibold block text-[10px] uppercase tracking-wider">Logged By Teacher</span>
                  <span className="text-slate-200 font-medium block mt-0.5">{selectedCase.teacher?.user.name || 'Admin'}</span>
                </div>
                <div>
                  <span className="text-slate-505 font-semibold block text-[10px] uppercase tracking-wider">Category</span>
                  <span className="text-slate-200 font-semibold block mt-0.5">{selectedCase.category}</span>
                </div>
                <div>
                  <span className="text-slate-505 font-semibold block text-[10px] uppercase tracking-wider">Academic Year</span>
                  <span className="text-slate-305 font-mono block mt-0.5">{selectedCase.academicYear}</span>
                </div>
                <div>
                  <span className="text-slate-505 font-semibold block text-[10px] uppercase tracking-wider">Date Created</span>
                  <span className="text-slate-300 font-mono block mt-0.5">
                    {new Date(selectedCase.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Description Details box */}
              <div className="border-t border-slate-800 pt-4">
                <span className="text-slate-505 font-semibold block text-[10px] uppercase tracking-wider mb-2">Description details</span>
                <div className="p-4 bg-slate-850 rounded-2xl border border-slate-800 text-slate-300 text-xs leading-relaxed max-h-48 overflow-y-auto">
                  {selectedCase.description}
                </div>
              </div>

              {/* Current Status Update controls */}
              <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-slate-505 font-semibold block text-[10px] uppercase tracking-wider">Current Status</span>
                  <span className={`inline-block mt-1 px-3 py-0.5 border text-[10px] font-bold rounded-full ${
                    selectedCase.status === 'New' ? 'bg-blue-950 text-blue-300 border-blue-900' :
                    selectedCase.status === 'In Progress' ? 'bg-amber-950 text-amber-300 border-amber-900' :
                    'bg-emerald-950 text-emerald-300 border-emerald-900'
                  }`}>
                    {selectedCase.status}
                  </span>
                </div>

                <div className="flex gap-2">
                  {selectedCase.status !== 'New' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedCase.id, 'New')}
                      className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      Set New
                    </button>
                  )}
                  {selectedCase.status !== 'In Progress' && selectedCase.status !== 'Closed' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedCase.id, 'In Progress')}
                      className="px-3 py-1.5 rounded-lg border border-amber-900 bg-amber-950/40 text-amber-400 hover:bg-amber-900/60 text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      Investigate
                    </button>
                  )}
                  {selectedCase.status !== 'Closed' && (
                    <button
                      onClick={() => handleUpdateStatus(selectedCase.id, 'Closed')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      Resolve Case
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer block */}
            <div className="bg-slate-850 px-6 py-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
