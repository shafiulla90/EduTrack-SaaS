import { IAcademicRepository } from '../../common/interfaces/academic.repository.interface';
export declare class AcademicsService {
    private readonly academicRepo;
    constructor(academicRepo: IAcademicRepository);
    createAcademicYear(name: string, startDate?: any, endDate?: any, isActive?: boolean, tenantId?: string): Promise<any>;
    getAcademicYears(tenantId?: string): Promise<any[]>;
    toggleAcademicYearActive(id: string, tenantId?: string): Promise<any>;
    createClass(name: string, academicYearId?: string, tenantId?: string): Promise<any>;
    getClasses(academicYearId?: string, tenantId?: string): Promise<any[]>;
    getClassStudentCount(id: string): Promise<{
        classId: string;
        count: number;
        studentCount: number;
    }>;
    deleteClass(id: string): Promise<any>;
    createSection(name: string, tenantId?: string): Promise<any>;
    getSections(tenantId?: string): Promise<any[]>;
    deleteSection(id: string): Promise<any>;
    createClassSection(classId: string, sectionId: string, teacherId?: string, tenantId?: string): Promise<any>;
    getClassSections(tenantId?: string): Promise<any[]>;
    createSubject(name: string, tenantId?: string): Promise<any>;
    getSubjects(tenantId?: string): Promise<any[]>;
    deleteSubject(id: string): Promise<any>;
    addSubjectToClassSection(classSectionId: string, subjectId: string): Promise<{
        success: boolean;
        classSectionId: string;
        subjectId: string;
    }>;
    getClassSubjects(classSectionId: string): Promise<any[]>;
    removeSubjectFromClassSection(classSectionId: string, subjectId: string): Promise<{
        success: boolean;
        classSectionId: string;
        subjectId: string;
    }>;
    createPeriodTiming(periodNumber: number, startTime: string, endTime: string, isActive: boolean): Promise<{
        periodNumber: number;
        startTime: string;
        endTime: string;
        isActive: boolean;
    }>;
    getPeriodTimings(): Promise<any[]>;
    createPeriod(data: any): Promise<any>;
    getPeriodsByClassSection(classSectionId: string): Promise<any[]>;
    getPeriodsByTeacher(teacherId: string): Promise<any[]>;
}
