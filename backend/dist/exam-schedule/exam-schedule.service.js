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
exports.ExamScheduleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const tenant_context_1 = require("../tenants/tenant.context");
const communications_service_1 = require("../communications/communications.service");
let ExamScheduleService = class ExamScheduleService {
    constructor(prisma, communicationsService) {
        this.prisma = prisma;
        this.communicationsService = communicationsService;
    }
    getTenantId() {
        const tenantId = tenant_context_1.TenantContext.getTenantId();
        if (!tenantId) {
            throw new common_1.BadRequestException('No active school tenant context found');
        }
        return tenantId;
    }
    parseTimeToMinutes(timeStr) {
        const trimmed = timeStr.trim();
        const matches = trimmed.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
        if (!matches) {
            throw new common_1.BadRequestException(`Invalid time format: ${timeStr}. Expected HH:MM or HH:MM AM/PM`);
        }
        let hours = parseInt(matches[1], 10);
        const minutes = parseInt(matches[2], 10);
        const ampm = matches[3];
        if (ampm) {
            const up = ampm.toUpperCase();
            if (up === 'PM' && hours < 12)
                hours += 12;
            if (up === 'AM' && hours === 12)
                hours = 0;
        }
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            throw new common_1.BadRequestException(`Invalid time value: ${timeStr}`);
        }
        return hours * 60 + minutes;
    }
    async validateSchedule(dto, excludeId) {
        const tenantId = this.getTenantId();
        const startMin = this.parseTimeToMinutes(dto.startTime);
        const endMin = this.parseTimeToMinutes(dto.endTime);
        if (endMin <= startMin) {
            throw new common_1.BadRequestException(`End time (${dto.endTime}) must be after start time (${dto.startTime}).`);
        }
        const examDate = new Date(dto.examDate);
        if (isNaN(examDate.getTime())) {
            throw new common_1.BadRequestException(`Invalid exam date format: ${dto.examDate}. Please use YYYY-MM-DD format.`);
        }
        const ay = await this.prisma.academicYear.findUnique({
            where: { id: dto.academicYearId }
        });
        if (!ay || ay.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Academic year not found');
        }
        if (examDate < new Date(ay.startDate) || examDate > new Date(ay.endDate)) {
            throw new common_1.BadRequestException(`Exam date must fall within the Academic Year bounds: ${new Date(ay.startDate).toLocaleDateString()} to ${new Date(ay.endDate).toLocaleDateString()}`);
        }
        const dupSubject = await this.prisma.examSchedule.findFirst({
            where: {
                tenantId,
                academicYearId: dto.academicYearId,
                classSectionId: dto.classSectionId,
                subjectId: dto.subjectId,
                examDate: examDate,
                id: excludeId ? { not: excludeId } : undefined
            }
        });
        if (dupSubject) {
            throw new common_1.BadRequestException(`An exam for subject is already scheduled for this class on this day.`);
        }
        const classExams = await this.prisma.examSchedule.findMany({
            where: {
                tenantId,
                classSectionId: dto.classSectionId,
                examDate: examDate,
                id: excludeId ? { not: excludeId } : undefined
            }
        });
        for (const ex of classExams) {
            const existingStart = this.parseTimeToMinutes(ex.startTime);
            const existingEnd = this.parseTimeToMinutes(ex.endTime);
            if (startMin < existingEnd && existingStart < endMin) {
                throw new common_1.BadRequestException(`Time conflict: Class section already has an exam "${ex.examName}" from ${ex.startTime} to ${ex.endTime}.`);
            }
        }
        if (dto.examHall && dto.examHall.trim()) {
            const hallExams = await this.prisma.examSchedule.findMany({
                where: {
                    tenantId,
                    examHall: dto.examHall.trim(),
                    examDate: examDate,
                    id: excludeId ? { not: excludeId } : undefined
                }
            });
            for (const ex of hallExams) {
                const existingStart = this.parseTimeToMinutes(ex.startTime);
                const existingEnd = this.parseTimeToMinutes(ex.endTime);
                if (startMin < existingEnd && existingStart < endMin) {
                    throw new common_1.BadRequestException(`Hall conflict: Exam hall "${dto.examHall}" is booked for exam "${ex.examName}" from ${ex.startTime} to ${ex.endTime}.`);
                }
            }
        }
    }
    async notifyTeachers(schedule, actionName) {
        const tenantId = this.getTenantId();
        const cs = await this.prisma.classSection.findUnique({
            where: { id: schedule.classSectionId },
            include: { class: true, section: true }
        });
        const subject = await this.prisma.subject.findUnique({
            where: { id: schedule.subjectId }
        });
        const className = cs ? `${cs.class.name} - ${cs.section.name}` : 'Unknown Class';
        const subjName = subject ? subject.name : 'Unknown Subject';
        const dateStr = new Date(schedule.examDate).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
        let title = `📢 ${schedule.examName} Schedule`;
        let content = `Class: ${className}\nSubject: ${subjName}\nDate: ${dateStr}\nTime: ${schedule.startTime} - ${schedule.endTime}\nInstructions:\n${schedule.instructions || 'Please complete the syllabus before the examination.'}`;
        if (actionName === 'cancelled' || schedule.status === 'Cancelled') {
            title = `❌ CANCELLED: ${schedule.examName}`;
            content = `The scheduled exam for Class: ${className}, Subject: ${subjName} on ${dateStr} has been cancelled.`;
        }
        else if (actionName === 'updated') {
            title = `📢 UPDATED: ${schedule.examName} Schedule`;
            content = `Class: ${className}\nSubject: ${subjName}\nDate: ${dateStr}\nTime: ${schedule.startTime} - ${schedule.endTime}\nInstructions:\n${schedule.instructions || 'Please complete the syllabus before the examination.'}\n\nNote: The schedule was recently updated. Please take note of the new timings.`;
        }
        content += `\n\n<!-- examScheduleId: ${schedule.id} -->`;
        const existing = await this.prisma.announcement.findFirst({
            where: {
                tenantId,
                audienceType: 'INSTITUTION',
                content: { contains: `<!-- examScheduleId: ${schedule.id} -->` }
            }
        });
        const staff = await this.prisma.staffProfile.findFirst({
            where: { tenantId }
        });
        if (!staff)
            return;
        if (existing) {
            await this.prisma.announcement.update({
                where: { id: existing.id },
                data: {
                    title,
                    content,
                    priority: (actionName === 'cancelled' || schedule.status === 'Cancelled') ? 'High' : 'Medium',
                    readStatus: [],
                    classSection: schedule.classSectionId ? { connect: { id: schedule.classSectionId } } : { disconnect: true }
                }
            });
        }
        else {
            await this.prisma.announcement.create({
                data: {
                    title,
                    content,
                    audienceType: 'INSTITUTION',
                    priority: (actionName === 'cancelled' || schedule.status === 'Cancelled') ? 'High' : 'Medium',
                    readStatus: [],
                    classSection: schedule.classSectionId ? { connect: { id: schedule.classSectionId } } : undefined,
                    tenant: { connect: { id: tenantId } },
                    teacher: { connect: { id: staff.id } }
                }
            });
        }
    }
    async create(dto, userId) {
        const tenantId = this.getTenantId();
        await this.validateSchedule(dto);
        const startMin = this.parseTimeToMinutes(dto.startTime);
        const endMin = this.parseTimeToMinutes(dto.endTime);
        const duration = endMin - startMin;
        const schedule = await this.prisma.examSchedule.create({
            data: {
                tenantId,
                academicYearId: dto.academicYearId,
                examName: dto.examName,
                classSectionId: dto.classSectionId,
                subjectId: dto.subjectId,
                examDate: new Date(dto.examDate),
                startTime: dto.startTime,
                endTime: dto.endTime,
                duration,
                examHall: dto.examHall || null,
                instructions: dto.instructions || null,
                status: dto.status || 'Draft',
                createdBy: userId
            }
        });
        await this.notifyTeachers(schedule, 'scheduled');
        return schedule;
    }
    async createBulk(dto, userId) {
        const tenantId = this.getTenantId();
        for (const item of dto.schedules) {
            await this.validateSchedule(item);
        }
        const createdSchedules = [];
        await this.prisma.$transaction(async (tx) => {
            for (const item of dto.schedules) {
                const startMin = this.parseTimeToMinutes(item.startTime);
                const endMin = this.parseTimeToMinutes(item.endTime);
                const duration = endMin - startMin;
                const schedule = await tx.examSchedule.create({
                    data: {
                        tenantId,
                        academicYearId: item.academicYearId,
                        examName: item.examName,
                        classSectionId: item.classSectionId,
                        subjectId: item.subjectId,
                        examDate: new Date(item.examDate),
                        startTime: item.startTime,
                        endTime: item.endTime,
                        duration,
                        examHall: item.examHall || null,
                        instructions: item.instructions || null,
                        status: item.status || 'Draft',
                        createdBy: userId
                    }
                });
                createdSchedules.push(schedule);
            }
        });
        for (const schedule of createdSchedules) {
            await this.notifyTeachers(schedule, 'scheduled');
        }
        return createdSchedules;
    }
    async update(id, dto) {
        const tenantId = this.getTenantId();
        const existing = await this.prisma.examSchedule.findUnique({ where: { id } });
        if (!existing || existing.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Exam schedule not found');
        }
        const checkDto = {
            examName: dto.examName !== undefined ? dto.examName : existing.examName,
            academicYearId: dto.academicYearId !== undefined ? dto.academicYearId : existing.academicYearId,
            classSectionId: dto.classSectionId !== undefined ? dto.classSectionId : existing.classSectionId,
            subjectId: dto.subjectId !== undefined ? dto.subjectId : existing.subjectId,
            examDate: dto.examDate !== undefined ? dto.examDate : existing.examDate.toISOString().split('T')[0],
            startTime: dto.startTime !== undefined ? dto.startTime : existing.startTime,
            endTime: dto.endTime !== undefined ? dto.endTime : existing.endTime,
            examHall: dto.examHall !== undefined ? dto.examHall : (existing.examHall || undefined),
            instructions: dto.instructions !== undefined ? dto.instructions : (existing.instructions || undefined),
            status: dto.status !== undefined ? dto.status : existing.status,
        };
        await this.validateSchedule(checkDto, id);
        const startMin = this.parseTimeToMinutes(checkDto.startTime);
        const endMin = this.parseTimeToMinutes(checkDto.endTime);
        const duration = endMin - startMin;
        const updated = await this.prisma.examSchedule.update({
            where: { id },
            data: {
                examName: checkDto.examName,
                academicYearId: checkDto.academicYearId,
                classSectionId: checkDto.classSectionId,
                subjectId: checkDto.subjectId,
                examDate: new Date(checkDto.examDate),
                startTime: checkDto.startTime,
                endTime: checkDto.endTime,
                duration,
                examHall: checkDto.examHall || null,
                instructions: checkDto.instructions || null,
                status: checkDto.status,
            }
        });
        if (updated.status === 'Cancelled') {
            await this.notifyTeachers(updated, 'cancelled');
        }
        else {
            await this.notifyTeachers(updated, 'updated');
        }
        return updated;
    }
    async updateBulk(dto) {
        const tenantId = this.getTenantId();
        const updated = [];
        for (const id of dto.ids) {
            const existing = await this.prisma.examSchedule.findUnique({ where: { id } });
            if (!existing || existing.tenantId !== tenantId)
                continue;
            const schedule = await this.prisma.examSchedule.update({
                where: { id },
                data: { status: dto.status }
            });
            updated.push(schedule);
            if (schedule.status === 'Cancelled') {
                await this.notifyTeachers(schedule, 'cancelled');
            }
            else {
                await this.notifyTeachers(schedule, 'updated');
            }
        }
        return updated;
    }
    async delete(id) {
        const tenantId = this.getTenantId();
        const existing = await this.prisma.examSchedule.findUnique({ where: { id } });
        if (!existing || existing.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Exam schedule not found');
        }
        await this.prisma.examSchedule.delete({ where: { id } });
        await this.notifyTeachers(existing, 'cancelled');
        return { success: true };
    }
    async deleteBulk(dto) {
        const tenantId = this.getTenantId();
        for (const id of dto.ids) {
            const existing = await this.prisma.examSchedule.findUnique({ where: { id } });
            if (!existing || existing.tenantId !== tenantId)
                continue;
            await this.prisma.examSchedule.delete({ where: { id } });
            await this.notifyTeachers(existing, 'cancelled');
        }
        return { success: true };
    }
    async findOne(id) {
        const tenantId = this.getTenantId();
        const schedule = await this.prisma.examSchedule.findUnique({
            where: { id },
            include: {
                classSection: {
                    include: { class: true, section: true }
                },
                subject: true,
                academicYear: true
            }
        });
        if (!schedule || schedule.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Exam schedule not found');
        }
        return schedule;
    }
    async findAll(query, user) {
        const tenantId = this.getTenantId();
        const whereClause = { tenantId };
        if (query.academicYearId) {
            whereClause.academicYearId = query.academicYearId;
        }
        if (query.classSectionId) {
            whereClause.classSectionId = query.classSectionId;
        }
        if (query.subjectId) {
            whereClause.subjectId = query.subjectId;
        }
        if (query.status) {
            whereClause.status = query.status;
        }
        if (query.search) {
            whereClause.examName = { contains: query.search, mode: 'insensitive' };
        }
        if (query.upcoming === 'true') {
            whereClause.examDate = { gte: new Date() };
            whereClause.status = { in: ['Published', 'Completed'] };
        }
        if (user.role === 'TEACHER') {
            if (!query.status) {
                whereClause.status = { in: ['Published', 'Completed', 'Cancelled'] };
            }
            const staff = await this.prisma.staffProfile.findFirst({
                where: { userId: user.id, tenantId },
                include: {
                    classSections: { select: { id: true } },
                    teacherAssignments: { select: { classSectionId: true, subjectId: true } }
                }
            });
            if (!staff) {
                return [];
            }
            const advisorClassIds = staff.classSections.map(cs => cs.id);
            const assignedClassIds = staff.teacherAssignments.map(ta => ta.classSectionId);
            const classSectionIds = Array.from(new Set([...advisorClassIds, ...assignedClassIds]));
            const subjectIds = Array.from(new Set(staff.teacherAssignments.map(ta => ta.subjectId)));
            whereClause.classSectionId = { in: classSectionIds };
            whereClause.subjectId = { in: subjectIds };
        }
        return this.prisma.examSchedule.findMany({
            where: whereClause,
            include: {
                classSection: {
                    include: { class: true, section: true }
                },
                subject: true,
                academicYear: true
            },
            orderBy: { examDate: 'asc' }
        });
    }
};
exports.ExamScheduleService = ExamScheduleService;
exports.ExamScheduleService = ExamScheduleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        communications_service_1.CommunicationsService])
], ExamScheduleService);
//# sourceMappingURL=exam-schedule.service.js.map