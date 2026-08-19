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
exports.PlatformAdminService = void 0;
const common_1 = require("@nestjs/common");
const crypto_util_1 = require("../../common/utils/crypto.util");
let PlatformAdminService = class PlatformAdminService {
    constructor(adminRepo, tenantRepo, subRepo) {
        this.adminRepo = adminRepo;
        this.tenantRepo = tenantRepo;
        this.subRepo = subRepo;
    }
    async getDashboardMetrics() {
        const schools = await this.tenantRepo.findAll();
        const plans = await this.subRepo.findPlans();
        return {
            totalSchools: schools.length,
            activeSubscriptions: plans.length,
            totalRevenue: 0,
        };
    }
    async getAllSchools() {
        return this.tenantRepo.findAll();
    }
    async updateSchoolStatus(tenantId, status) {
        return this.tenantRepo.update(tenantId, { setupCompleted: status === 'ACTIVE' });
    }
    async getSubscriptionPlans() {
        return this.subRepo.findPlans();
    }
    async createSubscriptionPlan(data) {
        return this.subRepo.createOrder(data);
    }
    async updateSubscriptionPlan(id, data) {
        return this.subRepo.findPlanById(id);
    }
    async getPlatformSettings() {
        const settings = await this.adminRepo.getSettings();
        return settings || {};
    }
    async updatePlatformSettings(data) {
        let settings = await this.adminRepo.getSettings();
        if (settings) {
            return this.adminRepo.updateSettings(settings.id, data);
        }
        else {
            return this.adminRepo.updateSettings('ps-001', data);
        }
    }
    async getPaymentGateways() {
        const gateways = await this.adminRepo.getGatewayConfigs();
        return gateways.map((gw) => ({
            ...gw,
            keySecret: gw.keySecret ? '******' : null,
            webhookSecret: gw.webhookSecret ? '******' : null,
        }));
    }
    async updatePaymentGateway(gatewayName, data) {
        const gateways = await this.adminRepo.getGatewayConfigs();
        const config = gateways.find((g) => g.gatewayName === gatewayName);
        const updateData = {
            merchantName: data.merchantName,
            mode: data.mode,
            isActive: data.isActive,
        };
        if (data.keyId)
            updateData.keyId = (0, crypto_util_1.encrypt)(data.keyId);
        if (data.keySecret && data.keySecret !== '******')
            updateData.keySecret = (0, crypto_util_1.encrypt)(data.keySecret);
        if (data.webhookSecret && data.webhookSecret !== '******')
            updateData.webhookSecret = (0, crypto_util_1.encrypt)(data.webhookSecret);
        if (config) {
            return this.adminRepo.updateGatewayConfig(config.id, updateData);
        }
        else {
            return this.adminRepo.updateGatewayConfig('pgc-001', updateData);
        }
    }
    async getAllPayments() {
        return this.subRepo.findPlans();
    }
    async getAllInvoices() {
        return this.subRepo.findPlans();
    }
};
exports.PlatformAdminService = PlatformAdminService;
exports.PlatformAdminService = PlatformAdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IPlatformAdminRepository')),
    __param(1, (0, common_1.Inject)('ITenantRepository')),
    __param(2, (0, common_1.Inject)('ISubscriptionRepository')),
    __metadata("design:paramtypes", [Object, Object, Object])
], PlatformAdminService);
//# sourceMappingURL=platform-admin.service.js.map