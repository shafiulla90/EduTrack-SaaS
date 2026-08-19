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
exports.FirestoreTimetableRepository = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase.service");
let FirestoreTimetableRepository = class FirestoreTimetableRepository {
    constructor(firebase) {
        this.firebase = firebase;
    }
    get db() {
        return this.firebase.getFirestore();
    }
    async findPeriodTimings(tenantId) {
        const snap = await this.db.collection('tenants').doc(tenantId).collection('periodTimings').orderBy('periodNumber', 'asc').get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async savePeriodTimingsTransaction(tenantId, timingsData) {
        const batch = this.db.batch();
        const snap = await this.db.collection('tenants').doc(tenantId).collection('periodTimings').get();
        snap.docs.forEach((doc) => batch.delete(doc.ref));
        timingsData.forEach((t) => {
            const ref = t.id ? this.db.collection('tenants').doc(tenantId).collection('periodTimings').doc(t.id) : this.db.collection('tenants').doc(tenantId).collection('periodTimings').doc();
            batch.set(ref, { ...t, id: ref.id, tenantId }, { merge: true });
        });
        await batch.commit();
        return { count: timingsData.length };
    }
    async findPeriodsByClassSection(classSectionId) {
        const snap = await this.db.collectionGroup('periods').where('classSectionId', '==', classSectionId).get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async findPeriodsByTeacher(teacherId) {
        const snap = await this.db.collectionGroup('periods').where('teacherId', '==', teacherId).get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async createPeriod(data) {
        const tenantId = data.tenantId || 'tenant-test-001';
        const ref = data.id ? this.db.collection('tenants').doc(tenantId).collection('periods').doc(data.id) : this.db.collection('tenants').doc(tenantId).collection('periods').doc();
        const payload = { ...data, id: ref.id, tenantId };
        await ref.set(payload, { merge: true });
        return payload;
    }
    async updatePeriod(id, data) {
        const snap = await this.db.collectionGroup('periods').where('id', '==', id).limit(1).get();
        if (snap.empty)
            return null;
        const doc = snap.docs[0];
        await doc.ref.set(data, { merge: true });
        return { id, ...doc.data(), ...data };
    }
    async deletePeriod(id) {
        const snap = await this.db.collectionGroup('periods').where('id', '==', id).limit(1).get();
        if (snap.empty)
            return null;
        const doc = snap.docs[0];
        const data = { id: doc.id, ...doc.data() };
        await doc.ref.delete();
        return data;
    }
};
exports.FirestoreTimetableRepository = FirestoreTimetableRepository;
exports.FirestoreTimetableRepository = FirestoreTimetableRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], FirestoreTimetableRepository);
//# sourceMappingURL=firestore-timetable.repository.js.map