import { PrismaService } from '../prisma.service';
export declare class CommunicationsService {
    private prisma;
    constructor(prisma: PrismaService);
    private getTenantId;
    sendNotification(data: any): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        title: string;
        type: string;
        isRead: boolean;
        recipientId: string;
    }>;
    getNotifications(recipientId: string): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        title: string;
        type: string;
        isRead: boolean;
        recipientId: string;
    }[]>;
    markAsRead(id: string): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        title: string;
        type: string;
        isRead: boolean;
        recipientId: string;
    }>;
    createCommunication(data: any): Promise<{
        subject: string | null;
        message: string;
        id: string;
        updatedAt: Date;
        tenantId: string;
        expiryDate: Date | null;
        status: import(".prisma/client").$Enums.CommunicationStatus;
        createdAt: Date;
        type: import(".prisma/client").$Enums.CommunicationType;
        priority: import(".prisma/client").$Enums.CommunicationPriority;
        headline: string;
        audienceGroups: string[];
        scheduledAt: Date | null;
        publishedAt: Date | null;
        createdById: string;
    }>;
    listCommunications(filter?: any): Promise<({
        attachments: {
            id: string;
            tenantId: string;
            createdAt: Date;
            url: string;
            filename: string;
            communicationId: string;
        }[];
    } & {
        subject: string | null;
        message: string;
        id: string;
        updatedAt: Date;
        tenantId: string;
        expiryDate: Date | null;
        status: import(".prisma/client").$Enums.CommunicationStatus;
        createdAt: Date;
        type: import(".prisma/client").$Enums.CommunicationType;
        priority: import(".prisma/client").$Enums.CommunicationPriority;
        headline: string;
        audienceGroups: string[];
        scheduledAt: Date | null;
        publishedAt: Date | null;
        createdById: string;
    })[]>;
    getCommunication(id: string): Promise<{
        attachments: {
            id: string;
            tenantId: string;
            createdAt: Date;
            url: string;
            filename: string;
            communicationId: string;
        }[];
        recipients: {
            id: string;
            tenantId: string;
            status: string;
            createdAt: Date;
            userId: string;
            communicationId: string;
            deliveredAt: Date | null;
            readAt: Date | null;
        }[];
    } & {
        subject: string | null;
        message: string;
        id: string;
        updatedAt: Date;
        tenantId: string;
        expiryDate: Date | null;
        status: import(".prisma/client").$Enums.CommunicationStatus;
        createdAt: Date;
        type: import(".prisma/client").$Enums.CommunicationType;
        priority: import(".prisma/client").$Enums.CommunicationPriority;
        headline: string;
        audienceGroups: string[];
        scheduledAt: Date | null;
        publishedAt: Date | null;
        createdById: string;
    }>;
    updateCommunication(id: string, data: any): Promise<{
        subject: string | null;
        message: string;
        id: string;
        updatedAt: Date;
        tenantId: string;
        expiryDate: Date | null;
        status: import(".prisma/client").$Enums.CommunicationStatus;
        createdAt: Date;
        type: import(".prisma/client").$Enums.CommunicationType;
        priority: import(".prisma/client").$Enums.CommunicationPriority;
        headline: string;
        audienceGroups: string[];
        scheduledAt: Date | null;
        publishedAt: Date | null;
        createdById: string;
    }>;
    resolveAudience(communicationId: string): Promise<{
        count: number;
    }>;
    markRecipientStatus(recipientId: string, status: 'DELIVERED' | 'READ'): Promise<{
        id: string;
        tenantId: string;
        status: string;
        createdAt: Date;
        userId: string;
        communicationId: string;
        deliveredAt: Date | null;
        readAt: Date | null;
    }>;
    deleteNotification(id: string): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        title: string;
        type: string;
        isRead: boolean;
        recipientId: string;
    }>;
    clearReadNotifications(recipientId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
