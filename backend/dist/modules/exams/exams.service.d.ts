import { IExamRepository } from '../../common/interfaces/exam.repository.interface';
import { FirebaseService } from '../../database/firebase.service';
export declare class ExamsService {
    private readonly examRepo;
    private readonly firebase;
    constructor(examRepo: IExamRepository, firebase: FirebaseService);
    private get db();
    getSubjects(tenantId?: string): Promise<{
        id: string;
    }[] | {
        id: string;
        name: string;
        code: string;
    }[]>;
    getComponents(tenantId?: string): Promise<{
        id: string;
        name: string;
        weightage: number;
    }[]>;
    getMarksEntryRoster(tenantId: string, subjectId: string, examName: string, classSectionId: string, subjectType?: string): Promise<{
        roster: {
            studentId: any;
            rollNo: any;
            studentName: any;
            marksObtained: any;
            remarks: any;
            status: any;
        }[];
        config: {
            maxMarks: number;
            passingPercentage: number;
        };
    }>;
    saveRosterMarks(tenantId: string, body: any): Promise<{
        success: boolean;
        count: number;
        message: string;
    }>;
    getStudentReportCard(tenantId: string, studentId: string): Promise<{
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
    createExam(name: string, type: string, classSectionId: string, date: Date, tenantId?: string): Promise<any>;
    getExams(classSectionId?: string, tenantId?: string): Promise<any[]>;
    getExamTypes(tenantId?: string): Promise<any[]>;
    createExamType(name: string, tenantId?: string): Promise<any>;
    updateExamType(id: string, name: string, tenantId?: string): Promise<any>;
    deleteExamType(id: string, tenantId?: string): Promise<any>;
    saveMarks(marks: any[], examName: string, classSectionId: string, subjectId: string, tenantId?: string): Promise<{
        success: boolean;
        count: number;
        marks: any[];
    }>;
    getGradesReport(classSectionId: string, examName: string): Promise<{
        classSectionId: string;
        examName: string;
        report: any[];
    }>;
}
