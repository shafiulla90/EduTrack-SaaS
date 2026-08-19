import { PrismaService } from '../prisma.service';
export declare class LeaveManagementService {
    private prisma;
    constructor(prisma: PrismaService);
    private getTenantId;
    getLeaveRequests(userId: string, query?: {
        page?: number;
        limit?: number;
        status?: string;
        applicantType?: string;
        leaveType?: string;
        academicYearId?: string;
        startDate?: string;
        endDate?: string;
        search?: string;
        sortBy?: string;
        sortOrder?: string;
    }): Promise<any[] | {
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getLeaveStats(): Promise<{
        pending: number;
        approvedToday: number;
        rejectedToday: number;
        totalThisMonth: number;
        totalThisYear: number;
    }>;
    getApplicantLeaveHistory(applicantType: string, applicantId: string): Promise<({
        approvedBy: {
            name: string;
        };
    } & {
        id: string;
        updatedAt: Date;
        tenantId: string;
        startDate: Date;
        status: string;
        createdAt: Date;
        endDate: Date;
        classSectionId: string | null;
        studentId: string | null;
        reason: string;
        teacherId: string | null;
        submittedById: string | null;
        applicantType: string;
        leaveType: string;
        attachment: string | null;
        approver: string | null;
        approvedById: string | null;
        approvedRole: string | null;
        comments: string | null;
        approvedDate: Date | null;
        rejectedDate: Date | null;
    })[]>;
    updateLeaveStatus(userId: string, id: string, data: {
        status: string;
        comments?: string;
    }): Promise<{
        id: string;
        updatedAt: Date;
        tenantId: string;
        startDate: Date;
        status: string;
        createdAt: Date;
        endDate: Date;
        classSectionId: string | null;
        studentId: string | null;
        reason: string;
        teacherId: string | null;
        submittedById: string | null;
        applicantType: string;
        leaveType: string;
        attachment: string | null;
        approver: string | null;
        approvedById: string | null;
        approvedRole: string | null;
        comments: string | null;
        approvedDate: Date | null;
        rejectedDate: Date | null;
    }>;
    bulkUpdateLeaveStatus(userId: string, ids: string[], data: {
        status: string;
        comments?: string;
    }): Promise<{
        success: boolean;
        count: number;
    }>;
}
