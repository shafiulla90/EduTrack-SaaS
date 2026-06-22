'use client';

import React, { useState, useMemo } from 'react';
import { 
  Save, CheckCircle, Clock, X, UserX, UserCheck, Search,
  Calendar, ChevronDown, RotateCcw, BarChart3, Eye
} from 'lucide-react';
import { mockStudents } from '@/lib/mockData';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#26c6da,#00acc1)',
  'linear-gradient(135deg,#fd7043,#ff8a65)',
  'linear-gradient(135deg,#2E5BFF,#1E3FCC)',
  'linear-gradient(135deg,#00c48c,#00a070)',
];

interface TeacherOption {
  id: string;
  name: string;
  subject: string;
  initials: string;
  gradient: string;
}

const teachersList: TeacherOption[] = [
  { id: 't1', name: 'SAKIBANDA SUNIL BABU', subject: 'General Knowledge', initials: 'SS', gradient: AVATAR_GRADIENTS[0] },
  { id: 't2', name: 'Lalsagari Shaik Shafiulla', subject: 'General Knowledge', initials: 'LS', gradient: AVATAR_GRADIENTS[1] },
  { id: 't3', name: 'Sohal Shaik', subject: 'AMLOG', initials: 'SS', gradient: AVATAR_GRADIENTS[2] },
  { id: 't4', name: 'LD Teacher', subject: 'Mathematics', initials: 'LD', gradient: AVATAR_GRADIENTS[3] },
  { id: 't5', name: 'MH Teacher', subject: 'Science', initials: 'MH', gradient: AVATAR_GRADIENTS[4] },
];

const recentSubmissions = [
  { id: 'rs1', teacherName: 'SAKIBANDA SUNIL BABU', className: 'Grade 10 - A', date: '2026-06-17', status: 'Submitted' },
  { id: 'rs2', teacherName: 'Lalsagari Shaik Shafiulla', className: 'Grade 9 - B', date: '2026-06-17', status: 'Submitted' },
];

