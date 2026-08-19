import { ExamsService } from './exams.service';
export declare class TeacherPortalController {
    private readonly examsService;
    constructor(examsService: ExamsService);
    getClasses(): Promise<{
        id: string;
        classSectionId: string;
        className: string;
        sectionName: string;
        name: string;
    }[]>;
    getMarksEntry(subjectId: string, examName: string, classSectionId: string, subjectType?: string, req?: any): Promise<{
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
    saveMarks(body: any, req?: any): Promise<{
        success: boolean;
        count: number;
        message: string;
    }>;
}
export declare class ExamConfigController {
    private readonly examsService;
    constructor(examsService: ExamsService);
    getComponents(req?: any): Promise<{
        id: string;
        name: string;
        weightage: number;
    }[]>;
}
