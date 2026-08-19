export declare function toCents(val: any | number | string | null | undefined): number;
export declare function fromCents(cents: number | null | undefined): number;
export declare function formatDateISO(date: Date | string | null | undefined): string | null;
export declare const DeterministicKey: {
    classSection: (classId: string, sectionId: string) => string;
    classSubject: (classSectionId: string, subjectId: string) => string;
    examMark: (examId: string, studentId: string, subjectId: string) => string;
    teacherAssignment: (teacherId: string, classSectionId: string, subjectId: string) => string;
    teacherSkill: (teacherId: string, subjectId: string) => string;
};
