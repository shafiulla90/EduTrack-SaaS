export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';
import { IAttendanceRepository } from '../../common/interfaces/attendance.repository.interface';
import { IStudentRepository } from '../../common/interfaces/student.repository.interface';
import { ITeacherRepository } from '../../common/interfaces/teacher.repository.interface';
import { FirebaseService } from '../../database/firebase.service';
export declare class AttendanceService {
    private readonly attendanceRepo;
    private readonly studentRepo;
    private readonly teacherRepo;
    private readonly firebase;
    constructor(attendanceRepo: IAttendanceRepository, studentRepo: IStudentRepository, teacherRepo: ITeacherRepository, firebase: FirebaseService);
    private get db();
    getSession(tenantId: string, classSectionId: string, date: string): Promise<{
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
    saveAttendance(tenantId: string, data: {
        classSectionId: string;
        date: string;
        teacherId?: string;
        presentCount?: number;
        absentCount?: number;
        totalStudents?: number;
        absentStudentIds: string[];
    }): Promise<{
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
    getClassReport(tenantId: string, classSectionId?: string, date?: string): Promise<{
        success: boolean;
        sessions: FirebaseFirestore.DocumentData[];
        summary: {
            totalSessions: number;
            averagePercentage: number;
            totalPresent: number;
            totalAbsent: number;
        };
    }>;
    getHistory(tenantId: string, classSectionId?: string): Promise<FirebaseFirestore.DocumentData[]>;
    create(tenantId: string, data: {
        studentId: string;
        date: string;
        status: AttendanceStatus;
    }): Promise<any>;
    findAll(tenantId: string): Promise<any[]>;
    findOne(id: string, tenantId: string): Promise<any>;
    findByStudent(studentId: string, tenantId: string): Promise<any[]>;
}
