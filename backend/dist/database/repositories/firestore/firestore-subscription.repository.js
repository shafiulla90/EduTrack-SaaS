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
exports.FirestoreSubscriptionRepository = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase.service");
const migration_helpers_1 = require("../../../common/utils/migration-helpers");
let FirestoreSubscriptionRepository = class FirestoreSubscriptionRepository {
    constructor(firebase) {
        this.firebase = firebase;
    }
    get db() {
        return this.firebase.getFirestore();
    }
    async findPlans() {
        const snap = await this.db.collection('subscriptionPlans').where('status', '==', 'ACTIVE').get();
        return snap.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                price: data.priceCents !== undefined ? (0, migration_helpers_1.fromCents)(data.priceCents) : Number(data.price || 0),
            };
        });
    }
    async findPlanById(id) {
        const doc = await this.db.collection('subscriptionPlans').doc(id).get();
        if (!doc.exists)
            return null;
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            price: data.priceCents !== undefined ? (0, migration_helpers_1.fromCents)(data.priceCents) : Number(data.price || 0),
        };
    }
    async createOrder(data) {
        const ref = data.id ? this.db.collection('subscriptionOrders').doc(data.id) : this.db.collection('subscriptionOrders').doc();
        const payload = {
            ...data,
            id: ref.id,
            amountCents: (0, migration_helpers_1.toCents)(data.amount),
            gstCents: (0, migration_helpers_1.toCents)(data.gst),
            totalCents: (0, migration_helpers_1.toCents)(data.total),
        };
        await ref.set(payload, { merge: true });
        return payload;
    }
    async findOrderById(id) {
        const doc = await this.db.collection('subscriptionOrders').doc(id).get();
        if (!doc.exists)
            return null;
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            amount: data.amountCents !== undefined ? (0, migration_helpers_1.fromCents)(data.amountCents) : Number(data.amount || 0),
            gst: data.gstCents !== undefined ? (0, migration_helpers_1.fromCents)(data.gstCents) : Number(data.gst || 0),
            total: data.totalCents !== undefined ? (0, migration_helpers_1.fromCents)(data.totalCents) : Number(data.total || 0),
        };
    }
    async createPayment(data) {
        const ref = data.id ? this.db.collection('subscriptionPayments').doc(data.id) : this.db.collection('subscriptionPayments').doc();
        const payload = {
            ...data,
            id: ref.id,
            amountCents: (0, migration_helpers_1.toCents)(data.amount),
            gstCents: (0, migration_helpers_1.toCents)(data.gst),
            paidDate: (0, migration_helpers_1.formatDateISO)(data.paidDate),
        };
        await ref.set(payload, { merge: true });
        return payload;
    }
    async createSubscription(data) {
        const ref = data.id ? this.db.collection('subscriptions').doc(data.id) : this.db.collection('subscriptions').doc();
        const payload = {
            ...data,
            id: ref.id,
            startDate: (0, migration_helpers_1.formatDateISO)(data.startDate),
            expiryDate: (0, migration_helpers_1.formatDateISO)(data.expiryDate),
        };
        await ref.set(payload, { merge: true });
        return payload;
    }
    async findActiveSubscription(tenantId) {
        const snap = await this.db.collection('subscriptions').where('tenantId', '==', tenantId).where('status', '==', 'ACTIVE').limit(1).get();
        if (snap.empty)
            return null;
        const doc = snap.docs[0];
        const subData = { id: doc.id, ...doc.data() };
        const planDoc = await this.db.collection('subscriptionPlans').doc(subData.planId).get();
        return {
            ...subData,
            SubscriptionPlan: planDoc.exists ? { id: planDoc.id, ...planDoc.data() } : null,
        };
    }
};
exports.FirestoreSubscriptionRepository = FirestoreSubscriptionRepository;
exports.FirestoreSubscriptionRepository = FirestoreSubscriptionRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], FirestoreSubscriptionRepository);
//# sourceMappingURL=firestore-subscription.repository.js.map