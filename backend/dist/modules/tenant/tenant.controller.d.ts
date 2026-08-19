import { TenantService } from './tenant.service';
export declare class TenantController {
    private readonly tenantService;
    constructor(tenantService: TenantService);
    getPublicBranding(): Promise<{
        success: boolean;
        tenant: any;
        branding: {
            schoolName: any;
            logoUrl: any;
            themeColor: string;
        };
    }>;
    registerSchool(body: any): Promise<{
        success: boolean;
        access_token: string;
        user: {
            id: any;
            phone: any;
            email: any;
            name: any;
            role: string;
            tenantId: any;
            tenant: any;
        };
    }>;
    getSetupStatus(tenantId?: string): Promise<{
        success: boolean;
        classesCount: number;
        teachersCount: number;
        studentsCount: number;
        completionPercentage: number;
        setupCompleted: boolean;
        currentUser: {
            id: string;
            name: any;
            role: string;
            tenantId: any;
        };
        setup: {
            tenantId: any;
            schoolName: any;
            schoolType: any;
            adminName: any;
            schoolLogo: any;
            email: any;
            mobileNumber: any;
            address: any;
            classesCount: number;
            teachersCount: number;
            studentsCount: number;
            completionPercentage: number;
            setupCompleted: boolean;
            tenant: any;
        };
        subscription: {
            plan: string;
            status: string;
            expiryDate: string;
            features: string[];
        };
        isSubscriptionActive: boolean;
    }>;
    updateBankingUpi(body: any): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
}
