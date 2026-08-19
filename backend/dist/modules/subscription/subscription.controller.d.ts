import { SubscriptionService } from './subscription.service';
export declare class SubscriptionController {
    private readonly subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    getPlans(): Promise<any[]>;
    getCurrent(req: any): Promise<{
        status: any;
        daysRemaining: number;
    }>;
    getHistory(req: any): Promise<any[]>;
    getInvoices(req: any): Promise<any[]>;
}
