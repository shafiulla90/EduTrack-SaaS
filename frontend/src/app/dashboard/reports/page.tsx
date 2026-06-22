'use client';

import React, { useState } from 'react';
import { LineChart, BarChart2, PieChart, Download, Sparkles, CheckCircle2 } from 'lucide-react';
import { mockStudents } from '@/lib/mockData';

export default function ReportsAnalyticsPage() {
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportType, setExportType] = useState('');

  const triggerExport = (type: string) => {
    setExportType(type);
    setExportSuccess(true);
    setTimeout(() => {
      setExportSuccess(false);
      setExportType('');
    }, 3000);
  };

  return (
    <div className="space-y-8 relative">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Scholastic Reports & Analytics
          </h1>
          <p className="text-slate-400 text-sm font-light mt-1">
            Aggregate student rosters, performance grading averages, and school financial statements.
          </p>
        </div>
      </div>

      {exportSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-3 text-sm animate-pulse">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="font-bold">Roster Exported!</span> Compiled {exportType} report stream downloaded successfully.
          </div>
        </div>
      )}

      {/* Grid of Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Report 1 */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-brand-500/20 transition-all shadow-xl h-64">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-brand-400">
              <LineChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-200 text-sm">Enrollment Demographics</h3>
              <p className="text-slate-400 text-xs font-light leading-relaxed mt-1">
                Compile class directories, section distribution caps, student ratios, and enrollment timelines.
              </p>
            </div>
          </div>
          <button
            onClick={() => triggerExport('Enrollment CSV')}
            className="w-full py-2.5 rounded-xl border border-slate-900 bg-slate-950/60 hover:bg-slate-900/40 text-brand-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            Export Demographics CSV
          </button>
        </div>

        {/* Report 2 */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-brand-500/20 transition-all shadow-xl h-64">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-200 text-sm">Financial Cashflows Statement</h3>
              <p className="text-slate-400 text-xs font-light leading-relaxed mt-1">
                Track tuition fee collection registers, outstanding receivables, and categorized school operating costs.
              </p>
            </div>
          </div>
          <button
            onClick={() => triggerExport('Financial Cashflows PDF')}
            className="w-full py-2.5 rounded-xl border border-slate-900 bg-slate-950/60 hover:bg-slate-900/40 text-indigo-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            Export Cashflows Ledger
          </button>
        </div>

        {/* Report 3 */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:border-brand-500/20 transition-all shadow-xl h-64">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-200 text-sm">Grading Averages & GPAs</h3>
              <p className="text-slate-400 text-xs font-light leading-relaxed mt-1">
                Generate student aggregate scoresheets, subject passing distributions, and class GPA ranking lists.
              </p>
            </div>
          </div>
          <button
            onClick={() => triggerExport('Academic GPA Spreadsheet')}
            className="w-full py-2.5 rounded-xl border border-slate-900 bg-slate-950/60 hover:bg-slate-900/40 text-emerald-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" />
            Export Grading Spreadsheet
          </button>
        </div>
      </div>

      {/* Analytics Chart SVG Graphics Section */}
      <div className="glass-panel p-6 rounded-2xl shadow-xl space-y-6">
        <div>
          <h3 className="font-bold text-slate-200 text-base">Grading Mark Curve Distribution</h3>
          <p className="text-slate-500 text-xs font-light">Class performance scores spread (Mathematics final evaluation counts)</p>
        </div>

        <div className="h-60 w-full relative mt-4">
          <svg className="w-full h-full" viewBox="0 0 600 240" preserveAspectRatio="none">
            {/* Grid background */}
            <line x1="0" y1="60" x2="600" y2="60" stroke="#1e293b" strokeDasharray="5,5" strokeWidth="0.8" />
            <line x1="0" y1="120" x2="600" y2="120" stroke="#1e293b" strokeDasharray="5,5" strokeWidth="0.8" />
            <line x1="0" y1="180" x2="600" y2="180" stroke="#1e293b" strokeDasharray="5,5" strokeWidth="0.8" />
            <line x1="0" y1="240" x2="600" y2="240" stroke="#1e293b" strokeWidth="1" />

            {/* Custom SVG Curve */}
            <path
              d="M 10,230 Q 150,20 300,100 T 590,230"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Glow below curve */}
            <path
              d="M 10,230 Q 150,20 300,100 T 590,230 L 590,240 L 10,240 Z"
              fill="url(#chartGlowGrad)"
              opacity="0.2"
            />
            <defs>
              <linearGradient id="chartGlowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Circle markers */}
            <circle cx="150" cy="50" r="5" fill="#8b5cf6" stroke="#0f172a" strokeWidth="3" />
            <circle cx="300" cy="100" r="5" fill="#8b5cf6" stroke="#0f172a" strokeWidth="3" />
          </svg>
          {/* Legend tags */}
          <div className="absolute top-[35px] left-[130px] bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-[10px] text-brand-300 pointer-events-none shadow-md">
            Mean GPA Score: A (82%)
          </div>
        </div>
        
        {/* Horizontal scale */}
        <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold px-2">
          <span>Failed (&lt;35)</span>
          <span>Below average (35-60)</span>
          <span>Average (60-75)</span>
          <span>First Division (75-90)</span>
          <span>High Distinction (90-100)</span>
        </div>
      </div>
    </div>
  );
}
