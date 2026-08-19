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
exports.ExamsController = void 0;
const common_1 = require("@nestjs/common");
const exams_service_1 = require("./exams.service");
const swagger_1 = require("@nestjs/swagger");
let ExamsController = class ExamsController {
    constructor(examsService) {
        this.examsService = examsService;
    }
    async getSubjects(req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.examsService.getSubjects(tenantId);
    }
    async getStudentReportCard(studentId, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.examsService.getStudentReportCard(tenantId, studentId);
    }
    async create(name, type, classSectionId, date, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.examsService.createExam(name, type, classSectionId, date, tenantId);
    }
    async getAll(classSectionId, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.examsService.getExams(classSectionId, tenantId);
    }
    async getExamTypes(req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.examsService.getExamTypes(tenantId);
    }
    async getExamTypesManage(req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.examsService.getExamTypes(tenantId);
    }
    async createExamType(name, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.examsService.createExamType(name, tenantId);
    }
    async updateExamType(id, name, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.examsService.updateExamType(id, name, tenantId);
    }
    async deleteExamType(id, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.examsService.deleteExamType(id, tenantId);
    }
    async saveMarks(marks, examName, classSectionId, subjectId, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.examsService.saveMarks(marks || [], examName, classSectionId, subjectId, tenantId);
    }
    async getReport(classSectionId, examName) {
        return this.examsService.getGradesReport(classSectionId, examName);
    }
};
exports.ExamsController = ExamsController;
__decorate([
    (0, common_1.Get)('subjects'),
    (0, swagger_1.ApiOperation)({ summary: 'Get exam subjects' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "getSubjects", null);
__decorate([
    (0, common_1.Get)('report-card/:studentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get student report card PDF data' }),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "getStudentReportCard", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create new exam' }),
    __param(0, (0, common_1.Body)('name')),
    __param(1, (0, common_1.Body)('type')),
    __param(2, (0, common_1.Body)('classSectionId')),
    __param(3, (0, common_1.Body)('date')),
    __param(4, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Date, Object]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all exams' }),
    __param(0, (0, common_1.Query)('classSectionId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('exam-types'),
    (0, swagger_1.ApiOperation)({ summary: 'Get exam types' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "getExamTypes", null);
__decorate([
    (0, common_1.Get)('exam-types/manage'),
    (0, swagger_1.ApiOperation)({ summary: 'Get exam types for management' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "getExamTypesManage", null);
__decorate([
    (0, common_1.Post)('exam-types'),
    (0, swagger_1.ApiOperation)({ summary: 'Create exam type' }),
    __param(0, (0, common_1.Body)('name')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "createExamType", null);
__decorate([
    (0, common_1.Put)('exam-types/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update exam type' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('name')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "updateExamType", null);
__decorate([
    (0, common_1.Delete)('exam-types/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete exam type' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "deleteExamType", null);
__decorate([
    (0, common_1.Post)('save-marks'),
    (0, swagger_1.ApiOperation)({ summary: 'Save exam marks' }),
    __param(0, (0, common_1.Body)('marks')),
    __param(1, (0, common_1.Body)('examName')),
    __param(2, (0, common_1.Body)('classSectionId')),
    __param(3, (0, common_1.Body)('subjectId')),
    __param(4, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "saveMarks", null);
__decorate([
    (0, common_1.Get)('grades-report'),
    (0, swagger_1.ApiOperation)({ summary: 'Get grades report' }),
    __param(0, (0, common_1.Query)('classSectionId')),
    __param(1, (0, common_1.Query)('examName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "getReport", null);
exports.ExamsController = ExamsController = __decorate([
    (0, swagger_1.ApiTags)('Exams'),
    (0, common_1.Controller)('exams'),
    __metadata("design:paramtypes", [exams_service_1.ExamsService])
], ExamsController);
//# sourceMappingURL=exams.controller.js.map