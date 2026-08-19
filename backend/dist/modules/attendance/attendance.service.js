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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const firebase_service_1 = require("../../database/firebase.service");
let AttendanceService = class AttendanceService {
    constructor(attendanceRepo, studentRepo, teacherRepo, firebase) {
        this.attendanceRepo = attendanceRepo;
        this.studentRepo = studentRepo;
        this.teacherRepo = teacherRepo;
        this.firebase = firebase;
    }
    get db() {
        return this.firebase.getFirestore();
    }
    async getSession(tenantId, classSectionId, date) {
        const tid = tenantId || 'tenant-test-001';
        try {
            const docId = `${classSectionId}_${date}`.replace(/[^a-zA-Z0-9_-]/g, '_');
            const docRef = this.db.collection('tenants').doc(tid).collection('attendanceSessions').doc(docId);
            const snap = await docRef.get();
            if (snap.exists) {
                const data = snap.data();
                return {
                    sessionExists: true,
                    absentIds: data?.absentStudentIds || [],
                    presentCount: data?.presentCount || 0,
                    absentCount: data?.absentCount || 0,
                    totalStudents: data?.totalStudents || 0,
                };
            }
            const querySnap = await this.db
                .collection('tenants')
                .doc(tid)
                .collection('attendanceSessions')
                .where('classSectionId', '==', classSectionId)
                .where('date', '==', date)
                .limit(1)
                .get();
            if (!querySnap.empty) {
                const data = querySnap.docs[0].data();
                return {
                    sessionExists: true,
                    absentIds: data?.absentStudentIds || [],
                    presentCount: data?.presentCount || 0,
                    absentCount: data?.absentCount || 0,
                    totalStudents: data?.totalStudents || 0,
                };
            }
        }
        catch (err) {
            console.error('Error fetching attendance session:', err);
        }
        return { sessionExists: false, absentIds: [] };
    }
    async saveAttendance(tenantId, data) {
        const tid = tenantId || 'tenant-test-001';
        const docId = `${data.classSectionId}_${data.date}`.replace(/[^a-zA-Z0-9_-]/g, '_');
        const docRef = this.db.collection('tenants').doc(tid).collection('attendanceSessions').doc(docId);
        const payload = {
            id: docId,
            tenantId: tid,
            classSectionId: data.classSectionId,
            date: data.date,
            teacherId: data.teacherId || 'default-teacher',
            presentCount: data.presentCount || 0,
            absentCount: data.absentCount || 0,
            totalStudents: data.totalStudents || 0,
            absentStudentIds: data.absentStudentIds || [],
            sessionExists: true,
            updatedAt: new Date().toISOString(),
        };
        await docRef.set(payload, { merge: true });
        return { success: true, session: payload };
    }
    async getClassReport(tenantId, classSectionId, date) {
        const tid = tenantId || 'tenant-test-001';
        let query = this.db.collection('tenants').doc(tid).collection('attendanceSessions');
        if (classSectionId) {
            query = query.where('classSectionId', '==', classSectionId);
        }
        if (date) {
            query = query.where('date', '==', date);
        }
        const snap = await query.get();
        const sessions = snap.docs.map(doc => doc.data());
        let totalStudentsSum = 0;
        let presentSum = 0;
        let absentSum = 0;
        sessions.forEach(s => {
            totalStudentsSum += s.totalStudents || 0;
            presentSum += s.presentCount || 0;
            absentSum += s.absentCount || 0;
        });
        const averagePercentage = totalStudentsSum > 0 ? ((presentSum / totalStudentsSum) * 100).toFixed(1) : '95.0';
        return {
            success: true,
            sessions,
            summary: {
                totalSessions: sessions.length,
                averagePercentage: Number(averagePercentage),
                totalPresent: presentSum,
                totalAbsent: absentSum,
            },
        };
    }
    async getHistory(tenantId, classSectionId) {
        const tid = tenantId || 'tenant-test-001';
        let query = this.db.collection('tenants').doc(tid).collection('attendanceSessions');
        if (classSectionId) {
            query = query.where('classSectionId', '==', classSectionId);
        }
        const snap = await query.limit(50).get();
        return snap.docs.map(doc => doc.data());
    }
    async create(tenantId, data) {
        const student = await this.studentRepo.findProfileById(data.studentId);
        if (!student) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        const dateObj = new Date(data.date);
        dateObj.setHours(0, 0, 0, 0);
        const classSectionId = student.classSectionId || 'default-section';
        let session = await this.attendanceRepo.findSessionById(classSectionId);
        if (!session) {
            session = await this.attendanceRepo.createSessionWithAttendance({
                id: (0, crypto_1.randomUUID)(),
                tenantId,
                date: dateObj,
                classSectionId,
                takenById: 'system-staff',
            }, [
                {
                    id: (0, crypto_1.randomUUID)(),
                    tenantId,
                    studentId: data.studentId,
                    status: data.status,
                },
            ]);
        }
        return session;
    }
    async findAll(tenantId) {
        return this.attendanceRepo.findSessionsByClassSection(tenantId);
    }
    async findOne(id, tenantId) {
        return this.attendanceRepo.findSessionById(id);
    }
    async findByStudent(studentId, tenantId) {
        return this.attendanceRepo.findAttendanceByStudent(studentId);
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IAttendanceRepository')),
    __param(1, (0, common_1.Inject)('IStudentRepository')),
    __param(2, (0, common_1.Inject)('ITeacherRepository')),
    __metadata("design:paramtypes", [Object, Object, Object, firebase_service_1.FirebaseService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map