import { PrismaService } from '../prisma.service';
import { CreateSupportRequestDto } from './dto/create-support-request.dto';
export declare class SupportService {
    private prisma;
    private rateLimitCache;
    constructor(prisma: PrismaService);
    createSupportRequest(dto: CreateSupportRequestDto, ipAddress: string, userAgent: string): Promise<{
        success: boolean;
        emailSent: boolean;
        message: string;
        data: {
            id: string;
            name: string;
            schoolName: string;
            email: string;
            phone: string;
            subject: string;
            message: string;
            status: string;
            emailSent: boolean;
            createdAt: Date;
        };
    }>;
}
