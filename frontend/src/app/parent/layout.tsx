'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ParentProvider, useParent } from './ParentContext';
import { useTenant } from '../providers/TenantContext';
import ToastProvider from '@/components/Toast';
import { clearStoredAuth } from '@/lib/api';
import {
  Home,
  User,
  BookOpen,
  CreditCard,
  Bell,
  Calendar,
  MessageSquare,
  FileText,
  AlertTriangle,
  Bus,
  LogOut,
  ChevronDown,
  GraduationCap
} from 'lucide-react';

function ParentLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logoUrl, schoolName } = useTenant();
  const { children: childrenList, selectedChild, setSelectedChildId } = useParent();
  const [showSwitcher, setShowSwitcher] = useState(false);

  const navigationItems = [
    { name: 'Dashboard', href: '/parent', icon: Home, isBottom: true },
    { name: 'Student Profile', href: '/parent/profile', icon: User, isBottom: true },
    { name: 'Homework', href: '/parent/homework', icon: BookOpen, isBottom: true },
    { name: 'Fees & Invoices', href: '/parent/fees', icon: CreditCard, isBottom: true },
    { name: 'Announcements', href: '/parent/announcements', icon: Bell, isBottom: true },
    { name: 'Exams & Marks', href: '/parent/exams', icon: GraduationCap, isBottom: false },
    { name: 'Calendar & Schedule', href: '/parent/calendar', icon: Calendar, isBottom: false },
    { name: 'Messages & Chat', href: '/parent/chat', icon: MessageSquare, isBottom: false },
    { name: 'Leave Application', href: '/parent/leave', icon: FileText, isBottom: false },
    { name: 'Complaint Box', href: '/parent/complaints', icon: AlertTriangle, isBottom: false },
    { name: 'Transport Tracker', href: '/parent/transport', icon: Bus, isBottom: false },
  ];

  const handleLogout = () => {
    clearStoredAuth();
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden relative pb-16 lg:pb-0">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-brand-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[350px] h-[350px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="h-16 bg-slate-900/40 backdrop-blur-xl border-b border-slate-900 sticky top-0 z-40 flex items-center justify-between px-4 lg:px-8 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <span className="font-extrabold text-white text-base tracking-tight">ET</span>
          </div>
          <div className="hidden sm:block text-left">
            <h1 className="font-extrabold text-xs text-indigo-200 uppercase tracking-wider leading-none">EduTrack</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Parent Portal</p>
          </div>
        </div>

        {/* Child Switcher Dropdown */}
        {selectedChild && (
          <div className="relative">
            <button
              onClick={() => setShowSwitcher(!showSwitcher)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white hover:border-slate-700 transition-all cursor-pointer min-h-[36px]"
            >
              {selectedChild.avatarUrl ? (
                <img
                  src={selectedChild.avatarUrl}
                  alt={selectedChild.name}
                  className="w-5 h-5 rounded-full object-cover border border-slate-700"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-brand-500 to-indigo-500 text-white flex items-center justify-center font-bold text-[10px]">
                  {selectedChild.name[0]}
                </div>
              )}
              <span className="max-w-[80px] sm:max-w-[120px] truncate">{selectedChild.name}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${showSwitcher ? 'rotate-180' : ''}`} />
            </button>

            {showSwitcher && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSwitcher(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in space-y-1">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest px-3 py-1.5">
                    Switch Student
                  </div>
                  {childrenList.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => {
                        setSelectedChildId(child.id);
                        setShowSwitcher(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                        child.id === selectedChild.id
                          ? 'bg-brand-500/10 border border-brand-500/20 text-brand-300'
                          : 'border border-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {child.avatarUrl ? (
                        <img
                          src={child.avatarUrl}
                          alt={child.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">
                          {child.name[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{child.name}</p>
                        <p className="text-[10px] text-slate-500 font-light truncate">
                          {child.class} - {child.section}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <button
          onClick={handleLogout}
          className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-500/10 hover:border-rose-500/20 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex w-full relative min-w-0">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-[260px] bg-slate-950 border-r border-slate-900 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto py-6 px-4 select-none">
          <nav className="space-y-6">
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-3">
                Core Modules
              </div>
              <div className="space-y-1.5">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-brand-500/10 border border-brand-500/25 text-brand-300'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
      </div>

      {/* Sticky Bottom Navigation for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl border-t border-slate-900 h-16 flex items-center justify-around z-50 px-2 shadow-2xl shrink-0">
        {navigationItems.filter(item => item.isBottom).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1.5 text-[10px] font-bold transition-all px-2.5 py-1 ${
                isActive ? 'text-brand-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name.split(' ')[0]}</span>
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-300 cursor-pointer"
        >
          <LogOut className="w-5 h-5 text-rose-500" />
          <span>Exit</span>
        </button>
      </div>
    </div>
  );
}

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ParentProvider>
        <ParentLayoutContent>{children}</ParentLayoutContent>
      </ParentProvider>
    </ToastProvider>
  );
}
