import { ActivityLogService } from './activity-log.service';
export declare class ActivityLogController {
    private activityLogService;
    constructor(activityLogService: ActivityLogService);
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
