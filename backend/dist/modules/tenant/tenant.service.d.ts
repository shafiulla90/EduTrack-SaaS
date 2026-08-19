import { JwtService } from '@nestjs/jwt';
import { ITenantRepository } from '../../common/interfaces/tenant.repository.interface';
import { IUserRepository } from '../../common/interfaces/user.repository.interface';
import { FirebaseService } from '../../database/firebase.service';
export declare class TenantService {
    private readonly tenantRepo;
    private readonly userRepo;
    private readonly jwtService;
    private readonly firebaseService?;
    constructor(tenantRepo: ITenantRepository, userRepo: IUserRepository, jwtService: JwtService, firebaseService?: FirebaseService);
    registerSchool(data: any): Promise<{
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
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    update(id: string, data: any): Promise<any>;
    remove(id: string): Promise<any>;
}
