import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { FirebaseAdminService } from './firebase-admin.service';
import { ConfigService } from '@nestjs/config';
export declare class AuthService {
    private prisma;
    private jwtService;
    private firebaseAdminService;
    private configService;
    private failedAttemptsMap;
    constructor(prisma: PrismaService, jwtService: JwtService, firebaseAdminService: FirebaseAdminService, configService: ConfigService);
    hashPassword(password: string): Promise<string>;
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any): Promise<{
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
    sendOtp(phone: string, portal?: string): Promise<any>;
    verifyOtp(phone: string, otpCode: string, portal?: string, generateCode?: boolean): Promise<any>;
    private usedCodes;
    exchangeCode(code: string): Promise<any>;
    register(data: any, tenantId: string): Promise<{
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
}
