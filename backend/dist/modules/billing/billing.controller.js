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
const swagger_1 = require("@nestjs/swagger");
let BillingController = class BillingController {
    constructor(billingService) {
        this.billingService = billingService;
    }
    async getProducts(req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.billingService.getAllFeeProducts(tenantId);
    }
    async createProducts(body, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        let names = [];
        if (Array.isArray(body)) {
            names = body;
        }
        else if (body?.productNames && Array.isArray(body.productNames)) {
            names = body.productNames;
        }
        else if (body?.name) {
            names = [body.name];
        }
        return this.billingService.createFeeProducts(names, tenantId);
    }
    async updateProduct(id, name, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.billingService.updateFeeProduct(id, name, tenantId);
    }
    async deleteProduct(id, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.billingService.deleteFeeProduct(id, tenantId);
    }
    async getPriceBook(classId, academicYearId, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.billingService.getPriceBook(classId, academicYearId, tenantId);
    }
    async savePriceBook(classId, academicYearId, priceItems, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.billingService.savePriceBook(classId, academicYearId, priceItems || [], tenantId);
    }
    async getActiveProducts(classId, academicYearId, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.billingService.getActiveProducts(classId, academicYearId, tenantId);
    }
    async createInvoice(body, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.billingService.createInvoice(body, body.items || [], tenantId);
    }
    async getRecentInvoices(studentId, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.billingService.getRecentInvoices(studentId, tenantId);
    }
    async getInvoicePDFData(id, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.billingService.getInvoicePDFData(id, tenantId);
    }
    async getInvoiceDetails(id, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.billingService.getInvoiceDetails(id, tenantId);
    }
    async voidInvoice(id, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return { success: true, id, message: 'Invoice voided successfully' };
    }
    async createAdmission(studentData, selectedPricebookEntryIds, concessionAmount, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.billingService.createAdmission(studentData, selectedPricebookEntryIds || [], concessionAmount || 0, tenantId);
    }
    async updateDiscount(oliId, discountPercent) {
        return this.billingService.updateLineItemDiscount(oliId, discountPercent);
    }
    async updateDiscountsBulk(oliIds, discountPercent) {
        return this.billingService.updateBulkLineItemDiscounts(oliIds || [], discountPercent);
    }
    async getYearsOptions(req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.billingService.getYearsOptions(tenantId);
    }
    async getClassesOptions(req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.billingService.getClassesOptions(tenantId);
    }
    async getSectionsOptions(classId, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.billingService.getSectionsOptions(classId, tenantId);
    }
    async searchStudents(searchTerm, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.billingService.searchStudents(searchTerm, tenantId);
    }
    async searchStudentsAlias(searchTerm, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.billingService.searchStudents(searchTerm, tenantId);
    }
    async getStudentBillingAccount(id, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.billingService.getStudentBillingAccount(id, tenantId);
    }
    async getUnpaidFees(oppId, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.billingService.getUnpaidFees(oppId, tenantId);
    }
};
exports.BillingController = BillingController;
__decorate([
    (0, common_1.Get)('products'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all fee products' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getProducts", null);
__decorate([
    (0, common_1.Post)('products'),
    (0, swagger_1.ApiOperation)({ summary: 'Create fee products' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "createProducts", null);
__decorate([
    (0, common_1.Patch)('products/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update fee product' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('name')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Delete)('products/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete fee product' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "deleteProduct", null);
__decorate([
    (0, common_1.Get)('pricebook'),
    (0, swagger_1.ApiOperation)({ summary: 'Get price book for class and academic year' }),
    __param(0, (0, common_1.Query)('classId')),
    __param(1, (0, common_1.Query)('academicYearId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getPriceBook", null);
__decorate([
    (0, common_1.Post)('pricebook'),
    (0, swagger_1.ApiOperation)({ summary: 'Save price book' }),
    __param(0, (0, common_1.Body)('classId')),
    __param(1, (0, common_1.Body)('academicYearId')),
    __param(2, (0, common_1.Body)('priceItems')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "savePriceBook", null);
__decorate([
    (0, common_1.Get)('products/active'),
    (0, swagger_1.ApiOperation)({ summary: 'Get active fee products for class' }),
    __param(0, (0, common_1.Query)('classId')),
    __param(1, (0, common_1.Query)('academicYearId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getActiveProducts", null);
__decorate([
    (0, common_1.Post)('invoices'),
    (0, swagger_1.ApiOperation)({ summary: 'Create invoice' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "createInvoice", null);
__decorate([
    (0, common_1.Get)('invoices/recent'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recent invoices' }),
    __param(0, (0, common_1.Query)('studentId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getRecentInvoices", null);
__decorate([
    (0, common_1.Get)('invoices/:id/pdf'),
    (0, swagger_1.ApiOperation)({ summary: 'Get PDF metadata for invoice receipt' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getInvoicePDFData", null);
__decorate([
    (0, common_1.Get)('invoices/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get invoice details by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getInvoiceDetails", null);
__decorate([
    (0, common_1.Post)('invoices/:id/void'),
    (0, swagger_1.ApiOperation)({ summary: 'Void an invoice payment' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "voidInvoice", null);
__decorate([
    (0, common_1.Post)('admissions'),
    (0, swagger_1.ApiOperation)({ summary: 'Create student admission with fee structure' }),
    __param(0, (0, common_1.Body)('studentData')),
    __param(1, (0, common_1.Body)('selectedPricebookEntryIds')),
    __param(2, (0, common_1.Body)('concessionAmount')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array, Number, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "createAdmission", null);
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
    (0, common_1.Get)('options/years'),
    (0, swagger_1.ApiOperation)({ summary: 'Get academic year options for admissions' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getYearsOptions", null);
__decorate([
    (0, common_1.Get)('options/classes'),
    (0, swagger_1.ApiOperation)({ summary: 'Get class options for admissions' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getClassesOptions", null);
__decorate([
    (0, common_1.Get)('options/sections'),
    (0, swagger_1.ApiOperation)({ summary: 'Get section options for admissions' }),
    __param(0, (0, common_1.Query)('classId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getSectionsOptions", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search students for fee payment' }),
    __param(0, (0, common_1.Query)('searchTerm')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "searchStudents", null);
__decorate([
    (0, common_1.Get)('students/search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search students for fee payment (alias)' }),
    __param(0, (0, common_1.Query)('searchTerm')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "searchStudentsAlias", null);
__decorate([
    (0, common_1.Get)('students/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get student billing account details' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getStudentBillingAccount", null);
__decorate([
    (0, common_1.Get)('unpaid-fees/:oppId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get unpaid fee line items for opportunity' }),
    __param(0, (0, common_1.Param)('oppId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BillingController.prototype, "getUnpaidFees", null);
exports.BillingController = BillingController = __decorate([
    (0, swagger_1.ApiTags)('Billing'),
    (0, common_1.Controller)('billing'),
    __metadata("design:paramtypes", [billing_service_1.BillingService])
], BillingController);
//# sourceMappingURL=billing.controller.js.map