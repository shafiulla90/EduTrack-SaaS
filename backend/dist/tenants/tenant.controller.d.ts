import { TenantsService } from './tenants.service';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma.service';
export declare class TenantController {
    private tenantsService;
    private authService;
    private prisma;
    constructor(tenantsService: TenantsService, authService: AuthService, prisma: PrismaService);
    getPublicBranding(req: any): Promise<{
        id: string;
        name: string;
        subdomain: string;
        logoUrl: string;
        subtitle: string;
    }>;
    register(body: any): Promise<{
        access_token: string;
        user: {
            id: any;
            name: any;
            email: any;
            phone: any;
            role: any;
            tenantId: any;
        };
        success: boolean;
        message: string;
    }>;
    getSetupStatus(req: any): Promise<{
        setupCompleted: boolean;
        completionPercentage: number;
        classesCount: number;
        teachersCount: number;
        studentsCount: number;
        missingFields: string[];
        setup: {
            id: string;
            tenantId: string;
            schoolName: string;
            schoolType: string;
            adminName: string;
            mobileNumber: string;
            email: string;
            address: string;
            academicYear: string;
            principalName: string;
            country: string;
            state: string;
            district: string;
            city: string;
            postalCode: string;
            schoolLogo: any;
            isCompleted: boolean;
        };
        currentUser: {
            staffProfile: {
                id: string;
                designation: string;
                staffCategory: string;
                staffRole: string;
            };
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            avatarUrl: string;
        };
        subscription?: undefined;
    } | {
        setupCompleted: boolean;
        completionPercentage: number;
        classesCount: number;
        teachersCount: number;
        studentsCount: number;
        missingFields: string[];
        setup: {
            tenant: {
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
            };
        } & {
            academicYear: string;
            id: string;
            updatedAt: Date;
            tenantId: string;
            createdAt: Date;
            address: string;
            email: string;
            schoolName: string;
            schoolType: string;
            adminName: string;
            mobileNumber: string;
            principalName: string;
            country: string;
            state: string;
            district: string;
            city: string;
            postalCode: string;
            schoolLogo: string | null;
            isCompleted: boolean;
        };
        currentUser: {
            staffProfile: {
                id: string;
                designation: string;
                staffCategory: string;
                staffRole: string;
            };
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            avatarUrl: string;
        };
        subscription: {
            plan: import(".prisma/client").$Enums.PlanType;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            expiryDate: Date;
            studentLimit: number;
            teacherLimit: number;
            features: import("@prisma/client/runtime/library").JsonValue;
        };
    }>;
    getDashboardStats(req: any): Promise<{
        studentsCount: number;
        teachersCount: number;
        classesCount: number;
        booksCount: number;
        complaintsCount: number;
        totalRevenue: number;
        totalExpenses: number;
        attendanceRate: number;
        academicAverage: number;
    }>;
    updateBankingUpi(req: any, body: any): Promise<{
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
    }>;
    getSubscription(req: any): Promise<{
        plan: import(".prisma/client").$Enums.PlanType;
        status: import(".prisma/client").$Enums.SubscriptionStatus;
        expiryDate: Date;
        remainingDays: number;
        studentUsage: number;
        teacherUsage: number;
        parentUsage: number;
        features: import("@prisma/client/runtime/library").JsonValue;
        invoices: {
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
        }[];
        payments: ({
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
        })[];
        schoolName: string;
        email: string;
        phone: string;
        address: string;
    }>;
    getPlans(): Promise<{
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
    renewSubscription(req: any, planName: string, paymentDetails: any): Promise<{
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
    createRazorpayOrder(req: any, planName: string, billingMonths: number, baseAmountRs: number, couponCode?: string): Promise<{
        orderId: string;
        amount: number;
        currency: string;
        key_id: string;
        txRef: string;
    }>;
    verifyPayment(req: any, razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string, planName: string, billingMonths: number, finalAmountRs: number, couponCode?: string): Promise<{
        success: boolean;
        idempotent: boolean;
        transactionId: string;
        message: string;
        processed?: undefined;
    } | {
        success: boolean;
        processed: boolean;
        transactionId: string;
        message: string;
        idempotent?: undefined;
    }>;
}
