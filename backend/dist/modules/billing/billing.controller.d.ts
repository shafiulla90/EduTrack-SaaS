import { BillingService } from './billing.service';
export declare class BillingController {
    private readonly billingService;
    constructor(billingService: BillingService);
    getProducts(req: any): Promise<any[]>;
    createProducts(body: any, req: any): Promise<any[]>;
    updateProduct(id: string, name: string, req: any): Promise<any>;
    deleteProduct(id: string, req: any): Promise<any>;
    getPriceBook(classId: string, academicYearId: string, req: any): Promise<any[]>;
    savePriceBook(classId: string, academicYearId: string, priceItems: any[], req: any): Promise<any>;
    getActiveProducts(classId: string, academicYearId?: string, req?: any): Promise<any[]>;
    createInvoice(body: any, req: any): Promise<{
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
    getRecentInvoices(studentId?: string, req?: any): Promise<any[]>;
    getInvoicePDFData(id: string, req: any): Promise<{
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
    getInvoiceDetails(id: string, req: any): Promise<{
        id: string;
        invoiceNo: any;
        totalAmount: any;
        paidAmount: any;
        remainingBalance: any;
        status: any;
        items: any;
    }>;
    voidInvoice(id: string, req: any): Promise<{
        success: boolean;
        id: string;
        message: string;
    }>;
    createAdmission(studentData: any, selectedPricebookEntryIds: string[], concessionAmount: number, req: any): Promise<{
        success: boolean;
        message: string;
        opportunityId: string;
        studentId: `${string}-${string}-${string}-${string}-${string}`;
        studentData: any;
        tenantId: string;
    }>;
    updateDiscount(oliId: string, discountPercent: number): Promise<{
        success: boolean;
        oliId: string;
        discountPercent: number;
    }>;
    updateDiscountsBulk(oliIds: string[], discountPercent: number): Promise<{
        success: boolean;
        oliIds: string[];
        discountPercent: number;
    }>;
    getYearsOptions(req: any): Promise<{
        value: any;
        label: any;
    }[]>;
    getClassesOptions(req: any): Promise<{
        value: any;
        label: any;
    }[]>;
    getSectionsOptions(classId: string, req: any): Promise<{
        value: any;
        label: any;
    }[]>;
    searchStudents(searchTerm: string, req: any): Promise<{
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
    searchStudentsAlias(searchTerm: string, req: any): Promise<{
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
    getStudentBillingAccount(id: string, req: any): Promise<{
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
    getUnpaidFees(oppId: string, req: any): Promise<{
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
