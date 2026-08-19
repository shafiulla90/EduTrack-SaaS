import { IBillingRepository } from '../../common/interfaces/billing.repository.interface';
import { IAcademicRepository } from '../../common/interfaces/academic.repository.interface';
import { IStudentRepository } from '../../common/interfaces/student.repository.interface';
import { IUserRepository } from '../../common/interfaces/user.repository.interface';
export declare class BillingService {
    private readonly billingRepo;
    private readonly academicRepo;
    private readonly studentRepo;
    private readonly userRepo;
    constructor(billingRepo: IBillingRepository, academicRepo: IAcademicRepository, studentRepo: IStudentRepository, userRepo: IUserRepository);
    createFeeProducts(productNames: string[], tenantId?: string): Promise<any[]>;
    getAllFeeProducts(tenantId?: string): Promise<any[]>;
    updateFeeProduct(id: string, name: string, tenantId?: string): Promise<any>;
    deleteFeeProduct(id: string, tenantId?: string): Promise<any>;
    savePriceBook(classId: string, academicYearId: string, priceItems: any[], tenantId?: string): Promise<any>;
    getPriceBook(classId: string, academicYearId: string, tenantId?: string): Promise<any[]>;
    createInvoice(invoiceData: any, items: any[], tenantId?: string): Promise<{
        id: string;
        invoiceId: any;
        studentId: any;
        amount: any;
        totalPaid: any;
        remainingBalance: number;
        invoiceStatus: string;
        receiptNumber: string;
        transactionId: string;
        status: string;
        invoice: any;
    }>;
    getRecentInvoices(studentId?: string, tenantId?: string): Promise<any[]>;
    getInvoiceDetails(invoiceId: string, tenantId?: string): Promise<{
        id: string;
        invoiceNo: any;
        totalAmount: any;
        paidAmount: any;
        remainingBalance: any;
        status: any;
        items: any;
    }>;
    getInvoicePDFData(invoiceId: string, tenantId?: string): Promise<{
        schoolName: string;
        schoolSubtitle: string;
        schoolLogo: string;
        schoolAddress: string;
        schoolPhone: string;
        invoiceNo: any;
        invoiceDate: string;
        academicYear: string;
        admissionRef: any;
        studentName: any;
        fatherName: any;
        motherName: any;
        className: any;
        sectionName: any;
        studentDob: any;
        addressVillage: any;
        totalFeeAmount: number;
        totalDiscount: number;
        previouslyPaid: number;
        currentPayment: number;
        paidAmount: number;
        remainingBalance: number;
        totalAmount: number;
        invoiceTotal: number;
        items: {
            particulars: string;
            totalAmount: number;
            previouslyPaid: number;
            currentPayment: number;
            remainingBalance: number;
            amount: number;
        }[];
    }>;
    getActiveProducts(classId: string, academicYearId?: string, tenantId?: string): Promise<any[]>;
    createAdmission(studentData: any, selectedPricebookEntryIds: string[], concessionAmount: number, tenantId?: string): Promise<{
        success: boolean;
        message: string;
        opportunityId: string;
        studentId: `${string}-${string}-${string}-${string}-${string}`;
        studentData: any;
        tenantId: string;
    }>;
    updateLineItemDiscount(oliId: string, discountPercent: number): Promise<{
        success: boolean;
        oliId: string;
        discountPercent: number;
    }>;
    updateBulkLineItemDiscounts(oliIds: string[], discountPercent: number): Promise<{
        success: boolean;
        oliIds: string[];
        discountPercent: number;
    }>;
    getYearsOptions(tenantId?: string): Promise<{
        value: any;
        label: any;
    }[]>;
    getClassesOptions(tenantId?: string): Promise<{
        value: any;
        label: any;
    }[]>;
    getSectionsOptions(classId?: string, tenantId?: string): Promise<{
        value: any;
        label: any;
    }[]>;
    searchStudents(searchTerm: string, tenantId?: string): Promise<{
        id: any;
        studentId: any;
        name: any;
        studentName: any;
        rollNo: any;
        phone: any;
        parentPhone: any;
        fatherPhone: any;
        motherPhone: any;
        email: any;
        fatherName: any;
        motherName: any;
        class: any;
        className: any;
        section: any;
        sectionName: any;
        classSection: string;
        outstandingAmount: number;
        currentYearDue: number;
        previousYearDue: number;
        grandTotalDue: number;
        totalDue: number;
        totalPendingBalance: number;
        totalPaidAmount: number;
        status: string;
        feeSummary: {
            currentYear: {
                feeProductsAmount: number;
                paidAmount: number;
                pendingAmount: number;
            };
            previousYears: {
                academicYearName: string;
                outstandingBalance: number;
            }[];
            overall: {
                totalCurrentYearDue: number;
                totalPreviousYearDue: number;
                grandTotalBalanceDue: number;
            };
        };
        account: {
            id: any;
            name: any;
            rollNo: any;
            phone: any;
            parentPhone: any;
            fatherPhone: any;
            motherPhone: any;
            fatherName: any;
            motherName: any;
            className: any;
            sectionName: any;
            opportunities: {
                id: any;
                name: string;
                academicYearId: string;
                amount: number;
                stage: string;
            }[];
        };
    }[]>;
    private formatStudentForBilling;
    getStudentBillingAccount(studentId: string, tenantId?: string): Promise<{
        account: {
            id: any;
            name: any;
            rollNo: any;
            phone: any;
            parentPhone: any;
            fatherPhone: any;
            motherPhone: any;
            fatherName: any;
            motherName: any;
            className: any;
            sectionName: any;
            opportunities: {
                id: any;
                name: string;
                academicYearId: string;
                amount: number;
                stage: string;
            }[];
        };
        student: {
            id: any;
            studentId: any;
            name: any;
            studentName: any;
            rollNo: any;
            phone: any;
            parentPhone: any;
            fatherPhone: any;
            motherPhone: any;
            email: any;
            fatherName: any;
            motherName: any;
            class: any;
            className: any;
            section: any;
            sectionName: any;
            classSection: string;
            outstandingAmount: number;
            currentYearDue: number;
            previousYearDue: number;
            grandTotalDue: number;
            totalDue: number;
            totalPendingBalance: number;
            totalPaidAmount: number;
            status: string;
            feeSummary: {
                currentYear: {
                    feeProductsAmount: number;
                    paidAmount: number;
                    pendingAmount: number;
                };
                previousYears: {
                    academicYearName: string;
                    outstandingBalance: number;
                }[];
                overall: {
                    totalCurrentYearDue: number;
                    totalPreviousYearDue: number;
                    grandTotalBalanceDue: number;
                };
            };
            account: {
                id: any;
                name: any;
                rollNo: any;
                phone: any;
                parentPhone: any;
                fatherPhone: any;
                motherPhone: any;
                fatherName: any;
                motherName: any;
                className: any;
                sectionName: any;
                opportunities: {
                    id: any;
                    name: string;
                    academicYearId: string;
                    amount: number;
                    stage: string;
                }[];
            };
        };
        id: any;
        studentId: any;
        name: any;
        studentName: any;
        rollNo: any;
        phone: any;
        parentPhone: any;
        fatherPhone: any;
        motherPhone: any;
        email: any;
        fatherName: any;
        motherName: any;
        class: any;
        className: any;
        section: any;
        sectionName: any;
        classSection: string;
        outstandingAmount: number;
        currentYearDue: number;
        previousYearDue: number;
        grandTotalDue: number;
        totalDue: number;
        totalPendingBalance: number;
        totalPaidAmount: number;
        status: string;
        feeSummary: {
            currentYear: {
                feeProductsAmount: number;
                paidAmount: number;
                pendingAmount: number;
            };
            previousYears: {
                academicYearName: string;
                outstandingBalance: number;
            }[];
            overall: {
                totalCurrentYearDue: number;
                totalPreviousYearDue: number;
                grandTotalBalanceDue: number;
            };
        };
    }>;
    getUnpaidFees(oppId: string, tenantId?: string): Promise<{
        oliId: string;
        productName: string;
        productId: string;
        totalAmount: number;
        discountAmount: number;
        paidAmount: number;
        balanceDue: number;
        discountPercent: number;
    }[]>;
}
