import { IPlatformAdminRepository } from '../../common/interfaces/platform-admin.repository.interface';
import { ITenantRepository } from '../../common/interfaces/tenant.repository.interface';
import { ISubscriptionRepository } from '../../common/interfaces/subscription.repository.interface';
export declare class PlatformAdminService {
    private readonly adminRepo;
    private readonly tenantRepo;
    private readonly subRepo;
    constructor(adminRepo: IPlatformAdminRepository, tenantRepo: ITenantRepository, subRepo: ISubscriptionRepository);
    getDashboardMetrics(): Promise<{
        totalSchools: number;
        activeSubscriptions: number;
        totalRevenue: number;
    }>;
    getAllSchools(): Promise<any[]>;
    updateSchoolStatus(tenantId: string, status: string): Promise<any>;
    getSubscriptionPlans(): Promise<any[]>;
    createSubscriptionPlan(data: any): Promise<any>;
    updateSubscriptionPlan(id: string, data: any): Promise<any>;
    getPlatformSettings(): Promise<any>;
    updatePlatformSettings(data: any): Promise<any>;
    getPaymentGateways(): Promise<any[]>;
    updatePaymentGateway(gatewayName: string, data: any): Promise<any>;
    getAllPayments(): Promise<any[]>;
    getAllInvoices(): Promise<any[]>;
}
