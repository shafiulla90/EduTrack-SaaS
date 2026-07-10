'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { BookOpen, Calendar, Plus, Trash2, Edit3, X, CheckCircle2, ChevronRight, FileText } from 'lucide-react';

export default function HomeworkPage() {
  const [homeworks, setHomeworks] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHomework, setEditingHomework] = useState<any | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [classSectionId, setClassSectionId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [maxMarks, setMaxMarks] = useState('100');
  const [allowLateSubmission, setAllowLateSubmission] = useState(false);
  const [assignmentType, setAssignmentType] = useState('Homework');

  async function loadData() {
    try {
      const [hwRes, clsRes] = await Promise.all([
        api.get('/teacher-portal/homework'),
        api.get('/teacher-portal/classes'),
      ]);
      setHomeworks(hwRes.data);
      setClasses(clsRes.data);
    } catch (err) {
      console.error('Failed to load homework data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingHomework(null);
    setTitle('');
    setDescription('');
    setDueDate('');
    setClassSectionId('');
    setSubjectId('');
    setMaxMarks('100');
    setAllowLateSubmission(false);
    setAssignmentType('Homework');
    setIsModalOpen(true);
  };

  const openEditModal = (hw: any) => {
    setEditingHomework(hw);
    setTitle(hw.title);
    setDescription(hw.description);
    setDueDate(hw.dueDate.split('T')[0]);
    setClassSectionId(hw.classSectionId);
    setSubjectId(hw.subjectId);
    setMaxMarks(String(hw.maxMarks));
    setAllowLateSubmission(hw.allowLateSubmission);
    setAssignmentType(hw.assignmentType);
    setIsModalOpen(true);
  };

  const handleClassChange = (val: string) => {
    setClassSectionId(val);
    const cls = classes.find(c => c.classSectionId === val);
    if (cls) {
      setSubjectId(cls.subjectId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Find subject name for payload notification template
    const cls = classes.find(c => c.classSectionId === classSectionId);
    const subjectName = cls ? cls.subjectName : 'Assignment';

    const payload = {
      title,
      description,
      dueDate,
      classSectionId,
      subjectId,
      subjectName,
      maxMarks: parseFloat(maxMarks),
      allowLateSubmission,
      assignmentType,
      status: 'Published',
    };

    try {
      if (editingHomework) {
        await api.put(`/teacher-portal/homework/${editingHomework.id}`, payload);
      } else {
        await api.post('/teacher-portal/homework', payload);
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to save homework:', err);
      alert('Failed to save assignment. Verify input details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this homework?')) return;
    try {
      await api.delete(`/teacher-portal/homework/${id}`);
      await loadData();
    } catch (err) {
      console.error('Failed to delete homework:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-t-[#2E5BFF] border-slate-200 rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Loading assignments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md mx-auto sm:max-w-none pb-20">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[#2E5BFF]" />
          Homework & Assignments
        </h2>
        <button
          onClick={openCreateModal}
          className="p-2.5 bg-[#2E5BFF] hover:bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Homework
        </button>
      </div>

      {homeworks.length === 0 ? (
        <div className="bg-white p-8 text-center rounded-3xl border border-slate-200 shadow-sm text-slate-500 italic text-sm">
          No homework assignments created yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {homeworks.map((hw) => (
            <div key={hw.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase border ${
                    hw.assignmentType === 'Quiz' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                    hw.assignmentType === 'Project' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-blue-50 text-[#2E5BFF] border-blue-100'
                  }`}>
                    {hw.assignmentType}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(hw)} className="text-slate-400 hover:text-blue-600 transition-colors p-1 cursor-pointer">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(hw.id)} className="text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-800 text-[15px]">{hw.title}</h3>
                <p className="text-xs text-slate-500 font-light leading-relaxed truncate-3-lines">{hw.description}</p>
              </div>

              <div className="border-t border-slate-100 pt-3 flex flex-wrap gap-y-2 justify-between items-center text-[11px] text-slate-400 font-semibold">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Due: {hw.dueDate.split('T')[0]}
                </span>
                <span className="bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded text-slate-500 font-mono">
                  {hw.classSection.class.name} - {hw.classSection.section.name} • {hw.subject.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-end z-[100] transition-opacity animate-in">
          <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl relative overflow-hidden animate-slide-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-900 text-lg leading-none">
                {editingHomework ? 'Modify Assignment' : 'Create Assignment'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chapter 4 Calculus exercises"
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2E5BFF] text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Draft details and instructions..."
                  rows={4}
                  className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2E5BFF] text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Class Section</label>
                <select
                  value={classSectionId}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2E5BFF] text-sm"
                  required
                >
                  <option value="">Select Class Section...</option>
                  {classes.map(c => <option key={c.classSectionId} value={c.classSectionId}>{c.className} ({c.subjectName})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Assignment Type</label>
                  <select
                    value={assignmentType}
                    onChange={(e) => setAssignmentType(e.target.value)}
                    className="block w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2E5BFF] text-sm"
                  >
                    <option value="Homework">Homework</option>
                    <option value="Project">Project</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Assignment">Assignment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Max Marks</label>
                  <input
                    type="number"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2E5BFF] text-sm font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2E5BFF] text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="allowLate"
                  checked={allowLateSubmission}
                  onChange={(e) => setAllowLateSubmission(e.target.checked)}
                  className="rounded border-slate-350 text-[#2E5BFF] focus:ring-[#2E5BFF] w-4.5 h-4.5"
                />
                <label htmlFor="allowLate" className="text-xs font-bold text-slate-600">Allow Late Submissions</label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#2E5BFF] hover:bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-50 mt-4"
              >
                {submitting ? 'Saving...' : 'Publish Assignment'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
