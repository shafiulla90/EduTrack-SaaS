import { ExpensesService } from './expenses.service';
import { ExpenseStatus } from '@prisma/client';
export declare class ExpensesController {
    private expensesService;
    constructor(expensesService: ExpensesService);
    create(data: any): Promise<{
        amount: import("@prisma/client/runtime/library").Decimal;
        id: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        description: string | null;
        category: string;
        date: Date;
        paymentMode: string;
    }>;
    getAll(category?: string, status?: ExpenseStatus): Promise<{
        amount: import("@prisma/client/runtime/library").Decimal;
        id: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        description: string | null;
        category: string;
        date: Date;
        paymentMode: string;
    }[]>;
    getSummary(): Promise<{
        currentMonth: number;
        prevMonth: number;
        yearly: number;
    }>;
    remove(id: string): Promise<{
        amount: import("@prisma/client/runtime/library").Decimal;
        id: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        description: string | null;
        category: string;
        date: Date;
        paymentMode: string;
    }>;
    update(id: string, data: any): Promise<{
        amount: import("@prisma/client/runtime/library").Decimal;
        id: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        description: string | null;
        category: string;
        date: Date;
        paymentMode: string;
    }>;
}
