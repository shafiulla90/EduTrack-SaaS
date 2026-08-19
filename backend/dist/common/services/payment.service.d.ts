import { PrismaService } from '../../prisma.service';
export interface PaymentResponse {
    success: boolean;
    transactionId: string;
    gateway: string;
    amount: number;
    message: string;
}
export interface PaymentStrategy {
    processPayment(tenantId: string, amount: number, details: any): Promise<PaymentResponse>;
}
export declare class StripePaymentStrategy implements PaymentStrategy {
    processPayment(tenantId: string, amount: number, details: any): Promise<PaymentResponse>;
}
export declare class RazorpayPaymentStrategy implements PaymentStrategy {
    processPayment(tenantId: string, amount: number, details: any): Promise<PaymentResponse>;
}
export declare class PayPalPaymentStrategy implements PaymentStrategy {
    processPayment(tenantId: string, amount: number, details: any): Promise<PaymentResponse>;
}
export declare class PaymentService {
    private prisma;
    private strategies;
    constructor(prisma: PrismaService);
    processCheckout(gateway: string, tenantId: string, amount: number, details: any): Promise<PaymentResponse>;
}
