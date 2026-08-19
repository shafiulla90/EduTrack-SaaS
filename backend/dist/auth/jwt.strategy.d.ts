import { Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    private configService;
    constructor(prisma: PrismaService, configService: ConfigService);
    validate(payload: any): Promise<{
        id: string;
        sub: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        name: string;
        tenantId: string;
        avatarUrl: string;
    }>;
}
export {};
