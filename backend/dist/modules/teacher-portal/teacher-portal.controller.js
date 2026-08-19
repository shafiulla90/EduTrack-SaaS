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
const swagger_1 = require("@nestjs/swagger");
let TeacherPortalController = class TeacherPortalController {
    constructor(portalService) {
        this.portalService = portalService;
    }
    async getDashboard(req) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.getDashboardStats(userId, tenantId);
    }
    async getProfile(req) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.getProfile(userId, tenantId);
    }
    async updateProfile(req, data) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.updateProfile(userId, tenantId, data);
    }
    async changePassword(req, data) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.changePassword(userId, tenantId, data);
    }
    async getClasses(req) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.getAssignedClasses(userId, tenantId);
    }
    async getStudents(req, classSectionId) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.getStudentsForClassSection(userId, tenantId, classSectionId);
    }
    async getAttendanceClasses(req) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.getClassesForAttendance(userId, tenantId);
    }
    async getAttendanceSections(req, classVal) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.getSectionsForAttendance(userId, tenantId, classVal);
    }
    async getAttendanceStudents(req, classVal, sectionVal) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.getStudentsForAttendance(userId, tenantId, classVal, sectionVal);
    }
    async saveAttendance(req, data) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.saveAttendanceSheet(userId, tenantId, data);
    }
    async getAttendanceHistory(req) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.getAttendanceHistory(userId, tenantId);
    }
    async getMarksEntryList(req, subjectId, examName, classSectionId, subjectType) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.getExamMarksEntryList(userId, tenantId, subjectId, examName, classSectionId, subjectType);
    }
    async saveMarks(req, data) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.saveExamMarksList(userId, tenantId, data);
    }
    async getTimetable(req) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.getTeacherWeeklySchedule(userId, tenantId);
    }
    async getHomeworks(req) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.getHomeworks(userId, tenantId);
    }
    async createHomework(req, data) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.createHomework(userId, tenantId, data);
    }
    async updateHomework(req, id, data) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.updateHomework(userId, tenantId, id, data);
    }
    async deleteHomework(req, id) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.deleteHomework(userId, tenantId, id);
    }
    async sendHomeworkToParents(req, id) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.sendHomeworkToParents(userId, tenantId, id);
    }
    async getAnnouncements(req) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.getAnnouncements(userId, tenantId);
    }
    async createAnnouncement(req, data) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.createAnnouncement(userId, tenantId, data);
    }
    async deleteAnnouncement(req, id) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.deleteAnnouncement(userId, tenantId, id);
    }
    async markAsRead(req, id) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.markAnnouncementAsRead(userId, tenantId, id);
    }
    async getLeaves(req) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.getLeaveRequests(userId, tenantId);
    }
    async applyLeave(req, data) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.applyLeave(userId, tenantId, data);
    }
    async cancelLeave(req, id) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.cancelLeave(userId, tenantId, id);
    }
    async updateLeaveStatus(req, id, data) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.updateLeaveStatus(userId, tenantId, id, data);
    }
    async getCommAudience(req) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.getCommunicationAudience(userId, tenantId);
    }
    async sendBroadcast(req, data) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.sendBroadcastMessage(userId, tenantId, data);
    }
    async getCalendar(req, month, year) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.getCalendarTimeline(userId, tenantId, parseInt(month || '8', 10), parseInt(year || '2026', 10));
    }
    async getStudentProgress(req, studentId) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.getStudentProgressDetails(userId, tenantId, studentId);
    }
    async getSalaryDetails(req) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.getMySalaryDetails(userId, tenantId);
    }
    async getSalaryHistory(req) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.getMySalaryHistory(userId, tenantId);
    }
    async getPayslipData(req, expenseId) {
        const userId = req?.user?.id || 'user-active';
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.portalService.getPayslipPDFData(userId, tenantId, expenseId);
    }
};
exports.TeacherPortalController = TeacherPortalController;
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('profile'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Put)('profile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('profile/change-password'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Get)('classes'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getClasses", null);
__decorate([
    (0, common_1.Get)('classes/:classSectionId/students'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('classSectionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getStudents", null);
__decorate([
    (0, common_1.Get)('attendance/classes'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getAttendanceClasses", null);
__decorate([
    (0, common_1.Get)('attendance/sections'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('classVal')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getAttendanceSections", null);
__decorate([
    (0, common_1.Get)('attendance/students'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('classVal')),
    __param(2, (0, common_1.Query)('sectionVal')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getAttendanceStudents", null);
__decorate([
    (0, common_1.Post)('attendance/save'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "saveAttendance", null);
__decorate([
    (0, common_1.Get)('attendance/history'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getAttendanceHistory", null);
__decorate([
    (0, common_1.Get)('marks/entry'),
    __param(0, (0, common_1.Request)()),
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
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "saveMarks", null);
__decorate([
    (0, common_1.Get)('timetable'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getTimetable", null);
__decorate([
    (0, common_1.Get)('homework'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getHomeworks", null);
__decorate([
    (0, common_1.Post)('homework'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "createHomework", null);
__decorate([
    (0, common_1.Put)('homework/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "updateHomework", null);
__decorate([
    (0, common_1.Delete)('homework/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "deleteHomework", null);
__decorate([
    (0, common_1.Post)('homework/:id/send-to-parents'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "sendHomeworkToParents", null);
__decorate([
    (0, common_1.Get)('announcements'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getAnnouncements", null);
__decorate([
    (0, common_1.Post)('announcements'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "createAnnouncement", null);
__decorate([
    (0, common_1.Delete)('announcements/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "deleteAnnouncement", null);
__decorate([
    (0, common_1.Post)('announcements/:id/read'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Get)('leave'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getLeaves", null);
__decorate([
    (0, common_1.Post)('leave'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "applyLeave", null);
__decorate([
    (0, common_1.Delete)('leave/:id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "cancelLeave", null);
__decorate([
    (0, common_1.Patch)('leave/:id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "updateLeaveStatus", null);
__decorate([
    (0, common_1.Get)('communication/audience'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getCommAudience", null);
__decorate([
    (0, common_1.Post)('communication/send'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "sendBroadcast", null);
__decorate([
    (0, common_1.Get)('calendar'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('month')),
    __param(2, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getCalendar", null);
__decorate([
    (0, common_1.Get)('student-progress/:studentId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getStudentProgress", null);
__decorate([
    (0, common_1.Get)('salary/details'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getSalaryDetails", null);
__decorate([
    (0, common_1.Get)('salary/history'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getSalaryHistory", null);
__decorate([
    (0, common_1.Get)('salary/payslip/:expenseId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('expenseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getPayslipData", null);
exports.TeacherPortalController = TeacherPortalController = __decorate([
    (0, swagger_1.ApiTags)('Teacher Portal'),
    (0, common_1.Controller)('teacher-portal'),
    __metadata("design:paramtypes", [teacher_portal_service_1.TeacherPortalService])
], TeacherPortalController);
//# sourceMappingURL=teacher-portal.controller.js.map