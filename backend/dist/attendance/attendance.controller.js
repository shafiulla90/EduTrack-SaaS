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
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const attendance_service_1 = require("./attendance.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let AttendanceController = class AttendanceController {
    constructor(attendanceService) {
        this.attendanceService = attendanceService;
    }
    async getClasses(req) {
        return this.attendanceService.getClasses(req.user.sub, req.user.role);
    }
    async getSections(req, classVal) {
        return this.attendanceService.getSections(classVal, req.user.sub, req.user.role);
    }
    async getTeachers() {
        return this.attendanceService.getTeachers();
    }
    async getRecent() {
        return this.attendanceService.getRecentSubmissions();
    }
    async getHistory() {
        return this.attendanceService.getHistory();
    }
    async getStudents(req, classVal, sectionVal) {
        return this.attendanceService.getStudents(classVal, sectionVal, req.user.sub, req.user.role);
    }
    async getSessionData(req, classVal, sectionVal, dateVal) {
        return this.attendanceService.getSessionData(classVal, sectionVal, dateVal, req.user.sub, req.user.role);
    }
    async save(req, data) {
        return this.attendanceService.saveAttendance(data, req.user.sub, req.user.role);
    }
    async getReportData(startDate, endDate) {
        return this.attendanceService.getAttendanceData(startDate, endDate);
    }
    async getSession(classSectionId, date) {
        const cs = await this.attendanceService['prisma'].classSection.findUnique({
            where: { id: classSectionId },
            include: { class: true, section: true },
        });
        if (!cs) {
            return { sessionExists: false, absentIds: [], total: 0, present: 0, absent: 0 };
        }
        return this.attendanceService.getSessionData(cs.class.name, cs.section.name, date);
    }
    async getById(id) {
        return this.attendanceService.getAttendanceById(id);
    }
    async update(id, updateDto) {
        return this.attendanceService.updateAttendance(id, updateDto);
    }
    async remove(id) {
        return this.attendanceService.deleteAttendance(id);
    }
    async getDailySummary(date) {
        return this.attendanceService.getDailySummary(date);
    }
    async getMonthlySummary(month, year) {
        return this.attendanceService.getMonthlySummary(month, year);
    }
    async getClassReport(classSectionId, date) {
        return this.attendanceService.getClassAttendanceReport(classSectionId, date);
    }
    async getStudentReport(studentId, date) {
        return this.attendanceService.getStudentAttendanceReport(studentId, date);
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Get)('classes'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getClasses", null);
__decorate([
    (0, common_1.Get)('sections'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('classVal')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getSections", null);
__decorate([
    (0, common_1.Get)('teachers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getTeachers", null);
__decorate([
    (0, common_1.Get)('recent'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getRecent", null);
__decorate([
    (0, common_1.Get)('history'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('students'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('classVal')),
    __param(2, (0, common_1.Query)('sectionVal')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getStudents", null);
__decorate([
    (0, common_1.Get)('session-data'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('classVal')),
    __param(2, (0, common_1.Query)('sectionVal')),
    __param(3, (0, common_1.Query)('dateVal')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getSessionData", null);
__decorate([
    (0, common_1.Post)('save'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "save", null);
__decorate([
    (0, common_1.Get)('report-data'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getReportData", null);
__decorate([
    (0, common_1.Get)('session'),
    __param(0, (0, common_1.Query)('classSectionId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getSession", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getById", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('summary/daily'),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getDailySummary", null);
__decorate([
    (0, common_1.Get)('summary/monthly'),
    __param(0, (0, common_1.Query)('month')),
    __param(1, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getMonthlySummary", null);
__decorate([
    (0, common_1.Get)('report/class'),
    __param(0, (0, common_1.Query)('classSectionId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getClassReport", null);
__decorate([
    (0, common_1.Get)('report/student'),
    __param(0, (0, common_1.Query)('studentId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getStudentReport", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.TEACHER),
    (0, common_1.Controller)('attendance'),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map