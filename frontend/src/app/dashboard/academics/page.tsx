'use client';

import React, { useState } from 'react';
import { 
  Users, Calendar, Plus, BookOpen, Clock, AlertTriangle, 
  CheckCircle, ChevronRight, X, Search, Info, Grid, MapPin
} from 'lucide-react';
import { mockTeachers, mockAcademicYears } from '@/lib/mockData';

// Extended Academic Session model
interface ClassSection {
  id: string;
  name: string;
  academicYear: string;
  strength: number;
  advisor: string;
  subjects: { name: string; teacher: string; periods: number }[];
  loadPercent: number;
}

const initialClassSections: ClassSection[] = [
  {
    id: 'cs-1',
    name: 'Grade 10 - Section A',
    academicYear: '2026-2027',
    strength: 44,
    advisor: 'Teacher James Smith',
    subjects: [
      { name: 'Mathematics', teacher: 'Teacher James Smith', periods: 6 },
      { name: 'Physics', teacher: 'Teacher James Smith', periods: 5 },
      { name: 'English Literature', teacher: 'Teacher Sarah Moore', periods: 4 },
      { name: 'Computer Science', teacher: 'Teacher James Smith', periods: 4 }
    ],
    loadPercent: 90
  },
  {
    id: 'cs-2',
    name: 'Grade 10 - Section B',
    academicYear: '2026-2027',
    strength: 40,
    advisor: 'Teacher Sarah Moore',
    subjects: [
      { name: 'Mathematics', teacher: 'Teacher Sarah Moore', periods: 6 },
      { name: 'Chemistry', teacher: 'Teacher Sarah Moore', periods: 5 },
      { name: 'English Literature', teacher: 'Teacher Sarah Moore', periods: 4 }
    ],
    loadPercent: 75
  },
  {
    id: 'cs-3',
    name: 'Grade 9 - Section A',
    academicYear: '2026-2027',
    strength: 48,
    advisor: 'Teacher James Smith',
    subjects: [
      { name: 'Mathematics', teacher: 'Teacher James Smith', periods: 6 },
      { name: 'Physics', teacher: 'Teacher James Smith', periods: 5 }
    ],
    loadPercent: 55
  }
];

