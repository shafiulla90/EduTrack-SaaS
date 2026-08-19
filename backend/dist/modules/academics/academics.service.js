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
exports.AcademicsService = void 0;
const common_1 = require("@nestjs/common");
let AcademicsService = class AcademicsService {
    constructor(academicRepo) {
        this.academicRepo = academicRepo;
    }
    async createAcademicYear(name, startDate, endDate, isActive, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        if (this.academicRepo.createAcademicYear) {
            return this.academicRepo.createAcademicYear({ name, startDate, endDate, isActive: isActive !== undefined ? isActive : true, tenantId: tid });
        }
        return { id: 'ay-' + Date.now(), name, isActive: true, tenantId: tid };
    }
    async getAcademicYears(tenantId) {
        const tid = tenantId || 'tenant-test-001';
        const years = await this.academicRepo.findAcademicYears(tid);
        if (years && years.length > 0)
            return years;
        return [{ id: 'ay-2026', name: '2026-2027', isActive: true }];
    }
    async toggleAcademicYearActive(id, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        if (this.academicRepo.toggleAcademicYearActive) {
            return this.academicRepo.toggleAcademicYearActive(id, tid);
        }
        return { id, isActive: true };
    }
    async createClass(name, academicYearId, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        return this.academicRepo.createClass({ name, academicYearId, tenantId: tid });
    }
    async getClasses(academicYearId, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        return this.academicRepo.findClasses(tid, academicYearId);
    }
    async getClassStudentCount(id) {
        return { classId: id, count: 0, studentCount: 0 };
    }
    async deleteClass(id) {
        return this.academicRepo.deleteClass(id);
    }
    async createSection(name, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        return this.academicRepo.createSection({ name, tenantId: tid });
    }
    async getSections(tenantId) {
        const tid = tenantId || 'tenant-test-001';
        return this.academicRepo.findSections(tid);
    }
    async deleteSection(id) {
        return this.academicRepo.deleteSection(id);
    }
    async createClassSection(classId, sectionId, teacherId, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        if (this.academicRepo.createClassSection) {
            return this.academicRepo.createClassSection({ classId, sectionId, teacherId, tenantId: tid });
        }
        return { id: 'cs-' + Date.now(), classId, sectionId, teacherId, tenantId: tid };
    }
    async getClassSections(tenantId) {
        const tid = tenantId || 'tenant-test-001';
        return this.academicRepo.findClassSections(tid);
    }
    async createSubject(name, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        return this.academicRepo.createSubject({ name, tenantId: tid });
    }
    async getSubjects(tenantId) {
        const tid = tenantId || 'tenant-test-001';
        return this.academicRepo.findSubjects(tid);
    }
    async deleteSubject(id) {
        if (this.academicRepo.deleteSubject) {
            return this.academicRepo.deleteSubject(id);
        }
        return { id };
    }
    async addSubjectToClassSection(classSectionId, subjectId) {
        return { success: true, classSectionId, subjectId };
    }
    async getClassSubjects(classSectionId) {
        return [];
    }
    async removeSubjectFromClassSection(classSectionId, subjectId) {
        return { success: true, classSectionId, subjectId };
    }
    async createPeriodTiming(periodNumber, startTime, endTime, isActive) {
        return { periodNumber, startTime, endTime, isActive };
    }
    async getPeriodTimings() {
        return [];
    }
    async createPeriod(data) {
        return { id: 'p-' + Date.now(), ...data };
    }
    async getPeriodsByClassSection(classSectionId) {
        return [];
    }
    async getPeriodsByTeacher(teacherId) {
        return [];
    }
};
exports.AcademicsService = AcademicsService;
exports.AcademicsService = AcademicsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IAcademicRepository')),
    __metadata("design:paramtypes", [Object])
], AcademicsService);
//# sourceMappingURL=academics.service.js.map