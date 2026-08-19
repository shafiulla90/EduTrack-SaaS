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
exports.FirestoreOperationsRepository = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase.service");
const migration_helpers_1 = require("../../../common/utils/migration-helpers");
let FirestoreOperationsRepository = class FirestoreOperationsRepository {
    constructor(firebase) {
        this.firebase = firebase;
    }
    get db() {
        return this.firebase.getFirestore();
    }
    async findComplaintsByTenant(tenantId) {
        const snap = await this.db.collection('tenants').doc(tenantId).collection('complaints').orderBy('createdAt', 'desc').get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async createComplaint(data) {
        const tenantId = data.tenantId || 'tenant-test-001';
        const ref = data.id ? this.db.collection('tenants').doc(tenantId).collection('complaints').doc(data.id) : this.db.collection('tenants').doc(tenantId).collection('complaints').doc();
        const payload = {
            ...data,
            id: ref.id,
            tenantId,
            createdAt: (0, migration_helpers_1.formatDateISO)(data.createdAt || new Date()),
        };
        await ref.set(payload, { merge: true });
        return payload;
    }
    async updateComplaint(id, data) {
        const snap = await this.db.collectionGroup('complaints').where('id', '==', id).limit(1).get();
        if (snap.empty)
            return null;
        const doc = snap.docs[0];
        await doc.ref.set(data, { merge: true });
        return { id, ...doc.data(), ...data };
    }
    async findNotificationsByUser(recipientId) {
        const snap = await this.db.collection('notifications').where('recipientId', '==', recipientId).get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async createNotification(data) {
        const ref = data.id ? this.db.collection('notifications').doc(data.id) : this.db.collection('notifications').doc();
        const payload = {
            ...data,
            id: ref.id,
            createdAt: (0, migration_helpers_1.formatDateISO)(data.createdAt || new Date()),
        };
        await ref.set(payload, { merge: true });
        return payload;
    }
    async markNotificationRead(id) {
        const ref = this.db.collection('notifications').doc(id);
        await ref.set({ isRead: true }, { merge: true });
        const doc = await ref.get();
        return { id: doc.id, ...doc.data() };
    }
    async logActivity(data) {
        const tenantId = data.tenantId || 'tenant-test-001';
        const ref = data.id ? this.db.collection('tenants').doc(tenantId).collection('activityLogs').doc(data.id) : this.db.collection('tenants').doc(tenantId).collection('activityLogs').doc();
        const payload = {
            ...data,
            id: ref.id,
            tenantId,
            createdAt: (0, migration_helpers_1.formatDateISO)(data.createdAt || new Date()),
        };
        await ref.set(payload, { merge: true });
        return payload;
    }
};
exports.FirestoreOperationsRepository = FirestoreOperationsRepository;
exports.FirestoreOperationsRepository = FirestoreOperationsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], FirestoreOperationsRepository);
//# sourceMappingURL=firestore-operations.repository.js.map