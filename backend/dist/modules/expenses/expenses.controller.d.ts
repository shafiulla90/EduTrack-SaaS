import { ExpensesService } from './expenses.service';
export declare class ExpensesController {
    private readonly expensesService;
    constructor(expensesService: ExpensesService);
    create(data: any, req: any): Promise<any>;
    getAll(category?: string, status?: string, req?: any): Promise<any[]>;
    getSummary(req?: any): Promise<{
        totalExpenses: number;
        totalAmount: any;
        currency: string;
    }>;
    update(id: string, data: any, req?: any): Promise<any>;
    remove(id: string, req?: any): Promise<any>;
}
