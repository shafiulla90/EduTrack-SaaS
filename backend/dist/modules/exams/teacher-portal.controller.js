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
exports.ExamConfigController = exports.TeacherPortalController = void 0;
const common_1 = require("@nestjs/common");
const exams_service_1 = require("./exams.service");
const swagger_1 = require("@nestjs/swagger");
let TeacherPortalController = class TeacherPortalController {
    constructor(examsService) {
        this.examsService = examsService;
    }
    async getClasses() {
        return [
            { id: 'cs-1', classSectionId: 'cs-1', className: 'Grade 10', sectionName: 'Section A', name: 'Grade 10 - Section A' },
            { id: 'cs-2', classSectionId: 'cs-2', className: 'Class-2', sectionName: 'Section A', name: 'Class-2 - Section A' },
            { id: 'cs-3', classSectionId: 'cs-3', className: 'Grade 1', sectionName: 'Section A', name: 'Grade 1 - Section A' },
        ];
    }
    async getMarksEntry(subjectId, examName, classSectionId, subjectType, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.examsService.getMarksEntryRoster(tenantId, subjectId, examName, classSectionId, subjectType);
    }
    async saveMarks(body, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.examsService.saveRosterMarks(tenantId, body);
    }
};
exports.TeacherPortalController = TeacherPortalController;
__decorate([
    (0, common_1.Get)('classes'),
    (0, swagger_1.ApiOperation)({ summary: 'Get teacher classes' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getClasses", null);
__decorate([
    (0, common_1.Get)('marks/entry'),
    (0, swagger_1.ApiOperation)({ summary: 'Get marks entry roster' }),
    __param(0, (0, common_1.Query)('subjectId')),
    __param(1, (0, common_1.Query)('examName')),
    __param(2, (0, common_1.Query)('classSectionId')),
    __param(3, (0, common_1.Query)('subjectType')),
    __param(4, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "getMarksEntry", null);
__decorate([
    (0, common_1.Post)('marks/save'),
    (0, swagger_1.ApiOperation)({ summary: 'Save marks roster' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TeacherPortalController.prototype, "saveMarks", null);
exports.TeacherPortalController = TeacherPortalController = __decorate([
    (0, swagger_1.ApiTags)('Teacher Portal Marks'),
    (0, common_1.Controller)('teacher-portal'),
    __metadata("design:paramtypes", [exams_service_1.ExamsService])
], TeacherPortalController);
let ExamConfigController = class ExamConfigController {
    constructor(examsService) {
        this.examsService = examsService;
    }
    async getComponents(req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.examsService.getComponents(tenantId);
    }
};
exports.ExamConfigController = ExamConfigController;
__decorate([
    (0, common_1.Get)('components'),
    (0, swagger_1.ApiOperation)({ summary: 'Get exam components' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ExamConfigController.prototype, "getComponents", null);
exports.ExamConfigController = ExamConfigController = __decorate([
    (0, swagger_1.ApiTags)('Exam Config'),
    (0, common_1.Controller)('exam-config'),
    __metadata("design:paramtypes", [exams_service_1.ExamsService])
], ExamConfigController);
//# sourceMappingURL=teacher-portal.controller.js.map