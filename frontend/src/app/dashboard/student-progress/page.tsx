'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { AreaChart, TrendingUp, BookOpen, Clock, FileText, CheckCircle2, ChevronRight, User } from 'lucide-react';

export default function StudentProgressPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [loadingStudentData, setLoadingStudentData] = useState(false);
  const [progress, setProgress] = useState<any | null>(null);

  useEffect(() => {
    async function loadClasses() {
      try {
        const res = await api.get('/teacher-portal/classes');
        setClasses(res.data);
      } catch (err) {
        console.error('Failed to load classes:', err);
      } finally {
        setLoading(false);
      }
    }
    loadClasses();
  }, []);

  useEffect(() => {
    if (!selectedClass) {
      setStudents([]);
      setSelectedStudent('');
      setProgress(null);
      return;
    }
    async function loadStudents() {
      try {
        const res = await api.get(`/teacher-portal/classes/${selectedClass}/students`);
        setStudents(res.data);
        setSelectedStudent('');
        setProgress(null);
      } catch (err) {
        console.error('Failed to load students:', err);
      }
    }
    loadStudents();
  }, [selectedClass]);

  useEffect(() => {
    if (!selectedStudent) {
      setProgress(null);
      return;
    }
    async function loadProgressDetails() {
      setLoadingStudentData(true);
      try {
        const res = await api.get(`/teacher-portal/student-progress/${selectedStudent}`);
        setProgress(res.data);
      } catch (err) {
        console.error('Failed to load progress details:', err);
      } finally {
        setLoadingStudentData(false);
      }
    }
    loadProgressDetails();
  }, [selectedStudent]);

  if (loading) {
    return (
      <div className="space-y-4 max-w-md mx-auto sm:max-w-none">
        {/* Filter skeleton */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm animate-pulse">
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-slate-200 rounded-xl"></div>
            <div className="h-10 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm animate-pulse text-center">
              <div className="h-3 bg-slate-200 rounded w-16 mx-auto mb-2"></div>
              <div className="h-6 bg-slate-200 rounded w-12 mx-auto"></div>
            </div>
          ))}
        </div>
        {/* Chart skeleton */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-48 bg-slate-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Draw Raw SVG Line Chart of Marks Trend
  const renderSVGChart = (marksHistory: any[]) => {
    if (!marksHistory || marksHistory.length === 0) return null;
    
    const validMarks = marksHistory.filter(m => m.score !== null);
    if (validMarks.length === 0) return null;

    // SVG parameters
    const width = 500;
    const height = 200;
    const padding = 35;
    
    // Scale functions
    const xMin = padding;
    const xMax = width - padding;
    const yMin = height - padding;
    const yMax = padding;

    // Max score is 100
    const getX = (index: number) => {
      if (validMarks.length <= 1) return (xMin + xMax) / 2;
      return xMin + (index / (validMarks.length - 1)) * (xMax - xMin);
    };

    const getY = (score: number) => {
      return yMin - (score / 100) * (yMin - yMax);
    };

    // Construct path d attribute
    let pathD = '';
    validMarks.forEach((m, idx) => {
      const x = getX(idx);
      const y = getY(m.score);
      if (idx === 0) {
        pathD += `M ${x} ${y}`;
      } else {
        pathD += ` L ${x} ${y}`;
      }
    });

    // Construct area fill path
    let areaD = pathD;
    if (validMarks.length > 0) {
      areaD += ` L ${getX(validMarks.length - 1)} ${yMin} L ${getX(0)} ${yMin} Z`;
    }

    return (
      <div className="w-full overflow-x-auto bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[400px]">
          {/* Y Axis Gridlines */}
          {[0, 25, 50, 75, 100].map((val) => (
            <g key={val}>
              <line
                x1={xMin}
                y1={getY(val)}
                x2={xMax}
                y2={getY(val)}
                stroke="#E2E8F0"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <text
                x={xMin - 10}
                y={getY(val) + 4}
                className="text-[10px] font-bold fill-slate-400 text-right"
                textAnchor="end"
              >
                {val}%
              </text>
            </g>
          ))}

          {/* Area Fill */}
          {validMarks.length > 0 && (
            <path d={areaD} fill="url(#blueGradient)" opacity="0.15" />
          )}

          {/* Line Path */}
          <path d={pathD} fill="none" stroke="#2E5BFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points / Circles */}
          {validMarks.map((m, idx) => (
            <g key={idx}>
              <circle
                cx={getX(idx)}
                cy={getY(m.score)}
                r={5}
                fill="#2E5BFF"
                stroke="#FFFFFF"
                strokeWidth={2}
                className="cursor-pointer"
              />
              <text
                x={getX(idx)}
                y={getY(m.score) - 10}
                className="text-[10px] font-bold fill-slate-800 text-center"
                textAnchor="middle"
              >
                {m.score}
              </text>
              <text
                x={getX(idx)}
                y={yMin + 15}
                className="text-[9px] font-semibold fill-slate-400 text-center"
                textAnchor="middle"
              >
                {m.examName.slice(0, 8)}
              </text>
            </g>
          ))}

          {/* Definitions */}
          <defs>
            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2E5BFF" />
              <stop offset="100%" stopColor="#2E5BFF" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-md mx-auto sm:max-w-none pb-20">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-[#2E5BFF]" />
          Student Performance Analytics
        </h2>
      </div>

      {/* Select Filters Form */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Class Section</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2E5BFF] text-sm"
            >
              <option value="">Select...</option>
              {classes.map(c => <option key={c.classSectionId} value={c.classSectionId}>{c.className}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2E5BFF] text-sm"
              disabled={!selectedClass}
            >
              <option value="">Select student...</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.user.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loadingStudentData && (
        <div className="space-y-4">
          {/* Student profile skeleton */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3 animate-pulse">
            <div className="w-12 h-12 bg-slate-200 rounded-2xl shrink-0"></div>
            <div className="space-y-2 w-full">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-3 bg-slate-200 rounded w-1/4"></div>
            </div>
          </div>
          {/* Stats skeleton */}
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm animate-pulse text-center">
                <div className="h-3 bg-slate-200 rounded w-16 mx-auto mb-2"></div>
                <div className="h-6 bg-slate-200 rounded w-12 mx-auto"></div>
              </div>
            ))}
          </div>
          {/* Chart skeleton */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-48 bg-slate-100 rounded-2xl"></div>
          </div>
        </div>
      )}

      {/* Dashboard analytics */}
      {progress && (
        <div className="space-y-6">
          
          {/* Card Summary Profile */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 text-[#2E5BFF] rounded-2xl flex items-center justify-center font-bold text-lg shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-[15px]">{progress.student?.name}</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Roll No: {progress.student?.rollNo || 'N/A'}</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Attendance</span>
              <span className="text-lg font-black text-emerald-600">{progress.stats?.attendanceRate || 100}%</span>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Marks Avg</span>
              <span className="text-lg font-black text-blue-600">{progress.stats?.averageScore || 0}%</span>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Homework</span>
              <span className="text-lg font-black text-purple-600">{progress.stats?.homeworkCompletion || 0}%</span>
            </div>
          </div>

          {/* SVG Marks trend */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-[14px]">Academic Progress Trend</h3>
            {progress.marksHistory?.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs italic">No exam grades submitted yet.</div>
            ) : (
              renderSVGChart(progress.marksHistory)
            )}
          </div>

          {/* Homework sublist */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-[14px]">Homework Completion Log</h3>
            {progress.homeworks?.length === 0 ? (
              <div className="py-4 text-center text-slate-400 text-xs italic">No assignments logs found.</div>
            ) : (
              <div className="space-y-2">
                {progress.homeworks?.map((hw: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{hw.title}</h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Due: {hw.dueDate.split('T')[0]}</p>
                    </div>
                    <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase border ${
                      hw.submitted ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {hw.submitted ? 'Submitted' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
