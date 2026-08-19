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
exports.TeachersController = void 0;
const common_1 = require("@nestjs/common");
const teachers_service_1 = require("./teachers.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let TeachersController = class TeachersController {
    constructor(teachersService) {
        this.teachersService = teachersService;
    }
    async create(data) {
        return this.teachersService.createTeacher(data);
    }
    async getTeachingStaff() {
        return this.teachersService.getTeachingStaff();
    }
    async getAll(department, status, search) {
        return this.teachersService.getTeachers({ department, status, search });
    }
    async assign(id, classSectionId, subjectId, periodsPerWeek) {
        return this.teachersService.assignClassSubject(id, classSectionId, subjectId, periodsPerWeek);
    }
    async getAssignments(id) {
        return this.teachersService.getAssignments(id);
    }
    async addSkill(id, subjectId, skillLevel, yearsOfExperience) {
        return this.teachersService.saveSkill(id, subjectId, skillLevel, yearsOfExperience);
    }
    async getSkills(id) {
        return this.teachersService.getSkills(id);
    }
    async update(id, data) {
        return this.teachersService.updateTeacher(id, data);
    }
    async remove(id) {
        return this.teachersService.deleteTeacher(id);
    }
    async paySalary(id, month) {
        return this.teachersService.paySalary(id, month);
    }
    async payAllSalaries(month) {
        return this.teachersService.payAllSalaries(month);
    }
    async getSalaryInvoices(id) {
        return this.teachersService.getSalaryInvoices(id);
    }
    async getTeacherCases(id) {
        return this.teachersService.getTeacherCases(id);
    }
    async getTeacherSchedule(id) {
        return this.teachersService.getTeacherSchedule(id);
    }
};
exports.TeachersController = TeachersController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('teaching-staff'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "getTeachingStaff", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('department')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(':id/assignments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('classSectionId')),
    __param(2, (0, common_1.Body)('subjectId')),
    __param(3, (0, common_1.Body)('periodsPerWeek')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "assign", null);
__decorate([
    (0, common_1.Get)(':id/assignments'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "getAssignments", null);
__decorate([
    (0, common_1.Post)(':id/skills'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('subjectId')),
    __param(2, (0, common_1.Body)('skillLevel')),
    __param(3, (0, common_1.Body)('yearsOfExperience')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "addSkill", null);
__decorate([
    (0, common_1.Get)(':id/skills'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "getSkills", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/pay-salary'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "paySalary", null);
__decorate([
    (0, common_1.Post)('pay-all-salaries'),
    __param(0, (0, common_1.Body)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "payAllSalaries", null);
__decorate([
    (0, common_1.Get)(':id/salary-invoices'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "getSalaryInvoices", null);
__decorate([
    (0, common_1.Get)(':id/cases'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "getTeacherCases", null);
__decorate([
    (0, common_1.Get)(':id/schedule'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeachersController.prototype, "getTeacherSchedule", null);
exports.TeachersController = TeachersController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Controller)('teachers'),
    __metadata("design:paramtypes", [teachers_service_1.TeachersService])
], TeachersController);
//# sourceMappingURL=teachers.controller.js.map