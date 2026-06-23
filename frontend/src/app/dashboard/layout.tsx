'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTenant } from '../providers/TenantContext';
import ToastProvider from '@/components/Toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { schoolName, adminName, logoUrl } = useTenant();

  // Categories as defined in eduProDashboard.html
  const navSections = [
    {
      title: 'Main',
      items: [
        {
          name: 'Dashboard',
          href: '/dashboard',
          svg: (
            <svg className="icon-svg" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          ),
        },
        {
          name: 'Students',
          href: '/dashboard/students',
          svg: (
            <svg className="icon-svg" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          ),
        },
        {
          name: 'School Staff',
          href: '/dashboard/staff',
          svg: (
            <svg className="icon-svg" viewBox="0 0 24 24">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <polyline points="17 11 19 13 23 9"></polyline>
            </svg>
          ),
        },
        {
          name: 'Teacher & Class Management',
          href: '/dashboard/teachers',
          svg: (
            <svg className="icon-svg" viewBox="0 0 24 24">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
              <path d="M9 22v-4h6v4"></path>
              <path d="M8 6h.01"></path>
              <path d="M16 6h.01"></path>
              <path d="M8 10h.01"></path>
              <path d="M16 10h.01"></path>
              <path d="M8 14h.01"></path>
              <path d="M16 14h.01"></path>
            </svg>
          ),
        },
      ],
    },
    {
      title: 'Admissions',
      items: [
        {
          name: 'New Admission',
          href: '/dashboard/admissions',
          svg: (
            <svg className="icon-svg" viewBox="0 0 24 24">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="17" y1="11" x2="23" y2="11"></line>
            </svg>
          ),
        },
        {
          name: 'Promote Students',
          href: '/dashboard/promotions',
          svg: (
            <svg className="icon-svg" viewBox="0 0 24 24">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
              <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
          ),
        },
      ],
    },
    {
      title: 'Financials',
      items: [
        {
          name: 'Fee Management',
          href: '/dashboard/billing',
          svg: (
            <svg className="icon-svg" viewBox="0 0 24 24">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
              <line x1="1" y1="10" x2="23" y2="10"></line>
            </svg>
          ),
        },
        {
          name: 'Expense Management',
          href: '/dashboard/expenses',
          svg: (
            <svg className="icon-svg" viewBox="0 0 24 24">
              <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"></path>
              <path d="M16 8h-6"></path>
              <path d="M16 12H8"></path>
              <path d="M16 16H8"></path>
            </svg>
          ),
        },
        {
          name: 'Fee Setup / Price Book',
          href: '/dashboard/billing/setup',
          svg: (
            <svg className="icon-svg" viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
            </svg>
          ),
        },
      ],
    },
    {
      title: 'Academics',
      items: [
        {
          name: 'Grades & Marks',
          href: '/dashboard/grades',
          svg: (
            <svg className="icon-svg" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="7"></circle>
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
            </svg>
          ),
        },
        {
          name: 'Enter Marks',
          href: '/dashboard/exams',
          svg: (
            <svg className="icon-svg" viewBox="0 0 24 24">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          ),
        },
        {
          name: 'Attendance',
          href: '/attendance/dashboard',
          svg: (
            <svg className="icon-svg" viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          ),
        },
        {
          name: 'Complaint Box',
          href: '/complaint-box',
          svg: (
            <svg className="icon-svg" viewBox="0 0 24 24">
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
              <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
            </svg>
          ),
        },
        {
          name: 'School Setup',
          href: '/dashboard/settings',
          svg: (
            <svg className="icon-svg" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          ),
        },
      ],
    },
  ];

  return (
    <ToastProvider>
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans">
      {/* Sidebar - Fix position matching .sidebar in LWC CSS */}
      <aside className="hidden lg:block w-[280px] bg-white border-r border-slate-200 h-screen fixed top-0 left-0 overflow-y-auto z-50 py-6 select-none shadow-sm">
        {/* Sidebar Nav section blocks */}
        <nav className="space-y-6 px-4">
          {navSections.map((section) => (
            <div key={section.title}>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all ${
                        isActive
                          ? 'bg-blue-50 text-[#2E5BFF] font-semibold'
                          : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="shrink-0 w-5 h-5 flex items-center justify-center">
                        {item.svg}
                      </span>
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main panel viewport - Match margin-left from LWC sidebar */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-[280px]">
        {/* Top bar matching top-bar of LWC */}
        <header className="h-[72px] bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm relative">
          <div className="flex items-center gap-4">
            {/* Mobile Menu trigger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              <svg className="w-6 h-6 stroke-slate-700" viewBox="0 0 24 24" fill="none">
                <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2" strokeLinecap="round" />
                <line x1="3" y1="6" x2="21" y2="6" strokeWidth="2" strokeLinecap="round" />
                <line x1="3" y1="18" x2="21" y2="18" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {/* Salesforce search box style */}
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-[240px] xl:w-[320px] focus-within:border-[#2E5BFF] focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <svg className="w-4 h-4 stroke-slate-400 fill-none mr-2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" strokeWidth="2"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2"></line>
              </svg>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none text-[13px] font-medium text-slate-800 outline-none w-full placeholder-slate-400"
              />
              <span className="text-[10px] text-slate-400 select-none ml-2">⌘K</span>
            </div>
          </div>

          {/* Center: logo and school name (ST. ANNE'S HIGH SCHOOL) */}
          <div className="absolute left-[45%] lg:left-[43%] xl:left-[44%] top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 px-4 text-center">
            <div className="w-[36px] h-[36px] bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 shrink-0 overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt={schoolName} className="w-full h-full object-cover" />
              ) : (
                <svg className="w-[20px] h-[20px] stroke-[#2E5BFF] fill-none" viewBox="0 0 24 24">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" strokeWidth="2"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5" strokeWidth="2"></path>
                </svg>
              )}
            </div>
            <div className="hidden md:block text-left">
              <h1 className="font-extrabold text-[14px] text-indigo-900 leading-none uppercase tracking-wide">
                {schoolName}
              </h1>
              <p className="text-[9px] text-slate-400 font-bold tracking-wider uppercase mt-0.5">
                Building Excellence for Futures
              </p>
            </div>
          </div>

          {/* User Profile widget */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl hover:bg-slate-50 cursor-pointer">
              <div className="text-right">
                <p className="text-[13px] font-semibold text-slate-800 leading-none">{adminName}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">Admin</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm">
                {adminName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page content panel viewport */}
        <main className="p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div className="w-[280px] bg-white h-full py-6 select-none overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 px-6 mb-6">
                <div className="w-[36px] h-[36px] bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 shrink-0 overflow-hidden">
                  {logoUrl ? (
                    <img src={logoUrl} alt={schoolName} className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-[20px] h-[20px] stroke-[#2E5BFF] fill-none" viewBox="0 0 24 24">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" strokeWidth="2"></path>
                      <path d="M6 12v5c3 3 9 3 12 0v-5" strokeWidth="2"></path>
                    </svg>
                  )}
                </div>
                <div>
                  <h1 className="font-extrabold text-[14px] text-indigo-900 leading-none uppercase tracking-wide">
                    {schoolName}
                  </h1>
                </div>
              </div>
              <nav className="space-y-6 px-4">
                {navSections.map((section) => (
                  <div key={section.title}>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                      {section.title}
                    </div>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all ${
                              isActive
                                ? 'bg-blue-50 text-[#2E5BFF] font-semibold'
                                : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
                            }`}
                          >
                            <span className="shrink-0 w-5 h-5 flex items-center justify-center">
                              {item.svg}
                            </span>
                            <span className="truncate">{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
    </ToastProvider>
  );
}
