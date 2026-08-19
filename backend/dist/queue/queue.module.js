"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModule = void 0;
const common_1 = require("@nestjs/common");
const queue_service_1 = require("./queue.service");
const cloud_storage_service_1 = require("../common/services/cloud-storage.service");
const aws_ses_service_1 = require("../common/services/aws-ses.service");
const invoice_pdf_service_1 = require("../saas-billing/invoice-pdf.service");
const prisma_service_1 = require("../prisma.service");
let QueueModule = class QueueModule {
};
exports.QueueModule = QueueModule;
exports.QueueModule = QueueModule = __decorate([
    (0, common_1.Module)({
        providers: [
            queue_service_1.QueueService,
            cloud_storage_service_1.CloudStorageService,
            aws_ses_service_1.AwsSesService,
            invoice_pdf_service_1.InvoicePdfService,
            prisma_service_1.PrismaService,
        ],
        exports: [queue_service_1.QueueService, cloud_storage_service_1.CloudStorageService, aws_ses_service_1.AwsSesService, invoice_pdf_service_1.InvoicePdfService],
    })
], QueueModule);
//# sourceMappingURL=queue.module.js.map