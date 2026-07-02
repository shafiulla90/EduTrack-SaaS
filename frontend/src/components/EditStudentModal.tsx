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
    rollNo: student.rollNo,
    name: student.name,
    email: student.email,
    phone: student.phone,
    class: student.class,
    section: student.section,
    fatherName: student.fatherName,
    motherName: student.motherName,
    aadharNo: student.aadharNo,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setFormData({
      rollNo: student.rollNo,
      name: student.name,
      email: student.email,
      phone: student.phone,
      class: student.class,
      section: student.section,
      fatherName: student.fatherName,
      motherName: student.motherName,
      aadharNo: student.aadharNo,
    });
  }, [student]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      setError(err.response?.data?.message || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-700 transition"
        >
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Edit Student</h2>
        {error && (
          <div className="mb-4 p-2 bg-rose-100 text-rose-800 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          {/* Personal Info */}
          <input
            name="rollNo"
            value={formData.rollNo}
            onChange={handleChange}
            placeholder="Roll No"
            className="border border-slate-200 rounded px-3 py-2"
            required
          />
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Student Name"
            className="border border-slate-200 rounded px-3 py-2"
            required
          />
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="border border-slate-200 rounded px-3 py-2"
          />
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="border border-slate-200 rounded px-3 py-2"
          />
          {/* Academic Info */}
          <input
            name="class"
            value={formData.class}
            onChange={handleChange}
            placeholder="Class"
            className="border border-slate-200 rounded px-3 py-2"
          />
          <input
            name="section"
            value={formData.section}
            onChange={handleChange}
            placeholder="Section"
            className="border border-slate-200 rounded px-3 py-2"
          />
          {/* Parent Info */}
          <input
            name="fatherName"
            value={formData.fatherName}
            onChange={handleChange}
            placeholder="Father Name"
            className="border border-slate-200 rounded px-3 py-2"
          />
          <input
            name="motherName"
            value={formData.motherName}
            onChange={handleChange}
            placeholder="Mother Name"
            className="border border-slate-200 rounded px-3 py-2"
          />
          <input
            name="aadharNo"
            value={formData.aadharNo}
            onChange={handleChange}
            placeholder="Aadhar No"
            className="border border-slate-200 rounded px-3 py-2"
          />
          <div className="flex items-center gap-4 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#2E5BFF] text-white rounded px-4 py-2 hover:bg-[#254EDB] transition"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-200 text-slate-800 rounded px-4 py-2 hover:bg-slate-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
