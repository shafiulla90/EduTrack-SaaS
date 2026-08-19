import { CommunicationsService } from './communications.service';
export declare class CommunicationsController {
    private communicationsService;
    constructor(communicationsService: CommunicationsService);
    send(data: any): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        title: string;
        type: string;
        isRead: boolean;
        recipientId: string;
    }>;
    getForUser(recipientId: string): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        title: string;
        type: string;
        isRead: boolean;
        recipientId: string;
    }[]>;
    read(id: string): Promise<{
        message: string;
        id: string;
        createdAt: Date;
        title: string;
        type: string;
        isRead: boolean;
        recipientId: string;
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
