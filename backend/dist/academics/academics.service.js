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
exports.AcademicsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const tenant_context_1 = require("../tenants/tenant.context");
let AcademicsService = class AcademicsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getTenantId() {
        const tenantId = tenant_context_1.TenantContext.getTenantId();
        if (!tenantId) {
            throw new common_1.BadRequestException('No active school tenant context found');
        }
        return tenantId;
    }
    async createAcademicYear(name, startDate, endDate, isActive) {
        const tenantId = this.getTenantId();
        if (isActive) {
            const activeYears = await this.prisma.academicYear.findMany({
                where: { tenantId, isActive: true },
                orderBy: { startDate: 'asc' },
            });
            if (activeYears.length >= 2) {
                await this.prisma.academicYear.update({
                    where: { id: activeYears[0].id },
                    data: { isActive: false },
                });
            }
        }
        return this.prisma.academicYear.create({
            data: {
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                isActive,
                tenantId,
            },
        });
    }
    async getAcademicYears() {
        const tenantId = this.getTenantId();
        return this.prisma.academicYear.findMany({
            where: { tenantId },
            orderBy: { startDate: 'desc' },
        });
    }
    async toggleAcademicYearActive(id) {
        const tenantId = this.getTenantId();
        const ay = await this.prisma.academicYear.findUnique({
            where: { id },
        });
        if (!ay || ay.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Academic year not found');
        }
        const nextActive = !ay.isActive;
        if (nextActive) {
            const activeYears = await this.prisma.academicYear.findMany({
                where: { tenantId, isActive: true },
                orderBy: { startDate: 'asc' },
            });
            if (activeYears.length >= 2) {
                await this.prisma.academicYear.update({
                    where: { id: activeYears[0].id },
                    data: { isActive: false },
                });
            }
        }
        return this.prisma.academicYear.update({
            where: { id },
            data: { isActive: nextActive },
        });
    }
    async createClass(name, academicYearId) {
        const tenantId = this.getTenantId();
        return this.prisma.class.create({
            data: {
                name,
                academicYearId,
                tenantId,
            },
        });
    }
    async getClasses(academicYearId) {
        const tenantId = this.getTenantId();
        return this.prisma.class.findMany({
            where: {
                tenantId,
                isActive: true,
                ...(academicYearId ? { academicYearId } : {}),
            },
            include: { academicYear: true },
            orderBy: { name: 'asc' },
        });
    }
    async getClassStudentCount(id) {
        const tenantId = this.getTenantId();
        const classSections = await this.prisma.classSection.findMany({
            where: { classId: id, tenantId },
            select: { id: true },
        });
        const classSectionIds = classSections.map((cs) => cs.id);
        const count = classSectionIds.length > 0
            ? await this.prisma.studentProfile.count({
                where: { classSectionId: { in: classSectionIds } },
            })
            : 0;
        return { count };
    }
    async deleteClass(id) {
        const tenantId = this.getTenantId();
        const classRecord = await this.prisma.class.findFirst({
            where: { id, tenantId },
        });
        if (!classRecord) {
            throw new common_1.NotFoundException('Class not found');
        }
        const classSections = await this.prisma.classSection.findMany({
            where: { classId: id, tenantId },
            select: { id: true },
        });
        const classSectionIds = classSections.map((cs) => cs.id);
        const studentCount = classSectionIds.length > 0
            ? await this.prisma.studentProfile.count({
                where: { classSectionId: { in: classSectionIds } },
            })
            : 0;
        const attendanceCount = classSectionIds.length > 0
            ? await this.prisma.attendanceSession.count({
                where: {
                    tenantId,
                    classSectionId: { in: classSectionIds },
                },
            })
            : 0;
        const examCount = classSectionIds.length > 0
            ? await this.prisma.exam.count({
                where: { tenantId, classSectionId: { in: classSectionIds } },
            })
            : 0;
        const blockers = [];
        if (studentCount > 0)
            blockers.push(`${studentCount} Student(s)`);
        if (attendanceCount > 0)
            blockers.push(`${attendanceCount} Attendance Record(s)`);
        if (examCount > 0)
            blockers.push(`${examCount} Exam(s)`);
        if (blockers.length > 0) {
            throw new common_1.BadRequestException(`Cannot delete this Class because it is already being used by: ${blockers.join(', ')}. ` +
                `Please remove all associated records before deleting this class.`);
        }
        return this.prisma.$transaction(async (tx) => {
            if (classSectionIds.length > 0) {
                await tx.classSubject.deleteMany({
                    where: { tenantId, classSectionId: { in: classSectionIds } },
                });
                await tx.period.deleteMany({
                    where: { tenantId, classSectionId: { in: classSectionIds } },
                });
                await tx.pricebook.updateMany({
                    where: { tenantId, classId: id },
                    data: { classId: null, isActive: false },
                });
                await tx.classSection.deleteMany({
                    where: { tenantId, classId: id },
                });
            }
            return tx.class.update({
                where: { id },
                data: { isActive: false },
            });
        });
    }
    async createSection(name) {
        const tenantId = this.getTenantId();
        return this.prisma.section.create({
            data: {
                name,
                tenantId,
            },
        });
    }
    async getSections() {
        const tenantId = this.getTenantId();
        return this.prisma.section.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' },
        });
    }
    async createClassSection(classId, sectionId, teacherId) {
        const tenantId = this.getTenantId();
        return this.prisma.classSection.create({
            data: {
                classId,
                sectionId,
                teacherId,
                tenantId,
            },
        });
    }
    async getClassSections() {
        const tenantId = this.getTenantId();
        return this.prisma.classSection.findMany({
            where: { tenantId },
            include: {
                class: true,
                section: true,
                teacher: {
                    include: {
                        user: true,
                    },
                },
            },
            orderBy: {
                class: {
                    name: 'asc',
                },
            },
        });
    }
    async createSubject(name) {
        const tenantId = this.getTenantId();
        return this.prisma.subject.create({
            data: {
                name,
                tenantId,
            },
        });
    }
    async getSubjects() {
        const tenantId = this.getTenantId();
        return this.prisma.subject.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' },
        });
    }
    async addSubjectToClassSection(classSectionId, subjectId) {
        const tenantId = this.getTenantId();
        return this.prisma.classSubject.create({
            data: {
                classSectionId,
                subjectId,
                tenantId,
            },
        });
    }
    async getClassSubjects(classSectionId) {
        const tenantId = this.getTenantId();
        return this.prisma.classSubject.findMany({
            where: { tenantId, classSectionId },
            include: {
                subject: true,
            },
        });
    }
    async removeSubjectFromClassSection(classSectionId, subjectId) {
        const tenantId = this.getTenantId();
        await this.prisma.teacherAssignment.deleteMany({
            where: { classSectionId, subjectId, tenantId },
        });
        return this.prisma.classSubject.delete({
            where: {
                classSectionId_subjectId: {
                    classSectionId,
                    subjectId,
                },
            },
        });
    }
    async createPeriodTiming(periodNumber, startTime, endTime, isActive) {
        const tenantId = this.getTenantId();
        return this.prisma.periodTiming.create({
            data: {
                periodNumber,
                startTime,
                endTime,
                isActive,
                tenantId,
            },
        });
    }
    async getPeriodTimings() {
        const tenantId = this.getTenantId();
        let timings = await this.prisma.periodTiming.findMany({
            where: { tenantId, isActive: true },
            orderBy: { periodNumber: 'asc' },
        });
        if (timings.length === 0) {
            const defaultTimings = [
                { periodNumber: 1, startTime: '09:00 AM', endTime: '10:00 AM', isActive: true, tenantId },
                { periodNumber: 2, startTime: '10:00 AM', endTime: '11:00 AM', isActive: true, tenantId },
                { periodNumber: 3, startTime: '11:00 AM', endTime: '12:00 PM', isActive: true, tenantId },
                { periodNumber: 4, startTime: '12:00 PM', endTime: '01:00 PM', isActive: true, tenantId },
                { periodNumber: 5, startTime: '01:00 PM', endTime: '02:00 PM', isActive: true, tenantId },
                { periodNumber: 6, startTime: '02:00 PM', endTime: '03:00 PM', isActive: true, tenantId },
                { periodNumber: 7, startTime: '03:00 PM', endTime: '04:00 PM', isActive: true, tenantId },
                { periodNumber: 8, startTime: '04:00 PM', endTime: '05:00 PM', isActive: true, tenantId },
            ];
            await this.prisma.periodTiming.createMany({
                data: defaultTimings,
            });
            timings = await this.prisma.periodTiming.findMany({
                where: { tenantId, isActive: true },
                orderBy: { periodNumber: 'asc' },
            });
        }
        return timings;
    }
    async createPeriod(data) {
        const tenantId = this.getTenantId();
        return this.prisma.period.create({
            data: {
                classSectionId: data.classSectionId,
                subjectId: data.subjectId,
                teacherId: data.teacherId,
                periodTimingId: data.periodTimingId,
                dayOfWeek: data.dayOfWeek,
                substituteTeacherId: data.substituteTeacherId || null,
                tenantId,
            },
        });
    }
    async getPeriodsByClassSection(classSectionId) {
        const tenantId = this.getTenantId();
        return this.prisma.period.findMany({
            where: { tenantId, classSectionId },
            include: {
                subject: true,
                teacher: { include: { user: true } },
                substituteTeacher: { include: { user: true } },
                periodTiming: true,
            },
        });
    }
    async getPeriodsByTeacher(teacherId) {
        const tenantId = this.getTenantId();
        return this.prisma.period.findMany({
            where: {
                tenantId,
                OR: [
                    { teacherId },
                    { substituteTeacherId: teacherId },
                ],
            },
            include: {
                classSection: { include: { class: true, section: true } },
                subject: true,
                periodTiming: true,
            },
        });
    }
};
exports.AcademicsService = AcademicsService;
exports.AcademicsService = AcademicsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AcademicsService);
//# sourceMappingURL=academics.service.js.map