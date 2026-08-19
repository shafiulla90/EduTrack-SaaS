import { AttendanceService } from './attendance.service';
export declare class AttendanceController {
    private attendanceService;
    constructor(attendanceService: AttendanceService);
    getClasses(req: any): Promise<{
        label: any;
        value: any;
    }[]>;
    getSections(req: any, classVal?: string): Promise<{
        label: any;
        value: any;
    }[]>;
    getTeachers(): Promise<{
        id: string;
        name: string;
        subject: string;
    }[]>;
    getRecent(): Promise<{
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
    getStudents(req: any, classVal: string, sectionVal: string): Promise<{
        Id: string;
        Name: string;
        Roll_No__c: string;
    }[]>;
    getSessionData(req: any, classVal: string, sectionVal: string, dateVal: string): Promise<{
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
    save(req: any, data: any): Promise<{
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
    getReportData(startDate: string, endDate: string): Promise<{
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
    getSession(classSectionId: string, date: string): Promise<{
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
    getById(id: string): Promise<{
        id: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        studentId: string;
        reason: string | null;
        attendanceSessionId: string;
    }>;
    update(id: string, updateDto: any): Promise<{
        id: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.AttendanceStatus;
        studentId: string;
        reason: string | null;
        attendanceSessionId: string;
    }>;
    remove(id: string): Promise<{
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
    getClassReport(classSectionId: string, date?: string): Promise<{
        totalStudents: number;
        present: number;
        absent: number;
    }>;
    getStudentReport(studentId: string, date?: string): Promise<{
        total: number;
        present: number;
        absent: number;
    }>;
}
