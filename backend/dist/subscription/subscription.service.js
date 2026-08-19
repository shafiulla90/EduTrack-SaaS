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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = exports.VALID_SUBSCRIPTION_TRANSITIONS = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const client_1 = require("@prisma/client");
exports.VALID_SUBSCRIPTION_TRANSITIONS = {
    [client_1.SubscriptionStatus.TRIAL]: [client_1.SubscriptionStatus.ACTIVE, client_1.SubscriptionStatus.GRACE_PERIOD, client_1.SubscriptionStatus.EXPIRED, client_1.SubscriptionStatus.CANCELLED],
    [client_1.SubscriptionStatus.ACTIVE]: [client_1.SubscriptionStatus.GRACE_PERIOD, client_1.SubscriptionStatus.EXPIRED, client_1.SubscriptionStatus.RENEWED, client_1.SubscriptionStatus.CANCELLED, client_1.SubscriptionStatus.SUSPENDED],
    [client_1.SubscriptionStatus.GRACE_PERIOD]: [client_1.SubscriptionStatus.ACTIVE, client_1.SubscriptionStatus.RENEWED, client_1.SubscriptionStatus.EXPIRED, client_1.SubscriptionStatus.SUSPENDED, client_1.SubscriptionStatus.CANCELLED],
    [client_1.SubscriptionStatus.EXPIRED]: [client_1.SubscriptionStatus.RENEWED, client_1.SubscriptionStatus.ACTIVE, client_1.SubscriptionStatus.SUSPENDED],
    [client_1.SubscriptionStatus.RENEWED]: [client_1.SubscriptionStatus.ACTIVE, client_1.SubscriptionStatus.GRACE_PERIOD, client_1.SubscriptionStatus.EXPIRED, client_1.SubscriptionStatus.CANCELLED, client_1.SubscriptionStatus.SUSPENDED],
    [client_1.SubscriptionStatus.CANCELLED]: [client_1.SubscriptionStatus.ACTIVE, client_1.SubscriptionStatus.RENEWED],
    [client_1.SubscriptionStatus.SUSPENDED]: [client_1.SubscriptionStatus.ACTIVE, client_1.SubscriptionStatus.RENEWED, client_1.SubscriptionStatus.CANCELLED],
    [client_1.SubscriptionStatus.PAST_DUE]: [client_1.SubscriptionStatus.ACTIVE, client_1.SubscriptionStatus.GRACE_PERIOD, client_1.SubscriptionStatus.EXPIRED, client_1.SubscriptionStatus.CANCELLED],
};
let SubscriptionService = class SubscriptionService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    validateStateTransition(currentStatus, targetStatus) {
        const allowed = exports.VALID_SUBSCRIPTION_TRANSITIONS[currentStatus] || [];
        return allowed.includes(targetStatus);
    }
    async transitionStatus(tenantId, targetStatus, reason) {
        const subscription = await this.prisma.tenantSubscription.findUnique({
            where: { tenantId },
            include: { plan: true },
        });
        if (!subscription) {
            throw new common_1.NotFoundException(`Subscription for tenant '${tenantId}' not found.`);
        }
        if (!this.validateStateTransition(subscription.status, targetStatus)) {
            throw new common_1.BadRequestException(`Invalid subscription status transition from '${subscription.status}' to '${targetStatus}'.`);
        }
        return this.prisma.tenantSubscription.update({
            where: { tenantId },
            data: {
                status: targetStatus,
                updatedAt: new Date(),
            },
            include: { plan: true },
        });
    }
    async activateOrRenew(tenantId, planId, durationMonths = 12) {
        const plan = await this.prisma.subscriptionPlan.findUnique({
            where: { id: planId },
        });
        if (!plan) {
            throw new common_1.NotFoundException(`Subscription plan '${planId}' not found.`);
        }
        const currentSub = await this.prisma.tenantSubscription.findUnique({
            where: { tenantId },
        });
        let startDate = new Date();
        let expiryDate = new Date();
        if (currentSub && currentSub.expiryDate > new Date()) {
            startDate = new Date(currentSub.startDate);
            expiryDate = new Date(currentSub.expiryDate);
        }
        expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
        const gracePeriodEndDate = new Date(expiryDate);
        gracePeriodEndDate.setDate(gracePeriodEndDate.getDate() + 14);
        const targetStatus = currentSub && currentSub.status === client_1.SubscriptionStatus.ACTIVE
            ? client_1.SubscriptionStatus.RENEWED
            : client_1.SubscriptionStatus.ACTIVE;
        if (currentSub) {
            return this.prisma.tenantSubscription.update({
                where: { tenantId },
                data: {
                    planId: plan.id,
                    startDate,
                    expiryDate,
                    gracePeriodEndDate,
                    status: targetStatus,
                },
                include: { plan: true },
            });
        }
        else {
            return this.prisma.tenantSubscription.create({
                data: {
                    tenantId,
                    planId: plan.id,
                    startDate,
                    expiryDate,
                    gracePeriodEndDate,
                    status: client_1.SubscriptionStatus.TRIAL,
                },
                include: { plan: true },
            });
        }
    }
    async getSubscriptionDetails(tenantId) {
        const subscription = await this.prisma.tenantSubscription.findUnique({
            where: { tenantId },
            include: {
                plan: true,
                billingRecords: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                payments: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });
        if (!subscription) {
            throw new common_1.NotFoundException(`Subscription not found for tenant '${tenantId}'.`);
        }
        const now = new Date();
        const remainingDays = Math.max(0, Math.ceil((subscription.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        return {
            ...subscription,
            remainingDays,
            isExpired: now > subscription.expiryDate,
            isInGracePeriod: subscription.gracePeriodEndDate ? (now > subscription.expiryDate && now <= subscription.gracePeriodEndDate) : false,
        };
    }
};
exports.SubscriptionService = SubscriptionService;
exports.SubscriptionService = SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionService);
//# sourceMappingURL=subscription.service.js.map