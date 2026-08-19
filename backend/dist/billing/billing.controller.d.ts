import { BillingService } from './billing.service';
export declare class BillingController {
    private billingService;
    constructor(billingService: BillingService);
    create(opportunityId: string, studentId: string, items: {
        oliId: string;
        productId: string;
        amount: number;
    }[], paymentMethod: string, bankDetails?: any): Promise<string>;
    getRecent(studentId?: string): Promise<{
        id: any;
        name: any;
        rollNo: any;
        dateStr: any;
        status: string;
        totalAmount: number;
        paymentMethod: any;
    }[]>;
    getPdfData(id: string): Promise<{
        schoolName: string;
        schoolAddress: string;
        schoolPhone: string;
        schoolLogo: string;
        schoolSubtitle: string;
        invoiceNo: string;
        invoiceDate: string;
        academicYear: string;
        admissionRef: string;
        studentName: string;
        fatherName: string;
        motherName: string;
        className: string;
        sectionName: string;
        studentDob: string;
        addressVillage: string;
        totalAmount: number;
        items: {
            particulars: string;
            amount: number;
        }[];
    }>;
    downloadInvoicePdf(id: string, res: any): Promise<void>;
    void(id: string): Promise<{
        id: string;
        tenantId: string;
        status: import(".prisma/client").$Enums.PaymentStatus;
        bankName: string | null;
        bankBranch: string | null;
        bankIFSC: string | null;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        studentId: string;
        invoiceDate: Date;
        dueDate: Date;
        totalAmount: import("@prisma/client/runtime/library").Decimal;
        paidAmount: import("@prisma/client/runtime/library").Decimal;
        remainingBalance: import("@prisma/client/runtime/library").Decimal;
        description: string | null;
        opportunityId: string | null;
        bankAccountNumber: string | null;
    }>;
    getActiveProducts(classId: string, academicYearId?: string): Promise<{
        id: any;
        product2Id: any;
        productName: any;
        productDescription: any;
        unitPrice: number;
        pricebook2Id: any;
    }[]>;
    createAdmission(studentData: any, selectedPricebookEntryIds: string[], concessionAmount: number): Promise<{
        success: boolean;
        opportunityId: string;
        accountId: string;
    }>;
    getYears(): Promise<{
        label: string;
        value: string;
    }[]>;
    getClasses(): Promise<{
        label: string;
        value: string;
    }[]>;
    getSections(classId?: string): Promise<{
        label: string;
        value: string;
    }[]>;
    search(searchTerm: string): Promise<any[]>;
    getStudent(id: string, academicYearId?: string): Promise<{
        account: {
            id: string;
            name: string;
            rollNo: string;
            phone: string;
            profilePhotoUrl: string;
            fatherName: string;
            motherName: string;
            aadharNo: string;
            class: string;
            section: string;
            classId: string;
            sectionId: string;
            opportunities: {
                id: string;
                academicYearId: string;
            }[];
        };
        totalFees: number;
        paidAmount: number;
        currentYearPending: number;
        previousYearPending: number;
        totalPendingBalance: number;
        pendingPercentage: number;
        paidPercentage: number;
        financialStatus: string;
        totalPaidAmount: number;
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
    getUnpaidFees(opportunityId: string): Promise<any[]>;
    updateDiscount(oliId: string, discountPercent: number): Promise<{
        id: string;
        updatedAt: Date;
        tenantId: string;
        createdAt: Date;
        opportunityId: string;
        productId: string;
        unitPrice: import("@prisma/client/runtime/library").Decimal;
        pricebookEntryId: string;
        quantity: import("@prisma/client/runtime/library").Decimal;
        discount: import("@prisma/client/runtime/library").Decimal;
    }>;
    updateDiscountsBulk(oliIds: string[], discountPercent: number): Promise<import(".prisma/client").Prisma.BatchPayload>;
    importStudents(studentDataList: any[]): Promise<{
        totalRows: number;
        successCount: number;
        errors: string[];
    }>;
    getProducts(): Promise<{
        id: string;
        isActive: boolean;
        updatedAt: Date;
        name: string;
        tenantId: string;
        createdAt: Date;
        description: string | null;
        productCode: string | null;
    }[]>;
    createProducts(productNames: string[]): Promise<any[]>;
    getPriceBook(classId: string, academicYearId: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        academicYearId: string;
        classId: string;
        entries: {
            productId: string;
            productName: string;
            unitPrice: number;
            isActive: boolean;
        }[];
    }>;
    savePriceBook(classId: string, academicYearId: string, priceItems: {
        productId: string;
        price: number;
        selected: boolean;
    }[]): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        academicYearId: string;
        classId: string;
        entries: {
            productId: string;
            productName: string;
            unitPrice: number;
            isActive: boolean;
        }[];
    }>;
    getFinancialCommandCenter(req: any, academicYearId?: string, financialYear?: string, month?: string, week?: string, startDate?: string, endDate?: string, classId?: string, sectionId?: string, studentId?: string, paymentMethod?: string, feeCategory?: string, expenseCategory?: string, collectionStatus?: string): Promise<{
        activeYearName: string;
        summary: {
            revenue: {
                allTime: number;
                academicYear: number;
                currentMonth: number;
                prevMonth: number;
                today: number;
                yesterday: number;
                thisWeek: number;
                last30Days: number;
                currentMonthInvoicesCount: number;
                prevMonthInvoicesCount: number;
            };
            pending: {
                total: number;
                studentsCount: number;
                overdue: number;
                dueToday: number;
                dueThisWeek: number;
                dueThisMonth: number;
            };
            students: {
                total: number;
                active: number;
                paidCompletely: number;
                partiallyPaid: number;
                pending: number;
                newAdmissions: number;
                promoted: number;
            };
            expenses: {
                allTime: number;
                academicYear: number;
                currentMonth: number;
                prevMonth: number;
                today: number;
                thisWeek: number;
            };
            profit: {
                grossRevenue: number;
                totalExpenses: number;
                netProfit: number;
                profitMargin: number;
                collectionRate: number;
                pendingPercentage: number;
            };
            cashFlow: {
                openingBalance: number;
                totalIncome: number;
                totalExpenses: number;
                closingBalance: number;
                expectedIncome: number;
                expectedExpenses: number;
                netCashFlow: number;
            };
            healthScore: string;
        };
        growth: {
            revenue: number;
            expense: number;
            profit: number;
            collection: number;
            student: number;
        };
        charts: {
            monthlyRevenue: any[];
            monthlyExpenses: any[];
            incomeVsExpense: any[];
            dailyCollectionTrend: any[];
            paymentMethodsDistribution: {
                method: string;
                amount: number;
                percentage: number;
            }[];
            expenseCategoryAnalysis: {
                categoryName: string;
                amount: number;
                percentage: number;
            }[];
            feeCategoryAnalysis: {
                categoryName: string;
                collected: number;
                pending: number;
                collectionPercentage: number;
            }[];
            outstandingByClass: {
                classId: string;
                className: string;
                totalPending: number;
                studentCount: number;
                collectionPercentage: number;
                collected: number;
            }[];
            outstandingBySection: {
                sectionId: string;
                sectionName: string;
                totalPending: number;
                studentCount: number;
                collectionPercentage: number;
                collected: number;
            }[];
        };
        insights: {
            executive: {
                highestPayingClass: string;
                highestPendingClass: string;
                highestRevenueMonth: any;
                highestExpenseMonth: any;
                topExpenseCategory: string;
                topFeeCategory: string;
                averageRevenuePerStudent: number;
                averagePendingPerStudent: number;
                averageExpensePerStudent: number;
                profitPerStudent: number;
            };
            topPendingStudents: any[];
            topPayingStudents: any[];
            recentlyClearedDues: any[];
            studentsNearDueDate: any[];
            expense: {
                recentExpenses: {
                    id: string;
                    category: string;
                    amount: number;
                    date: string;
                    description: string;
                }[];
                highestExpenseToday: number;
                highestExpenseThisMonth: number;
                recurringExpenses: {
                    categoryName: string;
                    amount: number;
                    percentage: number;
                }[];
                upcomingExpenseReminders: string[];
            };
        };
        notifications: any[];
        timeline: any[];
        activities: {
            latestPayments: {
                id: string;
                studentName: string;
                amount: number;
                date: string;
                method: import(".prisma/client").$Enums.PaymentMethod;
            }[];
            latestExpenses: {
                id: string;
                category: string;
                amount: number;
                date: string;
                mode: string;
            }[];
            latestRollbacks: {
                id: string;
                studentName: string;
                amount: number;
                date: string;
            }[];
            latestAdmissions: {
                id: string;
                name: string;
                date: string;
                class: string;
            }[];
            latestFeeAdjustments: {
                id: string;
                productName: string;
                discountPercent: number;
                unitPrice: number;
            }[];
            latestRefunds: any[];
        };
        kpis: {
            feeCollectionRate: number;
            expenseRatio: number;
            avgFeePerStudent: number;
            avgExpensePerStudent: number;
            profitPerStudent: number;
            revenuePerStudent: number;
            outstandingRatio: number;
            netMargin: number;
        };
        classes: {
            id: string;
            name: string;
        }[];
        sections: {
            id: string;
            name: string;
        }[];
        academicYears: {
            id: string;
            name: string;
        }[];
    }>;
}
