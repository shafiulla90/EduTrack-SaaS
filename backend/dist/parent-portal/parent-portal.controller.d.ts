import { ParentPortalService } from './parent-portal.service';
export declare class ParentPortalController {
    private portalService;
    constructor(portalService: ParentPortalService);
    getDashboard(req: any): Promise<{
        totalChildren: number;
        todayAttendance: string;
        homeworkPending: number;
        pendingFees: number;
        upcomingExams: number;
        announcements: {
            content: string;
            id: string;
            updatedAt: Date;
            tenantId: string;
            expiryDate: Date | null;
            createdAt: Date;
            classSectionId: string | null;
            title: string;
            teacherId: string;
            priority: string;
            audienceType: string;
            pinned: boolean;
            readStatus: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
        notifications: {
            message: string;
            id: string;
            createdAt: Date;
            title: string;
            type: string;
            isRead: boolean;
            recipientId: string;
        }[];
    }>;
    getChildren(req: any): Promise<{
        id: string;
        name: string;
        rollNo: string;
        avatarUrl: string;
        class: string;
        section: string;
        classSectionId: string;
        relationship: string;
        isPrimary: boolean;
        fatherName: string;
        motherName: string;
    }[]>;
    getChildDashboard(req: any, studentId: string): Promise<{
        student: {
            id: any;
            name: any;
            rollNo: any;
            class: any;
            section: any;
            avatarUrl: any;
            classSectionId: any;
            fatherName: any;
            motherName: any;
            fatherPhone: any;
            motherPhone: any;
            guardianName: string;
            guardianPhone: any;
            emergencyPhone: string;
            primaryContactPhone: string;
            primaryContactRole: string;
        };
        metrics: {
            attendancePercentage: number;
            hasAttendanceData: boolean;
            todayAttendanceSubmitted: boolean;
            todayAttendanceStatus: string;
            pendingHomework: number;
            pendingFees: number;
            upcomingExamsCount: number;
        };
        upcomingExams: any[];
        recentMarks: ({
            subject: {
                id: string;
                isActive: boolean;
                name: string;
                tenantId: string;
            };
            exam: {
                id: string;
                name: string;
                tenantId: string;
                classSectionId: string;
                type: string;
                date: Date;
            };
        } & {
            id: string;
            tenantId: string;
            studentId: string;
            examId: string;
            subjectId: string;
            subjectType: string;
            marksObtained: import("@prisma/client/runtime/library").Decimal;
            remarks: string | null;
        })[];
        classAdvisor: any;
        subjectTeachers: any[];
    }>;
    getAttendance(req: any, studentId: string): Promise<{
        summary: {
            total: number;
            present: number;
            absent: number;
            late: number;
            excused: number;
            attendanceRate: number;
            hasAttendanceData: boolean;
            todayAttendanceSubmitted: boolean;
            todayAttendanceStatus: string;
        };
        records: {
            id: string;
            date: Date;
            status: import(".prisma/client").$Enums.AttendanceStatus;
            reason: string;
            markedBy: string;
        }[];
    }>;
    getHomework(req: any, studentId: string): Promise<{
        id: string;
        title: string;
        description: string;
        dueDate: Date;
        maxMarks: number;
        assignmentType: string;
        attachments: any[];
        subject: string;
        teacher: string;
        submitted: boolean;
        submissionStatus: string;
    }[]>;
    submitAssignment(req: any, studentId: string, homeworkId: string, data: any): Promise<{
        success: boolean;
        message: string;
        fileUrl: string;
    }>;
    getExams(req: any, studentId: string): Promise<{
        schedules: {
            id: string;
            examName: string;
            subject: string;
            examDate: Date;
            startTime: string;
            endTime: string;
            duration: number;
            examHall: string;
            instructions: string;
        }[];
        exams: {
            examName: string;
            examDate: any;
            rank: number;
            classSize: number;
            totalObtained: number;
            totalMax: any;
            percentage: number;
            overallGrade: string;
            overallGpa: number;
            overallResult: string;
            passingPercentage: number;
            configSource: "global" | "exam-specific" | "class-specific" | "system-default";
            subjects: {
                id: any;
                subject: any;
                subjectType: any;
                marksObtained: number;
                maxMarks: any;
                percentage: number;
                grade: string;
                gpa: number;
                result: string;
                remarks: any;
            }[];
        }[];
        marks: {
            id: string;
            examName: string;
            subject: string;
            marksObtained: number;
            remarks: string;
            grade: string;
        }[];
    }>;
    getFees(req: any, studentId: string): Promise<{
        summary: {
            account: {
                id: string;
                name: string;
                rollNo: string;
                phone: string;
                profilePhotoUrl: string;
                fatherName: string;
                motherName: string;
                aadharNo: string;
                class: string;
                section: string;
                classId: string;
                sectionId: string;
                opportunities: {
                    id: string;
                    academicYearId: string;
                }[];
            };
            totalFees: number;
            paidAmount: number;
            currentYearPending: number;
            previousYearPending: number;
            totalPendingBalance: number;
            pendingPercentage: number;
            paidPercentage: number;
            financialStatus: string;
            totalPaidAmount: number;
            feeSummary: {
                currentYear: {
                    feeProductsAmount: number;
                    paidAmount: number;
                    pendingAmount: number;
                };
                previousYears: {
                    academicYearName: string;
                    outstandingBalance: number;
                }[];
                overall: {
                    totalCurrentYearDue: number;
                    totalPreviousYearDue: number;
                    grandTotalBalanceDue: number;
                };
            };
        };
        invoices: {
            id: string;
            opportunityId: string;
            invoiceNo: string;
            receiptNo: string;
            invoiceDate: Date;
            dueDate: Date;
            totalAmount: number;
            paidAmount: number;
            remainingBalance: number;
            status: import(".prisma/client").$Enums.PaymentStatus;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            transactionId: string;
            description: string;
            academicYear: string;
            className: any;
            sectionName: any;
            studentName: any;
            rollNo: any;
            fatherName: any;
            motherName: any;
            items: {
                id: string;
                name: string;
                amount: number;
                oliId: string;
                productId: string;
                selectable: boolean;
            }[];
        }[];
        paymentDetails: {
            name: string;
            address: string;
            bankName: string;
            logoUrl: string;
            email: string;
            phone: string;
            subtitle: string;
            bankBranch: string;
            bankIFSC: string;
            bankAccountNo: string;
            googlePayId: string;
            phonePeId: string;
            upiQrId: string;
        };
    }>;
    payInvoice(req: any, studentId: string, invoiceId: string, data: any): Promise<{
        success: boolean;
        message: string;
        invoice: {
            id: string;
            tenantId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            bankName: string | null;
            bankBranch: string | null;
            bankIFSC: string | null;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
            studentId: string;
            invoiceDate: Date;
            dueDate: Date;
            totalAmount: import("@prisma/client/runtime/library").Decimal;
            paidAmount: import("@prisma/client/runtime/library").Decimal;
            remainingBalance: import("@prisma/client/runtime/library").Decimal;
            description: string | null;
            opportunityId: string | null;
            bankAccountNumber: string | null;
        };
        transactionId: string;
    }>;
    downloadInvoicePdf(req: any, res: any, studentId: string, invoiceId: string): Promise<void>;
    getTimetable(req: any, studentId: string): Promise<any[]>;
    getAnnouncements(req: any, studentId: string): Promise<{
        content: string;
        teacher: {
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
        };
        id: string;
        updatedAt: Date;
        tenantId: string;
        expiryDate: Date | null;
        createdAt: Date;
        classSectionId: string | null;
        title: string;
        teacherId: string;
        priority: string;
        audienceType: string;
        pinned: boolean;
        readStatus: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    getTeacherComplaints(req: any, studentId: string): Promise<({
        teacher: {
            user: {
                id: string;
                name: string;
                email: string;
                phone: string;
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
        academicYear: string;
        id: string;
        updatedAt: Date;
        tenantId: string;
        status: string;
        createdAt: Date;
        studentId: string;
        description: string | null;
        category: string;
        teacherId: string | null;
        behaviorType: string;
        priority: string;
    })[]>;
    getComplaints(req: any): Promise<{
        statusHistories: any[];
        submittedBy: {
            id: string;
            name: string;
            email: string;
        };
        assignedTo: {
            id: string;
            name: string;
        };
        id: string;
        updatedAt: Date;
        tenantId: string;
        status: string;
        createdAt: Date;
        classSectionId: string | null;
        title: string;
        description: string;
        category: string;
        academicYearId: string;
        submittedById: string;
        assignedToId: string | null;
        adminReply: string | null;
        resolutionNotes: string | null;
    }[]>;
    submitComplaint(req: any, data: any): Promise<{
        id: string;
        updatedAt: Date;
        tenantId: string;
        status: string;
        createdAt: Date;
        classSectionId: string | null;
        title: string;
        description: string;
        category: string;
        academicYearId: string;
        submittedById: string;
        assignedToId: string | null;
        adminReply: string | null;
        resolutionNotes: string | null;
    }>;
    getTransport(req: any, studentId: string): Promise<{
        busNumber: string;
        driverName: string;
        driverPhone: string;
        route: string;
        pickupTime: string;
        dropTime: string;
        liveGPS: {
            latitude: number;
            longitude: number;
            etaMinutes: number;
        };
    }>;
    getLeavesHistory(req: any, studentId: string): Promise<{
        id: string;
        leaveType: string;
        startDate: string;
        endDate: string;
        reason: string;
        status: string;
        attachmentUrl: string;
        comments: string;
        approvedBy: string;
        approvedRole: string;
        approvedDate: string;
        createdAt: Date;
        updatedAt: Date;
        statusHistories: any[];
    }[]>;
    submitLeaveRequest(req: any, studentId: string, data: any): Promise<{
        success: boolean;
        message: string;
        requestId: string;
        attachmentUrl: any;
        leave: {
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
        };
    }>;
}
