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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var TenantsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const crypto = __importStar(require("crypto"));
const payment_service_1 = require("../common/services/payment.service");
const pdf_util_1 = require("../common/utils/pdf.util");
const path = __importStar(require("path"));
const razorpay_1 = __importDefault(require("razorpay"));
const encryption_util_1 = require("../common/utils/encryption.util");
const subscription_service_1 = require("../subscription/subscription.service");
const saas_billing_service_1 = require("../saas-billing/saas-billing.service");
let TenantsService = TenantsService_1 = class TenantsService {
    constructor(prisma, paymentService, subscriptionService, billingService) {
        this.prisma = prisma;
        this.paymentService = paymentService;
        this.subscriptionService = subscriptionService;
        this.billingService = billingService;
        this.logger = new common_1.Logger(TenantsService_1.name);
        this.subdomainCache = new Map();
    }
    async findBySubdomain(subDomain) {
        const nowTime = Date.now();
        const cached = this.subdomainCache.get(subDomain);
        if (cached && cached.expiresAt > nowTime) {
            return cached.tenant;
        }
        const tenant = await this.prisma.tenant.findUnique({
            where: { subDomain },
        });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with subdomain '${subDomain}' not found`);
        }
        this.subdomainCache.set(subDomain, {
            tenant,
            expiresAt: nowTime + 5 * 60 * 1000,
        });
        return tenant;
    }
    async findById(id) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id },
        });
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID '${id}' not found`);
        }
        return tenant;
    }
    async create(name, subDomain) {
        const existing = await this.prisma.tenant.findUnique({
            where: { subDomain },
        });
        if (existing) {
            throw new common_1.ConflictException(`Subdomain '${subDomain}' is already registered`);
        }
        return this.prisma.tenant.create({
            data: {
                name,
                subDomain,
            },
        });
    }
    async findAll() {
        return this.prisma.tenant.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async update(id, data) {
        return this.prisma.tenant.update({
            where: { id },
            data,
        });
    }
    async registerTenant(data) {
        const normalizedPhone = data.mobileNumber.replace(/\D/g, '').slice(-10);
        const existingUser = await this.prisma.user.findFirst({
            where: {
                phone: {
                    endsWith: normalizedPhone,
                },
            },
        });
        if (existingUser) {
            throw new common_1.ConflictException('A user with this mobile number is already registered. Please log in instead.');
        }
        const slug = data.schoolName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        let subDomain = slug;
        let exists = await this.prisma.tenant.findUnique({ where: { subDomain } });
        let counter = 1;
        while (exists) {
            subDomain = `${slug}-${counter}`;
            exists = await this.prisma.tenant.findUnique({ where: { subDomain } });
            counter++;
        }
        return this.prisma.$transaction(async (tx) => {
            const selectedPlanName = data.subscriptionPlan ? data.subscriptionPlan.toUpperCase() : 'TRIAL';
            const plan = await tx.subscriptionPlan.findUnique({
                where: { name: selectedPlanName }
            });
            if (!plan) {
                throw new common_1.NotFoundException(`Subscription plan '${selectedPlanName}' not found`);
            }
            const tenant = await tx.tenant.create({
                data: {
                    name: data.schoolName,
                    subDomain,
                    address: data.address,
                    email: data.email,
                    phone: normalizedPhone,
                    setupCompleted: false,
                },
            });
            const schoolSetup = await tx.schoolSetup.create({
                data: {
                    tenantId: tenant.id,
                    schoolName: data.schoolName,
                    schoolType: data.schoolType,
                    adminName: data.adminName,
                    mobileNumber: normalizedPhone,
                    email: data.email,
                    address: data.address,
                    academicYear: data.academicYear,
                },
            });
            const currentYear = new Date().getFullYear();
            const startDate = new Date(`${currentYear}-06-01`);
            const endDate = new Date(`${currentYear + 1}-05-31`);
            const academicYear = await tx.academicYear.create({
                data: {
                    name: data.academicYear,
                    startDate,
                    endDate,
                    isActive: true,
                    tenantId: tenant.id,
                },
            });
            const randomPassword = Math.random().toString(36).slice(-10) + '!A1';
            const passwordHash = await bcrypt.hash(randomPassword, 10);
            const user = await tx.user.create({
                data: {
                    name: data.adminName,
                    email: data.email,
                    phone: normalizedPhone,
                    passwordHash,
                    role: 'SCHOOL_ADMIN',
                    tenantId: tenant.id,
                },
            });
            await tx.staffProfile.create({
                data: {
                    userId: user.id,
                    designation: 'Principal',
                    status: 'Active',
                    tenantId: tenant.id,
                },
            });
            const expiryDate = new Date();
            if (plan.name === client_1.PlanType.TRIAL) {
                expiryDate.setMonth(expiryDate.getMonth() + 6);
            }
            else {
                expiryDate.setMonth(expiryDate.getMonth() + 1);
            }
            await tx.tenantSubscription.create({
                data: {
                    tenantId: tenant.id,
                    planId: plan.id,
                    expiryDate: expiryDate,
                    status: client_1.SubscriptionStatus.ACTIVE,
                }
            });
            await tx.subscriptionHistory.create({
                data: {
                    tenantId: tenant.id,
                    previousPlan: null,
                    newPlan: plan.name,
                    amount: plan.price,
                    paymentMethod: 'SYSTEM_ONBOARD',
                    transactionReference: 'ONBOARD_REGISTRATION',
                    startDate: new Date(),
                    expiryDate: expiryDate,
                    status: client_1.SubscriptionStatus.ACTIVE,
                }
            });
            return {
                tenant,
                schoolSetup,
                academicYear,
                user,
            };
        }, { timeout: 30000 });
    }
    async getSubscriptionStatus(tenantId) {
        const subscription = await this.prisma.tenantSubscription.findUnique({
            where: { tenantId },
            include: { plan: true },
        });
        if (!subscription) {
            throw new common_1.NotFoundException('Subscription not found for this tenant');
        }
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });
        const setup = await this.prisma.schoolSetup.findUnique({
            where: { tenantId },
        });
        const now = new Date();
        const expiry = new Date(subscription.expiryDate);
        const diffTime = expiry.getTime() - now.getTime();
        const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const studentUsage = await this.prisma.studentProfile.count({ where: { tenantId } });
        const teacherUsage = await this.prisma.staffProfile.count({
            where: {
                tenantId,
                user: { role: { in: ['TEACHER', 'STAFF'] } }
            }
        });
        const parentUsage = await this.prisma.parentProfile.count({
            where: {
                user: { tenantId }
            }
        });
        const invoices = await this.prisma.subscriptionInvoice.findMany({
            where: { tenantId },
            orderBy: { createdDate: 'desc' }
        });
        const payments = await this.prisma.subscriptionPayment.findMany({
            where: { tenantId },
            include: { invoice: true },
            orderBy: { createdAt: 'desc' }
        });
        return {
            plan: subscription.plan.name,
            status: subscription.status,
            expiryDate: subscription.expiryDate,
            remainingDays,
            studentUsage,
            teacherUsage,
            parentUsage,
            features: subscription.plan.features,
            invoices,
            payments,
            schoolName: setup?.schoolName || tenant?.name || 'School Admin',
            email: setup?.email || tenant?.email || '',
            phone: setup?.mobileNumber || tenant?.phone || '',
            address: setup?.address || tenant?.address || '',
        };
    }
    async createRazorpayOrder(tenantId, planName, billingMonths, clientBaseAmountRs, couponCode) {
        const isTestMode = process.env.RAZORPAY_TEST_MODE !== 'false';
        let baseAmountRs = 11999;
        if (isTestMode) {
            baseAmountRs = Number(billingMonths) === 6 ? 1 : 2;
        }
        else {
            baseAmountRs = Number(billingMonths) === 6 ? 5999 : 11999;
        }
        const amountPaise = Math.round(baseAmountRs * 100);
        let keyId = process.env.RAZORPAY_KEY_ID;
        let keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keyId || !keySecret) {
            const secretKey = process.env.ENCRYPTION_KEY || 'default_secret_key_needs_to_be_32_bytes!';
            const config = await this.prisma.paymentGatewayConfig.findUnique({
                where: { gatewayName: 'RAZORPAY' },
            });
            if (config && config.isActive && config.apiKey && config.apiSecret) {
                keyId = keyId || (0, encryption_util_1.decrypt)(config.apiKey, secretKey);
                keySecret = keySecret || (0, encryption_util_1.decrypt)(config.apiSecret, secretKey);
            }
        }
        if (!keyId || !keySecret || keyId === 'rzp_test_placeholder') {
            this.logger.warn('Razorpay API Key or Secret missing on server.');
            throw new common_1.BadRequestException('Razorpay API credentials not configured on server.');
        }
        const receipt = `RCPT_${Date.now()}`;
        const instance = new razorpay_1.default({ key_id: keyId, key_secret: keySecret });
        const order = await instance.orders.create({
            amount: amountPaise,
            currency: 'INR',
            receipt,
            notes: {
                tenantId,
                planName,
                billingMonths,
                isTestMode: String(isTestMode),
            },
        });
        const orderId = order.id;
        const txRef = 'TXN-' + Date.now();
        await this.prisma.subscriptionPayment.create({
            data: {
                tenantId,
                amount: baseAmountRs,
                amountCents: amountPaise,
                transactionId: txRef,
                gateway: 'RAZORPAY',
                method: 'RAZORPAY',
                gatewayReference: orderId,
                billingDurationMonths: Number(billingMonths),
                planId: planName,
                status: client_1.SaaSPaymentStatus.PENDING,
                gatewayResponse: { orderId, amountPaise, couponCode: couponCode || null, isTestMode },
            },
        });
        return {
            orderId,
            amount: amountPaise,
            currency: 'INR',
            key_id: keyId,
            txRef,
        };
    }
    async verifyAndRecordPayment(tenantId, razorpayOrderId, razorpayPaymentId, razorpaySignature, planName, billingMonths, clientFinalAmountRs, couponCode) {
        let keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keySecret) {
            const secretKey = process.env.ENCRYPTION_KEY || 'default_secret_key_needs_to_be_32_bytes!';
            const config = await this.prisma.paymentGatewayConfig.findUnique({
                where: { gatewayName: 'RAZORPAY' },
            });
            if (config && config.isActive && config.apiSecret) {
                keySecret = (0, encryption_util_1.decrypt)(config.apiSecret, secretKey);
            }
        }
        if (!keySecret) {
            throw new common_1.BadRequestException('Razorpay API Secret is not configured on server.');
        }
        const pending = await this.prisma.subscriptionPayment.findFirst({
            where: { gatewayReference: razorpayOrderId, tenantId },
        });
        if (!pending) {
            throw new common_1.NotFoundException(`No pending order found for order ID '${razorpayOrderId}'.`);
        }
        if (pending.status === client_1.SaaSPaymentStatus.SUCCESS) {
            this.logger.log(`Idempotency Hit: Order '${razorpayOrderId}' already verified and active.`);
            return {
                success: true,
                idempotent: true,
                transactionId: pending.transactionId,
                message: 'Payment already processed and subscription activated.',
            };
        }
        const expectedSignature = crypto
            .createHmac('sha256', keySecret)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest('hex');
        const sigBuffer = Buffer.from(razorpaySignature || '', 'utf-8');
        const expBuffer = Buffer.from(expectedSignature, 'utf-8');
        let signatureVerified = false;
        if (sigBuffer.length === expBuffer.length && sigBuffer.length > 0) {
            signatureVerified = crypto.timingSafeEqual(sigBuffer, expBuffer);
        }
        if (!signatureVerified) {
            this.logger.error(`Signature verification failed for order '${razorpayOrderId}' / payment '${razorpayPaymentId}'.`);
            await this.prisma.subscriptionPayment.update({
                where: { id: pending.id },
                data: {
                    status: client_1.SaaSPaymentStatus.FAILED,
                    failureReason: 'HMAC Signature Verification Failed',
                },
            });
            throw new common_1.BadRequestException('Payment signature verification failed. Subscription not activated.');
        }
        const txId = razorpayPaymentId;
        await this.prisma.subscriptionPayment.update({
            where: { id: pending.id },
            data: {
                status: client_1.SaaSPaymentStatus.SUCCESS,
                transactionId: txId,
                signatureVerified: true,
                paidAt: new Date(),
                gatewayResponse: {
                    orderId: razorpayOrderId,
                    paymentId: razorpayPaymentId,
                    signature: razorpaySignature,
                    couponCode: couponCode || null,
                },
            },
        });
        const plan = await this.prisma.subscriptionPlan.findFirst({
            where: { name: planName || client_1.PlanType.BASIC },
        });
        const targetPlanId = plan ? plan.id : planName;
        const durationMonths = Number(billingMonths) || pending.billingDurationMonths || 12;
        await this.subscriptionService.activateOrRenew(tenantId, targetPlanId, durationMonths);
        const amountPaise = pending.amountCents || Math.round(Number(pending.amount) * 100);
        try {
            await this.billingService.createInvoice(tenantId, targetPlanId, amountPaise);
        }
        catch (err) {
            this.logger.warn(`Invoice generation failed for payment '${txId}': ${err.message}`);
        }
        await this.prisma.notification.create({
            data: {
                tenantId,
                title: 'Subscription Payment Successful',
                message: `Your payment of ₹${pending.amount} (${durationMonths} Months) has been verified and your subscription is now ACTIVE.`,
                type: 'SUBSCRIPTION',
            },
        }).catch(() => { });
        this.logger.log(`Payment '${txId}' verified & subscription activated for tenant '${tenantId}' (${durationMonths} months).`);
        return {
            success: true,
            processed: true,
            transactionId: txId,
            message: 'Your payment was verified successfully and your subscription is now ACTIVE!',
        };
    }
    async upgradeOrRenewSubscription(tenantId, planName, paymentDetails, userId) {
        const plan = await this.prisma.subscriptionPlan.findUnique({
            where: { name: planName },
        });
        if (!plan) {
            throw new common_1.NotFoundException(`Plan ${planName} not found`);
        }
        const currentSub = await this.prisma.tenantSubscription.findUnique({
            where: { tenantId },
            include: { plan: true },
        });
        let baseDate = new Date();
        if (currentSub && new Date(currentSub.expiryDate) > new Date()) {
            baseDate = new Date(currentSub.expiryDate);
        }
        const newExpiry = new Date(baseDate);
        const isYearly = paymentDetails?.billingPeriod === 'YEARLY';
        const monthsToExtend = isYearly ? 12 : 1;
        if (plan.name === client_1.PlanType.TRIAL) {
            newExpiry.setMonth(newExpiry.getMonth() + 6);
        }
        else {
            newExpiry.setMonth(newExpiry.getMonth() + monthsToExtend);
        }
        let baseAmount = Number(plan.price);
        if (isYearly && plan.name !== client_1.PlanType.TRIAL) {
            baseAmount = Number(plan.price) * 10;
        }
        const paymentGateway = paymentDetails?.gateway || 'STRIPE';
        const paymentResponse = await this.paymentService.processCheckout(paymentGateway, tenantId, baseAmount, paymentDetails);
        return this.prisma.$transaction(async (tx) => {
            const updatedSub = await tx.tenantSubscription.update({
                where: { tenantId },
                data: {
                    planId: plan.id,
                    expiryDate: newExpiry,
                    status: client_1.SubscriptionStatus.ACTIVE,
                },
                include: { plan: true },
            });
            await tx.subscriptionHistory.create({
                data: {
                    tenantId,
                    previousPlan: currentSub ? currentSub.plan.name : null,
                    newPlan: plan.name,
                    amount: baseAmount,
                    paymentMethod: paymentResponse.gateway,
                    transactionReference: paymentResponse.transactionId,
                    startDate: new Date(),
                    expiryDate: newExpiry,
                    status: client_1.SubscriptionStatus.ACTIVE,
                },
            });
            const invoiceNumber = 'INV-SUB-' + Date.now().toString().slice(-6) + '-' + Math.floor(Math.random() * 1000);
            const pdfFilePath = path.join(process.cwd(), 'public', 'invoices', `${invoiceNumber}.pdf`);
            const invoiceData = {
                invoiceNumber,
                tenantId,
                planId: plan.name,
                amount: baseAmount,
                gst: Number(baseAmount) * 0.18,
                currency: 'INR',
                status: 'PAID',
                createdDate: new Date(),
            };
            await (0, pdf_util_1.generateInvoicePDF)(invoiceData, pdfFilePath);
            const invoice = await tx.subscriptionInvoice.create({
                data: {
                    invoiceNumber,
                    tenantId,
                    planId: plan.name,
                    amount: baseAmount,
                    gst: Number(baseAmount) * 0.18,
                    currency: 'INR',
                    status: 'PAID',
                    paymentDate: new Date(),
                    pdfUrl: `/invoices/${invoiceNumber}.pdf`,
                },
            });
            await tx.subscriptionPayment.create({
                data: {
                    tenantId,
                    invoiceId: invoice.id,
                    amount: baseAmount,
                    transactionId: paymentResponse.transactionId,
                    gateway: paymentResponse.gateway,
                    status: 'SUCCESS',
                    paidAt: new Date(),
                },
            });
            return updatedSub;
        });
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = TenantsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        payment_service_1.PaymentService,
        subscription_service_1.SubscriptionService,
        saas_billing_service_1.SaaSBillingService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map