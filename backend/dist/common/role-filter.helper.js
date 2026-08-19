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
exports.RoleFilterHelper = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const client_1 = require("@prisma/client");
let RoleFilterHelper = class RoleFilterHelper {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async buildTeacherScope(userId, tenantId) {
        const staff = await this.prisma.staffProfile.findFirst({
            where: { userId, tenantId, user: { isActive: true } },
        });
        if (!staff) {
            throw new common_1.BadRequestException('Teacher staff profile not found. Please contact your administrator.');
        }
        const [assignments, periods] = await Promise.all([
            this.prisma.teacherAssignment.findMany({
                where: { tenantId, teacherId: staff.id },
                select: { classSectionId: true, subjectId: true },
            }),
            this.prisma.period.findMany({
                where: { tenantId, teacherId: staff.id },
                select: { classSectionId: true, subjectId: true },
            }),
        ]);
        const assignedClassSectionIds = [...new Set([
                ...assignments.map(a => a.classSectionId),
                ...periods.map(p => p.classSectionId),
            ])];
        const assignedSubjectIds = [...new Set([
                ...assignments.map(a => a.subjectId),
                ...periods.map(p => p.subjectId),
            ])];
        return { staff, assignedClassSectionIds, assignedSubjectIds };
    }
    buildAdminScope(tenantId) {
        return { tenantId };
    }
    async validateTeacherAssignment(teacherId, classSectionId, subjectId, tenantId) {
        const assignment = await this.prisma.teacherAssignment.findFirst({
            where: { teacherId, classSectionId, subjectId, tenantId },
        });
        if (assignment)
            return;
        const period = await this.prisma.period.findFirst({
            where: { teacherId, classSectionId, subjectId, tenantId },
        });
        if (!period) {
            throw new common_1.BadRequestException('You do not have teaching permissions for this class and subject combination.');
        }
    }
    isAdmin(role) {
        return role === client_1.Role.SCHOOL_ADMIN || role === client_1.Role.SUPER_ADMIN;
    }
    isTeacher(role) {
        return role === client_1.Role.TEACHER;
    }
};
exports.RoleFilterHelper = RoleFilterHelper;
exports.RoleFilterHelper = RoleFilterHelper = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoleFilterHelper);
//# sourceMappingURL=role-filter.helper.js.map