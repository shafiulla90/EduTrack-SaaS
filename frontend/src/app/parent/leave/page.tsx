'use client';

import React, { useState, useEffect } from 'react';
import { useParent } from '../ParentContext';
import { api } from '@/lib/api';
import { FileText, CheckCircle, Clock, Upload, X, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';

export default function LeavePage() {
  const { selectedChild } = useParent();
  const [leaveType, setLeaveType] = useState('Casual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // Submit states
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [leavesList, setLeavesList] = useState<any[]>([]);

  const fetchLeaves = async (childId: string) => {
    try {
      setHistoryLoading(true);
      const res = await api.get(`/parent-portal/children/${childId}/leave`);
      setLeavesList(res.data || []);
    } catch (err) {
      console.error('Failed to fetch leaves:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChild) {
      fetchLeaves(selectedChild.id);
    }
  }, [selectedChild]);

  // Listen to switcher events
  useEffect(() => {
    const handleChildChange = (e: any) => {
      fetchLeaves(e.detail);
    };
    window.addEventListener('parentChildChanged', handleChildChange);
    return () => window.removeEventListener('parentChildChanged', handleChildChange);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild) return;

    setLoading(true);
    setMessage('');
    try {
      const processSubmit = async (base64File: string | null) => {
        try {
          await api.post(`/parent-portal/children/${selectedChild.id}/leave`, {
            leaveType,
            startDate,
            endDate,
            reason,
            base64File,
          });

          setMessage('Leave request submitted successfully!');
          fetchLeaves(selectedChild.id);

          // Reset form
          setStartDate('');
          setEndDate('');
          setReason('');
          setUploadFile(null);

          setTimeout(() => setMessage(''), 3000);
        } catch (err) {
          console.error(err);
          setMessage('Failed to submit leave request. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      if (uploadFile) {
        const reader = new FileReader();
        reader.readAsDataURL(uploadFile);
        reader.onload = () => processSubmit(reader.result as string);
        reader.onerror = () => {
          setMessage('Failed to process certificate file.');
          setLoading(false);
        };
      } else {
        await processSubmit(null);
      }
    } catch (err) {
      console.error(err);
      setMessage('Failed to submit leave. Please try again.');
      setLoading(false);
    }
  };

  if (!selectedChild) {
    return (
      <div className="text-slate-500 text-sm text-center py-12">
        Please select a child to apply for leave.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in relative">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          Apply Student Leave: <span className="text-[#2E5BFF] font-extrabold">{selectedChild.name}</span>
        </h2>
        <p className="text-slate-500 text-xs mt-1 font-light">Submit absenteeism notices for medical recovery or emergency situations.</p>
      </div>

      {message && (
        <div className={`p-4 border rounded-2xl text-xs font-semibold leading-relaxed flex items-center gap-2 ${
          message.includes('successfully') 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
            : 'bg-rose-50 border-rose-100 text-rose-700'
        }`}>
          {message.includes('successfully') ? <CheckCircle className="w-4.5 h-4.5 shrink-0" /> : <ShieldAlert className="w-4.5 h-4.5 shrink-0" />}
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Application Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-750 focus:outline-none focus:border-[#2E5BFF]"
                >
                  <option value="Casual">Casual Leave</option>
                  <option value="Medical">Medical Leave</option>
                  <option value="Half Day">Half Day Leave</option>
                  <option value="Emergency">Emergency Leave</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#2E5BFF]"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#2E5BFF]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description / Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly state the reason for absence..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#2E5BFF] focus:ring-1 focus:ring-[#2E5BFF]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Attachment (Optional, e.g. Doctor's Note)</label>
              <div className="border border-dashed border-slate-200 bg-slate-50 hover:border-slate-350 rounded-2xl p-4 text-center cursor-pointer transition-all relative flex items-center justify-center gap-2">
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setUploadFile(file);
                  }}
                />
                <Upload className="w-4.5 h-4.5 text-slate-400" />
                <span className="text-xs text-slate-500 font-semibold block truncate max-w-[200px]">
                  {uploadFile ? uploadFile.name : 'Choose file to upload'}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#2E5BFF] hover:bg-blue-600 text-white rounded-xl font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </form>
        </div>

        {/* History Tracker */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-400 uppercase tracking-widest">Application History</h3>
          
          {historyLoading ? (
            <div className="flex justify-center items-center py-10 bg-white border border-slate-200 rounded-3xl shadow-sm">
              <Loader2 className="w-6 h-6 animate-spin text-[#2E5BFF]" />
            </div>
          ) : (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {leavesList.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-10 bg-white border border-slate-200 rounded-3xl shadow-sm">
                  No leaves applied yet.
                </div>
              ) : (
                leavesList.map((leave) => {
                  const isApproved = leave.status === 'APPROVED';
                  return (
                    <div
                      key={leave.id}
                      className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-2.5"
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-[#2E5BFF]">{leave.leaveType} Leave</span>
                        <span className={`px-2 py-0.5 rounded-lg border font-bold uppercase tracking-wider text-[8px] ${
                          isApproved 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                            : 'bg-amber-50 border-amber-100 text-amber-700'
                        }`}>
                          {leave.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-medium block">Dates</span>
                        <strong className="text-xs text-slate-700 font-semibold">{leave.startDate} to {leave.endDate}</strong>
                      </div>
                      <p className="text-[11px] text-slate-500 font-light truncate">{leave.reason}</p>
                      
                      {leave.attachmentUrl && (
                        <a
                          href={leave.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[9px] text-[#2E5BFF] hover:underline flex items-center gap-1 font-bold mt-1"
                        >
                          View Attachment Reference
                        </a>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
