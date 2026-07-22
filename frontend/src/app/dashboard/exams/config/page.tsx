'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import {
  Settings2, Plus, Trash2, Save, CheckCircle, AlertCircle,
  ChevronDown, GraduationCap, BarChart3, Info, X,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface GradeRange {
  min: number;
  max: number;
  grade: string;
  gpa: number;
  label: string;
}

interface ExamConfigEntry {
  id: string;
  examTypeName: string | null;
  isGlobal: boolean;
  passingPercentage: number;
  maxMarks: number;
  gradeRanges: GradeRange[];
  updatedAt: string;
}

const DEFAULT_GRADE_RANGES: GradeRange[] = [
  { min: 90, max: 100, grade: 'A+', gpa: 10, label: 'Outstanding' },
  { min: 80, max: 89,  grade: 'A',  gpa: 9,  label: 'Excellent'   },
  { min: 70, max: 79,  grade: 'B+', gpa: 8,  label: 'Very Good'   },
  { min: 60, max: 69,  grade: 'B',  gpa: 7,  label: 'Good'        },
  { min: 50, max: 59,  grade: 'C',  gpa: 6,  label: 'Average'     },
  { min: 35, max: 49,  grade: 'D',  gpa: 5,  label: 'Below Avg'   },
  { min: 0,  max: 34,  grade: 'F',  gpa: 0,  label: 'Fail'        },
];

