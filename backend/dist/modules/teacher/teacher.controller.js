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
exports.TeacherController = void 0;
const common_1 = require("@nestjs/common");
const teacher_service_1 = require("./teacher.service");
let TeacherController = class TeacherController {
    constructor(teacherService) {
        this.teacherService = teacherService;
    }
    findAll(search, role, department, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.teacherService.findAll(tenantId, { search, role, department });
    }
    payAllSalaries(body, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.teacherService.payAllSalaries(tenantId, body);
    }
    paySalaryGeneric(body, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        const id = body?.id || body?.staffId || 'staff-001';
        return this.teacherService.paySalary(id, tenantId, body);
    }
    paySalary(id, body, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.teacherService.paySalary(id, tenantId, body);
    }
    paySalaryPatch(id, body, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.teacherService.paySalary(id, tenantId, body);
    }
    getSalaryInvoices(id, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.teacherService.getSalaryInvoices(id, tenantId);
    }
    getCases(id, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.teacherService.getCases(id, tenantId);
    }
    getSchedule(id, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.teacherService.getSchedule(id, tenantId);
    }
    findOne(id, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.teacherService.findOne(id, tenantId);
    }
    create(createDto, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.teacherService.create(tenantId, createDto);
    }
    update(id, updateDto, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.teacherService.update(id, tenantId, updateDto);
    }
    remove(id, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.teacherService.remove(id, tenantId);
    }
};
exports.TeacherController = TeacherController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('role')),
    __param(2, (0, common_1.Query)('department')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], TeacherController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('pay-all-salaries'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TeacherController.prototype, "payAllSalaries", null);
__decorate([
    (0, common_1.Post)('pay-salary'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TeacherController.prototype, "paySalaryGeneric", null);
__decorate([
    (0, common_1.Post)(':id/pay-salary'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], TeacherController.prototype, "paySalary", null);
__decorate([
    (0, common_1.Patch)(':id/pay-salary'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], TeacherController.prototype, "paySalaryPatch", null);
__decorate([
    (0, common_1.Get)(':id/salary-invoices'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TeacherController.prototype, "getSalaryInvoices", null);
__decorate([
    (0, common_1.Get)(':id/cases'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TeacherController.prototype, "getCases", null);
__decorate([
    (0, common_1.Get)(':id/schedule'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TeacherController.prototype, "getSchedule", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TeacherController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TeacherController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], TeacherController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TeacherController.prototype, "remove", null);
exports.TeacherController = TeacherController = __decorate([
    (0, common_1.Controller)('teachers'),
    __metadata("design:paramtypes", [teacher_service_1.TeacherService])
], TeacherController);
//# sourceMappingURL=teacher.controller.js.map