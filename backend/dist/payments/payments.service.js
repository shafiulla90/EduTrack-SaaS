"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const subscription_service_1 = require("../subscription/subscription.service");
const saas_billing_service_1 = require("../saas-billing/saas-billing.service");
const client_1 = require("@prisma/client");
const crypto = __importStar(require("crypto"));
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(prisma, subscriptionService, billingService) {
        this.prisma = prisma;
        this.subscriptionService = subscriptionService;
        this.billingService = billingService;
        this.logger = new common_1.Logger(PaymentsService_1.name);
    }
    verifySignature(payloadText, signature, secret) {
        if (!signature || !secret)
            return false;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(payloadText)
            .digest('hex');
        return expectedSignature === signature;
    }
    async processRazorpayWebhook(rawBody, payload, signature) {
        const eventId = payload?.event_id || payload?.id || `evt_${Date.now()}`;
        const paymentEntity = payload?.payload?.payment?.entity || payload;
        const gatewayReference = paymentEntity?.id || payload?.payment_id || `pay_${Date.now()}`;
        const existingPayment = await this.prisma.subscriptionPayment.findFirst({
            where: {
                OR: [
                    { eventId },
                    { gatewayReference },
                ],
            },
        });
        if (existingPayment && existingPayment.status === client_1.SaaSPaymentStatus.SUCCESS) {
            this.logger.log(`Idempotency Hit: Razorpay Event '${eventId}' / Payment '${gatewayReference}' already processed.`);
            return { success: true, idempotent: true, message: 'Event already processed' };
        }
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'edutrack_webhook_secret_dev';
        const isVerified = this.verifySignature(rawBody, signature, webhookSecret);
        if (!isVerified && process.env.NODE_ENV === 'production') {
            this.logger.error(`Signature verification failed for event '${eventId}'.`);
            throw new common_1.BadRequestException('Invalid Razorpay signature');
        }
        const tenantId = paymentEntity?.notes?.tenantId || payload?.tenantId;
        const planId = paymentEntity?.notes?.planId || payload?.planId;
        const amountCents = paymentEntity?.amount || (payload?.amount ? payload.amount * 100 : 0);
        if (!tenantId) {
            this.logger.warn(`TenantId missing in webhook payload for event '${eventId}'.`);
            return { success: false, message: 'Missing tenantId in payload' };
        }
        const payment = await this.prisma.subscriptionPayment.upsert({
            where: { transactionId: gatewayReference },
            create: {
                tenantId,
                gateway: 'RAZORPAY',
                gatewayReference,
                eventId,
                amountCents,
                amount: amountCents / 100,
                transactionId: gatewayReference,
                status: client_1.SaaSPaymentStatus.SUCCESS,
                signatureVerified: isVerified,
                gatewayResponse: payload,
                paidAt: new Date(),
            },
            update: {
                status: client_1.SaaSPaymentStatus.SUCCESS,
                signatureVerified: isVerified,
                gatewayResponse: payload,
                paidAt: new Date(),
            },
        });
        if (planId) {
            await this.subscriptionService.activateOrRenew(tenantId, planId, 12);
        }
        await this.billingService.createInvoice(tenantId, planId, amountCents);
        this.logger.log(`Payment '${gatewayReference}' processed successfully for tenant '${tenantId}'.`);
        return {
            success: true,
            processed: true,
            paymentId: payment.id,
        };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        subscription_service_1.SubscriptionService,
        saas_billing_service_1.SaaSBillingService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map