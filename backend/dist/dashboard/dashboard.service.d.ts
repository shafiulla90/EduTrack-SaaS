import { PrismaService } from '../prisma.service';
import { RoleFilterHelper } from '../common/role-filter.helper';
export declare class DashboardService {
    private prisma;
    private roleFilterHelper;
    constructor(prisma: PrismaService, roleFilterHelper: RoleFilterHelper);
    private getTenantId;
    private dashboardCache;
    getDashboardSummary(): Promise<any>;
    getReportsSummary(userId?: string, role?: string): Promise<{
        demographics: {
            totalStudents: number;
            classDistribution: Record<string, number>;
            timeline: {
                date: string;
                count: number;
            }[];
        };
        financials: {
            totalRevenue: number;
            outstandingReceivables: number;
            totalExpenses: number;
            netCashflow: number;
        };
        grading: {
            averageScore: number;
            passRate: number;
            distribution: {
                failed: number;
                belowAverage: number;
                average: number;
                firstDivision: number;
                highDistinction: number;
            };
        };
    }>;
    getDemographicsReport(userId?: string, role?: string): Promise<{
        name: string;
        email: string;
        phone: string;
        class: string;
        section: string;
        rollNo: string;
        joiningDate: string;
    }[]>;
    getCashflowsReport(userId?: string, role?: string): Promise<any[]>;
    getGradingReport(userId?: string, role?: string): Promise<{
        studentName: string;
        rollNo: string;
        subject: string;
        subjectType: string;
        examType: string;
        marksObtained: number;
        maxMarks: number;
    }[]>;
    getPlatformMetrics(): Promise<{
        metrics: {
            totalRevenue: number;
            todayRevenue: number;
            monthlyRevenue: number;
            annualRevenue: number;
            mrr: number;
            arr: number;
            totalSchools: number;
            activeSchools: number;
            trialSchools: number;
            expiredSchools: number;
            gracePeriodSchools: number;
            renewalsDueThisMonth: number;
            failedPayments: number;
            renewalSuccessRate: string;
            activeSubscriptions: number;
            trialConversions: number;
            pendingApprovals: number;
            totalStudents: number;
            totalTeachers: number;
            totalParents: number;
            totalEcosystemUsers: number;
            pendingRequests: {
                id: string;
                tenantId: string;
                schoolName: string;
                subDomain: string;
                plan: string;
                billingCycle: string;
                billingMonths: number;
                amount: number;
                coupon: any;
                razorpayOrderId: string;
                razorpayPaymentId: string;
                transactionId: string;
                paymentStatus: import(".prisma/client").$Enums.SaaSPaymentStatus;
                signatureVerified: boolean;
                createdAt: Date;
            }[];
        };
    }>;
}
