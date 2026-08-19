import { StudentService } from './student.service';
export declare class StudentController {
    private readonly studentService;
    constructor(studentService: StudentService);
    findAll(page?: string, limit?: string, search?: string, classId?: string, sectionId?: string, academicYearId?: string, req?: any): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string, req: any): Promise<any>;
    create(body: any, req: any): Promise<any>;
    importStudents(body: any, req: any): Promise<{
        success: boolean;
        importedCount: number;
        totalRecords: number;
        errors: string[];
    }>;
    updatePatch(id: string, body: any, req: any): Promise<any>;
    updatePut(id: string, body: any, req: any): Promise<any>;
    remove(id: string, req: any): Promise<any>;
}
