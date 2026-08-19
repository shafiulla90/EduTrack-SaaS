import { FirebaseService } from '../../firebase.service';
import { IAcademicRepository } from '../../../common/interfaces/academic.repository.interface';
export declare class FirestoreAcademicRepository implements IAcademicRepository {
    private readonly firebase;
    constructor(firebase: FirebaseService);
    private get db();
    findAcademicYears(tenantId: string): Promise<any[]>;
    findActiveAcademicYear(tenantId: string): Promise<any | null>;
    findClasses(tenantId: string, academicYearId?: string): Promise<any[]>;
    findClassById(id: string): Promise<any | null>;
    createClass(data: any): Promise<any>;
    deleteClass(id: string, tenantId?: string): Promise<any>;
    findSections(tenantId: string): Promise<any[]>;
    createSection(data: any): Promise<any>;
    deleteSection(id: string, tenantId?: string): Promise<any>;
    findClassSections(tenantId: string, classId?: string): Promise<any[]>;
    findSubjects(tenantId: string): Promise<any[]>;
    createSubject(data: any): Promise<any>;
    deleteSubject(id: string, tenantId?: string): Promise<any>;
    createAcademicYear(data: any): Promise<any>;
    toggleAcademicYearActive(id: string, tenantId: string): Promise<any>;
    createClassSection(data: any): Promise<any>;
}
