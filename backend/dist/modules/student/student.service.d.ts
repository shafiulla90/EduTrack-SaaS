import { IStudentRepository } from '../../common/interfaces/student.repository.interface';
export declare class StudentService {
    private readonly studentRepo;
    constructor(studentRepo: IStudentRepository);
    findAll(tenantId: string, page?: number, limit?: number, filters?: any): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string, tenantId: string): Promise<any>;
    create(data: any, tenantId: string): Promise<any>;
    update(id: string, data: any, tenantId: string): Promise<any>;
    delete(id: string, tenantId: string): Promise<any>;
    importStudentsBulk(studentsData: any[], tenantId: string): Promise<{
        success: boolean;
        importedCount: number;
        totalRecords: number;
        errors: string[];
    }>;
}
