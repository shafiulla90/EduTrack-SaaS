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
exports.ExamConfigService = exports.DEFAULT_GRADE_RANGES = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const tenant_context_1 = require("../tenants/tenant.context");
const client_1 = require("@prisma/client");
exports.DEFAULT_GRADE_RANGES = [
    { min: 90, max: 100, grade: 'A+', gpa: 10, label: 'Outstanding' },
    { min: 80, max: 89, grade: 'A', gpa: 9, label: 'Excellent' },
    { min: 70, max: 79, grade: 'B+', gpa: 8, label: 'Very Good' },
    { min: 60, max: 69, grade: 'B', gpa: 7, label: 'Good' },
    { min: 50, max: 59, grade: 'C', gpa: 6, label: 'Average' },
    { min: 35, max: 49, grade: 'D', gpa: 5, label: 'Below Avg' },
    { min: 0, max: 34, grade: 'F', gpa: 0, label: 'Fail' },
];
function parseGradeRanges(raw) {
    if (!raw || !Array.isArray(raw))
        return exports.DEFAULT_GRADE_RANGES;
    return raw;
}
let ExamConfigService = class ExamConfigService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getTenantId() {
        const tenantId = tenant_context_1.TenantContext.getTenantId();
        if (!tenantId)
            throw new common_1.BadRequestException('No active school tenant context found');
        return tenantId;
    }
    async resolveConfig(examTypeName, classId, academicYearId, tenantId, db) {
        const prisma = db ?? this.prisma;
        const tid = tenantId ?? this.getTenantId();
        if (classId && academicYearId) {
            const classCfg = await prisma.examConfig.findFirst({
                where: { tenantId: tid, examTypeName, classId, academicYearId },
                include: { subjectConfigs: true }
            });
            if (classCfg) {
                return {
                    passingPercentage: Number(classCfg.passingPercentage),
                    maxMarks: classCfg.maxMarks,
                    gradeRanges: parseGradeRanges(classCfg.gradeRanges),
                    source: 'class-specific',
                    subjectConfigs: classCfg.subjectConfigs,
                };
            }
        }
        const specific = await prisma.examConfig.findFirst({
            where: { tenantId: tid, examTypeName, classId: null, academicYearId: null },
        });
        if (specific) {
            return {
                passingPercentage: Number(specific.passingPercentage),
                maxMarks: specific.maxMarks,
                gradeRanges: parseGradeRanges(specific.gradeRanges),
                source: 'exam-specific',
            };
        }
        const globalCfg = await prisma.examConfig.findFirst({
            where: { tenantId: tid, examTypeName: '__global__', classId: null, academicYearId: null },
        });
        if (globalCfg) {
            return {
                passingPercentage: Number(globalCfg.passingPercentage),
                maxMarks: globalCfg.maxMarks,
                gradeRanges: parseGradeRanges(globalCfg.gradeRanges),
                source: 'global',
            };
        }
        return {
            passingPercentage: 35,
            maxMarks: 100,
            gradeRanges: exports.DEFAULT_GRADE_RANGES,
            source: 'system-default',
        };
    }
    calculateGrade(percentage, ranges) {
        const active = ranges && ranges.length > 0 ? ranges : exports.DEFAULT_GRADE_RANGES;
        const sorted = [...active].sort((a, b) => b.min - a.min);
        return (sorted.find(r => percentage >= r.min && percentage <= r.max) ??
            { min: 0, max: 0, grade: 'F', gpa: 0, label: 'Fail' });
    }
    async listConfigs() {
        const tenantId = this.getTenantId();
        const configs = await this.prisma.examConfig.findMany({
            where: { tenantId },
            include: {
                subjectConfigs: true,
                class: true,
            },
            orderBy: { createdAt: 'asc' },
        });
        return configs.map(c => ({
            id: c.id,
            examTypeName: c.examTypeName === '__global__' ? null : c.examTypeName,
            isGlobal: c.examTypeName === '__global__',
            passingPercentage: Number(c.passingPercentage),
            maxMarks: c.maxMarks,
            gradeRanges: parseGradeRanges(c.gradeRanges),
            academicYearId: c.academicYearId,
            classId: c.classId,
            className: c.class?.name || null,
            subjectConfigs: c.subjectConfigs.map(sc => ({
                ...sc,
                passMarks: sc.passMarks ? Number(sc.passMarks) : null,
                passingPercentage: Number(sc.passingPercentage),
            })),
            updatedAt: c.updatedAt,
        }));
    }
    async upsertConfig(dto) {
        const tenantId = this.getTenantId();
        if (dto.passingPercentage < 0 || dto.passingPercentage > 100) {
            throw new common_1.BadRequestException('Passing percentage must be between 0 and 100');
        }
        const key = dto.examTypeName === null ? '__global__' : dto.examTypeName.trim();
        const gradeRangesJson = dto.gradeRanges
            ? dto.gradeRanges
            : client_1.Prisma.JsonNull;
        return this.prisma.$transaction(async (tx) => {
            let config = await tx.examConfig.findFirst({
                where: {
                    tenantId,
                    examTypeName: key,
                    academicYearId: dto.academicYearId || null,
                    classId: dto.classId || null,
                }
            });
            if (config) {
                config = await tx.examConfig.update({
                    where: { id: config.id },
                    data: {
                        passingPercentage: dto.passingPercentage,
                        maxMarks: dto.maxMarks ?? 100,
                        gradeRanges: gradeRangesJson,
                    }
                });
            }
            else {
                config = await tx.examConfig.create({
                    data: {
                        tenantId,
                        examTypeName: key,
                        passingPercentage: dto.passingPercentage,
                        maxMarks: dto.maxMarks ?? 100,
                        gradeRanges: gradeRangesJson,
                        academicYearId: dto.academicYearId || null,
                        classId: dto.classId || null,
                    }
                });
            }
            if (dto.subjectConfigs) {
                await tx.examConfigSubject.deleteMany({
                    where: { examConfigId: config.id }
                });
                if (dto.subjectConfigs.length > 0) {
                    await tx.examConfigSubject.createMany({
                        data: dto.subjectConfigs.map(s => ({
                            tenantId,
                            examConfigId: config.id,
                            subjectId: s.subjectId,
                            subjectType: s.subjectType || 'Theory',
                            maxMarks: s.maxMarks,
                            passingPercentage: s.passingPercentage,
                            passMarks: s.passMarks ?? Math.round((s.passingPercentage / 100) * s.maxMarks),
                            remarks: s.remarks,
                        }))
                    });
                }
            }
            return config;
        });
    }
    async deleteConfig(id) {
        const tenantId = this.getTenantId();
        const record = await this.prisma.examConfig.findUnique({ where: { id } });
        if (!record || record.tenantId !== tenantId) {
            throw new common_1.BadRequestException('Exam config not found');
        }
        return this.prisma.examConfig.delete({ where: { id } });
    }
    getDefaultGradeRanges() {
        return exports.DEFAULT_GRADE_RANGES;
    }
    async listComponents() {
        const tenantId = this.getTenantId();
        return this.prisma.subjectComponent.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async createComponent(name) {
        const tenantId = this.getTenantId();
        if (!name || name.trim() === '')
            throw new common_1.BadRequestException('Component name cannot be empty');
        const existing = await this.prisma.subjectComponent.findUnique({
            where: { name_tenantId: { name: name.trim(), tenantId } },
        });
        if (existing)
            throw new common_1.BadRequestException('Component already exists');
        return this.prisma.subjectComponent.create({
            data: { name: name.trim(), tenantId },
        });
    }
    async deleteComponent(id) {
        const tenantId = this.getTenantId();
        const comp = await this.prisma.subjectComponent.findUnique({ where: { id } });
        if (!comp || comp.tenantId !== tenantId)
            throw new common_1.NotFoundException('Component not found');
        return this.prisma.subjectComponent.delete({ where: { id } });
    }
    async getOrInitializeExamSubject(examId, subjectId, subjectType = 'Theory', tenantId, db) {
        const prisma = db ?? this.prisma;
        const tid = tenantId ?? this.getTenantId();
        let examSubject = await prisma.examSubject.findUnique({
            where: { examId_subjectId_subjectType: { examId, subjectId, subjectType } },
        });
        if (!examSubject) {
            const exam = await prisma.exam.findUnique({
                where: { id: examId },
                include: { classSection: { include: { class: true } } }
            });
            if (!exam)
                throw new common_1.NotFoundException('Exam not found');
            const classId = exam.classSection?.classId;
            const academicYearId = exam.classSection?.class?.academicYearId;
            const cfg = await this.resolveConfig(exam.type, classId, academicYearId, tid, db);
            let maxMarks = cfg.maxMarks;
            let passingPercentage = cfg.passingPercentage;
            let passMarks = Math.round((cfg.passingPercentage / 100) * cfg.maxMarks);
            if (cfg.subjectConfigs && cfg.subjectConfigs.length > 0) {
                const sc = cfg.subjectConfigs.find(s => s.subjectId === subjectId && s.subjectType === subjectType);
                if (sc) {
                    maxMarks = sc.maxMarks;
                    passingPercentage = Number(sc.passingPercentage);
                    passMarks = sc.passMarks ? Number(sc.passMarks) : Math.round((Number(sc.passingPercentage) / 100) * sc.maxMarks);
                }
            }
            examSubject = await prisma.examSubject.create({
                data: {
                    tenantId: tid,
                    examId,
                    subjectId,
                    subjectType,
                    maxMarks,
                    passingPercentage,
                    passMarks,
                }
            });
        }
        return examSubject;
    }
    async getExamSubjects(examId) {
        const tenantId = this.getTenantId();
        return this.prisma.examSubject.findMany({
            where: { examId, tenantId },
            include: { subject: true },
            orderBy: [
                { subject: { name: 'asc' } },
                { subjectType: 'asc' }
            ]
        });
    }
    async updateExamSubject(id, dto) {
        const tenantId = this.getTenantId();
        const examSubject = await this.prisma.examSubject.findUnique({ where: { id } });
        if (!examSubject || examSubject.tenantId !== tenantId)
            throw new common_1.NotFoundException('Exam Subject not found');
        if ((dto.maxMarks !== undefined && dto.maxMarks !== examSubject.maxMarks) ||
            (dto.subjectType !== undefined && dto.subjectType !== examSubject.subjectType)) {
            const existingMarks = await this.prisma.examMark.findFirst({
                where: { examId: examSubject.examId, subjectId: examSubject.subjectId, subjectType: examSubject.subjectType }
            });
            if (existingMarks) {
                throw new common_1.BadRequestException('Cannot modify Max Marks or Component Type because student marks have already been recorded for this component.');
            }
        }
        const updateData = {};
        if (dto.maxMarks !== undefined)
            updateData.maxMarks = dto.maxMarks;
        if (dto.passingPercentage !== undefined)
            updateData.passingPercentage = dto.passingPercentage;
        if (dto.passMarks !== undefined)
            updateData.passMarks = dto.passMarks;
        if (dto.subjectType !== undefined)
            updateData.subjectType = dto.subjectType;
        if (dto.remarks !== undefined)
            updateData.remarks = dto.remarks;
        return this.prisma.examSubject.update({
            where: { id },
            data: updateData,
        });
    }
    async createExamSubjectsForExam(examId, classSectionId, tenantId, db) {
        const prisma = db ?? this.prisma;
        const tid = tenantId ?? this.getTenantId();
        const exam = await prisma.exam.findUnique({ where: { id: examId } });
        if (!exam)
            return;
        const classSection = await prisma.classSection.findUnique({
            where: { id: classSectionId },
            include: {
                class: true,
            }
        });
        if (!classSection)
            return;
        const classSubjects = await prisma.classSubject.findMany({
            where: { classSectionId },
        });
        const cfg = await this.resolveConfig(exam.type, classSection.classId, classSection.class.academicYearId, tid, db);
        if (cfg.subjectConfigs && cfg.subjectConfigs.length > 0) {
            for (const cs of classSubjects) {
                const subConfigs = cfg.subjectConfigs.filter(sc => sc.subjectId === cs.subjectId);
                if (subConfigs.length > 0) {
                    for (const sc of subConfigs) {
                        await prisma.examSubject.upsert({
                            where: { examId_subjectId_subjectType: { examId, subjectId: cs.subjectId, subjectType: sc.subjectType } },
                            create: {
                                tenantId: tid,
                                examId,
                                subjectId: cs.subjectId,
                                subjectType: sc.subjectType,
                                maxMarks: sc.maxMarks,
                                passingPercentage: Number(sc.passingPercentage),
                                passMarks: sc.passMarks ? Number(sc.passMarks) : Math.round((Number(sc.passingPercentage) / 100) * sc.maxMarks),
                                remarks: sc.remarks,
                            },
                            update: {}
                        });
                    }
                }
                else {
                    await prisma.examSubject.upsert({
                        where: { examId_subjectId_subjectType: { examId, subjectId: cs.subjectId, subjectType: 'Theory' } },
                        create: {
                            tenantId: tid,
                            examId,
                            subjectId: cs.subjectId,
                            subjectType: 'Theory',
                            maxMarks: cfg.maxMarks,
                            passingPercentage: cfg.passingPercentage,
                            passMarks: Math.round((cfg.passingPercentage / 100) * cfg.maxMarks),
                        },
                        update: {}
                    });
                }
            }
        }
        else {
            for (const cs of classSubjects) {
                await prisma.examSubject.upsert({
                    where: { examId_subjectId_subjectType: { examId, subjectId: cs.subjectId, subjectType: 'Theory' } },
                    create: {
                        tenantId: tid,
                        examId,
                        subjectId: cs.subjectId,
                        subjectType: 'Theory',
                        maxMarks: cfg.maxMarks,
                        passingPercentage: cfg.passingPercentage,
                        passMarks: Math.round((cfg.passingPercentage / 100) * cfg.maxMarks),
                    },
                    update: {}
                });
            }
        }
    }
};
exports.ExamConfigService = ExamConfigService;
exports.ExamConfigService = ExamConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExamConfigService);
//# sourceMappingURL=exam-config.service.js.map