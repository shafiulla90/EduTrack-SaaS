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
exports.AcademicsController = void 0;
const common_1 = require("@nestjs/common");
const academics_service_1 = require("./academics.service");
const swagger_1 = require("@nestjs/swagger");
let AcademicsController = class AcademicsController {
    constructor(academicsService) {
        this.academicsService = academicsService;
    }
    async createYear(name, startDate, endDate, isActive, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.academicsService.createAcademicYear(name, startDate, endDate, isActive, tenantId);
    }
    async getYears(req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.academicsService.getAcademicYears(tenantId);
    }
    async toggleYearActive(id, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.academicsService.toggleAcademicYearActive(id, tenantId);
    }
    async setYearActive(id, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.academicsService.toggleAcademicYearActive(id, tenantId);
    }
    async createClass(name, academicYearId, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.academicsService.createClass(name, academicYearId, tenantId);
    }
    async getClasses(academicYearId, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.academicsService.getClasses(academicYearId, tenantId);
    }
    async getClassStudentCount(id) {
        return this.academicsService.getClassStudentCount(id);
    }
    async deleteClass(id) {
        return this.academicsService.deleteClass(id);
    }
    async createSection(name, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.academicsService.createSection(name, tenantId);
    }
    async getSections(req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.academicsService.getSections(tenantId);
    }
    async deleteSection(id) {
        return this.academicsService.deleteSection(id);
    }
    async createClassSection(classId, sectionId, teacherId, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.academicsService.createClassSection(classId, sectionId, teacherId, tenantId);
    }
    async getClassSections(req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.academicsService.getClassSections(tenantId);
    }
    async createSubject(name, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.academicsService.createSubject(name, tenantId);
    }
    async getSubjects(req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.academicsService.getSubjects(tenantId);
    }
    async deleteSubject(id) {
        return this.academicsService.deleteSubject(id);
    }
    async addSubjectToClassSection(classSectionId, subjectId) {
        return this.academicsService.addSubjectToClassSection(classSectionId, subjectId);
    }
    async getClassSectionSubjects(classSectionId) {
        return this.academicsService.getClassSubjects(classSectionId);
    }
    async removeSubjectFromClassSection(classSectionId, subjectId) {
        return this.academicsService.removeSubjectFromClassSection(classSectionId, subjectId);
    }
};
exports.AcademicsController = AcademicsController;
__decorate([
    (0, common_1.Post)('academic-years'),
    (0, swagger_1.ApiOperation)({ summary: 'Create new academic year term' }),
    __param(0, (0, common_1.Body)('name')),
    __param(1, (0, common_1.Body)('startDate')),
    __param(2, (0, common_1.Body)('endDate')),
    __param(3, (0, common_1.Body)('isActive')),
    __param(4, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Boolean, Object]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "createYear", null);
__decorate([
    (0, common_1.Get)('academic-years'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all academic year terms' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "getYears", null);
__decorate([
    (0, common_1.Patch)('academic-years/:id/toggle'),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle active status of academic year' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "toggleYearActive", null);
__decorate([
    (0, common_1.Patch)('academic-years/:id/active'),
    (0, swagger_1.ApiOperation)({ summary: 'Set active status of academic year' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "setYearActive", null);
__decorate([
    (0, common_1.Post)('classes'),
    (0, swagger_1.ApiOperation)({ summary: 'Create class' }),
    __param(0, (0, common_1.Body)('name')),
    __param(1, (0, common_1.Body)('academicYearId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "createClass", null);
__decorate([
    (0, common_1.Get)('classes'),
    (0, swagger_1.ApiOperation)({ summary: 'Get classes' }),
    __param(0, (0, common_1.Query)('academicYearId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "getClasses", null);
__decorate([
    (0, common_1.Get)('classes/:id/student-count'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "getClassStudentCount", null);
__decorate([
    (0, common_1.Delete)('classes/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "deleteClass", null);
__decorate([
    (0, common_1.Post)('sections'),
    __param(0, (0, common_1.Body)('name')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "createSection", null);
__decorate([
    (0, common_1.Get)('sections'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "getSections", null);
__decorate([
    (0, common_1.Delete)('sections/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "deleteSection", null);
__decorate([
    (0, common_1.Post)('class-sections'),
    __param(0, (0, common_1.Body)('classId')),
    __param(1, (0, common_1.Body)('sectionId')),
    __param(2, (0, common_1.Body)('teacherId')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "createClassSection", null);
__decorate([
    (0, common_1.Get)('class-sections'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "getClassSections", null);
__decorate([
    (0, common_1.Post)('subjects'),
    __param(0, (0, common_1.Body)('name')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "createSubject", null);
__decorate([
    (0, common_1.Get)('subjects'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "getSubjects", null);
__decorate([
    (0, common_1.Delete)('subjects/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "deleteSubject", null);
__decorate([
    (0, common_1.Post)('class-sections/:classSectionId/subjects'),
    __param(0, (0, common_1.Param)('classSectionId')),
    __param(1, (0, common_1.Body)('subjectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "addSubjectToClassSection", null);
__decorate([
    (0, common_1.Get)('class-sections/:classSectionId/subjects'),
    __param(0, (0, common_1.Param)('classSectionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "getClassSectionSubjects", null);
__decorate([
    (0, common_1.Delete)('class-sections/:classSectionId/subjects/:subjectId'),
    __param(0, (0, common_1.Param)('classSectionId')),
    __param(1, (0, common_1.Param)('subjectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "removeSubjectFromClassSection", null);
exports.AcademicsController = AcademicsController = __decorate([
    (0, swagger_1.ApiTags)('Academics'),
    (0, common_1.Controller)('academics'),
    __metadata("design:paramtypes", [academics_service_1.AcademicsService])
], AcademicsController);
//# sourceMappingURL=academics.controller.js.map