'use client';

import React, { useState, useEffect } from 'react';
import { useParent } from '../ParentContext';
import { api } from '@/lib/api';
import { GraduationCap, Calendar, Award, Info, BookOpen } from 'lucide-react';

export default function ExamsPage() {
  const { selectedChild } = useParent();
  const [examData, setExamData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'SCHEDULE' | 'MARKS'>('MARKS');

  const fetchExams = async (childId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/parent-portal/children/${childId}/exams`);
      setExamData(res.data);
    } catch (err) {
      console.error('Failed to fetch exams data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChild) {
      fetchExams(selectedChild.id);
    }
  }, [selectedChild]);

  // Listen to switcher events
  useEffect(() => {
    const handleChildChange = (e: any) => {
      fetchExams(e.detail);
    };
    window.addEventListener('parentChildChanged', handleChildChange);
    return () => window.removeEventListener('parentChildChanged', handleChildChange);
  }, []);

  if (!selectedChild) {
    return (
      <div className="text-slate-500 text-sm text-center py-12">
        Please select a child to view examinations.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-t-[#2E5BFF] border-r-[#2E5BFF] border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const schedules = examData?.schedules || [];
  const marks = examData?.marks || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            Exams & Results: <span className="text-[#2E5BFF] font-extrabold">{selectedChild.name}</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1 font-light">Check exam schedules, hall tickets, and final grades.</p>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-white border border-slate-200 p-1 rounded-2xl shrink-0 shadow-sm">
          <button
            onClick={() => setActiveTab('MARKS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'MARKS' 
                ? 'bg-[#2E5BFF] text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Report Card
          </button>
          <button
            onClick={() => setActiveTab('SCHEDULE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'SCHEDULE' 
                ? 'bg-[#2E5BFF] text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            Exam Schedule
          </button>
        </div>
      </div>

      {activeTab === 'MARKS' ? (
        /* Report card view */
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Award className="w-4.5 h-4.5 text-[#2E5BFF]" />
            Scholastic Achievements
          </h3>

          {marks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 text-center">
              <GraduationCap className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-sm font-semibold">No results published.</p>
              <p className="text-xs font-light mt-1">Grades will show up here after exams are evaluated.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {marks.map((m: any) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-slate-250 transition-all gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#2E5BFF] border border-blue-100/30">
                      <GraduationCap className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{m.examName}</span>
                      <h4 className="text-xs font-bold text-slate-700 mt-0.5">{m.subject}</h4>
                      <p className="text-[10px] text-slate-400 italic mt-0.5 font-light">Remarks: {m.remarks}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-slate-800">{m.marksObtained} Marks</span>
                    <span className="text-[10px] text-[#2E5BFF] block font-bold uppercase mt-0.5">Grade {m.grade}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Exam schedule view */
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Calendar className="w-4.5 h-4.5 text-[#2E5BFF]" />
            Upcoming Exam Dates
          </h3>

          {schedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500 text-center">
              <Calendar className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-sm font-semibold">No upcoming exam schedule.</p>
              <p className="text-xs font-light mt-1">The school has not published any exam timetables yet.</p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {schedules.map((s: any) => (
                <div
                  key={s.id}
                  className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:border-slate-250 transition-all space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-[#2E5BFF] font-bold uppercase tracking-wider bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                        {s.subject}
                      </span>
                      <h4 className="text-xs font-bold text-slate-700 mt-2.5">{s.examName}</h4>
                    </div>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-slate-400" />
                      Hall: {s.examHall}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Date: <strong className="text-slate-700 font-bold">{new Date(s.examDate).toLocaleDateString()}</strong>
                    </span>
                    <span>Time: <strong className="text-slate-700 font-bold">{s.startTime} - {s.endTime}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
