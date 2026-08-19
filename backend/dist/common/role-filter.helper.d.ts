import { PrismaService } from '../prisma.service';
export interface TeacherScope {
    staff: {
        id: string;
        userId: string;
        tenantId: string;
    };
    assignedClassSectionIds: string[];
    assignedSubjectIds: string[];
}
export interface AdminScope {
    tenantId: string;
}
export declare class RoleFilterHelper {
    private readonly prisma;
    constructor(prisma: PrismaService);
    buildTeacherScope(userId: string, tenantId: string): Promise<TeacherScope>;
    buildAdminScope(tenantId: string): AdminScope;
    validateTeacherAssignment(teacherId: string, classSectionId: string, subjectId: string, tenantId: string): Promise<void>;
    isAdmin(role: string): boolean;
    isTeacher(role: string): boolean;
}
