import { ITeacherRepository } from '../../common/interfaces/teacher.repository.interface';
import { IStudentRepository } from '../../common/interfaces/student.repository.interface';
import { IExamRepository } from '../../common/interfaces/exam.repository.interface';
export declare class TeacherPortalService {
    private readonly teacherRepo;
    private readonly studentRepo;
    private readonly examRepo;
    constructor(teacherRepo: ITeacherRepository, studentRepo: IStudentRepository, examRepo: IExamRepository);
    getDashboardStats(teacherId: string, tenantId: string): Promise<{
        totalStudents: number;
        assignedClasses: number;
        pendingHomeworks: number;
        todayPeriods: number;
    }>;
    getProfile(userId: string, tenantId: string): Promise<any>;
    updateProfile(userId: string, tenantId: string, data: any): Promise<any>;
    changePassword(userId: string, tenantId: string, data: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getAssignedClasses(teacherId: string, tenantId: string): Promise<{
        id: string;
        name: string;
        classId: string;
        sectionId: string;
    }[]>;
    getStudentsForClassSection(teacherId: string, tenantId: string, classSectionId: string): Promise<any[]>;
    getClassesForAttendance(teacherId: string, tenantId: string): Promise<{
        id: string;
        name: string;
    }[]>;
    getSectionsForAttendance(teacherId: string, tenantId: string, classVal: string): Promise<{
        id: string;
        name: string;
    }[]>;
    getStudentsForAttendance(teacherId: string, tenantId: string, classVal: string, sectionVal: string): Promise<any[]>;
    saveAttendanceSheet(teacherId: string, tenantId: string, data: any): Promise<{
        success: boolean;
        count: any;
    }>;
    getAttendanceHistory(teacherId: string, tenantId: string): Promise<any[]>;
    getExamMarksEntryList(teacherId: string, tenantId: string, subjectId: string, examName: string, classSectionId: string, subjectType?: string): Promise<any[]>;
    saveExamMarksList(teacherId: string, tenantId: string, data: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getTeacherWeeklySchedule(teacherId: string, tenantId: string): Promise<any[]>;
    getHomeworks(teacherId: string, tenantId: string): Promise<any[]>;
    createHomework(teacherId: string, tenantId: string, data: any): Promise<any>;
    updateHomework(teacherId: string, tenantId: string, id: string, data: any): Promise<any>;
    deleteHomework(teacherId: string, tenantId: string, id: string): Promise<{
        success: boolean;
        id: string;
    }>;
    sendHomeworkToParents(teacherId: string, tenantId: string, id: string): Promise<{
        success: boolean;
        id: string;
        message: string;
    }>;
    getAnnouncements(userId: string, tenantId: string): Promise<any[]>;
    createAnnouncement(userId: string, tenantId: string, data: any): Promise<any>;
    deleteAnnouncement(userId: string, tenantId: string, id: string): Promise<{
        success: boolean;
        id: string;
    }>;
    markAnnouncementAsRead(userId: string, tenantId: string, id: string): Promise<{
        success: boolean;
        id: string;
    }>;
    getLeaveRequests(userId: string, tenantId: string): Promise<any[]>;
    applyLeave(userId: string, tenantId: string, data: any): Promise<any>;
    cancelLeave(userId: string, tenantId: string, id: string): Promise<{
        success: boolean;
        id: string;
        status: string;
    }>;
    updateLeaveStatus(userId: string, tenantId: string, id: string, data: any): Promise<any>;
    getCommunicationAudience(userId: string, tenantId: string): Promise<any[]>;
    sendBroadcastMessage(userId: string, tenantId: string, data: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getCalendarTimeline(userId: string, tenantId: string, month: number, year: number): Promise<any[]>;
    getStudentProgressDetails(userId: string, tenantId: string, studentId: string): Promise<{
        studentId: string;
        progress: number;
    }>;
    getMySalaryDetails(userId: string, tenantId: string): Promise<{
        baseSalary: number;
        netPayable: number;
    }>;
    getMySalaryHistory(userId: string, tenantId: string): Promise<any[]>;
    getPayslipPDFData(userId: string, tenantId: string, expenseId: string): Promise<{
        expenseId: string;
        salary: number;
    }>;
}
