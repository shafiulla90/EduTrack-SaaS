'use client';

import React, { useState } from 'react';
import { 
  Search, ArrowLeft, Plus, X, Phone, Mail, Award, Receipt, 
  CheckCircle, AlertTriangle, ChevronDown, ChevronUp, User, 
  MapPin, Calendar as CalendarIcon, DollarSign, BookOpen, ShieldAlert,
  Percent
} from 'lucide-react';
import { mockStudents, MockStudent, mockAcademicYears } from '@/lib/mockData';

// Dynamic mock details helper for students
function getStudentDetails(student: MockStudent) {
  // Determine if student has dues or discounts
  const hasDues = student.balanceDue > 0;
  const totalAllocated = student.paidAmount + student.balanceDue;
  
  // Custom mock data generated based on student id/info
  const products = [
    { id: 'prod-1', name: 'Tuition Fee (Annual)', price: totalAllocated * 0.7, grossTotal: totalAllocated * 0.7, discountPercent: 0, discountAmount: 0 },
    { id: 'prod-2', name: 'Exam Fee', price: totalAllocated * 0.1, grossTotal: totalAllocated * 0.1, discountPercent: 0, discountAmount: 0 },
    { id: 'prod-3', name: 'Lab & Computer Fees', price: totalAllocated * 0.15, grossTotal: totalAllocated * 0.15, discountPercent: 0, discountAmount: 0 },
    { id: 'prod-4', name: 'Sports & Cultural Activities', price: totalAllocated * 0.05, grossTotal: totalAllocated * 0.05, discountPercent: 0, discountAmount: 0 },
  ];

  // Invoices list
  const invoices = [
    { 
      id: `inv-${student.id}-1`, 
      date: '2026-06-05', 
      number: `INV-2026-${student.rollNo}-A`, 
      mode: 'PhonePe UPI', 
      amount: student.paidAmount, 
      status: student.paidAmount > 0 ? 'Paid' : 'Pending', 
      items: [
        { name: 'Tuition Fee (Term 1)', amount: student.paidAmount * 0.8 },
        { name: 'Exam Fee', amount: student.paidAmount * 0.2 }
      ]
    },
    { 
      id: `inv-${student.id}-2`, 
      date: '2026-06-12', 
      number: `INV-2026-${student.rollNo}-B`, 
      mode: student.balanceDue === 0 ? 'GPay UPI' : '—', 
      amount: student.balanceDue, 
      status: student.balanceDue === 0 ? 'Paid' : 'Pending', 
      items: [
        { name: 'Tuition Fee (Term 2)', amount: student.balanceDue }
      ]
    }
  ];

  // Exams list
  const exams = [
    {
      id: 'ex-1',
      name: 'Unit Test I',
      type: 'Unit Test',
      score: '88%',
      subjects: [
        { name: 'Mathematics', score: 92, max: 100 },
        { name: 'Physics', score: 85, max: 100 },
        { name: 'Chemistry', score: 88, max: 100 },
        { name: 'English', score: 87, max: 100 },
      ]
    },
    {
      id: 'ex-2',
      name: 'Quarterly Evaluation',
      type: 'Quarterly',
      score: '84%',
      subjects: [
        { name: 'Mathematics', score: 88, max: 100 },
        { name: 'Physics', score: 80, max: 100 },
        { name: 'Chemistry', score: 82, max: 100 },
        { name: 'English', score: 86, max: 100 },
      ]
    },
    {
      id: 'ex-3',
      name: 'Final Semester Examination',
      type: 'Final',
      score: '86%',
      subjects: [
        { name: 'Mathematics', score: 90, max: 100 },
        { name: 'Physics', score: 84, max: 100 },
        { name: 'Chemistry', score: 85, max: 100 },
        { name: 'English', score: 85, max: 100 },
      ]
    }
  ];

  // Disciplinary / Behavior Cases
  const cases = student.id.charCodeAt(student.id.length - 1) % 2 === 0 ? [] : [
    {
      id: 'case-1',
      type: 'Negative',
      typeIcon: '⚠️',
      subject: 'Late Submission of Physics Project',
      priority: 'Medium',
      status: 'Closed',
      date: '2026-06-10',
      description: 'Submitted term project 3 days past the final deadline. Deducted 5% marks and warned.'
    },
    {
      id: 'case-2',
      type: 'Positive',
      typeIcon: '⭐',
      subject: 'Outstanding Science Fair Coordinator',
      priority: 'Low',
      status: 'Open',
      date: '2026-06-15',
      description: 'Volunteered and excellently coordinated the class stalls for the science exposition.'
    }
  ];

  return { products, invoices, exams, cases };
}

