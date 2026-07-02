import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { updateStudent } from '@/lib/api';

interface EditStudentModalProps {
  student: {
    id: string;
    rollNo: string;
    name: string;
    email: string;
    phone: string;
    class: string;
    section: string;
    fatherName: string;
    motherName: string;
    aadharNo: string;
  };
  onClose: () => void;
  onSave: () => void;
}

export default function EditStudentModal({ student, onClose, onSave }: EditStudentModalProps) {
  const [formData, setFormData] = useState({
    rollNo: student.rollNo || '',
    name: student.name || '',
    email: student.email || '',
    phone: student.phone || '',
    fatherName: student.fatherName || '',
    motherName: student.motherName || '',
    aadharNo: student.aadharNo || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData({
      rollNo: student.rollNo || '',
      name: student.name || '',
      email: student.email || '',
      phone: student.phone || '',
      fatherName: student.fatherName || '',
      motherName: student.motherName || '',
      aadharNo: student.aadharNo || '',
    });
    setError('');
  }, [student]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await updateStudent(student.id, formData);
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update student details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl p-6 md:p-8 animate-fade-in border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition p-1.5 rounded-full hover:bg-slate-100"
        >
          <X size={20} />
        </button>
        
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-950">Edit Student Profile</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">Update the student's personal and parent details.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold rounded-xl leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Academic Info (Read-Only) & Roll Number */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Class</label>
              <input
                value={student.class}
                disabled
                className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-xl px-3.5 py-2 text-xs font-semibold cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">Section</label>
              <input
                value={student.section.replace('Section ', '')}
                disabled
                className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-xl px-3.5 py-2 text-xs font-semibold cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Roll Number</label>
              <input
                name="rollNo"
                value={formData.rollNo}
                onChange={handleChange}
                placeholder="Roll No"
                className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:border-[#2E5BFF] focus:ring-2 focus:ring-blue-100 transition-all"
                required
              />
            </div>
          </div>

          {/* Section 2: Personal Details */}
          <div>
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Student Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Student Name"
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:border-[#2E5BFF] focus:ring-2 focus:ring-blue-100 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:border-[#2E5BFF] focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit number"
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:border-[#2E5BFF] focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">National Aadhar Number</label>
                <input
                  name="aadharNo"
                  value={formData.aadharNo}
                  onChange={handleChange}
                  placeholder="Aadhar Number"
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:border-[#2E5BFF] focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Parent Info */}
          <div>
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">Parent Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Father's Name</label>
                <input
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  placeholder="Father's Name"
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:border-[#2E5BFF] focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">Mother's Name</label>
                <input
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleChange}
                  placeholder="Mother's Name"
                  className="w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold focus:outline-none focus:border-[#2E5BFF] focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 text-xs font-bold transition-all min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-[#2E5BFF] hover:bg-[#254EDB] text-white text-xs font-extrabold transition-all min-h-[44px] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
