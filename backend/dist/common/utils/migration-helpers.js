"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeterministicKey = void 0;
exports.toCents = toCents;
exports.fromCents = fromCents;
exports.formatDateISO = formatDateISO;
function toCents(val) {
    if (val === null || val === undefined)
        return 0;
    const num = typeof val === 'object' && 'toNumber' in val ? val.toNumber() : Number(val);
    if (isNaN(num))
        return 0;
    return Math.round(num * 100);
}
function fromCents(cents) {
    if (cents === null || cents === undefined)
        return 0;
    return Number((cents / 100).toFixed(2));
}
function formatDateISO(date) {
    if (!date)
        return null;
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
        return date.trim();
    }
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d.toISOString();
}
exports.DeterministicKey = {
    classSection: (classId, sectionId) => `${classId}_${sectionId}`,
    classSubject: (classSectionId, subjectId) => `${classSectionId}_${subjectId}`,
    examMark: (examId, studentId, subjectId) => `${examId}_${studentId}_${subjectId}`,
    teacherAssignment: (teacherId, classSectionId, subjectId) => `${teacherId}_${classSectionId}_${subjectId}`,
    teacherSkill: (teacherId, subjectId) => `${teacherId}_${subjectId}`,
};
//# sourceMappingURL=migration-helpers.js.map