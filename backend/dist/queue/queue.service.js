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
var QueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const cloud_storage_service_1 = require("../common/services/cloud-storage.service");
const aws_ses_service_1 = require("../common/services/aws-ses.service");
const invoice_pdf_service_1 = require("../saas-billing/invoice-pdf.service");
const prisma_service_1 = require("../prisma.service");
let QueueService = QueueService_1 = class QueueService {
    constructor(prisma, storageService, emailService, invoicePdfService) {
        this.prisma = prisma;
        this.storageService = storageService;
        this.emailService = emailService;
        this.invoicePdfService = invoicePdfService;
        this.logger = new common_1.Logger(QueueService_1.name);
    }
    async enqueueInvoiceJobs(invoiceId, recipientEmail) {
        this.logger.log(`[Queue] Processing background invoice job for invoice '${invoiceId}'...`);
        setImmediate(async () => {
            try {
                const invoice = await this.prisma.subscriptionInvoice.findUnique({
                    where: { id: invoiceId },
                });
                if (!invoice)
                    return;
                const pdfBuffer = await this.invoicePdfService.generateInvoicePdfBuffer(invoice);
                const filename = `${invoice.invoiceNumber}.pdf`;
                const downloadUrl = await this.storageService.uploadFile(filename, pdfBuffer, 'application/pdf');
                await this.prisma.subscriptionInvoice.update({
                    where: { id: invoiceId },
                    data: { downloadUrl, pdfUrl: downloadUrl },
                });
                if (recipientEmail) {
                    await this.emailService.sendEmail({
                        to: recipientEmail,
                        subject: `Invoice ${invoice.invoiceNumber} - EduTrack Subscription`,
                        html: `
              <h2>Thank you for your payment!</h2>
              <p>Your subscription invoice <strong>${invoice.invoiceNumber}</strong> has been generated.</p>
              <p>Total Paid: <strong>INR ${Number(invoice.amount).toFixed(2)}</strong></p>
              <p>You can download your PDF invoice here: <a href="${downloadUrl}">Download Invoice</a></p>
            `,
                    });
                }
            }
            catch (err) {
                this.logger.error(`Background job execution failed for invoice '${invoiceId}': ${err.message}`);
            }
        });
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = QueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloud_storage_service_1.CloudStorageService,
        aws_ses_service_1.AwsSesService,
        invoice_pdf_service_1.InvoicePdfService])
], QueueService);
//# sourceMappingURL=queue.service.js.map