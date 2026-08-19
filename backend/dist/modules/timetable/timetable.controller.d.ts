import { TimetableService } from './timetable.service';
import { CreateClassDto, CreateSectionDto, CreateSubjectDto, BulkSubjectsInputDto, CreateTeacherWithSkillsDto, BulkTeachersInputDto, CreateClassSectionDto, UpdateTeacherAssignmentDto, SaveSubstituteDto, SaveTimetablePeriodsDto, PeriodTimingDto } from './dto/timetable.dto';
export declare class TimetableController {
    private readonly timetableService;
    constructor(timetableService: TimetableService);
    private getTenantId;
    getAcademicYears(req: any): Promise<any>;
    getClasses(req: any): Promise<any>;
    createClass(dto: CreateClassDto, req: any): Promise<any>;
    deleteClass(id: string, req: any): Promise<any>;
    getSections(req: any): Promise<any>;
    createSection(dto: CreateSectionDto, req: any): Promise<any>;
    deleteSection(id: string, req: any): Promise<any>;
    getPeriodTimings(req: any): Promise<any>;
    savePeriodTimings(dto: PeriodTimingDto[], req: any): Promise<any>;
    getTimetableConfig(req: any): Promise<FirebaseFirestore.DocumentData>;
    checkExistingTimetables(req: any): Promise<{
        hasExistingTimetables: boolean;
    }>;
    saveTimetableConfig(dto: any, req: any): Promise<any>;
    getSubjects(req: any): Promise<any>;
    createSubject(dto: CreateSubjectDto, req: any): Promise<any>;
    deleteSubject(id: string, req: any): Promise<any>;
    bulkCreateSubjects(dto: BulkSubjectsInputDto, req: any): Promise<{
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
    getTeachersForSubject(subjectIds: string, req: any): Promise<Record<string, any[]>>;
    createTeacher(dto: CreateTeacherWithSkillsDto, req: any): Promise<any>;
    bulkCreateTeachers(dto: BulkTeachersInputDto, req: any): Promise<{
        created: number;
        skipped: number;
        errors: number;
        errorDetails: string[];
        skippedNames: string[];
        skillsCreated: number;
    }>;
    getWorkloadSummary(academicYearId: string, req: any): Promise<{
        totalClassSections: any;
        totalTeachers: number;
        totalAssignments: any;
        avgLoadPercent: number;
    }>;
    getAllTeacherWorkloads(req: any): Promise<any>;
    getAllClassWorkloads(req: any): Promise<any>;
    getTeacherWorkload(id: string, req: any): Promise<{
        teacherName: any;
        classes: any[];
    }>;
    getClassSectionWorkload(id: string, req: any): Promise<{
        name: string;
        academicYear: any;
        teacherCount: number;
        subjects: any;
    }>;
    updateTeacherAssignment(id: string, dto: UpdateTeacherAssignmentDto, req: any): Promise<any>;
    deleteTeacherAssignment(id: string, req: any): Promise<any>;
    createClassSection(dto: CreateClassSectionDto, req: any): Promise<any>;
    getAllClassSections(req: any): Promise<any>;
    getAllTeachers(req: any): Promise<any>;
    getPeriodsForClassSection(classSectionId: string, academicYearId: string, req: any, startDate?: string, endDate?: string): Promise<Record<string, any>>;
    getPeriodsForTeacher(teacherId: string, gaps: string, req: any): Promise<any[]>;
    getLeaserPeriodsForTeacher(teacherId: string, req: any): Promise<any>;
    saveSubstituteForPeriod(dto: SaveSubstituteDto, req: any): Promise<any>;
    saveTimetablePeriods(dto: SaveTimetablePeriodsDto, req: any): Promise<any>;
}
