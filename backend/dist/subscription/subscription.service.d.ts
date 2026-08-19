import { PrismaService } from '../prisma.service';
import { SubscriptionStatus } from '@prisma/client';
export declare const VALID_SUBSCRIPTION_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]>;
export declare class SubscriptionService {
    private prisma;
    constructor(prisma: PrismaService);
    validateStateTransition(currentStatus: SubscriptionStatus, targetStatus: SubscriptionStatus): boolean;
    transitionStatus(tenantId: string, targetStatus: SubscriptionStatus, reason?: string): Promise<{
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
    activateOrRenew(tenantId: string, planId: string, durationMonths?: number): Promise<{
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
    getSubscriptionDetails(tenantId: string): Promise<{
        remainingDays: number;
        isExpired: boolean;
        isInGracePeriod: boolean;
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
        billingRecords: {
            id: string;
            updatedAt: Date;
            createdAt: Date;
            subscriptionId: string;
            invoiceId: string | null;
            amountCents: number;
            taxCents: number;
            discountCents: number | null;
        }[];
        payments: {
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
        }[];
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
}
