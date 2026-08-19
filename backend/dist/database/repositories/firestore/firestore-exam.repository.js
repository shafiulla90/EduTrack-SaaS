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
exports.FirestoreExamRepository = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase.service");
const migration_helpers_1 = require("../../../common/utils/migration-helpers");
let FirestoreExamRepository = class FirestoreExamRepository {
    constructor(firebase) {
        this.firebase = firebase;
    }
    get db() {
        return this.firebase.getFirestore();
    }
    async findExamsByClassSection(classSectionId) {
        const snap = await this.db.collectionGroup('exams').where('classSectionId', '==', classSectionId).get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async findExamById(id) {
        const snap = await this.db.collectionGroup('exams').where('id', '==', id).limit(1).get();
        if (snap.empty)
            return null;
        const doc = snap.docs[0];
        const examData = { id: doc.id, ...doc.data() };
        const marksSnap = await doc.ref.collection('examMarks').get();
        return {
            ...examData,
            ExamMark: marksSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        };
    }
    async findMarksByExam(examId) {
        const snap = await this.db.collectionGroup('examMarks').where('examId', '==', examId).get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async findMarksByStudent(studentId) {
        const snap = await this.db.collectionGroup('examMarks').where('studentId', '==', studentId).get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async upsertExamMark(data) {
        const tenantId = data.tenantId || 'tenant-test-001';
        const docId = data.id || migration_helpers_1.DeterministicKey.examMark(data.examId, data.studentId, data.subjectId);
        const examSnap = await this.db.collectionGroup('exams').where('id', '==', data.examId).limit(1).get();
        let examRef;
        if (!examSnap.empty) {
            examRef = examSnap.docs[0].ref;
        }
        else {
            examRef = this.db.collection('tenants').doc(tenantId).collection('exams').doc(data.examId);
        }
        const markRef = examRef.collection('examMarks').doc(docId);
        const payload = {
            ...data,
            id: docId,
            marksObtained: Number(data.marksObtained),
            tenantId,
        };
        await markRef.set(payload, { merge: true });
        return payload;
    }
    async createExam(data) {
        const tenantId = data.tenantId || 'tenant-test-001';
        const ref = data.id ? this.db.collection('tenants').doc(tenantId).collection('exams').doc(data.id) : this.db.collection('tenants').doc(tenantId).collection('exams').doc();
        const payload = {
            ...data,
            id: ref.id,
            tenantId,
            createdAt: (0, migration_helpers_1.formatDateISO)(data.createdAt || new Date()),
        };
        await ref.set(payload, { merge: true });
        return payload;
    }
    async findExamsByTenant(tenantId) {
        const snap = await this.db.collection('tenants').doc(tenantId).collection('exams').get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async createExamType(name, tenantId) {
        const ref = this.db.collection('tenants').doc(tenantId).collection('examTypes').doc();
        const payload = { id: ref.id, name, tenantId, createdAt: new Date().toISOString() };
        await ref.set(payload, { merge: true });
        return payload;
    }
    async updateExamType(id, name, tenantId) {
        const ref = this.db.collection('tenants').doc(tenantId).collection('examTypes').doc(id);
        await ref.set({ name, updatedAt: new Date().toISOString() }, { merge: true });
        const doc = await ref.get();
        return { id: doc.id, ...doc.data() };
    }
    async deleteExamType(id, tenantId) {
        const ref = this.db.collection('tenants').doc(tenantId).collection('examTypes').doc(id);
        await ref.delete();
        return { success: true, id };
    }
    async findExamTypesByTenant(tenantId) {
        const snap = await this.db.collection('tenants').doc(tenantId).collection('examTypes').get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
};
exports.FirestoreExamRepository = FirestoreExamRepository;
exports.FirestoreExamRepository = FirestoreExamRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], FirestoreExamRepository);
//# sourceMappingURL=firestore-exam.repository.js.map