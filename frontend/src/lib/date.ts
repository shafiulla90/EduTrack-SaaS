/**
 * Utility functions for timezone-independent date parsing and formatting
 * in the Attendance module (Frontend).
 */

/**
 * Formats a Date object in the client's local timezone to a YYYY-MM-DD string
 * without using toISOString().
 */
export function formatLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts any date representation (string, Date, or ISO string)
 * to a local timezone YYYY-MM-DD string timezone-safely without shifting hours.
 */
export function toLocalDateString(dateInput?: any): string {
  if (!dateInput) return formatLocalDate(new Date());
  
  if (dateInput instanceof Date) {
    return formatLocalDate(dateInput);
  }
  
  const str = typeof dateInput === 'string' ? dateInput : String(dateInput);
  // Match the date part directly to avoid browser timezone shift if it's an ISO timestamp
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  
  return formatLocalDate(new Date(dateInput));
}

/**
 * Converts a YYYY-MM-DD date representation to local formatted display date
 * in en-IN locale (e.g. "9 Jul 2026").
 */
export function formatDisplayDate(dateInput: any): string {
  if (!dateInput) return '';
  const dateStr = toLocalDateString(dateInput);
  const [year, month, day] = dateStr.split('-').map(Number);
  const localDate = new Date(year, month - 1, day);
  return localDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Timezone-safe comparison of date strings (YYYY-MM-DD).
 * Returns true if dateStr1 is chronologically before dateStr2.
 */
export function isBefore(dateStr1: string, dateStr2: string): boolean {
  return dateStr1 < dateStr2;
}
