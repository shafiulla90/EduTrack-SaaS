import { IBillingRepository } from '../../common/interfaces/billing.repository.interface';
export declare class ExpensesService {
    private readonly billingRepo;
    constructor(billingRepo: IBillingRepository);
    createExpense(data: any, tenantId?: string): Promise<any>;
    getExpenses(category?: string, status?: string, tenantId?: string): Promise<any[]>;
    getExpenseSummary(tenantId?: string): Promise<{
        totalExpenses: number;
        totalAmount: any;
        currency: string;
    }>;
    updateExpense(id: string, data: any, tenantId?: string): Promise<any>;
    deleteExpense(id: string, tenantId?: string): Promise<any>;
}
