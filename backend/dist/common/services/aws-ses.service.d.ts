export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
    attachments?: Array<{
        filename: string;
        content: Buffer;
        contentType?: string;
    }>;
}
export declare class AwsSesService {
    private readonly logger;
    sendEmail(options: EmailOptions): Promise<boolean>;
}
