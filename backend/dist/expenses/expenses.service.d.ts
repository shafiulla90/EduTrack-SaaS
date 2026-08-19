import { PrismaService } from '../prisma.service';
import { ExpenseStatus } from '@prisma/client';
export declare class ExpensesService {
    private prisma;
    constructor(prisma: PrismaService);
    private getTenantId;
    createExpense(data: any): Promise<{
        amount: import("@prisma/client/runtime/library").Decimal;
        id: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        description: string | null;
        category: string;
        date: Date;
        paymentMode: string;
    }>;
    getExpenses(category?: string, status?: ExpenseStatus): Promise<{
        amount: import("@prisma/client/runtime/library").Decimal;
        id: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        description: string | null;
        category: string;
        date: Date;
        paymentMode: string;
    }[]>;
    deleteExpense(id: string): Promise<{
        amount: import("@prisma/client/runtime/library").Decimal;
        id: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        description: string | null;
        category: string;
        date: Date;
        paymentMode: string;
    }>;
    updateExpense(id: string, data: any): Promise<{
        amount: import("@prisma/client/runtime/library").Decimal;
        id: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.ExpenseStatus;
        description: string | null;
        category: string;
        date: Date;
        paymentMode: string;
    }>;
    getExpenseSummary(): Promise<{
        currentMonth: number;
        prevMonth: number;
        yearly: number;
    }>;
}
