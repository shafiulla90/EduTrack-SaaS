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
exports.SuperAdminController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const prisma_service_1 = require("../prisma.service");
const client_1 = require("@prisma/client");
const encryption_util_1 = require("../common/utils/encryption.util");
let SuperAdminController = class SuperAdminController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listTenants() {
        return this.prisma.tenant.findMany({
            include: {
                subscription: {
                    include: { plan: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateSubscription(id, planName, expiryDate, status) {
        const plan = await this.prisma.subscriptionPlan.findUnique({
            where: { name: planName },
        });
        if (!plan) {
            throw new common_1.NotFoundException(`Plan ${planName} not found`);
        }
        const currentSub = await this.prisma.tenantSubscription.findUnique({
            where: { tenantId: id },
            include: { plan: true },
        });
        if (!currentSub) {
            throw new common_1.NotFoundException(`Subscription record not found for tenant ${id}`);
        }
        const updateData = {
            planId: plan.id,
        };
        if (expiryDate) {
            updateData.expiryDate = new Date(expiryDate);
        }
        if (status) {
            updateData.status = status;
        }
        const updated = await this.prisma.tenantSubscription.update({
            where: { tenantId: id },
            data: updateData,
            include: { plan: true },
        });
        await this.prisma.subscriptionHistory.create({
            data: {
                tenantId: id,
                previousPlan: currentSub.plan.name,
                newPlan: plan.name,
                amount: 0.0,
                paymentMethod: 'SUPER_ADMIN_MANUAL',
                transactionReference: 'ADJ-' + Date.now(),
                startDate: currentSub.startDate,
                expiryDate: updateData.expiryDate || currentSub.expiryDate,
                status: status || client_1.SubscriptionStatus.ACTIVE,
            },
        });
        return updated;
    }
    async listPayments() {
        return this.prisma.subscriptionPayment.findMany({
            include: {
                tenant: { select: { name: true, subDomain: true } },
                invoice: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async generateInvoice(tenantId, planName, amount) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant ${tenantId} not found`);
        }
        const invoiceNumber = 'INV-SUB-MAN-' + Date.now().toString().slice(-6);
        return this.prisma.subscriptionInvoice.create({
            data: {
                invoiceNumber,
                tenantId,
                planId: planName,
                amount,
                gst: Number(amount) * 0.18,
                currency: 'INR',
                status: client_1.SaaSInvoiceStatus.GENERATED,
                pdfUrl: `/billing/invoices/subscription/${invoiceNumber}.pdf`,
            },
        });
    }
    async getStats() {
        const totalSchools = await this.prisma.tenant.count();
        const subscriptions = await this.prisma.tenantSubscription.findMany({
            include: { plan: true },
        });
        const activeTrials = subscriptions.filter(s => s.status === client_1.SubscriptionStatus.ACTIVE && s.plan.name === client_1.PlanType.TRIAL).length;
        const activePaid = subscriptions.filter(s => s.status === client_1.SubscriptionStatus.ACTIVE && s.plan.name !== client_1.PlanType.TRIAL).length;
        const expired = subscriptions.filter(s => s.status === client_1.SubscriptionStatus.EXPIRED).length;
        const grace = subscriptions.filter(s => s.status === client_1.SubscriptionStatus.PAST_DUE || s.status === 'GRACE_PERIOD').length;
        const payments = await this.prisma.subscriptionPayment.findMany({
            where: { status: client_1.SaaSPaymentStatus.SUCCESS },
            include: { tenant: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
        const allSuccessfulPayments = await this.prisma.subscriptionPayment.findMany({
            where: { status: client_1.SaaSPaymentStatus.SUCCESS },
            select: { amount: true },
        });
        const totalRevenue = allSuccessfulPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        const planDistribution = subscriptions.reduce((acc, sub) => {
            acc[sub.plan.name] = (acc[sub.plan.name] || 0) + 1;
            return acc;
        }, {});
        return {
            totalSchools,
            activeTrials,
            activePaid,
            expired,
            grace,
            totalRevenue,
            planDistribution,
            recentPayments: payments.map(p => ({
                id: p.id,
                schoolName: p.tenant.name,
                amount: p.amount,
                gateway: p.gateway,
                paidAt: p.paidAt,
                transactionId: p.transactionId,
            })),
        };
    }
    async listPlans() {
        return this.prisma.subscriptionPlan.findMany({
            orderBy: { price: 'asc' },
        });
    }
    async createPlan(body) {
        return this.prisma.subscriptionPlan.create({
            data: {
                name: body.name,
                price: body.price,
                features: body.features || [],
                isActive: body.isActive !== undefined ? body.isActive : true,
            },
        });
    }
    async updatePlan(id, body) {
        const updateData = {};
        if (body.price !== undefined)
            updateData.price = body.price;
        if (body.features !== undefined)
            updateData.features = body.features;
        if (body.isActive !== undefined)
            updateData.isActive = body.isActive;
        return this.prisma.subscriptionPlan.update({
            where: { id },
            data: updateData,
        });
    }
    async getSettings() {
        let settings = await this.prisma.platformSettings.findFirst();
        if (!settings) {
            settings = await this.prisma.platformSettings.create({ data: {} });
        }
        return settings;
    }
    async updateSettings(body) {
        let settings = await this.prisma.platformSettings.findFirst();
        if (settings) {
            return this.prisma.platformSettings.update({
                where: { id: settings.id },
                data: body,
            });
        }
        else {
            return this.prisma.platformSettings.create({ data: body });
        }
    }
    async getGateways() {
        const gateways = await this.prisma.paymentGatewayConfig.findMany();
        return gateways.map(g => ({
            ...g,
            apiKey: g.apiKey ? '********' : null,
            apiSecret: g.apiSecret ? '********' : null,
            webhookSecret: g.webhookSecret ? '********' : null,
        }));
    }
    async updateGateway(name, body) {
        const secretKey = process.env.ENCRYPTION_KEY || 'default_secret_key_needs_to_be_32_bytes!';
        const updateData = {
            isActive: body.isActive,
        };
        if (body.apiKey && body.apiKey !== '********') {
            updateData.apiKey = (0, encryption_util_1.encrypt)(body.apiKey, secretKey);
        }
        if (body.apiSecret && body.apiSecret !== '********') {
            updateData.apiSecret = (0, encryption_util_1.encrypt)(body.apiSecret, secretKey);
        }
        if (body.webhookSecret && body.webhookSecret !== '********') {
            updateData.webhookSecret = (0, encryption_util_1.encrypt)(body.webhookSecret, secretKey);
        }
        return this.prisma.paymentGatewayConfig.upsert({
            where: { gatewayName: name.toUpperCase() },
            create: {
                gatewayName: name.toUpperCase(),
                ...updateData,
            },
            update: updateData,
        });
    }
    async getPendingPayments() {
        return this.prisma.subscriptionPayment.findMany({
            where: { status: client_1.SaaSPaymentStatus.PENDING },
            include: {
                tenant: { select: { id: true, name: true, subDomain: true, email: true } },
                invoice: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async approvePayment(paymentId, remarks) {
        const payment = await this.prisma.subscriptionPayment.findUnique({
            where: { id: paymentId },
            include: { tenant: true },
        });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        const tenantId = payment.tenantId;
        const billingMonths = payment.billingDurationMonths || 12;
        const plan = await this.prisma.subscriptionPlan.findUnique({
            where: { name: (payment.planId || 'BASIC') },
        });
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        const currentSub = await this.prisma.tenantSubscription.findUnique({
            where: { tenantId },
        });
        let baseDate = new Date();
        if (currentSub && new Date(currentSub.expiryDate) > new Date()) {
            baseDate = new Date(currentSub.expiryDate);
        }
        const newExpiry = new Date(baseDate);
        newExpiry.setMonth(newExpiry.getMonth() + billingMonths);
        const invoiceNumber = 'INV-' + Date.now().toString().slice(-8) + '-' + Math.floor(Math.random() * 100);
        const gstAmount = Math.round(Number(payment.amount) * 0.18 * 100) / 100;
        const invoice = await this.prisma.subscriptionInvoice.create({
            data: {
                invoiceNumber,
                tenantId,
                planId: plan.name,
                amount: payment.amount,
                gst: gstAmount,
                currency: 'INR',
                status: client_1.SaaSInvoiceStatus.PAID,
                paymentDate: new Date(),
                pdfUrl: `/billing/invoices/subscription/${invoiceNumber}.pdf`,
                snapshotData: {
                    paymentId: payment.transactionId,
                    gatewayRef: payment.gatewayReference,
                    billingMonths,
                    approvedAt: new Date().toISOString(),
                    remarks,
                },
            },
        });
        await this.prisma.subscriptionPayment.update({
            where: { id: paymentId },
            data: {
                status: client_1.SaaSPaymentStatus.SUCCESS,
                invoiceId: invoice.id,
                paidAt: new Date(),
            },
        });
        if (currentSub) {
            await this.prisma.tenantSubscription.update({
                where: { tenantId },
                data: {
                    planId: plan.id,
                    expiryDate: newExpiry,
                    status: client_1.SubscriptionStatus.ACTIVE,
                    updatedAt: new Date(),
                },
            });
        }
        await this.prisma.notification.create({
            data: {
                tenantId,
                title: 'Subscription Activated!',
                message: `Your subscription renewal has been approved and activated. New expiry: ${newExpiry.toLocaleDateString()}. Invoice: ${invoiceNumber}`,
                type: 'SUBSCRIPTION',
            },
        }).catch(() => { });
        return {
            success: true,
            invoiceNumber,
            newExpiry,
            message: 'Subscription approved and activated successfully.',
        };
    }
    async rejectPayment(paymentId, reason) {
        const payment = await this.prisma.subscriptionPayment.findUnique({
            where: { id: paymentId },
            include: { tenant: true },
        });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        await this.prisma.subscriptionPayment.update({
            where: { id: paymentId },
            data: {
                status: client_1.SaaSPaymentStatus.FAILED,
                failureReason: reason || 'Rejected by Super Admin',
            },
        });
        await this.prisma.notification.create({
            data: {
                tenantId: payment.tenantId,
                title: 'Subscription Request Rejected',
                message: `Your subscription renewal request has been rejected. Reason: ${reason || 'Not specified'}. Please contact support for assistance.`,
                type: 'SUBSCRIPTION',
            },
        }).catch(() => { });
        return { success: true, message: 'Payment rejected and tenant notified.' };
    }
};
exports.SuperAdminController = SuperAdminController;
__decorate([
    (0, common_1.Get)('tenants'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "listTenants", null);
__decorate([
    (0, common_1.Post)('tenants/:id/subscription'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('planName')),
    __param(2, (0, common_1.Body)('expiryDate')),
    __param(3, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "updateSubscription", null);
__decorate([
    (0, common_1.Get)('billing/payments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "listPayments", null);
__decorate([
    (0, common_1.Post)('billing/invoices/generate'),
    __param(0, (0, common_1.Body)('tenantId')),
    __param(1, (0, common_1.Body)('planName')),
    __param(2, (0, common_1.Body)('amount')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "generateInvoice", null);
__decorate([
    (0, common_1.Get)('dashboard/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('plans'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "listPlans", null);
__decorate([
    (0, common_1.Post)('plans'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "createPlan", null);
__decorate([
    (0, common_1.Put)('plans/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "updatePlan", null);
__decorate([
    (0, common_1.Get)('settings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Put)('settings'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "updateSettings", null);
__decorate([
    (0, common_1.Get)('gateways'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getGateways", null);
__decorate([
    (0, common_1.Put)('gateways/:name'),
    __param(0, (0, common_1.Param)('name')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "updateGateway", null);
__decorate([
    (0, common_1.Get)('pending-payments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "getPendingPayments", null);
__decorate([
    (0, common_1.Post)('payments/:paymentId/approve'),
    __param(0, (0, common_1.Param)('paymentId')),
    __param(1, (0, common_1.Body)('remarks')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "approvePayment", null);
__decorate([
    (0, common_1.Post)('payments/:paymentId/reject'),
    __param(0, (0, common_1.Param)('paymentId')),
    __param(1, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SuperAdminController.prototype, "rejectPayment", null);
exports.SuperAdminController = SuperAdminController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    (0, common_1.Controller)('super-admin'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SuperAdminController);
//# sourceMappingURL=super-admin.controller.js.map