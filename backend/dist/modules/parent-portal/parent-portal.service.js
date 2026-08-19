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
exports.ParentPortalService = void 0;
const common_1 = require("@nestjs/common");
let ParentPortalService = class ParentPortalService {
    constructor(billingRepo, opsRepo) {
        this.billingRepo = billingRepo;
        this.opsRepo = opsRepo;
    }
    async getDashboardStats(userId, tenantId) {
        return { childrenCount: 1, pendingFees: 0, newAnnouncements: 0 };
    }
    async getChildren(userId) {
        return [
            { id: 'student-1', name: 'Alex Smith', class: 'Grade 10', rollNo: '101' },
        ];
    }
    async getChildDashboard(userId, studentId) {
        return { studentId, name: 'Alex Smith', attendancePercentage: 92, pendingFees: 0 };
    }
    async getAttendance(userId, studentId) {
        return [];
    }
    async getHomework(userId, studentId) {
        return [];
    }
    async submitAssignment(userId, studentId, homeworkId, base64File, fileName) {
        return { success: true, studentId, homeworkId, fileName };
    }
    async getExams(userId, studentId) {
        return [];
    }
    async getFees(userId, studentId) {
        const list = await this.billingRepo.findInvoicesByStudent(studentId);
        return list || [];
    }
    async payInvoice(userId, studentId, invoiceId, data) {
        return this.billingRepo.updateInvoiceStatus(invoiceId, 'PAID', data.amount);
    }
    async generateInvoicePdf(userId, studentId, invoiceId, res) {
        return { invoiceId, status: 'GENERATED' };
    }
    async getTimetable(userId, studentId) {
        return [];
    }
    async getAnnouncements(userId, studentId) {
        return [];
    }
    async getTeacherComplaints(userId, studentId) {
        return [];
    }
    async getComplaints(userId) {
        return [];
    }
    async submitComplaint(userId, tenantId, data) {
        const tid = tenantId || 'tenant-test-001';
        return this.opsRepo.createComplaint({ ...data, createdById: userId, tenantId: tid });
    }
    async getTransport(userId, studentId) {
        return { routeName: 'Bus Route 12', stopName: 'Main Square' };
    }
    async getLeavesHistory(userId, studentId) {
        return [];
    }
    async submitLeaveRequest(userId, studentId, data) {
        return { id: 'leave-' + Date.now(), studentId, ...data, status: 'PENDING' };
    }
};
exports.ParentPortalService = ParentPortalService;
exports.ParentPortalService = ParentPortalService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IBillingRepository')),
    __param(1, (0, common_1.Inject)('IOperationsRepository')),
    __metadata("design:paramtypes", [Object, Object])
], ParentPortalService);
//# sourceMappingURL=parent-portal.service.js.map