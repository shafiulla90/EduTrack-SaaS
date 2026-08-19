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
exports.ExamConfigController = void 0;
const common_1 = require("@nestjs/common");
const exam_config_service_1 = require("./exam-config.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let ExamConfigController = class ExamConfigController {
    constructor(examConfigService) {
        this.examConfigService = examConfigService;
    }
    async listConfigs() {
        return this.examConfigService.listConfigs();
    }
    async resolveConfig(examType) {
        return this.examConfigService.resolveConfig(examType || '__global__');
    }
    getDefaults() {
        return { gradeRanges: this.examConfigService.getDefaultGradeRanges() };
    }
    async upsertConfig(examTypeName, passingPercentage, maxMarks, gradeRanges, classId, academicYearId, subjectConfigs) {
        return this.examConfigService.upsertConfig({
            examTypeName: examTypeName ?? null,
            passingPercentage: Number(passingPercentage),
            maxMarks: maxMarks ? Number(maxMarks) : undefined,
            gradeRanges,
            classId,
            academicYearId,
            subjectConfigs,
        });
    }
    async deleteConfig(id) {
        return this.examConfigService.deleteConfig(id);
    }
    async listComponents() {
        return this.examConfigService.listComponents();
    }
    async createComponent(name) {
        return this.examConfigService.createComponent(name);
    }
    async deleteComponent(id) {
        return this.examConfigService.deleteComponent(id);
    }
    async getExamSubjects(examId) {
        if (!examId)
            return [];
        return this.examConfigService.getExamSubjects(examId);
    }
    async updateExamSubject(id, dto) {
        return this.examConfigService.updateExamSubject(id, dto);
    }
};
exports.ExamConfigController = ExamConfigController;
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ExamConfigController.prototype, "listConfigs", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.TEACHER, client_1.Role.PARENT),
    (0, common_1.Get)('resolve'),
    __param(0, (0, common_1.Query)('examType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExamConfigController.prototype, "resolveConfig", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Get)('defaults'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExamConfigController.prototype, "getDefaults", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)('examTypeName')),
    __param(1, (0, common_1.Body)('passingPercentage')),
    __param(2, (0, common_1.Body)('maxMarks')),
    __param(3, (0, common_1.Body)('gradeRanges')),
    __param(4, (0, common_1.Body)('classId')),
    __param(5, (0, common_1.Body)('academicYearId')),
    __param(6, (0, common_1.Body)('subjectConfigs')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, Array, String, String, Array]),
    __metadata("design:returntype", Promise)
], ExamConfigController.prototype, "upsertConfig", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExamConfigController.prototype, "deleteConfig", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.TEACHER),
    (0, common_1.Get)('components'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ExamConfigController.prototype, "listComponents", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Post)('components'),
    __param(0, (0, common_1.Body)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExamConfigController.prototype, "createComponent", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Delete)('components/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExamConfigController.prototype, "deleteComponent", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.TEACHER),
    (0, common_1.Get)('exam-subjects'),
    __param(0, (0, common_1.Query)('examId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExamConfigController.prototype, "getExamSubjects", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.TEACHER),
    (0, common_1.Post)('exam-subjects/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExamConfigController.prototype, "updateExamSubject", null);
exports.ExamConfigController = ExamConfigController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('exam-config'),
    __metadata("design:paramtypes", [exam_config_service_1.ExamConfigService])
], ExamConfigController);
//# sourceMappingURL=exam-config.controller.js.map