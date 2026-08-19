import { FirebaseService } from '../../firebase.service';
import { ITenantRepository } from '../../../common/interfaces/tenant.repository.interface';
export declare class FirestoreTenantRepository implements ITenantRepository {
    private readonly firebase;
    constructor(firebase: FirebaseService);
    private get db();
    findAll(): Promise<any[]>;
    findById(id: string): Promise<any | null>;
    findBySubdomain(subDomain: string): Promise<any | null>;
    private sanitizePayload;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    delete(id: string): Promise<any>;
}
