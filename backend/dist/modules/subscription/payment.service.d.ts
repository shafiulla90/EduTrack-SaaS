import { ISubscriptionRepository } from '../../common/interfaces/subscription.repository.interface';
import { IPlatformAdminRepository } from '../../common/interfaces/platform-admin.repository.interface';
import { ITenantRepository } from '../../common/interfaces/tenant.repository.interface';
export declare class PaymentService {
    private readonly subRepo;
    private readonly adminRepo;
    private readonly tenantRepo;
    private readonly logger;
    constructor(subRepo: ISubscriptionRepository, adminRepo: IPlatformAdminRepository, tenantRepo: ITenantRepository);
    private getRazorpayInstance;
    createOrder(tenantId: string, planId: string): Promise<{
        orderId: any;
        amount: any;
        currency: any;
        total: number;
        plan: any;
    }>;
    verifyPaymentWebhook(signature: string, payload: any): Promise<{
        status: string;
    }>;
    private handleSuccessfulPayment;
}
