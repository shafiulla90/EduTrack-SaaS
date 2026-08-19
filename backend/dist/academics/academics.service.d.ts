import { PrismaService } from '../prisma.service';
export declare class AcademicsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getTenantId;
    createAcademicYear(name: string, startDate: Date, endDate: Date, isActive: boolean): Promise<{
        id: string;
        isActive: boolean;
        name: string;
        tenantId: string;
        startDate: Date;
        endDate: Date;
    }>;
    getAcademicYears(): Promise<{
        id: string;
        isActive: boolean;
        name: string;
        tenantId: string;
        startDate: Date;
        endDate: Date;
    }[]>;
    toggleAcademicYearActive(id: string): Promise<{
        id: string;
        isActive: boolean;
        name: string;
        tenantId: string;
        startDate: Date;
        endDate: Date;
    }>;
    createClass(name: string, academicYearId: string): Promise<{
        id: string;
        isActive: boolean;
        name: string;
        tenantId: string;
        academicYearId: string;
    }>;
    getClasses(academicYearId?: string): Promise<({
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
        isActive: boolean;
        name: string;
        tenantId: string;
        academicYearId: string;
    })[]>;
    getClassStudentCount(id: string): Promise<{
        count: number;
    }>;
    deleteClass(id: string): Promise<{
        id: string;
        isActive: boolean;
        name: string;
        tenantId: string;
        academicYearId: string;
    }>;
    createSection(name: string): Promise<{
        id: string;
        isActive: boolean;
        name: string;
        tenantId: string;
    }>;
    getSections(): Promise<{
        id: string;
        isActive: boolean;
        name: string;
        tenantId: string;
    }[]>;
    createClassSection(classId: string, sectionId: string, teacherId?: string): Promise<{
        id: string;
        tenantId: string;
        classId: string;
        sectionId: string;
        strength: number;
        teacherId: string | null;
    }>;
    getClassSections(): Promise<({
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
    } & {
        id: string;
        tenantId: string;
        classId: string;
        sectionId: string;
        strength: number;
        teacherId: string | null;
    })[]>;
    createSubject(name: string): Promise<{
        id: string;
        isActive: boolean;
        name: string;
        tenantId: string;
    }>;
    getSubjects(): Promise<{
        id: string;
        isActive: boolean;
        name: string;
        tenantId: string;
    }[]>;
    addSubjectToClassSection(classSectionId: string, subjectId: string): Promise<{
        id: string;
        tenantId: string;
        classSectionId: string;
        subjectId: string;
    }>;
    getClassSubjects(classSectionId: string): Promise<({
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
    })[]>;
    removeSubjectFromClassSection(classSectionId: string, subjectId: string): Promise<{
        id: string;
        tenantId: string;
        classSectionId: string;
        subjectId: string;
    }>;
    createPeriodTiming(periodNumber: number, startTime: string, endTime: string, isActive: boolean): Promise<{
        id: string;
        isActive: boolean;
        name: string;
        tenantId: string;
        periodNumber: number;
        isBreak: boolean;
        startTime: string;
        endTime: string;
    }>;
    getPeriodTimings(): Promise<{
        id: string;
        isActive: boolean;
        name: string;
        tenantId: string;
        periodNumber: number;
        isBreak: boolean;
        startTime: string;
        endTime: string;
    }[]>;
    createPeriod(data: any): Promise<{
        id: string;
        tenantId: string;
        classSectionId: string;
        subjectId: string;
        teacherId: string;
        dayOfWeek: string;
        substituteTeacherId: string | null;
        periodTimingId: string;
    }>;
    getPeriodsByClassSection(classSectionId: string): Promise<({
        subject: {
            id: string;
            isActive: boolean;
            name: string;
            tenantId: string;
        };
        periodTiming: {
            id: string;
            isActive: boolean;
            name: string;
            tenantId: string;
            periodNumber: number;
            isBreak: boolean;
            startTime: string;
            endTime: string;
        };
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
        substituteTeacher: {
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
    getPeriodsByTeacher(teacherId: string): Promise<({
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
        periodTiming: {
            id: string;
            isActive: boolean;
            name: string;
            tenantId: string;
            periodNumber: number;
            isBreak: boolean;
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
