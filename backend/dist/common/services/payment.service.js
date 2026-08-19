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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = exports.PayPalPaymentStrategy = exports.RazorpayPaymentStrategy = exports.StripePaymentStrategy = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const encryption_util_1 = require("../utils/encryption.util");
const razorpay_1 = __importDefault(require("razorpay"));
let StripePaymentStrategy = class StripePaymentStrategy {
    async processPayment(tenantId, amount, details) {
        console.log(`[Stripe] Processing payment for tenant ${tenantId} of amount ₹${amount}`);
        const txId = 'ch_stripe_' + Math.random().toString(36).substring(2, 10).toUpperCase();
        return {
            success: true,
            transactionId: txId,
            gateway: 'STRIPE',
            amount,
            message: 'Simulated Stripe checkout processed successfully.',
        };
    }
};
exports.StripePaymentStrategy = StripePaymentStrategy;
exports.StripePaymentStrategy = StripePaymentStrategy = __decorate([
    (0, common_1.Injectable)()
], StripePaymentStrategy);
let RazorpayPaymentStrategy = class RazorpayPaymentStrategy {
    async processPayment(tenantId, amount, details) {
        if (!details.apiKey || !details.apiSecret) {
            throw new common_1.BadRequestException('Razorpay credentials not configured');
        }
        const instance = new razorpay_1.default({
            key_id: details.apiKey,
            key_secret: details.apiSecret,
        });
        const receipt = `RCPT_${Date.now()}`;
        const orderOptions = {
            amount: Math.round(amount * 100),
            currency: "INR",
            receipt: receipt,
        };
        try {
            const order = await instance.orders.create(orderOptions);
            return {
                success: true,
                transactionId: order.id,
                gateway: 'RAZORPAY',
                amount,
                message: 'Order created successfully',
            };
        }
        catch (err) {
            return {
                success: false,
                transactionId: '',
                gateway: 'RAZORPAY',
                amount,
                message: err.message || 'Failed to create Razorpay order',
            };
        }
    }
};
exports.RazorpayPaymentStrategy = RazorpayPaymentStrategy;
exports.RazorpayPaymentStrategy = RazorpayPaymentStrategy = __decorate([
    (0, common_1.Injectable)()
], RazorpayPaymentStrategy);
let PayPalPaymentStrategy = class PayPalPaymentStrategy {
    async processPayment(tenantId, amount, details) {
        console.log(`[PayPal] Processing payment for tenant ${tenantId} of amount ₹${amount}`);
        const txId = 'PAYID-PPL-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        return {
            success: true,
            transactionId: txId,
            gateway: 'PAYPAL',
            amount,
            message: 'Simulated PayPal checkout processed successfully.',
        };
    }
};
exports.PayPalPaymentStrategy = PayPalPaymentStrategy;
exports.PayPalPaymentStrategy = PayPalPaymentStrategy = __decorate([
    (0, common_1.Injectable)()
], PayPalPaymentStrategy);
let PaymentService = class PaymentService {
    constructor(prisma) {
        this.prisma = prisma;
        this.strategies = {};
        this.strategies['STRIPE'] = new StripePaymentStrategy();
        this.strategies['RAZORPAY'] = new RazorpayPaymentStrategy();
        this.strategies['PAYPAL'] = new PayPalPaymentStrategy();
        this.strategies['SIMULATED'] = new StripePaymentStrategy();
    }
    async processCheckout(gateway, tenantId, amount, details) {
        const strategyKey = String(gateway).toUpperCase();
        const strategy = this.strategies[strategyKey];
        if (!strategy) {
            throw new common_1.BadRequestException(`Payment gateway strategy '${gateway}' is not supported.`);
        }
        if (strategyKey === 'RAZORPAY' || strategyKey === 'STRIPE') {
            const config = await this.prisma.paymentGatewayConfig.findUnique({
                where: { gatewayName: strategyKey }
            });
            if (!config || !config.isActive) {
                throw new common_1.BadRequestException(`Gateway ${strategyKey} is not configured or inactive.`);
            }
            const secretKey = process.env.ENCRYPTION_KEY || 'default_secret_key_needs_to_be_32_bytes!';
            details.apiKey = (0, encryption_util_1.decrypt)(config.apiKey, secretKey);
            details.apiSecret = (0, encryption_util_1.decrypt)(config.apiSecret, secretKey);
        }
        return strategy.processPayment(tenantId, amount, details);
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map