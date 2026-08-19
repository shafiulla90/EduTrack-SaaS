import { HomeworkService } from './homework.service';
export declare class HomeworkController {
    private readonly homeworkService;
    constructor(homeworkService: HomeworkService);
    getHomeworks(req: any): Promise<({
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
        subject: {
            id: string;
            isActive: boolean;
            name: string;
            tenantId: string;
        };
    } & {
        id: string;
        updatedAt: Date;
        tenantId: string;
        status: string;
        createdAt: Date;
        classSectionId: string;
        title: string;
        dueDate: Date;
        description: string;
        subjectId: string;
        teacherId: string;
        maxMarks: import("@prisma/client/runtime/library").Decimal;
        attachments: string[];
        createdBy: string;
        updatedBy: string;
        allowLateSubmission: boolean;
        assignmentType: string;
        visibleFrom: Date;
    })[]>;
    getClasses(req: any): Promise<any[]>;
    createHomework(req: any, data: any): Promise<{
        id: string;
        updatedAt: Date;
        tenantId: string;
        status: string;
        createdAt: Date;
        classSectionId: string;
        title: string;
        dueDate: Date;
        description: string;
        subjectId: string;
        teacherId: string;
        maxMarks: import("@prisma/client/runtime/library").Decimal;
        attachments: string[];
        createdBy: string;
        updatedBy: string;
        allowLateSubmission: boolean;
        assignmentType: string;
        visibleFrom: Date;
    }>;
    updateHomework(req: any, id: string, data: any): Promise<{
        id: string;
        updatedAt: Date;
        tenantId: string;
        status: string;
        createdAt: Date;
        classSectionId: string;
        title: string;
        dueDate: Date;
        description: string;
        subjectId: string;
        teacherId: string;
        maxMarks: import("@prisma/client/runtime/library").Decimal;
        attachments: string[];
        createdBy: string;
        updatedBy: string;
        allowLateSubmission: boolean;
        assignmentType: string;
        visibleFrom: Date;
    }>;
    deleteHomework(req: any, id: string): Promise<{
        success: boolean;
    }>;
}
