'use client';

import React, { useState, useEffect } from 'react';
import { 
  Award, Search, Calendar, RefreshCw, X, ChevronRight,
  TrendingUp, CheckCircle, AlertTriangle, Trophy, BookOpen,
  Download, Printer
} from 'lucide-react';
import { api } from '@/lib/api';
import { useTenant } from '../../providers/TenantContext';

interface GradeRecord {
  studentId: string;
  name: string;
  rollNo: string;
  classSectionId: string;
  score: number;
  average: number;
  grade: string;
  gpa: number;
  rank: number;
  subjectsList: { name: string; score: number; max: number }[];
}

type ClassSectionOption = {
  value: string;
  label: string;
  classId: string;
  sectionId: string;
};

export default function GradesMarksPage() {
  const [search, setSearch] = useState('');
  const { schoolName } = useTenant();
  
  // Metadata options
  const [classes, setClasses] = useState<ClassSectionOption[]>([]);
  const [examTypes, setExamTypes] = useState<string[]>([]);

  // Selection filters
  const [selectedClassSectionId, setSelectedClassSectionId] = useState('');
  const [selectedExamName, setSelectedExamName] = useState('');

  // Results list
  const [records, setRecords] = useState<GradeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Modal Student Details
  const [activeReportStudent, setActiveReportStudent] = useState<GradeRecord | null>(null);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const fetchMetadata = async () => {
    try {
      const classRes = await api.get('/exams/classes');
      setClasses(classRes.data);
      if (classRes.data.length > 0) {
        setSelectedClassSectionId(classRes.data[0].value);
      }

      const typeRes = await api.get('/exams/exam-types');
      setExamTypes(typeRes.data);
      if (typeRes.data.length > 0) {
        setSelectedExamName(typeRes.data[0]);
      }
    } catch (err: any) {
      console.error('Error fetching grades metadata:', err);
      setErrorMsg('Failed to load class or exam type filters.');
    }
  };

  useEffect(() => {
    if (selectedClassSectionId && selectedExamName) {
      fetchGrades();
    }
  }, [selectedClassSectionId, selectedExamName]);

  const fetchGrades = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get(
        `/exams/grades-report?classSectionId=${selectedClassSectionId}&examName=${encodeURIComponent(
          selectedExamName
        )}`
      );
      setRecords(res.data);
    } catch (err: any) {
      console.error('Error loading grades report:', err);
      setErrorMsg('Failed to load marks roster report.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    if (classes.length > 0) setSelectedClassSectionId(classes[0].value);
    if (examTypes.length > 0) setSelectedExamName(examTypes[0]);
  };

  // Filter computation by search query
  const filteredRecords = records.filter(r => {
    return (
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.rollNo.toLowerCase().includes(search.toLowerCase())
    );
  });

  // KPI Calculations
  const totalStudents = filteredRecords.length;
  const averageScore = totalStudents > 0
    ? Math.round(filteredRecords.reduce((sum, r) => sum + r.score, 0) / totalStudents)
    : 0;
  const passedCount = filteredRecords.filter(r => r.score >= 45).length;
  const failedCount = filteredRecords.filter(r => r.score < 45).length;
  const passRate = totalStudents > 0 ? Math.round((passedCount / totalStudents) * 100) : 0;

  // Top Scorer
  const topScorer = filteredRecords.length > 0
    ? [...filteredRecords].sort((a, b) => b.score - a.score)[0]
    : null;

  const getGradeBadge = (letter: string) => {
    if (letter === 'A+' || letter === 'A') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (letter === 'B') return 'bg-blue-50 text-blue-600 border-blue-100';
    if (letter === 'C') return 'bg-slate-50 text-slate-650 border-slate-200';
    if (letter === 'D') return 'bg-amber-50 text-amber-600 border-amber-100';
    return 'bg-rose-50 text-rose-600 border-rose-100';
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5 print:hidden">
        <div>
          <h2 className="text-[28px] font-bold text-slate-900 leading-none">
            Grades & Marks Roster
          </h2>
          <p className="text-slate-500 text-[13px] font-medium mt-2">
            View student term score analysis, ranks classifications, and generate report cards.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchGrades}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[13px] flex items-center gap-2 shadow-xs transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            Refresh
          </button>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-[13px] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 text-sm print:hidden">
          <X className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Filters config bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 print:hidden">
        {/* Search */}
        <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 sm:col-span-2 shadow-xs focus-within:border-[#2E5BFF]">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Search student, roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-[13px] font-semibold text-slate-800 outline-none w-full placeholder-slate-400"
          />
        </div>

        {/* Class select */}
        <select
          value={selectedClassSectionId}
          onChange={(e) => setSelectedClassSectionId(e.target.value)}
          className="border border-slate-200 rounded-xl p-2.5 text-[13px] text-slate-755 font-bold bg-white shadow-xs outline-none"
        >
          {classes.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        {/* Test select */}
        <select
          value={selectedExamName}
          onChange={(e) => setSelectedExamName(e.target.value)}
          className="border border-slate-200 rounded-xl p-2.5 text-[13px] text-slate-755 font-bold bg-white shadow-xs outline-none"
        >
          {examTypes.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 print:hidden">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Total Students</span>
          <span className="text-2xl font-extrabold text-slate-800 block mt-2">{totalStudents}</span>
          <span className="text-[10px] text-slate-400 font-semibold block mt-1">Staged in current filters</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Class Average</span>
          <span className="text-2xl font-extrabold text-slate-850 block mt-2">{averageScore}%</span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Recalculated from DB scores</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Passed Count</span>
          <span className="text-2xl font-extrabold text-emerald-600 block mt-2">{passedCount}</span>
          <span className="text-[10px] text-slate-450 font-semibold block mt-1">{passRate}% Pass Rate</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Failed Count</span>
          <span className="text-2xl font-extrabold text-rose-600 block mt-2">{failedCount}</span>
          <span className="text-[10px] text-slate-455 font-semibold block mt-1">Score below 45% threshold</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Top Scorer</span>
          <span className="text-sm font-black text-slate-800 block mt-2 truncate">
            {topScorer ? `${topScorer.name} (${topScorer.score}%)` : '—'}
          </span>
          <span className="text-[10px] text-purple-650 font-semibold block mt-1 truncate">
            Rank 1 in Class Section
          </span>
        </div>
      </div>

      {/* Student Performance Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm print:hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-700">Student Performance Marks Roster</h3>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">— Click a row to view detailed report card</span>
        </div>

        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <span className="text-xs font-semibold">Generating report roster...</span>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="py-16 text-center text-slate-450 text-xs font-semibold">
              No evaluation records found for this class and test term.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Roll Number</th>
                  <th className="px-6 py-4">Class Section</th>
                  <th className="px-6 py-4">Class Rank</th>
                  <th className="px-6 py-4" style={{ width: '200px' }}>Score</th>
                  <th className="px-6 py-4">Grade</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-650 font-semibold">
                {filteredRecords.map((r) => (
                  <tr
                    key={r.studentId}
                    onClick={() => setActiveReportStudent(r)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-855 text-sm leading-tight">{r.name}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-500">{r.rollNo}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 font-bold text-[10px] text-slate-650">
                        {classes.find(c => c.value === selectedClassSectionId)?.label || 'Class Section'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">Rank {r.rank}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-150 h-1.5 rounded-full overflow-hidden w-28">
                          <div className="bg-[#2E5BFF] h-full rounded-full" style={{ width: `${r.score}%` }} />
                        </div>
                        <span className="font-bold font-mono text-[11px] shrink-0">{r.score}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getGradeBadge(r.grade)}`}>
                        {r.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-blue-600 hover:text-blue-500 text-xs font-bold inline-flex items-center gap-0.5">
                        Report Card <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {activeReportStudent && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 transition-opacity print:hidden" onClick={() => setActiveReportStudent(null)} />
          <div className="fixed inset-x-3 top-4 bottom-4 sm:top-auto sm:bottom-auto sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-xl bg-white border border-slate-200 rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden print:relative print:top-0 print:left-0 print:translate-x-0 print:translate-y-0 print:w-full print:max-w-none print:shadow-none print:border-none print:p-0 print:m-0">
            {/* Sticky Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-3 p-6 shrink-0 print:hidden">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="font-extrabold text-slate-850 text-lg leading-tight">Terminal Report Card</h3>
                  <p className="text-slate-455 text-[11px] font-semibold">{selectedExamName}</p>
                </div>
              </div>
              <button onClick={() => setActiveReportStudent(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 print:hidden">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 print:p-0 print:overflow-visible">
              {/* School details banner */}
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2 text-xs">
                <div className="text-center font-bold text-slate-700 text-sm">{schoolName}</div>
                <div className="grid grid-cols-2 gap-2 text-slate-600 font-semibold pt-2 border-t border-slate-200/50">
                  <div>Student Name: <strong className="text-slate-800 font-extrabold block">{activeReportStudent.name}</strong></div>
                  <div>Roll Number: <strong className="text-slate-800 font-mono font-extrabold block">{activeReportStudent.rollNo}</strong></div>
                  <div>Class Section: <strong className="text-slate-800 font-extrabold block">
                    {classes.find(c => c.value === selectedClassSectionId)?.label || 'Class Section'}
                  </strong></div>
                  <div>Class Section Rank: <strong className="text-purple-600 font-extrabold block">Rank {activeReportStudent.rank}</strong></div>
                </div>
              </div>

              {/* Marks breakdown Table */}
              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-4 py-2">Subject Course</th>
                      <th className="px-4 py-2 text-right">Max Marks</th>
                      <th className="px-4 py-2 text-right">Secured Score</th>
                      <th className="px-4 py-2 text-right">Grade Letter</th>
                      <th className="px-4 py-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-650 font-semibold">
                    {activeReportStudent.subjectsList.map((subj, idx) => {
                      const isPass = subj.score >= 45;
                      let letter = 'F';
                      if (subj.score >= 90) letter = 'A+';
                      else if (subj.score >= 80) letter = 'A';
                      else if (subj.score >= 70) letter = 'B';
                      else if (subj.score >= 60) letter = 'C';
                      else if (subj.score >= 50) letter = 'D';

                      return (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-4 py-2 font-bold text-slate-750">{subj.name}</td>
                          <td className="px-4 py-2 text-right font-mono text-slate-400">{subj.max}</td>
                          <td className="px-4 py-2 text-right font-mono font-extrabold text-slate-800">{subj.score}</td>
                          <td className="px-4 py-2 text-right font-bold text-blue-600">{letter}</td>
                          <td className="px-4 py-2 text-right">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              isPass ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                              {isPass ? 'PASSED' : 'FAILED'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* GPA Summary footer */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 border border-slate-150 p-4 rounded-xl text-center">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Total Marks</span>
                  <span className="text-sm font-extrabold text-slate-800 block mt-1">
                    {activeReportStudent.subjectsList.reduce((sum, s) => sum + s.score, 0)} / {activeReportStudent.subjectsList.length * 100}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Overall Average</span>
                  <span className="text-sm font-extrabold text-slate-800 block mt-1">{activeReportStudent.score}%</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">GPA Grade</span>
                  <span className="text-sm font-extrabold text-purple-650 block mt-1">{activeReportStudent.grade}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Final Result</span>
                  <span className="text-sm font-extrabold text-emerald-650 block mt-1">
                    {activeReportStudent.score >= 45 ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sticky Footer – Print button always visible */}
            <div className="flex justify-end p-4 gap-2 border-t border-slate-100 shrink-0 bg-white print:hidden">
              <button
                onClick={() => setActiveReportStudent(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-500/10 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print Report Card
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
