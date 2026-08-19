import { AcademicsService } from './academics.service';
export declare class AcademicsController {
    private readonly academicsService;
    constructor(academicsService: AcademicsService);
    createYear(name: string, startDate: any, endDate: any, isActive: boolean, req: any): Promise<any>;
    getYears(req: any): Promise<any[]>;
    toggleYearActive(id: string, req: any): Promise<any>;
    setYearActive(id: string, req: any): Promise<any>;
    createClass(name: string, academicYearId: string, req: any): Promise<any>;
    getClasses(academicYearId?: string, req?: any): Promise<any[]>;
    getClassStudentCount(id: string): Promise<{
        classId: string;
        count: number;
        studentCount: number;
    }>;
    deleteClass(id: string): Promise<any>;
    createSection(name: string, req?: any): Promise<any>;
    getSections(req?: any): Promise<any[]>;
    deleteSection(id: string): Promise<any>;
    createClassSection(classId: string, sectionId: string, teacherId?: string, req?: any): Promise<any>;
    getClassSections(req?: any): Promise<any[]>;
    createSubject(name: string, req?: any): Promise<any>;
    getSubjects(req?: any): Promise<any[]>;
    deleteSubject(id: string): Promise<any>;
    addSubjectToClassSection(classSectionId: string, subjectId: string): Promise<{
        success: boolean;
        classSectionId: string;
        subjectId: string;
    }>;
    getClassSectionSubjects(classSectionId: string): Promise<any[]>;
    removeSubjectFromClassSection(classSectionId: string, subjectId: string): Promise<{
        success: boolean;
        classSectionId: string;
        subjectId: string;
    }>;
}
