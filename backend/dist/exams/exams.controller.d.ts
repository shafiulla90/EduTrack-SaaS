import { ExamsService } from './exams.service';
export declare class ExamsController {
    private examsService;
    constructor(examsService: ExamsService);
    create(name: string, type: string, classSectionId: string, date: Date): Promise<{
        id: string;
        name: string;
        tenantId: string;
        classSectionId: string;
        type: string;
        date: Date;
    }>;
    getAll(classSectionId?: string): Promise<({
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
    } & {
        id: string;
        name: string;
        tenantId: string;
        classSectionId: string;
        type: string;
        date: Date;
    })[]>;
    getClasses(req: any): Promise<{
        value: string;
        label: string;
        displayName: string;
        classId: string;
        sectionId: string;
    }[]>;
    getSubjects(req: any): Promise<{
        id: string;
        name: string;
        maxMarks: number;
        icon: string;
    }[]>;
    getExamTypes(): Promise<string[]>;
    getExamTypesManage(): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        tenantId: string;
        createdAt: Date;
    }[]>;
    createExamType(name: string): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        tenantId: string;
        createdAt: Date;
    }>;
    updateExamType(id: string, name: string): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        tenantId: string;
        createdAt: Date;
    }>;
    deleteExamType(id: string): Promise<{
        id: string;
        updatedAt: Date;
        name: string;
        tenantId: string;
        createdAt: Date;
    }>;
    getMarksEntryList(req: any, subjectId: string, examName: string, classSectionId?: string, examId?: string, subjectType?: string): Promise<{
        roster: {
            studentId: string;
            name: string;
            rollNo: string;
            hasMarks: boolean;
            marksObtained: number;
            remarks: any;
        }[];
        config: {
            maxMarks: number;
            passingPercentage: number;
        };
    }>;
    saveMarks(req: any, marks: any[], examName: string, classSectionId: string, subjectId: string, subjectType?: string): Promise<{
        id: string;
        tenantId: string;
        studentId: string;
        examId: string;
        subjectId: string;
        subjectType: string;
        marksObtained: import("@prisma/client/runtime/library").Decimal;
        remarks: string | null;
    }[]>;
    getReport(classSectionId: string, examName: string): Promise<{
        rank: number;
        score: number;
        average: number;
        grade: string;
        gpa: number;
        studentId: string;
        name: string;
        rollNo: string;
        classSectionId: string;
        scores: {
            [subjectName: string]: number;
        };
        totalMarks: number;
        totalMaxMarks: number;
        subjectsList: {
            name: string;
            score: number;
            max: number;
            type: string;
        }[];
    }[]>;
}
