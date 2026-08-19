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
exports.ComplaintBoxService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const tenant_context_1 = require("../tenants/tenant.context");
const common_2 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
let ComplaintBoxService = class ComplaintBoxService {
    constructor(prisma, request) {
        this.prisma = prisma;
        this.request = request;
    }
    getTenantId() {
        const tenantId = tenant_context_1.TenantContext.getTenantId();
        if (!tenantId) {
            throw new common_1.BadRequestException('No active tenant context');
        }
        return tenantId;
    }
    async getCurrentTeacher() {
        const tenantId = this.getTenantId();
        const user = this.request.user;
        if (!user || !user.id) {
            throw new common_1.BadRequestException('User not authenticated');
        }
        const profile = await this.prisma.staffProfile.findUnique({
            where: { userId: user.id },
            include: { user: true },
        });
        if (!profile || profile.user.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Teacher profile not found');
        }
        return profile;
    }
    async getStudentClasses() {
        const tenantId = this.getTenantId();
        const user = this.request.user;
        if (user.role === 'TEACHER') {
            const staffProfile = await this.prisma.staffProfile.findUnique({
                where: { userId: user.id },
                include: {
                    classSections: { select: { id: true } },
                    teacherAssignments: { select: { classSectionId: true } },
                },
            });
            if (!staffProfile) {
                return [];
            }
            const advisorClassIds = staffProfile.classSections.map(cs => cs.id);
            const assignedClassIds = staffProfile.teacherAssignments.map(ta => ta.classSectionId);
            const classSectionIds = Array.from(new Set([...advisorClassIds, ...assignedClassIds]));
            return this.prisma.classSection.findMany({
                where: { tenantId, id: { in: classSectionIds } },
                include: { class: true, section: true },
                orderBy: { class: { name: 'asc' } },
            });
        }
        return this.prisma.classSection.findMany({
            where: { tenantId },
            include: { class: true, section: true },
            orderBy: { class: { name: 'asc' } },
        });
    }
    async getTeachers() {
        const tenantId = this.getTenantId();
        return this.prisma.staffProfile.findMany({
            where: { user: { tenantId, role: 'TEACHER', isActive: true } },
            include: {
                user: { select: { id: true, name: true, email: true, phone: true } },
            },
            orderBy: { user: { name: 'asc' } },
        });
    }
    async getStudentsByClass(classSectionId) {
        const tenantId = this.getTenantId();
        const user = this.request.user;
        if (user.role === 'TEACHER') {
            const staffProfile = await this.prisma.staffProfile.findUnique({
                where: { userId: user.id },
                include: {
                    classSections: { select: { id: true } },
                    teacherAssignments: { select: { classSectionId: true } },
                },
            });
            if (!staffProfile) {
                throw new common_1.ForbiddenException('Teacher profile not found.');
            }
            const advisorClassIds = staffProfile.classSections.map(cs => cs.id);
            const assignedClassIds = staffProfile.teacherAssignments.map(ta => ta.classSectionId);
            const classSectionIds = Array.from(new Set([...advisorClassIds, ...assignedClassIds]));
            if (!classSectionIds.includes(classSectionId)) {
                throw new common_1.ForbiddenException('You do not have permission to access students in this class section.');
            }
        }
        return this.prisma.studentProfile.findMany({
            where: {
                user: { tenantId },
                classSectionId,
            },
            include: { user: true, classSection: { include: { class: true, section: true } } },
            orderBy: { user: { name: 'asc' } },
        });
    }
    async searchStudents(searchTerm, classId, sectionId) {
        const tenantId = this.getTenantId();
        const user = this.request.user;
        const filter = {
            user: { tenantId, isActive: true }
        };
        if (user.role === 'TEACHER') {
            const staffProfile = await this.prisma.staffProfile.findUnique({
                where: { userId: user.id },
                include: {
                    classSections: { select: { id: true } },
                    teacherAssignments: { select: { classSectionId: true } },
                },
            });
            if (!staffProfile) {
                return [];
            }
            const advisorClassIds = staffProfile.classSections.map(cs => cs.id);
            const assignedClassIds = staffProfile.teacherAssignments.map(ta => ta.classSectionId);
            const classSectionIds = Array.from(new Set([...advisorClassIds, ...assignedClassIds]));
            filter.classSectionId = { in: classSectionIds };
        }
        if (classId || sectionId) {
            filter.classSection = {
                classId: classId || undefined,
                sectionId: sectionId || undefined,
            };
        }
        if (searchTerm) {
            filter.OR = [
                { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
                { user: { email: { contains: searchTerm, mode: 'insensitive' } } },
                { user: { phone: { contains: searchTerm, mode: 'insensitive' } } },
            ];
        }
        return this.prisma.studentProfile.findMany({
            where: filter,
            include: {
                user: { select: { id: true, name: true, email: true, phone: true } },
                classSection: { include: { class: true, section: true } },
            },
            orderBy: { user: { name: 'asc' } },
            take: 200,
        });
    }
    async submitStudentBehavior(dto) {
        const tenantId = this.getTenantId();
        const user = this.request.user;
        let teacherId = dto.teacherId;
        if (user.role === 'TEACHER') {
            const staffProfile = await this.prisma.staffProfile.findUnique({
                where: { userId: user.id },
                include: {
                    classSections: { select: { id: true } },
                    teacherAssignments: { select: { classSectionId: true } },
                },
            });
            if (!staffProfile) {
                throw new common_1.ForbiddenException('Teacher profile not found.');
            }
            teacherId = staffProfile.id;
            const student = await this.prisma.studentProfile.findUnique({
                where: { id: dto.studentId }
            });
            if (!student) {
                throw new common_1.NotFoundException('Student not found');
            }
            const advisorClassIds = staffProfile.classSections.map(cs => cs.id);
            const assignedClassIds = staffProfile.teacherAssignments.map(ta => ta.classSectionId);
            const classSectionIds = Array.from(new Set([...advisorClassIds, ...assignedClassIds]));
            if (!student.classSectionId || !classSectionIds.includes(student.classSectionId)) {
                throw new common_1.ForbiddenException('You do not have permission to log behavior for this student.');
            }
        }
        else {
            if (!teacherId) {
                try {
                    const current = await this.getCurrentTeacher();
                    teacherId = current.id;
                }
                catch {
                    teacherId = undefined;
                }
            }
        }
        const priority = dto.behaviorType === 'Complaint' ? 'High' : 'Medium';
        return this.prisma.behaviorCase.create({
            data: {
                tenantId,
                studentId: dto.studentId,
                teacherId,
                behaviorType: dto.behaviorType,
                category: dto.category,
                academicYear: dto.academicYear,
                status: 'New',
                priority,
                description: dto.description,
            },
        });
    }
    async getAcademicYears() {
        const tenantId = this.getTenantId();
        return this.prisma.academicYear.findMany({ where: { tenantId }, orderBy: { name: 'desc' } });
    }
    async getPendingCases(academicYear) {
        const tenantId = this.getTenantId();
        const user = this.request.user;
        const filter = { tenantId };
        if (academicYear) {
            filter.academicYear = academicYear;
        }
        if (user.role === 'TEACHER') {
            const staffProfile = await this.prisma.staffProfile.findUnique({
                where: { userId: user.id },
                include: {
                    classSections: { select: { id: true } },
                    teacherAssignments: { select: { classSectionId: true } },
                },
            });
            if (staffProfile) {
                const advisorClassIds = staffProfile.classSections.map(cs => cs.id);
                const assignedClassIds = staffProfile.teacherAssignments.map(ta => ta.classSectionId);
                const classSectionIds = Array.from(new Set([...advisorClassIds, ...assignedClassIds]));
                filter.OR = [
                    { teacherId: staffProfile.id },
                    { student: { classSectionId: { in: classSectionIds } } }
                ];
            }
            else {
                return [];
            }
        }
        return this.prisma.behaviorCase.findMany({
            where: filter,
            include: {
                student: {
                    include: {
                        user: { select: { name: true } },
                        classSection: { include: { class: true, section: true } },
                    },
                },
                teacher: {
                    include: {
                        user: { select: { name: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getStudentCases(studentId, academicYear) {
        const tenantId = this.getTenantId();
        const user = this.request.user;
        const filter = { tenantId, studentId };
        if (academicYear) {
            filter.academicYear = academicYear;
        }
        if (user.role === 'TEACHER') {
            const staffProfile = await this.prisma.staffProfile.findUnique({
                where: { userId: user.id },
                include: {
                    classSections: { select: { id: true } },
                    teacherAssignments: { select: { classSectionId: true } },
                },
            });
            if (staffProfile) {
                const advisorClassIds = staffProfile.classSections.map(cs => cs.id);
                const assignedClassIds = staffProfile.teacherAssignments.map(ta => ta.classSectionId);
                const classSectionIds = Array.from(new Set([...advisorClassIds, ...assignedClassIds]));
                filter.OR = [
                    { teacherId: staffProfile.id },
                    { student: { classSectionId: { in: classSectionIds } } }
                ];
            }
            else {
                return [];
            }
        }
        return this.prisma.behaviorCase.findMany({
            where: filter,
            include: {
                student: {
                    include: {
                        user: { select: { name: true } },
                        classSection: { include: { class: true, section: true } },
                    },
                },
                teacher: {
                    include: {
                        user: { select: { name: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateCaseStatus(caseId, dto) {
        const tenantId = this.getTenantId();
        const user = this.request.user;
        if (user.role === 'TEACHER') {
            throw new common_1.ForbiddenException('Teachers are not authorized to change complaint status. This action is reserved for School Admins.');
        }
        const existing = await this.prisma.behaviorCase.findUnique({ where: { id: caseId } });
        if (!existing || existing.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Case not found');
        }
        return this.prisma.behaviorCase.update({
            where: { id: caseId },
            data: { status: dto.status },
        });
    }
    async updateBehavior(caseId, dto) {
        const tenantId = this.getTenantId();
        const user = this.request.user;
        const existing = await this.prisma.behaviorCase.findUnique({ where: { id: caseId } });
        if (!existing || existing.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Case not found');
        }
        if (user.role === 'TEACHER') {
            const staffProfile = await this.prisma.staffProfile.findUnique({
                where: { userId: user.id }
            });
            if (!staffProfile || existing.teacherId !== staffProfile.id) {
                throw new common_1.ForbiddenException('You do not have permission to edit this complaint.');
            }
        }
        const priority = dto.behaviorType === 'Complaint' ? 'High' : 'Medium';
        return this.prisma.behaviorCase.update({
            where: { id: caseId },
            data: {
                studentId: dto.studentId,
                behaviorType: dto.behaviorType,
                category: dto.category,
                academicYear: dto.academicYear,
                description: dto.description,
                teacherId: dto.teacherId,
                priority,
            },
        });
    }
    async deleteBehavior(caseId) {
        const tenantId = this.getTenantId();
        const user = this.request.user;
        const existing = await this.prisma.behaviorCase.findUnique({ where: { id: caseId } });
        if (!existing || existing.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Case not found');
        }
        if (user.role === 'TEACHER') {
            const staffProfile = await this.prisma.staffProfile.findUnique({
                where: { userId: user.id }
            });
            if (!staffProfile || existing.teacherId !== staffProfile.id) {
                throw new common_1.ForbiddenException('You do not have permission to delete this complaint.');
            }
        }
        return this.prisma.behaviorCase.delete({
            where: { id: caseId },
        });
    }
    async getStudentStats(studentId) {
        const tenantId = this.getTenantId();
        const user = this.request.user;
        if (user.role === 'TEACHER') {
            const staffProfile = await this.prisma.staffProfile.findUnique({
                where: { userId: user.id },
                include: {
                    classSections: { select: { id: true } },
                    teacherAssignments: { select: { classSectionId: true } },
                },
            });
            if (staffProfile) {
                const advisorClassIds = staffProfile.classSections.map(cs => cs.id);
                const assignedClassIds = staffProfile.teacherAssignments.map(ta => ta.classSectionId);
                const classSectionIds = Array.from(new Set([...advisorClassIds, ...assignedClassIds]));
                const student = await this.prisma.studentProfile.findUnique({ where: { id: studentId } });
                if (!student || !student.classSectionId || !classSectionIds.includes(student.classSectionId)) {
                    return { studentId, totalCases: 0, complaintCount: 0, praiseCount: 0, resolvedCount: 0 };
                }
            }
            else {
                return { studentId, totalCases: 0, complaintCount: 0, praiseCount: 0, resolvedCount: 0 };
            }
        }
        const total = await this.prisma.behaviorCase.count({ where: { tenantId, studentId } });
        const complaintCount = await this.prisma.behaviorCase.count({
            where: { tenantId, studentId, behaviorType: 'Complaint' },
        });
        const praiseCount = await this.prisma.behaviorCase.count({
            where: { tenantId, studentId, behaviorType: 'Praise' },
        });
        const resolvedCount = await this.prisma.behaviorCase.count({
            where: { tenantId, studentId, status: 'Closed' },
        });
        return { studentId, totalCases: total, complaintCount, praiseCount, resolvedCount };
    }
    async getParentComplaints(statusFilter) {
        const tenantId = this.getTenantId();
        const filter = { tenantId };
        if (statusFilter && statusFilter !== 'All') {
            filter.status = statusFilter;
        }
        const complaints = await this.prisma.complaint.findMany({
            where: filter,
            include: {
                submittedBy: { select: { id: true, name: true, email: true, phone: true } },
                assignedTo: { select: { id: true, name: true } },
                academicYear: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        const complaintIds = complaints.map(c => c.id);
        const histories = await this.prisma.statusHistory.findMany({
            where: { entityType: 'COMPLAINT', entityId: { in: complaintIds } },
            include: { updatedBy: { select: { id: true, name: true, role: true } } },
            orderBy: { createdAt: 'asc' },
        });
        const historyMap = new Map();
        for (const h of histories) {
            if (!historyMap.has(h.entityId))
                historyMap.set(h.entityId, []);
            historyMap.get(h.entityId).push(h);
        }
        return complaints.map(c => ({
            ...c,
            statusHistories: historyMap.get(c.id) || [],
        }));
    }
    async updateParentComplaintStatus(complaintId, data) {
        const tenantId = this.getTenantId();
        const user = this.request.user;
        const existing = await this.prisma.complaint.findUnique({
            where: { id: complaintId },
            include: { submittedBy: true }
        });
        if (!existing || existing.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Complaint not found');
        }
        const newStatus = data.status || existing.status;
        const updated = await this.prisma.complaint.update({
            where: { id: complaintId },
            data: {
                status: newStatus,
                adminReply: data.adminReply !== undefined ? data.adminReply : existing.adminReply,
                resolutionNotes: data.resolutionNotes !== undefined ? data.resolutionNotes : existing.resolutionNotes,
                assignedToId: data.assignedToId !== undefined ? data.assignedToId : existing.assignedToId,
            },
        });
        await this.prisma.statusHistory.create({
            data: {
                entityType: 'COMPLAINT',
                entityId: complaintId,
                previousStatus: existing.status,
                currentStatus: newStatus,
                remarks: data.adminReply || data.resolutionNotes || `Status updated to ${newStatus}`,
                updatedById: user.id,
                tenantId,
            }
        }).catch(err => console.error('Failed to create status history for complaint:', err));
        if (existing.submittedById) {
            await this.prisma.notification.create({
                data: {
                    title: `Complaint Ticket Updated`,
                    message: `Your complaint "${existing.title}" is now ${newStatus}.${data.adminReply ? ' Admin Reply: ' + data.adminReply : ''}`,
                    type: 'COMPLAINT_UPDATE',
                    recipientId: existing.submittedById,
                }
            }).catch(err => console.error('Failed to notify parent of complaint update:', err));
        }
        return updated;
    }
};
exports.ComplaintBoxService = ComplaintBoxService;
exports.ComplaintBoxService = ComplaintBoxService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_2.Inject)(core_1.REQUEST)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], ComplaintBoxService);
//# sourceMappingURL=complaint-box.service.js.map