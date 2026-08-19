import { SaaSBillingService } from './saas-billing.service';
export declare class SaaSBillingController {
    private readonly billingService;
    constructor(billingService: SaaSBillingService);
    getPaymentSettings(): Promise<{
        id: string;
        updatedAt: Date;
        companyName: string;
        companyLogoUrl: string | null;
        address: string | null;
        website: string | null;
        supportEmail: string;
        supportPhone: string | null;
        gstNumber: string | null;
        panNumber: string | null;
        gstPercentage: import("@prisma/client/runtime/library").Decimal;
        invoicePrefix: string;
        invoiceNumberFormat: string;
        footer: string | null;
        termsAndConditions: string | null;
        signatureImageUrl: string | null;
        defaultCurrency: string;
        timeZone: string;
        bankName: string | null;
        accountName: string | null;
        accountNumber: string | null;
        ifscCode: string | null;
        branchName: string | null;
        upiId: string | null;
    }>;
    calculateInvoiceTotal(amountCents: number, discountCents?: number): Promise<{
        subtotalCents: number;
        discountCents: number;
        taxableAmountCents: number;
        taxCents: number;
        gstPercentage: number;
        totalCents: number;
        currency: string;
    }>;
    createInvoice(tenantId: string, planId: any, amountCents: number, discountCents?: number): Promise<{
        invoice: {
            amount: import("@prisma/client/runtime/library").Decimal;
            currency: string;
            id: string;
            updatedAt: Date;
            tenantId: string;
            planId: import(".prisma/client").$Enums.PlanType | null;
            status: import(".prisma/client").$Enums.SaaSInvoiceStatus;
            invoiceNumber: string;
            gst: import("@prisma/client/runtime/library").Decimal;
            paymentDate: Date | null;
            pdfUrl: string | null;
            downloadUrl: string | null;
            snapshotData: import("@prisma/client/runtime/library").JsonValue | null;
            createdDate: Date;
            generatedAt: Date;
        };
        billing: {
            id: string;
            updatedAt: Date;
            createdAt: Date;
            subscriptionId: string;
            invoiceId: string | null;
            amountCents: number;
            taxCents: number;
            discountCents: number | null;
        };
        calculation: {
            subtotalCents: number;
            discountCents: number;
            taxableAmountCents: number;
            taxCents: number;
            gstPercentage: number;
            totalCents: number;
            currency: string;
        };
    }>;
}
