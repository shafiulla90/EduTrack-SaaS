import React, { useState } from 'react';
import { X, Edit2 } from 'lucide-react';
import { updateStudent } from '@/lib/api';
import { useToast } from '@/components/Toast';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  fatherName: string;
  motherName: string;
  aadharNo: string;
  rollNo: string;
  // other fields omitted for brevity
}

interface EditStudentModalProps {
  student: Student;
  onClose: () => void;
  onSave: () => void; // caller will refresh list
}

export default function EditStudentModal({ student, onClose, onSave }: EditStudentModalProps) {
  const { showToast } = useToast();
  const [name, setName] = useState(student.name);
  const [email, setEmail] = useState(student.email);
  const [phone, setPhone] = useState(student.phone);
  const [fatherName, setFatherName] = useState(student.fatherName);
  const [motherName, setMotherName] = useState(student.motherName);
  const [aadharNo, setAadharNo] = useState(student.aadharNo);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStudent(student.id, {
        name,
        email,
        phone,
        fatherName,
        motherName,
        aadharNo,
      });
      showToast('Student details updated successfully.', 'success');
      onSave();
    } catch (err: any) {
      console.error('Update failed', err);
      showToast(err.response?.data?.message || 'Failed to update student.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-xl shadow-lg w-full max-w-xl p-6 relative animate-in" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Edit2 className="w-6 h-6 text-blue-600" /> Edit Student
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Name</label>
              <input
                type="text"
                className="mt-1 block w-full rounded border border-slate-300 text-sm bg-white text-slate-900 focus:border-blue-500 focus:ring-blue-500"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Roll No</label>
              <input
                type="text"
                className="mt-1 block w-full rounded border border-slate-300 text-sm bg-white text-slate-900 focus:border-blue-500 focus:ring-blue-500"
                value={student.rollNo}
                disabled
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                className="mt-1 block w-full rounded border border-slate-300 text-sm bg-white text-slate-900 focus:border-blue-500 focus:ring-blue-500"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Phone</label>
              <input
                type="tel"
                className="mt-1 block w-full rounded border border-slate-300 text-sm bg-white text-slate-900 focus:border-blue-500 focus:ring-blue-500"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Father Name</label>
              <input
                type="text"
                className="mt-1 block w-full rounded border border-slate-300 text-sm bg-white text-slate-900 focus:border-blue-500 focus:ring-blue-5   00"
                value={fatherName}
                onChange={e => setFatherName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Mother Name</label>
              <input
                type="text"
                className="mt-1 block w-full rounded border border-slate-300 text-sm bg-white text-slate-900 focus:border-blue-500 focus:ring-blue-500"
                value={motherName}
                onChange={e => setMotherName(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Aadhar No</label>
            <input
              type="text"
              className="mt-1 block w-full rounded border border-slate-300 text-sm bg-white text-slate-900 focus:border-blue-500 focus:ring-blue-500"
              value={aadharNo}
              onChange={e => setAadharNo(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
