import { ComplaintBoxService } from './complaint-box.service';
import { CreateBehaviorDto } from './dto/create-behavior.dto';
import { UpdateCaseStatusDto } from './dto/update-case-status.dto';
export declare class ComplaintBoxController {
    private readonly complaintBoxService;
    constructor(complaintBoxService: ComplaintBoxService);
    getCurrentTeacher(): Promise<{
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
    getStudentClasses(): Promise<({
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
    })[]>;
    getTeachers(): Promise<({
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
    })[]>;
    getStudentsByClass(classSectionId: string): Promise<({
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
    searchStudents(searchTerm?: string, classId?: string, sectionId?: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
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
    submitStudentBehavior(dto: CreateBehaviorDto): Promise<{
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
    }>;
    getAcademicYears(): Promise<{
        id: string;
        isActive: boolean;
        name: string;
        tenantId: string;
        startDate: Date;
        endDate: Date;
    }[]>;
    getPendingCases(academicYear?: string): Promise<({
        teacher: {
            user: {
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
        student: {
            user: {
                name: string;
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
    getStudentCases(studentId: string, academicYear?: string): Promise<({
        teacher: {
            user: {
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
        student: {
            user: {
                name: string;
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
    updateCaseStatus(caseId: string, dto: UpdateCaseStatusDto): Promise<{
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
    }>;
    getStudentStats(studentId: string): Promise<{
        studentId: string;
        totalCases: number;
        complaintCount: number;
        praiseCount: number;
        resolvedCount: number;
    }>;
    updateBehavior(caseId: string, dto: CreateBehaviorDto): Promise<{
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
    }>;
    deleteBehavior(caseId: string): Promise<{
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
    }>;
    getParentComplaints(status?: string): Promise<{
        statusHistories: any[];
        academicYear: {
            id: string;
            name: string;
        };
        submittedBy: {
            id: string;
            name: string;
            email: string;
            phone: string;
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
    updateParentComplaintStatus(id: string, data: any): Promise<{
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
}
