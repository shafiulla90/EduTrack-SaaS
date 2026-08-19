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
exports.StudentsController = void 0;
const common_1 = require("@nestjs/common");
const students_service_1 = require("./students.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let StudentsController = class StudentsController {
    constructor(studentsService) {
        this.studentsService = studentsService;
    }
    async create(data) {
        return this.studentsService.createStudent(data);
    }
    async search(search, classId, sectionId, academicYearId, page, limit) {
        const p = page ? parseInt(page, 10) : undefined;
        const l = limit ? parseInt(limit, 10) : undefined;
        return this.studentsService.searchStudents(search, classId, sectionId, academicYearId, p, l);
    }
    async getPromotionCandidates(sourceYearId, className, sectionName) {
        return this.studentsService.getPromotionCandidates(sourceYearId, className, sectionName);
    }
    async promote(studentIds, sourceYearId, targetYearId, targetClassName, targetSectionName) {
        return this.studentsService.promoteStudents({
            studentIds,
            sourceYearId,
            targetYearId,
            targetClassName,
            targetSectionName,
        });
    }
    async validatePromotion(studentIds, sourceYearId) {
        return this.studentsService.validatePromotion({
            studentIds,
            sourceYearId,
        });
    }
    async getParents() {
        return this.studentsService.getParents();
    }
    async getDetails(id, academicYearId) {
        return this.studentsService.getStudentDetails(id, academicYearId);
    }
    async updateStudent(id, data) {
        return this.studentsService.updateStudent(id, data);
    }
    async deleteStudent(id) {
        return this.studentsService.deleteStudent(id);
    }
    async bulkDelete(req, studentIds) {
        if (!Array.isArray(studentIds)) {
            throw new common_1.BadRequestException('studentIds must be an array of strings');
        }
        const actorUserId = req.user.id;
        return this.studentsService.bulkDeleteStudents(studentIds, actorUserId);
    }
    async importBulk(students) {
        if (!Array.isArray(students)) {
            throw new Error('Students parameter must be an array');
        }
        return this.studentsService.importStudentsBulk(students);
    }
};
exports.StudentsController = StudentsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('classId')),
    __param(2, (0, common_1.Query)('sectionId')),
    __param(3, (0, common_1.Query)('academicYearId')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('promotion-candidates'),
    __param(0, (0, common_1.Query)('sourceYearId')),
    __param(1, (0, common_1.Query)('className')),
    __param(2, (0, common_1.Query)('sectionName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "getPromotionCandidates", null);
__decorate([
    (0, common_1.Post)('promote'),
    __param(0, (0, common_1.Body)('studentIds')),
    __param(1, (0, common_1.Body)('sourceYearId')),
    __param(2, (0, common_1.Body)('targetYearId')),
    __param(3, (0, common_1.Body)('targetClassName')),
    __param(4, (0, common_1.Body)('targetSectionName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String, String, String, String]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "promote", null);
__decorate([
    (0, common_1.Post)('promote/validate'),
    __param(0, (0, common_1.Body)('studentIds')),
    __param(1, (0, common_1.Body)('sourceYearId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "validatePromotion", null);
__decorate([
    (0, common_1.Get)('parents/all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "getParents", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('academicYearId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "getDetails", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "updateStudent", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "deleteStudent", null);
__decorate([
    (0, common_1.Post)('bulk-delete'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('studentIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Array]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "bulkDelete", null);
__decorate([
    (0, common_1.Post)('import'),
    __param(0, (0, common_1.Body)('students')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "importBulk", null);
exports.StudentsController = StudentsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Controller)('students'),
    __metadata("design:paramtypes", [students_service_1.StudentsService])
], StudentsController);
//# sourceMappingURL=students.controller.js.map