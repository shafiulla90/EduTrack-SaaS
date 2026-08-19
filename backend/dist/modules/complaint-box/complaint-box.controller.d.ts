import { ComplaintBoxService } from './complaint-box.service';
export declare class ComplaintBoxController {
    private readonly complaintBoxService;
    constructor(complaintBoxService: ComplaintBoxService);
    getCurrentTeacher(): Promise<{
        id: string;
        name: string;
    }>;
    getStudentClasses(): Promise<any[]>;
    getTeachers(): Promise<any[]>;
    getStudentsByClass(classSectionId: string): Promise<any[]>;
    searchStudents(searchTerm?: string, classId?: string, sectionId?: string): Promise<any[]>;
    submitStudentBehavior(dto: any, req?: any): Promise<any>;
    getAcademicYears(): Promise<{
        id: string;
        name: string;
    }[]>;
    getPendingCases(academicYear?: string, req?: any): Promise<any[]>;
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
    getParentComplaints(status?: string, req?: any): Promise<any[]>;
    updateParentComplaintStatus(id: string, data: any): Promise<any>;
}
