export declare class CreateAttendanceDto {
    classSectionId: string;
    date: string;
    teacherId: string;
    presentCount: number;
    absentCount: number;
    totalStudents: number;
    absentStudentIds?: string[];
    reason?: string;
}