export default function AttendancePage() {
  // Phase 1: Teacher selection
  const [showTeacherSelection, setShowTeacherSelection] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherOption | null>(null);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Phase 2: Attendance tracker
  const [selectedClass, setSelectedClass] = useState('Grade 10');
  const [selectedSection, setSelectedSection] = useState('Section A');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = useState<'All' | 'Present' | 'Absent'>('All');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // Students list with attendance status
  const classStudents = mockStudents.filter(
    (s) => s.class === selectedClass && s.section === selectedSection
  );

  const [records, setRecords] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    mockStudents.forEach((s) => {
      initial[s.id] = false; // false = present, true = absent
    });
    return initial;
  });

  const filteredTeachers = teacherSearch
    ? teachersList.filter(t =>
        t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
        t.subject.toLowerCase().includes(teacherSearch.toLowerCase())
      )
    : teachersList;

  const handleTeacherSelect = (teacher: TeacherOption) => {
    setSelectedTeacher(teacher);
    setTeacherSearch(teacher.name);
    setIsDropdownOpen(false);
  };

  const handleClearTeacher = () => {
    setSelectedTeacher(null);
    setTeacherSearch('');
  };

  const handleProceed = () => {
    if (selectedTeacher) {
      setShowTeacherSelection(false);
    }
  };

  const handleStudentClick = (studentId: string) => {
    if (isReadOnly) return;
    setRecords(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const stats = useMemo(() => {
    const total = classStudents.length;
    const absent = classStudents.filter(s => records[s.id]).length;
    return { total, present: total - absent, absent };
  }, [classStudents, records]);

  const displayedStudents = useMemo(() => {
    if (filter === 'Present') return classStudents.filter(s => !records[s.id]);
    if (filter === 'Absent') return classStudents.filter(s => records[s.id]);
    return classStudents;
  }, [classStudents, records, filter]);

  const handleSubmit = () => {
    setIsSuccess(true);
  };

  const handleUpdateAttendance = () => {
    setIsSuccess(false);
    setFilter('All');
  };

  const handleChangeTeacher = () => {
    setShowTeacherSelection(true);
    handleClearTeacher();
  };

  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  // ─── TEACHER SELECTION SCREEN ────────────────────────────────
  if (showTeacherSelection) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <h2 className="text-xl font-extrabold">Attendance Tracker</h2>
              <p className="text-blue-100 text-xs mt-1">Select teacher to begin marking attendance</p>
              <p className="text-blue-200 text-[10px] mt-2 font-mono">{todayStr}</p>
            </div>

            <div className="p-6 space-y-5">
              {/* Teacher Search */}
              <div>
                <label className="block text-xs text-slate-500 font-bold mb-2">Select Teacher *</label>
                <div className="relative">
                  <div className="flex items-center border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus-within:border-blue-500 focus-within:bg-white transition-all">
                    <Search className="w-4 h-4 text-slate-400 mr-2" />
                    <input
                      type="text"
                      placeholder="Search teacher by name or subject..."
                      value={teacherSearch}
                      onChange={(e) => {
                        setTeacherSearch(e.target.value);
                        setIsDropdownOpen(true);
                        if (selectedTeacher) setSelectedTeacher(null);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      className="bg-transparent text-sm text-slate-800 outline-none flex-1 placeholder-slate-400"
                    />
                    {selectedTeacher && (
                      <button onClick={handleClearTeacher} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown */}
                  {isDropdownOpen && !selectedTeacher && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-52 overflow-y-auto">
                      {filteredTeachers.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-slate-400 text-center">No teachers found</div>
                      ) : (
                        filteredTeachers.map(teacher => (
                          <div
                            key={teacher.id}
                            onClick={() => handleTeacherSelect(teacher)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0"
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                              style={{ background: teacher.gradient }}
                            >
                              {teacher.initials}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-800">{teacher.name}</div>
                              <div className="text-[10px] text-slate-400">{teacher.subject}</div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {selectedTeacher && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: selectedTeacher.gradient }}
                    >
                      {selectedTeacher.initials}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{selectedTeacher.name}</div>
                      <div className="text-xs text-slate-500">{selectedTeacher.subject}</div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-blue-500 ml-auto" />
                  </div>
                )}
              </div>

              {/* Proceed Button */}
              <button
                onClick={handleProceed}
                disabled={!selectedTeacher}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  selectedTeacher
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Proceed to Attendance →
              </button>

              {/* Recent Submissions */}
              {recentSubmissions.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Recent Submissions</h4>
                  <div className="overflow-hidden">
                    <div className="flex gap-3 animate-marquee">
                      {recentSubmissions.map(sub => (
                        <div key={sub.id} className="flex-shrink-0 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-[10px] text-slate-500">
                          <span className="font-bold text-slate-700">{sub.teacherName}</span> submitted {sub.className} · {sub.date}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── ATTENDANCE TRACKER SCREEN ───────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-[24px] font-bold text-slate-900 leading-none flex items-center gap-2">
            {showReport ? 'Attendance Report' : 'Attendance Tracker'}
          </h2>
          <p className="text-slate-500 text-xs font-medium mt-1">
            {showReport ? 'View detailed attendance analytics' : 'Manage student attendance efficiently'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowReport(!showReport)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5"
          >
            {showReport ? <RotateCcw className="w-3.5 h-3.5" /> : <BarChart3 className="w-3.5 h-3.5" />}
            {showReport ? 'Back to Attendance' : 'Attendance Report'}
          </button>
          <button
            onClick={handleChangeTeacher}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs"
          >
            Change Teacher
          </button>
        </div>
      </div>

      {/* Teacher Info Banner */}
      {selectedTeacher && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: selectedTeacher.gradient }}>
            {selectedTeacher.initials}
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800">{selectedTeacher.name}</span>
            <span className="text-[10px] text-slate-500 ml-2">{selectedTeacher.subject}</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Date</label>
          <input
            type="date"
            value={attendanceDate}
            onChange={e => {
              setAttendanceDate(e.target.value);
              setIsSuccess(false);
              const sel = new Date(e.target.value);
              const today = new Date(); today.setHours(0,0,0,0);
              setIsReadOnly(sel < today);
            }}
            className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Class</label>
          <select
            value={selectedClass}
            onChange={e => { setSelectedClass(e.target.value); setIsSuccess(false); }}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none"
          >
            <option>Grade 8</option><option>Grade 9</option><option>Grade 10</option>
            <option>Grade 11</option><option>Grade 12</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Section</label>
          <select
            value={selectedSection}
            onChange={e => { setSelectedSection(e.target.value); setIsSuccess(false); }}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white outline-none"
          >
            <option>Section A</option><option>Section B</option><option>Section C</option>
          </select>
        </div>
        <div className="flex items-end">
          {isReadOnly && (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1.5 rounded-lg">
              ⚠ Read-Only (Past Date)
            </span>
          )}
        </div>
      </div>

      {/* Stats Filter Cards */}
      <div className="grid grid-cols-3 gap-4">
        {([
          { key: 'All' as const, label: 'Total', value: stats.total, color: 'blue' },
          { key: 'Present' as const, label: 'Present', value: stats.present, color: 'emerald' },
          { key: 'Absent' as const, label: 'Absent', value: stats.absent, color: 'rose' },
        ]).map(stat => (
          <button
            key={stat.key}
            onClick={() => setFilter(stat.key)}
            className={`bg-white border rounded-xl p-4 text-left transition-all cursor-pointer ${
              filter === stat.key ? `border-${stat.color}-300 ring-2 ring-${stat.color}-100` : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className={`text-[10px] font-bold uppercase tracking-wider text-${stat.color}-500`}>{stat.label}</div>
            <div className="text-2xl font-extrabold text-slate-800 mt-1">{stat.value}</div>
          </button>
        ))}
      </div>

      {/* Success Card or Student List */}
      {isSuccess ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center text-3xl mx-auto">
            ✅
          </div>
          <h3 className="text-xl font-extrabold text-slate-800">Attendance Saved!</h3>
          <p className="text-sm text-slate-500">
            {selectedClass} · {selectedSection} · {attendanceDate}
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="text-[10px] text-slate-400 font-bold">Total</div>
              <div className="text-lg font-extrabold text-slate-800">{stats.total}</div>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3">
              <div className="text-[10px] text-emerald-500 font-bold">Present</div>
              <div className="text-lg font-extrabold text-emerald-600">{stats.present}</div>
            </div>
            <div className="bg-rose-50 rounded-xl p-3">
              <div className="text-[10px] text-rose-500 font-bold">Absent</div>
              <div className="text-lg font-extrabold text-rose-600">{stats.absent}</div>
            </div>
          </div>
          {selectedTeacher && (
            <p className="text-xs text-slate-400">
              Submitted by: <strong className="text-slate-600">{selectedTeacher.name}</strong> · {new Date().toLocaleTimeString()}
            </p>
          )}
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={handleUpdateAttendance}
              className="px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-100"
            >
              <Eye className="w-3.5 h-3.5 inline mr-1" /> View / Update
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Student Cards Grid */}
          {displayedStudents.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400">
              <UserX className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No students found for this class and section</p>
            </div>
          ) : (
            <>
              <div className="text-xs text-slate-500 font-semibold">
                {isReadOnly ? 'Read-Only View' :
                  filter === 'Present' ? `Showing Present Students (${stats.present})` :
                  filter === 'Absent' ? `Showing Absent Students (${stats.absent})` :
                  'Tap a student card to mark absent'
                }
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {displayedStudents.map((student, idx) => {
                  const isAbsent = records[student.id];
                  const initials = student.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <div
                      key={student.id}
                      onClick={() => handleStudentClick(student.id)}
                      className={`rounded-xl p-4 text-center cursor-pointer transition-all border-2 ${
                        isAbsent
                          ? 'bg-rose-50 border-rose-200 hover:border-rose-300'
                          : 'bg-emerald-50 border-emerald-200 hover:border-emerald-300'
                      } ${isReadOnly ? 'opacity-70 cursor-default' : ''}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center text-white text-sm font-bold mb-2 ${
                          isAbsent ? 'bg-rose-400' : 'bg-emerald-400'
                        }`}
                      >
                        {initials}
                      </div>
                      <div className="text-xs font-bold text-slate-800 truncate">{student.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{student.rollNo}</div>
                      <div className={`text-[9px] font-bold mt-1.5 px-2 py-0.5 rounded-full inline-block ${
                        isAbsent
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {isAbsent ? 'Absent' : 'Present'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submit / Update Button */}
              {!isReadOnly && (
                <button
                  onClick={handleSubmit}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Submit Attendance
                </button>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
