"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTodayDateString = getTodayDateString;
exports.formatAttendanceDate = formatAttendanceDate;
exports.parseAttendanceDate = parseAttendanceDate;
exports.isBeforeDateString = isBeforeDateString;
function getTodayDateString() {
    const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'numeric', day: 'numeric' };
    const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(new Date());
    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value.padStart(2, '0');
    const day = parts.find(p => p.type === 'day')?.value.padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function formatAttendanceDate(date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function parseAttendanceDate(dateInput) {
    if (!dateInput) {
        const todayStr = getTodayDateString();
        const [year, month, day] = todayStr.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day));
    }
    let dateStr;
    if (dateInput instanceof Date) {
        dateStr = formatAttendanceDate(dateInput);
    }
    else if (typeof dateInput === 'string') {
        dateStr = dateInput.split('T')[0];
    }
    else {
        dateStr = String(dateInput).split('T')[0];
    }
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}
function isBeforeDateString(dateStr1, dateStr2) {
    return dateStr1 < dateStr2;
}
//# sourceMappingURL=date.utils.js.map