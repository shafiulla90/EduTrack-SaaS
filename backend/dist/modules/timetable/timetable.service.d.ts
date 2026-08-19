import { FirebaseService } from '../../database/firebase.service';
import { IAcademicRepository } from '../../common/interfaces/academic.repository.interface';
import { IUserRepository } from '../../common/interfaces/user.repository.interface';
import { ITeacherRepository } from '../../common/interfaces/teacher.repository.interface';
export declare class TimetableService {
    private readonly academicRepo;
    private readonly userRepo;
    private readonly teacherRepo;
    private readonly firebase?;
    private readonly prisma?;
    constructor(academicRepo: IAcademicRepository, userRepo: IUserRepository, teacherRepo: ITeacherRepository, firebase?: FirebaseService);
    getAcademicYears(tenantId: string): Promise<any>;
    getClasses(tenantId: string): Promise<any>;
    createClass(tenantId: string, name: string): Promise<any>;
    deleteClass(tenantId: string, classId: string): Promise<any>;
    getSections(tenantId: string): Promise<any>;
    createSection(tenantId: string, name: string): Promise<any>;
    deleteSection(tenantId: string, sectionId: string): Promise<any>;
    getPeriodTimings(tenantId: string): Promise<any>;
    savePeriodTimings(tenantId: string, timings: any[]): Promise<any>;
    getSubjects(tenantId: string): Promise<any>;
    createSubject(tenantId: string, data: {
        name: string;
        code?: string;
        description?: string;
    }): Promise<any>;
    deleteSubject(tenantId: string, id: string): Promise<any>;
    bulkCreateSubjects(tenantId: string, subjectsData: any[]): Promise<{
        created: number;
        skipped: number;
        errors: number;
        errorDetails: any[];
        skippedNames?: undefined;
    } | {
        created: number;
        skipped: number;
        errors: number;
        errorDetails: string[];
        skippedNames: string[];
    }>;
    getTimetableConfig(tenantId: string): Promise<FirebaseFirestore.DocumentData>;
    checkExistingTimetables(tenantId: string): Promise<{
        hasExistingTimetables: boolean;
    }>;
    saveTimetableConfig(tenantId: string, data: any): Promise<any>;
    getTeachersForSubject(tenantId: string, subjectIds: string[]): Promise<Record<string, any[]>>;
    createTeacherWithSkills(tenantId: string, data: any): Promise<any>;
    bulkCreateTeachers(tenantId: string, teachersData: any[]): Promise<{
        created: number;
        skipped: number;
        errors: number;
        errorDetails: string[];
        skippedNames: string[];
        skillsCreated: number;
    }>;
    getWorkloadSummary(tenantId: string, academicYearId?: string): Promise<{
        totalClassSections: any;
        totalTeachers: number;
        totalAssignments: any;
        avgLoadPercent: number;
    }>;
    getAllTeacherWorkloads(tenantId: string): Promise<any>;
    getAllClassWorkloads(tenantId: string): Promise<any>;
    getTeacherWorkload(tenantId: string, teacherId: string): Promise<{
        teacherName: any;
        classes: any[];
    }>;
    getClassSectionWorkload(tenantId: string, classSectionId: string): Promise<{
        name: string;
        academicYear: any;
        teacherCount: number;
        subjects: any;
    }>;
    updateTeacherAssignment(tenantId: string, id: string, newTeacherId?: string, periodsPerWeek?: number): Promise<any>;
    deleteTeacherAssignment(tenantId: string, id: string): Promise<any>;
    createClassSection(tenantId: string, data: any): Promise<any>;
    getAllClassSections(tenantId: string): Promise<any>;
    getAllTeachers(tenantId: string): Promise<any>;
    getTimetableForClass(tenantId: string, classSectionId: string, academicYearId: string, startDate?: string, endDate?: string): Promise<Record<string, any>>;
    getLeaserPeriodsForTeacher(tenantId: string, teacherId: string): Promise<any>;
    getPeriodsForTeacher(tenantId: string, teacherId: string): Promise<any[]>;
    getPeriodsForTeacherWithGaps(tenantId: string, teacherId: string): Promise<any[]>;
    saveSubstituteForPeriod(tenantId: string, periodId: string, substituteTeacherId?: string): Promise<any>;
    saveTimetablePeriods(tenantId: string, data: any): Promise<any>;
}
