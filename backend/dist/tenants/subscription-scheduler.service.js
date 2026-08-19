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
exports.SubscriptionSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const client_1 = require("@prisma/client");
let SubscriptionSchedulerService = class SubscriptionSchedulerService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    onModuleInit() {
        console.log('[SubscriptionScheduler] Initializing subscription scheduler...');
        setTimeout(() => {
            this.runExpiryNotificationChecks();
        }, 10000);
        this.intervalId = setInterval(() => {
            this.runExpiryNotificationChecks();
        }, 24 * 60 * 60 * 1000);
    }
    onModuleDestroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
    async runExpiryNotificationChecks() {
        console.log('[SubscriptionScheduler] Running daily subscription checks...');
        try {
            const now = new Date();
            const subscriptions = await this.prisma.tenantSubscription.findMany({
                where: {
                    status: { in: [client_1.SubscriptionStatus.ACTIVE, client_1.SubscriptionStatus.PAST_DUE] },
                },
                include: { tenant: true, plan: true },
            });
            for (const sub of subscriptions) {
                const expiry = new Date(sub.expiryDate);
                const diffTime = expiry.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                let daysBeforeExpiry = null;
                let notificationType = '';
                if (diffDays === 15 || diffDays === 7 || diffDays === 3 || diffDays === 1) {
                    daysBeforeExpiry = diffDays;
                    notificationType = 'BEFORE_EXPIRY';
                }
                else if (diffDays === 0) {
                    daysBeforeExpiry = 0;
                    notificationType = 'ON_EXPIRY';
                }
                else if (diffDays < 0) {
                    if (diffDays >= -3) {
                        daysBeforeExpiry = diffDays;
                        notificationType = 'GRACE_PERIOD';
                    }
                }
                if (notificationType) {
                    const admins = await this.prisma.user.findMany({
                        where: {
                            tenantId: sub.tenantId,
                            role: 'SCHOOL_ADMIN',
                            isActive: true,
                        },
                    });
                    for (const admin of admins) {
                        let message = '';
                        if (notificationType === 'BEFORE_EXPIRY') {
                            message = `Your school's EduTrack ${sub.plan.name} subscription will expire in ${diffDays} days on ${expiry.toDateString()}. Please renew soon.`;
                        }
                        else if (notificationType === 'ON_EXPIRY') {
                            message = `Your school's EduTrack subscription has expired today. You are now entering a 3-day grace period.`;
                        }
                        else if (notificationType === 'GRACE_PERIOD') {
                            message = `Your school's EduTrack subscription is expired (Grace Period: Day ${Math.abs(diffDays)} of 3). Please renew to prevent lockout.`;
                        }
                        await this.prisma.notification.create({
                            data: {
                                title: 'Subscription Expiry Notice',
                                message,
                                type: 'IN_APP',
                                recipientId: admin.id,
                                isRead: false,
                            },
                        }).catch(err => console.error('Failed to log In-App notification:', err));
                        await this.prisma.subscriptionNotificationLog.create({
                            data: {
                                tenantId: sub.tenantId,
                                daysBeforeExpiry,
                                notificationType,
                                channel: 'IN_APP',
                                status: 'SUCCESS',
                            },
                        }).catch(err => console.error('Failed to log SubscriptionNotificationLog:', err));
                    }
                }
            }
        }
        catch (e) {
            console.error('[SubscriptionScheduler] Error during daily checks:', e);
        }
    }
};
exports.SubscriptionSchedulerService = SubscriptionSchedulerService;
exports.SubscriptionSchedulerService = SubscriptionSchedulerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionSchedulerService);
//# sourceMappingURL=subscription-scheduler.service.js.map