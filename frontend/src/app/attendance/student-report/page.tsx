// frontend/src/app/attendance/student-report/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

// Tailwind utility classes are used for light/dark mode styling.
// This page fetches the student‑specific attendance report and displays
// summary cards as well as a detailed history table.

interface ReportRecord {
  id: string;
  date: string;
  classSectionName: string;
  status: string;
}

interface ReportData {
  total: number;
  present: number;
  absent: number;
  records: ReportRecord[];
}

export default function StudentReportPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Replace "me" with appropriate student identifier if needed.
    fetch('/api/attendance/report/student?studentId=me', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((json) => {
        setData(json);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-xl font-medium">Loading student report…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-100 rounded">
        <p className="font-semibold">Failed to load report:</p>
        <pre>{error}</pre>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 text-gray-600">No attendance data available for this student.</div>
    );
  }

  const { total, present, absent, records } = data;
  const attendancePercent = total ? Math.round((present / total) * 100) : 0;

  return (
    <section className="p-6 bg-white dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Student Attendance Report
      </h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded shadow">
          <h2 className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Sessions</h2>
          <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{total}</p>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded shadow">
          <h2 className="text-sm font-medium text-gray-600 dark:text-gray-300">Present</h2>
          <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{present}</p>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded shadow">
          <h2 className="text-sm font-medium text-gray-600 dark:text-gray-300">Absent</h2>
          <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{absent}</p>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded shadow">
          <h2 className="text-sm font-medium text-gray-600 dark:text-gray-300">Attendance %</h2>
          <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{attendancePercent}%</p>
        </div>
      </div>

      {/* Detailed history table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-800">
              <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Date</th>
              <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Class Section</th>
              <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-300">Status</th>
            </tr>
          </thead>
          <tbody>
            {records && records.length > 0 ? (
              records.map((rec) => (
                <tr key={rec.id} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2 text-gray-800 dark:text-gray-200">
                    {new Date(rec.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-gray-800 dark:text-gray-200">
                    {rec.classSectionName}
                  </td>
                  <td className="px-4 py-2 text-gray-800 dark:text-gray-200">
                    {rec.status}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-2 text-center text-gray-500 dark:text-gray-400">
                  No attendance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Link href="/attendance/dashboard">
          <a className="text-indigo-600 hover:underline dark:text-indigo-400">← Back to Dashboard</a>
        </Link>
      </div>
    </section>
  );
}
