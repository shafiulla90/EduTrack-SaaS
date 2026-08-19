import { IBillingRepository } from '../../common/interfaces/billing.repository.interface';
import { IOperationsRepository } from '../../common/interfaces/operations.repository.interface';
export declare class ParentPortalService {
    private readonly billingRepo;
    private readonly opsRepo;
    constructor(billingRepo: IBillingRepository, opsRepo: IOperationsRepository);
    getDashboardStats(userId: string, tenantId: string): Promise<{
        childrenCount: number;
        pendingFees: number;
        newAnnouncements: number;
    }>;
    getChildren(userId: string): Promise<{
        id: string;
        name: string;
        class: string;
        rollNo: string;
    }[]>;
    getChildDashboard(userId: string, studentId: string): Promise<{
        studentId: string;
        name: string;
        attendancePercentage: number;
        pendingFees: number;
    }>;
    getAttendance(userId: string, studentId: string): Promise<any[]>;
    getHomework(userId: string, studentId: string): Promise<any[]>;
    submitAssignment(userId: string, studentId: string, homeworkId: string, base64File: string, fileName: string): Promise<{
        success: boolean;
        studentId: string;
        homeworkId: string;
        fileName: string;
    }>;
    getExams(userId: string, studentId: string): Promise<any[]>;
    getFees(userId: string, studentId: string): Promise<any[]>;
    payInvoice(userId: string, studentId: string, invoiceId: string, data: any): Promise<any>;
    generateInvoicePdf(userId: string, studentId: string, invoiceId: string, res: any): Promise<{
        invoiceId: string;
        status: string;
    }>;
    getTimetable(userId: string, studentId: string): Promise<any[]>;
    getAnnouncements(userId: string, studentId: string): Promise<any[]>;
    getTeacherComplaints(userId: string, studentId: string): Promise<any[]>;
    getComplaints(userId: string): Promise<any[]>;
    submitComplaint(userId: string, tenantId: string, data: any): Promise<any>;
    getTransport(userId: string, studentId: string): Promise<{
        routeName: string;
        stopName: string;
    }>;
    getLeavesHistory(userId: string, studentId: string): Promise<any[]>;
    submitLeaveRequest(userId: string, studentId: string, data: any): Promise<any>;
}
