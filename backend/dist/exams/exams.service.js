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
exports.ExamsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const tenant_context_1 = require("../tenants/tenant.context");
const role_filter_helper_1 = require("../common/role-filter.helper");
const exam_config_service_1 = require("../exam-config/exam-config.service");
let ExamsService = class ExamsService {
    constructor(prisma, roleFilterHelper, examConfigService) {
        this.prisma = prisma;
        this.roleFilterHelper = roleFilterHelper;
        this.examConfigService = examConfigService;
    }
    getTenantId() {
        const tenantId = tenant_context_1.TenantContext.getTenantId();
        if (!tenantId) {
            throw new common_1.BadRequestException('No active school tenant context found');
        }
        return tenantId;
    }
    async createExam(name, type, classSectionId, date) {
        const tenantId = this.getTenantId();
        const exam = await this.prisma.exam.create({
            data: {
                name,
                type,
                classSectionId,
                date: new Date(date),
                tenantId,
            },
        });
        await this.examConfigService.createExamSubjectsForExam(exam.id, classSectionId, tenantId);
        return exam;
    }
    async getExams(classSectionId) {
        const tenantId = this.getTenantId();
        return this.prisma.exam.findMany({
            where: {
                tenantId,
                ...(classSectionId ? { classSectionId } : {}),
            },
            include: {
                classSection: {
                    include: {
                        class: true,
                        section: true,
                    },
                },
            },
            orderBy: { date: 'desc' },
        });
    }
    async getClasses(userId, role) {
        const tenantId = this.getTenantId();
        if (this.roleFilterHelper.isTeacher(role)) {
            const scope = await this.roleFilterHelper.buildTeacherScope(userId, tenantId);
            if (scope.assignedClassSectionIds.length === 0)
                return [];
            const sections = await this.prisma.classSection.findMany({
                where: { id: { in: scope.assignedClassSectionIds }, tenantId },
                include: { class: true, section: true },
                orderBy: [{ class: { name: 'asc' } }, { section: { name: 'asc' } }],
            });
            return sections.map(s => ({
                value: s.id,
                label: `${s.class.name} - ${s.section.name}`,
                displayName: `${s.class.name} - ${s.section.name}`,
                classId: s.classId,
                sectionId: s.sectionId,
            }));
        }
        const sections = await this.prisma.classSection.findMany({
            where: { tenantId },
            include: { class: true, section: true },
            orderBy: [{ class: { name: 'asc' } }, { section: { name: 'asc' } }],
        });
        return sections.map(s => ({
            value: s.id,
            label: `${s.class.name} - ${s.section.name}`,
            displayName: `${s.class.name} - ${s.section.name}`,
            classId: s.classId,
            sectionId: s.sectionId,
        }));
    }
    async getSubjects(userId, role) {
        const tenantId = this.getTenantId();
        if (this.roleFilterHelper.isTeacher(role)) {
            const scope = await this.roleFilterHelper.buildTeacherScope(userId, tenantId);
            if (scope.assignedSubjectIds.length === 0)
                return [];
            const subjects = await this.prisma.subject.findMany({
                where: { id: { in: scope.assignedSubjectIds }, tenantId, isActive: true },
                orderBy: { name: 'asc' },
            });
            return subjects.map(s => ({
                id: s.id,
                name: s.name,
                maxMarks: 100,
                icon: s.name.substring(0, 1).toUpperCase(),
            }));
        }
        const subjects = await this.prisma.subject.findMany({
            where: { tenantId, isActive: true },
            orderBy: { name: 'asc' },
        });
        return subjects.map(s => ({
            id: s.id,
            name: s.name,
            maxMarks: 100,
            icon: s.name.substring(0, 1).toUpperCase(),
        }));
    }
    async getExamTypes() {
        const tenantId = this.getTenantId();
        let types = await this.prisma.examType.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'asc' },
        });
        if (types.length === 0) {
            const defaults = [
                'Unit Test',
                'Monthly Test',
                'Quarterly Exam',
                'Half-Yearly Exam',
                'Annual Exam',
                'Pre-Final Exam'
            ];
            await this.prisma.examType.createMany({
                data: defaults.map(name => ({ name, tenantId })),
            });
            types = await this.prisma.examType.findMany({
                where: { tenantId },
                orderBy: { createdAt: 'asc' },
            });
        }
        return types.map(t => t.name);
    }
    async getExamTypesManage() {
        const tenantId = this.getTenantId();
        let types = await this.prisma.examType.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'asc' },
        });
        if (types.length === 0) {
            const defaults = [
                'Unit Test',
                'Monthly Test',
                'Quarterly Exam',
                'Half-Yearly Exam',
                'Annual Exam',
                'Pre-Final Exam'
            ];
            await this.prisma.examType.createMany({
                data: defaults.map(name => ({ name, tenantId })),
            });
            types = await this.prisma.examType.findMany({
                where: { tenantId },
                orderBy: { createdAt: 'asc' },
            });
        }
        return types;
    }
    async createExamType(name) {
        const tenantId = this.getTenantId();
        const trimmed = name.trim();
        if (!trimmed) {
            throw new common_1.BadRequestException('Exam type name cannot be empty');
        }
        const existing = await this.prisma.examType.findFirst({
            where: { name: { equals: trimmed, mode: 'insensitive' }, tenantId }
        });
        if (existing) {
            throw new common_1.BadRequestException('Exam type already exists');
        }
        return this.prisma.examType.create({
            data: { name: trimmed, tenantId }
        });
    }
    async updateExamType(id, name) {
        const tenantId = this.getTenantId();
        const trimmed = name.trim();
        if (!trimmed) {
            throw new common_1.BadRequestException('Exam type name cannot be empty');
        }
        const examType = await this.prisma.examType.findUnique({ where: { id } });
        if (!examType || examType.tenantId !== tenantId) {
            throw new common_1.BadRequestException('Exam type not found');
        }
        const existing = await this.prisma.examType.findFirst({
            where: { name: { equals: trimmed, mode: 'insensitive' }, tenantId, id: { not: id } }
        });
        if (existing) {
            throw new common_1.BadRequestException('Another exam type with this name already exists');
        }
        return this.prisma.examType.update({
            where: { id },
            data: { name: trimmed }
        });
    }
    async deleteExamType(id) {
        const tenantId = this.getTenantId();
        const examType = await this.prisma.examType.findUnique({ where: { id } });
        if (!examType || examType.tenantId !== tenantId) {
            throw new common_1.BadRequestException('Exam type not found');
        }
        return this.prisma.examType.delete({ where: { id } });
    }
    async getStudentsForMarksEntry(subjectId, examName, classSectionId, examId, userId, role, subjectType = 'Theory') {
        const tenantId = this.getTenantId();
        let resolvedExamId = examId;
        let resolvedClassSectionId = classSectionId;
        if (!resolvedExamId && resolvedClassSectionId) {
            const exam = await this.prisma.exam.findFirst({
                where: {
                    tenantId,
                    classSectionId: resolvedClassSectionId,
                    name: examName,
                },
            });
            if (exam) {
                resolvedExamId = exam.id;
            }
        }
        else if (resolvedExamId && !resolvedClassSectionId) {
            const exam = await this.prisma.exam.findUnique({
                where: { id: resolvedExamId },
            });
            if (exam) {
                resolvedClassSectionId = exam.classSectionId;
            }
        }
        if (!resolvedClassSectionId) {
            throw new common_1.BadRequestException('Could not resolve Class Section');
        }
        if (this.roleFilterHelper.isTeacher(role)) {
            await this.roleFilterHelper.validateTeacherAssignment((await this.roleFilterHelper.buildTeacherScope(userId, tenantId)).staff.id, resolvedClassSectionId, subjectId, tenantId);
        }
        const students = await this.prisma.studentProfile.findMany({
            where: {
                classSectionId: resolvedClassSectionId,
                user: { tenantId, isActive: true },
            },
            include: {
                user: {
                    select: { name: true },
                },
            },
            orderBy: { user: { name: 'asc' } },
        });
        const marksMap = new Map();
        let maxMarks = 100;
        let passingPercentage = 35;
        if (resolvedExamId) {
            const currentMarks = await this.prisma.examMark.findMany({
                where: {
                    tenantId,
                    examId: resolvedExamId,
                    subjectId,
                    subjectType,
                },
            });
            for (const m of currentMarks) {
                marksMap.set(m.studentId, m);
            }
            const examSub = await this.examConfigService.getOrInitializeExamSubject(resolvedExamId, subjectId, subjectType, tenantId);
            maxMarks = examSub.maxMarks;
            passingPercentage = Number(examSub.passingPercentage);
        }
        else {
            const cfg = await this.examConfigService.resolveConfig(examName, tenantId);
            maxMarks = cfg.maxMarks;
            passingPercentage = cfg.passingPercentage;
        }
        return {
            roster: students.map(s => {
                const markRecord = marksMap.get(s.id);
                return {
                    studentId: s.id,
                    name: s.user.name,
                    rollNo: s.rollNo || 'N/A',
                    hasMarks: !!markRecord,
                    marksObtained: markRecord ? Number(markRecord.marksObtained) : null,
                    remarks: markRecord ? markRecord.remarks : '',
                };
            }),
            config: { maxMarks, passingPercentage }
        };
    }
    async saveMarks(marksDataList, examName, classSectionId, subjectId, userId, role, subjectType = 'Theory') {
        const tenantId = this.getTenantId();
        if (this.roleFilterHelper.isTeacher(role)) {
            const scope = await this.roleFilterHelper.buildTeacherScope(userId, tenantId);
            await this.roleFilterHelper.validateTeacherAssignment(scope.staff.id, classSectionId, subjectId, tenantId);
        }
        return this.prisma.$transaction(async (tx) => {
            let exam = await tx.exam.findFirst({
                where: {
                    tenantId,
                    classSectionId,
                    name: examName,
                },
            });
            if (!exam) {
                exam = await tx.exam.create({
                    data: {
                        name: examName,
                        type: examName,
                        classSectionId,
                        date: new Date(),
                        tenantId,
                    },
                });
                await this.examConfigService.createExamSubjectsForExam(exam.id, classSectionId, tenantId, tx);
            }
            const examSub = await this.examConfigService.getOrInitializeExamSubject(exam.id, subjectId, subjectType, tenantId, tx);
            const upsertPromises = marksDataList.map((row) => {
                const mObs = row.marksObtained;
                if (mObs !== null && mObs > examSub.maxMarks) {
                    throw new common_1.BadRequestException(`Marks obtained (${mObs}) cannot exceed maximum marks (${examSub.maxMarks}) for ${subjectType}`);
                }
                return tx.examMark.upsert({
                    where: {
                        examId_studentId_subjectId_subjectType: {
                            examId: exam.id,
                            studentId: row.studentId,
                            subjectId,
                            subjectType,
                        },
                    },
                    create: {
                        examId: exam.id,
                        studentId: row.studentId,
                        subjectId,
                        subjectType,
                        marksObtained: row.marksObtained,
                        remarks: row.remarks || null,
                        tenantId,
                    },
                    update: {
                        marksObtained: row.marksObtained,
                        remarks: row.remarks || null,
                    },
                });
            });
            return Promise.all(upsertPromises);
        }, { timeout: 30000 });
    }
    calculateGradeAndGPA(percentage) {
        if (percentage >= 90)
            return { grade: 'A+', gpa: 4.0 };
        if (percentage >= 80)
            return { grade: 'A', gpa: 3.5 };
        if (percentage >= 70)
            return { grade: 'B', gpa: 3.0 };
        if (percentage >= 60)
            return { grade: 'C', gpa: 2.0 };
        if (percentage >= 50)
            return { grade: 'D', gpa: 1.0 };
        return { grade: 'F', gpa: 0.0 };
    }
    async getGradesReport(classSectionId, examName) {
        const tenantId = this.getTenantId();
        const exam = await this.prisma.exam.findFirst({
            where: {
                tenantId,
                classSectionId,
                name: examName,
            },
        });
        if (!exam)
            return [];
        const marks = await this.prisma.examMark.findMany({
            where: {
                tenantId,
                examId: exam.id,
            },
            include: {
                student: {
                    include: {
                        user: { select: { name: true } },
                    },
                },
                subject: true,
            },
        });
        const studentGrades = new Map();
        for (const m of marks) {
            if (!studentGrades.has(m.studentId)) {
                studentGrades.set(m.studentId, {
                    studentId: m.studentId,
                    name: m.student.user.name,
                    rollNo: m.student.rollNo || 'N/A',
                    classSectionId,
                    scores: {},
                    totalMarks: 0,
                    totalMaxMarks: 0,
                    subjectsList: [],
                });
            }
            const record = studentGrades.get(m.studentId);
            const score = Number(m.marksObtained);
            const examSub = await this.examConfigService.getOrInitializeExamSubject(exam.id, m.subjectId, m.subjectType, tenantId);
            record.scores[`${m.subject.name} (${m.subjectType})`] = score;
            record.totalMarks += score;
            record.totalMaxMarks += examSub.maxMarks;
            record.subjectsList.push({
                name: m.subject.name,
                type: m.subjectType,
                score,
                max: examSub.maxMarks,
            });
        }
        const reportRows = Array.from(studentGrades.values()).map(r => {
            const avg = r.totalMaxMarks > 0 ? (r.totalMarks / r.totalMaxMarks) * 100 : 0;
            const { grade, gpa } = this.calculateGradeAndGPA(avg);
            return {
                ...r,
                score: Number(avg.toFixed(0)),
                average: Number(avg.toFixed(2)),
                grade,
                gpa,
            };
        });
        reportRows.sort((a, b) => b.totalMarks - a.totalMarks);
        return reportRows.map((row, idx) => ({
            ...row,
            rank: idx + 1,
        }));
    }
};
exports.ExamsService = ExamsService;
exports.ExamsService = ExamsService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => exam_config_service_1.ExamConfigService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        role_filter_helper_1.RoleFilterHelper,
        exam_config_service_1.ExamConfigService])
], ExamsService);
//# sourceMappingURL=exams.service.js.map