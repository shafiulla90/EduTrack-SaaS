'use client';

import React, { useState, useEffect } from 'react';
import { 
  Award, FileText, CheckCircle, Save, Plus, ArrowRight, X,
  PlusCircle, MinusCircle, Info, TrendingUp, Sparkles, RefreshCw
} from 'lucide-react';
import { api } from '@/lib/api';

type ClassSectionOption = {
  value: string;
  label: string;
  classId: string;
  sectionId: string;
};

type SubjectOption = {
  id: string;
  name: string;
  maxMarks: number;
  icon: string;
};

type StudentMarkRow = {
  studentId: string;
  name: string;
  rollNo: string;
  hasMarks: boolean;
  marksObtained: number | null;
  remarks?: string;
};

export default function ExamsAndMarksPage() {
  // Metadata options
  const [classes, setClasses] = useState<ClassSectionOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [examTypes, setExamTypes] = useState<string[]>([]);

  // Selection states
  const [selectedClassSectionId, setSelectedClassSectionId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedExamName, setSelectedExamName] = useState('');

  // Roster & marks list
  const [roster, setRoster] = useState<StudentMarkRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

      const subRes = await api.get('/exams/subjects');
      setSubjects(subRes.data);
      if (subRes.data.length > 0) {
        setSelectedSubjectId(subRes.data[0].id);
      }

      const typeRes = await api.get('/exams/exam-types');
      setExamTypes(typeRes.data);
      if (typeRes.data.length > 0) {
        setSelectedExamName(typeRes.data[0]);
      }
    } catch (err: any) {
      console.error('Error fetching exams metadata:', err);
      setErrorMsg('Failed to load class, subject, or exam metadata.');
    }
  };

  useEffect(() => {
    if (selectedClassSectionId && selectedSubjectId && selectedExamName) {
      fetchRoster();
    }
  }, [selectedClassSectionId, selectedSubjectId, selectedExamName]);

  const fetchRoster = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get(
        `/exams/marks-entry?classSectionId=${selectedClassSectionId}&subjectId=${selectedSubjectId}&examName=${encodeURIComponent(
          selectedExamName
        )}`
      );
      setRoster(res.data);
    } catch (err: any) {
      console.error('Error fetching marks entry list:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to load students roster for mark entry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScoreChange = (studentId: string, valStr: string) => {
    const valNum = valStr === '' ? null : Number(valStr);
    const val = valNum === null ? null : isNaN(valNum) ? 0 : Math.min(100, Math.max(0, valNum));
    
    setRoster(prev =>
      prev.map(item =>
        item.studentId === studentId ? { ...item, marksObtained: val } : item
      )
    );
  };

  const handleIncrement = (studentId: string) => {
    setRoster(prev =>
      prev.map(item => {
        if (item.studentId === studentId) {
          const cur = item.marksObtained === null ? 0 : item.marksObtained;
          return { ...item, marksObtained: Math.min(100, cur + 1) };
        }
        return item;
      })
    );
  };

  const handleDecrement = (studentId: string) => {
    setRoster(prev =>
      prev.map(item => {
        if (item.studentId === studentId) {
          const cur = item.marksObtained === null ? 0 : item.marksObtained;
          return { ...item, marksObtained: Math.max(0, cur - 1) };
        }
        return item;
      })
    );
  };

  const handleSaveMarks = async () => {
    setErrorMsg('');
    setSaveSuccess(false);
    try {
      const marksPayload = roster.map(item => ({
        studentId: item.studentId,
        marksObtained: item.marksObtained === null ? 0 : item.marksObtained,
        remarks: item.remarks || '',
      }));

      await api.post('/exams/save-marks', {
        marks: marksPayload,
        examName: selectedExamName,
        classSectionId: selectedClassSectionId,
        subjectId: selectedSubjectId,
      });

      setSaveSuccess(true);
      fetchRoster();
      setTimeout(() => {
        setSaveSuccess(false);
      }, 5000);
    } catch (err: any) {
      console.error('Error saving marks:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to save scoresheet.');
    }
  };

  // Grade badge calculator
  const getGradeInfo = (score: number | null) => {
    if (score === null) return { letter: '—', color: 'bg-slate-50 text-slate-400 border-slate-200' };
    if (score >= 90) return { letter: 'A+', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
    if (score >= 80) return { letter: 'A', color: 'bg-emerald-50 text-emerald-500 border-emerald-100' };
    if (score >= 70) return { letter: 'B', color: 'bg-blue-50 text-[#2E5BFF] border-blue-100' };
    if (score >= 60) return { letter: 'C', color: 'bg-slate-50 text-slate-600 border-slate-200' };
    if (score >= 50) return { letter: 'D', color: 'bg-amber-50 text-amber-600 border-amber-100' };
    return { letter: 'F', color: 'bg-rose-50 text-rose-600 border-rose-100' };
  };

  // Compute stats
  const validScores = roster
    .map(r => r.marksObtained)
    .filter((s): s is number => s !== null);

  const classAverage = validScores.length > 0
    ? Math.round(validScores.reduce((sum, val) => sum + val, 0) / validScores.length)
    : 0;

  const highestMarks = validScores.length > 0 ? Math.max(...validScores) : 0;

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-[28px] font-bold text-slate-900 leading-none">
            Enter Student Marks
          </h2>
          <p className="text-slate-500 text-[13px] font-medium mt-2">
            Grade and evaluate student performance in specific examinations.
          </p>
        </div>
        <button
          onClick={handleSaveMarks}
          disabled={roster.length === 0 || isLoading}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-semibold text-[13px] flex items-center gap-2 shadow-xs transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Scoresheet
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-3 text-sm">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">Scoresheet updated. Ranks and average matrices compiled successfully.</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 text-sm">
          <X className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Selectors card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
          <div>
            <label className="block text-slate-400 mb-1.5 uppercase tracking-wider">Select Class & Section</label>
            <select
              value={selectedClassSectionId}
              onChange={(e) => setSelectedClassSectionId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold outline-none"
            >
              {classes.map((cls) => (
                <option key={cls.value} value={cls.value}>
                  {cls.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-400 mb-1.5 uppercase tracking-wider">Select Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold outline-none"
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-400 mb-1.5 uppercase tracking-wider">Select Exam Term</label>
            <select
              value={selectedExamName}
              onChange={(e) => setSelectedExamName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 font-bold outline-none"
            >
              {examTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Class Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2E5BFF] flex items-center justify-center font-extrabold">
            📈
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class Average</span>
            <span className="text-xl font-extrabold text-slate-850 block mt-0.5">{classAverage}%</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold">
            🏆
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Highest Score</span>
            <span className="text-xl font-extrabold text-slate-850 block mt-0.5">{highestMarks}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-extrabold">
            ✅
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Roster Entries</span>
            <span className="text-xl font-extrabold text-slate-850 block mt-0.5">{roster.length} Students</span>
          </div>
        </div>
      </div>

      {/* Matrix Score table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-700">
            Scoring Matrix: {subjects.find(s => s.id === selectedSubjectId)?.name || 'Subject'} — Max Marks: 100
          </h3>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {classes.find(c => c.value === selectedClassSectionId)?.label || ''} · {selectedExamName}
          </span>
        </div>

        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <span className="text-xs font-semibold">Loading student list...</span>
            </div>
          ) : roster.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs font-semibold">
              No students enrolled in the selected class and section.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4" style={{ width: '150px' }}>Roll Number</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4 text-center" style={{ width: '220px' }}>Score Obtained</th>
                  <th className="px-6 py-4 text-right">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-650 font-semibold">
                {roster.map((s) => {
                  const mark = s.marksObtained;
                  const gr = getGradeInfo(mark);
                  return (
                    <tr key={s.studentId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-500">{s.rollNo}</td>
                      <td className="px-6 py-4 font-bold text-slate-800 text-sm leading-tight">{s.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleDecrement(s.studentId)}
                            className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 hover:text-rose-600"
                          >
                            <MinusCircle className="w-4.5 h-4.5 text-slate-450" />
                          </button>
                          
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={mark === null ? '' : mark}
                            onChange={(e) => handleScoreChange(s.studentId, e.target.value)}
                            className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-center font-mono text-xs text-slate-800 font-extrabold focus:outline-none focus:border-blue-600"
                          />
                          
                          <button
                            onClick={() => handleIncrement(s.studentId)}
                            className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 hover:text-emerald-600"
                          >
                            <PlusCircle className="w-4.5 h-4.5 text-slate-450" />
                          </button>

                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${gr.color}`}>
                            {gr.letter}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <input
                          type="text"
                          placeholder="Add remark..."
                          value={s.remarks || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRoster(prev =>
                              prev.map(item =>
                                item.studentId === s.studentId ? { ...item, remarks: val } : item
                              )
                            );
                          }}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs text-slate-700 w-44 font-semibold focus:outline-none focus:border-blue-600"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
