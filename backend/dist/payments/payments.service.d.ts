import { PrismaService } from '../prisma.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { SaaSBillingService } from '../saas-billing/saas-billing.service';
export declare class PaymentsService {
    private prisma;
    private subscriptionService;
    private billingService;
    private readonly logger;
    constructor(prisma: PrismaService, subscriptionService: SubscriptionService, billingService: SaaSBillingService);
    verifySignature(payloadText: string, signature: string, secret: string): boolean;
    processRazorpayWebhook(rawBody: string, payload: any, signature: string): Promise<{
        success: boolean;
        idempotent: boolean;
        message: string;
        processed?: undefined;
        paymentId?: undefined;
    } | {
        success: boolean;
        message: string;
        idempotent?: undefined;
        processed?: undefined;
        paymentId?: undefined;
    } | {
        success: boolean;
        processed: boolean;
        paymentId: string;
        idempotent?: undefined;
        message?: undefined;
    }>;
}
