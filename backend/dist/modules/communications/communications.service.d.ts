import { IOperationsRepository } from '../../common/interfaces/operations.repository.interface';
import { ITenantRepository } from '../../common/interfaces/tenant.repository.interface';
export declare class CommunicationsService {
    private readonly opsRepo;
    private readonly tenantRepo;
    constructor(opsRepo: IOperationsRepository, tenantRepo: ITenantRepository);
    sendNotification(data: any): Promise<any>;
    getNotifications(recipientId: string): Promise<any[]>;
    markAsRead(id: string): Promise<any>;
    deleteNotification(id: string): Promise<{
        success: boolean;
        id: string;
    }>;
    clearReadNotifications(recipientId: string): Promise<{
        success: boolean;
        recipientId: string;
    }>;
}
