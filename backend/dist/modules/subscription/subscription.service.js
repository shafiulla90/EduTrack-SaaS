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
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
let SubscriptionService = class SubscriptionService {
    constructor(subRepo) {
        this.subRepo = subRepo;
    }
    async assignFreePlanToNewTenant(tenantId) {
        let freePlan = await this.subRepo.findPlanById('free-plan-001');
        if (!freePlan) {
            const plans = await this.subRepo.findPlans();
            freePlan = plans.find((p) => p.name === 'Free Plan') || null;
        }
        const startDate = new Date();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 6);
        return this.subRepo.createSubscription({
            tenantId,
            planId: freePlan ? freePlan.id : 'free-plan-001',
            startDate,
            expiryDate,
            status: 'ACTIVE',
        });
    }
    async checkSubscriptionStatus(tenantId) {
        const sub = await this.subRepo.findActiveSubscription(tenantId);
        if (!sub) {
            return { status: 'EXPIRED', daysRemaining: 0 };
        }
        const daysRemaining = Math.max(0, Math.ceil((new Date(sub.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
        return { status: sub.status, daysRemaining };
    }
    async getAllPlans() {
        return this.subRepo.findPlans();
    }
    async getPaymentHistory(tenantId) {
        return this.subRepo.findPlans();
    }
    async getInvoices(tenantId) {
        return this.subRepo.findPlans();
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('ISubscriptionRepository')),
    __metadata("design:paramtypes", [Object])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map