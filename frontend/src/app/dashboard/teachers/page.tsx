'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { 
  Plus, X, Search, ChevronDown, ChevronUp, Users, 
  BookOpen, Grid3X3, BarChart3, Clock, Upload, 
  Calendar, Layers
} from 'lucide-react';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#667eea,#764ba2)',
  'linear-gradient(135deg,#f093fb,#f5576c)',
  'linear-gradient(135deg,#4facfe,#00f2fe)',
  'linear-gradient(135deg,#43e97b,#38f9d7)',
  'linear-gradient(135deg,#fa709a,#fee140)',
  'linear-gradient(135deg,#a18cd1,#fbc2eb)',
  'linear-gradient(135deg,#fd7043,#ff8a65)',
  'linear-gradient(135deg,#26c6da,#00acc1)',
];

interface Teacher {
  id: string;
  name: string;
  initials: string;
  subjects: string[];
  classCount: number;
  loadPercent: number;
  gradient: string;
}

interface ClassSection {
  id: string;
  name: string;
  academicYear: string;
  subjectCount: number;
  staffedCount: number;
  loadPercent: number;
}

const initialTeachers: Teacher[] = [
  { id: 't1', name: 'SAKIBANDA SUNIL BABU', initials: 'SS', subjects: ['General Knowledge'], classCount: 2, loadPercent: 62, gradient: AVATAR_GRADIENTS[2] },
  { id: 't2', name: 'Lalsagari Shaik Shafiulla', initials: 'LS', subjects: ['General Knowledge'], classCount: 1, loadPercent: 38, gradient: AVATAR_GRADIENTS[3] },
  { id: 't3', name: 'eiu rri', initials: 'ER', subjects: ['JavaScript'], classCount: 3, loadPercent: 75, gradient: AVATAR_GRADIENTS[4] },
  { id: 't4', name: 'Sohal Shaik', initials: 'SS', subjects: ['AMLOG'], classCount: 1, loadPercent: 25, gradient: AVATAR_GRADIENTS[5] },
  { id: 't5', name: 'LD Teacher', initials: 'LD', subjects: ['Mathematics'], classCount: 2, loadPercent: 50, gradient: AVATAR_GRADIENTS[6] },
  { id: 't6', name: 'MH Teacher', initials: 'MH', subjects: ['Science'], classCount: 2, loadPercent: 45, gradient: AVATAR_GRADIENTS[7] },
];

const initialClasses: ClassSection[] = [
  { id: 'cs1', name: 'Grade 10 - Section A', academicYear: '2025-2026', subjectCount: 6, staffedCount: 5, loadPercent: 83 },
  { id: 'cs2', name: 'Grade 9 - Section B', academicYear: '2025-2026', subjectCount: 5, staffedCount: 4, loadPercent: 80 },
  { id: 'cs3', name: 'Grade 8 - Section A', academicYear: '2025-2026', subjectCount: 7, staffedCount: 6, loadPercent: 85 },
];

function getLoadColor(pct: number) {
  if (pct < 50) return '#22c55e';
  if (pct < 80) return '#f59e0b';
  return '#ef4444';
}

function getLoadBg(pct: number) {
  if (pct < 50) return '#dcfce7';
  if (pct < 80) return '#fef9c3';
  return '#fee2e2';
}

