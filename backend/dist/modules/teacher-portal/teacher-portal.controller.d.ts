import { TeacherPortalService } from './teacher-portal.service';
export declare class TeacherPortalController {
    private readonly portalService;
    constructor(portalService: TeacherPortalService);
    getDashboard(req: any): Promise<{
        totalStudents: number;
        assignedClasses: number;
        pendingHomeworks: number;
        todayPeriods: number;
    }>;
    getProfile(req: any): Promise<any>;
    updateProfile(req: any, data: any): Promise<any>;
    changePassword(req: any, data: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getClasses(req: any): Promise<{
        id: string;
        name: string;
        classId: string;
        sectionId: string;
    }[]>;
    getStudents(req: any, classSectionId: string): Promise<any[]>;
    getAttendanceClasses(req: any): Promise<{
        id: string;
        name: string;
    }[]>;
    getAttendanceSections(req: any, classVal: string): Promise<{
        id: string;
        name: string;
    }[]>;
    getAttendanceStudents(req: any, classVal: string, sectionVal: string): Promise<any[]>;
    saveAttendance(req: any, data: any): Promise<{
        success: boolean;
        count: any;
    }>;
    getAttendanceHistory(req: any): Promise<any[]>;
    getMarksEntryList(req: any, subjectId: string, examName: string, classSectionId: string, subjectType?: string): Promise<any[]>;
    saveMarks(req: any, data: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getTimetable(req: any): Promise<any[]>;
    getHomeworks(req: any): Promise<any[]>;
    createHomework(req: any, data: any): Promise<any>;
    updateHomework(req: any, id: string, data: any): Promise<any>;
    deleteHomework(req: any, id: string): Promise<{
        success: boolean;
        id: string;
    }>;
    sendHomeworkToParents(req: any, id: string): Promise<{
        success: boolean;
        id: string;
        message: string;
    }>;
    getAnnouncements(req: any): Promise<any[]>;
    createAnnouncement(req: any, data: any): Promise<any>;
    deleteAnnouncement(req: any, id: string): Promise<{
        success: boolean;
        id: string;
    }>;
    markAsRead(req: any, id: string): Promise<{
        success: boolean;
        id: string;
    }>;
    getLeaves(req: any): Promise<any[]>;
    applyLeave(req: any, data: any): Promise<any>;
    cancelLeave(req: any, id: string): Promise<{
        success: boolean;
        id: string;
        status: string;
    }>;
    updateLeaveStatus(req: any, id: string, data: any): Promise<any>;
    getCommAudience(req: any): Promise<any[]>;
    sendBroadcast(req: any, data: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getCalendar(req: any, month: string, year: string): Promise<any[]>;
    getStudentProgress(req: any, studentId: string): Promise<{
        studentId: string;
        progress: number;
    }>;
    getSalaryDetails(req: any): Promise<{
        baseSalary: number;
        netPayable: number;
    }>;
    getSalaryHistory(req: any): Promise<any[]>;
    getPayslipData(req: any, expenseId: string): Promise<{
        expenseId: string;
        salary: number;
    }>;
}
