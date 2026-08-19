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
exports.ComplaintBoxController = void 0;
const common_1 = require("@nestjs/common");
const complaint_box_service_1 = require("./complaint-box.service");
const swagger_1 = require("@nestjs/swagger");
let ComplaintBoxController = class ComplaintBoxController {
    constructor(complaintBoxService) {
        this.complaintBoxService = complaintBoxService;
    }
    getCurrentTeacher() {
        return this.complaintBoxService.getCurrentTeacher();
    }
    getStudentClasses() {
        return this.complaintBoxService.getStudentClasses();
    }
    getTeachers() {
        return this.complaintBoxService.getTeachers();
    }
    getStudentsByClass(classSectionId) {
        return this.complaintBoxService.getStudentsByClass(classSectionId);
    }
    searchStudents(searchTerm, classId, sectionId) {
        return this.complaintBoxService.searchStudents(searchTerm, classId, sectionId);
    }
    submitStudentBehavior(dto, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.complaintBoxService.submitStudentBehavior(dto, tenantId);
    }
    getAcademicYears() {
        return this.complaintBoxService.getAcademicYears();
    }
    getPendingCases(academicYear, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.complaintBoxService.getPendingCases(academicYear, tenantId);
    }
    getStudentCases(studentId, academicYear) {
        return this.complaintBoxService.getStudentCases(studentId, academicYear);
    }
    updateCaseStatus(caseId, dto) {
        return this.complaintBoxService.updateCaseStatus(caseId, dto);
    }
    getStudentStats(studentId) {
        return this.complaintBoxService.getStudentStats(studentId);
    }
    updateBehavior(caseId, dto) {
        return this.complaintBoxService.updateBehavior(caseId, dto);
    }
    deleteBehavior(caseId) {
        return this.complaintBoxService.deleteBehavior(caseId);
    }
    getParentComplaints(status, req) {
        const tenantId = req?.user?.tenantId || 'tenant-test-001';
        return this.complaintBoxService.getParentComplaints(status, tenantId);
    }
    updateParentComplaintStatus(id, data) {
        return this.complaintBoxService.updateParentComplaintStatus(id, data);
    }
};
exports.ComplaintBoxController = ComplaintBoxController;
__decorate([
    (0, common_1.Get)('current-teacher'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ComplaintBoxController.prototype, "getCurrentTeacher", null);
__decorate([
    (0, common_1.Get)('student-classes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ComplaintBoxController.prototype, "getStudentClasses", null);
__decorate([
    (0, common_1.Get)('teachers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ComplaintBoxController.prototype, "getTeachers", null);
__decorate([
    (0, common_1.Get)('students-by-class/:classSectionId'),
    __param(0, (0, common_1.Param)('classSectionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ComplaintBoxController.prototype, "getStudentsByClass", null);
__decorate([
    (0, common_1.Get)('search-students'),
    __param(0, (0, common_1.Query)('searchTerm')),
    __param(1, (0, common_1.Query)('classId')),
    __param(2, (0, common_1.Query)('sectionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ComplaintBoxController.prototype, "searchStudents", null);
__decorate([
    (0, common_1.Post)('submit-behavior'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ComplaintBoxController.prototype, "submitStudentBehavior", null);
__decorate([
    (0, common_1.Get)('academic-years'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ComplaintBoxController.prototype, "getAcademicYears", null);
__decorate([
    (0, common_1.Get)('pending-cases'),
    __param(0, (0, common_1.Query)('academicYear')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ComplaintBoxController.prototype, "getPendingCases", null);
__decorate([
    (0, common_1.Get)('student-cases/:studentId'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)('academicYear')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ComplaintBoxController.prototype, "getStudentCases", null);
__decorate([
    (0, common_1.Patch)('case-status/:caseId'),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ComplaintBoxController.prototype, "updateCaseStatus", null);
__decorate([
    (0, common_1.Get)('student-stats/:studentId'),
    __param(0, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ComplaintBoxController.prototype, "getStudentStats", null);
__decorate([
    (0, common_1.Patch)('behavior/:caseId'),
    __param(0, (0, common_1.Param)('caseId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ComplaintBoxController.prototype, "updateBehavior", null);
__decorate([
    (0, common_1.Delete)('behavior/:caseId'),
    __param(0, (0, common_1.Param)('caseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ComplaintBoxController.prototype, "deleteBehavior", null);
__decorate([
    (0, common_1.Get)('parent-complaints'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ComplaintBoxController.prototype, "getParentComplaints", null);
__decorate([
    (0, common_1.Patch)('parent-complaints/:id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ComplaintBoxController.prototype, "updateParentComplaintStatus", null);
exports.ComplaintBoxController = ComplaintBoxController = __decorate([
    (0, swagger_1.ApiTags)('Complaint Box'),
    (0, common_1.Controller)('complaint-box'),
    __metadata("design:paramtypes", [complaint_box_service_1.ComplaintBoxService])
], ComplaintBoxController);
//# sourceMappingURL=complaint-box.controller.js.map