import { FirebaseService } from '../../firebase.service';
import { ITeacherRepository } from '../../../common/interfaces/teacher.repository.interface';
export declare class FirestoreTeacherRepository implements ITeacherRepository {
    private readonly firebase;
    constructor(firebase: FirebaseService);
    private get db();
    findProfileById(id: string): Promise<any | null>;
    findProfileByUserId(userId: string): Promise<any | null>;
    findTeachersByTenant(tenantId: string): Promise<any[]>;
    findTeacherAssignments(teacherId: string): Promise<any[]>;
    findTeacherSkills(teacherId: string): Promise<any[]>;
    createTeacherAssignment(data: any): Promise<any>;
    createTeacherSkill(data: any): Promise<any>;
    createStaffProfile(data: any): Promise<any>;
    updateStaffProfile(id: string, data: any): Promise<any>;
    deleteStaffProfile(id: string): Promise<any>;
}
