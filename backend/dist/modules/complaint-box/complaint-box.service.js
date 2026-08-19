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
exports.ComplaintBoxService = void 0;
const common_1 = require("@nestjs/common");
let ComplaintBoxService = class ComplaintBoxService {
    constructor(opsRepo) {
        this.opsRepo = opsRepo;
    }
    async getCurrentTeacher() {
        return { id: 'teacher-current', name: 'Current Teacher' };
    }
    async getStudentClasses() {
        return [];
    }
    async getTeachers() {
        return [];
    }
    async getStudentsByClass(classSectionId) {
        return [];
    }
    async searchStudents(searchTerm, classId, sectionId) {
        return [];
    }
    async submitStudentBehavior(dto, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        return this.opsRepo.createComplaint({ ...dto, tenantId: tid });
    }
    async getAcademicYears() {
        return [{ id: 'ay-current', name: '2025-2026' }];
    }
    async getPendingCases(academicYear, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        return this.opsRepo.findComplaintsByTenant(tid);
    }
    async getStudentCases(studentId, academicYear) {
        return [];
    }
    async updateCaseStatus(caseId, dto) {
        return this.opsRepo.updateComplaint(caseId, dto);
    }
    async getStudentStats(studentId) {
        return { total: 0, resolved: 0, pending: 0 };
    }
    async updateBehavior(caseId, dto) {
        return this.opsRepo.updateComplaint(caseId, dto);
    }
    async deleteBehavior(caseId) {
        return { success: true, caseId };
    }
    async getParentComplaints(status, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        return this.opsRepo.findComplaintsByTenant(tid);
    }
    async updateParentComplaintStatus(id, data) {
        return this.opsRepo.updateComplaint(id, data);
    }
};
exports.ComplaintBoxService = ComplaintBoxService;
exports.ComplaintBoxService = ComplaintBoxService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IOperationsRepository')),
    __metadata("design:paramtypes", [Object])
], ComplaintBoxService);
//# sourceMappingURL=complaint-box.service.js.map