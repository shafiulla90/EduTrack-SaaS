import { PrismaService } from '../prisma.service';
import { AttendanceService } from '../attendance/attendance.service';
import { ExamsService } from '../exams/exams.service';
export declare class TeacherPortalService {
    private prisma;
    private attendanceService;
    private examsService;
    constructor(prisma: PrismaService, attendanceService: AttendanceService, examsService: ExamsService);
    getStaffProfile(userId: string, tenantId: string): Promise<{
        user: {
            id: string;
            isActive: boolean;
            updatedAt: Date;
            name: string;
            tenantId: string;
            createdAt: Date;
            email: string | null;
            phone: string | null;
            passwordHash: string;
            role: import(".prisma/client").$Enums.Role;
            avatarUrl: string | null;
        };
    } & {
        id: string;
        tenantId: string;
        status: string | null;
        address: string | null;
        userId: string;
        employeeId: string | null;
        designation: string | null;
        basicSalary: import("@prisma/client/runtime/library").Decimal | null;
        allowances: import("@prisma/client/runtime/library").Decimal | null;
        deductions: import("@prisma/client/runtime/library").Decimal | null;
        pfDeduction: import("@prisma/client/runtime/library").Decimal | null;
        joiningDate: Date | null;
        qualification: string | null;
        subjectsTaught: string[];
        staffCategory: string | null;
        staffRole: string | null;
        licenseNumber: string | null;
        licenseExpiry: Date | null;
        experienceYears: number | null;
        bloodGroup: string | null;
        aadhaarNo: string | null;
        whatsappNumber: string | null;
        emergencyContact: string | null;
    }>;
    verifyTeacherAssignment(staffProfileId: string, classSectionId: string, subjectId?: string): Promise<{
        id: string;
        tenantId: string;
        classId: string;
        sectionId: string;
        strength: number;
        teacherId: string | null;
    } | {
        id: string;
        tenantId: string;
        classSectionId: string;
        subjectId: string;
        teacherId: string;
        dayOfWeek: string;
        substituteTeacherId: string | null;
        periodTimingId: string;
    } | {
        id: string;
        tenantId: string;
        classSectionId: string;
        subjectId: string;
        teacherId: string;
        periodsPerWeek: number;
    }>;
    logAction(userId: string, tenantId: string, action: string, entityName: string, entityId?: string, details?: any): Promise<void>;
    getDashboardStats(userId: string, tenantId: string): Promise<{
        today: {
            classes: {
                id: string;
                classSectionId: string;
                subjectId: string;
                className: string;
                subjectName: string;
                time: string;
                periodNumber: number;
            }[];
            attendancePending: number;
            homeworkPending: number;
            exams: {
                id: string;
                name: string;
                classSectionName: string;
            }[];
            leaveStatus: string;
            events: {
                id: string;
                title: string;
                content: string;
            }[];
        };
        stats: {
            assignedStudents: number;
            assignedSubjects: number;
            attendanceRate: number;
            marksPending: number;
            homeworkCreated: number;
            announcementsSent: number;
        };
    }>;
    getProfile(userId: string, tenantId: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
            role: import(".prisma/client").$Enums.Role;
            avatarUrl: string;
        };
        teacherAssignments: ({
            classSection: {
                class: {
                    id: string;
                    isActive: boolean;
                    name: string;
                    tenantId: string;
                    academicYearId: string;
                };
                section: {
                    id: string;
                    isActive: boolean;
                    name: string;
                    tenantId: string;
                };
            } & {
                id: string;
                tenantId: string;
                classId: string;
                sectionId: string;
                strength: number;
                teacherId: string | null;
            };
            subject: {
                id: string;
                isActive: boolean;
                name: string;
                tenantId: string;
            };
        } & {
            id: string;
            tenantId: string;
            classSectionId: string;
            subjectId: string;
            teacherId: string;
            periodsPerWeek: number;
        })[];
    } & {
        id: string;
        tenantId: string;
        status: string | null;
        address: string | null;
        userId: string;
        employeeId: string | null;
        designation: string | null;
        basicSalary: import("@prisma/client/runtime/library").Decimal | null;
        allowances: import("@prisma/client/runtime/library").Decimal | null;
        deductions: import("@prisma/client/runtime/library").Decimal | null;
        pfDeduction: import("@prisma/client/runtime/library").Decimal | null;
        joiningDate: Date | null;
        qualification: string | null;
        subjectsTaught: string[];
        staffCategory: string | null;
        staffRole: string | null;
        licenseNumber: string | null;
        licenseExpiry: Date | null;
        experienceYears: number | null;
        bloodGroup: string | null;
        aadhaarNo: string | null;
        whatsappNumber: string | null;
        emergencyContact: string | null;
    }>;
    updateProfile(userId: string, tenantId: string, data: any): Promise<{
        id: string;
        tenantId: string;
        status: string | null;
        address: string | null;
        userId: string;
        employeeId: string | null;
        designation: string | null;
        basicSalary: import("@prisma/client/runtime/library").Decimal | null;
        allowances: import("@prisma/client/runtime/library").Decimal | null;
        deductions: import("@prisma/client/runtime/library").Decimal | null;
        pfDeduction: import("@prisma/client/runtime/library").Decimal | null;
        joiningDate: Date | null;
        qualification: string | null;
        subjectsTaught: string[];
        staffCategory: string | null;
        staffRole: string | null;
        licenseNumber: string | null;
        licenseExpiry: Date | null;
        experienceYears: number | null;
        bloodGroup: string | null;
        aadhaarNo: string | null;
        whatsappNumber: string | null;
        emergencyContact: string | null;
    }>;
    changePassword(userId: string, tenantId: string, data: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getAssignedClasses(userId: string, tenantId: string): Promise<any[]>;
    getStudentsForClassSection(userId: string, tenantId: string, classSectionId: string): Promise<({
        user: {
            name: string;
            email: string;
            phone: string;
            avatarUrl: string;
        };
    } & {
        id: string;
        tenantId: string;
        userId: string;
        rollNo: string | null;
        fatherName: string | null;
        motherName: string | null;
        aadharNo: string | null;
        profilePhotoUrl: string | null;
        fatherPhone: string | null;
        motherPhone: string | null;
        guardianPhone: string | null;
        parentProfileId: string | null;
        classSectionId: string | null;
        busId: string | null;
        busStopId: string | null;
    })[]>;
    getClassesForAttendance(userId: string, tenantId: string): Promise<{
        label: any;
        value: any;
    }[]>;
    getSectionsForAttendance(userId: string, tenantId: string, classVal: string): Promise<{
        label: any;
        value: any;
    }[]>;
    getStudentsForAttendance(userId: string, tenantId: string, classVal: string, sectionVal: string): Promise<{
        Id: string;
        Name: string;
        Roll_No__c: string;
    }[]>;
    saveAttendanceSheet(userId: string, tenantId: string, data: any): Promise<{
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
    getAttendanceHistory(userId: string, tenantId: string): Promise<{
        id: string;
        date: string;
        className: string;
        presentCount: number;
        absentCount: number;
        totalStudents: number;
    }[]>;
    getExamMarksEntryList(userId: string, tenantId: string, subjectId: string, examName: string, classSectionId: string, subjectType?: string): Promise<{
        roster: {
            studentId: string;
            name: string;
            rollNo: string;
            hasMarks: boolean;
            marksObtained: number;
            remarks: any;
        }[];
        config: {
            maxMarks: number;
            passingPercentage: number;
        };
    }>;
    saveExamMarksList(userId: string, tenantId: string, data: any): Promise<{
        id: string;
        tenantId: string;
        studentId: string;
        examId: string;
        subjectId: string;
        subjectType: string;
        marksObtained: import("@prisma/client/runtime/library").Decimal;
        remarks: string | null;
    }[]>;
    getTeacherWeeklySchedule(userId: string, tenantId: string): Promise<any[]>;
    getHomeworks(userId: string, tenantId: string): Promise<({
        classSection: {
            class: {
                id: string;
                isActive: boolean;
                name: string;
                tenantId: string;
                academicYearId: string;
            };
            section: {
                id: string;
                isActive: boolean;
                name: string;
                tenantId: string;
            };
        } & {
            id: string;
            tenantId: string;
            classId: string;
            sectionId: string;
            strength: number;
            teacherId: string | null;
        };
        subject: {
            id: string;
            isActive: boolean;
            name: string;
            tenantId: string;
        };
    } & {
        id: string;
        updatedAt: Date;
        tenantId: string;
        status: string;
        createdAt: Date;
        classSectionId: string;
        title: string;
        dueDate: Date;
        description: string;
        subjectId: string;
        teacherId: string;
        maxMarks: import("@prisma/client/runtime/library").Decimal;
        attachments: string[];
        createdBy: string;
        updatedBy: string;
        allowLateSubmission: boolean;
        assignmentType: string;
        visibleFrom: Date;
    })[]>;
    createHomework(userId: string, tenantId: string, data: any): Promise<{
        id: string;
        updatedAt: Date;
        tenantId: string;
        status: string;
        createdAt: Date;
        classSectionId: string;
        title: string;
        dueDate: Date;
        description: string;
        subjectId: string;
        teacherId: string;
        maxMarks: import("@prisma/client/runtime/library").Decimal;
        attachments: string[];
        createdBy: string;
        updatedBy: string;
        allowLateSubmission: boolean;
        assignmentType: string;
        visibleFrom: Date;
    }>;
    updateHomework(userId: string, tenantId: string, id: string, data: any): Promise<{
        id: string;
        updatedAt: Date;
        tenantId: string;
        status: string;
        createdAt: Date;
        classSectionId: string;
        title: string;
        dueDate: Date;
        description: string;
        subjectId: string;
        teacherId: string;
        maxMarks: import("@prisma/client/runtime/library").Decimal;
        attachments: string[];
        createdBy: string;
        updatedBy: string;
        allowLateSubmission: boolean;
        assignmentType: string;
        visibleFrom: Date;
    }>;
    deleteHomework(userId: string, tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    getAnnouncements(userId: string, tenantId: string): Promise<({
        classSection: {
            class: {
                id: string;
                isActive: boolean;
                name: string;
                tenantId: string;
                academicYearId: string;
            };
            section: {
                id: string;
                isActive: boolean;
                name: string;
                tenantId: string;
            };
        } & {
            id: string;
            tenantId: string;
            classId: string;
            sectionId: string;
            strength: number;
            teacherId: string | null;
        };
        teacher: {
            user: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            tenantId: string;
            status: string | null;
            address: string | null;
            userId: string;
            employeeId: string | null;
            designation: string | null;
            basicSalary: import("@prisma/client/runtime/library").Decimal | null;
            allowances: import("@prisma/client/runtime/library").Decimal | null;
            deductions: import("@prisma/client/runtime/library").Decimal | null;
            pfDeduction: import("@prisma/client/runtime/library").Decimal | null;
            joiningDate: Date | null;
            qualification: string | null;
            subjectsTaught: string[];
            staffCategory: string | null;
            staffRole: string | null;
            licenseNumber: string | null;
            licenseExpiry: Date | null;
            experienceYears: number | null;
            bloodGroup: string | null;
            aadhaarNo: string | null;
            whatsappNumber: string | null;
            emergencyContact: string | null;
        };
    } & {
        id: string;
        updatedAt: Date;
        tenantId: string;
        expiryDate: Date | null;
        createdAt: Date;
        classSectionId: string | null;
        title: string;
        teacherId: string;
        priority: string;
        content: string;
        audienceType: string;
        pinned: boolean;
        readStatus: import("@prisma/client/runtime/library").JsonValue | null;
    })[]>;
    createAnnouncement(userId: string, tenantId: string, data: any): Promise<{
        id: string;
        updatedAt: Date;
        tenantId: string;
        expiryDate: Date | null;
        createdAt: Date;
        classSectionId: string | null;
        title: string;
        teacherId: string;
        priority: string;
        content: string;
        audienceType: string;
        pinned: boolean;
        readStatus: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    deleteAnnouncement(userId: string, tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    markAnnouncementAsRead(userId: string, tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    getLeaveRequests(userId: string, tenantId: string): Promise<any[]>;
    updateLeaveStatus(userId: string, tenantId: string, id: string, data: any): Promise<{
        id: string;
        updatedAt: Date;
        tenantId: string;
        startDate: Date;
        status: string;
        createdAt: Date;
        endDate: Date;
        classSectionId: string | null;
        studentId: string | null;
        reason: string;
        teacherId: string | null;
        submittedById: string | null;
        applicantType: string;
        leaveType: string;
        attachment: string | null;
        approver: string | null;
        approvedById: string | null;
        approvedRole: string | null;
        comments: string | null;
        approvedDate: Date | null;
        rejectedDate: Date | null;
    }>;
    applyLeave(userId: string, tenantId: string, data: any): Promise<{
        id: string;
        updatedAt: Date;
        tenantId: string;
        startDate: Date;
        status: string;
        createdAt: Date;
        endDate: Date;
        classSectionId: string | null;
        studentId: string | null;
        reason: string;
        teacherId: string | null;
        submittedById: string | null;
        applicantType: string;
        leaveType: string;
        attachment: string | null;
        approver: string | null;
        approvedById: string | null;
        approvedRole: string | null;
        comments: string | null;
        approvedDate: Date | null;
        rejectedDate: Date | null;
    }>;
    cancelLeave(userId: string, tenantId: string, id: string): Promise<{
        success: boolean;
    }>;
    getCommunicationAudience(userId: string, tenantId: string): Promise<any[]>;
    sendBroadcastMessage(userId: string, tenantId: string, data: any): Promise<{
        success: boolean;
        count: number;
    }>;
    getCalendarTimeline(userId: string, tenantId: string, month: number, year: number): Promise<any[]>;
    getStudentProgressDetails(userId: string, tenantId: string, studentId: string): Promise<{
        student: {
            id: string;
            name: string;
            rollNo: string;
            className: string;
        };
        stats: {
            attendanceRate: number;
            averageScore: number;
            homeworkCompletion: number;
        };
        marksHistory: {
            examName: string;
            score: number;
            subjectName: string;
            subjectId: string;
        }[];
        homeworks: {
            title: string;
            dueDate: string;
            submitted: boolean;
        }[];
    }>;
    sendHomeworkToParents(userId: string, tenantId: string, id: string): Promise<{
        success: boolean;
        totalStudents: number;
        successfullySent: number;
        failed: number;
    }>;
    getMySalaryDetails(userId: string, tenantId: string): Promise<{
        basicSalary: number;
        allowances: number;
        deductions: number;
        pfDeduction: number;
        bonus: number;
        netSalary: number;
        paymentStatus: string;
        paymentDate: string;
        salaryMonth: string;
        payrollReference: string;
        employeeId: string;
        designation: string;
    }>;
    getMySalaryHistory(userId: string, tenantId: string): Promise<{
        id: string;
        salaryMonth: string;
        paymentDate: string;
        grossSalary: number;
        deductions: number;
        pfDeduction: number;
        bonus: number;
        netSalary: number;
        paymentStatus: string;
        paymentMethod: string;
        transactionReference: string;
    }[]>;
    getPayslipPDFData(userId: string, tenantId: string, expenseId: string): Promise<{
        schoolLogo: string;
        schoolName: string;
        teacherName: string;
        employeeId: string;
        designation: string;
        department: string;
        salaryMonth: string;
        basicSalary: number;
        allowances: number;
        deductions: number;
        pfDeduction: number;
        bonus: number;
        grossSalary: number;
        netSalary: number;
        paymentDate: string;
        paymentMethod: string;
        payrollReference: string;
        authorizedSignature: string;
    }>;
}
