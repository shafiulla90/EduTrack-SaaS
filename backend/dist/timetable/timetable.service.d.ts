import { PrismaService } from '../prisma.service';
import { PeriodTimingDto, SaveTimetablePeriodsDto, SaveTimetableConfigDto } from './dto/timetable.dto';
import { RoleFilterHelper } from '../common/role-filter.helper';
export declare class TimetableService {
    private readonly prisma;
    private readonly roleFilterHelper;
    constructor(prisma: PrismaService, roleFilterHelper: RoleFilterHelper);
    private getTenantId;
    getMySchedule(userId: string, tenantId: string): Promise<{
        periodId: string;
        day: string;
        periodNumber: number;
        subjectName: string;
        className: string;
        classSectionId: string;
        academicYearId: string;
        startTime: string;
        endTime: string;
        frequency: string;
        isFreePeriod: boolean;
        substituteTeacherName: any;
    }[]>;
    getAcademicYears(): Promise<{
        id: string;
        isActive: boolean;
        name: string;
        tenantId: string;
        startDate: Date;
        endDate: Date;
    }[]>;
    getClasses(academicYearId?: string): Promise<{
        id: string;
        isActive: boolean;
        name: string;
        tenantId: string;
        academicYearId: string;
    }[]>;
    createClass(name: string, academicYearId?: string): Promise<{
        id: string;
        isActive: boolean;
        name: string;
        tenantId: string;
        academicYearId: string;
    }>;
    deleteClass(id: string): Promise<{
        id: string;
        isActive: boolean;
        name: string;
        tenantId: string;
        academicYearId: string;
    }>;
    getSections(): Promise<{
        id: string;
        isActive: boolean;
        name: string;
        tenantId: string;
    }[]>;
    createSection(name: string): Promise<{
        id: string;
        isActive: boolean;
        name: string;
        tenantId: string;
    }>;
    deleteSection(id: string): Promise<{
        id: string;
        isActive: boolean;
        name: string;
        tenantId: string;
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
    } & {
        id: string;
        tenantId: string;
        classId: string;
        sectionId: string;
        strength: number;
        teacherId: string | null;
    })[]>;
    createClassSection(dto: any): Promise<{
        id: string;
        tenantId: string;
        classId: string;
        sectionId: string;
        strength: number;
        teacherId: string | null;
    }>;
    getSubjects(): Promise<{
        id: string;
        isActive: boolean;
        name: string;
        tenantId: string;
    }[]>;
    createSubject(dto: any): Promise<{
        id: string;
        isActive: boolean;
        name: string;
        tenantId: string;
    }>;
    bulkCreateSubjects(subjects: any[]): Promise<{
        created: number;
        skipped: number;
    }>;
    getSubjectsForClassSection(classSectionId: string): Promise<{
        subjectId: string;
        subjectName: string;
    }[]>;
    getAllTeachers(): Promise<({
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
    })[]>;
    createTeacherWithSkills(dto: any): Promise<{
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
    bulkCreateTeachers(teachers: any[]): Promise<{
        created: number;
        skipped: number;
    }>;
    getTeachersForSubject(subjectIds: string[]): Promise<Record<string, any[]>>;
    getTeachersForSubjectInClass(subjectId: string, classSectionId: string): Promise<{
        Id: string;
        Name: string;
        teacherId: string;
        teacherName: string;
        skillLevel: string;
    }[]>;
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
    savePeriodTimings(dto: PeriodTimingDto[]): Promise<any[]>;
    getTimetableForClass(classSectionId: string, academicYearId: string, startDate?: string, endDate?: string): Promise<{
        periodId: string;
        day: string;
        periodNumber: number;
        subjectId: string;
        subjectName: string;
        teacherId: string;
        teacherName: string;
        classSectionId: string;
        academicYearId: string;
        startTime: string;
        endTime: string;
        frequency: string;
        isSubstitute: boolean;
        substituteTeacherId: string;
        substituteTeacherName: any;
        originalTeacherName: string;
    }[]>;
    saveTimetablePeriods(dto: SaveTimetablePeriodsDto): Promise<{
        success: boolean;
        count: number;
    }>;
    saveSubstituteForPeriod(periodId: string, substituteTeacherId: string): Promise<{
        id: string;
        tenantId: string;
        classSectionId: string;
        subjectId: string;
        teacherId: string;
        dayOfWeek: string;
        substituteTeacherId: string | null;
        periodTimingId: string;
    }>;
    getWorkloadSummary(academicYearId: string): Promise<{
        totalClassSections: number;
        totalTeachers: number;
        totalAssignments: number;
        avgLoadPercent: number;
    }>;
    getAllTeacherWorkloads(): Promise<{
        teacherId: string;
        teacherName: string;
        subjectCount: number;
        classCount: number;
        totalPeriods: number;
        loadPercent: number;
        subjectsTaught: string[];
    }[]>;
    getAllClassWorkloads(): Promise<{
        classSectionId: string;
        name: string;
        academicYear: string;
        subjectCount: number;
        staffedCount: number;
        loadPercent: number;
    }[]>;
    getTeacherWorkload(id: string): Promise<{
        classes: any[];
        totalAssignments: number;
    }>;
    getClassSectionWorkload(id: string): Promise<{
        name: string;
        academicYear: string;
        subjectCount: number;
        teacherCount: number;
        loadPercent: number;
        subjects: any[];
    }>;
    updateTeacherAssignment(id: string, newTeacherId: string, periodsPerWeek: number): Promise<{
        id: string;
        tenantId: string;
        classSectionId: string;
        subjectId: string;
        teacherId: string;
        periodsPerWeek: number;
    }>;
    deleteTeacherAssignment(id: string): Promise<{
        id: string;
        tenantId: string;
        classSectionId: string;
        subjectId: string;
        teacherId: string;
        periodsPerWeek: number;
    }>;
    getTeacherSkills(id: string): Promise<{
        id: string;
        subjectId: string;
        subjectName: string;
        skillLevel: string;
        yearsOfExperience: number;
    }[]>;
    getSkillLevelOptions(): Promise<string[]>;
    getPeriodsForTeacher(teacherId: string): Promise<{
        periodId: string;
        day: string;
        periodNumber: number;
        subjectName: string;
        className: string;
        classSectionId: string;
        academicYearId: string;
        startTime: string;
        endTime: string;
        frequency: string;
        isFreePeriod: boolean;
        substituteTeacherName: any;
    }[]>;
    getPeriodsForTeacherWithGaps(teacherId: string): Promise<{
        periodId: string;
        day: string;
        periodNumber: number;
        subjectName: string;
        className: string;
        classSectionId: string;
        academicYearId: string;
        startTime: string;
        endTime: string;
        frequency: string;
        isFreePeriod: boolean;
        substituteTeacherName: any;
    }[]>;
    getLeaserPeriodsForTeacher(teacherId: string): Promise<{
        periodId: string;
        day: string;
        periodNumber: number;
        subjectName: string;
        className: string;
        classSectionId: string;
        startTime: string;
        endTime: string;
        frequency: string;
        isLeaser: boolean;
        leaserType: string;
    }[]>;
    getTimetableConfig(): Promise<{
        id: string;
        updatedAt: Date;
        tenantId: string;
        createdAt: Date;
        workingDays: string[];
        schoolStartTime: string;
        schoolEndTime: string;
        periodDuration: number;
        autoGenerate: boolean;
        numPeriods: number;
    }>;
    checkExistingTimetables(): Promise<{
        hasExistingTimetables: boolean;
    }>;
    saveTimetableConfig(dto: SaveTimetableConfigDto): Promise<{
        config: {
            id: string;
            updatedAt: Date;
            tenantId: string;
            createdAt: Date;
            workingDays: string[];
            schoolStartTime: string;
            schoolEndTime: string;
            periodDuration: number;
            autoGenerate: boolean;
            numPeriods: number;
        };
        periods: any[];
    }>;
}
