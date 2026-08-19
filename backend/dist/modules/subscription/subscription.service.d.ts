import { ISubscriptionRepository } from '../../common/interfaces/subscription.repository.interface';
export declare class SubscriptionService {
    private readonly subRepo;
    constructor(subRepo: ISubscriptionRepository);
    assignFreePlanToNewTenant(tenantId: string): Promise<any>;
    checkSubscriptionStatus(tenantId: string): Promise<{
        status: any;
        daysRemaining: number;
    }>;
    getAllPlans(): Promise<any[]>;
    getPaymentHistory(tenantId: string): Promise<any[]>;
    getInvoices(tenantId: string): Promise<any[]>;
}
