'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParent } from '../ParentContext';
import { useTenant } from '../../providers/TenantContext';
import { api } from '@/lib/api';
import {
  GraduationCap,
  Calendar,
  Download,
  Printer,
  ChevronRight,
  Award,
  BookOpen,
  BarChart3,
  Star,
  CheckCircle,
  Clock,
  Info,
} from 'lucide-react';

// ─── Grade helpers ────────────────────────────────────────────────────────────
function gradeColor(grade: string) {
  switch (grade) {
    case 'A+': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'A':  return 'text-blue-700 bg-blue-50 border-blue-200';
    case 'B':  return 'text-indigo-700 bg-indigo-50 border-indigo-200';
    case 'C':  return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'D':  return 'text-orange-700 bg-orange-50 border-orange-200';
    default:   return 'text-rose-700 bg-rose-50 border-rose-200';
  }
}

function overallGrade(pct: number) {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B';
  if (pct >= 60) return 'C';
  if (pct >= 50) return 'D';
  return 'F';
}

function overallResult(pct: number) {
  return pct >= 33 ? 'PASS' : 'FAIL';
}

function gradePoint(grade: string) {
  switch (grade) {
    case 'A+': return 10;
    case 'A':  return 9;
    case 'B':  return 8;
    case 'C':  return 7;
    case 'D':  return 6;
    default:   return 0;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Mark {
  id: string;
  examName: string;
  subject: string;
  marksObtained: number;
  grade: string;
  remarks: string;
}

interface Schedule {
  id: string;
  examName: string;
  subject: string;
  examDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  examHall: string;
  instructions: string;
}

// Group marks by exam name
function groupByExam(marks: Mark[]): Record<string, Mark[]> {
  return marks.reduce((acc, m) => {
    if (!acc[m.examName]) acc[m.examName] = [];
    acc[m.examName].push(m);
    return acc;
  }, {} as Record<string, Mark[]>);
}

// ─── Report Card Component (printable) ───────────────────────────────────────
function ReportCard({
  examName,
  subjects,
  child,
  schoolName,
  logoUrl,
  printRef,
}: {
  examName: string;
  subjects: Mark[];
  child: any;
  schoolName: string;
  logoUrl: string | null;
  printRef: React.RefObject<HTMLDivElement>;
}) {
  const MAX_PER_SUBJECT = 100;
  const totalMax = subjects.length * MAX_PER_SUBJECT;
  const totalObtained = subjects.reduce((s, m) => s + m.marksObtained, 0);
  const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
  const grade = overallGrade(percentage);
  const result = overallResult(percentage);
  const gpa = subjects.length > 0
    ? (subjects.reduce((s, m) => s + gradePoint(m.grade), 0) / subjects.length).toFixed(1)
    : '0.0';

  return (
    <div
      ref={printRef}
      id="report-card-print"
      className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
    >
      {/* ── Header band ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#1a2a6c] via-[#2E5BFF] to-[#1a2a6c] px-6 py-5 flex items-center gap-4 print:bg-[#1a2a6c]">
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt={schoolName} className="w-full h-full object-cover" />
          ) : (
            <GraduationCap className="w-7 h-7 text-white" />
          )}
        </div>

        {/* School info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-white font-extrabold text-base sm:text-lg uppercase tracking-wide leading-tight truncate">
            {schoolName || 'Cambridge International School'}
          </h1>
          <p className="text-blue-200 text-[10px] font-semibold tracking-widest uppercase mt-0.5">
            Student Progress Report Card
          </p>
        </div>

        {/* Exam name badge */}
        <div className="shrink-0 text-right hidden sm:block">
          <span className="inline-block px-3 py-1 bg-white/15 border border-white/25 rounded-xl text-white text-[10px] font-bold uppercase tracking-wider">
            {examName}
          </span>
          <p className="text-blue-200 text-[9px] mt-1 font-medium">Academic Year 2026–2027</p>
        </div>
      </div>

      {/* ── Student info strip ──────────────────────────────────────────── */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Student Name', value: child.name },
          { label: 'Roll Number', value: child.rollNo },
          { label: 'Class', value: `${child.class} – ${child.section}` },
          { label: 'Examination', value: examName },
        ].map(({ label, value }) => (
          <div key={label}>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">{label}</span>
            <strong className="text-xs text-slate-800 font-bold block mt-0.5 truncate">{value}</strong>
          </div>
        ))}
      </div>

      {/* ── Marks table ─────────────────────────────────────────────────── */}
      <div className="px-6 py-5">
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#1a2a6c] text-white">
                <th className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider rounded-tl-2xl">
                  Subject
                </th>
                <th className="text-center px-3 py-3 font-bold text-[10px] uppercase tracking-wider">
                  Max Marks
                </th>
                <th className="text-center px-3 py-3 font-bold text-[10px] uppercase tracking-wider">
                  Marks Obtained
                </th>
                <th className="text-center px-3 py-3 font-bold text-[10px] uppercase tracking-wider">
                  Grade
                </th>
                <th className="text-center px-3 py-3 font-bold text-[10px] uppercase tracking-wider">
                  %
                </th>
                <th className="text-center px-3 py-3 font-bold text-[10px] uppercase tracking-wider rounded-tr-2xl">
                  Result
                </th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((m, idx) => {
                const pct = m.marksObtained;
                const pass = pct >= 33;
                return (
                  <tr
                    key={m.id}
                    className={`border-t border-slate-100 transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                    } hover:bg-blue-50/30`}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-700">{m.subject}</td>
                    <td className="px-3 py-3 text-center text-slate-500 font-medium">100</td>
                    <td className="px-3 py-3 text-center font-black text-slate-800">{m.marksObtained}</td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-lg border text-[10px] font-bold ${gradeColor(m.grade)}`}>
                        {m.grade}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center text-slate-600 font-semibold">
                      {m.marksObtained}%
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${
                        pass
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {pass ? 'Pass' : 'Fail'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-[#f0f4ff]">
                <td className="px-4 py-3 font-black text-slate-800 text-[11px]">TOTAL</td>
                <td className="px-3 py-3 text-center font-black text-slate-700">{totalMax}</td>
                <td className="px-3 py-3 text-center font-black text-[#2E5BFF] text-base">{totalObtained}</td>
                <td className="px-3 py-3 text-center">
                  <span className={`inline-block px-2.5 py-0.5 rounded-lg border text-[10px] font-bold ${gradeColor(grade)}`}>
                    {grade}
                  </span>
                </td>
                <td className="px-3 py-3 text-center font-black text-slate-800">{percentage.toFixed(1)}%</td>
                <td className="px-3 py-3 text-center">
                  <span className={`inline-block px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${
                    result === 'PASS'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {result}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Summary cards ───────────────────────────────────────────────── */}
      <div className="px-6 pb-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: BarChart3, label: 'Total Marks', value: `${totalObtained} / ${totalMax}`, color: 'blue' },
            { icon: Star, label: 'Percentage', value: `${percentage.toFixed(1)}%`, color: 'indigo' },
            { icon: Award, label: 'Overall Grade', value: grade, color: 'emerald' },
            { icon: CheckCircle, label: 'Result', value: result, color: result === 'PASS' ? 'emerald' : 'rose' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className={`bg-${color}-50 border border-${color}-200 rounded-2xl p-3.5 text-center`}
            >
              <Icon className={`w-5 h-5 text-${color}-600 mx-auto mb-1`} />
              <p className={`text-[9px] text-${color}-500 font-bold uppercase tracking-wider`}>{label}</p>
              <p className={`text-sm font-black text-${color}-800 mt-0.5`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── GPA + Remarks ───────────────────────────────────────────────── */}
      <div className="px-6 pb-5 grid sm:grid-cols-2 gap-4">
        {/* GPA Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-4 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 block">
            Academic GPA
          </span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-indigo-700">{gpa}</span>
            <span className="text-[11px] text-indigo-400 font-semibold pb-1">/ 10.0</span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all"
              style={{ width: `${(parseFloat(gpa) / 10) * 100}%` }}
            />
          </div>
        </div>

        {/* Teacher remarks */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 block">
            Class Teacher Remarks
          </span>
          {Array.from(new Set(subjects.map(s => s.remarks))).slice(0, 3).map((r, i) => (
            <p key={i} className="text-xs text-amber-800 font-medium italic leading-relaxed">
              "{r}"
            </p>
          ))}
        </div>
      </div>

      {/* ── Signatures ──────────────────────────────────────────────────── */}
      <div className="px-6 pb-6">
        <div className="border border-dashed border-slate-300 rounded-2xl p-4 grid grid-cols-3 gap-4 text-center">
          {['Class Teacher Signature', 'Principal Signature', 'Parent Signature'].map(sig => (
            <div key={sig} className="space-y-2">
              <div className="h-10 border-b border-slate-300" />
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{sig}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
        <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest">
          Generated by EduTrack • Academic Year 2026–2027
        </span>
        <span className="text-[9px] text-slate-400 font-semibold">
          {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ExamsPage() {
  const { selectedChild } = useParent();
  const { schoolName, logoUrl } = useTenant() as any;
  const [examData, setExamData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'REPORT' | 'SCHEDULE'>('REPORT');
  const [selectedExam, setSelectedExam] = useState<string>('');
  const printRef = useRef<HTMLDivElement>(null!);

  const fetchExams = useCallback(async (childId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/parent-portal/children/${childId}/exams`);
      setExamData(res.data);

      // Auto-select first exam
      const marks: Mark[] = res.data?.marks || [];
      const groups = groupByExam(marks);
      const firstExam = Object.keys(groups)[0];
      if (firstExam) setSelectedExam(firstExam);
    } catch (err) {
      console.error('Failed to fetch exams data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedChild) fetchExams(selectedChild.id);
  }, [selectedChild, fetchExams]);

  useEffect(() => {
    const handleChildChange = (e: any) => fetchExams(e.detail);
    window.addEventListener('parentChildChanged', handleChildChange);
    return () => window.removeEventListener('parentChildChanged', handleChildChange);
  }, [fetchExams]);

  // ── Print handler ─────────────────────────────────────────────────────────
  const handlePrint = () => {
    const content = document.getElementById('report-card-print');
    if (!content) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Report Card – ${selectedChild?.name || ''} – ${selectedExam}</title>
          <meta charset="UTF-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; background: white; color: #1e293b; }
            @page { size: A4; margin: 15mm; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
          <link rel="stylesheet" href="/globals.css" />
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
          ${content.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 800);
  };

  // ── Guards ────────────────────────────────────────────────────────────────
  if (!selectedChild) {
    return (
      <div className="text-slate-500 text-sm text-center py-12">
        Please select a child to view examinations.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-t-[#2E5BFF] border-r-[#2E5BFF] border-b-transparent border-l-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const schedules: Schedule[] = examData?.schedules || [];
  const marks: Mark[] = examData?.marks || [];
  const groupedMarks = groupByExam(marks);
  const examNames = Object.keys(groupedMarks);
  const currentSubjects = selectedExam ? (groupedMarks[selectedExam] || []) : [];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            Exams &amp; Marks:&nbsp;
            <span className="text-[#2E5BFF]">{selectedChild.name}</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-light">
            View exam-wise report cards, subject scores, and grade summaries.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-white border border-slate-200 p-1 rounded-2xl shrink-0 shadow-sm">
          <button
            onClick={() => setActiveTab('REPORT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'REPORT'
                ? 'bg-[#2E5BFF] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Report Card
          </button>
          <button
            onClick={() => setActiveTab('SCHEDULE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'SCHEDULE'
                ? 'bg-[#2E5BFF] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Exam Schedule
          </button>
        </div>
      </div>

      {/* ════════════════ REPORT CARD TAB ════════════════ */}
      {activeTab === 'REPORT' && (
        <div className="space-y-5">

          {marks.length === 0 ? (
            <div className="bg-white border border-slate-200 p-16 rounded-3xl shadow-sm text-center space-y-3">
              <GraduationCap className="w-14 h-14 text-slate-200 mx-auto" />
              <p className="text-sm font-semibold text-slate-500">No results published yet.</p>
              <p className="text-xs font-light text-slate-400">
                Grades will appear here after exams are evaluated by teachers.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

              {/* ── Exam selector sidebar ──────────────────────────── */}
              <div className="lg:col-span-1 space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">
                  Report Cards
                </h3>
                <div className="space-y-1.5">
                  {examNames.map(exam => {
                    const subs = groupedMarks[exam];
                    const total = subs.reduce((s, m) => s + m.marksObtained, 0);
                    const pct = total / subs.length;
                    const grade = overallGrade(pct);
                    const isActive = selectedExam === exam;

                    return (
                      <button
                        key={exam}
                        onClick={() => setSelectedExam(exam)}
                        className={`w-full text-left px-4 py-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isActive
                            ? 'bg-[#2E5BFF] border-blue-600 text-white shadow-md shadow-blue-500/20'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50/30'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <BookOpen className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#2E5BFF]'}`} />
                          <span className="text-xs font-bold truncate">{exam}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-lg border ${
                            isActive ? 'bg-white/20 border-white/30 text-white' : gradeColor(grade)
                          }`}>
                            {grade}
                          </span>
                          <ChevronRight className={`w-3 h-3 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Download / Print buttons */}
                {selectedExam && (
                  <div className="space-y-2 pt-3">
                    <button
                      onClick={handlePrint}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-2xl text-xs font-bold text-slate-700 transition-all cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      Print Report Card
                    </button>
                    <button
                      onClick={handlePrint}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1a2a6c] hover:bg-[#2E5BFF] text-white rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                    </button>
                  </div>
                )}
              </div>

              {/* ── Report Card display ────────────────────────────── */}
              <div className="lg:col-span-3">
                {selectedExam && currentSubjects.length > 0 ? (
                  <ReportCard
                    examName={selectedExam}
                    subjects={currentSubjects}
                    child={selectedChild}
                    schoolName={schoolName || 'Cambridge International School'}
                    logoUrl={logoUrl || null}
                    printRef={printRef}
                  />
                ) : (
                  <div className="bg-white border border-slate-200 p-16 rounded-3xl shadow-sm text-center space-y-3">
                    <Award className="w-14 h-14 text-slate-200 mx-auto" />
                    <p className="text-sm font-semibold text-slate-500">Select an examination from the left panel.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════ EXAM SCHEDULE TAB ════════════════ */}
      {activeTab === 'SCHEDULE' && (
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#2E5BFF]" />
            Upcoming Exam Schedule
          </h3>

          {schedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 text-center">
              <Calendar className="w-12 h-12 text-slate-200 mb-2" />
              <p className="text-sm font-semibold">No upcoming exam schedule.</p>
              <p className="text-xs font-light mt-1">The school has not published any timetables yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#1a2a6c] text-white">
                    {['Examination', 'Subject', 'Date', 'Time', 'Duration', 'Hall'].map(col => (
                      <th key={col} className="text-left px-4 py-3 font-bold text-[10px] uppercase tracking-wider first:rounded-tl-2xl last:rounded-tr-2xl">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((s, idx) => (
                    <tr
                      key={s.id}
                      className={`border-t border-slate-100 transition-colors hover:bg-blue-50/30 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                    >
                      <td className="px-4 py-3 font-bold text-slate-700">{s.examName}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold bg-blue-50 border border-blue-100 text-blue-700">
                          {s.subject}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-600">
                        {new Date(s.examDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-slate-600 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        {s.startTime} – {s.endTime}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{s.duration} min</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Info className="w-3 h-3 text-slate-400 shrink-0" />
                          {s.examHall}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
