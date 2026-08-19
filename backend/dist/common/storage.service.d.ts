import { ConfigService } from '@nestjs/config';
export declare class StorageService {
    private configService;
    private s3;
    private bucketName;
    constructor(configService: ConfigService);
    uploadImage(base64Data: string, tenantId: string, studentId: string, filenamePrefix: string): Promise<string>;
    deleteImage(imageUrl: string): Promise<void>;
}
