import { TimetableService } from './timetable.service';
import { CreateClassDto, CreateSectionDto, CreateSubjectDto, BulkSubjectsInputDto, CreateTeacherWithSkillsDto, BulkTeachersInputDto, CreateClassSectionDto, UpdateTeacherAssignmentDto, SaveSubstituteDto, SaveTimetablePeriodsDto, PeriodTimingDto, SaveTimetableConfigDto } from './dto/timetable.dto';
export declare class TimetableController {
    private readonly timetableService;
    constructor(timetableService: TimetableService);
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
    createClass(dto: CreateClassDto): Promise<{
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
    createSection(dto: CreateSectionDto): Promise<{
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
    getSubjects(): Promise<{
        id: string;
        isActive: boolean;
        name: string;
        tenantId: string;
    }[]>;
    createSubject(dto: CreateSubjectDto): Promise<{
        id: string;
        isActive: boolean;
        name: string;
        tenantId: string;
    }>;
    bulkCreateSubjects(dto: BulkSubjectsInputDto): Promise<{
        created: number;
        skipped: number;
    }>;
    getTeachersForSubject(subjectIds: string): Promise<Record<string, any[]>>;
    createTeacher(dto: CreateTeacherWithSkillsDto): Promise<{
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
    bulkCreateTeachers(dto: BulkTeachersInputDto): Promise<{
        created: number;
        skipped: number;
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
    updateTeacherAssignment(id: string, dto: UpdateTeacherAssignmentDto): Promise<{
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
    createClassSection(dto: CreateClassSectionDto): Promise<{
        id: string;
        tenantId: string;
        classId: string;
        sectionId: string;
        strength: number;
        teacherId: string | null;
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
    getPeriodsForClassSection(classSectionId: string, academicYearId: string, startDate?: string, endDate?: string): Promise<{
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
    getPeriodsForTeacher(teacherId: string, gaps: string): Promise<{
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
    saveSubstituteForPeriod(dto: SaveSubstituteDto): Promise<{
        id: string;
        tenantId: string;
        classSectionId: string;
        subjectId: string;
        teacherId: string;
        dayOfWeek: string;
        substituteTeacherId: string | null;
        periodTimingId: string;
    }>;
    saveTimetablePeriods(dto: SaveTimetablePeriodsDto): Promise<{
        success: boolean;
        count: number;
    }>;
    getTeacherSkills(id: string): Promise<{
        id: string;
        subjectId: string;
        subjectName: string;
        skillLevel: string;
        yearsOfExperience: number;
    }[]>;
    getTeachersForSubjectInClass(subjectId: string, classSectionId: string): Promise<{
        Id: string;
        Name: string;
        teacherId: string;
        teacherName: string;
        skillLevel: string;
    }[]>;
    getSkillLevelOptions(): Promise<string[]>;
    getMySchedule(req: any): Promise<{
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
}
