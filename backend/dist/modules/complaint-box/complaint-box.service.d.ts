import { IOperationsRepository } from '../../common/interfaces/operations.repository.interface';
export declare class ComplaintBoxService {
    private readonly opsRepo;
    constructor(opsRepo: IOperationsRepository);
    getCurrentTeacher(): Promise<{
        id: string;
        name: string;
    }>;
    getStudentClasses(): Promise<any[]>;
    getTeachers(): Promise<any[]>;
    getStudentsByClass(classSectionId: string): Promise<any[]>;
    searchStudents(searchTerm?: string, classId?: string, sectionId?: string): Promise<any[]>;
    submitStudentBehavior(dto: any, tenantId?: string): Promise<any>;
    getAcademicYears(): Promise<{
        id: string;
        name: string;
    }[]>;
    getPendingCases(academicYear?: string, tenantId?: string): Promise<any[]>;
    getStudentCases(studentId: string, academicYear?: string): Promise<any[]>;
    updateCaseStatus(caseId: string, dto: any): Promise<any>;
    getStudentStats(studentId: string): Promise<{
        total: number;
        resolved: number;
        pending: number;
    }>;
    updateBehavior(caseId: string, dto: any): Promise<any>;
    deleteBehavior(caseId: string): Promise<{
        success: boolean;
        caseId: string;
    }>;
    getParentComplaints(status?: string, tenantId?: string): Promise<any[]>;
    updateParentComplaintStatus(id: string, data: any): Promise<any>;
}
