import { PaymentService } from './payment.service';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    createOrder(req: any, body: {
        planId: string;
    }): Promise<{
        orderId: any;
        amount: any;
        currency: any;
        total: number;
        plan: any;
    }>;
    razorpayWebhook(signature: string, body: any): Promise<{
        status: string;
    }>;
}
