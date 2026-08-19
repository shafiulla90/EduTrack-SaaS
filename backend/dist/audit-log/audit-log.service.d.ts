import { PrismaService } from '../prisma.service';
export declare class AuditLogService {
    private prisma;
    constructor(prisma: PrismaService);
    logAction(performedBy: string, action: string, entityType?: string, entityId?: string, metadata?: any): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        entityId: string | null;
        entityType: string | null;
        performedBy: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    getAuditLogs(performedBy?: string, entityType?: string): Promise<{
        id: string;
        createdAt: Date;
        action: string;
        entityId: string | null;
        entityType: string | null;
        performedBy: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
}
