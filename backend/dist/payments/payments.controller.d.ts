import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    handleRazorpayWebhook(req: any, body: any, signature: string): Promise<{
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
