import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    sendOtp(phone: string, portal?: string): Promise<any>;
    verifyOtp(phone: string, otpCode: string, portal?: string, generateCode?: boolean): Promise<any>;
    exchangeCode(code: string): Promise<any>;
    login(body: any): Promise<{
        access_token: string;
        user: {
            id: any;
            name: any;
            email: any;
            phone: any;
            role: any;
            tenantId: any;
        };
    }>;
    register(body: any): Promise<{
        id: string;
        isActive: boolean;
        updatedAt: Date;
        name: string;
        tenantId: string;
        createdAt: Date;
        email: string | null;
        phone: string | null;
        role: import(".prisma/client").$Enums.Role;
        avatarUrl: string | null;
    }>;
    getProfile(req: any): Promise<any>;
}
