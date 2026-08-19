import { SchoolSetupService } from './school-setup.service';
export declare class SchoolSetupController {
    private readonly schoolSetupService;
    constructor(schoolSetupService: SchoolSetupService);
    getSetup(tenantId?: string): Promise<{
        success: boolean;
        id: any;
        schoolName: any;
        schoolType: any;
        adminName: any;
        email: any;
        helpDeskPhone: any;
        address: any;
        subDomain: any;
        schoolLogo: any;
        adminPhoto: any;
    }>;
    updateSetup(body: any, tenantId?: string): Promise<{
        success: boolean;
        message: string;
        setup: any;
    }>;
}
