import { ITenantRepository } from '../../common/interfaces/tenant.repository.interface';
export declare class SchoolSetupService {
    private readonly tenantRepo;
    constructor(tenantRepo: ITenantRepository);
    getSchoolSetup(tenantId?: string): Promise<{
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
    updateSchoolSetup(data: any, tenantId?: string): Promise<{
        success: boolean;
        message: string;
        setup: any;
    }>;
}
