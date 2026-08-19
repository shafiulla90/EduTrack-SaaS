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
exports.FirestoreAcademicRepository = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase.service");
function sanitizePayload(obj) {
    if (obj === null || typeof obj !== 'object')
        return obj;
    if (Array.isArray(obj))
        return obj.map(sanitizePayload);
    const clean = {};
    for (const key of Object.keys(obj)) {
        if (obj[key] !== undefined) {
            clean[key] = sanitizePayload(obj[key]);
        }
    }
    return clean;
}
let FirestoreAcademicRepository = class FirestoreAcademicRepository {
    constructor(firebase) {
        this.firebase = firebase;
    }
    get db() {
        return this.firebase.getFirestore();
    }
    async findAcademicYears(tenantId) {
        const snap = await this.db.collection('tenants').doc(tenantId).collection('academicYears').get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async findActiveAcademicYear(tenantId) {
        const snap = await this.db.collection('tenants').doc(tenantId).collection('academicYears').where('isActive', '==', true).limit(1).get();
        if (snap.empty)
            return null;
        return { id: snap.docs[0].id, ...snap.docs[0].data() };
    }
    async findClasses(tenantId, academicYearId) {
        let query = this.db.collection('tenants').doc(tenantId).collection('classes');
        if (academicYearId)
            query = query.where('academicYearId', '==', academicYearId);
        const snap = await query.get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async findClassById(id) {
        const snap = await this.db.collectionGroup('classes').where('id', '==', id).limit(1).get();
        if (snap.empty)
            return null;
        return { id: snap.docs[0].id, ...snap.docs[0].data() };
    }
    async createClass(data) {
        const tenantId = data.tenantId || 'tenant-test-001';
        const ref = data.id ? this.db.collection('tenants').doc(tenantId).collection('classes').doc(data.id) : this.db.collection('tenants').doc(tenantId).collection('classes').doc();
        const payload = sanitizePayload({ ...data, id: ref.id, tenantId });
        await ref.set(payload, { merge: true });
        return payload;
    }
    async deleteClass(id, tenantId = 'tenant-test-001') {
        const docRef = this.db.collection('tenants').doc(tenantId).collection('classes').doc(id);
        const doc = await docRef.get();
        if (doc.exists) {
            const data = { id: doc.id, ...doc.data() };
            await docRef.delete();
            return data;
        }
        const snap = await this.db.collectionGroup('classes').get();
        const match = snap.docs.find((d) => d.id === id);
        if (match) {
            const data = { id: match.id, ...match.data() };
            await match.ref.delete();
            return data;
        }
        return null;
    }
    async findSections(tenantId) {
        const snap = await this.db.collection('tenants').doc(tenantId).collection('sections').get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async createSection(data) {
        const tenantId = data.tenantId || 'tenant-test-001';
        const ref = data.id ? this.db.collection('tenants').doc(tenantId).collection('sections').doc(data.id) : this.db.collection('tenants').doc(tenantId).collection('sections').doc();
        const payload = sanitizePayload({ ...data, id: ref.id, tenantId });
        await ref.set(payload, { merge: true });
        return payload;
    }
    async deleteSection(id, tenantId = 'tenant-test-001') {
        const docRef = this.db.collection('tenants').doc(tenantId).collection('sections').doc(id);
        const doc = await docRef.get();
        if (doc.exists) {
            const data = { id: doc.id, ...doc.data() };
            await docRef.delete();
            return data;
        }
        const snap = await this.db.collectionGroup('sections').get();
        const match = snap.docs.find((d) => d.id === id);
        if (match) {
            const data = { id: match.id, ...match.data() };
            await match.ref.delete();
            return data;
        }
        return null;
    }
    async findClassSections(tenantId, classId) {
        let query = this.db.collection('tenants').doc(tenantId).collection('classSections');
        if (classId)
            query = query.where('classId', '==', classId);
        const snap = await query.get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async findSubjects(tenantId) {
        const snap = await this.db.collection('tenants').doc(tenantId).collection('subjects').get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async createSubject(data) {
        const tenantId = data.tenantId || 'tenant-test-001';
        const ref = data.id ? this.db.collection('tenants').doc(tenantId).collection('subjects').doc(data.id) : this.db.collection('tenants').doc(tenantId).collection('subjects').doc();
        const payload = { ...data, id: ref.id, tenantId };
        await ref.set(payload, { merge: true });
        return payload;
    }
    async deleteSubject(id, tenantId = 'tenant-test-001') {
        const docRef = this.db.collection('tenants').doc(tenantId).collection('subjects').doc(id);
        const doc = await docRef.get();
        if (doc.exists) {
            const data = { id: doc.id, ...doc.data() };
            await docRef.delete();
            return data;
        }
        const snap = await this.db.collectionGroup('subjects').get();
        const match = snap.docs.find((d) => d.id === id);
        if (match) {
            const data = { id: match.id, ...match.data() };
            await match.ref.delete();
            return data;
        }
        return null;
    }
    async createAcademicYear(data) {
        const tenantId = data.tenantId || 'tenant-test-001';
        const ref = data.id ? this.db.collection('tenants').doc(tenantId).collection('academicYears').doc(data.id) : this.db.collection('tenants').doc(tenantId).collection('academicYears').doc();
        const payload = {
            ...data,
            id: ref.id,
            tenantId,
            isActive: data.isActive !== undefined ? data.isActive : true,
            createdAt: new Date().toISOString(),
        };
        await ref.set(payload, { merge: true });
        return payload;
    }
    async toggleAcademicYearActive(id, tenantId) {
        const ref = this.db.collection('tenants').doc(tenantId).collection('academicYears').doc(id);
        const doc = await ref.get();
        const currentActive = doc.exists ? doc.data()?.isActive : false;
        await ref.set({ isActive: !currentActive, updatedAt: new Date().toISOString() }, { merge: true });
        const updated = await ref.get();
        return { id: updated.id, ...updated.data() };
    }
    async createClassSection(data) {
        const tenantId = data.tenantId || 'tenant-test-001';
        const ref = data.id ? this.db.collection('tenants').doc(tenantId).collection('classSections').doc(data.id) : this.db.collection('tenants').doc(tenantId).collection('classSections').doc();
        const payload = { ...data, id: ref.id, tenantId };
        await ref.set(payload, { merge: true });
        return payload;
    }
};
exports.FirestoreAcademicRepository = FirestoreAcademicRepository;
exports.FirestoreAcademicRepository = FirestoreAcademicRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], FirestoreAcademicRepository);
//# sourceMappingURL=firestore-academic.repository.js.map