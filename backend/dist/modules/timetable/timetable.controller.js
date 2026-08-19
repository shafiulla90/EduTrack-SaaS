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
const timetable_dto_1 = require("./dto/timetable.dto");
let TimetableController = class TimetableController {
    constructor(timetableService) {
        this.timetableService = timetableService;
    }
    getTenantId(req) {
        return req?.user?.tenantId || 'tenant-test-001';
    }
    getAcademicYears(req) {
        return this.timetableService.getAcademicYears(this.getTenantId(req));
    }
    getClasses(req) {
        return this.timetableService.getClasses(this.getTenantId(req));
    }
    createClass(dto, req) {
        return this.timetableService.createClass(this.getTenantId(req), dto.name);
    }
    deleteClass(id, req) {
        return this.timetableService.deleteClass(this.getTenantId(req), id);
    }
    getSections(req) {
        return this.timetableService.getSections(this.getTenantId(req));
    }
    createSection(dto, req) {
        return this.timetableService.createSection(this.getTenantId(req), dto.name);
    }
    deleteSection(id, req) {
        return this.timetableService.deleteSection(this.getTenantId(req), id);
    }
    getPeriodTimings(req) {
        return this.timetableService.getPeriodTimings(this.getTenantId(req));
    }
    savePeriodTimings(dto, req) {
        return this.timetableService.savePeriodTimings(this.getTenantId(req), dto);
    }
    getTimetableConfig(req) {
        return this.timetableService.getTimetableConfig(this.getTenantId(req));
    }
    checkExistingTimetables(req) {
        return this.timetableService.checkExistingTimetables(this.getTenantId(req));
    }
    saveTimetableConfig(dto, req) {
        return this.timetableService.saveTimetableConfig(this.getTenantId(req), dto);
    }
    getSubjects(req) {
        return this.timetableService.getSubjects(this.getTenantId(req));
    }
    createSubject(dto, req) {
        return this.timetableService.createSubject(this.getTenantId(req), dto);
    }
    deleteSubject(id, req) {
        return this.timetableService.deleteSubject(this.getTenantId(req), id);
    }
    bulkCreateSubjects(dto, req) {
        return this.timetableService.bulkCreateSubjects(this.getTenantId(req), dto.subjects);
    }
    getTeachersForSubject(subjectIds, req) {
        const ids = subjectIds ? subjectIds.split(',') : [];
        return this.timetableService.getTeachersForSubject(this.getTenantId(req), ids);
    }
    createTeacher(dto, req) {
        return this.timetableService.createTeacherWithSkills(this.getTenantId(req), dto);
    }
    bulkCreateTeachers(dto, req) {
        return this.timetableService.bulkCreateTeachers(this.getTenantId(req), dto.teachers);
    }
    getWorkloadSummary(academicYearId, req) {
        return this.timetableService.getWorkloadSummary(this.getTenantId(req), academicYearId);
    }
    getAllTeacherWorkloads(req) {
        return this.timetableService.getAllTeacherWorkloads(this.getTenantId(req));
    }
    getAllClassWorkloads(req) {
        return this.timetableService.getAllClassWorkloads(this.getTenantId(req));
    }
    getTeacherWorkload(id, req) {
        return this.timetableService.getTeacherWorkload(this.getTenantId(req), id);
    }
    getClassSectionWorkload(id, req) {
        return this.timetableService.getClassSectionWorkload(this.getTenantId(req), id);
    }
    updateTeacherAssignment(id, dto, req) {
        return this.timetableService.updateTeacherAssignment(this.getTenantId(req), id, dto.newTeacherId, dto.periodsPerWeek);
    }
    deleteTeacherAssignment(id, req) {
        return this.timetableService.deleteTeacherAssignment(this.getTenantId(req), id);
    }
    createClassSection(dto, req) {
        return this.timetableService.createClassSection(this.getTenantId(req), dto);
    }
    getAllClassSections(req) {
        return this.timetableService.getAllClassSections(this.getTenantId(req));
    }
    getAllTeachers(req) {
        return this.timetableService.getAllTeachers(this.getTenantId(req));
    }
    getPeriodsForClassSection(classSectionId, academicYearId, req, startDate, endDate) {
        return this.timetableService.getTimetableForClass(this.getTenantId(req), classSectionId, academicYearId, startDate, endDate);
    }
    getPeriodsForTeacher(teacherId, gaps, req) {
        if (gaps === 'true') {
            return this.timetableService.getPeriodsForTeacherWithGaps(this.getTenantId(req), teacherId);
        }
        return this.timetableService.getPeriodsForTeacher(this.getTenantId(req), teacherId);
    }
    getLeaserPeriodsForTeacher(teacherId, req) {
        return this.timetableService.getLeaserPeriodsForTeacher(this.getTenantId(req), teacherId);
    }
    saveSubstituteForPeriod(dto, req) {
        return this.timetableService.saveSubstituteForPeriod(this.getTenantId(req), dto.periodId, dto.substituteTeacherId);
    }
    saveTimetablePeriods(dto, req) {
        return this.timetableService.saveTimetablePeriods(this.getTenantId(req), dto);
    }
};
exports.TimetableController = TimetableController;
__decorate([
    (0, common_1.Get)('academic-years'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getAcademicYears", null);
__decorate([
    (0, common_1.Get)('classes'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getClasses", null);
__decorate([
    (0, common_1.Post)('classes'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [timetable_dto_1.CreateClassDto, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "createClass", null);
__decorate([
    (0, common_1.Delete)('classes/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "deleteClass", null);
__decorate([
    (0, common_1.Get)('sections'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getSections", null);
__decorate([
    (0, common_1.Post)('sections'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [timetable_dto_1.CreateSectionDto, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "createSection", null);
__decorate([
    (0, common_1.Delete)('sections/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "deleteSection", null);
__decorate([
    (0, common_1.Get)('period-timings'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getPeriodTimings", null);
__decorate([
    (0, common_1.Post)('period-timings'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "savePeriodTimings", null);
__decorate([
    (0, common_1.Get)('config'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getTimetableConfig", null);
__decorate([
    (0, common_1.Get)('config/check-existing'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "checkExistingTimetables", null);
__decorate([
    (0, common_1.Post)('config'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "saveTimetableConfig", null);
__decorate([
    (0, common_1.Get)('subjects'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getSubjects", null);
__decorate([
    (0, common_1.Post)('subjects'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [timetable_dto_1.CreateSubjectDto, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "createSubject", null);
__decorate([
    (0, common_1.Delete)('subjects/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "deleteSubject", null);
__decorate([
    (0, common_1.Post)('subjects/bulk'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [timetable_dto_1.BulkSubjectsInputDto, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "bulkCreateSubjects", null);
__decorate([
    (0, common_1.Get)('teachers/subject'),
    __param(0, (0, common_1.Query)('subjectIds')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getTeachersForSubject", null);
__decorate([
    (0, common_1.Post)('teachers'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [timetable_dto_1.CreateTeacherWithSkillsDto, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "createTeacher", null);
__decorate([
    (0, common_1.Post)('teachers/bulk'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [timetable_dto_1.BulkTeachersInputDto, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "bulkCreateTeachers", null);
__decorate([
    (0, common_1.Get)('workload/summary'),
    __param(0, (0, common_1.Query)('academicYearId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getWorkloadSummary", null);
__decorate([
    (0, common_1.Get)('workload/teachers'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getAllTeacherWorkloads", null);
__decorate([
    (0, common_1.Get)('workload/classes'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getAllClassWorkloads", null);
__decorate([
    (0, common_1.Get)('workload/teacher/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getTeacherWorkload", null);
__decorate([
    (0, common_1.Get)('workload/class-section/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getClassSectionWorkload", null);
__decorate([
    (0, common_1.Patch)('assignments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, timetable_dto_1.UpdateTeacherAssignmentDto, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "updateTeacherAssignment", null);
__decorate([
    (0, common_1.Delete)('assignments/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "deleteTeacherAssignment", null);
__decorate([
    (0, common_1.Post)('class-sections'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [timetable_dto_1.CreateClassSectionDto, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "createClassSection", null);
__decorate([
    (0, common_1.Get)('class-sections'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getAllClassSections", null);
__decorate([
    (0, common_1.Get)('teachers'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getAllTeachers", null);
__decorate([
    (0, common_1.Get)('class/:classSectionId/periods'),
    __param(0, (0, common_1.Param)('classSectionId')),
    __param(1, (0, common_1.Query)('academicYearId')),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, String, String]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getPeriodsForClassSection", null);
__decorate([
    (0, common_1.Get)('teacher/:teacherId/periods'),
    __param(0, (0, common_1.Param)('teacherId')),
    __param(1, (0, common_1.Query)('gaps')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getPeriodsForTeacher", null);
__decorate([
    (0, common_1.Get)('teacher/:teacherId/leaser-periods'),
    __param(0, (0, common_1.Param)('teacherId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "getLeaserPeriodsForTeacher", null);
__decorate([
    (0, common_1.Post)('periods/substitute'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [timetable_dto_1.SaveSubstituteDto, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "saveSubstituteForPeriod", null);
__decorate([
    (0, common_1.Post)('periods/save'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [timetable_dto_1.SaveTimetablePeriodsDto, Object]),
    __metadata("design:returntype", void 0)
], TimetableController.prototype, "saveTimetablePeriods", null);
exports.TimetableController = TimetableController = __decorate([
    (0, common_1.Controller)('timetable'),
    __metadata("design:paramtypes", [timetable_service_1.TimetableService])
], TimetableController);
//# sourceMappingURL=timetable.controller.js.map