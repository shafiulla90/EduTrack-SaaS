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
exports.FirestoreBillingRepository = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase.service");
const migration_helpers_1 = require("../../../common/utils/migration-helpers");
let FirestoreBillingRepository = class FirestoreBillingRepository {
    constructor(firebase) {
        this.firebase = firebase;
    }
    get db() {
        return this.firebase.getFirestore();
    }
    async findInvoicesByTenant(tenantId, status) {
        let query = this.db.collection('tenants').doc(tenantId).collection('invoices');
        if (status)
            query = query.where('status', '==', status);
        const snap = await query.get();
        return snap.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                totalAmount: data.totalAmountCents !== undefined ? (0, migration_helpers_1.fromCents)(data.totalAmountCents) : Number(data.totalAmount || 0),
                paidAmount: data.paidAmountCents !== undefined ? (0, migration_helpers_1.fromCents)(data.paidAmountCents) : Number(data.paidAmount || 0),
                remainingBalance: data.remainingBalanceCents !== undefined ? (0, migration_helpers_1.fromCents)(data.remainingBalanceCents) : Number(data.remainingBalance || 0),
            };
        });
    }
    async findInvoiceById(id) {
        const snap = await this.db.collectionGroup('invoices').where('id', '==', id).limit(1).get();
        if (snap.empty)
            return null;
        const doc = snap.docs[0];
        const data = doc.data();
        const itemsSnap = await doc.ref.collection('items').get();
        return {
            id: doc.id,
            ...data,
            totalAmount: data.totalAmountCents !== undefined ? (0, migration_helpers_1.fromCents)(data.totalAmountCents) : Number(data.totalAmount || 0),
            paidAmount: data.paidAmountCents !== undefined ? (0, migration_helpers_1.fromCents)(data.paidAmountCents) : Number(data.paidAmount || 0),
            remainingBalance: data.remainingBalanceCents !== undefined ? (0, migration_helpers_1.fromCents)(data.remainingBalanceCents) : Number(data.remainingBalance || 0),
            InvoiceItem: itemsSnap.docs.map((itemDoc) => {
                const itemData = itemDoc.data();
                return {
                    id: itemDoc.id,
                    ...itemData,
                    amount: itemData.amountCents !== undefined ? (0, migration_helpers_1.fromCents)(itemData.amountCents) : Number(itemData.amount || 0),
                };
            }),
        };
    }
    async findInvoicesByStudent(studentId) {
        const snap = await this.db.collectionGroup('invoices').where('studentId', '==', studentId).get();
        return snap.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                totalAmount: data.totalAmountCents !== undefined ? (0, migration_helpers_1.fromCents)(data.totalAmountCents) : Number(data.totalAmount || 0),
                paidAmount: data.paidAmountCents !== undefined ? (0, migration_helpers_1.fromCents)(data.paidAmountCents) : Number(data.paidAmount || 0),
                remainingBalance: data.remainingBalanceCents !== undefined ? (0, migration_helpers_1.fromCents)(data.remainingBalanceCents) : Number(data.remainingBalance || 0),
            };
        });
    }
    async createInvoice(invoiceData, items) {
        const tenantId = invoiceData.tenantId || 'tenant-test-001';
        const invRef = invoiceData.id ? this.db.collection('tenants').doc(tenantId).collection('invoices').doc(invoiceData.id) : this.db.collection('tenants').doc(tenantId).collection('invoices').doc();
        const batch = this.db.batch();
        const payload = {
            ...invoiceData,
            id: invRef.id,
            tenantId,
            totalAmountCents: (0, migration_helpers_1.toCents)(invoiceData.totalAmount),
            paidAmountCents: (0, migration_helpers_1.toCents)(invoiceData.paidAmount || 0),
            remainingBalanceCents: (0, migration_helpers_1.toCents)(invoiceData.remainingBalance || invoiceData.totalAmount),
            invoiceDate: (0, migration_helpers_1.formatDateISO)(invoiceData.invoiceDate),
            dueDate: (0, migration_helpers_1.formatDateISO)(invoiceData.dueDate),
        };
        batch.set(invRef, payload, { merge: true });
        if (items && items.length > 0) {
            items.forEach((item) => {
                const itemRef = item.id ? invRef.collection('items').doc(item.id) : invRef.collection('items').doc();
                batch.set(itemRef, {
                    ...item,
                    id: itemRef.id,
                    invoiceId: invRef.id,
                    amountCents: (0, migration_helpers_1.toCents)(item.amount),
                    tenantId,
                }, { merge: true });
            });
        }
        await batch.commit();
        return payload;
    }
    async updateInvoiceStatus(id, status, paidAmount) {
        const snap = await this.db.collectionGroup('invoices').where('id', '==', id).limit(1).get();
        if (snap.empty)
            return null;
        const doc = snap.docs[0];
        const data = doc.data();
        const updatePayload = { status };
        if (paidAmount !== undefined) {
            updatePayload.paidAmountCents = (0, migration_helpers_1.toCents)(paidAmount);
            updatePayload.paidAmount = paidAmount;
            const totalCents = data.totalAmountCents !== undefined ? data.totalAmountCents : (0, migration_helpers_1.toCents)(data.totalAmount || 0);
            updatePayload.remainingBalanceCents = Math.max(0, totalCents - (0, migration_helpers_1.toCents)(paidAmount));
            updatePayload.remainingBalance = (0, migration_helpers_1.fromCents)(updatePayload.remainingBalanceCents);
        }
        await doc.ref.set(updatePayload, { merge: true });
        return { id: doc.id, ...data, ...updatePayload };
    }
    async createPayment(paymentData) {
        const tenantId = paymentData.tenantId || 'tenant-test-001';
        const ref = paymentData.id
            ? this.db.collection('tenants').doc(tenantId).collection('payments').doc(paymentData.id)
            : this.db.collection('tenants').doc(tenantId).collection('payments').doc();
        const payload = {
            ...paymentData,
            id: ref.id,
            tenantId,
            amount: Number(paymentData.amount || 0),
            amountCents: (0, migration_helpers_1.toCents)(paymentData.amount || 0),
            createdAt: paymentData.createdAt || new Date().toISOString(),
        };
        await ref.set(payload, { merge: true });
        return payload;
    }
    async findPaymentById(id, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        const doc = await this.db.collection('tenants').doc(tid).collection('payments').doc(id).get();
        if (doc.exists)
            return { id: doc.id, ...doc.data() };
        const snap = await this.db.collectionGroup('payments').where('id', '==', id).limit(1).get();
        if (!snap.empty) {
            return { id: snap.docs[0].id, ...snap.docs[0].data() };
        }
        return null;
    }
    async getRecentPayments(tenantId, limit = 50) {
        const tid = tenantId || 'tenant-test-001';
        const snap = await this.db.collection('tenants').doc(tid).collection('payments').limit(limit).get();
        const studentIds = Array.from(new Set(snap.docs.map(doc => doc.data().studentId).filter(Boolean)));
        const studentMap = new Map();
        if (studentIds.length > 0) {
            await Promise.all(studentIds.map(async (sid) => {
                try {
                    const sDoc = await this.db.collection('studentProfiles').doc(sid).get();
                    if (sDoc.exists) {
                        const sData = sDoc.data() || {};
                        let uData = null;
                        if (sData.userId) {
                            const uDoc = await this.db.collection('users').doc(sData.userId).get();
                            if (uDoc.exists)
                                uData = uDoc.data();
                        }
                        const sName = uData?.name || sData.name || sData.studentName || `${sData.firstName || ''} ${sData.lastName || ''}`.trim() || 'Student Record';
                        studentMap.set(sid, {
                            name: sName,
                            rollNo: sData.rollNo || sData.rollNumber || 'STU-1844',
                        });
                    }
                }
                catch (err) { }
            }));
        }
        return snap.docs.map((doc) => {
            const data = doc.data();
            const sInfo = studentMap.get(data.studentId) || { name: 'Student Record', rollNo: 'STU-1844' };
            const amountVal = data.amountCents !== undefined ? (0, migration_helpers_1.fromCents)(data.amountCents) : Number(data.amount || 0);
            const createdAtISO = data.createdAt || data.paymentDate || new Date().toISOString();
            const dateObj = new Date(createdAtISO);
            const dateStr = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN');
            return {
                id: doc.id,
                ...data,
                amount: amountVal,
                totalAmount: amountVal,
                name: sInfo.name,
                studentName: sInfo.name,
                rollNo: sInfo.rollNo,
                dateStr,
                paymentDate: createdAtISO,
                status: data.status || 'SUCCESS',
                paymentMethod: data.paymentMethod || 'CASH',
            };
        });
    }
    async updateStudentLedger(tenantId, studentId, paidAmount, remainingBalance, status) {
        if (!studentId)
            return;
        try {
            const sRef = this.db.collection('studentProfiles').doc(studentId);
            await sRef.set({
                outstandingAmount: remainingBalance,
                totalPendingBalance: remainingBalance,
                totalPaidAmount: paidAmount,
                financialStatus: status,
                updatedAt: new Date().toISOString(),
            }, { merge: true });
        }
        catch (err) {
            console.warn('Failed to update student profile ledger in Firestore:', err);
        }
    }
    async findExpensesByTenant(tenantId) {
        const snap = await this.db.collection('tenants').doc(tenantId).collection('expenses').get();
        return snap.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                amount: data.amountCents !== undefined ? (0, migration_helpers_1.fromCents)(data.amountCents) : Number(data.amount || 0),
            };
        });
    }
    async createExpense(data) {
        const tenantId = data.tenantId || 'tenant-test-001';
        const ref = data.id ? this.db.collection('tenants').doc(tenantId).collection('expenses').doc(data.id) : this.db.collection('tenants').doc(tenantId).collection('expenses').doc();
        const payload = {
            ...data,
            id: ref.id,
            tenantId,
            amountCents: (0, migration_helpers_1.toCents)(data.amount),
            date: (0, migration_helpers_1.formatDateISO)(data.date),
        };
        await ref.set(payload, { merge: true });
        return payload;
    }
    async updateExpense(id, data, tenantId) {
        const tid = tenantId || data.tenantId || 'tenant-test-001';
        const ref = this.db.collection('tenants').doc(tid).collection('expenses').doc(id);
        const payload = {
            ...data,
            updatedAt: new Date().toISOString(),
        };
        if (data.amount !== undefined) {
            payload.amountCents = (0, migration_helpers_1.toCents)(data.amount);
        }
        await ref.set(payload, { merge: true });
        const doc = await ref.get();
        return { id: doc.id, ...doc.data() };
    }
    async deleteExpense(id, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        const ref = this.db.collection('tenants').doc(tid).collection('expenses').doc(id);
        await ref.delete();
        return { success: true, id };
    }
    async createFeeProducts(productNames, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        const batch = this.db.batch();
        const created = [];
        for (const name of productNames || []) {
            if (!name || !name.toString().trim())
                continue;
            const ref = this.db.collection('tenants').doc(tid).collection('feeProducts').doc();
            const payload = {
                id: ref.id,
                name: name.toString().trim(),
                tenantId: tid,
                createdAt: new Date().toISOString(),
            };
            batch.set(ref, payload, { merge: true });
            created.push(payload);
        }
        await batch.commit();
        return created;
    }
    async getAllFeeProducts(tenantId) {
        const tid = tenantId || 'tenant-test-001';
        const snap = await this.db.collection('tenants').doc(tid).collection('feeProducts').get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async updateFeeProduct(id, name, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        const ref = this.db.collection('tenants').doc(tid).collection('feeProducts').doc(id);
        const payload = { name: name.trim(), updatedAt: new Date().toISOString() };
        await ref.set(payload, { merge: true });
        return { id, name, tenantId: tid };
    }
    async deleteFeeProduct(id, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        const ref = this.db.collection('tenants').doc(tid).collection('feeProducts').doc(id);
        await ref.delete();
        return { id, success: true };
    }
    async savePriceBook(classId, academicYearId, priceItems, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        const batch = this.db.batch();
        const cleanItems = (priceItems || []).map((item) => {
            const ref = item.id ? this.db.collection('tenants').doc(tid).collection('priceBooks').doc(item.id) : this.db.collection('tenants').doc(tid).collection('priceBooks').doc();
            const payload = {
                id: ref.id,
                tenantId: tid,
                classId,
                academicYearId,
                productId: item.productId,
                price: Number(item.price || 0),
                selected: Boolean(item.selected),
                updatedAt: new Date().toISOString(),
            };
            batch.set(ref, payload, { merge: true });
            return payload;
        });
        await batch.commit();
        return { success: true, items: cleanItems };
    }
    async getPriceBook(classId, academicYearId, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        let query = this.db.collection('tenants').doc(tid).collection('priceBooks');
        if (classId)
            query = query.where('classId', '==', classId);
        if (academicYearId)
            query = query.where('academicYearId', '==', academicYearId);
        const snap = await query.get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
};
exports.FirestoreBillingRepository = FirestoreBillingRepository;
exports.FirestoreBillingRepository = FirestoreBillingRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], FirestoreBillingRepository);
//# sourceMappingURL=firestore-billing.repository.js.map