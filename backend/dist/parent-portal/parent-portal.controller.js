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
exports.ParentPortalController = void 0;
const common_1 = require("@nestjs/common");
const parent_portal_service_1 = require("./parent-portal.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let ParentPortalController = class ParentPortalController {
    constructor(portalService) {
        this.portalService = portalService;
    }
    async getDashboard(req) {
        return this.portalService.getDashboardStats(req.user.sub, req.user.tenantId);
    }
    async getChildren(req) {
        return this.portalService.getChildren(req.user.sub);
    }
    async getChildDashboard(req, studentId) {
        return this.portalService.getChildDashboard(req.user.sub, studentId);
    }
    async getAttendance(req, studentId) {
        return this.portalService.getAttendance(req.user.sub, studentId);
    }
    async getHomework(req, studentId) {
        return this.portalService.getHomework(req.user.sub, studentId);
    }
    async submitAssignment(req, studentId, homeworkId, data) {
        return this.portalService.submitAssignment(req.user.sub, studentId, homeworkId, data.base64File, data.fileName);
    }
    async getExams(req, studentId) {
        return this.portalService.getExams(req.user.sub, studentId);
    }
    async getFees(req, studentId) {
        return this.portalService.getFees(req.user.sub, studentId);
    }
    async payInvoice(req, studentId, invoiceId, data) {
        return this.portalService.payInvoice(req.user.sub, studentId, invoiceId, data);
    }
    async downloadInvoicePdf(req, res, studentId, invoiceId) {
        return this.portalService.generateInvoicePdf(req.user.sub, studentId, invoiceId, res);
    }
    async getTimetable(req, studentId) {
        return this.portalService.getTimetable(req.user.sub, studentId);
    }
    async getAnnouncements(req, studentId) {
        return this.portalService.getAnnouncements(req.user.sub, studentId);
    }
    async getTeacherComplaints(req, studentId) {
        return this.portalService.getTeacherComplaints(req.user.sub, studentId);
    }
    async getComplaints(req) {
        return this.portalService.getComplaints(req.user.sub);
    }
    async submitComplaint(req, data) {
        return this.portalService.submitComplaint(req.user.sub, req.user.tenantId, data);
    }
    async getTransport(req, studentId) {
        return this.portalService.getTransport(req.user.sub, studentId);
    }
    async getLeavesHistory(req, studentId) {
        return this.portalService.getLeavesHistory(req.user.sub, studentId);
    }
    async submitLeaveRequest(req, studentId, data) {
        return this.portalService.submitLeaveRequest(req.user.sub, studentId, data);
    }
};
exports.ParentPortalController = ParentPortalController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('children'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "getChildren", null);
__decorate([
    (0, common_1.Get)('children/:studentId/dashboard'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "getChildDashboard", null);
__decorate([
    (0, common_1.Get)('children/:studentId/attendance'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "getAttendance", null);
__decorate([
    (0, common_1.Get)('children/:studentId/homework'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "getHomework", null);
__decorate([
    (0, common_1.Post)('children/:studentId/homework/:homeworkId/submit'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('studentId')),
    __param(2, (0, common_1.Param)('homeworkId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "submitAssignment", null);
__decorate([
    (0, common_1.Get)('children/:studentId/exams'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "getExams", null);
__decorate([
    (0, common_1.Get)('children/:studentId/fees'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "getFees", null);
__decorate([
    (0, common_1.Post)('children/:studentId/invoices/:invoiceId/pay'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('studentId')),
    __param(2, (0, common_1.Param)('invoiceId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "payInvoice", null);
__decorate([
    (0, common_1.Get)('children/:studentId/invoices/:invoiceId/pdf/download'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Param)('studentId')),
    __param(3, (0, common_1.Param)('invoiceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "downloadInvoicePdf", null);
__decorate([
    (0, common_1.Get)('children/:studentId/timetable'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "getTimetable", null);
__decorate([
    (0, common_1.Get)('children/:studentId/announcements'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "getAnnouncements", null);
__decorate([
    (0, common_1.Get)('children/:studentId/teacher-complaints'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "getTeacherComplaints", null);
__decorate([
    (0, common_1.Get)('complaints'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "getComplaints", null);
__decorate([
    (0, common_1.Post)('complaints'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "submitComplaint", null);
__decorate([
    (0, common_1.Get)('children/:studentId/transport'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "getTransport", null);
__decorate([
    (0, common_1.Get)('children/:studentId/leave'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "getLeavesHistory", null);
__decorate([
    (0, common_1.Post)('children/:studentId/leave'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('studentId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "submitLeaveRequest", null);
exports.ParentPortalController = ParentPortalController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.PARENT),
    (0, common_1.Controller)('parent-portal'),
    __metadata("design:paramtypes", [parent_portal_service_1.ParentPortalService])
], ParentPortalController);
//# sourceMappingURL=parent-portal.controller.js.map