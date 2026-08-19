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
exports.FirestoreLibraryRepository = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase.service");
const migration_helpers_1 = require("../../../common/utils/migration-helpers");
let FirestoreLibraryRepository = class FirestoreLibraryRepository {
    constructor(firebase) {
        this.firebase = firebase;
    }
    get db() {
        return this.firebase.getFirestore();
    }
    async findBooksByTenant(tenantId) {
        const snap = await this.db.collection('tenants').doc(tenantId).collection('books').get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async findBookById(id) {
        const snap = await this.db.collectionGroup('books').where('id', '==', id).limit(1).get();
        if (snap.empty)
            return null;
        const doc = snap.docs[0];
        const data = { id: doc.id, ...doc.data() };
        const copiesSnap = await doc.ref.collection('bookCopies').get();
        return {
            ...data,
            BookCopy: copiesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        };
    }
    async findCopiesByBook(bookId) {
        const snap = await this.db.collectionGroup('bookCopies').where('bookId', '==', bookId).get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async findBookIssuesByBorrower(borrowerId) {
        const snap = await this.db.collectionGroup('bookIssues').where('borrowerId', '==', borrowerId).get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async issueBook(data) {
        const tenantId = data.tenantId || 'tenant-test-001';
        const ref = data.id ? this.db.collection('tenants').doc(tenantId).collection('bookIssues').doc(data.id) : this.db.collection('tenants').doc(tenantId).collection('bookIssues').doc();
        const payload = {
            ...data,
            id: ref.id,
            tenantId,
            issueDate: (0, migration_helpers_1.formatDateISO)(data.issueDate),
            dueDate: (0, migration_helpers_1.formatDateISO)(data.dueDate),
        };
        await ref.set(payload, { merge: true });
        return payload;
    }
    async returnBook(issueId, returnDate) {
        const snap = await this.db.collectionGroup('bookIssues').where('id', '==', issueId).limit(1).get();
        if (snap.empty)
            return null;
        const doc = snap.docs[0];
        await doc.ref.set({ returnDate: (0, migration_helpers_1.formatDateISO)(returnDate) }, { merge: true });
        return { id: issueId, ...doc.data(), returnDate: (0, migration_helpers_1.formatDateISO)(returnDate) };
    }
};
exports.FirestoreLibraryRepository = FirestoreLibraryRepository;
exports.FirestoreLibraryRepository = FirestoreLibraryRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], FirestoreLibraryRepository);
//# sourceMappingURL=firestore-library.repository.js.map