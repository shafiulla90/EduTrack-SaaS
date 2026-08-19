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
exports.FirestoreTeacherRepository = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase.service");
const migration_helpers_1 = require("../../../common/utils/migration-helpers");
function sanitizePayload(obj) {
    if (obj === null || typeof obj !== 'object')
        return obj;
    if (obj instanceof Date)
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
let FirestoreTeacherRepository = class FirestoreTeacherRepository {
    constructor(firebase) {
        this.firebase = firebase;
    }
    get db() {
        return this.firebase.getFirestore();
    }
    async findProfileById(id) {
        const doc = await this.db.collection('staffProfiles').doc(id).get();
        if (!doc.exists)
            return null;
        const data = { id: doc.id, ...doc.data() };
        const userDoc = await this.db.collection('users').doc(data.userId).get();
        const userData = userDoc.exists ? { id: userDoc.id, ...userDoc.data() } : null;
        return {
            ...data,
            User: userData,
            user: userData,
        };
    }
    async findProfileByUserId(userId) {
        const snap = await this.db.collection('staffProfiles').where('userId', '==', userId).limit(1).get();
        if (snap.empty)
            return null;
        const doc = snap.docs[0];
        return { id: doc.id, ...doc.data() };
    }
    async findTeachersByTenant(tenantId) {
        const [teacherSnap, staffSnap, driverSnap] = await Promise.all([
            this.db.collection('users').where('tenantId', '==', tenantId).where('role', '==', 'TEACHER').get(),
            this.db.collection('users').where('tenantId', '==', tenantId).where('role', '==', 'STAFF').get(),
            this.db.collection('users').where('tenantId', '==', tenantId).where('role', '==', 'DRIVER').get(),
        ]);
        const allUserDocs = [...teacherSnap.docs, ...staffSnap.docs, ...driverSnap.docs];
        const userIds = allUserDocs.map((d) => d.id);
        if (userIds.length === 0)
            return [];
        const staffProfiles = [];
        for (let i = 0; i < userIds.length; i += 30) {
            const batch = userIds.slice(i, i + 30);
            const snap = await this.db.collection('staffProfiles').where('userId', 'in', batch).get();
            staffProfiles.push(...snap.docs);
        }
        return Promise.all(staffProfiles.map(async (doc) => {
            const data = { id: doc.id, ...doc.data() };
            const userDoc = await this.db.collection('users').doc(data.userId).get();
            const userData = userDoc.exists ? { id: userDoc.id, ...userDoc.data() } : null;
            return {
                ...data,
                User: userData,
                user: userData,
            };
        }));
    }
    async findTeacherAssignments(teacherId) {
        const snap = await this.db.collectionGroup('teacherAssignments').where('teacherId', '==', teacherId).get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async findTeacherSkills(teacherId) {
        const snap = await this.db.collectionGroup('teacherSkills').where('teacherId', '==', teacherId).get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async createTeacherAssignment(data) {
        const tenantId = data.tenantId || 'tenant-test-001';
        const docId = data.id || migration_helpers_1.DeterministicKey.teacherAssignment(data.teacherId, data.classSectionId, data.subjectId);
        const ref = this.db.collection('tenants').doc(tenantId).collection('teacherAssignments').doc(docId);
        const payload = sanitizePayload({ ...data, id: docId, tenantId });
        await ref.set(payload, { merge: true });
        return payload;
    }
    async createTeacherSkill(data) {
        const tenantId = data.tenantId || 'tenant-test-001';
        const docId = data.id || migration_helpers_1.DeterministicKey.teacherSkill(data.teacherId, data.subjectId);
        const ref = this.db.collection('tenants').doc(tenantId).collection('teacherSkills').doc(docId);
        const payload = sanitizePayload({ ...data, id: docId, tenantId });
        await ref.set(payload, { merge: true });
        return payload;
    }
    async createStaffProfile(data) {
        const docId = data.id || this.db.collection('staffProfiles').doc().id;
        const ref = this.db.collection('staffProfiles').doc(docId);
        const payload = sanitizePayload({ ...data, id: docId });
        await ref.set(payload, { merge: true });
        return payload;
    }
    async updateStaffProfile(id, data) {
        const ref = this.db.collection('staffProfiles').doc(id);
        const cleanData = sanitizePayload(data);
        await ref.set(cleanData, { merge: true });
        const doc = await ref.get();
        return { id: doc.id, ...doc.data() };
    }
    async deleteStaffProfile(id) {
        const ref = this.db.collection('staffProfiles').doc(id);
        const doc = await ref.get();
        const data = doc.exists ? { id: doc.id, ...doc.data() } : null;
        await ref.delete();
        return data;
    }
};
exports.FirestoreTeacherRepository = FirestoreTeacherRepository;
exports.FirestoreTeacherRepository = FirestoreTeacherRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], FirestoreTeacherRepository);
//# sourceMappingURL=firestore-teacher.repository.js.map