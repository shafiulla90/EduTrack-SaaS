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
exports.FirestorePlatformAdminRepository = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase.service");
let FirestorePlatformAdminRepository = class FirestorePlatformAdminRepository {
    constructor(firebase) {
        this.firebase = firebase;
    }
    get db() {
        return this.firebase.getFirestore();
    }
    async getSettings() {
        const snap = await this.db.collection('platformSettings').limit(1).get();
        if (snap.empty)
            return null;
        return { id: snap.docs[0].id, ...snap.docs[0].data() };
    }
    async updateSettings(id, data) {
        const ref = this.db.collection('platformSettings').doc(id);
        await ref.set(data, { merge: true });
        const doc = await ref.get();
        return { id: doc.id, ...doc.data() };
    }
    async getGatewayConfigs() {
        const snap = await this.db.collection('paymentGatewayConfigs').get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async updateGatewayConfig(id, data) {
        const ref = this.db.collection('paymentGatewayConfigs').doc(id);
        await ref.set(data, { merge: true });
        const doc = await ref.get();
        return { id: doc.id, ...doc.data() };
    }
};
exports.FirestorePlatformAdminRepository = FirestorePlatformAdminRepository;
exports.FirestorePlatformAdminRepository = FirestorePlatformAdminRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], FirestorePlatformAdminRepository);
//# sourceMappingURL=firestore-platform-admin.repository.js.map