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
exports.SaaSBillingController = void 0;
const common_1 = require("@nestjs/common");
const saas_billing_service_1 = require("./saas-billing.service");
let SaaSBillingController = class SaaSBillingController {
    constructor(billingService) {
        this.billingService = billingService;
    }
    async getPaymentSettings() {
        return this.billingService.getPaymentSettings();
    }
    async calculateInvoiceTotal(amountCents, discountCents) {
        return this.billingService.calculateInvoiceTotal(amountCents, discountCents || 0);
    }
    async createInvoice(tenantId, planId, amountCents, discountCents) {
        return this.billingService.createInvoice(tenantId, planId, amountCents, discountCents || 0);
    }
};
exports.SaaSBillingController = SaaSBillingController;
__decorate([
    (0, common_1.Get)('settings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SaaSBillingController.prototype, "getPaymentSettings", null);
__decorate([
    (0, common_1.Post)('calculate'),
    __param(0, (0, common_1.Body)('amountCents')),
    __param(1, (0, common_1.Body)('discountCents')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], SaaSBillingController.prototype, "calculateInvoiceTotal", null);
__decorate([
    (0, common_1.Post)('invoices'),
    __param(0, (0, common_1.Body)('tenantId')),
    __param(1, (0, common_1.Body)('planId')),
    __param(2, (0, common_1.Body)('amountCents')),
    __param(3, (0, common_1.Body)('discountCents')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Number, Number]),
    __metadata("design:returntype", Promise)
], SaaSBillingController.prototype, "createInvoice", null);
exports.SaaSBillingController = SaaSBillingController = __decorate([
    (0, common_1.Controller)('api/v1/billing'),
    __metadata("design:paramtypes", [saas_billing_service_1.SaaSBillingService])
], SaaSBillingController);
//# sourceMappingURL=saas-billing.controller.js.map