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
let AttendanceController = class AttendanceController {
    constructor(attendanceService) {
        this.attendanceService = attendanceService;
    }
    getSession(classSectionId, date, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.attendanceService.getSession(tenantId, classSectionId, date);
    }
    saveAttendance(body, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.attendanceService.saveAttendance(tenantId, {
            classSectionId: body.classSectionId,
            date: body.date,
            teacherId: body.teacherId,
            presentCount: body.presentCount,
            absentCount: body.absentCount,
            totalStudents: body.totalStudents,
            absentStudentIds: body.absentStudentIds || [],
        });
    }
    getClassReport(classSectionId, date, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.attendanceService.getClassReport(tenantId, classSectionId, date);
    }
    getHistory(classSectionId, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.attendanceService.getHistory(tenantId, classSectionId);
    }
    create(dto, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.attendanceService.create(tenantId, {
            studentId: dto.studentId,
            date: dto.date,
            status: dto.status,
        });
    }
    findAll(req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.attendanceService.findAll(tenantId);
    }
    findOne(id, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.attendanceService.findOne(id, tenantId);
    }
    findByStudent(studentId, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.attendanceService.findByStudent(studentId, tenantId);
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Get)('session'),
    __param(0, (0, common_1.Query)('classSectionId')),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "getSession", null);
__decorate([
    (0, common_1.Post)('save'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "saveAttendance", null);
__decorate([
    (0, common_1.Get)('class-report'),
    __param(0, (0, common_1.Query)('classSectionId')),
    __param(1, (0, common_1.Query)('date')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "getClassReport", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Query)('classSectionId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "findByStudent", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, common_1.Controller)('attendance'),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map