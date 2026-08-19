import { ParentPortalService } from './parent-portal.service';
export declare class ParentPortalController {
    private readonly portalService;
    constructor(portalService: ParentPortalService);
    getDashboard(req: any): Promise<{
        childrenCount: number;
        pendingFees: number;
        newAnnouncements: number;
    }>;
    getChildren(req: any): Promise<{
        id: string;
        name: string;
        class: string;
        rollNo: string;
    }[]>;
    getChildDashboard(req: any, studentId: string): Promise<{
        studentId: string;
        name: string;
        attendancePercentage: number;
        pendingFees: number;
    }>;
    getAttendance(req: any, studentId: string): Promise<any[]>;
    getHomework(req: any, studentId: string): Promise<any[]>;
    submitAssignment(req: any, studentId: string, homeworkId: string, data: any): Promise<{
        success: boolean;
        studentId: string;
        homeworkId: string;
        fileName: string;
    }>;
    getExams(req: any, studentId: string): Promise<any[]>;
    getFees(req: any, studentId: string): Promise<any[]>;
    payInvoice(req: any, studentId: string, invoiceId: string, data: any): Promise<any>;
    downloadInvoicePdf(req: any, res: any, studentId: string, invoiceId: string): Promise<{
        invoiceId: string;
        status: string;
    }>;
    getTimetable(req: any, studentId: string): Promise<any[]>;
    getAnnouncements(req: any, studentId: string): Promise<any[]>;
    getTeacherComplaints(req: any, studentId: string): Promise<any[]>;
    getComplaints(req: any): Promise<any[]>;
    submitComplaint(req: any, data: any): Promise<any>;
    getTransport(req: any, studentId: string): Promise<{
        routeName: string;
        stopName: string;
    }>;
    getLeavesHistory(req: any, studentId: string): Promise<any[]>;
    submitLeaveRequest(req: any, studentId: string, data: any): Promise<any>;
}
