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
exports.FirestoreStudentRepository = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase.service");
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
let FirestoreStudentRepository = class FirestoreStudentRepository {
    constructor(firebase) {
        this.firebase = firebase;
    }
    get db() {
        return this.firebase.getFirestore();
    }
    async findProfileById(id) {
        const doc = await this.db.collection('studentProfiles').doc(id).get();
        if (!doc.exists)
            return null;
        const data = { id: doc.id, ...doc.data() };
        const userId = data.userId;
        let user = null;
        if (userId) {
            const userDoc = await this.db.collection('users').doc(userId).get();
            if (userDoc.exists) {
                user = { id: userDoc.id, ...userDoc.data() };
            }
        }
        return {
            ...data,
            User: user,
        };
    }
    async findProfileByUserId(userId) {
        const snap = await this.db.collection('studentProfiles').where('userId', '==', userId).limit(1).get();
        if (snap.empty)
            return null;
        const doc = snap.docs[0];
        return { id: doc.id, ...doc.data() };
    }
    async findStudentsByClassSection(classSectionId) {
        const snap = await this.db.collection('studentProfiles').where('classSectionId', '==', classSectionId).get();
        const students = await Promise.all(snap.docs.map(async (doc) => {
            const data = { id: doc.id, ...doc.data() };
            const userDoc = await this.db.collection('users').doc(data.userId).get();
            return {
                ...data,
                User: userDoc.exists ? { id: userDoc.id, ...userDoc.data() } : null,
            };
        }));
        return students;
    }
    async findStudentsByTenant(tenantId, page = 1, limit = 100, filters) {
        const tid = tenantId || 'tenant-test-001';
        let snap = await this.db.collection('studentProfiles').where('tenantId', '==', tid).get();
        if (snap.empty) {
            snap = await this.db.collection('studentProfiles').limit(500).get();
        }
        const [classesSnap, sectionsSnap] = await Promise.all([
            this.db.collection('tenants').doc(tid).collection('classes').get().catch(() => null),
            this.db.collection('tenants').doc(tid).collection('sections').get().catch(() => null),
        ]);
        const classMap = new Map();
        if (classesSnap) {
            classesSnap.docs.forEach((d) => classMap.set(d.id, d.data()));
        }
        const sectionMap = new Map();
        if (sectionsSnap) {
            sectionsSnap.docs.forEach((d) => sectionMap.set(d.id, d.data()));
        }
        let allItems = await Promise.all(snap.docs.map(async (doc) => {
            const data = { id: doc.id, ...doc.data() };
            let user = null;
            if (data.userId) {
                const userDoc = await this.db.collection('users').doc(data.userId).get();
                if (userDoc.exists)
                    user = { id: userDoc.id, ...userDoc.data() };
            }
            const clsData = data.classId ? classMap.get(data.classId) : null;
            const secData = data.sectionId ? sectionMap.get(data.sectionId) : null;
            const className = clsData?.name || data.className || data.class || 'Grade 1';
            const sectionName = secData?.name || data.sectionName || data.section || 'Section A';
            const academicYearId = clsData?.academicYearId || data.academicYearId || data.academicYear || '';
            const fullName = data.name || user?.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Student';
            return {
                ...data,
                name: fullName,
                rollNo: data.rollNo || data.rollNumber || data.admissionNo || 'N/A',
                User: user || { id: data.userId || doc.id, name: fullName, email: data.email, phone: data.phone },
                user: user || { id: data.userId || doc.id, name: fullName, email: data.email, phone: data.phone },
                classSection: {
                    class: { id: data.classId, name: className, academicYearId },
                    section: { id: data.sectionId, name: sectionName },
                },
                className,
                sectionName,
                academicYearId,
            };
        }));
        if (filters) {
            if (filters.search && typeof filters.search === 'string' && filters.search.trim()) {
                const q = filters.search.toLowerCase().trim();
                allItems = allItems.filter((s) => (s.name || '').toLowerCase().includes(q) ||
                    (s.rollNo || '').toLowerCase().includes(q) ||
                    (s.fatherName || '').toLowerCase().includes(q) ||
                    (s.motherName || '').toLowerCase().includes(q) ||
                    (s.aadharNo || '').toLowerCase().includes(q) ||
                    (s.user?.phone || s.phone || s.parentPhone || '').includes(q) ||
                    (s.user?.email || s.email || '').toLowerCase().includes(q));
            }
            if (filters.classId && filters.classId !== 'All') {
                allItems = allItems.filter((s) => s.classId === filters.classId ||
                    s.className === filters.classId ||
                    s.classSection?.class?.id === filters.classId ||
                    s.classSection?.class?.name === filters.classId);
            }
            if (filters.sectionId && filters.sectionId !== 'All') {
                allItems = allItems.filter((s) => s.sectionId === filters.sectionId ||
                    s.sectionName === filters.sectionId ||
                    s.classSection?.section?.id === filters.sectionId ||
                    s.classSection?.section?.name === filters.sectionId);
            }
            if (filters.academicYearId && filters.academicYearId !== 'All') {
                allItems = allItems.filter((s) => s.academicYearId === filters.academicYearId ||
                    s.classSection?.class?.academicYearId === filters.academicYearId);
            }
        }
        const offset = (page - 1) * limit;
        return {
            items: allItems.slice(offset, offset + limit),
            total: allItems.length,
        };
    }
    async createProfile(data) {
        const ref = data.id ? this.db.collection('studentProfiles').doc(data.id) : this.db.collection('studentProfiles').doc();
        const payload = sanitizePayload({ ...data, id: ref.id });
        await ref.set(payload, { merge: true });
        return payload;
    }
    async updateProfile(id, data) {
        const ref = this.db.collection('studentProfiles').doc(id);
        const payload = sanitizePayload(data);
        await ref.set(payload, { merge: true });
        const doc = await ref.get();
        const studentData = { id: doc.id, ...doc.data() };
        const userId = studentData.userId;
        if (userId) {
            const userUpdate = {};
            if (data.name)
                userUpdate.name = data.name;
            if (data.email)
                userUpdate.email = data.email;
            if (data.phone)
                userUpdate.phone = data.phone;
            if (data.status)
                userUpdate.isActive = data.status === 'Active';
            if (Object.keys(userUpdate).length > 0) {
                await this.db.collection('users').doc(userId).set(userUpdate, { merge: true }).catch(() => { });
            }
        }
        return studentData;
    }
    async deleteProfile(id) {
        const docRef = this.db.collection('studentProfiles').doc(id);
        const doc = await docRef.get();
        if (doc.exists) {
            const data = { id: doc.id, ...doc.data() };
            await docRef.delete();
            if (data.userId) {
                await this.db.collection('users').doc(data.userId).delete().catch(() => { });
            }
            return data;
        }
        return { id, success: true };
    }
};
exports.FirestoreStudentRepository = FirestoreStudentRepository;
exports.FirestoreStudentRepository = FirestoreStudentRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], FirestoreStudentRepository);
//# sourceMappingURL=firestore-student.repository.js.map