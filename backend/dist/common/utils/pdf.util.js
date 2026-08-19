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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoicePDF = generateInvoicePDF;
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function generateInvoicePDF(invoiceData, outputPath) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new pdfkit_1.default({ margin: 50 });
            const dir = path.dirname(outputPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            const stream = fs.createWriteStream(outputPath);
            doc.pipe(stream);
            doc.fillColor('#444444')
                .fontSize(20)
                .text('EduTrack SaaS Invoice', 50, 57)
                .fontSize(10)
                .text(`Invoice Number: ${invoiceData.invoiceNumber}`, 200, 50, { align: 'right' })
                .text(`Date: ${new Date(invoiceData.createdDate).toLocaleDateString()}`, 200, 65, { align: 'right' })
                .text(`Status: ${invoiceData.status}`, 200, 80, { align: 'right' })
                .moveDown();
            doc.fillColor('#000000')
                .text(`Billed To: ${invoiceData.tenantName || invoiceData.tenantId}`, 50, 120)
                .moveDown();
            const tableTop = 200;
            doc.font('Helvetica-Bold');
            doc.text('Plan', 50, tableTop);
            doc.text('Amount', 400, tableTop, { width: 90, align: 'right' });
            doc.moveTo(50, tableTop + 15)
                .lineTo(500, tableTop + 15)
                .stroke();
            doc.font('Helvetica');
            doc.text(invoiceData.planId || 'Premium', 50, tableTop + 30);
            doc.text(`${invoiceData.currency} ${invoiceData.amount}`, 400, tableTop + 30, { width: 90, align: 'right' });
            const subtotalTop = tableTop + 70;
            doc.text(`GST (18%): ${invoiceData.currency} ${invoiceData.gst}`, 350, subtotalTop, { align: 'right' });
            doc.font('Helvetica-Bold');
            doc.text(`Total: ${invoiceData.currency} ${Number(invoiceData.amount) + Number(invoiceData.gst)}`, 350, subtotalTop + 20, { align: 'right' });
            doc.end();
            stream.on('finish', () => {
                resolve(outputPath);
            });
            stream.on('error', (err) => {
                reject(err);
            });
        }
        catch (err) {
            reject(err);
        }
    });
}
//# sourceMappingURL=pdf.util.js.map