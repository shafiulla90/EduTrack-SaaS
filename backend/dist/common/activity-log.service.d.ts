import { PrismaService } from '../prisma.service';
export declare class ActivityLogService {
    private prisma;
    constructor(prisma: PrismaService);
    private getTenantId;
    logActivity(userId: string, action: string, entityName: string, entityId?: string, details?: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        userId: string;
        action: string;
        entityName: string;
        entityId: string | null;
        details: string | null;
    }>;
    getLogs(userId?: string, action?: string, entityName?: string): Promise<({
        user: {
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        userId: string;
        action: string;
        entityName: string;
        entityId: string | null;
        details: string | null;
    })[]>;
}
