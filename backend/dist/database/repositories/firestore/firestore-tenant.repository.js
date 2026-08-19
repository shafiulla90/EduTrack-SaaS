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
exports.FirestoreTenantRepository = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase.service");
let FirestoreTenantRepository = class FirestoreTenantRepository {
    constructor(firebase) {
        this.firebase = firebase;
    }
    get db() {
        return this.firebase.getFirestore();
    }
    async findAll() {
        const snap = await this.db.collection('tenants').get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async findById(id) {
        const doc = await this.db.collection('tenants').doc(id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    }
    async findBySubdomain(subDomain) {
        const snap = await this.db.collection('tenants').where('subDomain', '==', subDomain).limit(1).get();
        if (snap.empty)
            return null;
        const doc = snap.docs[0];
        return { id: doc.id, ...doc.data() };
    }
    sanitizePayload(data) {
        if (!data || typeof data !== 'object')
            return data;
        const clean = Array.isArray(data) ? [] : {};
        for (const key of Object.keys(data)) {
            if (data[key] !== undefined) {
                clean[key] = data[key];
            }
        }
        return clean;
    }
    async create(data) {
        const ref = data.id ? this.db.collection('tenants').doc(data.id) : this.db.collection('tenants').doc();
        const payload = this.sanitizePayload({ ...data, id: ref.id });
        await ref.set(payload, { merge: true });
        return payload;
    }
    async update(id, data) {
        const ref = this.db.collection('tenants').doc(id);
        const clean = this.sanitizePayload(data);
        await ref.set(clean, { merge: true });
        const doc = await ref.get();
        return { id: doc.id, ...doc.data() };
    }
    async delete(id) {
        const ref = this.db.collection('tenants').doc(id);
        const doc = await ref.get();
        const data = doc.exists ? { id: doc.id, ...doc.data() } : null;
        await ref.delete();
        return data;
    }
};
exports.FirestoreTenantRepository = FirestoreTenantRepository;
exports.FirestoreTenantRepository = FirestoreTenantRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], FirestoreTenantRepository);
//# sourceMappingURL=firestore-tenant.repository.js.map