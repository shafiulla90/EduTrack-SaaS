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
exports.ExamScheduleController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
const exam_schedule_service_1 = require("./exam-schedule.service");
const exam_schedule_dto_1 = require("./dto/exam-schedule.dto");
let ExamScheduleController = class ExamScheduleController {
    constructor(examScheduleService) {
        this.examScheduleService = examScheduleService;
    }
    createBulk(dto, req) {
        const userId = req.user.id || req.user.sub;
        return this.examScheduleService.createBulk(dto, userId);
    }
    updateBulk(dto) {
        return this.examScheduleService.updateBulk(dto);
    }
    deleteBulk(dto) {
        return this.examScheduleService.deleteBulk(dto);
    }
    findAll(query, req) {
        return this.examScheduleService.findAll(query, req.user);
    }
    findOne(id) {
        return this.examScheduleService.findOne(id);
    }
    update(id, dto) {
        return this.examScheduleService.update(id, dto);
    }
    delete(id) {
        return this.examScheduleService.delete(id);
    }
};
exports.ExamScheduleController = ExamScheduleController;
__decorate([
    (0, common_1.Post)('bulk'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [exam_schedule_dto_1.BulkCreateDto, Object]),
    __metadata("design:returntype", void 0)
], ExamScheduleController.prototype, "createBulk", null);
__decorate([
    (0, common_1.Patch)('bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [exam_schedule_dto_1.BulkStatusDto]),
    __metadata("design:returntype", void 0)
], ExamScheduleController.prototype, "updateBulk", null);
__decorate([
    (0, common_1.Post)('bulk-delete'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [exam_schedule_dto_1.BulkDeleteDto]),
    __metadata("design:returntype", void 0)
], ExamScheduleController.prototype, "deleteBulk", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ExamScheduleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExamScheduleController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, exam_schedule_dto_1.UpdateExamScheduleDto]),
    __metadata("design:returntype", void 0)
], ExamScheduleController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExamScheduleController.prototype, "delete", null);
exports.ExamScheduleController = ExamScheduleController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('exam-schedule'),
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN),
    __metadata("design:paramtypes", [exam_schedule_service_1.ExamScheduleService])
], ExamScheduleController);
//# sourceMappingURL=exam-schedule.controller.js.map