// ── Grade Ranges Editor ───────────────────────────────────────────────────────
function GradeRangesEditor({
  ranges, onChange,
}: {
  ranges: GradeRange[];
  onChange: (r: GradeRange[]) => void;
}) {
  const update = (idx: number, field: keyof GradeRange, val: string | number) => {
    const next = [...ranges];
    (next[idx] as any)[field] = field === 'grade' || field === 'label' ? val : Number(val);
    onChange(next);
  };

  return (
    <div className="space-y-1.5">
      <div className="grid grid-cols-5 gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 px-1">
        <span>Min%</span><span>Max%</span><span>Grade</span><span>GPA</span><span>Label</span>
      </div>
      {ranges.map((r, i) => (
        <div key={i} className="grid grid-cols-5 gap-1.5">
          {(['min', 'max', 'grade', 'gpa', 'label'] as const).map(f => (
            <input
              key={f}
              type={f === 'grade' || f === 'label' ? 'text' : 'number'}
              value={r[f]}
              onChange={e => update(i, f, e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-[#2E5BFF]"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Config Card ───────────────────────────────────────────────────────────────
function ConfigCard({
  entry,
  examTypes,
  onSave,
  onDelete,
}: {
  entry: ExamConfigEntry;
  examTypes: string[];
  onSave: (id: string, data: Partial<ExamConfigEntry>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [passPct, setPassPct] = useState(entry.passingPercentage);
  const [maxMarks, setMaxMarks] = useState(entry.maxMarks);
  const [ranges, setRanges] = useState<GradeRange[]>(entry.gradeRanges ?? DEFAULT_GRADE_RANGES);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(entry.id, {
        examTypeName: entry.examTypeName,
        passingPercentage: passPct,
        maxMarks,
        gradeRanges: ranges,
      });
      setMsg('Saved!');
      setTimeout(() => setMsg(''), 2000);
    } catch {
      setMsg('Save failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden transition-all ${
      entry.isGlobal ? 'border-[#2E5BFF]/40 shadow-md shadow-blue-500/10' : 'border-slate-200 shadow-sm'
    }`}>
      {/* Header row */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
      >
        <div className="flex items-center gap-3">
          {entry.isGlobal ? (
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-[#2E5BFF]" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-slate-500" />
            </div>
          )}
          <div>
            <span className="text-sm font-bold text-slate-800">
              {entry.isGlobal ? 'Global Default (All Exams)' : entry.examTypeName}
            </span>
            {entry.isGlobal && (
              <span className="ml-2 px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-600 text-[9px] font-bold rounded-lg uppercase tracking-wider">
                Fallback
              </span>
            )}
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
              Pass: <strong className="text-slate-700">{passPct}%</strong>
              &nbsp;·&nbsp;Max Marks: <strong className="text-slate-700">{maxMarks}</strong>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!entry.isGlobal && (
            <button
              onClick={e => { e.stopPropagation(); onDelete(entry.id); }}
              className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div className="border-t border-slate-100 px-5 py-5 space-y-5 bg-slate-50/30">
          {/* Pass % + Max Marks */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Passing Percentage (%)
              </label>
              <input
                type="number" min={0} max={100} step={1}
                value={passPct}
                onChange={e => setPassPct(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-[#2E5BFF] focus:ring-1 focus:ring-[#2E5BFF]/20"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                A score ≥ {passPct}% = PASS
              </p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Default Maximum Marks (Template)
              </label>
              <input
                type="number" min={1} max={1000} step={1}
                value={maxMarks}
                onChange={e => setMaxMarks(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-[#2E5BFF] focus:ring-1 focus:ring-[#2E5BFF]/20"
              />
            </div>
          </div>

          {/* Grade Ranges */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Grade Ranges
              </label>
              <button
                onClick={() => setRanges(DEFAULT_GRADE_RANGES)}
                className="text-[10px] text-[#2E5BFF] hover:underline font-semibold cursor-pointer"
              >
                Reset to Defaults
              </button>
            </div>
            <GradeRangesEditor ranges={ranges} onChange={setRanges} />
          </div>

          {/* Save button */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-[#2E5BFF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
            {msg && (
              <span className={`text-xs font-semibold flex items-center gap-1 ${
                msg === 'Saved!' ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {msg === 'Saved!' ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
                {msg}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ExamConfigPage() {
  const [configs, setConfigs] = useState<ExamConfigEntry[]>([]);
  const [examTypes, setExamTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddOverride, setShowAddOverride] = useState(false);
  const [newExamType, setNewExamType] = useState('');
  const [newPassPct, setNewPassPct] = useState(35);
  const [newMaxMarks, setNewMaxMarks] = useState(100);
  const [addMsg, setAddMsg] = useState('');
  const [components, setComponents] = useState<any[]>([]);
  const [newComponent, setNewComponent] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [cfgRes, typeRes, compRes] = await Promise.all([
        api.get('/exam-config'),
        api.get('/exams/exam-types'),
        api.get('/exam-config/components'),
      ]);
      setConfigs(cfgRes.data);
      setExamTypes(typeRes.data);
      setComponents(compRes.data);

      // Pre-select first unused exam type
      const usedTypes = new Set(cfgRes.data.map((c: ExamConfigEntry) => c.examTypeName).filter(Boolean));
      const unused = typeRes.data.find((t: string) => !usedTypes.has(t));
      if (unused) setNewExamType(unused);
    } catch (err) {
      console.error('Failed to load exam config:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAddComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComponent.trim()) return;
    try {
      await api.post('/exam-config/components', { name: newComponent.trim() });
      setNewComponent('');
      await fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add component');
    }
  };

  const handleDeleteComponent = async (id: string) => {
    if (!confirm('Delete this subject component type?')) return;
    try {
      await api.delete(`/exam-config/components/${id}`);
      await fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete component');
    }
  };

  const handleSave = async (_id: string, data: Partial<ExamConfigEntry>) => {
    await api.post('/exam-config', {
      examTypeName: data.examTypeName ?? null,
      passingPercentage: data.passingPercentage,
      maxMarks: data.maxMarks,
      gradeRanges: data.gradeRanges,
    });
    await fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this exam-specific configuration? The global default will be used as fallback.')) return;
    await api.delete(`/exam-config/${id}`);
    await fetchAll();
  };

  const handleAddOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddMsg('');
    if (!newExamType) { setAddMsg('Please select an exam type.'); return; }
    try {
      await api.post('/exam-config', {
        examTypeName: newExamType,
        passingPercentage: newPassPct,
        maxMarks: newMaxMarks,
        gradeRanges: null,
      });
      setShowAddOverride(false);
      setAddMsg('');
      await fetchAll();
    } catch (err: any) {
      setAddMsg(err.response?.data?.message || 'Failed to add override.');
    }
  };

  // Ensure global config entry exists in the list
  const globalEntry = configs.find(c => c.isGlobal);
  const examSpecific = configs.filter(c => !c.isGlobal);
  const usedTypes = new Set(examSpecific.map(c => c.examTypeName));
  const availableTypes = examTypes.filter(t => !usedTypes.has(t));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-t-[#2E5BFF] border-r-[#2E5BFF] border-b-transparent border-l-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-[28px] font-bold text-slate-900 leading-none flex items-center gap-2">
            <Settings2 className="w-7 h-7 text-[#2E5BFF]" />
            Exam Configuration
          </h2>
          <p className="text-slate-500 text-[13px] font-medium mt-2">
            Configure pass criteria, max marks, and grade ranges for each examination type.
          </p>
        </div>
        <button
          onClick={() => setShowAddOverride(true)}
          disabled={availableTypes.length === 0}
          className="px-4 py-2.5 rounded-xl bg-[#2E5BFF] hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Add Exam Override
        </button>
      </div>

      {/* Info callout */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-800">
        <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <p>
          <strong>How it works:</strong> If an exam-specific configuration exists, it is used. Otherwise the{' '}
          <strong>Global Default</strong> applies. Changing the pass percentage instantly updates PASS/FAIL
          status across the Teacher Portal and Parent Report Cards — no code changes needed.
        </p>
      </div>

      {/* Global Default */}
      <div className="space-y-2">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">
          Global Default Configuration
        </h3>
        {globalEntry ? (
          <ConfigCard
            key={globalEntry.id}
            entry={globalEntry}
            examTypes={examTypes}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        ) : (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-3">
            <p className="text-xs text-slate-500 font-medium">No global configuration yet. Using system default: <strong>35% pass</strong>, 100 max marks.</p>
            <button
              onClick={() => api.post('/exam-config', { examTypeName: null, passingPercentage: 35, maxMarks: 100 }).then(fetchAll)}
              className="px-4 py-2 bg-[#2E5BFF] text-white text-xs font-bold rounded-xl hover:bg-blue-600 cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Global Configuration
            </button>
          </div>
        )}
      </div>

      {/* Exam-specific overrides */}
      {examSpecific.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">
            Exam-Specific Overrides ({examSpecific.length})
          </h3>
          <div className="space-y-3">
            {examSpecific.map(entry => (
              <ConfigCard
                key={entry.id}
                entry={entry}
                examTypes={examTypes}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Subject Components */}
      <div className="space-y-4 pt-6 mt-6 border-t border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Subject Component Types</h3>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Define custom components (e.g. Theory, Practical, Viva, Lab) to apply different passing criteria within the same subject.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5">
          <form onSubmit={handleAddComponent} className="flex gap-3">
            <input 
              type="text" 
              placeholder="e.g. Practical"
              value={newComponent}
              onChange={e => setNewComponent(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-[#2E5BFF]"
            />
            <button type="submit" disabled={!newComponent.trim()} className="px-5 py-2.5 bg-[#2E5BFF] hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50 shadow-sm">
              Add Component
            </button>
          </form>

          {components.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {components.map(comp => (
                <div key={comp.id} className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-xs font-bold text-slate-700">{comp.name}</span>
                  <button onClick={() => handleDeleteComponent(comp.id)} className="p-1 hover:bg-rose-100 rounded-md text-slate-400 hover:text-rose-600 cursor-pointer transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Override Modal */}
      {showAddOverride && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl shadow-xl p-6 space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Add Exam-Specific Override</h3>
              <button onClick={() => setShowAddOverride(false)} className="p-1.5 hover:bg-slate-100 rounded-xl cursor-pointer">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {addMsg && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {addMsg}
              </div>
            )}

            <form onSubmit={handleAddOverride} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Exam Type
                </label>
                <select
                  value={newExamType}
                  onChange={e => setNewExamType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-[#2E5BFF]"
                >
                  <option value="">Select exam type...</option>
                  {availableTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Default Pass %</label>
                  <input type="number" min={0} max={100} value={newPassPct} onChange={e => setNewPassPct(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-[#2E5BFF]" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Default Max Marks</label>
                  <input type="number" min={1} max={1000} value={newMaxMarks} onChange={e => setNewMaxMarks(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-[#2E5BFF]" />
                </div>
              </div>
              <button type="submit"
                className="w-full py-2.5 bg-[#2E5BFF] hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                <Plus className="w-3.5 h-3.5" />
                Add Override
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
