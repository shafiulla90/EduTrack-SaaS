"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeachersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const tenant_context_1 = require("../tenants/tenant.context");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
let TeachersService = class TeachersService {
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
    async createTeacher(data) {
        const tenantId = this.getTenantId();
        const emailLower = data.email.toLowerCase().trim();
        const existing = await this.prisma.user.findUnique({
            where: { email: emailLower },
        });
        if (existing) {
            throw new common_1.ConflictException('Email already registered');
        }
        const normalizedPhone = data.phone ? data.phone.replace(/\D/g, '').slice(-10) : undefined;
        if (normalizedPhone) {
            const existingPhone = await this.prisma.user.findFirst({
                where: { phone: normalizedPhone },
            });
            if (existingPhone) {
                throw new common_1.ConflictException('Phone number already registered');
            }
        }
        const defaultPassword = data.password || 'StaffPass@123';
        const passwordHash = await bcrypt.hash(defaultPassword, 10);
        const isDriver = data.designation?.toLowerCase().includes('driver');
        const userRole = data.staffType === 'Non-Teaching'
            ? (isDriver ? client_1.Role.DRIVER : client_1.Role.STAFF)
            : client_1.Role.TEACHER;
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: emailLower,
                    name: data.name,
                    passwordHash,
                    role: userRole,
                    phone: normalizedPhone,
                    tenantId,
                    avatarUrl: data.avatarUrl || null,
                },
            });
            const profile = await tx.staffProfile.create({
                data: {
                    userId: user.id,
                    employeeId: data.employeeId,
                    designation: data.designation || (userRole === client_1.Role.STAFF ? 'Staff' : userRole === client_1.Role.DRIVER ? 'Driver' : 'Teacher'),
                    basicSalary: data.basicSalary,
                    allowances: data.allowances,
                    deductions: data.deductions,
                    pfDeduction: data.pfDeduction,
                    joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
                    status: 'Active',
                    qualification: data.qualification,
                    subjectsTaught: data.subjectsTaught || [],
                    tenantId,
                },
            });
            if (userRole === client_1.Role.TEACHER && data.subjectsTaught) {
                for (const subName of data.subjectsTaught) {
                    if (!subName)
                        continue;
                    let subject = await tx.subject.findFirst({
                        where: { name: { equals: subName, mode: 'insensitive' }, tenantId }
                    });
                    if (!subject) {
                        subject = await tx.subject.create({
                            data: { name: subName, tenantId }
                        });
                    }
                    await tx.teacherSkill.create({
                        data: {
                            teacherId: profile.id,
                            subjectId: subject.id,
                            skillLevel: 'Expert',
                            yearsOfExperience: 5,
                            tenantId
                        }
                    });
                }
            }
            return { user, profile };
        });
    }
    async getTeachers(filters) {
        const tenantId = this.getTenantId();
        const andConditions = [];
        if (filters?.status) {
            andConditions.push({ status: filters.status });
        }
        if (filters?.department) {
            const dept = filters.department;
            const deptConditions = [
                { subjectsTaught: { has: dept } }
            ];
            if (dept === 'Transport') {
                deptConditions.push({ designation: { contains: 'driver', mode: 'insensitive' } });
            }
            else if (dept === 'Library') {
                deptConditions.push({ designation: { contains: 'librarian', mode: 'insensitive' } });
            }
            else if (dept === 'Finance') {
                deptConditions.push({ designation: { contains: 'account', mode: 'insensitive' } });
            }
            else if (dept === 'Security') {
                deptConditions.push({ designation: { contains: 'security', mode: 'insensitive' } });
            }
            else if (dept === 'Administration') {
                deptConditions.push({
                    AND: [
                        { designation: { not: { contains: 'driver', mode: 'insensitive' } } },
                        { designation: { not: { contains: 'librarian', mode: 'insensitive' } } },
                        { designation: { not: { contains: 'account', mode: 'insensitive' } } },
                        { designation: { not: { contains: 'security', mode: 'insensitive' } } },
                        { designation: { not: { contains: 'teacher', mode: 'insensitive' } } },
                    ]
                });
            }
            else if (dept === 'Science') {
                deptConditions.push({
                    AND: [
                        { designation: { contains: 'teacher', mode: 'insensitive' } },
                        { subjectsTaught: { equals: [] } }
                    ]
                });
            }
            andConditions.push({ OR: deptConditions });
        }
        if (filters?.search) {
            const search = filters.search;
            andConditions.push({
                OR: [
                    { user: { name: { contains: search, mode: 'insensitive' } } },
                    { user: { email: { contains: search, mode: 'insensitive' } } },
                    { employeeId: { contains: search, mode: 'insensitive' } },
                ]
            });
        }
        const whereClause = {
            user: {
                tenantId,
                role: { in: [client_1.Role.TEACHER, client_1.Role.STAFF, client_1.Role.DRIVER] },
                isActive: true,
            },
        };
        if (andConditions.length > 0) {
            whereClause.AND = andConditions;
        }
        return this.prisma.staffProfile.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true,
                        avatarUrl: true,
                    },
                },
                teacherSkills: {
                    include: {
                        subject: { select: { id: true, name: true } },
                    },
                },
                _count: {
                    select: { teacherAssignments: true },
                },
            },
            orderBy: {
                user: {
                    name: 'asc',
                },
            },
        });
    }
    async getTeachingStaff() {
        const tenantId = this.getTenantId();
        return this.prisma.staffProfile.findMany({
            where: {
                user: {
                    tenantId,
                    role: client_1.Role.TEACHER,
                    isActive: true,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true,
                        avatarUrl: true,
                    },
                },
                _count: {
                    select: { teacherAssignments: true },
                },
            },
            orderBy: {
                user: {
                    name: 'asc',
                },
            },
        });
    }
    async assignClassSubject(teacherId, classSectionId, subjectId, periodsPerWeek) {
        const tenantId = this.getTenantId();
        const assignment = await this.prisma.teacherAssignment.upsert({
            where: {
                teacherId_classSectionId_subjectId: {
                    teacherId,
                    classSectionId,
                    subjectId,
                },
            },
            create: {
                teacherId,
                classSectionId,
                subjectId,
                periodsPerWeek,
                tenantId,
            },
            update: {
                periodsPerWeek,
            },
        });
        await this.prisma.teacherSkill.upsert({
            where: {
                teacherId_subjectId: {
                    teacherId,
                    subjectId,
                },
            },
            create: {
                teacherId,
                subjectId,
                skillLevel: 'Beginner',
                yearsOfExperience: 0,
                tenantId,
            },
            update: {},
        });
        return assignment;
    }
    async getAssignments(teacherId) {
        const tenantId = this.getTenantId();
        return this.prisma.teacherAssignment.findMany({
            where: { tenantId, teacherId },
            include: {
                classSection: {
                    include: {
                        class: true,
                        section: true,
                    },
                },
                subject: true,
            },
        });
    }
    async saveSkill(teacherId, subjectId, skillLevel, yearsOfExperience) {
        const tenantId = this.getTenantId();
        return this.prisma.teacherSkill.create({
            data: {
                teacherId,
                subjectId,
                skillLevel,
                yearsOfExperience,
                tenantId,
            },
        });
    }
    async getSkills(teacherId) {
        const tenantId = this.getTenantId();
        return this.prisma.teacherSkill.findMany({
            where: { tenantId, teacherId },
            include: {
                subject: true,
            },
        });
    }
    async deleteTeacher(id) {
        const tenantId = this.getTenantId();
        const profile = await this.prisma.staffProfile.findFirst({
            where: { id, user: { tenantId } },
            include: { user: true }
        });
        if (!profile) {
            throw new common_1.NotFoundException('Staff profile not found');
        }
        try {
            return await this.prisma.$transaction(async (tx) => {
                await tx.bus.updateMany({
                    where: { driverId: id },
                    data: { driverId: null },
                });
                await tx.busTrip.updateMany({
                    where: { driverId: id },
                    data: { driverId: null },
                });
                await tx.classSection.updateMany({
                    where: { teacherId: id },
                    data: { teacherId: null },
                });
                await tx.period.updateMany({
                    where: {
                        OR: [{ teacherId: id }, { substituteTeacherId: id }],
                    },
                    data: {
                        teacherId: null,
                        substituteTeacherId: null,
                    },
                });
                await tx.behaviorCase.updateMany({
                    where: { teacherId: id },
                    data: { teacherId: null },
                });
                await tx.teacherAssignment.deleteMany({
                    where: { teacherId: id },
                });
                await tx.teacherSkill.deleteMany({
                    where: { teacherId: id },
                });
                await tx.staffProfile.update({
                    where: { id },
                    data: { status: 'INACTIVE' },
                });
                await tx.user.update({
                    where: { id: profile.userId },
                    data: { isActive: false },
                });
                return { success: true };
            });
        }
        catch (err) {
            console.error('Error in deleteTeacher:', err);
            throw new common_1.BadRequestException(err.message || 'Failed to delete staff member due to dependent records.');
        }
    }
    async updateTeacher(id, data) {
        const tenantId = this.getTenantId();
        const profile = await this.prisma.staffProfile.findFirst({
            where: { id, user: { tenantId } },
            include: { user: true }
        });
        if (!profile) {
            throw new common_1.NotFoundException('Teacher profile not found');
        }
        return this.prisma.$transaction(async (tx) => {
            if (data.name !== undefined || data.phone !== undefined || data.email !== undefined || data.avatarUrl !== undefined) {
                const normalizedPhone = data.phone ? data.phone.replace(/\D/g, '').slice(-10) : data.phone;
                await tx.user.update({
                    where: { id: profile.userId },
                    data: {
                        name: data.name !== undefined ? data.name : undefined,
                        phone: data.phone !== undefined ? normalizedPhone : undefined,
                        email: data.email !== undefined ? data.email.toLowerCase().trim() : undefined,
                        avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : undefined,
                    }
                });
            }
            const updatedProfile = await tx.staffProfile.update({
                where: { id },
                data: {
                    employeeId: data.employeeId !== undefined ? data.employeeId : undefined,
                    designation: data.designation !== undefined ? data.designation : undefined,
                    basicSalary: data.basicSalary !== undefined ? data.basicSalary : undefined,
                    allowances: data.allowances !== undefined ? data.allowances : undefined,
                    deductions: data.deductions !== undefined ? data.deductions : undefined,
                    pfDeduction: data.pfDeduction !== undefined ? data.pfDeduction : undefined,
                    status: data.status !== undefined ? data.status : undefined,
                    qualification: data.qualification !== undefined ? data.qualification : undefined,
                    subjectsTaught: data.subjectsTaught !== undefined ? data.subjectsTaught : undefined,
                }
            });
            if (data.skills !== undefined || data.subjectsTaught !== undefined) {
                const skillsToSave = data.skills !== undefined
                    ? data.skills
                    : (data.subjectsTaught || []).map((sub) => ({ subject: sub, level: 'Expert', exp: 5 }));
                const activeSubjectIds = [];
                for (const sk of skillsToSave) {
                    const subName = sk.subject;
                    if (!subName)
                        continue;
                    let subject = await tx.subject.findFirst({
                        where: { name: { equals: subName, mode: 'insensitive' }, tenantId }
                    });
                    if (!subject) {
                        subject = await tx.subject.create({
                            data: { name: subName, tenantId }
                        });
                    }
                    activeSubjectIds.push(subject.id);
                    await tx.teacherSkill.upsert({
                        where: {
                            teacherId_subjectId: {
                                teacherId: id,
                                subjectId: subject.id
                            }
                        },
                        create: {
                            teacherId: id,
                            subjectId: subject.id,
                            skillLevel: sk.level || 'Expert',
                            yearsOfExperience: sk.exp ?? 5,
                            tenantId
                        },
                        update: {
                            skillLevel: sk.level || 'Expert',
                            yearsOfExperience: sk.exp ?? 5
                        }
                    });
                }
                await tx.teacherSkill.deleteMany({
                    where: {
                        teacherId: id,
                        subjectId: { notIn: activeSubjectIds }
                    }
                });
            }
            return updatedProfile;
        });
    }
    async paySalary(id, month) {
        const tenantId = this.getTenantId();
        const profile = await this.prisma.staffProfile.findFirst({
            where: { id, user: { tenantId } },
            include: { user: true }
        });
        if (!profile) {
            throw new common_1.NotFoundException('Staff profile not found');
        }
        const netSalary = Number(profile.basicSalary || 0) + Number(profile.allowances || 0) - Number(profile.pfDeduction || 0);
        return this.prisma.expense.create({
            data: {
                amount: netSalary,
                category: 'Salary',
                date: new Date(),
                description: `Salary disbursed to ${profile.user.name} (${profile.employeeId || 'Staff'}) for ${month}`,
                paymentMode: 'BANK_TRANSFER',
                status: 'PAID',
                tenantId,
            }
        });
    }
    async getSalaryInvoices(staffProfileId) {
        const tenantId = this.getTenantId();
        const profile = await this.prisma.staffProfile.findFirst({
            where: { id: staffProfileId, user: { tenantId } },
            include: { user: true },
        });
        if (!profile)
            return [];
        const nameFragment = profile.user.name;
        const empId = profile.employeeId || '';
        return this.prisma.expense.findMany({
            where: {
                tenantId,
                category: 'Salary',
                description: {
                    contains: nameFragment,
                    mode: 'insensitive',
                },
            },
            orderBy: { date: 'desc' },
            select: {
                id: true,
                amount: true,
                category: true,
                date: true,
                description: true,
                status: true,
            },
        });
    }
    async getTeacherCases(teacherId) {
        const tenantId = this.getTenantId();
        return this.prisma.behaviorCase.findMany({
            where: { tenantId, teacherId },
            include: {
                student: {
                    include: {
                        user: { select: { name: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getTeacherSchedule(teacherId) {
        const tenantId = this.getTenantId();
        return this.prisma.period.findMany({
            where: { tenantId, teacherId },
            include: {
                subject: { select: { name: true } },
                classSection: {
                    include: {
                        class: { select: { name: true } },
                        section: { select: { name: true } },
                    },
                },
                periodTiming: { select: { startTime: true, endTime: true, periodNumber: true } },
            },
            orderBy: [{ dayOfWeek: 'asc' }, { periodTiming: { periodNumber: 'asc' } }],
        });
    }
    async payAllSalaries(month) {
        const tenantId = this.getTenantId();
        const staffMembers = await this.prisma.staffProfile.findMany({
            where: { user: { tenantId, isActive: true } },
            include: { user: true }
        });
        return this.prisma.$transaction(async (tx) => {
            const createdExpenses = [];
            for (const staff of staffMembers) {
                const netSalary = Number(staff.basicSalary || 0) + Number(staff.allowances || 0) - Number(staff.pfDeduction || 0);
                const exp = await tx.expense.create({
                    data: {
                        amount: netSalary,
                        category: 'Salary',
                        date: new Date(),
                        description: `Salary disbursed to ${staff.user.name} (${staff.employeeId || 'Staff'}) for ${month}`,
                        paymentMode: 'BANK_TRANSFER',
                        status: 'PAID',
                        tenantId,
                    }
                });
                createdExpenses.push(exp);
            }
            return createdExpenses;
        });
    }
};
exports.TeachersService = TeachersService;
exports.TeachersService = TeachersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeachersService);
//# sourceMappingURL=teachers.service.js.map