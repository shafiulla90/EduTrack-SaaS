import { FirebaseService } from '../../firebase.service';
import { IStudentRepository } from '../../../common/interfaces/student.repository.interface';
export declare class FirestoreStudentRepository implements IStudentRepository {
    private readonly firebase;
    constructor(firebase: FirebaseService);
    private get db();
    findProfileById(id: string): Promise<any | null>;
    findProfileByUserId(userId: string): Promise<any | null>;
    findStudentsByClassSection(classSectionId: string): Promise<any[]>;
    findStudentsByTenant(tenantId: string, page?: number, limit?: number, filters?: any): Promise<{
        items: any[];
        total: number;
    }>;
    createProfile(data: any): Promise<any>;
    updateProfile(id: string, data: any): Promise<any>;
    deleteProfile(id: string): Promise<any>;
}
