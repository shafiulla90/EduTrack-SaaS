'use client';

import React, { useState, useEffect } from 'react';
import { useParent } from './ParentContext';
import { api } from '@/lib/api';
import Link from 'next/link';
import {
  Users,
  Calendar,
  BookOpen,
  CreditCard,
  Bell,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  Loader2,
  FileCheck,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function ParentDashboard() {
  const { children, selectedChild, setSelectedChildId } = useParent();
  const [stats, setStats] = useState<any>({
    totalChildren: 0,
    todayAttendance: 'N/A',
    homeworkPending: 0,
    pendingFees: 0,
    upcomingExams: 0,
    announcements: [],
    notifications: [],
  });
  const [childDashboard, setChildDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const tenantId = localStorage.getItem('parent_tenantId') || 'demo-school';
      const res = await api.get('/parent-portal/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch parent dashboard stats:', err);
    }
  };

  const fetchChildDashboard = async (childId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/parent-portal/children/${childId}/dashboard`);
      setChildDashboard(res.data);
    } catch (err) {
      console.error('Failed to fetch child dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [children]);

  useEffect(() => {
    if (selectedChild) {
      fetchChildDashboard(selectedChild.id);
    }
  }, [selectedChild]);

  // Listen to switcher events
  useEffect(() => {
    const handleChildChange = (e: any) => {
      fetchChildDashboard(e.detail);
    };
    window.addEventListener('parentChildChanged', handleChildChange);
    return () => window.removeEventListener('parentChildChanged', handleChildChange);
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Roster */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Family Dashboard
          </h1>
          <p className="text-slate-400 text-sm font-light mt-1">
            Overview of all your children studying at the school. Click a student card below to switch profiles.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3.5 py-2 rounded-2xl">
          <Users className="w-5 h-5 text-brand-400" />
          <span className="text-xs font-bold text-slate-200">
            Children linked: <strong className="text-white text-sm ml-0.5">{children.length}</strong>
          </span>
        </div>
      </div>

      {/* Aggregate Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-3xl shadow-xl flex flex-col justify-between hover:border-brand-500/25 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-400 mb-4">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Attendance Today</p>
            <h3 className="text-lg font-black text-slate-100 mt-1">{stats.todayAttendance}</h3>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-3xl shadow-xl flex flex-col justify-between hover:border-amber-500/25 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pending Homework</p>
            <h3 className="text-lg font-black text-slate-100 mt-1">{stats.homeworkPending} Assignments</h3>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-3xl shadow-xl flex flex-col justify-between hover:border-rose-500/25 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 mb-4">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pending Fees</p>
            <h3 className="text-lg font-black text-slate-100 mt-1">₹{Number(stats.pendingFees).toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-850 p-5 rounded-3xl shadow-xl flex flex-col justify-between hover:border-indigo-500/25 transition-all">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Upcoming Exams</p>
            <h3 className="text-lg font-black text-slate-100 mt-1">{stats.upcomingExams} Schedules</h3>
          </div>
        </div>
      </div>

      {/* Linked Children Roster Cards */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Linked Children</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {children.map((child) => {
            const isSelected = selectedChild && child.id === selectedChild.id;
            return (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`w-full bg-slate-900/40 p-6 rounded-3xl flex flex-col justify-between hover:scale-[1.01] hover:border-brand-500/35 transition-all shadow-xl text-left border relative overflow-hidden group ${
                  isSelected ? 'border-brand-500 bg-slate-900/60 ring-2 ring-brand-500/15' : 'border-slate-850'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-brand-500 text-white font-bold text-[9px] uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                    Selected
                  </div>
                )}
                
                <div className="flex gap-4">
                  {child.avatarUrl ? (
                    <img
                      src={child.avatarUrl}
                      alt={child.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-800"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-black text-base select-none">
                      {child.name[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-100 text-base group-hover:text-white transition-colors truncate">
                      {child.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-light mt-0.5">
                      Class {child.class} • Sec {child.section}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6 border-t border-slate-900 pt-4 text-xs text-slate-400">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Roll Number</span>
                    <strong className="text-slate-200">{child.rollNo}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Relationship</span>
                    <strong className="text-slate-200">{child.relationship}</strong>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Child Overview Dashboard Details */}
      {selectedChild && (
        <div className="space-y-6">
          <div className="border-t border-slate-900 pt-8 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span>
              Academic Overview: <strong className="text-brand-300 font-black">{selectedChild.name}</strong>
            </h2>
            {loading && <Loader2 className="w-5 h-5 animate-spin text-brand-400" />}
          </div>

          {childDashboard && !loading && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Performance Indicator Ring & Actions */}
              <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl shadow-xl space-y-6 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Attendance Rate</span>
                    <div className="relative w-28 h-28 mx-auto mt-4 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-950"
                          strokeWidth="2.5"
                          stroke="currentColor"
                          fill="transparent"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-brand-500"
                          strokeDasharray={`${childDashboard.metrics.attendancePercentage}, 100`}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-2xl font-black text-white">{childDashboard.metrics.attendancePercentage}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 text-center text-xs">
                    <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-900">
                      <span className="text-[9px] text-slate-500 font-semibold block uppercase">Due Fees</span>
                      <strong className="text-slate-100 text-sm">₹{Number(childDashboard.metrics.pendingFees).toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-900">
                      <span className="text-[9px] text-slate-500 font-semibold block uppercase">Pending Hwk</span>
                      <strong className="text-slate-100 text-sm">{childDashboard.metrics.pendingHomework} Tasks</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Link
                    href="/parent/profile"
                    className="w-full flex items-center justify-between p-3.5 bg-slate-950 border border-slate-900 hover:border-slate-800 rounded-2xl text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
                  >
                    <span>View Student Profile</span>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </Link>
                  <Link
                    href="/parent/fees"
                    className="w-full flex items-center justify-between p-3.5 bg-slate-950 border border-slate-900 hover:border-slate-800 rounded-2xl text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
                  >
                    <span>Manage Ledgers & Fees</span>
                    <ArrowRight className="w-4 h-4 text-slate-500" />
                  </Link>
                </div>
              </div>

              {/* Homework due */}
              <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl shadow-xl space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                  <h3 className="font-bold text-sm text-slate-200">Active Homeworks</h3>
                  <Link href="/parent/homework" className="text-[10px] text-brand-400 hover:text-brand-300 font-bold uppercase">
                    View All
                  </Link>
                </div>
                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                  {childDashboard.metrics.pendingHomework === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                      <CheckCircle className="w-8 h-8 text-slate-700 mb-2" />
                      <p className="text-xs font-light">All caught up! No pending homework.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="p-3 bg-slate-950/40 rounded-2xl border border-slate-900 space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="font-bold text-brand-400">Mathematics</span>
                          <span className="text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Due Tomorrow
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200">Algebra Quadratic Equations Worksheet</h4>
                        <p className="text-[11px] text-slate-400 font-light truncate">Solve problems 1 to 15 in notebook.</p>
                      </div>

                      <div className="p-3 bg-slate-950/40 rounded-2xl border border-slate-900 space-y-1">
                        <div className="flex justify-between text-[10px]">
                          <span className="font-bold text-indigo-400">Science</span>
                          <span className="text-slate-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> Due in 3 days
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200">Photosynthesis Experiment Model</h4>
                        <p className="text-[11px] text-slate-400 font-light truncate">Bring model along with observation chart.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Exam & Marks Card */}
              <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl shadow-xl space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                  <h3 className="font-bold text-sm text-slate-200">Recent Exam Results</h3>
                  <Link href="/parent/exams" className="text-[10px] text-brand-400 hover:text-brand-300 font-bold uppercase">
                    Report Card
                  </Link>
                </div>
                <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                  {childDashboard.recentMarks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-500">
                      <AlertCircle className="w-8 h-8 text-slate-700 mb-2" />
                      <p className="text-xs font-light">No exam marks entered yet.</p>
                    </div>
                  ) : (
                    childDashboard.recentMarks.map((mark: any) => {
                      const marksVal = Number(mark.marksObtained);
                      const isPassing = marksVal >= 50;
                      return (
                        <div key={mark.id} className="flex justify-between items-center p-3 bg-slate-950/40 rounded-2xl border border-slate-900">
                          <div>
                            <span className="text-[9px] text-slate-500 font-semibold uppercase">{mark.exam.name}</span>
                            <h4 className="text-xs font-bold text-slate-200 mt-0.5">{mark.subject.name}</h4>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs font-black ${isPassing ? 'text-brand-400' : 'text-rose-500'}`}>
                              {marksVal} Marks
                            </span>
                            <span className="text-[9px] text-slate-500 block font-light">Grade B+</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
