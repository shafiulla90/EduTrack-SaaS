import { CloudStorageService } from '../common/services/cloud-storage.service';
import { AwsSesService } from '../common/services/aws-ses.service';
import { InvoicePdfService } from '../saas-billing/invoice-pdf.service';
import { PrismaService } from '../prisma.service';
export declare class QueueService {
    private prisma;
    private storageService;
    private emailService;
    private invoicePdfService;
    private readonly logger;
    constructor(prisma: PrismaService, storageService: CloudStorageService, emailService: AwsSesService, invoicePdfService: InvoicePdfService);
    enqueueInvoiceJobs(invoiceId: string, recipientEmail?: string): Promise<void>;
}
