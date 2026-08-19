import { TeacherPortalService } from './teacher-portal.service';
export declare class TeacherPortalController {
    private portalService;
    constructor(portalService: TeacherPortalService);
    getDashboard(req: any): Promise<{
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
    getProfile(req: any): Promise<{
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
    updateProfile(req: any, data: any): Promise<{
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
    changePassword(req: any, data: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getClasses(req: any): Promise<any[]>;
    getStudents(req: any, classSectionId: string): Promise<({
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
    getAttendanceClasses(req: any): Promise<{
        label: any;
        value: any;
    }[]>;
    getAttendanceSections(req: any, classVal: string): Promise<{
        label: any;
        value: any;
    }[]>;
    getAttendanceStudents(req: any, classVal: string, sectionVal: string): Promise<{
        Id: string;
        Name: string;
        Roll_No__c: string;
    }[]>;
    saveAttendance(req: any, data: any): Promise<{
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
    getAttendanceHistory(req: any): Promise<{
        id: string;
        date: string;
        className: string;
        presentCount: number;
        absentCount: number;
        totalStudents: number;
    }[]>;
    getMarksEntryList(req: any, subjectId: string, examName: string, classSectionId: string, subjectType?: string): Promise<{
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
    saveMarks(req: any, data: any): Promise<{
        id: string;
        tenantId: string;
        studentId: string;
        examId: string;
        subjectId: string;
        subjectType: string;
        marksObtained: import("@prisma/client/runtime/library").Decimal;
        remarks: string | null;
    }[]>;
    getTimetable(req: any): Promise<any[]>;
    getHomeworks(req: any): Promise<({
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
    createHomework(req: any, data: any): Promise<{
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
    updateHomework(req: any, id: string, data: any): Promise<{
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
    deleteHomework(req: any, id: string): Promise<{
        success: boolean;
    }>;
    sendHomeworkToParents(req: any, id: string): Promise<{
        success: boolean;
        totalStudents: number;
        successfullySent: number;
        failed: number;
    }>;
    getAnnouncements(req: any): Promise<({
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
    createAnnouncement(req: any, data: any): Promise<{
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
    deleteAnnouncement(req: any, id: string): Promise<{
        success: boolean;
    }>;
    markAsRead(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getLeaves(req: any): Promise<any[]>;
    applyLeave(req: any, data: any): Promise<{
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
    cancelLeave(req: any, id: string): Promise<{
        success: boolean;
    }>;
    updateLeaveStatus(req: any, id: string, data: any): Promise<{
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
    getCommAudience(req: any): Promise<any[]>;
    sendBroadcast(req: any, data: any): Promise<{
        success: boolean;
        count: number;
    }>;
    getCalendar(req: any, month: string, year: string): Promise<any[]>;
    getStudentProgress(req: any, studentId: string): Promise<{
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
    getSalaryDetails(req: any): Promise<{
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
    getSalaryHistory(req: any): Promise<{
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
    getPayslipData(req: any, expenseId: string): Promise<{
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
