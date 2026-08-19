import { FirebaseService } from '../../firebase.service';
import { IPlatformAdminRepository } from '../../../common/interfaces/platform-admin.repository.interface';
export declare class FirestorePlatformAdminRepository implements IPlatformAdminRepository {
    private readonly firebase;
    constructor(firebase: FirebaseService);
    private get db();
    getSettings(): Promise<any | null>;
    updateSettings(id: string, data: any): Promise<any>;
    getGatewayConfigs(): Promise<any[]>;
    updateGatewayConfig(id: string, data: any): Promise<any>;
}