export default function AcademicsManagement() {
  const [activeTab, setActiveTab] = useState<'workload' | 'wizard' | 'timetable' | 'config'>('workload');
  const [teachers, setTeachers] = useState(mockTeachers);
  const [classSections, setClassSections] = useState<ClassSection[]>(initialClassSections);

  // Search States
  const [teacherSearch, setTeacherSearch] = useState('');
  const [classSearch, setClassSearch] = useState('');

  // Selected details
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Wizard States
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    academicYear: '2026-2027',
    className: '',
    sectionName: '',
    strength: 40,
    selectedSubjects: [] as string[],
    assignments: {} as Record<string, string> // subjectName -> teacherId
  });

  // Timetable scheduling states
  const [ttClassSectionId, setTtClassSectionId] = useState('cs-1');
  const [ttDay, setTtDay] = useState('Monday');
  const [timetablePeriods, setTimetablePeriods] = useState([
    { period: 1, time: '09:00 AM - 09:45 AM', subject: 'Mathematics', teacher: 'Teacher James Smith' },
    { period: 2, time: '09:45 AM - 10:30 AM', subject: 'Physics', teacher: 'Teacher James Smith' },
    { period: 3, time: '10:45 AM - 11:30 AM', subject: 'English Literature', teacher: 'Teacher Sarah Moore' },
    { period: 4, time: '11:30 AM - 12:15 PM', subject: 'Free / Study Hour', teacher: '—' },
    { period: 5, time: '01:15 PM - 02:00 PM', subject: 'Computer Science', teacher: 'Teacher James Smith' },
    { period: 6, time: '02:00 PM - 02:45 PM', subject: 'Lab Experiments', teacher: 'Teacher James Smith' },
    { period: 7, time: '03:00 PM - 03:45 PM', subject: 'Library Reading', teacher: '—' },
    { period: 8, time: '03:45 PM - 04:30 PM', subject: 'Games & Sports', teacher: '—' }
  ]);

  const [editingPeriod, setEditingPeriod] = useState<number | null>(null);
  const [editSubjectName, setEditSubjectName] = useState('');
  const [editTeacherName, setEditTeacherName] = useState('');

  // Filter lists
  const filteredTeachers = teachers.filter(t => t.name.toLowerCase().includes(teacherSearch.toLowerCase()));
  const filteredClasses = classSections.filter(c => c.name.toLowerCase().includes(classSearch.toLowerCase()));

  // Active workload stats
  const totalAssignments = classSections.reduce((sum, c) => sum + c.subjects.length, 0);
  const avgWorkload = Math.round(teachers.reduce((sum, t) => sum + (t.workload / 24) * 100, 0) / teachers.length);

  // Subject checklist options
  const subjectsCatalog = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English Literature', 'Computer Science', 'History', 'Civics'
  ];

  const handleSubjectToggle = (subj: string) => {
    setWizardData(prev => {
      const exists = prev.selectedSubjects.includes(subj);
      const updated = exists 
        ? prev.selectedSubjects.filter(s => s !== subj)
        : [...prev.selectedSubjects, subj];
      return { ...prev, selectedSubjects: updated };
    });
  };

  const handleTeacherSelectForSubject = (subj: string, teacherId: string) => {
    setWizardData(prev => ({
      ...prev,
      assignments: { ...prev.assignments, [subj]: teacherId }
    }));
  };

  const handleFinishWizard = () => {
    if (!wizardData.className || !wizardData.sectionName) {
      alert('Please enter class and section details.');
      return;
    }
    const created: ClassSection = {
      id: `cs-${Date.now()}`,
      name: `${wizardData.className} - Section ${wizardData.sectionName}`,
      academicYear: wizardData.academicYear,
      strength: Number(wizardData.strength),
      advisor: 'Unassigned',
      subjects: wizardData.selectedSubjects.map(sub => {
        const tId = wizardData.assignments[sub];
        const teacher = teachers.find(t => t.id === tId);
        return {
          name: sub,
          teacher: teacher ? teacher.name : 'Unassigned',
          periods: 4
        };
      }),
      loadPercent: Math.round((wizardData.selectedSubjects.length / 5) * 100)
    };

    setClassSections([...classSections, created]);
    alert('Success: New Class Section registered with staffing parameters.');
    setActiveTab('workload');
    setWizardStep(1);
    setWizardData({
      academicYear: '2026-2027',
      className: '',
      sectionName: '',
      strength: 40,
      selectedSubjects: [],
      assignments: {}
    });
  };

  const handleUpdatePeriod = (periodNum: number) => {
    setTimetablePeriods(prev => prev.map(p => {
      if (p.period === periodNum) {
        return { ...p, subject: editSubjectName, teacher: editTeacherName };
      }
      return p;
    }));
    setEditingPeriod(null);
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-[28px] font-bold text-slate-900 leading-none">
            Teacher & Class Management
          </h2>
          <p className="text-slate-500 text-[13px] font-medium mt-2">
            Assign classroom advisory, resolve unstaffed courses, and design school schedule calendars.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setWizardStep(1);
              setActiveTab('wizard');
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[13px] flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Add Class Section
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm">
        <button
          onClick={() => setActiveTab('workload')}
          className={`pb-4 font-bold transition-all border-b-2 ${
            activeTab === 'workload' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Workload Dashboard
        </button>
        <button
          onClick={() => setActiveTab('timetable')}
          className={`pb-4 font-bold transition-all border-b-2 ${
            activeTab === 'timetable' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Class Timetables
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`pb-4 font-bold transition-all border-b-2 ${
            activeTab === 'config' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Academic Settings
        </button>
      </div>

      {/* WORKLOAD OVERVIEW */}
      {activeTab === 'workload' && (
        <div className="space-y-6">
          {/* KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Teachers</span>
              <div className="text-3xl font-extrabold text-slate-800 leading-none mt-2">{teachers.length}</div>
              <span className="text-[10px] text-slate-400 font-semibold block mt-2">Active roster faculty</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Class Sections</span>
              <div className="text-3xl font-extrabold text-slate-800 leading-none mt-2">{classSections.length}</div>
              <span className="text-[10px] text-slate-400 font-semibold block mt-2">Operational classrooms</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Staffing Assignments</span>
              <div className="text-3xl font-extrabold text-slate-800 leading-none mt-2">{totalAssignments}</div>
              <span className="text-[10px] text-slate-400 font-semibold block mt-2">Mapped courses</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Avg. Workload Load</span>
              <div className="text-3xl font-extrabold text-blue-600 leading-none mt-2">{avgWorkload}%</div>
              <span className="text-[10px] text-slate-400 font-semibold block mt-2">Target benchmark limit</span>
            </div>
          </div>

          {/* Dual Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LEFT PANEL: Teacher Workloads */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-850 text-base">Faculty Workload limits</h3>
                <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 w-44">
                  <Search className="w-3.5 h-3.5 text-slate-400 mr-1" />
                  <input
                    type="text" placeholder="Search faculty..." value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    className="bg-transparent border-none text-[11px] text-slate-800 outline-none w-full placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {filteredTeachers.map((t) => {
                  const percent = Math.round((t.workload / 24) * 100);
                  const isSelected = selectedTeacherId === t.id;
                  const isHigh = percent > 90;
                  return (
                    <div key={t.id} className="border border-slate-100 rounded-xl p-3 hover:border-blue-200 transition-all">
                      <div className="flex justify-between items-center cursor-pointer" onClick={() => setSelectedTeacherId(isSelected ? null : t.id)}>
                        <div>
                          <div className="font-bold text-xs text-slate-800">{t.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium mt-0.5">{t.designation} · {t.employeeId}</div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isHigh ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}>
                            {percent}% Load
                          </span>
                        </div>
                      </div>
                      
                      {/* Workload Progress Bar */}
                      <div className="mt-2.5 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isHigh ? 'bg-rose-500' : 'bg-blue-500'}`} 
                          style={{ width: `${percent}%` }} 
                        />
                      </div>

                      {/* Expand details for teachers */}
                      {isSelected && (
                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs animate-in">
                          <div className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Assigned Classes:</div>
                          <div className="grid grid-cols-2 gap-2 font-semibold">
                            {classSections.map(cs => {
                              const matches = cs.subjects.filter(s => s.teacher === t.name);
                              if (matches.length === 0) return null;
                              return (
                                <div key={cs.id} className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                                  <span className="text-slate-800 text-[11px] block">{cs.name}</span>
                                  {matches.map((m, i) => (
                                    <span key={i} className="text-[9px] text-blue-600 block mt-0.5">{m.name} ({m.periods} periods)</span>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                          <div className="text-[10px] text-slate-450 italic mt-1">Qualifications: {t.qualification}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT PANEL: Class sections workloads */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-850 text-base">Classroom Staffing Coverage</h3>
                <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 w-44">
                  <Search className="w-3.5 h-3.5 text-slate-400 mr-1" />
                  <input
                    type="text" placeholder="Search classrooms..." value={classSearch}
                    onChange={(e) => setClassSearch(e.target.value)}
                    className="bg-transparent border-none text-[11px] text-slate-800 outline-none w-full placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {filteredClasses.map((c) => {
                  const isSelected = selectedClassId === c.id;
                  const isLow = c.loadPercent < 70;
                  return (
                    <div key={c.id} className="border border-slate-100 rounded-xl p-3 hover:border-blue-200 transition-all">
                      <div className="flex justify-between items-center cursor-pointer" onClick={() => setSelectedClassId(isSelected ? null : c.id)}>
                        <div>
                          <div className="font-bold text-xs text-slate-800">{c.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium mt-0.5">{c.academicYear} · {c.strength} enrolled</div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isLow ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                            {c.loadPercent}% Staffed
                          </span>
                        </div>
                      </div>

                      {/* Expand details for class */}
                      {isSelected && (
                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-3 text-xs animate-in">
                          <div className="text-slate-400 font-bold text-[9px] uppercase tracking-wider">Subject Allocations:</div>
                          <div className="space-y-1.5 font-semibold">
                            {c.subjects.map((s, idx) => (
                              <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 border border-slate-100 rounded-lg">
                                <div>
                                  <span className="text-slate-850 font-bold">{s.name}</span>
                                  <span className="text-[10px] text-slate-400 font-medium block">{s.teacher}</span>
                                </div>
                                <span className="text-slate-500 font-mono text-[10px]">{s.periods} periods/wk</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CREATE CLASS SECTION WIZARD */}
      {activeTab === 'wizard' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-850 text-base">Setup New Classroom Section</h3>
            <span className="text-xs text-slate-400 font-bold bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
              Step {wizardStep} of 3
            </span>
          </div>

          {/* Stepper Wizard Indicator */}
          <div className="flex items-center gap-4 text-xs font-bold">
            <div className={`px-3 py-1.5 rounded-lg border ${wizardStep >= 1 ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
              1. Class Credentials
            </div>
            <div className="text-slate-300">→</div>
            <div className={`px-3 py-1.5 rounded-lg border ${wizardStep >= 2 ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
              2. Course checklist
            </div>
            <div className="text-slate-300">→</div>
            <div className={`px-3 py-1.5 rounded-lg border ${wizardStep >= 3 ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
              3. Faculty mapping
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-4 text-xs font-semibold">
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Academic Session Year *</label>
                    <select
                      value={wizardData.academicYear}
                      onChange={(e) => setWizardData({ ...wizardData, academicYear: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-850 font-bold"
                    >
                      <option>2026-2027</option>
                      <option>2025-2026</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Grade Class Level *</label>
                    <input
                      type="text" placeholder="e.g. Grade 10" required
                      value={wizardData.className}
                      onChange={(e) => setWizardData({ ...wizardData, className: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Section Letter *</label>
                    <input
                      type="text" placeholder="e.g. Section C" required
                      value={wizardData.sectionName}
                      onChange={(e) => setWizardData({ ...wizardData, sectionName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 font-bold outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Target Class Strength (Optional)</label>
                    <input
                      type="number" placeholder="40"
                      value={wizardData.strength}
                      onChange={(e) => setWizardData({ ...wizardData, strength: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => {
                      if (!wizardData.className || !wizardData.sectionName) {
                        alert('Required fields must be completed.');
                        return;
                      }
                      setWizardStep(2);
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                  >
                    Next: Choose Subjects
                  </button>
                </div>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-4">
                <div className="text-slate-400 font-bold">Select subjects to include in the curriculum checklist:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {subjectsCatalog.map((subj) => {
                    const isChecked = wizardData.selectedSubjects.includes(subj);
                    return (
                      <div
                        key={subj}
                        onClick={() => handleSubjectToggle(subj)}
                        className={`p-3 border rounded-xl cursor-pointer text-center font-bold ${
                          isChecked 
                            ? 'bg-blue-50 border-blue-200 text-blue-600' 
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-650'
                        }`}
                      >
                        {subj}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setWizardStep(1)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (wizardData.selectedSubjects.length === 0) {
                        alert('Please choose at least one subject.');
                        return;
                      }
                      setWizardStep(3);
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                  >
                    Next: Assign Teachers
                  </button>
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-4 animate-in">
                <div className="text-slate-400 font-bold">Map qualified teaching faculty to the chosen course items:</div>
                <div className="space-y-3">
                  {wizardData.selectedSubjects.map((subj) => (
                    <div key={subj} className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <span className="font-extrabold text-slate-750 text-xs sm:w-1/3">{subj}</span>
                      <select
                        value={wizardData.assignments[subj] || ''}
                        onChange={(e) => handleTeacherSelectForSubject(subj, e.target.value)}
                        className="p-2 border border-slate-200 rounded-lg text-slate-800 bg-white font-bold max-w-sm w-full"
                      >
                        <option value="">Unassigned</option>
                        {teachers.map(t => (
                          <option key={t.id} value={t.id}>{t.name} (Load: {t.workload}/24)</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    onClick={() => setWizardStep(2)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleFinishWizard}
                    className="px-4 py-2 rounded-xl bg-[#00C48C] hover:bg-emerald-500 text-white font-semibold"
                  >
                    Create Class Section
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* WEEKLY TIMETABLE SCHEDULER */}
      {activeTab === 'timetable' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-850 text-base">Class Weekly Timetable Scheduler</h3>
              <p className="text-slate-450 text-[11px] font-semibold mt-1">Configure period timelines by day</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={ttClassSectionId}
                onChange={(e) => setTtClassSectionId(e.target.value)}
                className="border border-slate-200 rounded-xl p-1.5 text-xs text-slate-750 font-bold bg-white"
              >
                {classSections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              
              <select
                value={ttDay}
                onChange={(e) => setTtDay(e.target.value)}
                className="border border-slate-200 rounded-xl p-1.5 text-xs text-slate-750 font-bold bg-white"
              >
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
                <option>Saturday</option>
              </select>
            </div>
          </div>

          {/* Timetable Rows list */}
          <div className="space-y-3 max-w-2xl">
            {timetablePeriods.map((p) => {
              const isEditing = editingPeriod === p.period;
              return (
                <div key={p.period} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-xs">
                      P{p.period}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-800">{p.subject}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{p.time} · {p.teacher}</div>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="flex gap-2 w-full sm:w-auto text-xs">
                      <input
                        type="text" placeholder="Subject" value={editSubjectName}
                        onChange={(e) => setEditSubjectName(e.target.value)}
                        className="border border-slate-200 rounded px-2 py-1 bg-white"
                      />
                      <input
                        type="text" placeholder="Teacher" value={editTeacherName}
                        onChange={(e) => setEditTeacherName(e.target.value)}
                        className="border border-slate-200 rounded px-2 py-1 bg-white"
                      />
                      <button
                        onClick={() => handleUpdatePeriod(p.period)}
                        className="bg-blue-600 hover:bg-blue-500 text-white rounded px-2 py-1 font-bold"
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingPeriod(p.period);
                        setEditSubjectName(p.subject);
                        setEditTeacherName(p.teacher);
                      }}
                      className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-bold text-slate-500"
                    >
                      ✏ Edit Slot
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ACADEMIC SETTINGS */}
      {activeTab === 'config' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          {/* Term boundaries */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar className="w-5 h-5 text-blue-500" />
              Academic Term boundaries
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockAcademicYears.map(ay => (
                <div key={ay.id} className="border border-slate-100 rounded-xl p-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-800 text-sm">{ay.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      ay.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-500 border border-slate-200'
                    }`}>
                      {ay.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-450 font-semibold mt-2">
                    <div>Start: <strong className="text-slate-700 font-bold block">{ay.startDate}</strong></div>
                    <div>End: <strong className="text-slate-700 font-bold block">{ay.endDate}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Codes */}
          <div className="space-y-4 pt-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Registered Subject Course Codes
            </h3>
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Subject Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3 text-right">Periods/Week</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-650 font-semibold">
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-blue-600">MATH-10</td>
                    <td className="px-4 py-3 text-slate-800">Mathematics</td>
                    <td className="px-4 py-3 text-slate-400">Core Theory</td>
                    <td className="px-4 py-3 text-right">6 periods</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-blue-600">PHYS-10</td>
                    <td className="px-4 py-3 text-slate-800">Physics</td>
                    <td className="px-4 py-3 text-slate-400">Theory + Lab</td>
                    <td className="px-4 py-3 text-right">5 periods</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-blue-600">CHEM-10</td>
                    <td className="px-4 py-3 text-slate-800">Chemistry</td>
                    <td className="px-4 py-3 text-slate-400">Theory + Lab</td>
                    <td className="px-4 py-3 text-right">5 periods</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
