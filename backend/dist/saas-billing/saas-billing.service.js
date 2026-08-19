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
exports.SaaSBillingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const client_1 = require("@prisma/client");
let SaaSBillingService = class SaaSBillingService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPaymentSettings() {
        let settings = await this.prisma.paymentSettings.findFirst();
        if (!settings) {
            settings = await this.prisma.paymentSettings.create({
                data: {
                    companyName: 'EduTrack Inc.',
                    supportEmail: 'support@edutrack.com',
                    supportPhone: '+91 9876543210',
                    gstPercentage: 18.0,
                    invoicePrefix: 'INV-SUB-',
                    invoiceNumberFormat: 'INV-{YYYY}-{MM}-{NUMBER}',
                    defaultCurrency: 'INR',
                    timeZone: 'Asia/Kolkata',
                },
            });
        }
        return settings;
    }
    async calculateInvoiceTotal(amountCents, discountCents = 0) {
        const settings = await this.getPaymentSettings();
        const gstRate = Number(settings.gstPercentage) / 100;
        const taxableAmountCents = Math.max(0, amountCents - discountCents);
        const taxCents = Math.round(taxableAmountCents * gstRate);
        const totalCents = taxableAmountCents + taxCents;
        return {
            subtotalCents: amountCents,
            discountCents,
            taxableAmountCents,
            taxCents,
            gstPercentage: Number(settings.gstPercentage),
            totalCents,
            currency: settings.defaultCurrency,
        };
    }
    async createInvoice(tenantId, planId, amountCents, discountCents = 0) {
        const settings = await this.getPaymentSettings();
        const calculation = await this.calculateInvoiceTotal(amountCents, discountCents);
        const dateStr = new Date().toISOString().slice(0, 7).replace('-', '');
        const randomSeq = Math.floor(1000 + Math.random() * 9000);
        const invoiceNumber = `${settings.invoicePrefix}${dateStr}-${randomSeq}`;
        const snapshotData = {
            companyName: settings.companyName,
            companyLogoUrl: settings.companyLogoUrl,
            address: settings.address,
            website: settings.website,
            supportEmail: settings.supportEmail,
            supportPhone: settings.supportPhone,
            gstNumber: settings.gstNumber,
            panNumber: settings.panNumber,
            gstPercentage: settings.gstPercentage,
            bankName: settings.bankName,
            accountName: settings.accountName,
            accountNumber: settings.accountNumber,
            ifscCode: settings.ifscCode,
            branchName: settings.branchName,
            upiId: settings.upiId,
            footer: settings.footer,
            termsAndConditions: settings.termsAndConditions,
            calculation,
        };
        const invoice = await this.prisma.subscriptionInvoice.create({
            data: {
                invoiceNumber,
                tenantId,
                planId,
                amount: calculation.totalCents / 100,
                gst: calculation.taxCents / 100,
                currency: calculation.currency,
                status: client_1.SaaSInvoiceStatus.GENERATED,
                snapshotData,
                downloadUrl: `/api/v1/billing/invoices/${invoiceNumber}/pdf`,
            },
        });
        const billing = await this.prisma.subscriptionBilling.create({
            data: {
                subscriptionId: tenantId,
                invoiceId: invoice.id,
                amountCents: calculation.subtotalCents,
                taxCents: calculation.taxCents,
                discountCents: calculation.discountCents,
            },
        });
        return { invoice, billing, calculation };
    }
    async processRefundHook(paymentId, refundAmountCents, reason) {
        const payment = await this.prisma.subscriptionPayment.findUnique({
            where: { id: paymentId },
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment '${paymentId}' not found.`);
        }
        return this.prisma.subscriptionPayment.update({
            where: { id: paymentId },
            data: {
                status: 'REFUNDED',
                failureReason: `Refund processed: ${reason} (Amount: ${refundAmountCents / 100})`,
            },
        });
    }
};
exports.SaaSBillingService = SaaSBillingService;
exports.SaaSBillingService = SaaSBillingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SaaSBillingService);
//# sourceMappingURL=saas-billing.service.js.map