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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeworkService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const tenant_context_1 = require("../tenants/tenant.context");
const role_filter_helper_1 = require("../common/role-filter.helper");
let HomeworkService = class HomeworkService {
    constructor(prisma, roleFilterHelper) {
        this.prisma = prisma;
        this.roleFilterHelper = roleFilterHelper;
    }
    getTenantId() {
        const tenantId = tenant_context_1.TenantContext.getTenantId();
        if (!tenantId) {
            throw new common_1.BadRequestException('No active school tenant context found.');
        }
        return tenantId;
    }
    async logAction(userId, tenantId, action, entityName, entityId, details) {
        await this.prisma.activityLog.create({
            data: {
                userId,
                tenantId,
                action,
                entityName,
                entityId: entityId || null,
                details: details ? JSON.stringify(details) : null,
            },
        });
    }
    async getHomeworks(userId, role) {
        const tenantId = this.getTenantId();
        if (this.roleFilterHelper.isTeacher(role)) {
            const scope = await this.roleFilterHelper.buildTeacherScope(userId, tenantId);
            return this.prisma.homework.findMany({
                where: { tenantId, teacherId: scope.staff.id },
                include: {
                    classSection: { include: { class: true, section: true } },
                    subject: true,
                },
                orderBy: { dueDate: 'asc' },
            });
        }
        return this.prisma.homework.findMany({
            where: { tenantId },
            include: {
                classSection: { include: { class: true, section: true } },
                subject: true,
            },
            orderBy: { dueDate: 'asc' },
        });
    }
    async getHomeworkClasses(userId, role) {
        const tenantId = this.getTenantId();
        if (this.roleFilterHelper.isTeacher(role)) {
            const scope = await this.roleFilterHelper.buildTeacherScope(userId, tenantId);
            if (scope.assignedClassSectionIds.length === 0)
                return [];
            const [assignments, periods] = await Promise.all([
                this.prisma.teacherAssignment.findMany({
                    where: { tenantId, teacherId: scope.staff.id },
                    include: {
                        classSection: { include: { class: true, section: true } },
                        subject: true,
                    },
                }),
                this.prisma.period.findMany({
                    where: { tenantId, teacherId: scope.staff.id },
                    include: {
                        classSection: { include: { class: true, section: true } },
                        subject: true,
                    },
                }),
            ]);
            const classMap = new Map();
            assignments.forEach(a => {
                const key = `${a.classSectionId}-${a.subjectId}`;
                classMap.set(key, {
                    classSectionId: a.classSectionId,
                    subjectId: a.subjectId,
                    className: `${a.classSection.class.name} - ${a.classSection.section.name}`,
                    subjectName: a.subject.name,
                });
            });
            periods.forEach(p => {
                const key = `${p.classSectionId}-${p.subjectId}`;
                if (!classMap.has(key)) {
                    classMap.set(key, {
                        classSectionId: p.classSectionId,
                        subjectId: p.subjectId,
                        className: `${p.classSection.class.name} - ${p.classSection.section.name}`,
                        subjectName: p.subject.name,
                    });
                }
            });
            const list = Array.from(classMap.values());
            list.sort((x, y) => x.className.localeCompare(y.className));
            return list;
        }
        const classSections = await this.prisma.classSection.findMany({
            where: { tenantId },
            include: { class: true, section: true },
        });
        const subjects = await this.prisma.subject.findMany({
            where: { tenantId, isActive: true },
        });
        const results = [];
        classSections.forEach(cs => {
            subjects.forEach(sub => {
                results.push({
                    classSectionId: cs.id,
                    subjectId: sub.id,
                    className: `${cs.class.name} - ${cs.section.name}`,
                    subjectName: sub.name,
                });
            });
        });
        return results;
    }
    async createHomework(userId, role, data) {
        const tenantId = this.getTenantId();
        if (this.roleFilterHelper.isTeacher(role)) {
            const scope = await this.roleFilterHelper.buildTeacherScope(userId, tenantId);
            await this.roleFilterHelper.validateTeacherAssignment(scope.staff.id, data.classSectionId, data.subjectId, tenantId);
            const homework = await this.prisma.homework.create({
                data: {
                    title: data.title,
                    description: data.description,
                    dueDate: new Date(data.dueDate),
                    allowLateSubmission: data.allowLateSubmission || false,
                    maxMarks: data.maxMarks || 100,
                    assignmentType: data.assignmentType || 'Homework',
                    status: data.status || 'Published',
                    visibleFrom: data.visibleFrom ? new Date(data.visibleFrom) : new Date(),
                    attachments: data.attachments || [],
                    classSectionId: data.classSectionId,
                    subjectId: data.subjectId,
                    teacherId: scope.staff.id,
                    tenantId,
                    createdBy: scope.staff['user']?.name || 'Teacher',
                    updatedBy: scope.staff['user']?.name || 'Teacher',
                },
            });
            const students = await this.prisma.studentProfile.findMany({
                where: { tenantId, classSectionId: data.classSectionId },
                select: { userId: true },
            });
            if (students.length > 0) {
                await this.prisma.notification.createMany({
                    data: students.map(s => ({
                        title: `New Assignment: ${data.title}`,
                        message: `Subject: ${data.subjectName || 'Assignment'}. Due date: ${data.dueDate}. Max Marks: ${data.maxMarks || 100}.`,
                        type: 'IN_APP',
                        recipientId: s.userId,
                    })),
                });
            }
            await this.logAction(userId, tenantId, 'RECORD_CREATE', 'Homework', homework.id, data);
            return homework;
        }
        let finalTeacherId = data.teacherId;
        if (!finalTeacherId) {
            const firstStaff = await this.prisma.staffProfile.findFirst({ where: { tenantId } });
            if (!firstStaff) {
                throw new common_1.BadRequestException('No teacher/staff profile exists for this school. Please register a teacher first.');
            }
            finalTeacherId = firstStaff.id;
        }
        const homework = await this.prisma.homework.create({
            data: {
                title: data.title,
                description: data.description,
                dueDate: new Date(data.dueDate),
                allowLateSubmission: data.allowLateSubmission || false,
                maxMarks: data.maxMarks || 100,
                assignmentType: data.assignmentType || 'Homework',
                status: data.status || 'Published',
                visibleFrom: data.visibleFrom ? new Date(data.visibleFrom) : new Date(),
                attachments: data.attachments || [],
                classSectionId: data.classSectionId,
                subjectId: data.subjectId,
                teacherId: finalTeacherId,
                tenantId,
                createdBy: 'Admin',
                updatedBy: 'Admin',
            },
        });
        await this.logAction(userId, tenantId, 'RECORD_CREATE', 'Homework', homework.id, data);
        return homework;
    }
    async updateHomework(userId, role, id, data) {
        const tenantId = this.getTenantId();
        if (this.roleFilterHelper.isTeacher(role)) {
            const scope = await this.roleFilterHelper.buildTeacherScope(userId, tenantId);
            const existing = await this.prisma.homework.findFirst({
                where: { id, tenantId, teacherId: scope.staff.id },
            });
            if (!existing) {
                throw new common_1.NotFoundException('Homework not found or permissions denied.');
            }
            const homework = await this.prisma.homework.update({
                where: { id },
                data: {
                    title: data.title !== undefined ? data.title : undefined,
                    description: data.description !== undefined ? data.description : undefined,
                    dueDate: data.dueDate !== undefined ? new Date(data.dueDate) : undefined,
                    allowLateSubmission: data.allowLateSubmission !== undefined ? data.allowLateSubmission : undefined,
                    maxMarks: data.maxMarks !== undefined ? data.maxMarks : undefined,
                    assignmentType: data.assignmentType !== undefined ? data.assignmentType : undefined,
                    status: data.status !== undefined ? data.status : undefined,
                    visibleFrom: data.visibleFrom !== undefined ? new Date(data.visibleFrom) : undefined,
                    attachments: data.attachments !== undefined ? data.attachments : undefined,
                    updatedBy: scope.staff['user']?.name || 'Teacher',
                },
            });
            await this.logAction(userId, tenantId, 'RECORD_UPDATE', 'Homework', id, data);
            return homework;
        }
        const existing = await this.prisma.homework.findFirst({
            where: { id, tenantId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Homework not found.');
        }
        const homework = await this.prisma.homework.update({
            where: { id },
            data: {
                title: data.title !== undefined ? data.title : undefined,
                description: data.description !== undefined ? data.description : undefined,
                dueDate: data.dueDate !== undefined ? new Date(data.dueDate) : undefined,
                allowLateSubmission: data.allowLateSubmission !== undefined ? data.allowLateSubmission : undefined,
                maxMarks: data.maxMarks !== undefined ? data.maxMarks : undefined,
                assignmentType: data.assignmentType !== undefined ? data.assignmentType : undefined,
                status: data.status !== undefined ? data.status : undefined,
                visibleFrom: data.visibleFrom !== undefined ? new Date(data.visibleFrom) : undefined,
                attachments: data.attachments !== undefined ? data.attachments : undefined,
                updatedBy: 'Admin',
            },
        });
        await this.logAction(userId, tenantId, 'RECORD_UPDATE', 'Homework', id, data);
        return homework;
    }
    async deleteHomework(userId, role, id) {
        const tenantId = this.getTenantId();
        if (this.roleFilterHelper.isTeacher(role)) {
            const scope = await this.roleFilterHelper.buildTeacherScope(userId, tenantId);
            const existing = await this.prisma.homework.findFirst({
                where: { id, tenantId, teacherId: scope.staff.id },
            });
            if (!existing) {
                throw new common_1.NotFoundException('Homework not found or permissions denied.');
            }
            await this.prisma.homework.delete({ where: { id } });
            await this.logAction(userId, tenantId, 'RECORD_DELETE', 'Homework', id);
            return { success: true };
        }
        const existing = await this.prisma.homework.findFirst({
            where: { id, tenantId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Homework not found.');
        }
        await this.prisma.homework.delete({ where: { id } });
        await this.logAction(userId, tenantId, 'RECORD_DELETE', 'Homework', id);
        return { success: true };
    }
};
exports.HomeworkService = HomeworkService;
exports.HomeworkService = HomeworkService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        role_filter_helper_1.RoleFilterHelper])
], HomeworkService);
//# sourceMappingURL=homework.service.js.map