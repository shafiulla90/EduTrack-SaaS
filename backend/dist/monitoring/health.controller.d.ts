import { PrismaService } from '../prisma.service';
export declare class HealthController {
    private prisma;
    constructor(prisma: PrismaService);
    checkHealth(): Promise<{
        status: string;
        timestamp: string;
        services: {
            database: string;
            memoryUsage: string;
            uptimeSeconds: number;
        };
    }>;
    checkReadiness(): Promise<{
        ready: boolean;
        timestamp: string;
    }>;
}
