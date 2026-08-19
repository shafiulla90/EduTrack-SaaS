"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var InvoicePdfService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicePdfService = void 0;
const common_1 = require("@nestjs/common");
const pdfkit_1 = __importDefault(require("pdfkit"));
let InvoicePdfService = InvoicePdfService_1 = class InvoicePdfService {
    constructor() {
        this.logger = new common_1.Logger(InvoicePdfService_1.name);
    }
    async generateInvoicePdfBuffer(invoice) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new pdfkit_1.default({ margin: 40, size: 'A4' });
                const buffers = [];
                doc.on('data', (chunk) => buffers.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(buffers)));
                doc.on('error', (err) => reject(err));
                const snapshot = invoice.snapshotData || {};
                const companyName = snapshot.companyName || 'EduTrack Inc.';
                const gstNumber = snapshot.gstNumber || 'N/A';
                const calc = snapshot.calculation || {};
                doc.fontSize(22).fillColor('#1E293B').text(companyName, { align: 'left' });
                doc.fontSize(10).fillColor('#64748B').text(`GSTIN: ${gstNumber} | Email: ${snapshot.supportEmail || 'support@edutrack.com'}`);
                doc.moveDown(1.5);
                doc.moveTo(40, doc.y).lineTo(550, doc.y).strokeColor('#E2E8F0').stroke();
                doc.moveDown(1);
                doc.fontSize(16).fillColor('#0F172A').text('TAX INVOICE', { align: 'right' });
                doc.fontSize(10).fillColor('#475569');
                doc.text(`Invoice Number: ${invoice.invoiceNumber}`, { align: 'right' });
                doc.text(`Date: ${new Date(invoice.createdDate || Date.now()).toLocaleDateString()}`, { align: 'right' });
                doc.moveDown(1.5);
                doc.fontSize(12).fillColor('#0F172A').text('Description', 40, doc.y, { continued: true });
                doc.text('Amount', { align: 'right' });
                doc.moveDown(0.5);
                doc.fontSize(10).fillColor('#334155');
                doc.text('EduTrack SaaS Plan Subscription', 40, doc.y, { continued: true });
                doc.text(`INR ${(Number(invoice.amount) - Number(invoice.gst)).toFixed(2)}`, { align: 'right' });
                doc.moveDown(0.5);
                doc.text('GST (18%)', 40, doc.y, { continued: true });
                doc.text(`INR ${Number(invoice.gst).toFixed(2)}`, { align: 'right' });
                doc.moveDown(1);
                doc.moveTo(40, doc.y).lineTo(550, doc.y).strokeColor('#E2E8F0').stroke();
                doc.moveDown(0.8);
                doc.fontSize(13).fillColor('#0F172A').text('Total Paid:', 40, doc.y, { continued: true });
                doc.text(`INR ${Number(invoice.amount).toFixed(2)}`, { align: 'right' });
                doc.moveDown(2);
                if (snapshot.bankName) {
                    doc.fontSize(10).fillColor('#64748B').text(`Bank Details: ${snapshot.bankName} | A/C: ${snapshot.accountNumber} | IFSC: ${snapshot.ifscCode}`);
                }
                if (snapshot.footer) {
                    doc.moveDown(1);
                    doc.fontSize(9).fillColor('#94A3B8').text(snapshot.footer, { align: 'center' });
                }
                doc.end();
            }
            catch (err) {
                this.logger.error(`Error generating PDF for invoice '${invoice.invoiceNumber}': ${err.message}`);
                reject(err);
            }
        });
    }
};
exports.InvoicePdfService = InvoicePdfService;
exports.InvoicePdfService = InvoicePdfService = InvoicePdfService_1 = __decorate([
    (0, common_1.Injectable)()
], InvoicePdfService);
//# sourceMappingURL=invoice-pdf.service.js.map