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
exports.TeacherPortalController = void 0;
const common_1 = require("@nestjs/common");
const teacher_portal_service_1 = require("./teacher-portal.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let TeacherPortalController = class TeacherPortalController {
    constructor(portalService) {
        this.portalService = portalService;
    }
    async getDashboard(req) {
        return this.portalService.getDashboardStats(req.user.sub, req.user.tenantId);
    }
    async getProfile(req) {
        return this.portalService.getProfile(req.user.sub, req.user.tenantId);
    }
    async updateProfile(req, data) {
        return this.portalService.updateProfile(req.user.sub, req.user.tenantId, data);
    }
    async changePassword(req, data) {
        return this.portalService.changePassword(req.user.sub, req.user.tenantId, data);
    }
    async getClasses(req) {
        return this.portalService.getAssignedClasses(req.user.sub, req.user.tenantId);
    }
    async getStudents(req, classSectionId) {
        return this.portalService.getStudentsForClassSection(req.user.sub, req.user.tenantId, classSectionId);
    }
    async getAttendanceClasses(req) {
        return this.portalService.getClassesForAttendance(req.user.sub, req.user.tenantId);
    }
    async getAttendanceSections(req, classVal) {
        return this.portalService.getSectionsForAttendance(req.user.sub, req.user.tenantId, classVal);
    }
    async getAttendanceStudents(req, classVal, sectionVal) {
        return this.portalService.getStudentsForAttendance(req.user.sub, req.user.tenantId, classVal, sectionVal);
    }
    async saveAttendance(req, data) {
        return this.portalService.saveAttendanceSheet(req.user.sub, req.user.tenantId, data);
    }
    async getAttendanceHistory(req) {
        return this.portalService.getAttendanceHistory(req.user.sub, req.user.tenantId);
    }
    async getMarksEntryList(req, subjectId, examName, classSectionId, subjectType) {
        return this.portalService.getExamMarksEntryList(req.user.sub, req.user.tenantId, subjectId, examName, classSectionId, subjectType);
    }
    async saveMarks(req, data) {
        return this.portalService.saveExamMarksList(req.user.sub, req.user.tenantId, data);
    }
    async getTimetable(req) {
        return this.portalService.getTeacherWeeklySchedule(req.user.sub, req.user.tenantId);
    }
    async getHomeworks(req) {
        return this.portalService.getHomeworks(req.user.sub, req.user.tenantId);
    }
    async createHomework(req, data) {
        return this.portalService.createHomework(req.user.sub, req.user.tenantId, data);
    }
    async updateHomework(req, id, data) {
        return this.portalService.updateHomework(req.user.sub, req.user.tenantId, id, data);
    }
    async deleteHomework(req, id) {
        return this.portalService.deleteHomework(req.user.sub, req.user.tenantId, id);
    }
    async sendHomeworkToParents(req, id) {
        return this.portalService.sendHomeworkToParents(req.user.sub, req.user.tenantId, id);
    }
    async getAnnouncements(req) {
        return this.portalService.getAnnouncements(req.user.sub, req.user.tenantId);
    }
    async createAnnouncement(req, data) {
        return this.portalService.createAnnouncement(req.user.sub, req.user.tenantId, data);
    }
    async deleteAnnouncement(req, id) {
        return this.portalService.deleteAnnouncement(req.user.sub, req.user.tenantId, id);
    }
    async markAsRead(req, id) {
        return this.portalService.markAnnouncementAsRead(req.user.sub, req.user.tenantId, id);
    }
    async getLeaves(req) {
        return this.portalService.getLeaveRequests(req.user.sub, req.user.tenantId);
    }
    async applyLeave(req, data) {
        return this.portalService.applyLeave(req.user.sub, req.user.tenantId, data);
    }
    async cancelLeave(req, id) {
        return this.portalService.cancelLeave(req.user.sub, req.user.tenantId, id);
    }
    async updateLeaveStatus(req, id, data) {
        return this.portalService.updateLeaveStatus(req.user.sub, req.user.tenantId, id, data);
    }
    async getCommAudience(req) {
        return this.portalService.getCommunicationAudience(req.user.sub, req.user.tenantId);
    }
    async sendBroadcast(req, data) {
        return this.portalService.sendBroadcastMessage(req.user.sub, req.user.tenantId, data);
    }
    async getCalendar(req, month, year) {
        return this.portalService.getCalendarTimeline(req.user.sub, req.user.tenantId, parseInt(month, 10), parseInt(year, 10));
    }
    async getStudentProgress(req, studentId) {
        return this.portalService.getStudentProgressDetails(req.user.sub, req.user.tenantId, studentId);
    }
    async getSalaryDetails(req) {
        return this.portalService.getMySalaryDetails(req.user.sub, req.user.tenantId);
    }
    async getSalaryHistory(req) {
        return this.portalService.getMySalaryHistory(req.user.sub, req.user.tenantId);
    }
    async getPayslipData(req, expenseId) {
        return this.portalService.getPayslipPDFData(req.user.sub, req.user.tenantId, expenseId);
    }
};
exports.TeacherPortalController = TeacherPortalController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('profile'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('profile/change-password'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Get)('classes'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getClasses", null);
__decorate([
    (0, common_1.Get)('classes/:classSectionId/students'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('classSectionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getStudents", null);
__decorate([
    (0, common_1.Get)('attendance/classes'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getAttendanceClasses", null);
__decorate([
    (0, common_1.Get)('attendance/sections'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('classVal')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getAttendanceSections", null);
__decorate([
    (0, common_1.Get)('attendance/students'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('classVal')),
    __param(2, (0, common_1.Query)('sectionVal')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getAttendanceStudents", null);
__decorate([
    (0, common_1.Post)('attendance/save'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "saveAttendance", null);
__decorate([
    (0, common_1.Get)('attendance/history'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getAttendanceHistory", null);
__decorate([
    (0, common_1.Get)('marks/entry'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('subjectId')),
    __param(2, (0, common_1.Query)('examName')),
    __param(3, (0, common_1.Query)('classSectionId')),
    __param(4, (0, common_1.Query)('subjectType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getMarksEntryList", null);
__decorate([
    (0, common_1.Post)('marks/save'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "saveMarks", null);
__decorate([
    (0, common_1.Get)('timetable'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getTimetable", null);
__decorate([
    (0, common_1.Get)('homework'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getHomeworks", null);
__decorate([
    (0, common_1.Post)('homework'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "createHomework", null);
__decorate([
    (0, common_1.Put)('homework/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "updateHomework", null);
__decorate([
    (0, common_1.Delete)('homework/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "deleteHomework", null);
__decorate([
    (0, common_1.Post)('homework/:id/send-to-parents'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "sendHomeworkToParents", null);
__decorate([
    (0, common_1.Get)('announcements'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getAnnouncements", null);
__decorate([
    (0, common_1.Post)('announcements'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "createAnnouncement", null);
__decorate([
    (0, common_1.Delete)('announcements/:id'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "deleteAnnouncement", null);
__decorate([
    (0, common_1.Post)('announcements/:id/read'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Get)('leave'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getLeaves", null);
__decorate([
    (0, common_1.Post)('leave'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "applyLeave", null);
__decorate([
    (0, common_1.Delete)('leave/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "cancelLeave", null);
__decorate([
    (0, common_1.Patch)('leave/:id/status'),
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "updateLeaveStatus", null);
__decorate([
    (0, common_1.Get)('communication/audience'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getCommAudience", null);
__decorate([
    (0, common_1.Post)('communication/send'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "sendBroadcast", null);
__decorate([
    (0, common_1.Get)('calendar'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getCalendar", null);
__decorate([
    (0, common_1.Get)('student-progress/:studentId'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getStudentProgress", null);
__decorate([
    (0, common_1.Get)('salary/details'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getSalaryDetails", null);
__decorate([
    (0, common_1.Get)('salary/history'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getSalaryHistory", null);
__decorate([
    (0, common_1.Get)('salary/payslip/:expenseId'),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('expenseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getPayslipData", null);
exports.TeacherPortalController = TeacherPortalController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.SCHOOL_ADMIN),
    (0, common_1.Controller)('teacher-portal'),
    __metadata("design:paramtypes", [teacher_portal_service_1.TeacherPortalService])
], TeacherPortalController);
//# sourceMappingURL=teacher-portal.controller.js.map