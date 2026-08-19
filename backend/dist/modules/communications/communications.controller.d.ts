import { CommunicationsService } from './communications.service';
export declare class CommunicationsController {
    private readonly communicationsService;
    constructor(communicationsService: CommunicationsService);
    send(data: any): Promise<any>;
    getUserNotifications(): Promise<any[]>;
    getForUser(recipientId: string): Promise<any[]>;
    read(id: string): Promise<any>;
    deleteNotification(id: string): Promise<{
        success: boolean;
        id: string;
    }>;
    clearReadNotifications(recipientId: string): Promise<{
        success: boolean;
        recipientId: string;
    }>;
}
