export declare class CloudStorageService {
    private readonly logger;
    uploadFile(filename: string, contentBuffer: Buffer, mimeType?: string): Promise<string>;
}
