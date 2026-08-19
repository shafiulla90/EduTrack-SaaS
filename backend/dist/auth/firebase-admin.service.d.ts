import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class FirebaseAdminService implements OnModuleInit {
    private configService;
    private readonly logger;
    private firebaseApp;
    constructor(configService: ConfigService);
    onModuleInit(): void;
    verifyIdToken(idToken: string): Promise<string>;
    isInitialized(): boolean;
}
