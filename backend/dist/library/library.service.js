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
exports.LibraryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const tenant_context_1 = require("../tenants/tenant.context");
const client_1 = require("@prisma/client");
let LibraryService = class LibraryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getTenantId() {
        const tenantId = tenant_context_1.TenantContext.getTenantId();
        if (!tenantId) {
            throw new common_1.BadRequestException('No active school tenant context found');
        }
        return tenantId;
    }
    async addBook(data) {
        const tenantId = this.getTenantId();
        const totalCopies = data.totalCopies || 1;
        return this.prisma.$transaction(async (tx) => {
            const book = await tx.book.create({
                data: {
                    title: data.title,
                    author: data.author,
                    isbn: data.isbn || null,
                    category: data.category || null,
                    totalCopies,
                    availableCopies: totalCopies,
                    tenantId,
                },
            });
            const copiesData = Array.from({ length: totalCopies }).map((_, idx) => ({
                bookId: book.id,
                barcode: `${book.isbn || 'BK'}-${book.id.substring(0, 4)}-${idx + 1}`,
                status: client_1.BookCopyStatus.AVAILABLE,
                tenantId,
            }));
            await tx.bookCopy.createMany({
                data: copiesData,
            });
            return book;
        });
    }
    async getBooks() {
        const tenantId = this.getTenantId();
        return this.prisma.book.findMany({
            where: { tenantId },
            include: {
                copies: true,
            },
            orderBy: { title: 'asc' },
        });
    }
    async borrowBook(barcode, borrowerId, daysToBorrow = 14) {
        const tenantId = this.getTenantId();
        const copy = await this.prisma.bookCopy.findUnique({
            where: { barcode },
        });
        if (!copy || copy.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Book copy barcode not found');
        }
        if (copy.status !== client_1.BookCopyStatus.AVAILABLE) {
            throw new common_1.BadRequestException(`Book copy is currently not available: status is ${copy.status}`);
        }
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + daysToBorrow);
        return this.prisma.$transaction(async (tx) => {
            const issue = await tx.bookIssue.create({
                data: {
                    bookCopyId: copy.id,
                    borrowerId,
                    dueDate,
                    tenantId,
                },
            });
            await tx.bookCopy.update({
                where: { id: copy.id },
                data: { status: client_1.BookCopyStatus.ISSUED },
            });
            await tx.book.update({
                where: { id: copy.bookId },
                data: {
                    availableCopies: { decrement: 1 },
                },
            });
            return issue;
        });
    }
    async returnBook(barcode, fineAmountPaid = 0) {
        const tenantId = this.getTenantId();
        const copy = await this.prisma.bookCopy.findUnique({
            where: { barcode },
        });
        if (!copy || copy.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Book copy barcode not found');
        }
        const activeIssue = await this.prisma.bookIssue.findFirst({
            where: {
                bookCopyId: copy.id,
                returnDate: null,
            },
        });
        if (!activeIssue) {
            throw new common_1.BadRequestException('No active borrow record found for this copy');
        }
        const returnDate = new Date();
        const dueDate = new Date(activeIssue.dueDate);
        let fineAmount = 0;
        if (returnDate > dueDate) {
            const diffTime = Math.abs(returnDate.getTime() - dueDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            fineAmount = diffDays * 5.00;
        }
        return this.prisma.$transaction(async (tx) => {
            const updatedIssue = await tx.bookIssue.update({
                where: { id: activeIssue.id },
                data: {
                    returnDate,
                    fineAmount,
                    finePaid: fineAmountPaid >= fineAmount,
                },
            });
            await tx.bookCopy.update({
                where: { id: copy.id },
                data: { status: client_1.BookCopyStatus.AVAILABLE },
            });
            await tx.book.update({
                where: { id: copy.bookId },
                data: {
                    availableCopies: { increment: 1 },
                },
            });
            return updatedIssue;
        });
    }
    async getBorrowLogs() {
        const tenantId = this.getTenantId();
        return this.prisma.bookIssue.findMany({
            where: { tenantId },
            include: {
                bookCopy: {
                    include: { book: true },
                },
                borrower: {
                    select: { name: true, email: true },
                },
            },
            orderBy: { issueDate: 'desc' },
        });
    }
};
exports.LibraryService = LibraryService;
exports.LibraryService = LibraryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LibraryService);
//# sourceMappingURL=library.service.js.map