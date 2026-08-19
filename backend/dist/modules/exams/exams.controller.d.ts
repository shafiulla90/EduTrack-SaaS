import { ExamsService } from './exams.service';
export declare class ExamsController {
    private readonly examsService;
    constructor(examsService: ExamsService);
    getSubjects(req?: any): Promise<{
        id: string;
    }[] | {
        id: string;
        name: string;
        code: string;
    }[]>;
    getStudentReportCard(studentId: string, req?: any): Promise<{
        success: boolean;
        student: any;
        marks: any[];
        academicYear: string;
        summary: {
            totalMarks: number;
            obtainedMarks: number;
            percentage: number;
            grade: string;
            rank: number;
        };
    }>;
    create(name: string, type: string, classSectionId: string, date: Date, req: any): Promise<any>;
    getAll(classSectionId?: string, req?: any): Promise<any[]>;
    getExamTypes(req?: any): Promise<any[]>;
    getExamTypesManage(req?: any): Promise<any[]>;
    createExamType(name: string, req?: any): Promise<any>;
    updateExamType(id: string, name: string, req?: any): Promise<any>;
    deleteExamType(id: string, req?: any): Promise<any>;
    saveMarks(marks: any[], examName: string, classSectionId: string, subjectId: string, req?: any): Promise<{
        success: boolean;
        count: number;
        marks: any[];
    }>;
    getReport(classSectionId: string, examName: string): Promise<{
        classSectionId: string;
        examName: string;
        report: any[];
    }>;
}
