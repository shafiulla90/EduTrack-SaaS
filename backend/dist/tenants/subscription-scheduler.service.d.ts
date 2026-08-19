import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
export declare class SubscriptionSchedulerService implements OnModuleInit, OnModuleDestroy {
    private prisma;
    private intervalId;
    constructor(prisma: PrismaService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    runExpiryNotificationChecks(): Promise<void>;
}
