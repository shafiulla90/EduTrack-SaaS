import { StudentsService } from './students.service';
export declare class StudentsController {
    private studentsService;
    constructor(studentsService: StudentsService);
    create(data: any): Promise<{
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
        profile: {
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
        };
    }>;
    search(search?: string, classId?: string, sectionId?: string, academicYearId?: string, page?: string, limit?: string): Promise<{
        paidAmount: any;
        balanceDue: any;
        totalFees: any;
        pendingPercentage: any;
        paidPercentage: any;
        financialStatus: any;
        feeSummary: any;
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
        classSection: {
            class: {
                id: string;
                name: string;
                academicYearId: string;
            };
            section: {
                id: string;
                name: string;
            };
            id: string;
            classId: string;
            sectionId: string;
        };
        id: string;
        tenantId: string;
        rollNo: string;
        fatherName: string;
        motherName: string;
        aadharNo: string;
        profilePhotoUrl: string;
        classSectionId: string;
    }[] | {
        data: {
            paidAmount: any;
            balanceDue: any;
            totalFees: any;
            pendingPercentage: any;
            paidPercentage: any;
            financialStatus: any;
            feeSummary: any;
            user: {
                id: string;
                name: string;
                email: string;
                phone: string;
            };
            classSection: {
                class: {
                    id: string;
                    name: string;
                    academicYearId: string;
                };
                section: {
                    id: string;
                    name: string;
                };
                id: string;
                classId: string;
                sectionId: string;
            };
            id: string;
            tenantId: string;
            rollNo: string;
            fatherName: string;
            motherName: string;
            aadharNo: string;
            profilePhotoUrl: string;
            classSectionId: string;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getPromotionCandidates(sourceYearId: string, className?: string, sectionName?: string): Promise<{
        id: string;
        name: string;
        email: string;
        rollNo: string;
        class: string;
        section: string;
        fatherName: string;
        motherName: string;
        aadharNo: string;
        phone: string;
        balanceDue: number;
        paidAmount: number;
        totalFees: number;
        pendingPercentage: number;
        paidPercentage: number;
        financialStatus: string;
        parentEmail: string;
        profilePhotoUrl: string;
    }[]>;
    promote(studentIds: string[], sourceYearId: string, targetYearId: string, targetClassName: string, targetSectionName?: string): Promise<{
        success: boolean;
        promotedCount: number;
        studentsWithCarriedForwardDues: number;
        totalCarriedForwardAmount: number;
        studentOutstandingBalances: any[];
    }>;
    validatePromotion(studentIds: string[], sourceYearId: string): Promise<{
        totalSelected: number;
        studentsWithPendingDue: number;
        studentsWithNoDue: number;
        totalOutstandingDue: number;
        totalCarriedForwardAmount: number;
        dueList: any[];
    }>;
    getParents(): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
        students: ({
            user: {
                name: string;
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
        })[];
    } & {
        id: string;
        userId: string;
        emergencyContact: string | null;
    })[]>;
    getDetails(id: string, academicYearId?: string): Promise<{
        paidAmount: number;
        balanceDue: number;
        totalFees: number;
        pendingPercentage: number;
        paidPercentage: number;
        financialStatus: string;
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
        feeItems: any[];
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
        parentProfile: {
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
            userId: string;
            emergencyContact: string | null;
        };
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
        attendances: ({
            attendanceSession: {
                id: string;
                updatedAt: Date;
                tenantId: string;
                createdAt: Date;
                classSectionId: string;
                date: Date;
                takenById: string;
                presentCount: number;
                absentCount: number;
                totalStudents: number;
            };
        } & {
            id: string;
            tenantId: string;
            status: import(".prisma/client").$Enums.AttendanceStatus;
            studentId: string;
            reason: string | null;
            attendanceSessionId: string;
        })[];
        examMarks: ({
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
        invoices: ({
            opportunity: {
                academicYear: {
                    id: string;
                    isActive: boolean;
                    name: string;
                    tenantId: string;
                    startDate: Date;
                    endDate: Date;
                };
            } & {
                id: string;
                updatedAt: Date;
                name: string;
                tenantId: string;
                createdAt: Date;
                studentId: string;
                academicYearId: string | null;
                classId: string | null;
                sectionId: string | null;
                stageName: string;
                closeDate: Date;
                totalPaidAmount: import("@prisma/client/runtime/library").Decimal;
            };
            invoiceItems: {
                amount: import("@prisma/client/runtime/library").Decimal;
                id: string;
                name: string;
                tenantId: string;
                invoiceId: string;
                productId: string | null;
                opportunityLineItemId: string | null;
            }[];
        } & {
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
        })[];
        opportunities: ({
            opportunityLineItems: ({
                product: {
                    id: string;
                    isActive: boolean;
                    updatedAt: Date;
                    name: string;
                    tenantId: string;
                    createdAt: Date;
                    description: string | null;
                    productCode: string | null;
                };
            } & {
                id: string;
                updatedAt: Date;
                tenantId: string;
                createdAt: Date;
                opportunityId: string;
                productId: string;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                pricebookEntryId: string;
                quantity: import("@prisma/client/runtime/library").Decimal;
                discount: import("@prisma/client/runtime/library").Decimal;
            })[];
        } & {
            id: string;
            updatedAt: Date;
            name: string;
            tenantId: string;
            createdAt: Date;
            studentId: string;
            academicYearId: string | null;
            classId: string | null;
            sectionId: string | null;
            stageName: string;
            closeDate: Date;
            totalPaidAmount: import("@prisma/client/runtime/library").Decimal;
        })[];
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
    }>;
    updateStudent(id: string, data: any): Promise<{
        paidAmount: number;
        balanceDue: number;
        totalFees: number;
        pendingPercentage: number;
        paidPercentage: number;
        financialStatus: string;
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
        feeItems: any[];
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
        parentProfile: {
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
            userId: string;
            emergencyContact: string | null;
        };
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
        attendances: ({
            attendanceSession: {
                id: string;
                updatedAt: Date;
                tenantId: string;
                createdAt: Date;
                classSectionId: string;
                date: Date;
                takenById: string;
                presentCount: number;
                absentCount: number;
                totalStudents: number;
            };
        } & {
            id: string;
            tenantId: string;
            status: import(".prisma/client").$Enums.AttendanceStatus;
            studentId: string;
            reason: string | null;
            attendanceSessionId: string;
        })[];
        examMarks: ({
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
        invoices: ({
            opportunity: {
                academicYear: {
                    id: string;
                    isActive: boolean;
                    name: string;
                    tenantId: string;
                    startDate: Date;
                    endDate: Date;
                };
            } & {
                id: string;
                updatedAt: Date;
                name: string;
                tenantId: string;
                createdAt: Date;
                studentId: string;
                academicYearId: string | null;
                classId: string | null;
                sectionId: string | null;
                stageName: string;
                closeDate: Date;
                totalPaidAmount: import("@prisma/client/runtime/library").Decimal;
            };
            invoiceItems: {
                amount: import("@prisma/client/runtime/library").Decimal;
                id: string;
                name: string;
                tenantId: string;
                invoiceId: string;
                productId: string | null;
                opportunityLineItemId: string | null;
            }[];
        } & {
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
        })[];
        opportunities: ({
            opportunityLineItems: ({
                product: {
                    id: string;
                    isActive: boolean;
                    updatedAt: Date;
                    name: string;
                    tenantId: string;
                    createdAt: Date;
                    description: string | null;
                    productCode: string | null;
                };
            } & {
                id: string;
                updatedAt: Date;
                tenantId: string;
                createdAt: Date;
                opportunityId: string;
                productId: string;
                unitPrice: import("@prisma/client/runtime/library").Decimal;
                pricebookEntryId: string;
                quantity: import("@prisma/client/runtime/library").Decimal;
                discount: import("@prisma/client/runtime/library").Decimal;
            })[];
        } & {
            id: string;
            updatedAt: Date;
            name: string;
            tenantId: string;
            createdAt: Date;
            studentId: string;
            academicYearId: string | null;
            classId: string | null;
            sectionId: string | null;
            stageName: string;
            closeDate: Date;
            totalPaidAmount: import("@prisma/client/runtime/library").Decimal;
        })[];
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
    }>;
    deleteStudent(id: string): Promise<{
        success: boolean;
    }>;
    bulkDelete(req: any, studentIds: string[]): Promise<{
        success: boolean;
        count: number;
    }>;
    importBulk(students: any[]): Promise<{
        totalRows: number;
        successCount: number;
        errors: string[];
    }>;
}
