import { PrismaService } from '../prisma.service';
import { RoleFilterHelper } from '../common/role-filter.helper';
export declare class HomeworkService {
    private prisma;
    private roleFilterHelper;
    constructor(prisma: PrismaService, roleFilterHelper: RoleFilterHelper);
    private getTenantId;
    private logAction;
    getHomeworks(userId: string, role: string): Promise<({
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
    getHomeworkClasses(userId: string, role: string): Promise<any[]>;
    createHomework(userId: string, role: string, data: any): Promise<{
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
    updateHomework(userId: string, role: string, id: string, data: any): Promise<{
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
    deleteHomework(userId: string, role: string, id: string): Promise<{
        success: boolean;
    }>;
}
