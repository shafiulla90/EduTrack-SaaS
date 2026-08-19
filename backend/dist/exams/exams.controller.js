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
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let ExamsController = class ExamsController {
    constructor(examsService) {
        this.examsService = examsService;
    }
    async create(name, type, classSectionId, date) {
        return this.examsService.createExam(name, type, classSectionId, date);
    }
    async getAll(classSectionId) {
        return this.examsService.getExams(classSectionId);
    }
    async getClasses(req) {
        return this.examsService.getClasses(req.user.sub, req.user.role);
    }
    async getSubjects(req) {
        return this.examsService.getSubjects(req.user.sub, req.user.role);
    }
    async getExamTypes() {
        return this.examsService.getExamTypes();
    }
    async getExamTypesManage() {
        return this.examsService.getExamTypesManage();
    }
    async createExamType(name) {
        return this.examsService.createExamType(name);
    }
    async updateExamType(id, name) {
        return this.examsService.updateExamType(id, name);
    }
    async deleteExamType(id) {
        return this.examsService.deleteExamType(id);
    }
    async getMarksEntryList(req, subjectId, examName, classSectionId, examId, subjectType) {
        return this.examsService.getStudentsForMarksEntry(subjectId, examName, classSectionId, examId, req.user.sub, req.user.role, subjectType);
    }
    async saveMarks(req, marks, examName, classSectionId, subjectId, subjectType) {
        if (!Array.isArray(marks)) {
            throw new Error('Marks must be an array');
        }
        return this.examsService.saveMarks(marks, examName, classSectionId, subjectId, req.user.sub, req.user.role, subjectType);
    }
    async getReport(classSectionId, examName) {
        return this.examsService.getGradesReport(classSectionId, examName);
    }
};
exports.ExamsController = ExamsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)('name')),
    __param(1, (0, common_1.Body)('type')),
    __param(2, (0, common_1.Body)('classSectionId')),
    __param(3, (0, common_1.Body)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Date]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('classSectionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('classes'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "getClasses", null);
__decorate([
    (0, common_1.Get)('subjects'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "getSubjects", null);
__decorate([
    (0, common_1.Get)('exam-types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "getExamTypes", null);
__decorate([
    (0, common_1.Get)('exam-types/manage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "getExamTypesManage", null);
__decorate([
    (0, common_1.Post)('exam-types'),
    __param(0, (0, common_1.Body)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "createExamType", null);
__decorate([
    (0, common_1.Put)('exam-types/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "updateExamType", null);
__decorate([
    (0, common_1.Delete)('exam-types/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "deleteExamType", null);
__decorate([
    (0, common_1.Get)('marks-entry'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('subjectId')),
    __param(2, (0, common_1.Query)('examName')),
    __param(3, (0, common_1.Query)('classSectionId')),
    __param(4, (0, common_1.Query)('examId')),
    __param(5, (0, common_1.Query)('subjectType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "getMarksEntryList", null);
__decorate([
    (0, common_1.Post)('save-marks'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('marks')),
    __param(2, (0, common_1.Body)('examName')),
    __param(3, (0, common_1.Body)('classSectionId')),
    __param(4, (0, common_1.Body)('subjectId')),
    __param(5, (0, common_1.Body)('subjectType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "saveMarks", null);
__decorate([
    (0, common_1.Get)('grades-report'),
    __param(0, (0, common_1.Query)('classSectionId')),
    __param(1, (0, common_1.Query)('examName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ExamsController.prototype, "getReport", null);
exports.ExamsController = ExamsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.TEACHER),
    (0, common_1.Controller)('exams'),
    __metadata("design:paramtypes", [exams_service_1.ExamsService])
], ExamsController);
//# sourceMappingURL=exams.controller.js.map