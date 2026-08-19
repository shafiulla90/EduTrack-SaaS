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
const swagger_1 = require("@nestjs/swagger");
let ParentPortalController = class ParentPortalController {
    constructor(portalService) {
        this.portalService = portalService;
    }
    async getDashboard(req) {
        const userId = req?.user?.id || 'user-parent';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.getDashboardStats(userId, tenantId);
    }
    async getChildren(req) {
        const userId = req?.user?.id || 'user-parent';
        return this.portalService.getChildren(userId);
    }
    async getChildDashboard(req, studentId) {
        const userId = req?.user?.id || 'user-parent';
        return this.portalService.getChildDashboard(userId, studentId);
    }
    async getAttendance(req, studentId) {
        const userId = req?.user?.id || 'user-parent';
        return this.portalService.getAttendance(userId, studentId);
    }
    async getHomework(req, studentId) {
        const userId = req?.user?.id || 'user-parent';
        return this.portalService.getHomework(userId, studentId);
    }
    async submitAssignment(req, studentId, homeworkId, data) {
        const userId = req?.user?.id || 'user-parent';
        return this.portalService.submitAssignment(userId, studentId, homeworkId, data.base64File, data.fileName);
    }
    async getExams(req, studentId) {
        const userId = req?.user?.id || 'user-parent';
        return this.portalService.getExams(userId, studentId);
    }
    async getFees(req, studentId) {
        const userId = req?.user?.id || 'user-parent';
        return this.portalService.getFees(userId, studentId);
    }
    async payInvoice(req, studentId, invoiceId, data) {
        const userId = req?.user?.id || 'user-parent';
        return this.portalService.payInvoice(userId, studentId, invoiceId, data);
    }
    async downloadInvoicePdf(req, res, studentId, invoiceId) {
        const userId = req?.user?.id || 'user-parent';
        return this.portalService.generateInvoicePdf(userId, studentId, invoiceId, res);
    }
    async getTimetable(req, studentId) {
        const userId = req?.user?.id || 'user-parent';
        return this.portalService.getTimetable(userId, studentId);
    }
    async getAnnouncements(req, studentId) {
        const userId = req?.user?.id || 'user-parent';
        return this.portalService.getAnnouncements(userId, studentId);
    }
    async getTeacherComplaints(req, studentId) {
        const userId = req?.user?.id || 'user-parent';
        return this.portalService.getTeacherComplaints(userId, studentId);
    }
    async getComplaints(req) {
        const userId = req?.user?.id || 'user-parent';
        return this.portalService.getComplaints(userId);
    }
    async submitComplaint(req, data) {
        const userId = req?.user?.id || 'user-parent';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.submitComplaint(userId, tenantId, data);
    }
    async getTransport(req, studentId) {
        const userId = req?.user?.id || 'user-parent';
        return this.portalService.getTransport(userId, studentId);
    }
    async getLeavesHistory(req, studentId) {
        const userId = req?.user?.id || 'user-parent';
        return this.portalService.getLeavesHistory(userId, studentId);
    }
    async submitLeaveRequest(req, studentId, data) {
        const userId = req?.user?.id || 'user-parent';
        return this.portalService.submitLeaveRequest(userId, studentId, data);
    }
};
exports.ParentPortalController = ParentPortalController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('children'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "getChildren", null);
__decorate([
    (0, common_1.Get)('children/:studentId/dashboard'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "getChildDashboard", null);
__decorate([
    (0, common_1.Get)('children/:studentId/attendance'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "getAttendance", null);
__decorate([
    (0, common_1.Get)('children/:studentId/homework'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "getHomework", null);
__decorate([
    (0, common_1.Post)('children/:studentId/homework/:homeworkId/submit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('studentId')),
    __param(2, (0, common_1.Param)('homeworkId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "submitAssignment", null);
__decorate([
    (0, common_1.Get)('children/:studentId/exams'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "getExams", null);
__decorate([
    (0, common_1.Get)('children/:studentId/fees'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "getFees", null);
__decorate([
    (0, common_1.Post)('children/:studentId/invoices/:invoiceId/pay'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('studentId')),
    __param(2, (0, common_1.Param)('invoiceId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "payInvoice", null);
__decorate([
    (0, common_1.Get)('children/:studentId/invoices/:invoiceId/pdf/download'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Param)('studentId')),
    __param(3, (0, common_1.Param)('invoiceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "downloadInvoicePdf", null);
__decorate([
    (0, common_1.Get)('children/:studentId/timetable'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "getTimetable", null);
__decorate([
    (0, common_1.Get)('children/:studentId/announcements'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "getAnnouncements", null);
__decorate([
    (0, common_1.Get)('children/:studentId/teacher-complaints'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "getTeacherComplaints", null);
__decorate([
    (0, common_1.Get)('complaints'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "getComplaints", null);
__decorate([
    (0, common_1.Post)('complaints'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "submitComplaint", null);
__decorate([
    (0, common_1.Get)('children/:studentId/transport'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "getTransport", null);
__decorate([
    (0, common_1.Get)('children/:studentId/leave'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "getLeavesHistory", null);
__decorate([
    (0, common_1.Post)('children/:studentId/leave'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('studentId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ParentPortalController.prototype, "submitLeaveRequest", null);
exports.ParentPortalController = ParentPortalController = __decorate([
    (0, swagger_1.ApiTags)('Parent Portal'),
    (0, common_1.Controller)('parent-portal'),
    __metadata("design:paramtypes", [parent_portal_service_1.ParentPortalService])
], ParentPortalController);
//# sourceMappingURL=parent-portal.controller.js.map