import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    getProfile(authHeader?: string): Promise<{
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
    sendOtp(body: {
        phone: string;
        portal?: string;
    }): Promise<{
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
    verifyOtp(body: {
        phone: string;
        otp?: string;
        idToken?: string;
        portal?: string;
    }): Promise<{
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
    exchangeCode(body: {
        code: string;
    }): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            role: string;
            tenantId: any;
            tenant: any;
        };
    }>;
}
