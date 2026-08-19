"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingController = void 0;
const common_1 = require("@nestjs/common");
const billing_service_1 = require("./billing.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let BillingController = class BillingController {
    constructor(billingService) {
        this.billingService = billingService;
    }
    async create(opportunityId, studentId, items, paymentMethod, bankDetails) {
        return this.billingService.createInvoice(opportunityId, studentId, items, paymentMethod, bankDetails);
    }
    async getRecent(studentId) {
        return this.billingService.getRecentInvoices(studentId);
    }
    async getPdfData(id) {
        return this.billingService.getInvoicePDFData(id);
    }
    async downloadInvoicePdf(id, res) {
        const data = await this.billingService.getInvoicePDFData(id);
        return this.billingService.generateReceiptPdfStream(data, res);
    }
    async void(id) {
        return this.billingService.voidInvoice(id);
    }
    async getActiveProducts(classId, academicYearId) {
        return this.billingService.getActiveProducts(classId, academicYearId);
    }
    async createAdmission(studentData, selectedPricebookEntryIds, concessionAmount) {
        return this.billingService.createAdmission(studentData, selectedPricebookEntryIds, concessionAmount);
    }
    async getYears() {
        return this.billingService.getAcademicYearOptions();
    }
    async getClasses() {
        return this.billingService.getClassOptions();
    }
    async getSections(classId) {
        return this.billingService.getSectionOptions(classId);
    }
    async search(searchTerm) {
        return this.billingService.searchStudents(searchTerm || '');
    }
    async getStudent(id, academicYearId) {
        return this.billingService.getStudentById(id, academicYearId);
    }
    async getUnpaidFees(opportunityId) {
        return this.billingService.getUnpaidFees(opportunityId);
    }
    async updateDiscount(oliId, discountPercent) {
        return this.billingService.updateLineItemDiscount(oliId, discountPercent);
    }
    async updateDiscountsBulk(oliIds, discountPercent) {
        return this.billingService.updateBulkLineItemDiscounts(oliIds, discountPercent);
    }
    async importStudents(studentDataList) {
        return this.billingService.importStudentsBulk(studentDataList);
    }
    async getProducts() {
        return this.billingService.getAllFeeProducts();
    }
    async createProducts(productNames) {
        return this.billingService.createFeeProducts(productNames);
    }
    async getPriceBook(classId, academicYearId) {
        return this.billingService.getPriceBook(classId, academicYearId);
    }
    async savePriceBook(classId, academicYearId, priceItems) {
        return this.billingService.savePriceBook(classId, academicYearId, priceItems);
    }
    async getFinancialCommandCenter(req, academicYearId, financialYear, month, week, startDate, endDate, classId, sectionId, studentId, paymentMethod, feeCategory, expenseCategory, collectionStatus) {
        const userId = req.user.id;
        const tenantId = req.user.tenantId;
        const hasAccess = await this.billingService.checkCorrespondentAccess(userId, tenantId);
        if (!hasAccess) {
            throw new common_1.HttpException('Access denied. Only school owners, correspondents, or super admins can access this data.', common_1.HttpStatus.FORBIDDEN);
        }
        return this.billingService.getFinancialCommandCenterData(tenantId, {
            academicYearId,
            financialYear,
            month: month ? parseInt(month, 10) : undefined,
            week: week ? parseInt(week, 10) : undefined,
            startDate,
            endDate,
            classId,
            sectionId,
            studentId,
            paymentMethod,
            feeCategory,
            expenseCategory,
            collectionStatus,
        });
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, common_1.Post)('invoices'),
    __param(0, (0, common_1.Body)('opportunityId')),
    __param(1, (0, common_1.Body)('studentId')),
    __param(2, (0, common_1.Body)('items')),
    __param(3, (0, common_1.Body)('paymentMethod')),
    __param(4, (0, common_1.Body)('bankDetails')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array, String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('invoices/recent'),
    __param(0, (0, common_1.Query)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getRecent", null);
__decorate([
    (0, common_1.Get)('invoices/:id/pdf'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getPdfData", null);
__decorate([
    (0, common_1.Get)('invoices/:id/pdf/download'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "downloadInvoicePdf", null);
__decorate([
    (0, common_1.Post)('invoices/:id/void'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "void", null);
__decorate([
    (0, common_1.Get)('products/active'),
    __param(0, (0, common_1.Query)('classId')),
    __param(1, (0, common_1.Query)('academicYearId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getActiveProducts", null);
__decorate([
    (0, common_1.Post)('admissions'),
    __param(0, (0, common_1.Body)('studentData')),
    __param(1, (0, common_1.Body)('selectedPricebookEntryIds')),
    __param(2, (0, common_1.Body)('concessionAmount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array, Number]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "createAdmission", null);
__decorate([
    (0, common_1.Get)('options/years'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getYears", null);
__decorate([
    (0, common_1.Get)('options/classes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getClasses", null);
__decorate([
    (0, common_1.Get)('options/sections'),
    __param(0, (0, common_1.Query)('classId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getSections", null);
__decorate([
    (0, common_1.Get)('students/search'),
    __param(0, (0, common_1.Query)('searchTerm')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('students/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('academicYearId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getStudent", null);
__decorate([
    (0, common_1.Get)('unpaid-fees/:opportunityId'),
    __param(0, (0, common_1.Param)('opportunityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getUnpaidFees", null);
__decorate([
    (0, common_1.Post)('discounts'),
    __param(0, (0, common_1.Body)('oliId')),
    __param(1, (0, common_1.Body)('discountPercent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "updateDiscount", null);
__decorate([
    (0, common_1.Post)('discounts/bulk'),
    __param(0, (0, common_1.Body)('oliIds')),
    __param(1, (0, common_1.Body)('discountPercent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Number]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "updateDiscountsBulk", null);
__decorate([
    (0, common_1.Post)('students/import'),
    __param(0, (0, common_1.Body)('studentDataList')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "importStudents", null);
__decorate([
    (0, common_1.Get)('products'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Post)('products'),
    __param(0, (0, common_1.Body)('productNames')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "createProducts", null);
__decorate([
    (0, common_1.Get)('pricebook'),
    __param(0, (0, common_1.Query)('classId')),
    __param(1, (0, common_1.Query)('academicYearId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getPriceBook", null);
__decorate([
    (0, common_1.Post)('pricebook'),
    __param(0, (0, common_1.Body)('classId')),
    __param(1, (0, common_1.Body)('academicYearId')),
    __param(2, (0, common_1.Body)('priceItems')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "savePriceBook", null);
__decorate([
    (0, common_1.Get)('financial-command-center'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('academicYearId')),
    __param(2, (0, common_1.Query)('financialYear')),
    __param(3, (0, common_1.Query)('month')),
    __param(4, (0, common_1.Query)('week')),
    __param(5, (0, common_1.Query)('startDate')),
    __param(6, (0, common_1.Query)('endDate')),
    __param(7, (0, common_1.Query)('classId')),
    __param(8, (0, common_1.Query)('sectionId')),
    __param(9, (0, common_1.Query)('studentId')),
    __param(10, (0, common_1.Query)('paymentMethod')),
    __param(11, (0, common_1.Query)('feeCategory')),
    __param(12, (0, common_1.Query)('expenseCategory')),
    __param(13, (0, common_1.Query)('collectionStatus')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getFinancialCommandCenter", null);
exports.BillingController = BillingController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('billing'),
    __metadata("design:paramtypes", [billing_service_1.BillingService])
], BillingController);
//# sourceMappingURL=billing.controller.js.map