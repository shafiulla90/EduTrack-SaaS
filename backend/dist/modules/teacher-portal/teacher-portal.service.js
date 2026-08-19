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
exports.TeacherPortalService = void 0;
const common_1 = require("@nestjs/common");
let TeacherPortalService = class TeacherPortalService {
    constructor(teacherRepo, studentRepo, examRepo) {
        this.teacherRepo = teacherRepo;
        this.studentRepo = studentRepo;
        this.examRepo = examRepo;
    }
    async getDashboardStats(teacherId, tenantId) {
        return {
            totalStudents: 120,
            assignedClasses: 4,
            pendingHomeworks: 2,
            todayPeriods: 3,
        };
    }
    async getProfile(userId, tenantId) {
        return this.teacherRepo.findProfileByUserId(userId);
    }
    async updateProfile(userId, tenantId, data) {
        return { success: true, userId, ...data };
    }
    async changePassword(userId, tenantId, data) {
        return { success: true, message: 'Password updated successfully' };
    }
    async getAssignedClasses(teacherId, tenantId) {
        return [
            { id: 'cs-1', name: 'Grade 10 - Section A', classId: 'c-10', sectionId: 's-A' },
            { id: 'cs-2', name: 'Grade 9 - Section B', classId: 'c-9', sectionId: 's-B' },
        ];
    }
    async getStudentsForClassSection(teacherId, tenantId, classSectionId) {
        return this.studentRepo.findStudentsByClassSection(classSectionId);
    }
    async getClassesForAttendance(teacherId, tenantId) {
        return [
            { id: 'c-10', name: 'Grade 10' },
            { id: 'c-9', name: 'Grade 9' },
        ];
    }
    async getSectionsForAttendance(teacherId, tenantId, classVal) {
        return [
            { id: 's-A', name: 'Section A' },
            { id: 's-B', name: 'Section B' },
        ];
    }
    async getStudentsForAttendance(teacherId, tenantId, classVal, sectionVal) {
        return [];
    }
    async saveAttendanceSheet(teacherId, tenantId, data) {
        return { success: true, count: data?.students?.length || 0 };
    }
    async getAttendanceHistory(teacherId, tenantId) {
        return [];
    }
    async getExamMarksEntryList(teacherId, tenantId, subjectId, examName, classSectionId, subjectType) {
        return [];
    }
    async saveExamMarksList(teacherId, tenantId, data) {
        return { success: true, message: 'Exam marks saved successfully' };
    }
    async getTeacherWeeklySchedule(teacherId, tenantId) {
        return [];
    }
    async getHomeworks(teacherId, tenantId) {
        return [];
    }
    async createHomework(teacherId, tenantId, data) {
        return { id: 'hw-' + Date.now(), ...data, teacherId, tenantId };
    }
    async updateHomework(teacherId, tenantId, id, data) {
        return { id, ...data, teacherId, tenantId };
    }
    async deleteHomework(teacherId, tenantId, id) {
        return { success: true, id };
    }
    async sendHomeworkToParents(teacherId, tenantId, id) {
        return { success: true, id, message: 'Sent homework notifications to parents' };
    }
    async getAnnouncements(userId, tenantId) {
        return [];
    }
    async createAnnouncement(userId, tenantId, data) {
        return { id: 'ann-' + Date.now(), ...data, tenantId };
    }
    async deleteAnnouncement(userId, tenantId, id) {
        return { success: true, id };
    }
    async markAnnouncementAsRead(userId, tenantId, id) {
        return { success: true, id };
    }
    async getLeaveRequests(userId, tenantId) {
        return [];
    }
    async applyLeave(userId, tenantId, data) {
        return { id: 'leave-' + Date.now(), ...data, tenantId, status: 'PENDING' };
    }
    async cancelLeave(userId, tenantId, id) {
        return { success: true, id, status: 'CANCELLED' };
    }
    async updateLeaveStatus(userId, tenantId, id, data) {
        return { id, ...data, status: data.status || 'APPROVED' };
    }
    async getCommunicationAudience(userId, tenantId) {
        return [];
    }
    async sendBroadcastMessage(userId, tenantId, data) {
        return { success: true, message: 'Broadcast sent' };
    }
    async getCalendarTimeline(userId, tenantId, month, year) {
        return [];
    }
    async getStudentProgressDetails(userId, tenantId, studentId) {
        return { studentId, progress: 85 };
    }
    async getMySalaryDetails(userId, tenantId) {
        return { baseSalary: 25000, netPayable: 25000 };
    }
    async getMySalaryHistory(userId, tenantId) {
        return [];
    }
    async getPayslipPDFData(userId, tenantId, expenseId) {
        return { expenseId, salary: 25000 };
    }
};
exports.TeacherPortalService = TeacherPortalService;
exports.TeacherPortalService = TeacherPortalService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('ITeacherRepository')),
    __param(1, (0, common_1.Inject)('IStudentRepository')),
    __param(2, (0, common_1.Inject)('IExamRepository')),
    __metadata("design:paramtypes", [Object, Object, Object])
], TeacherPortalService);
//# sourceMappingURL=teacher-portal.service.js.map