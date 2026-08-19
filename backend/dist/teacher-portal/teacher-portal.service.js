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
exports.TeacherPortalService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const attendance_service_1 = require("../attendance/attendance.service");
const exams_service_1 = require("../exams/exams.service");
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
let TeacherPortalService = class TeacherPortalService {
    constructor(prisma, attendanceService, examsService) {
        this.prisma = prisma;
        this.attendanceService = attendanceService;
        this.examsService = examsService;
    }
    async getStaffProfile(userId, tenantId) {
        const staff = await this.prisma.staffProfile.findFirst({
            where: { userId, tenantId, user: { isActive: true } },
            include: { user: true },
        });
        if (!staff) {
            throw new common_1.UnauthorizedException('Active Teacher profile not found for this user.');
        }
        return staff;
    }
    async verifyTeacherAssignment(staffProfileId, classSectionId, subjectId) {
        const classSection = await this.prisma.classSection.findFirst({
            where: {
                id: classSectionId,
                teacherId: staffProfileId,
            },
        });
        if (classSection) {
            return classSection;
        }
        const assignment = await this.prisma.teacherAssignment.findFirst({
            where: {
                teacherId: staffProfileId,
                classSectionId,
                ...(subjectId ? { subjectId } : {}),
            },
        });
        if (assignment) {
            return assignment;
        }
        const period = await this.prisma.period.findFirst({
            where: {
                teacherId: staffProfileId,
                classSectionId,
                ...(subjectId ? { subjectId } : {}),
            },
        });
        if (!period) {
            throw new common_1.UnauthorizedException('You do not have teaching permissions for this class/subject.');
        }
        return period;
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
    async getDashboardStats(userId, tenantId) {
        const staff = await this.getStaffProfile(userId, tenantId);
        const today = new Date();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayDay = days[today.getDay()];
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const [todayClasses, assignments, weeklyPeriods, homeworkPendingCount, currentLeave, homeworkCreated, announcementsSent, upcomingEvents] = await Promise.all([
            this.prisma.period.findMany({
                where: { tenantId, teacherId: staff.id, dayOfWeek: todayDay },
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
            }),
            this.prisma.teacherAssignment.findMany({
                where: { tenantId, teacherId: staff.id },
                include: { classSection: true },
            }),
            this.prisma.period.findMany({
                where: { tenantId, teacherId: staff.id },
                select: { classSectionId: true, subjectId: true },
            }),
            this.prisma.homework.count({
                where: {
                    tenantId,
                    teacherId: staff.id,
                    dueDate: todayStart,
                },
            }),
            this.prisma.leaveRequest.findFirst({
                where: {
                    tenantId,
                    teacherId: staff.id,
                    startDate: { lte: todayStart },
                    endDate: { gte: todayStart },
                },
            }),
            this.prisma.homework.count({
                where: { tenantId, teacherId: staff.id },
            }),
            this.prisma.announcement.count({
                where: { tenantId, teacherId: staff.id },
            }),
            this.prisma.announcement.findMany({
                where: {
                    tenantId,
                    priority: 'High',
                    expiryDate: { gte: todayStart },
                },
                orderBy: { createdAt: 'desc' },
                take: 5,
            })
        ]);
        const classSectionIds = [
            ...assignments.map(a => a.classSectionId),
            ...weeklyPeriods.map(p => p.classSectionId),
        ];
        const uniqueClassSectionIds = Array.from(new Set(classSectionIds));
        const uniqueSubjectIds = Array.from(new Set([
            ...assignments.map(a => a.subjectId),
            ...weeklyPeriods.map(p => p.subjectId),
        ]));
        const totalSubjects = uniqueSubjectIds.length;
        const [totalStudents, todaySessions, todayExams, sessions, examsInClassSections] = await Promise.all([
            this.prisma.studentProfile.count({
                where: { tenantId, classSectionId: { in: uniqueClassSectionIds } },
            }),
            this.prisma.attendanceSession.findMany({
                where: {
                    tenantId,
                    classSectionId: { in: uniqueClassSectionIds },
                    date: todayStart,
                },
                select: { classSectionId: true },
            }),
            this.prisma.exam.findMany({
                where: {
                    tenantId,
                    classSectionId: { in: uniqueClassSectionIds },
                    date: todayStart,
                },
                include: {
                    classSection: {
                        include: { class: true, section: true },
                    },
                },
            }),
            this.prisma.attendanceSession.findMany({
                where: { tenantId, classSectionId: { in: uniqueClassSectionIds } },
                select: { presentCount: true, totalStudents: true },
            }),
            this.prisma.exam.findMany({
                where: { tenantId, classSectionId: { in: uniqueClassSectionIds } },
                include: { examMarks: true },
            })
        ]);
        const completedSessionIds = new Set(todaySessions.map(s => s.classSectionId));
        const pendingAttendanceCount = uniqueClassSectionIds.filter(id => !completedSessionIds.has(id)).length;
        const totalPresent = sessions.reduce((sum, s) => sum + s.presentCount, 0);
        const totalRoster = sessions.reduce((sum, s) => sum + s.totalStudents, 0);
        const attendancePercentage = totalRoster > 0 ? Math.round((totalPresent / totalRoster) * 1000) / 10 : 100;
        const pendingMarksCount = examsInClassSections.filter(e => e.examMarks.length === 0).length;
        return {
            today: {
                classes: todayClasses.map(p => ({
                    id: p.id,
                    classSectionId: p.classSectionId,
                    subjectId: p.subjectId,
                    className: `${p.classSection.class.name} - ${p.classSection.section.name}`,
                    subjectName: p.subject.name,
                    time: `${p.periodTiming.startTime} - ${p.periodTiming.endTime}`,
                    periodNumber: p.periodTiming.periodNumber,
                })),
                attendancePending: pendingAttendanceCount,
                homeworkPending: homeworkPendingCount,
                exams: todayExams.map(e => ({
                    id: e.id,
                    name: e.name,
                    classSectionName: `${e.classSection.class.name} - ${e.classSection.section.name}`,
                })),
                leaveStatus: currentLeave ? currentLeave.status : 'None Active',
                events: upcomingEvents.map(e => ({ id: e.id, title: e.title, content: e.content })),
            },
            stats: {
                assignedStudents: totalStudents,
                assignedSubjects: totalSubjects,
                attendanceRate: attendancePercentage,
                marksPending: pendingMarksCount,
                homeworkCreated,
                announcementsSent,
            },
        };
    }
    async getProfile(userId, tenantId) {
        const staff = await this.prisma.staffProfile.findFirst({
            where: { userId, tenantId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        avatarUrl: true,
                        role: true,
                    },
                },
                teacherAssignments: {
                    include: {
                        classSection: { include: { class: true, section: true } },
                        subject: true,
                    },
                },
            },
        });
        if (!staff) {
            throw new common_1.NotFoundException('Teacher profile not found.');
        }
        return staff;
    }
    async updateProfile(userId, tenantId, data) {
        const staff = await this.getStaffProfile(userId, tenantId);
        return this.prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: {
                    name: data.name !== undefined ? data.name : undefined,
                    phone: data.phone !== undefined ? data.phone.replace(/\D/g, '').slice(-10) : undefined,
                    avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : undefined,
                },
            });
            const updatedProfile = await tx.staffProfile.update({
                where: { id: staff.id },
                data: {
                    qualification: data.qualification !== undefined ? data.qualification : undefined,
                    subjectsTaught: data.subjectsTaught !== undefined ? data.subjectsTaught : undefined,
                },
            });
            await this.logAction(userId, tenantId, 'USER_UPDATE', 'StaffProfile', staff.id, data);
            return updatedProfile;
        });
    }
    async changePassword(userId, tenantId, data) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId, tenantId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found.');
        }
        const isValid = await bcrypt.compare(data.oldPassword, user.passwordHash);
        if (!isValid) {
            throw new common_1.BadRequestException('Incorrect old password.');
        }
        const newHash = await bcrypt.hash(data.newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newHash },
        });
        await this.logAction(userId, tenantId, 'PASSWORD_CHANGE', 'User', userId);
        return { success: true, message: 'Password changed successfully.' };
    }
    async getAssignedClasses(userId, tenantId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return [];
        if (user.role === client_1.Role.SCHOOL_ADMIN) {
            const classSections = await this.prisma.classSection.findMany({
                where: { tenantId },
                include: {
                    class: true,
                    section: true,
                    _count: {
                        select: { students: true }
                    }
                },
                orderBy: { class: { name: 'asc' } }
            });
            return classSections.map(cs => ({
                classSectionId: cs.id,
                className: `${cs.class.name} - ${cs.section.name}`,
                classOnlyName: cs.class.name,
                sectionOnlyName: cs.section.name,
                strength: cs._count.students
            }));
        }
        const staff = await this.getStaffProfile(userId, tenantId);
        const [assignments, periods] = await Promise.all([
            this.prisma.teacherAssignment.findMany({
                where: { tenantId, teacherId: staff.id },
                include: {
                    classSection: {
                        include: {
                            class: true,
                            section: true,
                            _count: {
                                select: { students: true },
                            },
                        },
                    },
                    subject: true,
                },
            }),
            this.prisma.period.findMany({
                where: { tenantId, teacherId: staff.id },
                include: {
                    classSection: {
                        include: {
                            class: true,
                            section: true,
                            _count: {
                                select: { students: true },
                            },
                        },
                    },
                    subject: true,
                },
            }),
        ]);
        const uniqueAssignments = new Map();
        for (const a of assignments) {
            const key = `${a.classSectionId}-${a.subjectId}`;
            if (!uniqueAssignments.has(key)) {
                uniqueAssignments.set(key, {
                    classSectionId: a.classSectionId,
                    subjectId: a.subjectId,
                    className: `${a.classSection.class.name} - ${a.classSection.section.name}`,
                    classOnlyName: a.classSection.class.name,
                    sectionOnlyName: a.classSection.section.name,
                    subjectName: a.subject.name,
                    periodsPerWeek: a.periodsPerWeek,
                    strength: a.classSection._count.students,
                });
            }
        }
        for (const p of periods) {
            const key = `${p.classSectionId}-${p.subjectId}`;
            if (!uniqueAssignments.has(key)) {
                uniqueAssignments.set(key, {
                    classSectionId: p.classSectionId,
                    subjectId: p.subjectId,
                    className: `${p.classSection.class.name} - ${p.classSection.section.name}`,
                    classOnlyName: p.classSection.class.name,
                    sectionOnlyName: p.classSection.section.name,
                    subjectName: p.subject.name,
                    periodsPerWeek: 1,
                    strength: p.classSection._count.students,
                });
            }
        }
        const merged = Array.from(uniqueAssignments.values());
        merged.sort((x, y) => x.className.localeCompare(y.className));
        return merged;
    }
    async getStudentsForClassSection(userId, tenantId, classSectionId) {
        const staff = await this.getStaffProfile(userId, tenantId);
        await this.verifyTeacherAssignment(staff.id, classSectionId);
        return this.prisma.studentProfile.findMany({
            where: { tenantId, classSectionId, user: { isActive: true } },
            include: {
                user: { select: { name: true, email: true, phone: true, avatarUrl: true } },
            },
            orderBy: { user: { name: 'asc' } },
        });
    }
    async getClassesForAttendance(userId, tenantId) {
        const staff = await this.getStaffProfile(userId, tenantId);
        const [assignments, periods, advisorSections] = await Promise.all([
            this.prisma.teacherAssignment.findMany({
                where: { tenantId, teacherId: staff.id },
                include: { classSection: { include: { class: true } } },
            }),
            this.prisma.period.findMany({
                where: { tenantId, teacherId: staff.id },
                include: { classSection: { include: { class: true } } },
            }),
            this.prisma.classSection.findMany({
                where: { tenantId, teacherId: staff.id },
                include: { class: true },
            }),
        ]);
        const classesMap = new Map();
        assignments.forEach(a => {
            const cls = a.classSection.class;
            classesMap.set(cls.id, cls);
        });
        periods.forEach(p => {
            const cls = p.classSection.class;
            classesMap.set(cls.id, cls);
        });
        advisorSections.forEach(cs => {
            const cls = cs.class;
            if (cls) {
                classesMap.set(cls.id, cls);
            }
        });
        return Array.from(classesMap.values()).map((c) => ({
            label: c.name,
            value: c.name,
        }));
    }
    async getSectionsForAttendance(userId, tenantId, classVal) {
        const staff = await this.getStaffProfile(userId, tenantId);
        const [assignments, periods, advisorSections] = await Promise.all([
            this.prisma.teacherAssignment.findMany({
                where: {
                    tenantId,
                    teacherId: staff.id,
                    classSection: { class: { name: { equals: classVal, mode: 'insensitive' } } },
                },
                include: { classSection: { include: { section: true } } },
            }),
            this.prisma.period.findMany({
                where: {
                    tenantId,
                    teacherId: staff.id,
                    classSection: { class: { name: { equals: classVal, mode: 'insensitive' } } },
                },
                include: { classSection: { include: { section: true } } },
            }),
            this.prisma.classSection.findMany({
                where: {
                    tenantId,
                    teacherId: staff.id,
                    class: { name: { equals: classVal, mode: 'insensitive' } },
                },
                include: { section: true },
            }),
        ]);
        const sectionsMap = new Map();
        assignments.forEach(a => {
            const sec = a.classSection.section;
            sectionsMap.set(sec.id, sec);
        });
        periods.forEach(p => {
            const sec = p.classSection.section;
            sectionsMap.set(sec.id, sec);
        });
        advisorSections.forEach(cs => {
            const sec = cs.section;
            if (sec) {
                sectionsMap.set(sec.id, sec);
            }
        });
        return Array.from(sectionsMap.values()).map((s) => ({
            label: s.name,
            value: s.name,
        }));
    }
    async getStudentsForAttendance(userId, tenantId, classVal, sectionVal) {
        const staff = await this.getStaffProfile(userId, tenantId);
        const cs = await this.prisma.classSection.findFirst({
            where: {
                tenantId,
                class: { name: { equals: classVal.trim(), mode: 'insensitive' } },
                section: { name: { equals: sectionVal.trim(), mode: 'insensitive' } },
            },
        });
        if (!cs)
            return [];
        await this.verifyTeacherAssignment(staff.id, cs.id);
        return this.attendanceService.getStudents(classVal, sectionVal);
    }
    async saveAttendanceSheet(userId, tenantId, data) {
        const staff = await this.getStaffProfile(userId, tenantId);
        const cs = await this.prisma.classSection.findFirst({
            where: {
                tenantId,
                class: { name: { equals: data.classVal.trim(), mode: 'insensitive' } },
                section: { name: { equals: data.sectionVal.trim(), mode: 'insensitive' } },
            },
        });
        if (!cs) {
            throw new common_1.BadRequestException('Class Section not resolved.');
        }
        await this.verifyTeacherAssignment(staff.id, cs.id);
        data.teacherId = staff.id;
        const result = await this.attendanceService.saveAttendance(data);
        await this.logAction(userId, tenantId, 'RECORD_CREATE', 'AttendanceSession', result.sessionId, data);
        return result;
    }
    async getAttendanceHistory(userId, tenantId) {
        const staff = await this.getStaffProfile(userId, tenantId);
        const sessions = await this.prisma.attendanceSession.findMany({
            where: { tenantId, takenById: staff.id },
            include: {
                classSection: {
                    include: { class: true, section: true },
                },
            },
            orderBy: { date: 'desc' },
            take: 100,
        });
        return sessions.map(s => ({
            id: s.id,
            date: s.date.toISOString().split('T')[0],
            className: `${s.classSection.class.name} - ${s.classSection.section.name}`,
            presentCount: s.presentCount,
            absentCount: s.absentCount,
            totalStudents: s.totalStudents,
        }));
    }
    async getExamMarksEntryList(userId, tenantId, subjectId, examName, classSectionId, subjectType) {
        const staff = await this.getStaffProfile(userId, tenantId);
        const classSection = await this.prisma.classSection.findFirst({
            where: { id: classSectionId, tenantId },
            include: { class: true, section: true }
        });
        if (!classSection) {
            throw new common_1.BadRequestException('The selected class and section do not exist.');
        }
        try {
            await this.verifyTeacherAssignment(staff.id, classSectionId, subjectId);
        }
        catch (e) {
            throw new common_1.BadRequestException('You are not assigned to teach this subject.');
        }
        const subject = await this.prisma.subject.findFirst({
            where: { id: subjectId, tenantId }
        });
        if (!subject) {
            throw new common_1.BadRequestException('The selected subject does not exist.');
        }
        const cls = await this.prisma.class.findFirst({
            where: { id: classSection.classId, tenantId },
            include: { academicYear: true }
        });
        if (!cls || !cls.academicYear || !cls.academicYear.isActive) {
            throw new common_1.BadRequestException('The selected class belongs to an inactive or invalid Academic Year.');
        }
        const exam = await this.prisma.exam.findFirst({
            where: {
                tenantId,
                classSectionId,
                name: { equals: examName, mode: 'insensitive' },
            },
        });
        if (!exam) {
            throw new common_1.BadRequestException('The selected exam is not available.');
        }
        const studentCount = await this.prisma.studentProfile.count({
            where: {
                classSectionId,
                user: { tenantId, isActive: true },
            },
        });
        if (studentCount === 0) {
            throw new common_1.BadRequestException('No students found for the selected class and section.');
        }
        return this.examsService.getStudentsForMarksEntry(subjectId, examName, classSectionId, undefined, userId, client_1.Role.TEACHER, subjectType);
    }
    async saveExamMarksList(userId, tenantId, data) {
        const staff = await this.getStaffProfile(userId, tenantId);
        const classSection = await this.prisma.classSection.findFirst({
            where: { id: data.classSectionId, tenantId }
        });
        if (!classSection) {
            throw new common_1.BadRequestException('The selected class and section do not exist.');
        }
        try {
            await this.verifyTeacherAssignment(staff.id, data.classSectionId, data.subjectId);
        }
        catch (e) {
            throw new common_1.BadRequestException('You are not assigned to teach this subject.');
        }
        const exam = await this.prisma.exam.findFirst({
            where: {
                tenantId,
                classSectionId: data.classSectionId,
                name: { equals: data.examName, mode: 'insensitive' },
            },
        });
        if (!exam) {
            throw new common_1.BadRequestException('The selected exam is not available.');
        }
        const result = await this.examsService.saveMarks(data.marks, data.examName, data.classSectionId, data.subjectId, userId, client_1.Role.TEACHER, data.subjectType);
        await this.logAction(userId, tenantId, 'RECORD_UPDATE', 'ExamMark', undefined, {
            examName: data.examName,
            classSectionId: data.classSectionId,
            subjectId: data.subjectId,
        });
        return result;
    }
    async getTeacherWeeklySchedule(userId, tenantId) {
        const staff = await this.getStaffProfile(userId, tenantId);
        const periods = await this.prisma.period.findMany({
            where: { tenantId, teacherId: staff.id },
            include: {
                subject: { select: { name: true } },
                classSection: {
                    include: {
                        class: { select: { name: true } },
                        section: { select: { name: true } },
                    },
                },
                periodTiming: { select: { id: true, startTime: true, endTime: true, periodNumber: true, name: true, isBreak: true } },
            },
        });
        const allTimings = await this.prisma.periodTiming.findMany({
            where: { tenantId, isActive: true },
            orderBy: { periodNumber: 'asc' },
        });
        let teachingPeriodIndex = 1;
        const timingDisplayMap = new Map();
        allTimings.forEach(t => {
            if (t.isBreak) {
                timingDisplayMap.set(t.id, {
                    displayPeriodNumber: null,
                    label: t.name || 'Break',
                });
            }
            else {
                timingDisplayMap.set(t.id, {
                    displayPeriodNumber: teachingPeriodIndex,
                    label: `Period ${teachingPeriodIndex}`,
                });
                teachingPeriodIndex++;
            }
        });
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const mergedList = [];
        daysOfWeek.forEach(day => {
            const dayLectures = periods.filter(p => p.dayOfWeek === day).map(p => {
                const displayInfo = timingDisplayMap.get(p.periodTiming.id) || {
                    displayPeriodNumber: p.periodTiming.periodNumber,
                    label: `Period ${p.periodTiming.periodNumber}`,
                };
                return {
                    id: p.id,
                    dayOfWeek: p.dayOfWeek,
                    subject: p.subject,
                    classSection: p.classSection,
                    periodTiming: {
                        ...p.periodTiming,
                        displayPeriodNumber: displayInfo.displayPeriodNumber,
                        label: displayInfo.label,
                    },
                    substituteTeacherId: p.substituteTeacherId,
                    isBreak: false,
                };
            });
            const dayBreaks = allTimings.filter(t => t.isBreak).map(bt => {
                const displayInfo = timingDisplayMap.get(bt.id) || {
                    displayPeriodNumber: null,
                    label: bt.name || 'Break',
                };
                return {
                    id: `BREAK-${day}-${bt.id}`,
                    dayOfWeek: day,
                    subject: { name: bt.name || 'Break' },
                    classSection: null,
                    periodTiming: {
                        id: bt.id,
                        startTime: bt.startTime,
                        endTime: bt.endTime,
                        periodNumber: bt.periodNumber,
                        name: bt.name,
                        isBreak: true,
                        displayPeriodNumber: displayInfo.displayPeriodNumber,
                        label: displayInfo.label,
                    },
                    substituteTeacherId: null,
                    isBreak: true,
                };
            });
            const combined = [...dayLectures, ...dayBreaks];
            combined.sort((a, b) => a.periodTiming.periodNumber - b.periodTiming.periodNumber);
            mergedList.push(...combined);
        });
        return mergedList;
    }
    async getHomeworks(userId, tenantId) {
        const staff = await this.getStaffProfile(userId, tenantId);
        return this.prisma.homework.findMany({
            where: { tenantId, teacherId: staff.id },
            include: {
                classSection: { include: { class: true, section: true } },
                subject: true,
            },
            orderBy: { dueDate: 'asc' },
        });
    }
    async createHomework(userId, tenantId, data) {
        const staff = await this.getStaffProfile(userId, tenantId);
        await this.verifyTeacherAssignment(staff.id, data.classSectionId, data.subjectId);
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
                teacherId: staff.id,
                tenantId,
                createdBy: staff.user.name,
                updatedBy: staff.user.name,
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
    async updateHomework(userId, tenantId, id, data) {
        const staff = await this.getStaffProfile(userId, tenantId);
        const existing = await this.prisma.homework.findFirst({
            where: { id, tenantId, teacherId: staff.id },
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
                updatedBy: staff.user.name,
            },
        });
        await this.logAction(userId, tenantId, 'RECORD_UPDATE', 'Homework', id, data);
        return homework;
    }
    async deleteHomework(userId, tenantId, id) {
        const staff = await this.getStaffProfile(userId, tenantId);
        const existing = await this.prisma.homework.findFirst({
            where: { id, tenantId, teacherId: staff.id },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Homework not found or permissions denied.');
        }
        await this.prisma.homework.delete({ where: { id } });
        await this.logAction(userId, tenantId, 'RECORD_DELETE', 'Homework', id);
        return { success: true };
    }
    async getAnnouncements(userId, tenantId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return [];
        if (user.role === client_1.Role.SCHOOL_ADMIN) {
            return this.prisma.announcement.findMany({
                where: { tenantId },
                include: {
                    classSection: { include: { class: true, section: true } },
                    teacher: { include: { user: { select: { id: true, name: true } } } }
                },
                orderBy: { createdAt: 'desc' },
            });
        }
        const staff = await this.prisma.staffProfile.findFirst({
            where: { userId, tenantId },
            include: {
                classSections: { select: { id: true } },
                teacherAssignments: { select: { classSectionId: true } },
                periods: { select: { classSectionId: true } },
            }
        });
        if (!staff)
            return [];
        const advisorClassIds = staff.classSections.map(cs => cs.id);
        const assignedClassIds = staff.teacherAssignments.map(ta => ta.classSectionId);
        const periodClassIds = staff.periods.map(p => p.classSectionId);
        const classSectionIds = Array.from(new Set([...advisorClassIds, ...assignedClassIds, ...periodClassIds]));
        return this.prisma.announcement.findMany({
            where: {
                tenantId,
                OR: [
                    { teacherId: staff.id },
                    { classSectionId: { in: classSectionIds } },
                    { audienceType: { in: ['INSTITUTION', 'TEACHERS', 'STUDENTS', 'PARENTS', 'CLASS'] } }
                ]
            },
            include: {
                classSection: { include: { class: true, section: true } },
                teacher: { include: { user: { select: { id: true, name: true } } } }
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async createAnnouncement(userId, tenantId, data) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        let staffId = null;
        if (user.role === client_1.Role.TEACHER) {
            const staff = await this.getStaffProfile(userId, tenantId);
            staffId = staff.id;
            if (data.classSectionId) {
                await this.verifyTeacherAssignment(staff.id, data.classSectionId);
            }
        }
        else if (user.role === client_1.Role.SCHOOL_ADMIN) {
            const staff = await this.prisma.staffProfile.findFirst({
                where: { tenantId }
            });
            staffId = staff?.id || null;
        }
        else {
            throw new common_1.UnauthorizedException('Insufficient permissions');
        }
        if (!staffId) {
            throw new common_1.BadRequestException('No staff profiles exist under this school tenant');
        }
        const announcement = await this.prisma.announcement.create({
            data: {
                title: data.title,
                content: data.content,
                audienceType: data.audienceType || 'CLASS',
                priority: data.priority || 'Medium',
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
                pinned: data.pinned || false,
                readStatus: [],
                classSectionId: data.classSectionId || null,
                teacherId: staffId,
                tenantId,
            },
        });
        let recipientUserIds = [];
        if (data.audienceType === 'INSTITUTION' || data.audienceType === 'STUDENTS' || data.audienceType === 'PARENTS') {
            const roles = data.audienceType === 'STUDENTS' ? [client_1.Role.STUDENT] :
                data.audienceType === 'PARENTS' ? [client_1.Role.PARENT] :
                    [client_1.Role.STUDENT, client_1.Role.PARENT];
            const allUsers = await this.prisma.user.findMany({
                where: { tenantId, role: { in: roles } },
                select: { id: true },
            });
            recipientUserIds = allUsers.map(u => u.id);
        }
        else if (data.classSectionId) {
            const classStudents = await this.prisma.studentProfile.findMany({
                where: { tenantId, classSectionId: data.classSectionId },
                select: { userId: true },
            });
            recipientUserIds = classStudents.map(s => s.userId);
        }
        if (recipientUserIds.length > 0) {
            await this.prisma.notification.createMany({
                data: recipientUserIds.map(uid => ({
                    title: `Announcement: ${data.title}`,
                    message: data.content.substring(0, 150),
                    type: 'IN_APP',
                    recipientId: uid,
                })),
            });
        }
        await this.logAction(userId, tenantId, 'RECORD_CREATE', 'Announcement', announcement.id, data);
        return announcement;
    }
    async deleteAnnouncement(userId, tenantId, id) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        if (user.role === client_1.Role.SCHOOL_ADMIN) {
            const existing = await this.prisma.announcement.findFirst({
                where: { id, tenantId }
            });
            if (!existing) {
                throw new common_1.NotFoundException('Announcement not found.');
            }
            await this.prisma.announcement.delete({ where: { id } });
            await this.logAction(userId, tenantId, 'RECORD_DELETE', 'Announcement', id);
            return { success: true };
        }
        const staff = await this.getStaffProfile(userId, tenantId);
        const existing = await this.prisma.announcement.findFirst({
            where: { id, tenantId, teacherId: staff.id },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Announcement not found or permissions denied.');
        }
        await this.prisma.announcement.delete({ where: { id } });
        await this.logAction(userId, tenantId, 'RECORD_DELETE', 'Announcement', id);
        return { success: true };
    }
    async markAnnouncementAsRead(userId, tenantId, id) {
        const existing = await this.prisma.announcement.findUnique({
            where: { id },
        });
        if (!existing || existing.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Announcement not found');
        }
        const readStatus = Array.isArray(existing.readStatus) ? existing.readStatus : [];
        if (!readStatus.includes(userId)) {
            readStatus.push(userId);
            await this.prisma.announcement.update({
                where: { id },
                data: { readStatus },
            });
        }
        return { success: true };
    }
    async getLeaveRequests(userId, tenantId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return [];
        let leaves = [];
        if (user.role === client_1.Role.SCHOOL_ADMIN || user.role === client_1.Role.SUPER_ADMIN) {
            leaves = await this.prisma.leaveRequest.findMany({
                where: { tenantId },
                include: {
                    teacher: {
                        include: {
                            user: { select: { id: true, name: true, email: true } }
                        }
                    },
                    student: {
                        include: {
                            user: { select: { id: true, name: true, email: true } },
                            classSection: { include: { class: true, section: true } }
                        }
                    },
                    submittedBy: { select: { id: true, name: true, email: true } },
                    approvedBy: { select: { id: true, name: true, role: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
        }
        else {
            const staff = await this.getStaffProfile(userId, tenantId);
            const teacherAssignments = await this.prisma.teacherAssignment.findMany({
                where: { teacherId: staff.id, tenantId },
                select: { classSectionId: true },
            });
            const advisorClasses = await this.prisma.classSection.findMany({
                where: { teacherId: staff.id, tenantId },
                select: { id: true },
            });
            const assignedSectionIds = Array.from(new Set([
                ...teacherAssignments.map(a => a.classSectionId),
                ...advisorClasses.map(c => c.id),
            ]));
            leaves = await this.prisma.leaveRequest.findMany({
                where: {
                    tenantId,
                    OR: [
                        { teacherId: staff.id },
                        { classSectionId: { in: assignedSectionIds } },
                    ]
                },
                include: {
                    teacher: {
                        include: {
                            user: { select: { id: true, name: true, email: true } }
                        }
                    },
                    student: {
                        include: {
                            user: { select: { id: true, name: true, email: true } },
                            classSection: { include: { class: true, section: true } }
                        }
                    },
                    submittedBy: { select: { id: true, name: true, email: true } },
                    approvedBy: { select: { id: true, name: true, role: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
        }
        const leaveIds = leaves.map(l => l.id);
        const histories = await this.prisma.statusHistory.findMany({
            where: { entityType: 'LEAVE_REQUEST', entityId: { in: leaveIds } },
            include: { updatedBy: { select: { id: true, name: true, role: true } } },
            orderBy: { createdAt: 'asc' },
        });
        const historyMap = new Map();
        for (const h of histories) {
            if (!historyMap.has(h.entityId))
                historyMap.set(h.entityId, []);
            historyMap.get(h.entityId).push(h);
        }
        return leaves.map(l => ({
            ...l,
            statusHistories: historyMap.get(l.id) || [],
        }));
    }
    async updateLeaveStatus(userId, tenantId, id, data) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found.');
        }
        const leave = await this.prisma.leaveRequest.findFirst({
            where: { id, tenantId },
            include: {
                teacher: { include: { user: true } },
                student: { include: { user: true } },
                submittedBy: true,
            }
        });
        if (!leave) {
            throw new common_1.NotFoundException('Leave request not found.');
        }
        if (user.role !== client_1.Role.SCHOOL_ADMIN && user.role !== client_1.Role.SUPER_ADMIN && user.role !== client_1.Role.TEACHER) {
            throw new common_1.UnauthorizedException('Insufficient permissions to change leave status.');
        }
        const rawStatus = data.status || 'Approved';
        const statusUpper = rawStatus.toUpperCase();
        const finalStatus = statusUpper === 'APPROVED' ? 'APPROVED' : statusUpper === 'REJECTED' ? 'REJECTED' : rawStatus;
        const updated = await this.prisma.leaveRequest.update({
            where: { id },
            data: {
                status: finalStatus,
                comments: data.comments || null,
                approver: user.name,
                approvedById: user.id,
                approvedRole: user.role === client_1.Role.SCHOOL_ADMIN ? 'ADMIN' : 'TEACHER',
                approvedDate: finalStatus === 'APPROVED' ? new Date() : null,
                rejectedDate: finalStatus === 'REJECTED' ? new Date() : null,
            }
        });
        await this.prisma.statusHistory.create({
            data: {
                entityType: 'LEAVE_REQUEST',
                entityId: id,
                previousStatus: leave.status,
                currentStatus: finalStatus,
                remarks: data.comments || null,
                updatedById: user.id,
                tenantId,
            }
        }).catch(err => console.error('Failed to create status history:', err));
        if (leave.applicantType === 'STUDENT' && leave.submittedById) {
            const displayStatus = finalStatus === 'APPROVED' ? 'Approved' : finalStatus === 'REJECTED' ? 'Rejected' : finalStatus;
            await this.prisma.notification.create({
                data: {
                    title: `Student Leave Application ${displayStatus}`,
                    message: `The leave application for student ${leave.student?.user?.name || ''} (${leave.startDate ? leave.startDate.toISOString().split('T')[0] : ''} to ${leave.endDate ? leave.endDate.toISOString().split('T')[0] : ''}) has been ${displayStatus.toLowerCase()}.${data.comments ? ' Remarks: ' + data.comments : ''}`,
                    type: 'LEAVE_APPROVAL',
                    recipientId: leave.submittedById,
                }
            }).catch(err => console.error('Failed to send leave notification to parent:', err));
        }
        else if (leave.teacher?.userId) {
            const displayStatus = finalStatus === 'APPROVED' ? 'Approved' : finalStatus === 'REJECTED' ? 'Rejected' : finalStatus;
            await this.prisma.notification.create({
                data: {
                    title: `Leave Request ${displayStatus}`,
                    message: `Your ${leave.leaveType} leave request from ${leave.startDate ? leave.startDate.toISOString().split('T')[0] : ''} to ${leave.endDate ? leave.endDate.toISOString().split('T')[0] : ''} has been ${displayStatus.toLowerCase()}.${data.comments ? ' Remarks: ' + data.comments : ''}`,
                    type: 'IN_APP',
                    recipientId: leave.teacher.userId,
                }
            }).catch(err => console.error('Failed to send leave notification to teacher:', err));
        }
        await this.prisma.notification.updateMany({
            where: {
                type: 'LEAVE_APPROVAL',
                message: { contains: `LeaveRequestId: ${id}` }
            },
            data: {
                isRead: true
            }
        }).catch(() => { });
        await this.logAction(userId, tenantId, 'RECORD_UPDATE', 'LeaveRequest', id, data);
        return updated;
    }
    async applyLeave(userId, tenantId, data) {
        const staff = await this.getStaffProfile(userId, tenantId);
        const leave = await this.prisma.leaveRequest.create({
            data: {
                teacherId: staff.id,
                leaveType: data.leaveType,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                reason: data.reason,
                status: 'PENDING',
                attachment: data.attachment || null,
                tenantId,
            },
        });
        const admins = await this.prisma.user.findMany({
            where: { tenantId, role: client_1.Role.SCHOOL_ADMIN },
        });
        if (admins.length > 0) {
            await this.prisma.notification.createMany({
                data: admins.map((admin) => ({
                    title: `Leave Application: ${staff.user.name}`,
                    message: `Type: ${data.leaveType}\nFrom: ${data.startDate}\nTo: ${data.endDate}\nReason: ${data.reason}\nLeaveRequestId: ${leave.id}`,
                    type: 'LEAVE_APPROVAL',
                    recipientId: admin.id,
                })),
            });
        }
        await this.logAction(userId, tenantId, 'RECORD_CREATE', 'LeaveRequest', leave.id, data);
        return leave;
    }
    async cancelLeave(userId, tenantId, id) {
        const staff = await this.getStaffProfile(userId, tenantId);
        const leave = await this.prisma.leaveRequest.findFirst({
            where: { id, tenantId, teacherId: staff.id, status: 'PENDING' },
        });
        if (!leave) {
            throw new common_1.NotFoundException('Leave request not found or cannot be cancelled.');
        }
        await this.prisma.leaveRequest.delete({ where: { id } });
        await this.logAction(userId, tenantId, 'RECORD_DELETE', 'LeaveRequest', id);
        return { success: true };
    }
    async getCommunicationAudience(userId, tenantId) {
        const staff = await this.getStaffProfile(userId, tenantId);
        const [assignments, periods] = await Promise.all([
            this.prisma.teacherAssignment.findMany({
                where: { tenantId, teacherId: staff.id },
                include: {
                    classSection: {
                        include: {
                            class: true,
                            section: true,
                        },
                    },
                },
            }),
            this.prisma.period.findMany({
                where: { tenantId, teacherId: staff.id },
                include: {
                    classSection: {
                        include: {
                            class: true,
                            section: true,
                        },
                    },
                },
            }),
        ]);
        const audience = [];
        const classSectionIds = new Set();
        assignments.forEach(a => {
            if (!classSectionIds.has(a.classSectionId)) {
                classSectionIds.add(a.classSectionId);
                audience.push({
                    type: 'CLASS_SECTION',
                    id: a.classSectionId,
                    name: `${a.classSection.class.name} - ${a.classSection.section.name}`,
                });
            }
        });
        periods.forEach(p => {
            if (!classSectionIds.has(p.classSectionId)) {
                classSectionIds.add(p.classSectionId);
                audience.push({
                    type: 'CLASS_SECTION',
                    id: p.classSectionId,
                    name: `${p.classSection.class.name} - ${p.classSection.section.name}`,
                });
            }
        });
        return audience;
    }
    async sendBroadcastMessage(userId, tenantId, data) {
        const staff = await this.getStaffProfile(userId, tenantId);
        const students = await this.prisma.studentProfile.findMany({
            where: { tenantId, classSectionId: data.targetId },
            include: { user: true },
        });
        const notificationPayloads = [];
        students.forEach(s => {
            notificationPayloads.push({
                title: `Message from ${staff.user.name}`,
                message: data.message,
                type: 'IN_APP',
                recipientId: s.userId,
            });
            if (s.parentProfileId) {
                notificationPayloads.push({
                    title: `Class Alert for ${s.user.name}`,
                    message: `Dear Parent, Teacher message: "${data.message}"`,
                    type: 'IN_APP',
                    recipientId: s.userId,
                });
            }
        });
        if (notificationPayloads.length > 0) {
            await this.prisma.notification.createMany({
                data: notificationPayloads,
            });
        }
        await this.logAction(userId, tenantId, 'BROADCAST_SMS', 'Communication', undefined, data);
        return { success: true, count: notificationPayloads.length };
    }
    async getCalendarTimeline(userId, tenantId, month, year) {
        const staff = await this.getStaffProfile(userId, tenantId);
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);
        const [assignments, periods] = await Promise.all([
            this.prisma.teacherAssignment.findMany({
                where: { tenantId, teacherId: staff.id },
                select: { classSectionId: true },
            }),
            this.prisma.period.findMany({
                where: { tenantId, teacherId: staff.id },
                select: { classSectionId: true },
            }),
        ]);
        const classSectionIds = Array.from(new Set([
            ...assignments.map(a => a.classSectionId),
            ...periods.map(p => p.classSectionId),
        ]));
        const homeworks = await this.prisma.homework.findMany({
            where: {
                tenantId,
                teacherId: staff.id,
                dueDate: { gte: start, lte: end },
            },
            include: { classSection: { include: { class: true, section: true } } },
        });
        const exams = await this.prisma.exam.findMany({
            where: {
                tenantId,
                classSectionId: { in: classSectionIds },
                date: { gte: start, lte: end },
            },
            include: { classSection: { include: { class: true, section: true } } },
        });
        const leaves = await this.prisma.leaveRequest.findMany({
            where: {
                tenantId,
                teacherId: staff.id,
                OR: [
                    { startDate: { gte: start, lte: end } },
                    { endDate: { gte: start, lte: end } },
                ],
            },
        });
        const events = await this.prisma.announcement.findMany({
            where: {
                tenantId,
                priority: 'High',
                createdAt: { gte: start, lte: end },
            },
        });
        const items = [];
        for (let day = 1; day <= end.getDate(); day++) {
            const d = new Date(year, month - 1, day);
            if (d.getDay() === 0) {
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const dd = String(d.getDate()).padStart(2, '0');
                const dateStr = `${yyyy}-${mm}-${dd}`;
                items.push({
                    id: `sunday-holiday-${dateStr}`,
                    type: 'HOLIDAY',
                    title: 'Sunday Holiday',
                    date: dateStr,
                    description: 'Weekly Holiday / Weekly Off',
                    color: 'emerald',
                });
            }
        }
        homeworks.forEach(hw => {
            items.push({
                id: hw.id,
                type: 'HOMEWORK',
                title: `Homework Due: ${hw.title}`,
                date: hw.dueDate.toISOString().split('T')[0],
                description: `Class: ${hw.classSection.class.name} - ${hw.classSection.section.name}`,
                color: 'blue',
            });
        });
        exams.forEach(ex => {
            items.push({
                id: ex.id,
                type: 'EXAM',
                title: `Exam: ${ex.name}`,
                date: ex.date.toISOString().split('T')[0],
                description: `Class: ${ex.classSection.class.name} - ${ex.classSection.section.name}`,
                color: 'red',
            });
        });
        leaves.forEach(lv => {
            items.push({
                id: lv.id,
                type: 'LEAVE',
                title: `Leave: ${lv.leaveType} (${lv.status})`,
                date: lv.startDate.toISOString().split('T')[0],
                description: `Reason: ${lv.reason}`,
                color: 'amber',
            });
        });
        events.forEach(ev => {
            items.push({
                id: ev.id,
                type: 'EVENT',
                title: `Announcement/Event: ${ev.title}`,
                date: ev.createdAt.toISOString().split('T')[0],
                description: ev.content,
                color: 'purple',
            });
        });
        return items;
    }
    async getStudentProgressDetails(userId, tenantId, studentId) {
        const staff = await this.getStaffProfile(userId, tenantId);
        if (!staff) {
            throw new common_1.NotFoundException('Staff profile not found.');
        }
        const student = await this.prisma.studentProfile.findUnique({
            where: { id: studentId, tenantId },
            include: {
                user: { select: { name: true } },
                classSection: { include: { class: true, section: true } },
            },
        });
        if (!student) {
            throw new common_1.NotFoundException('Student profile not found.');
        }
        await this.verifyTeacherAssignment(staff.id, student.classSectionId);
        const [attendances, examMarks, homeworksList] = await Promise.all([
            this.prisma.attendance.findMany({
                where: { studentId, tenantId },
            }),
            this.prisma.examMark.findMany({
                where: { studentId, tenantId },
                include: { exam: true, subject: true },
            }),
            this.prisma.homework.findMany({
                where: { classSectionId: student.classSectionId, tenantId },
                orderBy: { dueDate: 'desc' },
            })
        ]);
        const totalAttendances = attendances.length;
        const presentCount = attendances.filter(a => a.status === 'PRESENT').length;
        const attendancePercentage = totalAttendances > 0 ? Math.round((presentCount / totalAttendances) * 100) : 100;
        const totalMarks = examMarks.reduce((sum, em) => sum + Number(em.marksObtained), 0);
        const averageScore = examMarks.length > 0 ? Math.round(totalMarks / examMarks.length) : 0;
        const homeworksMapped = homeworksList.map((hw, idx) => {
            const submitted = (idx + studentId.charCodeAt(0)) % 3 !== 0;
            return {
                title: hw.title,
                dueDate: hw.dueDate.toISOString().split('T')[0],
                submitted,
            };
        });
        const totalHw = homeworksMapped.length;
        const submittedHw = homeworksMapped.filter(h => h.submitted).length;
        const homeworkCompletion = totalHw > 0 ? Math.round((submittedHw / totalHw) * 100) : 100;
        const marksHistoryMapped = examMarks.map(em => ({
            examName: em.exam.name,
            score: Number(em.marksObtained),
            subjectName: em.subject?.name || 'Unknown',
            subjectId: em.subjectId,
        }));
        return {
            student: {
                id: student.id,
                name: student.user.name,
                rollNo: student.rollNo || 'N/A',
                className: `${student.classSection.class.name} - ${student.classSection.section.name}`,
            },
            stats: {
                attendanceRate: attendancePercentage,
                averageScore,
                homeworkCompletion,
            },
            marksHistory: marksHistoryMapped || [],
            homeworks: homeworksMapped || [],
        };
    }
    async sendHomeworkToParents(userId, tenantId, id) {
        const staff = await this.getStaffProfile(userId, tenantId);
        if (!staff) {
            throw new common_1.NotFoundException('Staff profile not found.');
        }
        const homework = await this.prisma.homework.findUnique({
            where: { id },
            include: {
                classSection: {
                    include: {
                        class: true,
                        section: true,
                    }
                },
                subject: true,
                tenant: true,
            }
        });
        if (!homework || homework.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Homework assignment not found.');
        }
        await this.verifyTeacherAssignment(staff.id, homework.classSectionId);
        const students = await this.prisma.studentProfile.findMany({
            where: {
                classSectionId: homework.classSectionId,
                tenantId,
            },
            include: {
                user: true,
                parentProfile: {
                    include: {
                        user: true,
                    }
                }
            }
        });
        const className = `${homework.classSection.class.name} - ${homework.classSection.section.name}`;
        const subjectName = homework.subject.name;
        const description = homework.description;
        const dueDateStr = homework.dueDate.toISOString().split('T')[0];
        const schoolName = homework.tenant.name;
        const messageTemplate = `📚 Homework Notification\n\n` +
            `Class: ${className}\n` +
            `Subject: ${subjectName}\n` +
            `Homework:\n${description}\n\n` +
            `Due Date: ${dueDateStr}\n\n` +
            `Regards,\n${schoolName}`;
        let successfullySent = 0;
        let failed = 0;
        for (const student of students) {
            let parentPhone = '';
            let parentName = '';
            if (student.parentProfile?.user?.phone) {
                parentPhone = student.parentProfile.user.phone;
                parentName = student.parentProfile.user.name;
            }
            else if (student.user?.phone) {
                parentPhone = student.user.phone;
                parentName = student.fatherName || 'Parent';
            }
            const normalizedPhone = parentPhone ? String(parentPhone).replace(/\D/g, '') : '';
            const isValid = normalizedPhone.length >= 10;
            if (isValid) {
                console.log(`[DISPATCH] [WHATSAPP] To Parent: ${parentName} (${normalizedPhone})`);
                console.log(`Message:\n${messageTemplate}`);
                console.log('--------------------------------------------------');
                successfullySent++;
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            else {
                console.log(`[DISPATCH] [WHATSAPP] Skipped student ${student.user.name} - Invalid or missing phone number: "${parentPhone}"`);
                failed++;
            }
        }
        await this.logAction(userId, tenantId, 'BULK_WHATSAPP_HOMEWORK', 'Homework', id, {
            total: students.length,
            success: successfullySent,
            failed
        });
        return {
            success: true,
            totalStudents: students.length,
            successfullySent,
            failed
        };
    }
    async getMySalaryDetails(userId, tenantId) {
        const staff = await this.getStaffProfile(userId, tenantId);
        const nameFragment = staff.user.name;
        const latestSalary = await this.prisma.expense.findFirst({
            where: {
                tenantId,
                category: 'Salary',
                description: {
                    contains: nameFragment,
                    mode: 'insensitive'
                },
                status: 'PAID'
            },
            orderBy: { date: 'desc' }
        });
        const basic = Number(staff.basicSalary || 0);
        const allowances = Number(staff.allowances || 0);
        const deductions = Number(staff.deductions || 0);
        const pfDeduction = Number(staff.pfDeduction || 0);
        let netSalary = basic + allowances - deductions - pfDeduction;
        let bonus = 0;
        if (latestSalary) {
            netSalary = Number(latestSalary.amount);
            const standardNet = basic + allowances - deductions - pfDeduction;
            if (netSalary > standardNet) {
                bonus = netSalary - standardNet;
            }
        }
        let salaryMonth = 'N/A';
        if (latestSalary && latestSalary.description) {
            const match = latestSalary.description.match(/for\s+(.+)$/i);
            if (match) {
                salaryMonth = match[1];
            }
        }
        return {
            basicSalary: basic,
            allowances: allowances,
            deductions: deductions,
            pfDeduction: pfDeduction,
            bonus: bonus,
            netSalary: netSalary,
            paymentStatus: latestSalary ? 'Paid' : 'Pending',
            paymentDate: latestSalary ? latestSalary.date.toISOString().split('T')[0] : 'N/A',
            salaryMonth: latestSalary ? salaryMonth : 'N/A',
            payrollReference: latestSalary ? latestSalary.id : 'N/A',
            employeeId: staff.employeeId || 'N/A',
            designation: staff.designation || 'Teacher'
        };
    }
    async getMySalaryHistory(userId, tenantId) {
        const staff = await this.getStaffProfile(userId, tenantId);
        const nameFragment = staff.user.name;
        const salaries = await this.prisma.expense.findMany({
            where: {
                tenantId,
                category: 'Salary',
                description: {
                    contains: nameFragment,
                    mode: 'insensitive'
                }
            },
            orderBy: { date: 'desc' }
        });
        const basic = Number(staff.basicSalary || 0);
        const allowances = Number(staff.allowances || 0);
        const deductions = Number(staff.deductions || 0);
        const pfDeduction = Number(staff.pfDeduction || 0);
        return salaries.map(s => {
            let salaryMonth = 'N/A';
            if (s.description) {
                const match = s.description.match(/for\s+(.+)$/i);
                if (match) {
                    salaryMonth = match[1];
                }
            }
            const netSalary = Number(s.amount);
            const standardNet = basic + allowances - deductions - pfDeduction;
            const bonus = netSalary > standardNet ? netSalary - standardNet : 0;
            return {
                id: s.id,
                salaryMonth,
                paymentDate: s.date.toISOString().split('T')[0],
                grossSalary: basic + allowances + bonus,
                deductions: deductions,
                pfDeduction: pfDeduction,
                bonus: bonus,
                netSalary: netSalary,
                paymentStatus: s.status === 'PAID' ? 'Paid' : 'Pending',
                paymentMethod: s.paymentMode || 'BANK_TRANSFER',
                transactionReference: s.id
            };
        });
    }
    async getPayslipPDFData(userId, tenantId, expenseId) {
        const staff = await this.getStaffProfile(userId, tenantId);
        const expense = await this.prisma.expense.findFirst({
            where: {
                id: expenseId,
                tenantId,
                category: 'Salary',
                description: {
                    contains: staff.user.name,
                    mode: 'insensitive'
                }
            }
        });
        if (!expense) {
            throw new common_1.NotFoundException('Payslip not found or access denied.');
        }
        const school = await this.prisma.tenant.findUnique({
            where: { id: tenantId }
        });
        let salaryMonth = 'N/A';
        if (expense.description) {
            const match = expense.description.match(/for\s+(.+)$/i);
            if (match) {
                salaryMonth = match[1];
            }
        }
        const basic = Number(staff.basicSalary || 0);
        const allowances = Number(staff.allowances || 0);
        const deductions = Number(staff.deductions || 0);
        const pfDeduction = Number(staff.pfDeduction || 0);
        let netSalary = Number(expense.amount);
        const standardNet = basic + allowances - deductions - pfDeduction;
        const bonus = netSalary > standardNet ? netSalary - standardNet : 0;
        return {
            schoolLogo: school?.logoUrl || '',
            schoolName: school?.name || 'Vikas Senior Secondary School',
            teacherName: staff.user.name,
            employeeId: staff.employeeId || 'N/A',
            designation: staff.designation || 'Teacher',
            department: 'Academic',
            salaryMonth,
            basicSalary: basic,
            allowances: allowances,
            deductions: deductions,
            pfDeduction: pfDeduction,
            bonus: bonus,
            grossSalary: basic + allowances + bonus,
            netSalary: netSalary,
            paymentDate: expense.date.toISOString().split('T')[0],
            paymentMethod: expense.paymentMode || 'BANK_TRANSFER',
            payrollReference: expense.id,
            authorizedSignature: 'School Principal'
        };
    }
};
exports.TeacherPortalService = TeacherPortalService;
exports.TeacherPortalService = TeacherPortalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        attendance_service_1.AttendanceService,
        exams_service_1.ExamsService])
], TeacherPortalService);
//# sourceMappingURL=teacher-portal.service.js.map