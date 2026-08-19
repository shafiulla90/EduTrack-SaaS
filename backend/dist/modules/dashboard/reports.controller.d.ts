import { DashboardService } from './dashboard.service';
export declare class ReportsController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
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
