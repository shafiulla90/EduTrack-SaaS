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
exports.SubscriptionController = void 0;
const common_1 = require("@nestjs/common");
const subscription_service_1 = require("./subscription.service");
const client_1 = require("@prisma/client");
let SubscriptionController = class SubscriptionController {
    constructor(subscriptionService) {
        this.subscriptionService = subscriptionService;
    }
    async getSubscriptionDetails(tenantId) {
        return this.subscriptionService.getSubscriptionDetails(tenantId);
    }
    async transitionStatus(tenantId, status, reason) {
        return this.subscriptionService.transitionStatus(tenantId, status, reason);
    }
    async activateOrRenew(tenantId, planId, durationMonths) {
        return this.subscriptionService.activateOrRenew(tenantId, planId, durationMonths || 12);
    }
};
exports.SubscriptionController = SubscriptionController;
__decorate([
    (0, common_1.Get)(':tenantId'),
    __param(0, (0, common_1.Param)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getSubscriptionDetails", null);
__decorate([
    (0, common_1.Post)(':tenantId/transition'),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)('status')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "transitionStatus", null);
__decorate([
    (0, common_1.Post)(':tenantId/activate'),
    __param(0, (0, common_1.Param)('tenantId')),
    __param(1, (0, common_1.Body)('planId')),
    __param(2, (0, common_1.Body)('durationMonths')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "activateOrRenew", null);
exports.SubscriptionController = SubscriptionController = __decorate([
    (0, common_1.Controller)('api/v1/subscriptions'),
    __metadata("design:paramtypes", [subscription_service_1.SubscriptionService])
], SubscriptionController);
//# sourceMappingURL=subscription.controller.js.map