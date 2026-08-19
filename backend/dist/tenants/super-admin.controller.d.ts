import { PrismaService } from '../prisma.service';
import { PlanType, SubscriptionStatus } from '@prisma/client';
export declare class SuperAdminController {
    private prisma;
    constructor(prisma: PrismaService);
    listTenants(): Promise<({
        subscription: {
            plan: {
                id: string;
                isActive: boolean;
                updatedAt: Date;
                name: import(".prisma/client").$Enums.PlanType;
                createdAt: Date;
                studentLimit: number | null;
                teacherLimit: number | null;
                parentLimit: number | null;
                storageLimit: import("@prisma/client/runtime/library").Decimal | null;
                features: import("@prisma/client/runtime/library").JsonValue;
                price: import("@prisma/client/runtime/library").Decimal;
                durationMonths: number;
                priceCents: number;
                isDefault: boolean;
            };
        } & {
            id: string;
            updatedAt: Date;
            tenantId: string;
            planId: string;
            startDate: Date;
            expiryDate: Date;
            gracePeriodEndDate: Date | null;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            createdAt: Date;
        };
    } & {
        id: string;
        updatedAt: Date;
        name: string;
        createdAt: Date;
        address: string | null;
        bankName: string | null;
        subDomain: string;
        logoUrl: string | null;
        email: string | null;
        phone: string | null;
        subtitle: string | null;
        setupCompleted: boolean;
        bankBranch: string | null;
        bankIFSC: string | null;
        bankAccountNo: string | null;
        googlePayId: string | null;
        phonePeId: string | null;
        upiQrId: string | null;
    })[]>;
    updateSubscription(id: string, planName: PlanType, expiryDate?: string, status?: SubscriptionStatus): Promise<{
        plan: {
            id: string;
            isActive: boolean;
            updatedAt: Date;
            name: import(".prisma/client").$Enums.PlanType;
            createdAt: Date;
            studentLimit: number | null;
            teacherLimit: number | null;
            parentLimit: number | null;
            storageLimit: import("@prisma/client/runtime/library").Decimal | null;
            features: import("@prisma/client/runtime/library").JsonValue;
            price: import("@prisma/client/runtime/library").Decimal;
            durationMonths: number;
            priceCents: number;
            isDefault: boolean;
        };
    } & {
        id: string;
        updatedAt: Date;
        tenantId: string;
        planId: string;
        startDate: Date;
        expiryDate: Date;
        gracePeriodEndDate: Date | null;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        createdAt: Date;
    }>;
    listPayments(): Promise<({
        tenant: {
            name: string;
            subDomain: string;
        };
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
    } & {
        transactionId: string;
        gateway: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        method: string | null;
        id: string;
        tenantId: string;
        planId: string | null;
        status: import(".prisma/client").$Enums.SaaSPaymentStatus;
        createdAt: Date;
        subscriptionId: string | null;
        invoiceId: string | null;
        amountCents: number | null;
        schoolId: string | null;
        billingDurationMonths: number | null;
        gatewayReference: string | null;
        eventId: string | null;
        signatureVerified: boolean;
        gatewayResponse: import("@prisma/client/runtime/library").JsonValue | null;
        failureReason: string | null;
        paidAt: Date | null;
        billingId: string | null;
    })[]>;
    generateInvoice(tenantId: string, planName: PlanType, amount: number): Promise<{
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
    }>;
    getStats(): Promise<{
        totalSchools: number;
        activeTrials: number;
        activePaid: number;
        expired: number;
        grace: number;
        totalRevenue: number;
        planDistribution: Record<string, number>;
        recentPayments: {
            id: string;
            schoolName: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            gateway: string;
            paidAt: Date;
            transactionId: string;
        }[];
    }>;
    listPlans(): Promise<{
        id: string;
        isActive: boolean;
        updatedAt: Date;
        name: import(".prisma/client").$Enums.PlanType;
        createdAt: Date;
        studentLimit: number | null;
        teacherLimit: number | null;
        parentLimit: number | null;
        storageLimit: import("@prisma/client/runtime/library").Decimal | null;
        features: import("@prisma/client/runtime/library").JsonValue;
        price: import("@prisma/client/runtime/library").Decimal;
        durationMonths: number;
        priceCents: number;
        isDefault: boolean;
    }[]>;
    createPlan(body: any): Promise<{
        id: string;
        isActive: boolean;
        updatedAt: Date;
        name: import(".prisma/client").$Enums.PlanType;
        createdAt: Date;
        studentLimit: number | null;
        teacherLimit: number | null;
        parentLimit: number | null;
        storageLimit: import("@prisma/client/runtime/library").Decimal | null;
        features: import("@prisma/client/runtime/library").JsonValue;
        price: import("@prisma/client/runtime/library").Decimal;
        durationMonths: number;
        priceCents: number;
        isDefault: boolean;
    }>;
    updatePlan(id: string, body: any): Promise<{
        id: string;
        isActive: boolean;
        updatedAt: Date;
        name: import(".prisma/client").$Enums.PlanType;
        createdAt: Date;
        studentLimit: number | null;
        teacherLimit: number | null;
        parentLimit: number | null;
        storageLimit: import("@prisma/client/runtime/library").Decimal | null;
        features: import("@prisma/client/runtime/library").JsonValue;
        price: import("@prisma/client/runtime/library").Decimal;
        durationMonths: number;
        priceCents: number;
        isDefault: boolean;
    }>;
    getSettings(): Promise<{
        currency: string;
        id: string;
        updatedAt: Date;
        companyName: string;
        supportEmail: string;
        invoicePrefix: string;
        trialDays: number;
        taxRate: import("@prisma/client/runtime/library").Decimal;
    }>;
    updateSettings(body: any): Promise<{
        currency: string;
        id: string;
        updatedAt: Date;
        companyName: string;
        supportEmail: string;
        invoicePrefix: string;
        trialDays: number;
        taxRate: import("@prisma/client/runtime/library").Decimal;
    }>;
    getGateways(): Promise<{
        apiKey: string;
        apiSecret: string;
        webhookSecret: string;
        id: string;
        gatewayName: string;
        isActive: boolean;
        updatedAt: Date;
    }[]>;
    updateGateway(name: string, body: any): Promise<{
        id: string;
        gatewayName: string;
        isActive: boolean;
        apiKey: string;
        apiSecret: string;
        webhookSecret: string | null;
        updatedAt: Date;
    }>;
    getPendingPayments(): Promise<({
        tenant: {
            id: string;
            name: string;
            subDomain: string;
            email: string;
        };
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
    } & {
        transactionId: string;
        gateway: string;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        method: string | null;
        id: string;
        tenantId: string;
        planId: string | null;
        status: import(".prisma/client").$Enums.SaaSPaymentStatus;
        createdAt: Date;
        subscriptionId: string | null;
        invoiceId: string | null;
        amountCents: number | null;
        schoolId: string | null;
        billingDurationMonths: number | null;
        gatewayReference: string | null;
        eventId: string | null;
        signatureVerified: boolean;
        gatewayResponse: import("@prisma/client/runtime/library").JsonValue | null;
        failureReason: string | null;
        paidAt: Date | null;
        billingId: string | null;
    })[]>;
    approvePayment(paymentId: string, remarks?: string): Promise<{
        success: boolean;
        invoiceNumber: string;
        newExpiry: Date;
        message: string;
    }>;
    rejectPayment(paymentId: string, reason: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
