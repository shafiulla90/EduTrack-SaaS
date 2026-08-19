import { FirebaseService } from '../../firebase.service';
import { IUserRepository } from '../../../common/interfaces/user.repository.interface';
export declare class FirestoreUserRepository implements IUserRepository {
    private readonly firebase;
    constructor(firebase: FirebaseService);
    private get db();
    findById(id: string): Promise<any | null>;
    findByEmail(email: string): Promise<any | null>;
    findByPhone(phone: string): Promise<any | null>;
    findUserWithProfile(id: string): Promise<any | null>;
    findUsersByTenant(tenantId: string, role?: string): Promise<any[]>;
    create(data: any): Promise<any>;
    update(id: string, data: any): Promise<any>;
    delete(id: string): Promise<any>;
}
