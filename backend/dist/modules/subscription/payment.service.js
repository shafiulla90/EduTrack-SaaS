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
var PaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const razorpay_1 = require("razorpay");
const crypto = require("crypto");
let PaymentService = PaymentService_1 = class PaymentService {
    constructor(subRepo, adminRepo, tenantRepo) {
        this.subRepo = subRepo;
        this.adminRepo = adminRepo;
        this.tenantRepo = tenantRepo;
        this.logger = new common_1.Logger(PaymentService_1.name);
    }
    async getRazorpayInstance() {
        const configs = await this.adminRepo.getGatewayConfigs();
        const config = configs.find((c) => c.gatewayName === 'RAZORPAY');
        const { decrypt } = require('../../common/utils/crypto.util');
        if (!config || !config.isActive) {
            throw new common_1.BadRequestException('Razorpay is not configured or not active');
        }
        const key_id = decrypt(config.keyId);
        const key_secret = decrypt(config.keySecret);
        if (!key_id || !key_secret) {
            throw new common_1.InternalServerErrorException('Razorpay credentials could not be decrypted');
        }
        return new razorpay_1.default({
            key_id,
            key_secret,
        });
    }
    async createOrder(tenantId, planId) {
        const plan = await this.subRepo.findPlanById(planId);
        if (!plan)
            throw new common_1.BadRequestException('Plan not found');
        const amount = Number(plan.price);
        const gst = amount * 0.18;
        const total = amount + gst;
        const rzp = await this.getRazorpayInstance();
        const orderOptions = {
            amount: Math.round(total * 100),
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`,
        };
        let rzpOrder;
        try {
            rzpOrder = await rzp.orders.create(orderOptions);
        }
        catch (e) {
            this.logger.error('Failed to create Razorpay order', e);
            throw new common_1.InternalServerErrorException('Payment gateway error');
        }
        const subscriptionOrder = await this.subRepo.createOrder({
            id: rzpOrder.id,
            tenantId,
            planId,
            amount,
            gst,
            total,
            gateway: 'RAZORPAY',
            status: 'PENDING',
        });
        return {
            orderId: rzpOrder.id,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            total,
            plan: plan.name,
        };
    }
    async verifyPaymentWebhook(signature, payload) {
        const configs = await this.adminRepo.getGatewayConfigs();
        const config = configs.find((c) => c.gatewayName === 'RAZORPAY');
        const { decrypt } = require('../../common/utils/crypto.util');
        const secret = decrypt(config?.webhookSecret || '');
        if (!secret)
            throw new common_1.BadRequestException('Webhook secret not found');
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(payload))
            .digest('hex');
        if (expectedSignature !== signature) {
            throw new common_1.BadRequestException('Invalid signature');
        }
        const event = payload.event;
        if (event === 'payment.captured') {
            const payment = payload.payload.payment.entity;
            await this.handleSuccessfulPayment(payment);
        }
        return { status: 'ok' };
    }
    async handleSuccessfulPayment(payment) {
        const orderId = payment.order_id;
        const order = await this.subRepo.findOrderById(orderId);
        if (!order || order.status === 'PAID')
            return;
        await this.subRepo.createPayment({
            orderId,
            transactionId: payment.id,
            paymentId: payment.id,
            gateway: 'RAZORPAY',
            amount: order.amount,
            gst: order.gst,
            webhookResponse: payment,
            paymentStatus: 'SUCCESS',
            paidDate: new Date(),
        });
        const plan = await this.subRepo.findPlanById(order.planId);
        const tenant = await this.tenantRepo.findById(order.tenantId);
        const startDate = new Date();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + (plan.duration || 6));
        await this.subRepo.createSubscription({
            tenantId: order.tenantId,
            planId: order.planId,
            startDate,
            expiryDate,
            status: 'ACTIVE',
            paymentReference: payment.id,
        });
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('ISubscriptionRepository')),
    __param(1, (0, common_1.Inject)('IPlatformAdminRepository')),
    __param(2, (0, common_1.Inject)('ITenantRepository')),
    __metadata("design:paramtypes", [Object, Object, Object])
], PaymentService);
//# sourceMappingURL=payment.service.js.map