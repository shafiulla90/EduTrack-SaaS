import { FirebaseService } from '../../firebase.service';
import { IAttendanceRepository } from '../../../common/interfaces/attendance.repository.interface';
export declare class FirestoreAttendanceRepository implements IAttendanceRepository {
    private readonly firebase;
    constructor(firebase: FirebaseService);
    private get db();
    findSessionsByClassSection(classSectionIdOrTenantId: string, startDate?: string, endDate?: string): Promise<any[]>;
    findSessionById(id: string): Promise<any | null>;
    findAttendanceByStudent(studentId: string): Promise<any[]>;
    createSessionWithAttendance(sessionData: any, attendanceRecords: any[]): Promise<any>;
    updateAttendance(id: string, status: string, reason?: string): Promise<any>;
}
