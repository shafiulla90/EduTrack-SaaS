import { PrismaService } from '../prisma.service';
export declare class SchoolSetupController {
    private prisma;
    constructor(prisma: PrismaService);
    updateSetup(req: any, body: any): Promise<{
        success: boolean;
        message: string;
        setup: {
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
    }>;
}
