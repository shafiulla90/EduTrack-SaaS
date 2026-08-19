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
exports.FirestoreUserRepository = void 0;
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
let FirestoreUserRepository = class FirestoreUserRepository {
    constructor(firebase) {
        this.firebase = firebase;
    }
    get db() {
        return this.firebase.getFirestore();
    }
    async findById(id) {
        const doc = await this.db.collection('users').doc(id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    }
    async findByEmail(email) {
        const snap = await this.db.collection('users').where('email', '==', email).limit(1).get();
        if (snap.empty)
            return null;
        const doc = snap.docs[0];
        return { id: doc.id, ...doc.data() };
    }
    async findByPhone(phone) {
        const cleaned = (phone || '').replace(/[\s\-()]/g, '');
        const cleanNoCountry = cleaned.replace(/^\+91/, '');
        const snap = await this.db.collection('users').where('phone', '==', cleaned).limit(1).get().catch(() => null);
        if (snap && !snap.empty) {
            const doc = snap.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        const snap2 = await this.db.collection('users').where('phone', '==', cleanNoCountry).limit(1).get().catch(() => null);
        if (snap2 && !snap2.empty) {
            const doc = snap2.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        const snap3 = await this.db.collection('users').where('mobileNumber', '==', cleanNoCountry).limit(1).get().catch(() => null);
        if (snap3 && !snap3.empty) {
            const doc = snap3.docs[0];
            return { id: doc.id, ...doc.data() };
        }
        const staffSnap = await this.db.collection('staffProfiles').where('phone', '==', cleanNoCountry).limit(1).get().catch(() => null);
        if (staffSnap && !staffSnap.empty) {
            const staff = staffSnap.docs[0].data();
            if (staff.userId) {
                return this.findById(staff.userId);
            }
        }
        const tenantSnap = await this.db.collection('tenants').where('adminPhone', '==', cleanNoCountry).limit(1).get().catch(() => null);
        if (tenantSnap && !tenantSnap.empty) {
            const tenant = tenantSnap.docs[0].data();
            return { id: `admin-${tenantSnap.docs[0].id}`, role: 'SCHOOL_ADMIN', tenantId: tenantSnap.docs[0].id, tenant };
        }
        return null;
    }
    async findUserWithProfile(id) {
        const userDoc = await this.db.collection('users').doc(id).get();
        if (!userDoc.exists)
            return null;
        const userData = { id: userDoc.id, ...userDoc.data() };
        const [studentSnap, staffSnap, parentSnap] = await Promise.all([
            this.db.collection('studentProfiles').where('userId', '==', id).limit(1).get(),
            this.db.collection('staffProfiles').where('userId', '==', id).limit(1).get(),
            this.db.collection('parentProfiles').where('userId', '==', id).limit(1).get(),
        ]);
        return {
            ...userData,
            StudentProfile: !studentSnap.empty ? { id: studentSnap.docs[0].id, ...studentSnap.docs[0].data() } : null,
            StaffProfile: !staffSnap.empty ? { id: staffSnap.docs[0].id, ...staffSnap.docs[0].data() } : null,
            ParentProfile: !parentSnap.empty ? { id: parentSnap.docs[0].id, ...parentSnap.docs[0].data() } : null,
        };
    }
    async findUsersByTenant(tenantId, role) {
        let query = this.db.collection('users').where('tenantId', '==', tenantId);
        if (role)
            query = query.where('role', '==', role);
        const snap = await query.get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async create(data) {
        const ref = data.id ? this.db.collection('users').doc(data.id) : this.db.collection('users').doc();
        const payload = sanitizePayload({ ...data, id: ref.id });
        await ref.set(payload, { merge: true });
        return payload;
    }
    async update(id, data) {
        const ref = this.db.collection('users').doc(id);
        const payload = sanitizePayload(data);
        await ref.set(payload, { merge: true });
        const doc = await ref.get();
        return { id: doc.id, ...doc.data() };
    }
    async delete(id) {
        const ref = this.db.collection('users').doc(id);
        const doc = await ref.get();
        const data = doc.exists ? { id: doc.id, ...doc.data() } : null;
        await ref.delete();
        return data;
    }
};
exports.FirestoreUserRepository = FirestoreUserRepository;
exports.FirestoreUserRepository = FirestoreUserRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], FirestoreUserRepository);
//# sourceMappingURL=firestore-user.repository.js.map