import { FirebaseService } from '../../firebase.service';
import { IBillingRepository } from '../../../common/interfaces/billing.repository.interface';
export declare class FirestoreBillingRepository implements IBillingRepository {
    private readonly firebase;
    constructor(firebase: FirebaseService);
    private get db();
    findInvoicesByTenant(tenantId: string, status?: string): Promise<any[]>;
    findInvoiceById(id: string): Promise<any | null>;
    findInvoicesByStudent(studentId: string): Promise<any[]>;
    createInvoice(invoiceData: any, items: any[]): Promise<any>;
    updateInvoiceStatus(id: string, status: string, paidAmount?: number): Promise<any>;
    createPayment(paymentData: any): Promise<any>;
    findPaymentById(id: string, tenantId?: string): Promise<any | null>;
    getRecentPayments(tenantId: string, limit?: number): Promise<any[]>;
    updateStudentLedger(tenantId: string, studentId: string, paidAmount: number, remainingBalance: number, status: string): Promise<void>;
    findExpensesByTenant(tenantId: string): Promise<any[]>;
    createExpense(data: any): Promise<any>;
    updateExpense(id: string, data: any, tenantId?: string): Promise<any>;
    deleteExpense(id: string, tenantId?: string): Promise<any>;
    createFeeProducts(productNames: string[], tenantId: string): Promise<any[]>;
    getAllFeeProducts(tenantId: string): Promise<any[]>;
    updateFeeProduct(id: string, name: string, tenantId: string): Promise<any>;
    deleteFeeProduct(id: string, tenantId: string): Promise<any>;
    savePriceBook(classId: string, academicYearId: string, priceItems: any[], tenantId: string): Promise<any>;
    getPriceBook(classId: string, academicYearId: string, tenantId: string): Promise<any[]>;
}
