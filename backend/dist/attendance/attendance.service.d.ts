import { PrismaService } from '../prisma.service';
import { RoleFilterHelper } from '../common/role-filter.helper';
export declare class AttendanceService {
    private prisma;
    private roleFilterHelper;
    constructor(prisma: PrismaService, roleFilterHelper: RoleFilterHelper);
    private getTenantId;
    private formatTime;
    getClasses(userId?: string, role?: string): Promise<{
        label: any;
        value: any;
    }[]>;
    getSections(classVal?: string, userId?: string, role?: string): Promise<{
        label: any;
        value: any;
    }[]>;
    getTeachers(): Promise<{
        id: string;
        name: string;
        subject: string;
    }[]>;
    getRecentSubmissions(): Promise<{
        id: string;
        text: string;
    }[]>;
    getHistory(): Promise<{
        id: string;
        date: string;
        classSection: {
            class: {
                name: string;
            };
            section: {
                name: string;
            };
        };
        presentCount: number;
        absentCount: number;
        totalStudents: number;
        teacherId: string;
        teacherName: string;
    }[]>;
    getStudents(classVal: string, sectionVal: string, userId?: string, role?: string): Promise<{
        Id: string;
        Name: string;
        Roll_No__c: string;
    }[]>;
    getSessionData(classVal: string, sectionVal: string, dateStr: string, userId?: string, role?: string): Promise<{
        sessionExists: boolean;
        absentIds: any[];
        total: number;
        present: number;
        absent: number;
        sessionId?: undefined;
        teacherName?: undefined;
        createdTime?: undefined;
        lastUpdatedTime?: undefined;
        createdAt?: undefined;
        updatedAt?: undefined;
    } | {
        sessionExists: boolean;
        sessionId: string;
        teacherName: string;
        createdTime: string;
        lastUpdatedTime: string;
        createdAt: string;
        updatedAt: string;
        total: number;
        present: number;
        absent: number;
        absentIds: string[];
    }>;
    saveAttendance(data: any, userId?: string, role?: string): Promise<{
        sessionExists: boolean;
        absentIds: any[];
        total: number;
        present: number;
        absent: number;
        sessionId?: undefined;
        teacherName?: undefined;
        createdTime?: undefined;
        lastUpdatedTime?: undefined;
        createdAt?: undefined;
        updatedAt?: undefined;
    } | {
        sessionExists: boolean;
        sessionId: string;
        teacherName: string;
        createdTime: string;
        lastUpdatedTime: string;
        createdAt: string;
        updatedAt: string;
        total: number;
        present: number;
        absent: number;
        absentIds: string[];
    }>;
    getAttendanceData(startDateStr: string, endDateStr: string): Promise<{
        students: {
            id: string;
            name: string;
            rollNo: string;
            section: string;
            classValue: string;
            className: string;
        }[];
        attendanceRecords: {
            id: string;
            studentId: string;
            studentName: string;
            rollNo: string;
            section: string;
            classValue: string;
            className: string;
            attendanceDate: string;
            status: string;
        }[];
        classes: string[];
        sections: string[];
        sessions: {
            id: string;
            classId: string;
            className: string;
            classValue: string;
            attendanceDate: string;
            section: string;
            totalStudents: number;
            presentCount: number;
            absentCount: number;
        }[];
        debugStats: string;
    }>;
    getAttendanceById(id: string): Promise<{
        id: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        studentId: string;
        reason: string | null;
        attendanceSessionId: string;
    }>;
    updateAttendance(id: string, updateDto: any): Promise<{
        id: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        studentId: string;
        reason: string | null;
        attendanceSessionId: string;
    }>;
    deleteAttendance(id: string): Promise<{
        id: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        studentId: string;
        reason: string | null;
        attendanceSessionId: string;
    }>;
    getDailySummary(date?: string): Promise<{
        totalStudents: number;
        present: number;
        absent: number;
    }>;
    getMonthlySummary(month?: string, year?: string): Promise<{
        totalStudents: number;
        present: number;
        absent: number;
    }>;
    getClassAttendanceReport(classSectionId: string, date?: string): Promise<{
        totalStudents: number;
        present: number;
        absent: number;
    }>;
    getStudentAttendanceReport(studentId: string, date?: string): Promise<{
        total: number;
        present: number;
        absent: number;
    }>;
}
