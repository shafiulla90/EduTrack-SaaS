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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const tenant_context_1 = require("../tenants/tenant.context");
const client_1 = require("@prisma/client");
const role_filter_helper_1 = require("../common/role-filter.helper");
const date_utils_1 = require("./date.utils");
let AttendanceService = class AttendanceService {
    constructor(prisma, roleFilterHelper) {
        this.prisma = prisma;
        this.roleFilterHelper = roleFilterHelper;
    }
    getTenantId() {
        const tenantId = tenant_context_1.TenantContext.getTenantId();
        if (!tenantId) {
            throw new common_1.BadRequestException('No active school tenant context found');
        }
        return tenantId;
    }
    formatTime(date) {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        const hoursStr = hours < 10 ? '0' + hours : hours;
        return `${hoursStr}:${minutesStr} ${ampm}`;
    }
    async getClasses(userId, role) {
        const tenantId = this.getTenantId();
        if (this.roleFilterHelper.isTeacher(role)) {
            const scope = await this.roleFilterHelper.buildTeacherScope(userId, tenantId);
            if (scope.assignedClassSectionIds.length === 0)
                return [];
            const classSections = await this.prisma.classSection.findMany({
                where: { id: { in: scope.assignedClassSectionIds }, tenantId },
                include: { class: true },
            });
            const classesMap = new Map();
            classSections.forEach(cs => classesMap.set(cs.class.id, cs.class));
            return Array.from(classesMap.values()).map((c) => ({
                label: c.name,
                value: c.name,
            }));
        }
        const classes = await this.prisma.class.findMany({
            where: { tenantId, isActive: true },
            orderBy: { name: 'asc' },
            take: 500,
        });
        return classes.map(c => ({
            label: c.name,
            value: c.name,
        }));
    }
    async getSections(classVal, userId, role) {
        const tenantId = this.getTenantId();
        if (this.roleFilterHelper.isTeacher(role)) {
            const scope = await this.roleFilterHelper.buildTeacherScope(userId, tenantId);
            if (scope.assignedClassSectionIds.length === 0)
                return [];
            const classSections = await this.prisma.classSection.findMany({
                where: {
                    id: { in: scope.assignedClassSectionIds },
                    tenantId,
                    ...(classVal ? { class: { name: { equals: classVal, mode: 'insensitive' } } } : {}),
                },
                include: { section: true },
            });
            const sectionsMap = new Map();
            classSections.forEach(cs => sectionsMap.set(cs.section.id, cs.section));
            return Array.from(sectionsMap.values()).map((s) => ({
                label: s.name,
                value: s.name,
            }));
        }
        const sections = await this.prisma.section.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' },
            take: 500,
        });
        return sections.map(s => ({
            label: s.name,
            value: s.name,
        }));
    }
    async getTeachers() {
        const tenantId = this.getTenantId();
        const staff = await this.prisma.staffProfile.findMany({
            where: {
                tenantId,
                user: {
                    role: { in: [client_1.Role.TEACHER, client_1.Role.STAFF] },
                    isActive: true,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                user: {
                    name: 'asc',
                },
            },
            take: 1000,
        });
        return staff.map(s => ({
            id: s.id,
            name: s.user.name,
            subject: s.subjectsTaught[0] || 'N/A',
        }));
    }
    async getRecentSubmissions() {
        const tenantId = this.getTenantId();
        const todayStr = (0, date_utils_1.getTodayDateString)();
        const todayDate = (0, date_utils_1.parseAttendanceDate)(todayStr);
        const todaySessions = await this.prisma.attendanceSession.findMany({
            where: {
                tenantId,
                date: todayDate,
            },
            include: {
                classSection: {
                    include: {
                        class: true,
                        section: true,
                    },
                },
                takenBy: {
                    include: {
                        user: {
                            select: { name: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
        if (todaySessions.length === 0) {
            return [
                {
                    id: 'pending',
                    text: "Today's attendance is currently pending",
                },
            ];
        }
        return todaySessions.map(s => {
            const className = s.classSection?.class?.name || 'N/A';
            const sectionName = s.classSection?.section?.name || 'N/A';
            const teacherName = s.takenBy?.user?.name || 'N/A';
            return {
                id: s.id,
                text: `${className} - ${sectionName} submitted by ${teacherName}`,
            };
        });
    }
    async getHistory() {
        const tenantId = this.getTenantId();
        const sessions = await this.prisma.attendanceSession.findMany({
            where: { tenantId },
            include: {
                classSection: {
                    include: {
                        class: true,
                        section: true,
                    },
                },
                takenBy: {
                    include: {
                        user: {
                            select: { name: true },
                        },
                    },
                },
            },
            orderBy: { date: 'desc' },
            take: 100,
        });
        return sessions.map(s => {
            return {
                id: s.id,
                date: (0, date_utils_1.formatAttendanceDate)(s.date),
                classSection: {
                    class: { name: s.classSection?.class?.name || 'N/A' },
                    section: { name: s.classSection?.section?.name || 'N/A' },
                },
                presentCount: s.presentCount,
                absentCount: s.absentCount,
                totalStudents: s.totalStudents,
                teacherId: s.takenById,
                teacherName: s.takenBy?.user?.name || 'N/A',
            };
        });
    }
    async getStudents(classVal, sectionVal, userId, role) {
        const tenantId = this.getTenantId();
        if (!classVal || !sectionVal)
            return [];
        const cls = await this.prisma.class.findFirst({
            where: {
                tenantId,
                name: { equals: classVal.trim(), mode: 'insensitive' },
            },
        });
        const sec = await this.prisma.section.findFirst({
            where: {
                tenantId,
                name: { equals: sectionVal.trim(), mode: 'insensitive' },
            },
        });
        if (!cls || !sec)
            return [];
        const classSection = await this.prisma.classSection.findUnique({
            where: {
                classId_sectionId: {
                    classId: cls.id,
                    sectionId: sec.id,
                },
            },
        });
        if (!classSection)
            return [];
        if (this.roleFilterHelper.isTeacher(role)) {
            const scope = await this.roleFilterHelper.buildTeacherScope(userId, tenantId);
            if (!scope.assignedClassSectionIds.includes(classSection.id)) {
                throw new common_1.BadRequestException('You do not have teaching permissions for this class.');
            }
        }
        const studentList = await this.prisma.studentProfile.findMany({
            where: {
                tenantId,
                classSectionId: classSection.id,
            },
            include: {
                user: {
                    select: { name: true },
                },
            },
            orderBy: {
                user: { name: 'asc' },
            },
            take: 1000,
        });
        return studentList.map(s => ({
            Id: s.id,
            Name: s.user.name,
            Roll_No__c: s.rollNo || '',
        }));
    }
    async getSessionData(classVal, sectionVal, dateStr, userId, role) {
        const tenantId = this.getTenantId();
        if (!classVal || !sectionVal || !dateStr) {
            return { sessionExists: false, absentIds: [], total: 0, present: 0, absent: 0 };
        }
        const cls = await this.prisma.class.findFirst({
            where: {
                tenantId,
                name: { equals: classVal.trim(), mode: 'insensitive' },
            },
        });
        const sec = await this.prisma.section.findFirst({
            where: {
                tenantId,
                name: { equals: sectionVal.trim(), mode: 'insensitive' },
            },
        });
        if (!cls || !sec) {
            return { sessionExists: false, absentIds: [], total: 0, present: 0, absent: 0 };
        }
        const classSection = await this.prisma.classSection.findUnique({
            where: {
                classId_sectionId: {
                    classId: cls.id,
                    sectionId: sec.id,
                },
            },
        });
        if (!classSection) {
            return { sessionExists: false, absentIds: [], total: 0, present: 0, absent: 0 };
        }
        if (this.roleFilterHelper.isTeacher(role)) {
            const scope = await this.roleFilterHelper.buildTeacherScope(userId, tenantId);
            if (!scope.assignedClassSectionIds.includes(classSection.id)) {
                throw new common_1.BadRequestException('You do not have teaching permissions for this class.');
            }
        }
        const searchDate = (0, date_utils_1.parseAttendanceDate)(dateStr);
        const session = await this.prisma.attendanceSession.findFirst({
            where: {
                tenantId,
                classSectionId: classSection.id,
                date: searchDate,
            },
            include: {
                attendances: true,
                takenBy: {
                    include: {
                        user: {
                            select: { name: true },
                        },
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
        if (!session) {
            return { sessionExists: false, absentIds: [], total: 0, present: 0, absent: 0 };
        }
        const absentIds = session.attendances
            .filter(a => a.status === client_1.AttendanceStatus.ABSENT)
            .map(a => a.studentId);
        return {
            sessionExists: true,
            sessionId: session.id,
            teacherName: session.takenBy?.user?.name || 'Unknown',
            createdTime: this.formatTime(session.createdAt),
            lastUpdatedTime: this.formatTime(session.updatedAt),
            createdAt: session.createdAt.toISOString(),
            updatedAt: session.updatedAt.toISOString(),
            total: session.totalStudents,
            present: session.presentCount,
            absent: session.absentCount,
            absentIds,
        };
    }
    async saveAttendance(data, userId, role) {
        const tenantId = this.getTenantId();
        const date = (0, date_utils_1.parseAttendanceDate)(data.dateStr || data.date);
        const dateStr = data.dateStr || (0, date_utils_1.formatAttendanceDate)(date);
        const todayStr = (0, date_utils_1.getTodayDateString)();
        if ((0, date_utils_1.isBeforeDateString)(dateStr, todayStr) && !data.allowPastDates) {
            throw new common_1.BadRequestException('Historical records are in Read-Only mode.');
        }
        const classVal = (data.classVal || '').trim();
        const sectionVal = (data.sectionVal || '').trim();
        const absentStudentIds = data.absentStudentIds || [];
        const totalStudents = data.totalStudents || 0;
        const presentCount = data.presentCount || 0;
        const absentCount = data.absentCount || 0;
        let teacherId = data.teacherId;
        if (!classVal || !sectionVal) {
            throw new common_1.BadRequestException('Class and Section names are required.');
        }
        if (this.roleFilterHelper.isTeacher(role)) {
            const scope = await this.roleFilterHelper.buildTeacherScope(userId, tenantId);
            const clsObj = await this.prisma.class.findFirst({
                where: { tenantId, name: { equals: classVal, mode: 'insensitive' } },
            });
            const secObj = await this.prisma.section.findFirst({
                where: { tenantId, name: { equals: sectionVal, mode: 'insensitive' } },
            });
            if (clsObj && secObj) {
                const cs = await this.prisma.classSection.findFirst({
                    where: { classId: clsObj.id, sectionId: secObj.id },
                });
                if (cs && !scope.assignedClassSectionIds.includes(cs.id)) {
                    throw new common_1.BadRequestException('You do not have teaching permissions for this class.');
                }
            }
            teacherId = scope.staff.id;
        }
        const result = await this.prisma.$transaction(async (tx) => {
            let cls = await tx.class.findFirst({
                where: {
                    tenantId,
                    name: { equals: classVal, mode: 'insensitive' },
                },
            });
            if (!cls) {
                const acadYear = await tx.academicYear.findFirst({
                    where: { tenantId, isActive: true },
                });
                if (!acadYear) {
                    throw new common_1.BadRequestException('No active Academic Year found for setup.');
                }
                cls = await tx.class.create({
                    data: {
                        name: classVal,
                        tenantId,
                        academicYearId: acadYear.id,
                    },
                });
            }
            let sec = await tx.section.findFirst({
                where: {
                    tenantId,
                    name: { equals: sectionVal, mode: 'insensitive' },
                },
            });
            if (!sec) {
                sec = await tx.section.create({
                    data: {
                        name: sectionVal,
                        tenantId,
                    },
                });
            }
            let classSection = await tx.classSection.findUnique({
                where: {
                    classId_sectionId: {
                        classId: cls.id,
                        sectionId: sec.id,
                    },
                },
            });
            if (!classSection) {
                classSection = await tx.classSection.create({
                    data: {
                        classId: cls.id,
                        sectionId: sec.id,
                        tenantId,
                    },
                });
            }
            let finalTeacherId = teacherId;
            if (!finalTeacherId) {
                const firstStaff = await tx.staffProfile.findFirst({
                    where: { tenantId }
                });
                if (firstStaff) {
                    finalTeacherId = firstStaff.id;
                }
                else {
                    throw new common_1.BadRequestException('No teacher/staff profile exists for this school. Please register a teacher first.');
                }
            }
            else {
                const staffExists = await tx.staffProfile.findUnique({
                    where: { id: finalTeacherId }
                });
                if (!staffExists) {
                    const firstStaff = await tx.staffProfile.findFirst({
                        where: { tenantId }
                    });
                    if (firstStaff) {
                        finalTeacherId = firstStaff.id;
                    }
                    else {
                        throw new common_1.BadRequestException('Teacher profile not found.');
                    }
                }
            }
            const existingSessions = await tx.attendanceSession.findMany({
                where: {
                    tenantId,
                    classSectionId: classSection.id,
                    date,
                },
                orderBy: { createdAt: 'asc' },
            });
            let session;
            if (existingSessions.length === 0) {
                session = await tx.attendanceSession.create({
                    data: {
                        classSectionId: classSection.id,
                        date,
                        takenById: finalTeacherId,
                        presentCount,
                        absentCount,
                        totalStudents,
                        tenantId,
                    },
                });
            }
            else {
                session = existingSessions[0];
                if (existingSessions.length > 1) {
                    const duplicateIds = existingSessions.slice(1).map(s => s.id);
                    await tx.attendanceSession.deleteMany({
                        where: {
                            id: { in: duplicateIds },
                        },
                    });
                }
                session = await tx.attendanceSession.update({
                    where: { id: session.id },
                    data: {
                        presentCount,
                        absentCount,
                        totalStudents,
                        takenById: finalTeacherId,
                    },
                });
            }
            await tx.attendance.deleteMany({
                where: {
                    attendanceSessionId: session.id,
                    NOT: {
                        studentId: { in: absentStudentIds },
                    },
                },
            });
            const storedAbsents = await tx.attendance.findMany({
                where: {
                    attendanceSessionId: session.id,
                    studentId: { in: absentStudentIds },
                },
                select: { studentId: true },
            });
            const storedAbsentIds = new Set(storedAbsents.map(a => a.studentId));
            const newAbsents = absentStudentIds.filter(id => !storedAbsentIds.has(id));
            if (newAbsents.length > 0) {
                const attendanceData = newAbsents.map(studentId => ({
                    attendanceSessionId: session.id,
                    studentId,
                    status: client_1.AttendanceStatus.ABSENT,
                    tenantId,
                }));
                await tx.attendance.createMany({
                    data: attendanceData,
                });
            }
            return { classVal, sectionVal, dateStr: data.dateStr || data.date };
        }, { timeout: 25000 });
        return this.getSessionData(result.classVal, result.sectionVal, result.dateStr);
    }
    async getAttendanceData(startDateStr, endDateStr) {
        const tenantId = this.getTenantId();
        const startDate = (0, date_utils_1.parseAttendanceDate)(startDateStr);
        const endDate = (0, date_utils_1.parseAttendanceDate)(endDateStr);
        const rawStudents = await this.prisma.studentProfile.findMany({
            where: { tenantId },
            include: {
                user: { select: { name: true } },
                classSection: {
                    include: {
                        class: true,
                        section: true,
                    },
                },
            },
        });
        const students = rawStudents.map(s => ({
            id: s.id,
            name: s.user.name,
            rollNo: s.rollNo || '',
            section: s.classSection?.section?.name || '',
            classValue: s.classSection?.class?.name || '',
            className: s.classSection?.class?.name || '',
        }));
        const rawAttendance = await this.prisma.attendance.findMany({
            where: {
                tenantId,
                attendanceSession: {
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
            },
            include: {
                student: {
                    select: {
                        rollNo: true,
                        user: { select: { name: true } },
                        classSection: {
                            include: {
                                class: true,
                                section: true,
                            },
                        },
                    },
                },
                attendanceSession: {
                    include: {
                        classSection: {
                            include: {
                                class: true,
                                section: true,
                            },
                        },
                    },
                },
            },
        });
        const attendanceRecords = rawAttendance.map(a => {
            const studentName = a.student?.user?.name || 'Unknown';
            const rollNo = a.student?.rollNo || '';
            const section = a.attendanceSession?.classSection?.section?.name || '';
            const classValue = a.attendanceSession?.classSection?.class?.name || '';
            return {
                id: a.id,
                studentId: a.studentId,
                studentName,
                rollNo,
                section,
                classValue,
                className: classValue,
                attendanceDate: (0, date_utils_1.formatAttendanceDate)(a.attendanceSession.date),
                status: a.status === client_1.AttendanceStatus.ABSENT ? 'Absent' : 'Present',
            };
        });
        const uniqueClasses = Array.from(new Set(students.map(s => s.classValue).filter(Boolean)));
        const uniqueSections = Array.from(new Set(students.map(s => s.section).filter(Boolean)));
        const rawSessions = await this.prisma.attendanceSession.findMany({
            where: {
                tenantId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                classSection: {
                    include: {
                        class: true,
                        section: true,
                    },
                },
            },
        });
        const sessions = rawSessions.map(s => ({
            id: s.id,
            classId: s.classSection?.class?.id || '',
            className: s.classSection?.class?.name || '',
            classValue: s.classSection?.class?.name || '',
            attendanceDate: (0, date_utils_1.formatAttendanceDate)(s.date),
            section: s.classSection?.section?.name || '',
            totalStudents: s.totalStudents,
            presentCount: s.presentCount,
            absentCount: s.absentCount,
        }));
        const totalAcc = await this.prisma.studentProfile.count({ where: { tenantId } });
        const debugStats = `Total StudentProfiles: ${totalAcc} | Matches: ${students.length}`;
        return {
            students,
            attendanceRecords,
            classes: uniqueClasses,
            sections: uniqueSections,
            sessions,
            debugStats,
        };
    }
    async getAttendanceById(id) {
        const tenantId = this.getTenantId();
        return this.prisma.attendance.findUnique({
            where: { id, tenantId },
        });
    }
    async updateAttendance(id, updateDto) {
        const tenantId = this.getTenantId();
        return this.prisma.attendance.update({
            where: { id, tenantId },
            data: {
                status: updateDto.status,
                reason: updateDto.reason,
            },
        });
    }
    async deleteAttendance(id) {
        const tenantId = this.getTenantId();
        return this.prisma.attendance.delete({
            where: { id, tenantId },
        });
    }
    async getDailySummary(date) {
        const tenantId = this.getTenantId();
        const searchDate = (0, date_utils_1.parseAttendanceDate)(date);
        const sessions = await this.prisma.attendanceSession.findMany({
            where: { tenantId, date: searchDate },
        });
        return sessions.reduce((acc, s) => {
            acc.totalStudents += s.totalStudents;
            acc.present += s.presentCount;
            acc.absent += s.absentCount;
            return acc;
        }, { totalStudents: 0, present: 0, absent: 0 });
    }
    async getMonthlySummary(month, year) {
        const tenantId = this.getTenantId();
        const now = new Date();
        const m = month ? parseInt(month, 10) - 1 : now.getMonth();
        const y = year ? parseInt(year, 10) : now.getFullYear();
        const start = new Date(y, m, 1);
        const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
        const sessions = await this.prisma.attendanceSession.findMany({
            where: {
                tenantId,
                date: { gte: start, lte: end },
            },
        });
        return sessions.reduce((acc, s) => {
            acc.totalStudents += s.totalStudents;
            acc.present += s.presentCount;
            acc.absent += s.absentCount;
            return acc;
        }, { totalStudents: 0, present: 0, absent: 0 });
    }
    async getClassAttendanceReport(classSectionId, date) {
        const tenantId = this.getTenantId();
        const where = { tenantId, classSectionId };
        if (date) {
            where.date = (0, date_utils_1.parseAttendanceDate)(date);
        }
        const sessions = await this.prisma.attendanceSession.findMany({ where });
        return sessions.reduce((acc, s) => {
            acc.totalStudents += s.totalStudents;
            acc.present += s.presentCount;
            acc.absent += s.absentCount;
            return acc;
        }, { totalStudents: 0, present: 0, absent: 0 });
    }
    async getStudentAttendanceReport(studentId, date) {
        const tenantId = this.getTenantId();
        const where = { tenantId, studentId };
        if (date) {
            where.attendanceSession = { date: (0, date_utils_1.parseAttendanceDate)(date) };
        }
        const records = await this.prisma.attendance.findMany({ where });
        const total = records.length;
        const present = records.filter(r => r.status === client_1.AttendanceStatus.PRESENT).length;
        const absent = records.filter(r => r.status === client_1.AttendanceStatus.ABSENT).length;
        return { total, present, absent };
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        role_filter_helper_1.RoleFilterHelper])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map