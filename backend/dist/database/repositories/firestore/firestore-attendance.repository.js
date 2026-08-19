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
exports.FirestoreAttendanceRepository = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase.service");
const migration_helpers_1 = require("../../../common/utils/migration-helpers");
let FirestoreAttendanceRepository = class FirestoreAttendanceRepository {
    constructor(firebase) {
        this.firebase = firebase;
    }
    get db() {
        return this.firebase.getFirestore();
    }
    async findSessionsByClassSection(classSectionIdOrTenantId, startDate, endDate) {
        const tid = classSectionIdOrTenantId || 'tenant-test-001';
        let snap;
        try {
            const tenantSnap = await this.db.collection('tenants').doc(tid).collection('attendanceSessions').get();
            if (!tenantSnap.empty) {
                snap = tenantSnap;
            }
            else {
                snap = await this.db.collectionGroup('attendanceSessions').where('classSectionId', '==', classSectionIdOrTenantId).get();
            }
        }
        catch {
            snap = await this.db.collectionGroup('attendanceSessions').get();
        }
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async findSessionById(id) {
        const snap = await this.db.collectionGroup('attendanceSessions').where('id', '==', id).limit(1).get();
        if (snap.empty)
            return null;
        const doc = snap.docs[0];
        const sessionData = { id: doc.id, ...doc.data() };
        const attendancesSnap = await doc.ref.collection('attendances').get();
        return {
            ...sessionData,
            Attendance: attendancesSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        };
    }
    async findAttendanceByStudent(studentId) {
        const snap = await this.db.collectionGroup('attendances').where('studentId', '==', studentId).get();
        return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }
    async createSessionWithAttendance(sessionData, attendanceRecords) {
        const tenantId = sessionData.tenantId || 'tenant-test-001';
        const sessionRef = sessionData.id ? this.db.collection('tenants').doc(tenantId).collection('attendanceSessions').doc(sessionData.id) : this.db.collection('tenants').doc(tenantId).collection('attendanceSessions').doc();
        const batch = this.db.batch();
        const formattedSession = {
            ...sessionData,
            id: sessionRef.id,
            date: (0, migration_helpers_1.formatDateISO)(sessionData.date),
            tenantId,
        };
        batch.set(sessionRef, formattedSession, { merge: true });
        if (attendanceRecords && attendanceRecords.length > 0) {
            attendanceRecords.forEach((rec) => {
                const attRef = rec.id ? sessionRef.collection('attendances').doc(rec.id) : sessionRef.collection('attendances').doc();
                batch.set(attRef, { ...rec, id: attRef.id, attendanceSessionId: sessionRef.id, tenantId }, { merge: true });
            });
        }
        await batch.commit();
        return formattedSession;
    }
    async updateAttendance(id, status, reason) {
        const snap = await this.db.collectionGroup('attendances').where('id', '==', id).limit(1).get();
        if (snap.empty)
            return null;
        const doc = snap.docs[0];
        const payload = { status };
        if (reason !== undefined)
            payload.reason = reason;
        await doc.ref.set(payload, { merge: true });
        return { id, ...doc.data(), ...payload };
    }
};
exports.FirestoreAttendanceRepository = FirestoreAttendanceRepository;
exports.FirestoreAttendanceRepository = FirestoreAttendanceRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], FirestoreAttendanceRepository);
//# sourceMappingURL=firestore-attendance.repository.js.map