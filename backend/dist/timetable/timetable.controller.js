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
exports.TimetableController = void 0;
const common_1 = require("@nestjs/common");
const timetable_service_1 = require("./timetable.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
const timetable_dto_1 = require("./dto/timetable.dto");
let TimetableController = class TimetableController {
    constructor(timetableService) {
        this.timetableService = timetableService;
    }
    getAcademicYears() {
        return this.timetableService.getAcademicYears();
    }
    getClasses(academicYearId) {
        return this.timetableService.getClasses(academicYearId);
    }
    createClass(dto) {
        return this.timetableService.createClass(dto.name, dto.academicYearId);
    }
    deleteClass(id) {
        return this.timetableService.deleteClass(id);
    }
    getSections() {
        return this.timetableService.getSections();
    }
    createSection(dto) {
        return this.timetableService.createSection(dto.name);
    }
    deleteSection(id) {
        return this.timetableService.deleteSection(id);
    }
    getPeriodTimings() {
        return this.timetableService.getPeriodTimings();
    }
    savePeriodTimings(dto) {
        return this.timetableService.savePeriodTimings(dto);
    }
    getTimetableConfig() {
        return this.timetableService.getTimetableConfig();
    }
    checkExistingTimetables() {
        return this.timetableService.checkExistingTimetables();
    }
    saveTimetableConfig(dto) {
        return this.timetableService.saveTimetableConfig(dto);
    }
    getSubjects() {
        return this.timetableService.getSubjects();
    }
    createSubject(dto) {
        return this.timetableService.createSubject(dto);
    }
    bulkCreateSubjects(dto) {
        return this.timetableService.bulkCreateSubjects(dto.subjects);
    }
    getTeachersForSubject(subjectIds) {
        const ids = subjectIds ? subjectIds.split(',') : [];
        return this.timetableService.getTeachersForSubject(ids);
    }
    createTeacher(dto) {
        return this.timetableService.createTeacherWithSkills(dto);
    }
    bulkCreateTeachers(dto) {
        return this.timetableService.bulkCreateTeachers(dto.teachers);
    }
    getWorkloadSummary(academicYearId) {
        return this.timetableService.getWorkloadSummary(academicYearId);
    }
    getAllTeacherWorkloads() {
        return this.timetableService.getAllTeacherWorkloads();
    }
    getAllClassWorkloads() {
        return this.timetableService.getAllClassWorkloads();
    }
    getTeacherWorkload(id) {
        return this.timetableService.getTeacherWorkload(id);
    }
    getClassSectionWorkload(id) {
        return this.timetableService.getClassSectionWorkload(id);
    }
    updateTeacherAssignment(id, dto) {
        return this.timetableService.updateTeacherAssignment(id, dto.newTeacherId, dto.periodsPerWeek);
    }
    deleteTeacherAssignment(id) {
        return this.timetableService.deleteTeacherAssignment(id);
    }
    createClassSection(dto) {
        return this.timetableService.createClassSection(dto);
    }
    getSubjectsForClassSection(classSectionId) {
        return this.timetableService.getSubjectsForClassSection(classSectionId);
    }
    getAllTeachers() {
        return this.timetableService.getAllTeachers();
    }
    getPeriodsForClassSection(classSectionId, academicYearId, startDate, endDate) {
        return this.timetableService.getTimetableForClass(classSectionId, academicYearId, startDate, endDate);
    }
    getPeriodsForTeacher(teacherId, gaps) {
        if (gaps === 'true') {
            return this.timetableService.getPeriodsForTeacherWithGaps(teacherId);
        }
        return this.timetableService.getPeriodsForTeacher(teacherId);
    }
    getLeaserPeriodsForTeacher(teacherId) {
        return this.timetableService.getLeaserPeriodsForTeacher(teacherId);
    }
    saveSubstituteForPeriod(dto) {
        return this.timetableService.saveSubstituteForPeriod(dto.periodId, dto.substituteTeacherId);
    }
    saveTimetablePeriods(dto) {
        return this.timetableService.saveTimetablePeriods(dto);
    }
    getTeacherSkills(id) {
        return this.timetableService.getTeacherSkills(id);
    }
    getTeachersForSubjectInClass(subjectId, classSectionId) {
        return this.timetableService.getTeachersForSubjectInClass(subjectId, classSectionId);
    }
    getSkillLevelOptions() {
        return this.timetableService.getSkillLevelOptions();
    }
    async getMySchedule(req) {
        return this.timetableService.getMySchedule(req.user.sub, req.user.tenantId);
    }
};
exports.TimetableController = TimetableController;
__decorate([
    (0, common_1.Get)('academic-years'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getAcademicYears", null);
__decorate([
    (0, common_1.Get)('classes'),
    __param(0, (0, common_1.Query)('academicYearId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getClasses", null);
__decorate([
    (0, common_1.Post)('classes'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [timetable_dto_1.CreateClassDto]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "createClass", null);
__decorate([
    (0, common_1.Delete)('classes/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "deleteClass", null);
__decorate([
    (0, common_1.Get)('sections'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getSections", null);
__decorate([
    (0, common_1.Post)('sections'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [timetable_dto_1.CreateSectionDto]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "createSection", null);
__decorate([
    (0, common_1.Delete)('sections/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "deleteSection", null);
__decorate([
    (0, common_1.Get)('period-timings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getPeriodTimings", null);
__decorate([
    (0, common_1.Post)('period-timings'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "savePeriodTimings", null);
__decorate([
    (0, common_1.Get)('config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getTimetableConfig", null);
__decorate([
    (0, common_1.Get)('config/check-existing'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "checkExistingTimetables", null);
__decorate([
    (0, common_1.Post)('config'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [timetable_dto_1.SaveTimetableConfigDto]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "saveTimetableConfig", null);
__decorate([
    (0, common_1.Get)('subjects'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getSubjects", null);
__decorate([
    (0, common_1.Post)('subjects'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [timetable_dto_1.CreateSubjectDto]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "createSubject", null);
__decorate([
    (0, common_1.Post)('subjects/bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [timetable_dto_1.BulkSubjectsInputDto]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "bulkCreateSubjects", null);
__decorate([
    (0, common_1.Get)('teachers/subject'),
    __param(0, (0, common_1.Query)('subjectIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getTeachersForSubject", null);
__decorate([
    (0, common_1.Post)('teachers'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [timetable_dto_1.CreateTeacherWithSkillsDto]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "createTeacher", null);
__decorate([
    (0, common_1.Post)('teachers/bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [timetable_dto_1.BulkTeachersInputDto]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "bulkCreateTeachers", null);
__decorate([
    (0, common_1.Get)('workload/summary'),
    __param(0, (0, common_1.Query)('academicYearId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getWorkloadSummary", null);
__decorate([
    (0, common_1.Get)('workload/teachers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getAllTeacherWorkloads", null);
__decorate([
    (0, common_1.Get)('workload/classes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getAllClassWorkloads", null);
__decorate([
    (0, common_1.Get)('workload/teacher/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getTeacherWorkload", null);
__decorate([
    (0, common_1.Get)('workload/class-section/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getClassSectionWorkload", null);
__decorate([
    (0, common_1.Patch)('assignments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, timetable_dto_1.UpdateTeacherAssignmentDto]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "updateTeacherAssignment", null);
__decorate([
    (0, common_1.Delete)('assignments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "deleteTeacherAssignment", null);
__decorate([
    (0, common_1.Post)('class-sections'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [timetable_dto_1.CreateClassSectionDto]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "createClassSection", null);
__decorate([
    (0, common_1.Get)('class-sections/:id/subjects'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getSubjectsForClassSection", null);
__decorate([
    (0, common_1.Get)('teachers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getAllTeachers", null);
__decorate([
    (0, common_1.Get)('class/:classSectionId/periods'),
    __param(0, (0, common_1.Param)('classSectionId')),
    __param(1, (0, common_1.Query)('academicYearId')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getPeriodsForClassSection", null);
__decorate([
    (0, common_1.Get)('teacher/:teacherId/periods'),
    __param(0, (0, common_1.Param)('teacherId')),
    __param(1, (0, common_1.Query)('gaps')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getPeriodsForTeacher", null);
__decorate([
    (0, common_1.Get)('teacher/:teacherId/leaser-periods'),
    __param(0, (0, common_1.Param)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getLeaserPeriodsForTeacher", null);
__decorate([
    (0, common_1.Post)('periods/substitute'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [timetable_dto_1.SaveSubstituteDto]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "saveSubstituteForPeriod", null);
__decorate([
    (0, common_1.Post)('periods/save'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [timetable_dto_1.SaveTimetablePeriodsDto]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "saveTimetablePeriods", null);
__decorate([
    (0, common_1.Get)('teachers/:id/skills'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getTeacherSkills", null);
__decorate([
    (0, common_1.Get)('teachers/subject-in-class'),
    __param(0, (0, common_1.Query)('subjectId')),
    __param(1, (0, common_1.Query)('classSectionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getTeachersForSubjectInClass", null);
__decorate([
    (0, common_1.Get)('skill-level-options'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getSkillLevelOptions", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.TEACHER, client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Get)('my-schedule'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TimetableController.prototype, "getMySchedule", null);
exports.TimetableController = TimetableController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('timetable'),
    __metadata("design:paramtypes", [timetable_service_1.TimetableService])
], TimetableController);
//# sourceMappingURL=timetable.controller.js.map