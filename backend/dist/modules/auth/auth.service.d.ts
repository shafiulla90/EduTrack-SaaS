import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { SubscriptionService } from '../subscription/subscription.service';
import { IUserRepository } from '../../common/interfaces/user.repository.interface';
import { ITenantRepository } from '../../common/interfaces/tenant.repository.interface';
export declare class AuthService {
    private readonly userRepo;
    private readonly tenantRepo;
    private jwtService;
    private subscriptionService;
    constructor(userRepo: IUserRepository, tenantRepo: ITenantRepository, jwtService: JwtService, subscriptionService: SubscriptionService);
    register(dto: RegisterDto): Promise<{
        message: string;
        tenant_id: any;
        user_id: any;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            first_name: any;
            last_name: any;
            role: any;
            tenant: any;
            subscriptionStatus: string;
        };
    }>;
    private otpStore;
    sendOtp(phone: string, portal?: string): Promise<{
        success: boolean;
        notFound: boolean;
        redirectToRegister: boolean;
        portal: string;
        message: string;
        registered?: undefined;
        schoolName?: undefined;
        logoUrl?: undefined;
        phone?: undefined;
        code?: undefined;
        tenantId?: undefined;
    } | {
        success: boolean;
        registered: boolean;
        schoolName: any;
        logoUrl: any;
        message: string;
        phone: string;
        code: string;
        tenantId: any;
        notFound?: undefined;
        redirectToRegister?: undefined;
        portal?: undefined;
    }>;
    verifyOtp(phone: string, otp?: string, idToken?: string, portal?: string): Promise<{
        success: boolean;
        registered: boolean;
        access_token: string;
        user: {
            id: any;
            phone: string;
            email: any;
            name: any;
            role: any;
            tenantId: any;
            tenant: any;
        };
        token: string;
    }>;
    exchangeCode(code: string): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            role: string;
            tenantId: any;
            tenant: any;
        };
    }>;
    getProfile(tokenHeader?: string): Promise<{
        success: boolean;
        user: {
            id: any;
            email: any;
            phone: any;
            role: any;
            tenantId: any;
            tenant: any;
        };
    }>;
}
