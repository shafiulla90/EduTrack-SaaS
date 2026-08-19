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
exports.ExamsService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../database/firebase.service");
let ExamsService = class ExamsService {
    constructor(examRepo, firebase) {
        this.examRepo = examRepo;
        this.firebase = firebase;
    }
    get db() {
        return this.firebase.getFirestore();
    }
    async getSubjects(tenantId) {
        const tid = tenantId || 'tenant-test-001';
        try {
            const snap = await this.db.collection('tenants').doc(tid).collection('subjects').get();
            if (!snap.empty) {
                return snap.docs.map(d => ({ id: d.id, ...d.data() }));
            }
        }
        catch (e) {
            console.error('Failed to load subjects:', e);
        }
        return [
            { id: 'sub-1', name: 'Mathematics', code: 'MATH101' },
            { id: 'sub-2', name: 'Science', code: 'SCI101' },
            { id: 'sub-3', name: 'English', code: 'ENG101' },
            { id: 'sub-4', name: 'Social Studies', code: 'SST101' },
            { id: 'sub-5', name: 'Computer Science', code: 'CS101' },
            { id: 'sub-6', name: 'Hindi', code: 'HIN101' },
        ];
    }
    async getComponents(tenantId) {
        return [
            { id: 'comp-1', name: 'Theory', weightage: 80 },
            { id: 'comp-2', name: 'Practical', weightage: 20 },
            { id: 'comp-3', name: 'Assignment', weightage: 10 },
        ];
    }
    async getMarksEntryRoster(tenantId, subjectId, examName, classSectionId, subjectType) {
        const tid = tenantId || 'tenant-test-001';
        let students = [];
        try {
            const snap = await this.db.collection('tenants').doc(tid).collection('studentProfiles').get();
            students = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
        catch (e) {
            console.error('Failed to load students for marks entry:', e);
        }
        let existingMarksMap = {};
        try {
            const marksSnap = await this.db
                .collection('tenants')
                .doc(tid)
                .collection('examMarks')
                .where('examName', '==', examName)
                .where('subjectId', '==', subjectId)
                .get();
            marksSnap.docs.forEach(doc => {
                const d = doc.data();
                if (d.studentId)
                    existingMarksMap[d.studentId] = d;
            });
        }
        catch (e) {
            console.error('Failed to load existing marks:', e);
        }
        const roster = students.map((s) => {
            const existing = existingMarksMap[s.id] || {};
            return {
                studentId: s.id,
                rollNo: s.rollNo || s.admissionNo || 'N/A',
                studentName: s.name || (s.firstName ? `${s.firstName} ${s.lastName || ''}` : 'Student'),
                marksObtained: existing.marksObtained !== undefined ? existing.marksObtained : null,
                remarks: existing.remarks || '',
                status: existing.status || 'PRESENT',
            };
        });
        return {
            roster,
            config: {
                maxMarks: 100,
                passingPercentage: 35,
            },
        };
    }
    async saveRosterMarks(tenantId, body) {
        const tid = tenantId || 'tenant-test-001';
        const { subjectId, examName, classSectionId, subjectType, marksSheet } = body;
        const batch = this.db.batch();
        let count = 0;
        for (const studentId of Object.keys(marksSheet || {})) {
            const item = marksSheet[studentId];
            const docId = `${studentId}_${examName}_${subjectId}`.replace(/[^a-zA-Z0-9_-]/g, '_');
            const docRef = this.db.collection('tenants').doc(tid).collection('examMarks').doc(docId);
            const payload = {
                id: docId,
                tenantId: tid,
                studentId,
                subjectId,
                examName,
                classSectionId,
                subjectType: subjectType || 'Theory',
                marksObtained: item.score !== '' ? Number(item.score) : null,
                remarks: item.remarks || '',
                updatedAt: new Date().toISOString(),
            };
            batch.set(docRef, payload, { merge: true });
            count++;
        }
        await batch.commit();
        return { success: true, count, message: 'Marks saved successfully.' };
    }
    async getStudentReportCard(tenantId, studentId) {
        const tid = tenantId || 'tenant-test-001';
        let student = null;
        try {
            const doc = await this.db.collection('tenants').doc(tid).collection('studentProfiles').doc(studentId).get();
            if (doc.exists)
                student = { id: doc.id, ...doc.data() };
        }
        catch (e) { }
        let marks = [];
        try {
            const snap = await this.db.collection('tenants').doc(tid).collection('examMarks').where('studentId', '==', studentId).get();
            marks = snap.docs.map(d => d.data());
        }
        catch (e) { }
        return {
            success: true,
            student: student || { id: studentId, name: 'Student' },
            marks,
            academicYear: '2026-2027',
            summary: {
                totalMarks: 600,
                obtainedMarks: 512,
                percentage: 85.3,
                grade: 'A+',
                rank: 1,
            },
        };
    }
    async createExam(name, type, classSectionId, date, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        if (this.examRepo.createExam) {
            return this.examRepo.createExam({ name, type, classSectionId, date, tenantId: tid });
        }
        return { id: 'exam-' + Date.now(), name, type, classSectionId, date };
    }
    async getExams(classSectionId, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        if (classSectionId) {
            return this.examRepo.findExamsByClassSection(classSectionId);
        }
        if (this.examRepo.findExamsByTenant) {
            return this.examRepo.findExamsByTenant(tid);
        }
        return [];
    }
    async getExamTypes(tenantId) {
        const tid = tenantId || 'tenant-test-001';
        if (this.examRepo.findExamTypesByTenant) {
            const types = await this.examRepo.findExamTypesByTenant(tid);
            if (types && types.length > 0)
                return types;
        }
        return [
            { id: 'et-1', name: 'Unit Test' },
            { id: 'et-2', name: 'Mid Term' },
            { id: 'et-3', name: 'Final Exam' },
        ];
    }
    async createExamType(name, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        if (this.examRepo.createExamType) {
            return this.examRepo.createExamType(name, tid);
        }
        return { id: 'et-' + Date.now(), name };
    }
    async updateExamType(id, name, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        if (this.examRepo.updateExamType) {
            return this.examRepo.updateExamType(id, name, tid);
        }
        return { id, name };
    }
    async deleteExamType(id, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        if (this.examRepo.deleteExamType) {
            return this.examRepo.deleteExamType(id, tid);
        }
        return { success: true, id };
    }
    async saveMarks(marks, examName, classSectionId, subjectId, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        const saved = [];
        for (const item of marks || []) {
            const payload = {
                ...item,
                examName,
                classSectionId,
                subjectId,
                tenantId: tid,
            };
            const res = await this.examRepo.upsertExamMark(payload);
            saved.push(res);
        }
        return { success: true, count: saved.length, marks: saved };
    }
    async getGradesReport(classSectionId, examName) {
        return { classSectionId, examName, report: [] };
    }
};
exports.ExamsService = ExamsService;
exports.ExamsService = ExamsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IExamRepository')),
    __metadata("design:paramtypes", [Object, firebase_service_1.FirebaseService])
], ExamsService);
//# sourceMappingURL=exams.service.js.map