import { FirebaseService } from '../../firebase.service';
import { ILibraryRepository } from '../../../common/interfaces/library.repository.interface';
export declare class FirestoreLibraryRepository implements ILibraryRepository {
    private readonly firebase;
    constructor(firebase: FirebaseService);
    private get db();
    findBooksByTenant(tenantId: string): Promise<any[]>;
    findBookById(id: string): Promise<any | null>;
    findCopiesByBook(bookId: string): Promise<any[]>;
    findBookIssuesByBorrower(borrowerId: string): Promise<any[]>;
    issueBook(data: any): Promise<any>;
    returnBook(issueId: string, returnDate: Date): Promise<any>;
}