export default function StudentsDirectory() {
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedYear, setSelectedYear] = useState('ay-1');
  
  // Selected student for Profile details (Full Page swap)
  const [activeStudent, setActiveStudent] = useState<MockStudent | null>(null);
  const [selectedExamTab, setSelectedExamTab] = useState<'Unit Test' | 'Quarterly' | 'Final'>('Unit Test');
  const [expandedInvoices, setExpandedInvoices] = useState<Record<string, boolean>>({});
  const [expandedExams, setExpandedExams] = useState<Record<string, boolean>>({});
  const [tempDiscount, setTempDiscount] = useState<number>(0);
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState<number>(0);

  // Filters calculation
  const filteredStudents = mockStudents.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(search.toLowerCase()) || 
                          student.rollNo.includes(search) ||
                          student.phone.includes(search) ||
                          student.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesClass = selectedClass === 'All' || student.class === selectedClass;
    const matchesSection = selectedSection === 'All' || student.section === selectedSection;

    return matchesSearch && matchesClass && matchesSection;
  });

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase();
    return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
  };

  // Switch to detail view and load details
  const handleViewDetails = (student: MockStudent) => {
    setActiveStudent(student);
    setExpandedInvoices({});
    setExpandedExams({ 'ex-1': true }); // default expand first exam
    setTempDiscount(0);
    setAppliedDiscountPercent(0);
  };

  const handleApplyDiscount = () => {
    if (tempDiscount < 0 || tempDiscount > 100) {
      alert('Please enter a valid percentage between 0 and 100.');
      return;
    }
    setAppliedDiscountPercent(tempDiscount);
    alert(`Success: Discount of ${tempDiscount}% applied to the current academic session fee.`);
  };

  const toggleInvoice = (id: string) => {
    setExpandedInvoices(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleExam = (id: string) => {
    setExpandedExams(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Detail rendering helpers
  const detailData = activeStudent ? getStudentDetails(activeStudent) : null;
  const isPaidClear = activeStudent ? activeStudent.balanceDue <= 0 : false;

  // Recalculated values based on discount
  const getRecalculatedFees = () => {
    if (!activeStudent || !detailData) return { list: [], subtotal: 0, discVal: 0, final: 0 };
    const baseTotal = activeStudent.paidAmount + activeStudent.balanceDue;
    const discAmt = baseTotal * (appliedDiscountPercent / 100);
    const finalVal = baseTotal - discAmt;

    const list = detailData.products.map(p => {
      const price = p.price;
      const discountAmount = price * (appliedDiscountPercent / 100);
      const netTotal = price - discountAmount;
      return {
        ...p,
        discountAmount,
        netTotal
      };
    });

    return {
      list,
      subtotal: baseTotal,
      discVal: discAmt,
      final: finalVal
    };
  };

  const recFees = getRecalculatedFees();

  return (
    <div className="space-y-6 animate-in">
      {!activeStudent ? (
        /* ================= LIST VIEW ================= */
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-[28px] font-bold text-slate-900 leading-none">
                Student Directory
              </h2>
              <p className="text-slate-500 text-[13px] font-medium mt-2">
                Browse through student files, view account ledgers, and check parent assignments.
              </p>
            </div>
            <div className="text-slate-500 text-[12px] font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
              Total Records Staged: <span className="text-[#2E5BFF] font-extrabold">{mockStudents.length}</span>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative flex items-center bg-white border border-slate-200 rounded-xl px-4 py-2 focus-within:border-[#2E5BFF] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Search by Name, roll number, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none text-[13px] font-medium text-slate-800 outline-none w-full placeholder-slate-400"
              />
            </div>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[13px] font-semibold text-slate-700 focus:outline-none focus:border-[#2E5BFF] shadow-xs"
            >
              <option value="All">All Grades</option>
              <option>Grade 10</option>
              <option>Grade 9</option>
              <option>Grade 8</option>
              <option>Grade 11</option>
              <option>Grade 12</option>
            </select>

            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-[13px] font-semibold text-slate-700 focus:outline-none focus:border-[#2E5BFF] shadow-xs"
            >
              <option value="All">All Sections</option>
              <option>Section A</option>
              <option>Section B</option>
            </select>
          </div>

          {/* Directory Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Roll No</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Class / Section</th>
                    <th className="px-6 py-4">Parent Guardian</th>
                    <th className="px-6 py-4">Financial Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[13px] text-slate-600 font-medium">
                  {filteredStudents.slice(0, 30).map((student) => {
                    const hasDue = student.balanceDue > 0;
                    return (
                      <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-blue-600 font-bold">{student.rollNo}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{student.name}</div>
                          <div className="text-xs text-slate-400 font-medium mt-0.5">{student.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 text-xs font-semibold">
                            {student.class} - {student.section.replace('Section ', '')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-800 font-semibold">{student.fatherName}</div>
                          <div className="text-xs text-slate-400 font-medium mt-0.5">{student.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                            hasDue 
                              ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${hasDue ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            {hasDue ? 'Pending Due' : 'Paid Clear'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleViewDetails(student)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/30 transition-all text-xs font-bold"
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-light">
                        No matching student records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* ================= DETAIL VIEW ================= */
        <div className="space-y-6">
          {/* Header Back Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setActiveStudent(null)}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-[24px] font-extrabold text-slate-900 leading-none">
                  {activeStudent.name}
                </h2>
                <p className="text-slate-500 text-xs font-semibold mt-2">
                  Class: {activeStudent.class} | Section: {activeStudent.section}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                isPaidClear 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                  : 'bg-amber-50 text-amber-600 border-amber-200'
              }`}>
                {isPaidClear ? 'Financial Clear' : 'Outstanding Balances'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Personal Info & Contacts */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Bio & Address Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <User className="w-5 h-5 text-blue-500" />
                  <h3 className="text-base font-bold text-slate-800">Address & Demographic Information</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-semibold">Father Name</span>
                    <span className="text-slate-700 text-sm font-bold block mt-1">{activeStudent.fatherName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Mother Name</span>
                    <span className="text-slate-700 text-sm font-bold block mt-1">{activeStudent.motherName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Date of Birth</span>
                    <span className="text-slate-700 text-sm font-bold block mt-1">2011-04-12</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">National Aadhar Card</span>
                    <span className="text-slate-700 text-sm font-mono font-bold block mt-1">{activeStudent.aadharNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Mobile Number</span>
                    <span className="text-slate-700 text-sm font-bold block mt-1">{activeStudent.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Nationality</span>
                    <span className="text-slate-700 text-sm font-bold block mt-1">Indian</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block font-semibold">Permanent Address</span>
                    <span className="text-slate-700 text-sm font-bold block mt-1">
                      12, Shanti Nagar, Main Road, Bangalore, Karnataka - 560001
                    </span>
                  </div>
                </div>
              </div>

              {/* Fee Information Summary Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <DollarSign className="w-5 h-5 text-blue-500" />
                  <h3 className="text-base font-bold text-slate-800">Fee Information Summary</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Allocated Amt</span>
                    <span className="text-slate-800 text-lg font-extrabold block mt-1">₹{(activeStudent.paidAmount + activeStudent.balanceDue).toLocaleString()}</span>
                  </div>
                  <div className="p-4 bg-emerald-50/40 border border-emerald-100/50 rounded-xl">
                    <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider block">Total Paid</span>
                    <span className="text-emerald-700 text-lg font-extrabold block mt-1">₹{activeStudent.paidAmount.toLocaleString()}</span>
                  </div>
                  <div className="p-4 bg-amber-50/40 border border-amber-100/50 rounded-xl">
                    <span className="text-amber-600 text-[10px] font-bold uppercase tracking-wider block">Pending Bal</span>
                    <span className="text-amber-700 text-lg font-extrabold block mt-1">₹{activeStudent.balanceDue.toLocaleString()}</span>
                  </div>
                  <div className="p-4 bg-purple-50/40 border border-purple-100/50 rounded-xl">
                    <span className="text-purple-600 text-[10px] font-bold uppercase tracking-wider block">Discount Given</span>
                    <span className="text-purple-700 text-lg font-extrabold block mt-1">₹{recFees.discVal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Current Academic Year Fees Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-blue-500" />
                    <h3 className="text-base font-bold text-slate-800">Current Academic Year Fees</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 text-xs">
                      <span className="text-slate-500 mr-2">Disc %</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0"
                        value={tempDiscount}
                        onChange={(e) => setTempDiscount(Number(e.target.value))}
                        className="w-12 bg-transparent text-slate-800 font-bold outline-none text-right"
                      />
                    </div>
                    <button
                      onClick={handleApplyDiscount}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                    >
                      Save
                    </button>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 font-bold bg-white"
                    >
                      <option value="ay-1">2026-2027</option>
                      <option value="ay-2">2025-2026</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-4 py-3">Product / Fee Item</th>
                        <th className="px-4 py-3 text-right">Unit Price</th>
                        <th className="px-4 py-3 text-right">Total Amount</th>
                        <th className="px-4 py-3 text-right">Discount Amt</th>
                        <th className="px-4 py-3 text-right">Net Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                      {recFees.list.map((prod, idx) => (
                        <tr key={prod.id}>
                          <td className="px-4 py-3 font-semibold text-slate-750">{prod.name}</td>
                          <td className="px-4 py-3 text-right font-mono">₹{prod.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                          <td className="px-4 py-3 text-right font-mono">₹{prod.grossTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                          <td className="px-4 py-3 text-right font-mono text-purple-600">₹{prod.discountAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">₹{prod.netTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-bold text-slate-800">
                        <td className="px-4 py-3">Session Fee Subtotal (Before Disc)</td>
                        <td colSpan={3}></td>
                        <td className="px-4 py-3 text-right font-mono">₹{recFees.subtotal.toLocaleString()}</td>
                      </tr>
                      {appliedDiscountPercent > 0 && (
                        <tr className="font-bold text-purple-600">
                          <td className="px-4 py-3">Applied Batch Discount (-)</td>
                          <td colSpan={3}></td>
                          <td className="px-4 py-3 text-right font-mono">-₹{recFees.discVal.toLocaleString()}</td>
                        </tr>
                      )}
                      <tr className="bg-blue-50/20 font-extrabold text-[#2E5BFF] text-[14px]">
                        <td className="px-4 py-3">Final Payable Amount</td>
                        <td colSpan={3}></td>
                        <td className="px-4 py-3 text-right font-mono">₹{recFees.final.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Invoice Transactions Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-blue-500" />
                    <h3 className="text-base font-bold text-slate-800">Invoice Details</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-bold bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">
                    {detailData?.invoices.length} Invoices
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Invoice #</th>
                        <th className="px-4 py-3">Payment Mode</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Line items</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-600 font-medium">
                      {detailData?.invoices.map((inv) => {
                        const isExpanded = !!expandedInvoices[inv.id];
                        return (
                          <React.Fragment key={inv.id}>
                            <tr className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3">{inv.date}</td>
                              <td className="px-4 py-3 font-semibold text-blue-600">{inv.number}</td>
                              <td className="px-4 py-3">{inv.mode}</td>
                              <td className="px-4 py-3 font-bold text-slate-800 font-mono">₹{inv.amount.toLocaleString()}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  inv.status === 'Paid'
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    : 'bg-amber-50 text-amber-600 border-amber-100'
                                }`}>
                                  {inv.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => toggleInvoice(inv.id)}
                                  className="p-1 rounded-md hover:bg-slate-100 inline-flex items-center"
                                >
                                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                                </button>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="bg-slate-50/50">
                                <td colSpan={6} className="px-6 py-3 border-t border-b border-slate-100">
                                  <div className="space-y-2 max-w-md">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Particulars Breakdown:</div>
                                    {inv.items.map((it, idx) => (
                                      <div key={idx} className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-semibold">{it.name}</span>
                                        <span className="text-slate-800 font-bold font-mono">₹{it.amount.toLocaleString()}</span>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Column 2: Progress Card, Performance Report, Behaviour */}
            <div className="space-y-6">
              
              {/* Progress Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                  <h3 className="text-base font-bold text-slate-800">Progress Card</h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center font-extrabold text-[#2E5BFF] text-2xl shadow-sm">
                    A
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Overall Average</div>
                    <div className="text-2xl font-extrabold text-slate-800">86%</div>
                  </div>
                </div>
                <div className="p-3.5 bg-blue-50/20 border border-blue-100/30 rounded-xl text-xs text-slate-600 leading-relaxed font-medium">
                  Excellent academic standing! Consistently matches exam requirements.
                </div>
                
                {/* Syllabus progression */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Year Syllabus Progress</span>
                    <span>65%</span>
                  </div>
                  <div className="bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#2E5BFF] h-full rounded-full" style={{ width: '65%' }} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">65% of academic catalog syllabus completed.</p>
                </div>
              </div>

              {/* Performance Report */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Award className="w-5 h-5 text-blue-500" />
                  <h3 className="text-base font-bold text-slate-800">Performance Report</h3>
                </div>
                
                {/* Exam Category Tabs */}
                <div className="flex border-b border-slate-100 gap-4 text-xs font-bold">
                  {(['Unit Test', 'Quarterly', 'Final'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setSelectedExamTab(tab)}
                      className={`pb-2.5 transition-all border-b-2 ${
                        selectedExamTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {tab.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Exam Cards */}
                <div className="space-y-3 pt-2">
                  {detailData?.exams
                    .filter(ex => ex.type === selectedExamTab)
                    .map((ex) => {
                      const isExpanded = !!expandedExams[ex.id];
                      return (
                        <div key={ex.id} className="border border-slate-100 rounded-xl overflow-hidden">
                          <div
                            onClick={() => toggleExam(ex.id)}
                            className="flex justify-between items-center p-3 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-slate-500" />
                              <div className="text-xs font-bold text-slate-700">{ex.name}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-emerald-600">{ex.score}</span>
                              {isExpanded ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-400" />}
                            </div>
                          </div>
                          
                          {isExpanded && (
                            <div className="p-3 border-t border-slate-100 bg-white space-y-2 text-xs">
                              {ex.subjects.map((subj, idx) => (
                                <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-none">
                                  <span className="text-slate-500 font-semibold">{subj.name}</span>
                                  <span className="text-slate-800 font-extrabold font-mono">{subj.score} / {subj.max}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Student Behaviour (incidents cases) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <ShieldAlert className="w-5 h-5 text-blue-500" />
                  <h3 className="text-base font-bold text-slate-800">Student Behaviour</h3>
                </div>

                {detailData && detailData.cases.length > 0 ? (
                  <div className="space-y-3">
                    {detailData.cases.map((c) => (
                      <div key={c.id} className="border border-slate-100 rounded-xl p-3 bg-slate-50/30 space-y-2 text-xs">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-bold text-slate-750 leading-snug">{c.subject}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                            c.type === 'Positive' 
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                              : 'bg-rose-50 text-rose-600 border border-rose-100'
                          }`}>
                            {c.type}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] font-light leading-relaxed">{c.description}</p>
                        <div className="flex justify-between text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-100/50">
                          <span>Priority: {c.priority}</span>
                          <span>Date: {c.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-slate-50/50 border border-dashed border-slate-200 rounded-xl space-y-2">
                    <span className="text-2xl block">😇</span>
                    <h4 className="text-xs font-bold text-slate-700">Perfect Record</h4>
                    <p className="text-[11px] text-slate-400 font-light leading-relaxed">
                      Student demonstrates exemplary behavior, punctuality, and group work dedication.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
