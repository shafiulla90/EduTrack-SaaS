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
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let AcademicsController = class AcademicsController {
    constructor(academicsService) {
        this.academicsService = academicsService;
    }
    async createYear(name, startDate, endDate, isActive) {
        return this.academicsService.createAcademicYear(name, startDate, endDate, isActive);
    }
    async getYears() {
        return this.academicsService.getAcademicYears();
    }
    async toggleYearActive(id) {
        return this.academicsService.toggleAcademicYearActive(id);
    }
    async createClass(name, academicYearId) {
        return this.academicsService.createClass(name, academicYearId);
    }
    async getClasses(academicYearId) {
        return this.academicsService.getClasses(academicYearId);
    }
    async getClassStudentCount(id) {
        return this.academicsService.getClassStudentCount(id);
    }
    async deleteClass(id) {
        return this.academicsService.deleteClass(id);
    }
    async createSection(name) {
        return this.academicsService.createSection(name);
    }
    async getSections() {
        return this.academicsService.getSections();
    }
    async createClassSection(classId, sectionId, teacherId) {
        return this.academicsService.createClassSection(classId, sectionId, teacherId);
    }
    async getClassSections() {
        return this.academicsService.getClassSections();
    }
    async createSubject(name) {
        return this.academicsService.createSubject(name);
    }
    async getSubjects() {
        return this.academicsService.getSubjects();
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
    async createTiming(periodNumber, startTime, endTime, isActive) {
        return this.academicsService.createPeriodTiming(periodNumber, startTime, endTime, isActive);
    }
    async getTimings() {
        return this.academicsService.getPeriodTimings();
    }
    async createPeriod(data) {
        return this.academicsService.createPeriod(data);
    }
    async getPeriodsByClassSection(classSectionId) {
        return this.academicsService.getPeriodsByClassSection(classSectionId);
    }
    async getPeriodsByTeacher(teacherId) {
        return this.academicsService.getPeriodsByTeacher(teacherId);
    }
};
exports.AcademicsController = AcademicsController;
__decorate([
    (0, common_1.Post)('academic-years'),
    __param(0, (0, common_1.Body)('name')),
    __param(1, (0, common_1.Body)('startDate')),
    __param(2, (0, common_1.Body)('endDate')),
    __param(3, (0, common_1.Body)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Date,
        Date, Boolean]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "createYear", null);
__decorate([
    (0, common_1.Get)('academic-years'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "getYears", null);
__decorate([
    (0, common_1.Patch)('academic-years/:id/toggle'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "toggleYearActive", null);
__decorate([
    (0, common_1.Post)('classes'),
    __param(0, (0, common_1.Body)('name')),
    __param(1, (0, common_1.Body)('academicYearId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "createClass", null);
__decorate([
    (0, common_1.Get)('classes'),
    __param(0, (0, common_1.Query)('academicYearId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
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
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "createSection", null);
__decorate([
    (0, common_1.Get)('sections'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "getSections", null);
__decorate([
    (0, common_1.Post)('class-sections'),
    __param(0, (0, common_1.Body)('classId')),
    __param(1, (0, common_1.Body)('sectionId')),
    __param(2, (0, common_1.Body)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "createClassSection", null);
__decorate([
    (0, common_1.Get)('class-sections'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "getClassSections", null);
__decorate([
    (0, common_1.Post)('subjects'),
    __param(0, (0, common_1.Body)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "createSubject", null);
__decorate([
    (0, common_1.Get)('subjects'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "getSubjects", null);
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
__decorate([
    (0, common_1.Post)('period-timings'),
    __param(0, (0, common_1.Body)('periodNumber')),
    __param(1, (0, common_1.Body)('startTime')),
    __param(2, (0, common_1.Body)('endTime')),
    __param(3, (0, common_1.Body)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String, Boolean]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "createTiming", null);
__decorate([
    (0, common_1.Get)('period-timings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "getTimings", null);
__decorate([
    (0, common_1.Post)('periods'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "createPeriod", null);
__decorate([
    (0, common_1.Get)('class-sections/:classSectionId/periods'),
    __param(0, (0, common_1.Param)('classSectionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "getPeriodsByClassSection", null);
__decorate([
    (0, common_1.Get)('teachers/:teacherId/periods'),
    __param(0, (0, common_1.Param)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicsController.prototype, "getPeriodsByTeacher", null);
exports.AcademicsController = AcademicsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('academics'),
    __metadata("design:paramtypes", [academics_service_1.AcademicsService])
], AcademicsController);
//# sourceMappingURL=academics.controller.js.map