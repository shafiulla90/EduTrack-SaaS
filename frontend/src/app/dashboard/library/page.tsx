'use client';

import React, { useState } from 'react';
import { Library, BookOpen, UserPlus, CheckCircle, Save, Plus, ArrowLeftRight } from 'lucide-react';
import { mockBooks, mockStudents } from '@/lib/mockData';

export default function LibraryCatalogPage() {
  const [activeTab, setActiveTab] = useState<'catalog' | 'issue'>('catalog');
  const [books, setBooks] = useState(mockBooks);
  const [successToast, setSuccessToast] = useState(false);

  // Issue Book State Form
  const [selectedBook, setSelectedBook] = useState('bk-1');
  const [selectedStudent, setSelectedStudent] = useState('student-uuid-1');
  const [returnDate, setReturnDate] = useState('2026-07-02');

  const [loans, setLoans] = useState([
    { id: 'loan-1', title: 'Foundation Physics', student: 'James Smith', roll: '10001', date: '2026-06-10', status: 'Issued' },
    { id: 'loan-2', title: 'Calculus Volume 1', student: 'Patricia Garcia', roll: '10004', date: '2026-06-12', status: 'Issued' },
  ]);

  const handleIssueBook = (e: React.FormEvent) => {
    e.preventDefault();
    const bk = books.find((b) => b.id === selectedBook);
    const stud = mockStudents.find((s) => s.id === selectedStudent);
    if (!bk || !stud) return;

    if (bk.available === 0) {
      alert('This book is currently out of stock!');
      return;
    }

    // Decrement availability
    bk.available -= 1;

    // Add loan
    const newLoan = {
      id: `loan-${loans.length + 1}`,
      title: bk.title,
      student: stud.name,
      roll: stud.rollNo,
      date: new Date().toISOString().split('T')[0],
      status: 'Issued'
    };

    setLoans([newLoan, ...loans]);
    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      setActiveTab('catalog');
    }, 3000);
  };

  return (
    <div className="space-y-8 relative">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Library Catalog & Loans
          </h1>
          <p className="text-slate-400 text-sm font-light mt-1">
            Manage books metadata directories, check student loan cards, and track checkout registers.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-900 gap-6 text-sm">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-4 font-bold transition-all border-b-2 ${
            activeTab === 'catalog' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Book Directory
        </button>
        <button
          onClick={() => setActiveTab('issue')}
          className={`pb-4 font-bold transition-all border-b-2 ${
            activeTab === 'issue' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Issue Book / Loan Card
        </button>
      </div>

      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-3 text-sm animate-pulse">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Book issued to student card. Database loan registers updated.</span>
        </div>
      )}

      {/* Renders Tab Content */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Books List table */}
          <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden shadow-xl h-fit">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900/60 bg-slate-900/10 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Title / Author</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">ISBN</th>
                  <th className="px-6 py-4 text-right">Available</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 text-slate-300 text-sm">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-900/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-200">
                      <div>{book.title}</div>
                      <div className="text-xs text-slate-500 font-light">by {book.author}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">{book.category}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{book.isbn}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        book.available > 0 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {book.available} / {book.total} Left
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Active borrowing cards log */}
          <div className="glass-panel p-6 rounded-2xl shadow-xl h-fit space-y-4">
            <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-brand-400" />
              Active Checkouts Log
            </h3>
            <div className="divide-y divide-slate-900/60">
              {loans.map((loan) => (
                <div key={loan.id} className="py-3 flex justify-between items-start gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{loan.title}</p>
                    <p className="text-[10px] text-slate-500 font-light mt-0.5">
                      Student: {loan.student} (Roll: {loan.roll})
                    </p>
                  </div>
                  <span className="text-[9px] font-semibold text-brand-300 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-full">
                    {loan.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'issue' && (
        <div className="max-w-xl glass-panel p-6 rounded-2xl shadow-xl">
          <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-400" />
            Checkout Library Loan
          </h3>

          <form onSubmit={handleIssueBook} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 font-semibold mb-1">Select Book Title</label>
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none"
              >
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} (by {b.author}) - {b.available} copies available
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 font-semibold mb-1">Assign to Student Roll</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none"
              >
                {mockStudents.slice(0, 30).map((s) => (
                  <option key={s.id} value={s.id}>
                    Roll {s.rollNo}: {s.name} ({s.class})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-400 font-semibold mb-1">Return Due Date</label>
              <input
                type="date"
                required
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-brand-500/10"
            >
              Issue Book & Record Loan
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
