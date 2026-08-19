import { PlatformAdminService } from './platform-admin.service';
export declare class PlatformAdminController {
    private readonly platformAdminService;
    constructor(platformAdminService: PlatformAdminService);
    getDashboard(): Promise<{
        totalSchools: number;
        activeSubscriptions: number;
        totalRevenue: number;
    }>;
    getSchools(): Promise<any[]>;
    updateSchoolStatus(id: string, body: {
        status: string;
    }): Promise<any>;
    getPlans(): Promise<any[]>;
    createPlan(body: any): Promise<any>;
    updatePlan(id: string, body: any): Promise<any>;
    getSettings(): Promise<any>;
    updateSettings(body: any): Promise<any>;
    getGateways(): Promise<any[]>;
    updateGateway(name: string, body: any): Promise<any>;
    getPayments(): Promise<any[]>;
    getInvoices(): Promise<any[]>;
}
