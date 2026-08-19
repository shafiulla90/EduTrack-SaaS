import { AttendanceService } from './attendance.service';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    getSession(classSectionId: string, date: string, req?: any): Promise<{
        sessionExists: boolean;
        absentIds: any;
        presentCount: any;
        absentCount: any;
        totalStudents: any;
    } | {
        sessionExists: boolean;
        absentIds: any[];
        presentCount?: undefined;
        absentCount?: undefined;
        totalStudents?: undefined;
    }>;
    saveAttendance(body: any, req?: any): Promise<{
        success: boolean;
        session: {
            id: string;
            tenantId: string;
            classSectionId: string;
            date: string;
            teacherId: string;
            presentCount: number;
            absentCount: number;
            totalStudents: number;
            absentStudentIds: string[];
            sessionExists: boolean;
            updatedAt: string;
        };
    }>;
    getClassReport(classSectionId?: string, date?: string, req?: any): Promise<{
        success: boolean;
        sessions: FirebaseFirestore.DocumentData[];
        summary: {
            totalSessions: number;
            averagePercentage: number;
            totalPresent: number;
            totalAbsent: number;
        };
    }>;
    getHistory(classSectionId?: string, req?: any): Promise<FirebaseFirestore.DocumentData[]>;
    create(dto: any, req: any): Promise<any>;
    findAll(req: any): Promise<any[]>;
    findOne(id: string, req: any): Promise<any>;
    findByStudent(studentId: string, req: any): Promise<any[]>;
}
