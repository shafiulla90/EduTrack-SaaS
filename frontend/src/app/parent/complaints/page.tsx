'use client';

import React, { useState, useEffect } from 'react';
import { useParent } from '../ParentContext';
import { api } from '@/lib/api';
import { AlertCircle, CheckCircle, Info, Send, Loader2, ArrowRight } from 'lucide-react';

export default function ComplaintsPage() {
  const { selectedChild } = useParent();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Academics');
  const [description, setDescription] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/parent-portal/complaints');
      setComplaints(res.data || []);
    } catch (err) {
      console.error('Failed to fetch complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setMessage('');
    try {
      const res = await api.post('/parent-portal/complaints', {
        title,
        category,
        description,
      });

      setMessage('Concern submitted successfully! Our staff will review it.');
      setComplaints(prev => [res.data, ...prev]);

      // Reset
      setTitle('');
      setDescription('');

      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to submit suggestion. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-t-brand-500 border-r-brand-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in relative">
      <div>
        <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
          Suggestions & Complaints
        </h2>
        <p className="text-slate-400 text-xs mt-1 font-light">Submit school feedback, check grievance redressal statuses, and track issues.</p>
      </div>

      {message && (
        <div className={`p-4 border rounded-2xl text-xs font-semibold leading-relaxed flex items-center gap-2 ${
          message.includes('success') 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          {message.includes('success') ? <CheckCircle className="w-4.5 h-4.5 shrink-0" /> : <AlertCircle className="w-4.5 h-4.5 shrink-0" />}
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-850 p-6 rounded-3xl shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  <option value="Academics">Academics / Curriculum</option>
                  <option value="Transport">Transport / Bus Timing</option>
                  <option value="Facilities">Facilities / Sanitation</option>
                  <option value="Billing">Fee Statements / Payments</option>
                  <option value="Other">Other / General Suggestions</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Subject / Headline</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Bus arrival delay at Kharadi stop"
                  className="w-full bg-slate-950 border border-slate-900 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Elaborated Concern</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Elaborate on the issue or share constructive feedback..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-900 rounded-2xl px-4 py-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitLoading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold text-xs transition-all shadow-lg shadow-brand-500/15 flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitLoading ? (
                <>
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  Submitting Concern...
                </>
              ) : (
                'File Concern'
              )}
            </button>
          </form>
        </div>

        {/* Tracker */}
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-500 uppercase tracking-widest">Active Tickets</h3>
          
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {complaints.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-center">
                <Info className="w-8 h-8 text-slate-750 mb-2" />
                <p className="text-xs font-light">No complaints filed.</p>
              </div>
            ) : (
              complaints.map((c) => {
                const isOpen = c.status === 'OPEN';
                return (
                  <div
                    key={c.id}
                    className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl shadow-md space-y-2.5"
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-brand-400">{c.category}</span>
                      <span className={`px-2 py-0.5 rounded-lg border font-bold uppercase tracking-wider text-[8px] ${
                        isOpen 
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-300 leading-snug">{c.title}</h4>
                    <p className="text-[11px] text-slate-500 font-light leading-relaxed">{c.description}</p>
                    <span className="text-[8px] text-slate-500 block">Filed on: {new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