export default function TeacherClassManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [classes, setClasses] = useState<ClassSection[]>(initialClasses);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [classSearch, setClassSearch] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedClass, setSelectedClass] = useState<ClassSection | null>(null);

  const fetchClassAndTeacherData = async () => {
    try {
      // 1. Fetch teachers
      const teacherRes = await api.get('/teachers');
      if (teacherRes.data && teacherRes.data.length > 0) {
        const mappedTeachers: Teacher[] = teacherRes.data.map((t: any, idx: number) => ({
          id: t.id,
          name: t.user.name,
          initials: t.user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
          subjects: t.subjectsTaught || [],
          classCount: t._count?.teacherAssignments || 0,
          loadPercent: Math.min(100, (t._count?.teacherAssignments || 0) * 15),
          gradient: AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]
        }));
        setTeachers(mappedTeachers);
      } else {
        setTeachers(initialTeachers);
      }

      // 2. Fetch ClassSections
      const classSectionRes = await api.get('/academics/class-sections');
      if (classSectionRes.data && classSectionRes.data.length > 0) {
        const mappedClasses: ClassSection[] = classSectionRes.data.map((cs: any) => ({
          id: cs.id,
          name: `${cs.class.name} - ${cs.section.name}`,
          academicYear: cs.class.academicYear?.name || '2026-2027',
          subjectCount: cs._count?.classSubjects || 0,
          staffedCount: cs._count?.teacherAssigns || 0,
          loadPercent: cs._count?.classSubjects > 0 ? Math.round((cs._count?.teacherAssigns / cs._count?.classSubjects) * 100) : 0
        }));
        setClasses(mappedClasses);
      } else {
        setClasses(initialClasses);
      }
    } catch (err) {
      console.error('Failed to fetch teachers or classes:', err);
    }
  };

  useEffect(() => {
    fetchClassAndTeacherData();
  }, []);

  // Modals
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showImportTeachers, setShowImportTeachers] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showCreateSection, setShowCreateSection] = useState(false);
  const [showAddClassSection, setShowAddClassSection] = useState(false);
  const [showTimetable, setShowTimetable] = useState(false);
  const [selectedClassSection, setSelectedClassSection] = useState('Class-1 - Section-A');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [frequency, setFrequency] = useState('Weekly');
  const [startDate, setStartDate] = useState('2026-06-01');
  const [endDate, setEndDate] = useState('2026-06-07');
  
  const [timetableData, setTimetableData] = useState<Record<string, { subject: string; teacherId: string }>>({
    'MON-1': { subject: 'Mathematics', teacherId: 't5' },
    'MON-2': { subject: 'Physics', teacherId: 't6' },
    'MON-3': { subject: 'English', teacherId: 't3' },
    'TUE-1': { subject: 'Chemistry', teacherId: 't1' },
    'TUE-2': { subject: 'Computer Science', teacherId: 't2' },
    'WED-1': { subject: 'Mathematics', teacherId: 't5' },
    'THU-1': { subject: 'Physics', teacherId: 't6' },
    'FRI-1': { subject: 'History', teacherId: 't3' },
  });

  const SUBJECTS_LIST = ['General Knowledge', 'JavaScript', 'AMLOG', 'Mathematics', 'Science', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Computer Science'];

  const handleCellChange = (day: string, period: number, field: 'subject' | 'teacherId', value: string) => {
    const cellKey = `${day}-${period}`;
    setTimetableData(prev => {
      const current = prev[cellKey] || { subject: '', teacherId: '' };
      const updated = { ...current, [field]: value };
      if (field === 'subject' && !value) {
        updated.teacherId = '';
      }
      return { ...prev, [cellKey]: updated };
    });
  };

  const handleClearTimetable = () => {
    if (confirm('Are you sure you want to clear the entire timetable?')) {
      setTimetableData({});
    }
  };

  const handleSaveTimetable = () => {
    alert(`✅ Timetable for "${selectedClassSection}" saved successfully!`);
  };

  const handleLoadTimetable = () => {
    alert(`🔍 Loaded timetable data for "${selectedClassSection}" (${academicYear})`);
  };

  // Add Teacher Form
  const [newTeacher, setNewTeacher] = useState({
    firstName: '', lastName: '', email: '', phone: '', gender: '',
    dob: '', qualification: '', joiningDate: '', address: '',
    basicSalary: 30000, hra: 3600, da: 2400, pf: 1500,
    accountNumber: '', ifsc: '',
    skills: [{ subject: '', level: 'Expert', exp: 0 }]
  });

  // Add Subject
  const [subjects, setSubjects] = useState([{ id: 1, name: '' }]);
  const [newClassName, setNewClassName] = useState('');
  const [newSectionName, setNewSectionName] = useState('');

  // Class section form
  const [csForm, setCsForm] = useState({ academicYear: '2025-2026', className: 'Grade 10', section: 'Section A', strength: '' });

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(teacherSearch.toLowerCase())
  );
  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(classSearch.toLowerCase())
  );

  const totalTeachers = teachers.length;
  const totalClasses = classes.length;
  const totalAssignments = teachers.reduce((s, t) => s + t.classCount, 0);
  const avgWorkload = teachers.length > 0
    ? Math.round(teachers.reduce((s, t) => s + t.loadPercent, 0) / teachers.length)
    : 0;

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: `${newTeacher.firstName} ${newTeacher.lastName}`.toUpperCase(),
        email: newTeacher.email,
        phone: newTeacher.phone,
        qualification: newTeacher.qualification,
        basicSalary: Number(newTeacher.basicSalary),
        subjectsTaught: newTeacher.skills.map(s => s.subject).filter(Boolean),
      };
      await api.post('/teachers', payload);

      // Dispatch event to refresh dashboard in real-time
      window.dispatchEvent(new CustomEvent('school-setup-updated'));

      // Reload items
      await fetchClassAndTeacherData();

      setShowAddTeacher(false);
      setNewTeacher({
        firstName: '', lastName: '', email: '', phone: '', gender: '',
        dob: '', qualification: '', joiningDate: '', address: '',
        basicSalary: 30000, hra: 3600, da: 2400, pf: 1500,
        accountNumber: '', ifsc: '',
        skills: [{ subject: '', level: 'Expert', exp: 0 }]
      });
    } catch (err: any) {
      console.error('Error saving teacher:', err);
      alert('Failed to save teacher: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSaveSubjects = () => {
    alert(`✅ ${subjects.filter(s => s.name).length} subject(s) saved successfully!`);
    setShowAddSubject(false);
    setSubjects([{ id: 1, name: '' }]);
  };

  const handleSaveClass = async () => {
    if (!newClassName.trim()) { alert('Enter a class name'); return; }
    try {
      // 1. Fetch active academic year
      const yearsRes = await api.get('/academics/academic-years');
      const activeYear = yearsRes.data.find((y: any) => y.isActive) || yearsRes.data[0];
      if (!activeYear) {
        alert('No active academic year found. Please configure settings first.');
        return;
      }

      // 2. Create the Class
      const newClassRes = await api.post('/academics/classes', {
        name: newClassName.trim(),
        academicYearId: activeYear.id,
      });
      const newClass = newClassRes.data;

      // 3. Find or create default section
      const sectionRes = await api.get('/academics/sections');
      let defaultSection = sectionRes.data.find((s: any) => s.name === 'Section A') || sectionRes.data[0];
      
      if (!defaultSection) {
        const defaultSecRes = await api.post('/academics/sections', {
          name: 'Section A',
        });
        defaultSection = defaultSecRes.data;
      }

      // 4. Create class section junction
      await api.post('/academics/class-sections', {
        classId: newClass.id,
        sectionId: defaultSection.id,
      });

      // Dispatch event to refresh dashboard in real-time
      window.dispatchEvent(new CustomEvent('school-setup-updated'));

      // Reload list
      await fetchClassAndTeacherData();

      setShowCreateClass(false);
      setNewClassName('');
    } catch (err: any) {
      console.error('Error saving class:', err);
      alert('Failed to save class: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSaveSection = () => {
    if (!newSectionName.trim()) { alert('Enter a section name'); return; }
    alert(`✅ Section "${newSectionName}" created successfully!`);
    setShowCreateSection(false);
    setNewSectionName('');
  };

  const handleSaveClassSection = (e: React.FormEvent) => {
    e.preventDefault();
    const cs: ClassSection = {
      id: `cs-${Date.now()}`,
      name: `${csForm.className} - ${csForm.section}`,
      academicYear: csForm.academicYear,
      subjectCount: 0,
      staffedCount: 0,
      loadPercent: 0
    };
    setClasses([...classes, cs]);
    setShowAddClassSection(false);
  };

  if (showTimetable) {
    return (
      <div className="space-y-6 animate-in">
        {/* Class Timetable Full Page Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-slate-800">Class Timetable</h2>
              <p className="text-xs text-slate-400 mt-0.5">Schedule periods per day — Mon to Sat</p>
            </div>
          </div>
          <button
            onClick={() => setShowTimetable(false)}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            ✕ Close
          </button>
        </div>

        {/* Timetable Configuration Panel Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Class Section *</label>
              <select
                value={selectedClassSection}
                onChange={e => setSelectedClassSection(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
              >
                <option>Class-1 - Section-A</option>
                {classes.map(c => <option key={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Academic Year *</label>
              <select
                value={academicYear}
                onChange={e => setAcademicYear(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
              >
                <option>2026-2027</option>
                <option>2025-2026</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Frequency *</label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
              >
                <option>Weekly</option>
                <option>Daily</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">End Date *</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
              />
            </div>
            <div>
              <button
                onClick={handleLoadTimetable}
                className="w-full px-4 py-2.5 rounded-xl border border-blue-600 hover:bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                🔍 Load Timetable
              </button>
            </div>
          </div>
        </div>

        {/* Timetable Matrix Grid */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-[#1E293B] text-white uppercase text-[10px] tracking-wider font-bold">
                  <th className="px-4 py-3.5 border border-slate-700 w-24">Day</th>
                  {[
                    { id: 'P1', name: 'P1', time: '9:00 AM - 10:00 AM' },
                    { id: 'P2', name: 'P2', time: '10:00 AM - 11:00 AM' },
                    { id: 'P3', name: 'P3', time: '11:00 AM - 12:00 PM' },
                    { id: 'P4', name: 'P4', time: '12:00 PM - 1:00 PM' },
                    { id: 'P5', name: 'P5', time: '1:00 PM - 2:00 PM' },
                    { id: 'P6', name: 'P6', time: '2:00 PM - 3:00 PM' },
                    { id: 'P7', name: 'P7', time: '3:00 PM - 4:00 PM' },
                    { id: 'P8', name: 'P8', time: '4:00 PM - 5:00 PM' },
                  ].map(p => (
                    <th key={p.id} className="px-4 py-3.5 border border-slate-700 text-center">
                      <div className="font-extrabold">{p.name}</div>
                      <div className="text-[9px] opacity-80 font-normal mt-0.5">{p.time}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                  <tr key={day} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 border border-slate-200 font-extrabold text-slate-700 text-sm bg-slate-50/50">
                      {day}
                    </td>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(p => {
                      const cellKey = `${day}-${p}`;
                      const cellData = timetableData[cellKey] || { subject: '', teacherId: '' };
                      return (
                        <td key={p} className="p-3 border border-slate-200 min-w-[140px]">
                          <div className="space-y-1.5">
                            {/* Subject Select */}
                            <select
                              value={cellData.subject}
                              onChange={e => handleCellChange(day, p, 'subject', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-500"
                            >
                              <option value="">Subject</option>
                              {SUBJECTS_LIST.map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                              ))}
                            </select>

                            {/* Teacher Select */}
                            <select
                              value={cellData.teacherId}
                              disabled={!cellData.subject}
                              onChange={e => handleCellChange(day, p, 'teacherId', e.target.value)}
                              className={`w-full border rounded-lg px-2 py-1.5 text-xs outline-none ${
                                cellData.subject 
                                  ? 'bg-white border-slate-200 text-slate-700 focus:border-blue-500' 
                                  : 'bg-slate-50 border-slate-100 text-slate-400'
                              }`}
                            >
                              <option value="">
                                {cellData.subject ? 'Select Teacher' : 'Select subject first'}
                              </option>
                              {teachers.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Timetable Bottom Action Bar */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={handleClearTimetable}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm cursor-pointer"
          >
            🧹 Clear Timetable
          </button>
          <button
            onClick={handleSaveTimetable}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md cursor-pointer"
          >
            💾 Save Timetable
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-[18px] font-bold text-slate-800">Teacher &amp; Class Management</h2>
        </div>
      </div>

      {/* Workload Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-[16px] font-bold text-slate-800">Workload Overview</h3>
            <p className="text-xs text-slate-400 mt-0.5">Live teacher &amp; class assignment dashboard</p>
          </div>
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowAddTeacher(true)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Teacher
            </button>
            <button
              onClick={() => setShowImportTeachers(true)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Upload className="w-3.5 h-3.5" /> Import Teachers
            </button>
            <button
              onClick={() => setShowAddSubject(true)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" /> Add Subject
            </button>
            <button
              onClick={() => setShowCreateClass(true)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Grid3X3 className="w-3.5 h-3.5" /> Create Class
            </button>
            <button
              onClick={() => setShowCreateSection(true)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Layers className="w-3.5 h-3.5" /> Create Section
            </button>
            <button
              onClick={() => setShowAddClassSection(true)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Class Section
            </button>
            <button
              onClick={() => setShowTimetable(true)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Calendar className="w-3.5 h-3.5" /> Timetable
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Teachers</span>
            </div>
            <div className="text-[28px] font-extrabold text-slate-800 leading-none">{totalTeachers}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Grid3X3 className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class Sections</span>
            </div>
            <div className="text-[28px] font-extrabold text-slate-800 leading-none">{totalClasses}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-purple-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assignments</span>
            </div>
            <div className="text-[28px] font-extrabold text-slate-800 leading-none">{totalAssignments}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Workload</span>
            </div>
            <div className="text-[28px] font-extrabold text-slate-800 leading-none">{avgWorkload}%</div>
          </div>
        </div>

        {/* Workload Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Teacher Workload */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                Teacher Workload
                <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-600 text-[9px] flex items-center justify-center font-bold">i</span>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search teachers..."
                  value={teacherSearch}
                  onChange={e => setTeacherSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none w-36"
                />
              </div>
            </div>
            {filteredTeachers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Users className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm font-semibold">No teachers added yet</p>
                <p className="text-xs mt-1">Click &apos;Add Teacher&apos; to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {filteredTeachers.map(t => {
                  const color = getLoadColor(t.loadPercent);
                  const bg = getLoadBg(t.loadPercent);
                  const isSelected = selectedTeacher?.id === t.id;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTeacher(isSelected ? null : t)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                    >
                      <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-xs font-extrabold" style={{ background: t.gradient }}>
                        {t.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-800 truncate">{t.name}</div>
                        <div className="text-[11px] text-slate-400">{t.subjects.join(', ') || 'No subjects'} · {t.classCount} class(es)</div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${t.loadPercent}%`, background: color }} />
                          </div>
                          <span className="text-[10px] font-bold rounded px-1.5 py-0.5" style={{ background: bg, color }}>{t.loadPercent}%</span>
                        </div>
                      </div>
                      {isSelected ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Class Workload */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                Class Workload
                <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-600 text-[9px] flex items-center justify-center font-bold">i</span>
              </div>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search classes..."
                  value={classSearch}
                  onChange={e => setClassSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none w-36"
                />
              </div>
            </div>
            {filteredClasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Grid3X3 className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm font-semibold">No class sections yet</p>
                <p className="text-xs mt-1">Click &apos;Add Class Section&apos; to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {filteredClasses.map(c => {
                  const color = getLoadColor(c.loadPercent);
                  const bg = getLoadBg(c.loadPercent);
                  const unstaffed = c.subjectCount - c.staffedCount;
                  const isSelected = selectedClass?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedClass(isSelected ? null : c)}
                      className={`px-4 py-3 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="text-sm font-bold text-slate-800">{c.name}</div>
                        <span className="text-[10px] font-bold rounded px-1.5 py-0.5" style={{ background: bg, color }}>{c.loadPercent}%</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mb-2">{c.academicYear} · {c.staffedCount}/{c.subjectCount} subjects staffed{unstaffed > 0 ? ` · ${unstaffed} unstaffed` : ''}</div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${c.loadPercent}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Selected Teacher Detail */}
        {selectedTeacher && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-extrabold" style={{ background: selectedTeacher.gradient }}>
                {selectedTeacher.initials}
              </div>
              <div>
                <div className="font-bold text-slate-800">{selectedTeacher.name}</div>
                <div className="text-xs text-slate-500">{selectedTeacher.subjects.join(', ')} · {selectedTeacher.classCount} class(es) assigned</div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="text-slate-400 mb-1">Workload</div>
                <div className="font-bold text-slate-800">{selectedTeacher.loadPercent}%</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="text-slate-400 mb-1">Classes</div>
                <div className="font-bold text-slate-800">{selectedTeacher.classCount}</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="text-slate-400 mb-1">Subjects</div>
                <div className="font-bold text-slate-800">{selectedTeacher.subjects.length}</div>
              </div>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="text-slate-400 mb-1">Today Schedule</div>
                <div className="font-bold text-slate-500 italic text-[10px]">No periods assigned</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── ADD TEACHER MODAL ── */}
      {showAddTeacher && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowAddTeacher(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white rounded-2xl shadow-2xl z-50 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-800 text-lg">Add New Teacher</h3>
              <button onClick={() => setShowAddTeacher(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveTeacher} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1 text-xs">First Name *</label>
                  <input required value={newTeacher.firstName} onChange={e => setNewTeacher({...newTeacher, firstName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-blue-500" placeholder="First Name" />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1 text-xs">Last Name *</label>
                  <input required value={newTeacher.lastName} onChange={e => setNewTeacher({...newTeacher, lastName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-blue-500" placeholder="Last Name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1 text-xs">Email *</label>
                  <input type="email" required value={newTeacher.email} onChange={e => setNewTeacher({...newTeacher, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-blue-500" placeholder="email@school.com" />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1 text-xs">Phone *</label>
                  <input type="tel" required value={newTeacher.phone} onChange={e => setNewTeacher({...newTeacher, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-blue-500" placeholder="+91 9XXXXXXXXX" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1 text-xs">Gender</label>
                  <select value={newTeacher.gender} onChange={e => setNewTeacher({...newTeacher, gender: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none">
                    <option value="">Select Gender</option>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1 text-xs">Qualification</label>
                  <input value={newTeacher.qualification} onChange={e => setNewTeacher({...newTeacher, qualification: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-blue-500" placeholder="e.g. M.Sc, B.Ed" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1 text-xs">Basic Salary (₹)</label>
                  <input type="number" value={newTeacher.basicSalary} onChange={e => setNewTeacher({...newTeacher, basicSalary: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none" />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1 text-xs">HRA (₹)</label>
                  <input type="number" value={newTeacher.hra} onChange={e => setNewTeacher({...newTeacher, hra: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none" />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1 text-xs">PF Deduction (₹)</label>
                  <input type="number" value={newTeacher.pf} onChange={e => setNewTeacher({...newTeacher, pf: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none" />
                </div>
              </div>
              {/* Subject Skills */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-slate-500 font-semibold text-xs">Subject Skills</label>
                  <button type="button" onClick={() => setNewTeacher({...newTeacher, skills: [...newTeacher.skills, {subject:'',level:'Expert',exp:0}]})} className="text-[11px] text-blue-600 font-bold hover:underline">+ Add Skill</button>
                </div>
                {newTeacher.skills.map((sk, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input value={sk.subject} onChange={e => { const s = [...newTeacher.skills]; s[idx] = {...s[idx], subject: e.target.value}; setNewTeacher({...newTeacher, skills: s}); }} className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs outline-none" placeholder="Subject name" />
                    <select value={sk.level} onChange={e => { const s = [...newTeacher.skills]; s[idx] = {...s[idx], level: e.target.value}; setNewTeacher({...newTeacher, skills: s}); }} className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none">
                      <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option>
                    </select>
                    <input type="number" value={sk.exp} onChange={e => { const s = [...newTeacher.skills]; s[idx] = {...s[idx], exp: Number(e.target.value)}; setNewTeacher({...newTeacher, skills: s}); }} className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs outline-none" placeholder="Yrs" />
                    {newTeacher.skills.length > 1 && (
                      <button type="button" onClick={() => setNewTeacher({...newTeacher, skills: newTeacher.skills.filter((_, i) => i !== idx)})} className="text-rose-500 hover:text-rose-700">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddTeacher(false)} className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md">Save Teacher</button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ── ADD SUBJECT MODAL ── */}
      {showAddSubject && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowAddSubject(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-slate-800">Add Subjects</h3>
              <button onClick={() => setShowAddSubject(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2 mb-4">
              {subjects.map((s, idx) => (
                <div key={s.id} className="flex gap-2">
                  <input
                    value={s.name}
                    onChange={e => { const arr = [...subjects]; arr[idx] = {...arr[idx], name: e.target.value}; setSubjects(arr); }}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500"
                    placeholder="e.g. Mathematics, Science"
                  />
                  <button
                    onClick={() => setSubjects([...subjects, { id: Date.now(), name: '' }])}
                    className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold hover:bg-purple-200"
                  >+</button>
                  {subjects.length > 1 && (
                    <button onClick={() => setSubjects(subjects.filter((_, i) => i !== idx))} className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={handleSaveSubjects} className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm">
              ✓ Submit Subjects
            </button>
          </div>
        </>
      )}

      {/* ── CREATE CLASS MODAL ── */}
      {showCreateClass && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowCreateClass(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl z-50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-slate-800">Create Class</h3>
              <button onClick={() => setShowCreateClass(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <label className="block text-xs text-slate-500 font-semibold mb-1">Class Name *</label>
            <input
              value={newClassName}
              onChange={e => setNewClassName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 mb-4"
              placeholder="e.g. Grade 10"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowCreateClass(false)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm">Cancel</button>
              <button onClick={handleSaveClass} className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm">Save Class</button>
            </div>
          </div>
        </>
      )}

      {/* ── CREATE SECTION MODAL ── */}
      {showCreateSection && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowCreateSection(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl z-50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-slate-800">Create Section</h3>
              <button onClick={() => setShowCreateSection(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <label className="block text-xs text-slate-500 font-semibold mb-1">Section Name *</label>
            <input
              value={newSectionName}
              onChange={e => setNewSectionName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500 mb-4"
              placeholder="e.g. Section A"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowCreateSection(false)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm">Cancel</button>
              <button onClick={handleSaveSection} className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm">Save Section</button>
            </div>
          </div>
        </>
      )}

      {/* ── ADD CLASS SECTION MODAL ── */}
      {showAddClassSection && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowAddClassSection(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-slate-800">Add Class Section</h3>
              <button onClick={() => setShowAddClassSection(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveClassSection} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs text-slate-500 font-semibold mb-1">Academic Year *</label>
                <select value={csForm.academicYear} onChange={e => setCsForm({...csForm, academicYear: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none">
                  <option>2025-2026</option><option>2026-2027</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 font-semibold mb-1">Class *</label>
                <select value={csForm.className} onChange={e => setCsForm({...csForm, className: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none">
                  <option>Grade 8</option><option>Grade 9</option><option>Grade 10</option><option>Grade 11</option><option>Grade 12</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 font-semibold mb-1">Section *</label>
                <select value={csForm.section} onChange={e => setCsForm({...csForm, section: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none">
                  <option>Section A</option><option>Section B</option><option>Section C</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 font-semibold mb-1">Class Strength</label>
                <input type="number" value={csForm.strength} onChange={e => setCsForm({...csForm, strength: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none" placeholder="e.g. 40" />
              </div>
              <div className="flex gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddClassSection(false)} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm">Create Section</button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ── IMPORT TEACHERS MODAL ── */}
      {showImportTeachers && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowImportTeachers(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-slate-800">Import Teachers via CSV</h3>
              <button onClick={() => setShowImportTeachers(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"><X className="w-5 h-5" /></button>
            </div>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center mb-4 hover:border-blue-400 transition-colors cursor-pointer">
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">Drag &amp; drop CSV file here</p>
              <p className="text-xs text-slate-400 mt-1">or click to browse</p>
            </div>
            <p className="text-xs text-slate-400 text-center mb-4">CSV columns: First Name, Last Name, Email, Phone, Gender, DOB, Qualification, Joining Date, Basic Salary, Subject, Skill Level</p>
            <button onClick={() => { alert('Import functionality requires backend integration'); setShowImportTeachers(false); }} className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm">
              Upload &amp; Import
            </button>
          </div>
        </>
      )}


    </div>
  );
}
