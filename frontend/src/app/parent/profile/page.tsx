'use client';

import React, { useState, useEffect } from 'react';
import { useParent } from '../ParentContext';
import { api } from '@/lib/api';
import { User, Shield, Info, Heart, Briefcase, Mail, Phone } from 'lucide-react';

export default function StudentProfilePage() {
  const { selectedChild } = useParent();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (childId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/parent-portal/children/${childId}/dashboard`);
      setProfileData(res.data);
    } catch (err) {
      console.error('Failed to fetch student profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedChild) {
      fetchProfile(selectedChild.id);
    }
  }, [selectedChild]);

  // Listen to switcher events
  useEffect(() => {
    const handleChildChange = (e: any) => {
      fetchProfile(e.detail);
    };
    window.addEventListener('parentChildChanged', handleChildChange);
    return () => window.removeEventListener('parentChildChanged', handleChildChange);
  }, []);

  if (!selectedChild) {
    return (
      <div className="text-slate-500 text-sm text-center py-12">
        Please select a child to view their profile.
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

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      {/* Profile Card */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-blue-50 to-indigo-50" />
        
        <div className="relative mt-8">
          {selectedChild.avatarUrl ? (
            <img
              src={selectedChild.avatarUrl}
              alt={selectedChild.name}
              className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-md"
            />
          ) : (
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-black text-3xl border-4 border-white shadow-md">
              {selectedChild.name[0]}
            </div>
          )}
        </div>

        <h2 className="text-2xl font-black text-slate-800 mt-4">{selectedChild.name}</h2>
        <p className="text-xs text-slate-500 font-light mt-1">
          Class {selectedChild.class} • Section {selectedChild.section}
        </p>
        <span className="mt-3 px-3 py-1.5 rounded-full bg-blue-550/10 bg-blue-50 border border-blue-100 text-[#2E5BFF] text-[10px] font-bold uppercase tracking-wider">
          Student ID: {selectedChild.id.substring(0, 8).toUpperCase()}
        </span>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Personal Details */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-800 border-b border-slate-105 border-slate-100 pb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-[#2E5BFF]" />
            Academic Details
          </h3>
          <div className="space-y-3.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">Roll Number</span>
              <strong className="text-slate-700">{selectedChild.rollNo}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Class Section</span>
              <strong className="text-slate-700">{selectedChild.class} - {selectedChild.section}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Blood Group</span>
              <strong className="text-slate-700">O+ (Positive)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Date of Birth</span>
              <strong className="text-slate-700">12th August 2016</strong>
            </div>
          </div>
        </div>

        {/* Parent Details */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-800 border-b border-slate-105 border-slate-100 pb-2 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500" />
            Guardian Details
          </h3>
          <div className="space-y-3.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">Father's Name</span>
              <strong className="text-slate-700">{selectedChild.fatherName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Mother's Name</span>
              <strong className="text-slate-700">{selectedChild.motherName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Emergency Phone</span>
              <strong className="text-slate-700">+91 98867 54321</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Primary Contact Role</span>
              <strong className="text-indigo-600 uppercase tracking-wider text-[10px] font-bold">Primary Guardian</strong>
            </div>
          </div>
        </div>

        {/* Advisor Teacher Info */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4 md:col-span-2">
          <h3 className="font-bold text-sm text-slate-800 border-b border-slate-105 border-slate-100 pb-2 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-500" />
            Class Advisor Information
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700">Mrs. Ananya Sharma</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Advisor / English Department</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href="mailto:ananya.sharma@school.edu"
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                title="Send Email"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href="tel:+919876543210"
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                title="Call Advisor"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
