import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboardSummary(req: any): Promise<{
        success: boolean;
        stats: {
            studentsCount: number;
            teachersCount: number;
            classesCount: number;
            totalRevenue: number;
            totalExpenses: number;
            netIncome: number;
            attendanceRate: number;
            academicAverage: number;
            pendingLeaveRequests: number;
            approvedToday: number;
            rejectedToday: number;
            trends: {
                students: {
                    value: string;
                    isUp: boolean;
                };
                revenue: {
                    value: string;
                    isUp: boolean;
                };
                attendance: {
                    value: string;
                    isUp: boolean;
                };
                academic: {
                    value: string;
                    isUp: boolean;
                };
            };
        };
        recentAdmissions: {
            id: any;
            name: any;
            rollNo: any;
            class: any;
            className: any;
            sectionName: any;
            classSection: any;
            profilePhotoUrl: any;
            photo: any;
            avatarUrl: any;
            avatar: any;
            joiningDate: string;
            phone: any;
            status: any;
        }[];
        recentPayments: any[];
        chartData: {
            month: string;
            feeCollection: number;
            salaryExpense: number;
            netRevenue: number;
        }[];
    }>;
    getReportsAnalytics(req: any): Promise<{
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
    getReportsExportData(type: string, req: any): Promise<any[]>;
}
