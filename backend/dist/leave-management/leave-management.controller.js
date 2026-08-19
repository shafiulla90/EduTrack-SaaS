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
exports.LeaveManagementController = void 0;
const common_1 = require("@nestjs/common");
const leave_management_service_1 = require("./leave-management.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let LeaveManagementController = class LeaveManagementController {
    constructor(leaveManagementService) {
        this.leaveManagementService = leaveManagementService;
    }
    async getLeaves(req, page, limit, status, applicantType, leaveType, academicYearId, startDate, endDate, search, sortBy, sortOrder) {
        return this.leaveManagementService.getLeaveRequests(req.user.sub, {
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
            status,
            applicantType,
            leaveType,
            academicYearId,
            startDate,
            endDate,
            search,
            sortBy,
            sortOrder,
        });
    }
    async getLeaveStats() {
        return this.leaveManagementService.getLeaveStats();
    }
    async getApplicantLeaveHistory(applicantType, applicantId) {
        return this.leaveManagementService.getApplicantLeaveHistory(applicantType, applicantId);
    }
    async updateLeaveStatus(req, id, data) {
        return this.leaveManagementService.updateLeaveStatus(req.user.sub, id, data);
    }
    async bulkUpdateLeaveStatus(req, data) {
        return this.leaveManagementService.bulkUpdateLeaveStatus(req.user.sub, data.ids, {
            status: data.status,
            comments: data.comments,
        });
    }
};
exports.LeaveManagementController = LeaveManagementController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('applicantType')),
    __param(5, (0, common_1.Query)('leaveType')),
    __param(6, (0, common_1.Query)('academicYearId')),
    __param(7, (0, common_1.Query)('startDate')),
    __param(8, (0, common_1.Query)('endDate')),
    __param(9, (0, common_1.Query)('search')),
    __param(10, (0, common_1.Query)('sortBy')),
    __param(11, (0, common_1.Query)('sortOrder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], LeaveManagementController.prototype, "getLeaves", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeaveManagementController.prototype, "getLeaveStats", null);
__decorate([
    (0, common_1.Get)('history/:applicantType/:applicantId'),
    __param(0, (0, common_1.Param)('applicantType')),
    __param(1, (0, common_1.Param)('applicantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LeaveManagementController.prototype, "getApplicantLeaveHistory", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], LeaveManagementController.prototype, "updateLeaveStatus", null);
__decorate([
    (0, common_1.Post)('bulk-status'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LeaveManagementController.prototype, "bulkUpdateLeaveStatus", null);
exports.LeaveManagementController = LeaveManagementController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN),
    (0, common_1.Controller)('leave-management'),
    __metadata("design:paramtypes", [leave_management_service_1.LeaveManagementService])
], LeaveManagementController);
//# sourceMappingURL=leave-management.controller.js.map