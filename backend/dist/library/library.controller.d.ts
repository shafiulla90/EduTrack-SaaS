import { LibraryService } from './library.service';
export declare class LibraryController {
    private libraryService;
    constructor(libraryService: LibraryService);
    createBook(data: any): Promise<{
        id: string;
        updatedAt: Date;
        tenantId: string;
        createdAt: Date;
        title: string;
        category: string | null;
        author: string;
        isbn: string | null;
        totalCopies: number;
        availableCopies: number;
    }>;
    getBooks(): Promise<({
        copies: {
            id: string;
            updatedAt: Date;
            tenantId: string;
            status: import(".prisma/client").$Enums.BookCopyStatus;
            createdAt: Date;
            barcode: string;
            bookId: string;
        }[];
    } & {
        id: string;
        updatedAt: Date;
        tenantId: string;
        createdAt: Date;
        title: string;
        category: string | null;
        author: string;
        isbn: string | null;
        totalCopies: number;
        availableCopies: number;
    })[]>;
    borrow(barcode: string, borrowerId: string, daysToBorrow?: number): Promise<{
        id: string;
        updatedAt: Date;
        tenantId: string;
        createdAt: Date;
        dueDate: Date;
        issueDate: Date;
        returnDate: Date | null;
        fineAmount: import("@prisma/client/runtime/library").Decimal;
        finePaid: boolean;
        bookCopyId: string;
        borrowerId: string;
    }>;
    returnBook(barcode: string, finePaid?: number): Promise<{
        id: string;
        updatedAt: Date;
        tenantId: string;
        createdAt: Date;
        dueDate: Date;
        issueDate: Date;
        returnDate: Date | null;
        fineAmount: import("@prisma/client/runtime/library").Decimal;
        finePaid: boolean;
        bookCopyId: string;
        borrowerId: string;
    }>;
    getLogs(): Promise<({
        bookCopy: {
            book: {
                id: string;
                updatedAt: Date;
                tenantId: string;
                createdAt: Date;
                title: string;
                category: string | null;
                author: string;
                isbn: string | null;
                totalCopies: number;
                availableCopies: number;
            };
        } & {
            id: string;
            updatedAt: Date;
            tenantId: string;
            status: import(".prisma/client").$Enums.BookCopyStatus;
            createdAt: Date;
            barcode: string;
            bookId: string;
        };
        borrower: {
            name: string;
            email: string;
        };
    } & {
        id: string;
        updatedAt: Date;
        tenantId: string;
        createdAt: Date;
        dueDate: Date;
        issueDate: Date;
        returnDate: Date | null;
        fineAmount: import("@prisma/client/runtime/library").Decimal;
        finePaid: boolean;
        bookCopyId: string;
        borrowerId: string;
    })[]>;
}
