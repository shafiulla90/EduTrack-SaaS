import { TeachersService } from './teachers.service';
export declare class TeachersController {
    private teachersService;
    constructor(teachersService: TeachersService);
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
    }>;
    getTeachingStaff(): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
            role: import(".prisma/client").$Enums.Role;
            avatarUrl: string;
        };
        _count: {
            teacherAssignments: number;
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
    getAll(department?: string, status?: string, search?: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
            role: import(".prisma/client").$Enums.Role;
            avatarUrl: string;
        };
        teacherSkills: ({
            subject: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            tenantId: string;
            subjectId: string;
            teacherId: string;
            skillLevel: string | null;
            yearsOfExperience: number | null;
        })[];
        _count: {
            teacherAssignments: number;
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
    assign(id: string, classSectionId: string, subjectId: string, periodsPerWeek: number): Promise<{
        id: string;
        tenantId: string;
        classSectionId: string;
        subjectId: string;
        teacherId: string;
        periodsPerWeek: number;
    }>;
    getAssignments(id: string): Promise<({
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
    })[]>;
    addSkill(id: string, subjectId: string, skillLevel: string, yearsOfExperience: number): Promise<{
        id: string;
        tenantId: string;
        subjectId: string;
        teacherId: string;
        skillLevel: string | null;
        yearsOfExperience: number | null;
    }>;
    getSkills(id: string): Promise<({
        subject: {
            id: string;
            isActive: boolean;
            name: string;
            tenantId: string;
        };
    } & {
        id: string;
        tenantId: string;
        subjectId: string;
        teacherId: string;
        skillLevel: string | null;
        yearsOfExperience: number | null;
    })[]>;
    update(id: string, data: any): Promise<{
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
    remove(id: string): Promise<{
        success: boolean;
    }>;
    paySalary(id: string, month: string): Promise<{
        amount: import("@prisma/client/runtime/library").Decimal;
        id: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        description: string | null;
        category: string;
        date: Date;
        paymentMode: string;
    }>;
    payAllSalaries(month: string): Promise<any[]>;
    getSalaryInvoices(id: string): Promise<{
        amount: import("@prisma/client/runtime/library").Decimal;
        id: string;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        description: string;
        category: string;
        date: Date;
    }[]>;
    getTeacherCases(id: string): Promise<({
        student: {
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
    getTeacherSchedule(id: string): Promise<({
        classSection: {
            class: {
                name: string;
            };
            section: {
                name: string;
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
            name: string;
        };
        periodTiming: {
            periodNumber: number;
            startTime: string;
            endTime: string;
        };
    } & {
        id: string;
        tenantId: string;
        classSectionId: string;
        subjectId: string;
        teacherId: string;
        dayOfWeek: string;
        substituteTeacherId: string | null;
        periodTimingId: string;
    })[]>;
}
