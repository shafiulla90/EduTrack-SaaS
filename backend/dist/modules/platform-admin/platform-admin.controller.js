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
exports.PlatformAdminController = void 0;
const common_1 = require("@nestjs/common");
const platform_admin_service_1 = require("./platform-admin.service");
let PlatformAdminController = class PlatformAdminController {
    constructor(platformAdminService) {
        this.platformAdminService = platformAdminService;
    }
    async getDashboard() {
        return this.platformAdminService.getDashboardMetrics();
    }
    async getSchools() {
        return this.platformAdminService.getAllSchools();
    }
    async updateSchoolStatus(id, body) {
        return this.platformAdminService.updateSchoolStatus(id, body.status);
    }
    async getPlans() {
        return this.platformAdminService.getSubscriptionPlans();
    }
    async createPlan(body) {
        return this.platformAdminService.createSubscriptionPlan(body);
    }
    async updatePlan(id, body) {
        return this.platformAdminService.updateSubscriptionPlan(id, body);
    }
    async getSettings() {
        return this.platformAdminService.getPlatformSettings();
    }
    async updateSettings(body) {
        return this.platformAdminService.updatePlatformSettings(body);
    }
    async getGateways() {
        return this.platformAdminService.getPaymentGateways();
    }
    async updateGateway(name, body) {
        return this.platformAdminService.updatePaymentGateway(name, body);
    }
    async getPayments() {
        return this.platformAdminService.getAllPayments();
    }
    async getInvoices() {
        return this.platformAdminService.getAllInvoices();
    }
};
exports.PlatformAdminController = PlatformAdminController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlatformAdminController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('schools'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlatformAdminController.prototype, "getSchools", null);
__decorate([
    (0, common_1.Patch)('schools/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlatformAdminController.prototype, "updateSchoolStatus", null);
__decorate([
    (0, common_1.Get)('plans'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlatformAdminController.prototype, "getPlans", null);
__decorate([
    (0, common_1.Post)('plans'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlatformAdminController.prototype, "createPlan", null);
__decorate([
    (0, common_1.Put)('plans/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlatformAdminController.prototype, "updatePlan", null);
__decorate([
    (0, common_1.Get)('settings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlatformAdminController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Put)('settings'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlatformAdminController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Get)('gateways'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlatformAdminController.prototype, "getGateways", null);
__decorate([
    (0, common_1.Put)('gateways/:name'),
    __param(0, (0, common_1.Param)('name')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PlatformAdminController.prototype, "updateGateway", null);
__decorate([
    (0, common_1.Get)('payments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlatformAdminController.prototype, "getPayments", null);
__decorate([
    (0, common_1.Get)('invoices'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlatformAdminController.prototype, "getInvoices", null);
exports.PlatformAdminController = PlatformAdminController = __decorate([
    (0, common_1.Controller)('api/platform-admin'),
    __metadata("design:paramtypes", [platform_admin_service_1.PlatformAdminService])
], PlatformAdminController);
//# sourceMappingURL=platform-admin.controller.js.map