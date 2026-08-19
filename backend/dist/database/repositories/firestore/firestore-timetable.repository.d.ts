import { FirebaseService } from '../../firebase.service';
import { ITimetableRepository } from '../../../common/interfaces/timetable.repository.interface';
export declare class FirestoreTimetableRepository implements ITimetableRepository {
    private readonly firebase;
    constructor(firebase: FirebaseService);
    private get db();
    findPeriodTimings(tenantId: string): Promise<any[]>;
    savePeriodTimingsTransaction(tenantId: string, timingsData: any[]): Promise<any>;
    findPeriodsByClassSection(classSectionId: string): Promise<any[]>;
    findPeriodsByTeacher(teacherId: string): Promise<any[]>;
    createPeriod(data: any): Promise<any>;
    updatePeriod(id: string, data: any): Promise<any>;
    deletePeriod(id: string): Promise<any>;
}
