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
exports.TimetableService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../database/firebase.service");
const crypto_1 = require("crypto");
const bcrypt = require("bcrypt");
let TimetableService = class TimetableService {
    constructor(academicRepo, userRepo, teacherRepo, firebase) {
        this.academicRepo = academicRepo;
        this.userRepo = userRepo;
        this.teacherRepo = teacherRepo;
        this.firebase = firebase;
    }
    async getAcademicYears(tenantId) {
        if (process.env.DB_PROVIDER === 'firebase') {
            return this.academicRepo.findAcademicYears(tenantId);
        }
        return this.prisma.academicYear.findMany({
            where: { tenantId, isActive: true },
            orderBy: { startDate: 'desc' },
        });
    }
    async getClasses(tenantId) {
        if (process.env.DB_PROVIDER === 'firebase') {
            return this.academicRepo.findClasses(tenantId);
        }
        return this.prisma.class.findMany({
            where: { tenantId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }
    async createClass(tenantId, name) {
        if (!name)
            throw new common_1.BadRequestException('Class Name is required.');
        if (process.env.DB_PROVIDER === 'firebase') {
            return this.academicRepo.createClass({
                name: name.trim(),
                tenantId,
                isActive: true,
                createdAt: new Date().toISOString(),
            });
        }
        const activeYear = await this.prisma.academicYear.findFirst({
            where: { tenantId, isActive: true },
        });
        return this.prisma.class.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                name: name.trim(),
                tenantId,
                academicYearId: activeYear?.id || null,
                isActive: true,
            },
        });
    }
    async deleteClass(tenantId, classId) {
        if (process.env.DB_PROVIDER === 'firebase') {
            return this.academicRepo.deleteClass(classId);
        }
        const linked = await this.prisma.classSection.findFirst({
            where: { classId },
        });
        if (linked) {
            throw new common_1.BadRequestException('Cannot delete this class because it is linked to one or more class sections.');
        }
        return this.prisma.class.delete({
            where: { id: classId },
        });
    }
    async getSections(tenantId) {
        if (process.env.DB_PROVIDER === 'firebase') {
            return this.academicRepo.findSections(tenantId);
        }
        return this.prisma.section.findMany({
            where: { tenantId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }
    async createSection(tenantId, name) {
        if (!name)
            throw new common_1.BadRequestException('Section Name is required.');
        if (process.env.DB_PROVIDER === 'firebase') {
            return this.academicRepo.createSection({
                name: name.trim(),
                tenantId,
                isActive: true,
                createdAt: new Date().toISOString(),
            });
        }
        return this.prisma.section.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                name: name.trim(),
                tenantId,
                isActive: true,
            },
        });
    }
    async deleteSection(tenantId, sectionId) {
        if (process.env.DB_PROVIDER === 'firebase') {
            return this.academicRepo.deleteSection ? this.academicRepo.deleteSection(sectionId, tenantId) : { id: sectionId };
        }
        const linked = await this.prisma.classSection.findFirst({
            where: { sectionId },
        });
        if (linked) {
            throw new common_1.BadRequestException('Cannot delete this section because it is linked to one or more class sections.');
        }
        return this.prisma.section.delete({
            where: { id: sectionId },
        });
    }
    async getPeriodTimings(tenantId) {
        if (process.env.DB_PROVIDER === 'firebase') {
            try {
                const db = this.firebase?.getFirestore();
                if (!db)
                    return [];
                const snap = await db.collection('tenants').doc(tenantId).collection('periodTimings').orderBy('periodNumber', 'asc').get();
                return snap.docs.map((doc) => {
                    const pt = { id: doc.id, ...doc.data() };
                    return {
                        id: pt.id,
                        num: pt.periodNumber,
                        periodNumber: pt.periodNumber,
                        label: `Period ${pt.periodNumber}`,
                        startTime: pt.startTime,
                        endTime: pt.endTime,
                        timeLabel: `${pt.startTime}${pt.endTime ? ' – ' + pt.endTime : ''}`,
                    };
                });
            }
            catch (err) {
                console.error('Firebase getPeriodTimings error:', err);
                return [];
            }
        }
        const list = await this.prisma.periodTiming.findMany({
            where: { tenantId, isActive: true },
            orderBy: { periodNumber: 'asc' },
        });
        return list.map(pt => ({
            id: pt.id,
            num: pt.periodNumber,
            label: `Period ${pt.periodNumber}`,
            startTime: pt.startTime,
            endTime: pt.endTime,
            timeLabel: `${pt.startTime}${pt.endTime ? ' – ' + pt.endTime : ''}`,
        }));
    }
    async savePeriodTimings(tenantId, timings) {
        for (const t of timings) {
            if (!t.periodNumber || !t.startTime || !t.endTime) {
                throw new common_1.BadRequestException('Invalid period timing data');
            }
        }
        if (process.env.DB_PROVIDER === 'firebase' && this.firebase) {
            const db = this.firebase.getFirestore();
            const batch = db.batch();
            const colRef = db.collection('tenants').doc(tenantId).collection('periodTimings');
            const existingSnap = await colRef.get();
            const incomingIds = timings.filter(t => t.id).map(t => t.id);
            existingSnap.docs.forEach((doc) => {
                if (!incomingIds.includes(doc.id)) {
                    batch.delete(doc.ref);
                }
            });
            const results = [];
            for (const t of timings) {
                const id = t.id || (0, crypto_1.randomUUID)();
                const ref = colRef.doc(id);
                const payload = {
                    id,
                    tenantId,
                    periodNumber: Number(t.periodNumber),
                    startTime: t.startTime,
                    endTime: t.endTime,
                    isActive: true,
                    updatedAt: new Date().toISOString(),
                };
                batch.set(ref, payload, { merge: true });
                results.push({
                    id,
                    num: Number(t.periodNumber),
                    periodNumber: Number(t.periodNumber),
                    label: `Period ${t.periodNumber}`,
                    startTime: t.startTime,
                    endTime: t.endTime,
                    timeLabel: `${t.startTime}${t.endTime ? ' – ' + t.endTime : ''}`,
                });
            }
            await batch.commit();
            return results;
        }
        return this.prisma.$transaction(async (tx) => {
            const existing = await tx.periodTiming.findMany({
                where: { tenantId },
            });
            const incomingIds = timings.filter(t => t.id).map(t => t.id);
            const toDelete = existing.filter(e => !incomingIds.includes(e.id));
            if (toDelete.length > 0) {
                await tx.periodTiming.deleteMany({
                    where: { id: { in: toDelete.map(d => d.id) } },
                });
            }
            const results = [];
            for (const t of timings) {
                if (t.id) {
                    results.push(await tx.periodTiming.update({
                        where: { id: t.id },
                        data: {
                            periodNumber: Number(t.periodNumber),
                            startTime: t.startTime,
                            endTime: t.endTime,
                        },
                    }));
                }
                else {
                    results.push(await tx.periodTiming.create({
                        data: {
                            id: (0, crypto_1.randomUUID)(),
                            tenantId,
                            periodNumber: Number(t.periodNumber),
                            startTime: t.startTime,
                            endTime: t.endTime,
                            isActive: true,
                        },
                    }));
                }
            }
            return results;
        });
    }
    async getSubjects(tenantId) {
        if (process.env.DB_PROVIDER === 'firebase') {
            return this.academicRepo.findSubjects(tenantId);
        }
        return this.prisma.subject.findMany({
            where: { tenantId, isActive: true },
            orderBy: { name: 'asc' },
        });
    }
    async createSubject(tenantId, data) {
        if (!data.name)
            throw new common_1.BadRequestException('Subject Name is required.');
        if (process.env.DB_PROVIDER === 'firebase') {
            return this.academicRepo.createSubject({
                name: data.name.trim(),
                tenantId,
                isActive: true,
                createdAt: new Date().toISOString(),
            });
        }
        const existing = await this.prisma.subject.findFirst({
            where: { tenantId, name: data.name, isActive: true },
        });
        if (existing) {
            throw new common_1.BadRequestException(`A subject with the name "${data.name}" already exists.`);
        }
        return this.prisma.subject.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                tenantId,
                name: data.name,
                isActive: true,
            },
        });
    }
    async deleteSubject(tenantId, id) {
        if (process.env.DB_PROVIDER === 'firebase') {
            return this.academicRepo.deleteSubject ? this.academicRepo.deleteSubject(id) : { id };
        }
        return this.prisma.subject.delete({
            where: { id },
        });
    }
    async bulkCreateSubjects(tenantId, subjectsData) {
        if (!subjectsData || subjectsData.length === 0) {
            throw new common_1.BadRequestException('No subject data provided.');
        }
        if (process.env.DB_PROVIDER === 'firebase') {
            let created = 0;
            for (const item of subjectsData) {
                if (item.name && item.name.trim()) {
                    await this.academicRepo.createSubject({
                        name: item.name.trim(),
                        tenantId,
                        isActive: true,
                        createdAt: new Date().toISOString(),
                    });
                    created++;
                }
            }
            return { created, skipped: 0, errors: 0, errorDetails: [] };
        }
        const activeSubjects = await this.prisma.subject.findMany({
            where: { tenantId, isActive: true },
        });
        const existingNames = new Set(activeSubjects.map(s => s.name.toLowerCase()));
        const skipped = [];
        const errorDetails = [];
        let created = 0;
        for (let i = 0; i < subjectsData.length; i++) {
            const row = subjectsData[i];
            const name = row.name ? row.name.trim() : '';
            if (!name) {
                errorDetails.push(`Row ${i + 1}: Subject name is required.`);
                continue;
            }
            if (existingNames.has(name.toLowerCase())) {
                skipped.push(name);
                continue;
            }
            try {
                await this.prisma.subject.create({
                    data: {
                        id: (0, crypto_1.randomUUID)(),
                        tenantId,
                        name,
                        isActive: true,
                    },
                });
                created++;
                existingNames.add(name.toLowerCase());
            }
            catch (err) {
                errorDetails.push(`${name}: ${err.message}`);
            }
        }
        return {
            created,
            skipped: skipped.length,
            errors: errorDetails.length,
            errorDetails,
            skippedNames: skipped,
        };
    }
    async getTimetableConfig(tenantId) {
        if (process.env.DB_PROVIDER === 'firebase' && this.firebase) {
            try {
                const doc = await this.firebase.getFirestore().collection('tenants').doc(tenantId).collection('timetableConfig').doc('current').get();
                if (doc.exists)
                    return doc.data();
            }
            catch (err) {
                console.error('Error fetching timetable config:', err);
            }
        }
        return {
            workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            schoolStartTime: '09:00 AM',
            schoolEndTime: '04:00 PM',
            periodDuration: 45,
            autoGenerate: true,
            numPeriods: 8,
        };
    }
    async checkExistingTimetables(tenantId) {
        return { hasExistingTimetables: false };
    }
    async saveTimetableConfig(tenantId, data) {
        if (process.env.DB_PROVIDER === 'firebase' && this.firebase) {
            const ref = this.firebase.getFirestore().collection('tenants').doc(tenantId).collection('timetableConfig').doc('current');
            await ref.set({ ...data, tenantId, updatedAt: new Date().toISOString() }, { merge: true });
            return { success: true, ...data };
        }
        return { success: true, ...data };
    }
    async getTeachersForSubject(tenantId, subjectIds) {
        if (!subjectIds || subjectIds.length === 0)
            return {};
        if (process.env.DB_PROVIDER === 'firebase') {
            const teachers = await this.teacherRepo.findTeachersByTenant(tenantId);
            const result = {};
            for (const sid of subjectIds) {
                result[sid] = teachers.map((t) => ({
                    Id: t.id || t.teacherId || t.userId,
                    Name: t.name || t.teacherName || t.User?.name || `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'Teacher',
                    Teacher_Skill__c: 'Expert',
                }));
            }
            return result;
        }
        const skills = await this.prisma.teacherSkill.findMany({
            where: {
                tenantId,
                subjectId: { in: subjectIds },
            },
            include: {
                StaffProfile: {
                    include: { User: true },
                },
            },
            orderBy: {
                StaffProfile: {
                    User: { name: 'asc' },
                },
            },
        });
        const result = {};
        for (const ts of skills) {
            if (!result[ts.subjectId]) {
                result[ts.subjectId] = [];
            }
            result[ts.subjectId].push({
                Id: ts.StaffProfile.id,
                Name: ts.StaffProfile.User.name,
                Teacher_Skill__c: ts.skillLevel || 'Expert',
            });
        }
        return result;
    }
    async createTeacherWithSkills(tenantId, data) {
        if (!data.firstName || !data.lastName) {
            throw new common_1.BadRequestException('First Name and Last Name are required.');
        }
        if (!data.email) {
            throw new common_1.BadRequestException('Email is required.');
        }
        if (process.env.DB_PROVIDER === 'firebase') {
            const userId = 'user-t-' + Date.now();
            const teacherId = 'teacher-' + Date.now();
            await this.userRepo.create({
                id: userId,
                email: data.email,
                name: `${data.firstName} ${data.lastName}`,
                role: 'TEACHER',
                phone: data.phone || null,
                tenantId,
                isActive: true,
                createdAt: new Date().toISOString(),
            });
            await this.teacherRepo.createTeacherAssignment({
                id: teacherId,
                userId,
                tenantId,
                qualification: data.qualification || '',
                basicSalary: data.basicSalary || 0,
                createdAt: new Date().toISOString(),
            });
            if (data.skills && Array.isArray(data.skills)) {
                for (const skill of data.skills) {
                    if (skill.subjectId) {
                        await this.teacherRepo.createTeacherSkill({
                            teacherId,
                            subjectId: skill.subjectId,
                            skillLevel: skill.skillLevel || 'Expert',
                            yearsOfExperience: skill.yearsOfExperience || 1,
                            tenantId,
                        });
                    }
                }
            }
            return { id: teacherId, userId, name: `${data.firstName} ${data.lastName}` };
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('A user with this email already exists.');
        }
        const hashedPassword = await bcrypt.hash('Welcome2026!', 10);
        const userId = (0, crypto_1.randomUUID)();
        const teacherId = (0, crypto_1.randomUUID)();
        return this.prisma.$transaction(async (tx) => {
            await tx.user.create({
                data: {
                    id: userId,
                    email: data.email,
                    passwordHash: hashedPassword,
                    name: `${data.firstName} ${data.lastName}`,
                    role: 'TEACHER',
                    phone: data.phone || null,
                    isActive: true,
                    tenantId,
                    updatedAt: new Date(),
                },
            });
            const staff = await tx.staffProfile.create({
                data: {
                    id: teacherId,
                    userId,
                    designation: 'Teacher',
                    joiningDate: new Date(),
                    qualification: data.qualification || null,
                    basicSalary: data.basicSalary || null,
                },
            });
            if (data.skills && Array.isArray(data.skills)) {
                for (const skill of data.skills) {
                    if (skill.subjectId) {
                        await tx.teacherSkill.create({
                            data: {
                                id: (0, crypto_1.randomUUID)(),
                                teacherId: staff.id,
                                subjectId: skill.subjectId,
                                skillLevel: skill.skillLevel || 'Expert',
                                yearsOfExperience: skill.yearsOfExperience || 1,
                                tenantId,
                            },
                        });
                    }
                }
            }
            return { id: staff.id, userId: staff.userId, name: `${data.firstName} ${data.lastName}` };
        });
    }
    async bulkCreateTeachers(tenantId, teachersData) {
        if (!teachersData || teachersData.length === 0) {
            throw new common_1.BadRequestException('No teacher data provided.');
        }
        const subjects = await this.prisma.subject.findMany({
            where: { tenantId, isActive: true },
        });
        const subjectNameToId = {};
        for (const s of subjects) {
            subjectNameToId[s.name.toLowerCase().trim()] = s.id;
        }
        const incomingEmails = teachersData.filter(t => t.email).map(t => t.email.trim().toLowerCase());
        const existingUsers = await this.prisma.user.findMany({
            where: { email: { in: incomingEmails } },
        });
        const existingEmails = new Set(existingUsers.map(u => u.email.toLowerCase()));
        const skipped = [];
        const errorDetails = [];
        let created = 0;
        let skillsCreated = 0;
        const hashedPassword = await bcrypt.hash('Welcome2026!', 10);
        for (let i = 0; i < teachersData.length; i++) {
            const row = teachersData[i];
            const firstName = row.firstName ? row.firstName.trim() : '';
            const lastName = row.lastName ? row.lastName.trim() : '';
            const email = row.email ? row.email.trim() : '';
            if (!firstName || !lastName || !email) {
                errorDetails.push(`Row ${i + 1}: Name and Email are required.`);
                continue;
            }
            if (existingEmails.has(email.toLowerCase())) {
                skipped.push(`${firstName} ${lastName} (${email})`);
                continue;
            }
            try {
                await this.prisma.$transaction(async (tx) => {
                    const userId = (0, crypto_1.randomUUID)();
                    const teacherId = (0, crypto_1.randomUUID)();
                    await tx.user.create({
                        data: {
                            id: userId,
                            email,
                            passwordHash: hashedPassword,
                            name: `${firstName} ${lastName}`,
                            role: 'TEACHER',
                            phone: row.phone || null,
                            isActive: true,
                            tenantId,
                            updatedAt: new Date(),
                        },
                    });
                    await tx.staffProfile.create({
                        data: {
                            id: teacherId,
                            userId,
                            employeeId: row.employeeId || null,
                            designation: row.designation || null,
                            qualification: row.qualification || null,
                            joiningDate: row.joiningDate ? new Date(row.joiningDate) : null,
                            status: 'Active',
                            basicSalary: row.basicSalary || null,
                            allowances: row.allowances || null,
                            deductions: row.deductions || null,
                            pfDeduction: row.pf || null,
                        },
                    });
                    const skillRecords = [];
                    for (let skillIdx = 1; skillIdx <= 3; skillIdx++) {
                        const subKey = `subject${skillIdx}`;
                        const lvlKey = `skillLevel${skillIdx}`;
                        if (row[subKey] && row[subKey].trim()) {
                            const subName = row[subKey].trim();
                            const subjectId = subjectNameToId[subName.toLowerCase()];
                            if (subjectId) {
                                skillRecords.push({
                                    id: (0, crypto_1.randomUUID)(),
                                    tenantId,
                                    teacherId,
                                    subjectId,
                                    skillLevel: row[lvlKey] || 'Expert',
                                    yearsOfExperience: 0,
                                });
                            }
                        }
                    }
                    if (skillRecords.length > 0) {
                        await tx.teacherSkill.createMany({
                            data: skillRecords,
                        });
                        skillsCreated += skillRecords.length;
                    }
                });
                created++;
                existingEmails.add(email.toLowerCase());
            }
            catch (err) {
                errorDetails.push(`${firstName} ${lastName}: ${err.message}`);
            }
        }
        return {
            created,
            skipped: skipped.length,
            errors: errorDetails.length,
            errorDetails,
            skippedNames: skipped,
            skillsCreated,
        };
    }
    async getWorkloadSummary(tenantId, academicYearId) {
        if (process.env.DB_PROVIDER === 'firebase') {
            const db = this.firebase?.getFirestore();
            if (!db)
                return { totalClassSections: 0, totalTeachers: 0, totalAssignments: 0, avgLoadPercent: 0 };
            try {
                const csSnap = await db.collection('tenants').doc(tenantId).collection('classSections').get();
                const totalClassSections = csSnap.size;
                const teachers = await this.teacherRepo.findTeachersByTenant(tenantId);
                const totalTeachers = teachers.length;
                let totalAssignments = 0;
                try {
                    const taSnap = await db.collection('tenants').doc(tenantId).collection('teacherAssignments').get();
                    totalAssignments = taSnap.size;
                }
                catch (e) {
                    console.warn('Could not fetch teacherAssignments:', e);
                }
                const avgLoadPercent = totalTeachers > 0 && totalAssignments > 0
                    ? Math.min(Math.round((totalAssignments / totalTeachers / 8) * 100), 100)
                    : 0;
                return { totalClassSections, totalTeachers, totalAssignments, avgLoadPercent };
            }
            catch (err) {
                console.error('Firebase getWorkloadSummary error:', err);
                return { totalClassSections: 0, totalTeachers: 0, totalAssignments: 0, avgLoadPercent: 0 };
            }
        }
        const activeYear = academicYearId
            ? await this.prisma.academicYear.findUnique({ where: { id: academicYearId } })
            : await this.prisma.academicYear.findFirst({ where: { tenantId, isActive: true } });
        if (!activeYear)
            return { totalClassSections: 0, totalTeachers: 0, totalAssignments: 0, avgLoadPercent: 0 };
        const sections = await this.prisma.classSection.findMany({
            where: {
                tenantId,
                Class: { academicYearId: activeYear.id },
            },
        });
        const sectionIds = sections.map(s => s.id);
        const totalClassSections = sections.length;
        const assignments = await this.prisma.teacherAssignment.findMany({
            where: {
                tenantId,
                classSectionId: { in: sectionIds },
            },
        });
        const totalAssignments = assignments.length;
        const uniqueTeachers = new Set(assignments.map(a => a.teacherId));
        const totalTeachers = uniqueTeachers.size;
        let avgLoadPercent = 0;
        if (totalTeachers > 0 && totalAssignments > 0) {
            avgLoadPercent = Math.min(Math.round((totalAssignments / totalTeachers / 8) * 100), 100);
        }
        return {
            totalClassSections,
            totalTeachers,
            totalAssignments,
            avgLoadPercent,
        };
    }
    async getAllTeacherWorkloads(tenantId) {
        if (process.env.DB_PROVIDER === 'firebase') {
            try {
                const db = this.firebase?.getFirestore();
                if (!db)
                    return [];
                const teachers = await this.teacherRepo.findTeachersByTenant(tenantId);
                let assignments = [];
                try {
                    const assignSnap = await db.collection('tenants').doc(tenantId).collection('teacherAssignments').get();
                    assignments = assignSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                }
                catch (e) {
                    console.warn('Could not fetch teacherAssignments collection:', e);
                }
                const assignMap = new Map();
                for (const a of assignments) {
                    const tId = a.teacherId || a.userId;
                    if (tId) {
                        if (!assignMap.has(tId))
                            assignMap.set(tId, []);
                        assignMap.get(tId).push(a);
                    }
                }
                const MAX_WEEKLY_PERIODS = 48;
                return teachers.map((t) => {
                    const tId = t.id || t.teacherId || t.userId;
                    const myAssignments = assignMap.get(tId) || assignMap.get(t.userId) || [];
                    const totalPeriods = myAssignments.reduce((sum, a) => sum + (Number(a.periodsPerWeek) || 5), 0);
                    const subjectCount = new Set(myAssignments.map(a => a.subjectId).filter(Boolean)).size;
                    const classCount = new Set(myAssignments.map(a => a.classSectionId).filter(Boolean)).size;
                    const loadPercent = Math.min(Math.round((totalPeriods / MAX_WEEKLY_PERIODS) * 100), 100);
                    return {
                        teacherId: tId,
                        teacherName: t.name || t.User?.name || t.user?.name || `${t.firstName || ''} ${t.lastName || ''}`.trim() || 'Teacher',
                        subjectsTaught: t.subjectsTaught || [],
                        subjectCount,
                        classCount,
                        totalPeriods,
                        loadPercent,
                    };
                });
            }
            catch (err) {
                console.error('Firebase getAllTeacherWorkloads error:', err);
                return [];
            }
        }
        const teachers = await this.prisma.staffProfile.findMany({
            where: { User: { tenantId, role: 'TEACHER' } },
            include: { User: true },
            orderBy: { User: { name: 'asc' } },
        });
        const periodCounts = await this.prisma.period.groupBy({
            by: ['teacherId'],
            where: { tenantId, teacherId: { not: null } },
            _count: { id: true },
        });
        const periodCountMap = new Map(periodCounts.map(pc => [pc.teacherId, pc._count.id]));
        const uniqueSubjects = await this.prisma.period.findMany({
            where: { tenantId, teacherId: { not: null } },
            select: { teacherId: true, subjectId: true },
            distinct: ['teacherId', 'subjectId'],
        });
        const subjectCountMap = new Map();
        for (const us of uniqueSubjects) {
            if (us.teacherId) {
                subjectCountMap.set(us.teacherId, (subjectCountMap.get(us.teacherId) || 0) + 1);
            }
        }
        const uniqueClasses = await this.prisma.period.findMany({
            where: { tenantId, teacherId: { not: null } },
            select: { teacherId: true, classSectionId: true },
            distinct: ['teacherId', 'classSectionId'],
        });
        const classCountMap = new Map();
        for (const uc of uniqueClasses) {
            if (uc.teacherId) {
                classCountMap.set(uc.teacherId, (classCountMap.get(uc.teacherId) || 0) + 1);
            }
        }
        const MAX_WEEKLY_PERIODS = 48;
        return teachers.map((t) => {
            const totalPeriods = Number(periodCountMap.get(t.id) || 0);
            const subjectCount = Number(subjectCountMap.get(t.id) || 0);
            const classCount = Number(classCountMap.get(t.id) || 0);
            const loadPercent = Math.min(Math.round((totalPeriods / MAX_WEEKLY_PERIODS) * 100), 100);
            return {
                teacherId: t.id,
                teacherName: t.User.name,
                subjectCount,
                classCount,
                totalPeriods,
                loadPercent,
            };
        });
    }
    async getAllClassWorkloads(tenantId) {
        if (process.env.DB_PROVIDER === 'firebase') {
            try {
                const db = this.firebase?.getFirestore();
                if (!db)
                    return [];
                const csSnap = await db.collection('tenants').doc(tenantId).collection('classSections').get();
                const classesSnap = await db.collection('tenants').doc(tenantId).collection('classes').get();
                const sectionsSnap = await db.collection('tenants').doc(tenantId).collection('sections').get();
                let assignments = [];
                try {
                    const taSnap = await db.collection('tenants').doc(tenantId).collection('teacherAssignments').get();
                    assignments = taSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                }
                catch (e) {
                    console.warn('Could not fetch teacherAssignments:', e);
                }
                const classMap = new Map(classesSnap.docs.map(d => [d.id, d.data().name]));
                const secMap = new Map(sectionsSnap.docs.map(d => [d.id, d.data().name]));
                return csSnap.docs.map((doc) => {
                    const cs = { id: doc.id, ...doc.data() };
                    const className = classMap.get(cs.classId) || cs.className || 'Class';
                    const sectionName = secMap.get(cs.sectionId) || cs.sectionName || 'A';
                    const myAssign = assignments.filter((a) => a.classSectionId === cs.id);
                    const subjectCount = (cs.subjects || []).length || myAssign.length;
                    const staffedCount = myAssign.length;
                    const loadPercent = subjectCount > 0 ? Math.round((staffedCount / subjectCount) * 100) : 0;
                    return {
                        classSectionId: cs.id,
                        classId: cs.classId,
                        name: `${className} - ${sectionName}`,
                        academicYear: cs.academicYear || '2026-2027',
                        subjectCount,
                        staffedCount,
                        loadPercent,
                    };
                });
            }
            catch (err) {
                console.error('Firebase getAllClassWorkloads error:', err);
                return [];
            }
        }
        const sections = await this.prisma.classSection.findMany({
            where: { tenantId },
            include: {
                Class: { include: { AcademicYear: true } },
                Section: true,
            },
            orderBy: { Class: { name: 'asc' } },
        });
        const classSubjects = await this.prisma.classSubject.groupBy({
            by: ['classSectionId'],
            where: { tenantId },
            _count: { id: true },
        });
        const subjectCountMap = new Map(classSubjects.map(cs => [cs.classSectionId, cs._count.id]));
        const staffed = await this.prisma.teacherAssignment.groupBy({
            by: ['classSectionId'],
            where: { tenantId },
            _count: { subjectId: true },
        });
        const staffedCountMap = new Map(staffed.map(s => [s.classSectionId, s._count.subjectId]));
        return sections.map((cs) => {
            const totalSubjects = Number(subjectCountMap.get(cs.id) || 0);
            const staffedSubjects = Number(staffedCountMap.get(cs.id) || 0);
            const loadPercent = totalSubjects > 0 ? Math.round((staffedSubjects / totalSubjects) * 100) : 0;
            return {
                classSectionId: cs.id,
                name: `${cs.Class.name} - ${cs.Section.name}`,
                academicYear: cs.Class.AcademicYear.name,
                subjectCount: totalSubjects,
                staffedCount: staffedSubjects,
                loadPercent,
            };
        });
    }
    async getTeacherWorkload(tenantId, teacherId) {
        const teacher = await this.prisma.staffProfile.findUnique({
            where: { id: teacherId },
            include: { User: true },
        });
        if (!teacher)
            throw new common_1.NotFoundException('Teacher not found.');
        const assignments = await this.prisma.teacherAssignment.findMany({
            where: { teacherId, tenantId },
            include: {
                ClassSection: {
                    include: { Class: { include: { AcademicYear: true } }, Section: true },
                },
                Subject: true,
            },
            orderBy: [
                { ClassSection: { Class: { name: 'asc' } } },
                { Subject: { name: 'asc' } },
            ],
        });
        const periods = await this.prisma.period.groupBy({
            by: ['classSectionId', 'subjectId'],
            where: { tenantId, teacherId },
            _count: { id: true },
        });
        const periodCountMap = new Map();
        for (const p of periods) {
            periodCountMap.set(`${p.classSectionId}|${p.subjectId}`, p._count.id);
        }
        const bySection = {};
        for (const ta of assignments) {
            const secId = ta.classSectionId;
            if (!bySection[secId])
                bySection[secId] = [];
            bySection[secId].push(ta);
        }
        const classes = [];
        for (const secId in bySection) {
            const list = bySection[secId];
            const first = list[0];
            const subjects = list.map((ta) => {
                const countKey = `${ta.classSectionId}|${ta.subjectId}`;
                const timetableCount = periodCountMap.get(countKey);
                const periodsPerWeek = timetableCount !== undefined ? timetableCount : ta.periodsPerWeek;
                return {
                    assignmentId: ta.id,
                    subjectId: ta.subjectId,
                    subjectName: ta.Subject.name,
                    periodsPerWeek,
                    fromTimetable: timetableCount !== undefined,
                };
            });
            classes.push({
                classSectionId: secId,
                className: `${first.ClassSection.Class.name} - ${first.ClassSection.Section.name}`,
                academicYear: first.ClassSection.Class.AcademicYear.name,
                subjects,
            });
        }
        return {
            teacherName: teacher.User.name,
            classes,
        };
    }
    async getClassSectionWorkload(tenantId, classSectionId) {
        const cs = await this.prisma.classSection.findUnique({
            where: { id: classSectionId },
            include: {
                Class: { include: { AcademicYear: true } },
                Section: true,
            },
        });
        if (!cs)
            throw new common_1.NotFoundException('Class section not found.');
        const classSubjects = await this.prisma.classSubject.findMany({
            where: { classSectionId, tenantId },
            include: { Subject: true },
            orderBy: { Subject: { name: 'asc' } },
        });
        const assignments = await this.prisma.teacherAssignment.findMany({
            where: { classSectionId, tenantId },
            include: { StaffProfile: { include: { User: true } } },
        });
        const periodCounts = await this.prisma.period.groupBy({
            by: ['subjectId', 'teacherId'],
            where: { classSectionId, tenantId, teacherId: { not: null } },
            _count: { id: true },
        });
        const periodCountMap = new Map();
        for (const pc of periodCounts) {
            periodCountMap.set(`${pc.subjectId}|${pc.teacherId}`, pc._count.id);
        }
        const bySubject = {};
        for (const a of assignments) {
            if (!bySubject[a.subjectId])
                bySubject[a.subjectId] = [];
            bySubject[a.subjectId].push(a);
        }
        const uniqueTeachers = new Set(assignments.map(a => a.teacherId));
        const subjects = classSubjects.map((csub) => {
            const teachersList = bySubject[csub.subjectId] || [];
            const teachers = teachersList.map((ta) => {
                const countKey = `${ta.subjectId}|${ta.teacherId}`;
                const timetableCount = periodCountMap.get(countKey);
                const periodsPerWeek = timetableCount !== undefined ? timetableCount : ta.periodsPerWeek;
                return {
                    teacherId: ta.teacherId,
                    teacherName: ta.StaffProfile.User.name,
                    assignmentId: ta.id,
                    periodsPerWeek,
                    fromTimetable: timetableCount !== undefined,
                };
            });
            return {
                subjectId: csub.subjectId,
                subjectName: csub.Subject.name,
                teachers,
            };
        });
        return {
            name: `${cs.Class.name} - ${cs.Section.name}`,
            academicYear: cs.Class.AcademicYear.name,
            teacherCount: uniqueTeachers.size,
            subjects,
        };
    }
    async updateTeacherAssignment(tenantId, id, newTeacherId, periodsPerWeek) {
        const ta = await this.prisma.teacherAssignment.findUnique({
            where: { id },
        });
        if (!ta)
            throw new common_1.NotFoundException('Assignment not found.');
        const data = {};
        if (newTeacherId) {
            data.teacherId = newTeacherId;
        }
        if (periodsPerWeek !== undefined) {
            data.periodsPerWeek = periodsPerWeek;
        }
        return this.prisma.teacherAssignment.update({
            where: { id },
            data,
        });
    }
    async deleteTeacherAssignment(tenantId, id) {
        return this.prisma.teacherAssignment.delete({
            where: { id },
        });
    }
    async createClassSection(tenantId, data) {
        if (process.env.DB_PROVIDER === 'firebase' && this.firebase) {
            const db = this.firebase.getFirestore();
            const classSectionId = 'cs-' + Date.now();
            const csRef = db.collection('tenants').doc(tenantId).collection('classSections').doc(classSectionId);
            const subjects = Object.keys(data.subjectTeacherMap || {});
            const assignments = [];
            for (const subId of subjects) {
                const teacherIds = data.subjectTeacherMap[subId] || [];
                const periodsList = data.subjectPeriodsMap?.[subId] || [];
                for (let i = 0; i < teacherIds.length; i++) {
                    assignments.push({
                        id: 'assign-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                        subjectId: subId,
                        teacherId: teacherIds[i],
                        periodsPerWeek: periodsList[i] !== undefined ? Number(periodsList[i]) : 5,
                    });
                }
            }
            const csPayload = {
                id: classSectionId,
                tenantId,
                classId: data.classId,
                sectionId: data.sectionId,
                strength: data.classStrength || 0,
                subjects,
                assignments,
                createdAt: new Date().toISOString(),
            };
            await csRef.set(csPayload, { merge: true });
            for (const assign of assignments) {
                const assignRef = db.collection('tenants').doc(tenantId).collection('teacherAssignments').doc(assign.id);
                await assignRef.set({
                    ...assign,
                    tenantId,
                    classSectionId,
                    classId: data.classId,
                    sectionId: data.sectionId,
                    createdAt: new Date().toISOString(),
                }, { merge: true });
            }
            return { success: true, classSectionId, ...csPayload };
        }
        const existing = await this.prisma.classSection.findFirst({
            where: {
                tenantId,
                classId: data.classId,
                sectionId: data.sectionId,
            },
        });
        if (existing) {
            throw new common_1.BadRequestException('This Class and Section combination already exists.');
        }
        return this.prisma.$transaction(async (tx) => {
            const classSectionId = (0, crypto_1.randomUUID)();
            await tx.classSection.create({
                data: {
                    id: classSectionId,
                    tenantId,
                    classId: data.classId,
                    sectionId: data.sectionId,
                    strength: data.classStrength || 0,
                },
            });
            const subjects = Object.keys(data.subjectTeacherMap);
            const classSubjectRecords = subjects.map((subId) => ({
                id: (0, crypto_1.randomUUID)(),
                tenantId,
                classSectionId,
                subjectId: subId,
            }));
            if (classSubjectRecords.length > 0) {
                await tx.classSubject.createMany({
                    data: classSubjectRecords,
                });
            }
            const assignments = [];
            for (const subId of subjects) {
                const teacherIds = data.subjectTeacherMap[subId] || [];
                const periodsList = data.subjectPeriodsMap?.[subId] || [];
                for (let i = 0; i < teacherIds.length; i++) {
                    const tId = teacherIds[i];
                    const periods = periodsList[i] !== undefined ? Number(periodsList[i]) : 5;
                    assignments.push({
                        id: (0, crypto_1.randomUUID)(),
                        tenantId,
                        classSectionId,
                        subjectId: subId,
                        teacherId: tId,
                        periodsPerWeek: periods,
                    });
                }
            }
            if (assignments.length > 0) {
                await tx.teacherAssignment.createMany({
                    data: assignments,
                });
            }
            return {
                classSectionId,
                subjectCount: classSubjectRecords.length,
                teacherAssignmentCount: assignments.length,
            };
        });
    }
    async getAllClassSections(tenantId) {
        if (process.env.DB_PROVIDER === 'firebase') {
            try {
                const classSections = await this.academicRepo.findClassSections(tenantId);
                const results = [];
                const db = this.firebase?.getFirestore();
                for (const cs of classSections) {
                    let className = '';
                    let sectionName = '';
                    if (db && cs.classId) {
                        const classDoc = await db.collection('tenants').doc(tenantId).collection('classes').doc(cs.classId).get();
                        className = classDoc.exists ? classDoc.data()?.name || '' : '';
                    }
                    if (db && cs.sectionId) {
                        const sectionDoc = await db.collection('tenants').doc(tenantId).collection('sections').doc(cs.sectionId).get();
                        sectionName = sectionDoc.exists ? sectionDoc.data()?.name || '' : '';
                    }
                    results.push({
                        Id: cs.id,
                        Name: `${className} - ${sectionName}`,
                        className,
                        sectionName,
                        academicYear: '',
                        classId: cs.classId,
                    });
                }
                return results;
            }
            catch (err) {
                console.error('Firebase getAllClassSections error:', err);
                return [];
            }
        }
        const sections = await this.prisma.classSection.findMany({
            where: { tenantId },
            include: {
                Class: true,
                Section: true,
            },
            orderBy: [
                { Class: { name: 'asc' } },
                { Section: { name: 'asc' } },
            ],
        });
        return sections.map((s) => ({
            Id: s.id,
            Name: `${s.Class.name} - ${s.Section.name}`,
            className: s.Class.name,
            sectionName: s.Section.name,
            academicYear: '',
            classId: s.classId,
        }));
    }
    async getAllTeachers(tenantId) {
        if (process.env.DB_PROVIDER === 'firebase') {
            try {
                const teachers = await this.teacherRepo.findTeachersByTenant(tenantId);
                return teachers.map((t) => ({
                    Id: t.id,
                    Name: t.User?.name || t.user?.name || 'Unknown Teacher',
                }));
            }
            catch (err) {
                console.error('Firebase getAllTeachers error:', err);
                return [];
            }
        }
        const list = await this.prisma.staffProfile.findMany({
            where: { User: { tenantId, role: 'TEACHER' } },
            include: { User: true },
            orderBy: { User: { name: 'asc' } },
        });
        return list.map(t => ({ Id: t.id, Name: t.User.name }));
    }
    async getTimetableForClass(tenantId, classSectionId, academicYearId, startDate, endDate) {
        const periods = await this.prisma.period.findMany({
            where: {
                classSectionId,
                tenantId,
            },
            include: {
                Subject: true,
                StaffProfile_Period_teacherIdToStaffProfile: { include: { User: true } },
                StaffProfile_Period_substituteTeacherIdToStaffProfile: { include: { User: true } },
            },
        });
        const result = {};
        for (const p of periods) {
            const key = `${p.dayOfWeek}_${p.periodTimingId}`;
            const regularTeacherId = p.teacherId;
            const regularTeacherName = p.StaffProfile_Period_teacherIdToStaffProfile?.User?.name || 'Unassigned';
            let isOnLeave = false;
            let onLeaveTeacherName = null;
            let substituteTeacherIdStr = null;
            let substituteTeacherName = null;
            if (p.substituteTeacherId) {
                isOnLeave = true;
                onLeaveTeacherName = regularTeacherName;
                substituteTeacherIdStr = p.substituteTeacherId;
                substituteTeacherName = p.StaffProfile_Period_substituteTeacherIdToStaffProfile?.User?.name || null;
            }
            result[key] = {
                periodId: p.id,
                subjectId: p.subjectId,
                subjectName: p.Subject?.name || '—',
                teacherId: isOnLeave ? substituteTeacherIdStr : regularTeacherId,
                teacherName: isOnLeave ? substituteTeacherName : regularTeacherName,
                regularTeacherId,
                isOnLeave,
                onLeaveTeacherName,
                substituteTeacherId: substituteTeacherIdStr,
                substituteTeacherName,
            };
        }
        return result;
    }
    async getLeaserPeriodsForTeacher(tenantId, teacherId) {
        const list = await this.prisma.period.findMany({
            where: {
                tenantId,
                substituteTeacherId: teacherId,
            },
            select: { id: true },
        });
        return list.map(item => item.id);
    }
    async getPeriodsForTeacher(tenantId, teacherId) {
        const periods = await this.prisma.period.findMany({
            where: {
                tenantId,
                OR: [
                    { teacherId },
                    { substituteTeacherId: teacherId },
                ],
            },
            include: {
                ClassSection: {
                    include: { Class: true, Section: true },
                },
                Subject: true,
                PeriodTiming: true,
                StaffProfile_Period_teacherIdToStaffProfile: { include: { User: true } },
                StaffProfile_Period_substituteTeacherIdToStaffProfile: { include: { User: true } },
            },
            orderBy: [
                { dayOfWeek: 'asc' },
                { PeriodTiming: { periodNumber: 'asc' } },
            ],
        });
        return periods.map((p) => {
            const isSubbed = p.substituteTeacherId === teacherId;
            const regularTeacherName = p.StaffProfile_Period_teacherIdToStaffProfile?.User?.name || 'Unassigned';
            const substituteTeacherName = p.StaffProfile_Period_substituteTeacherIdToStaffProfile?.User?.name || null;
            return {
                periodId: p.id,
                day: p.dayOfWeek,
                periodNumber: p.PeriodTiming.periodNumber,
                classSectionId: p.classSectionId,
                className: `${p.ClassSection.Class.name} - ${p.ClassSection.Section.name}`,
                academicYear: p.ClassSection.Class.academicYearId,
                startTime: p.PeriodTiming.startTime,
                endTime: p.PeriodTiming.endTime,
                subjectId: p.subjectId,
                subjectName: p.Subject.name,
                isLeaser: isSubbed,
                isSubstitute: !!p.substituteTeacherId,
                substituteTeacherId: p.substituteTeacherId,
                substituteTeacherName,
                originalTeacherName: regularTeacherName,
                teacherId: isSubbed ? p.substituteTeacherId : p.teacherId,
                teacherName: isSubbed ? substituteTeacherName : regularTeacherName,
            };
        });
    }
    async getPeriodsForTeacherWithGaps(tenantId, teacherId) {
        const actualPeriods = await this.getPeriodsForTeacher(tenantId, teacherId);
        const totalPeriodsCount = await this.prisma.periodTiming.count({
            where: { tenantId, isActive: true },
        });
        const totalPeriods = totalPeriodsCount || 8;
        const existingKeys = new Set();
        const daySet = new Map();
        for (const p of actualPeriods) {
            existingKeys.add(`${p.day}_${p.periodNumber}`);
            daySet.set(p.day, p.day);
        }
        const schoolDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const resultList = [...actualPeriods];
        for (const day of schoolDays) {
            if (!daySet.has(day))
                continue;
            for (let i = 1; i <= totalPeriods; i++) {
                const key = `${day}_${i}`;
                if (!existingKeys.has(key)) {
                    resultList.push({
                        periodId: `free_${day}_${i}`,
                        day,
                        periodNumber: i,
                        classSectionId: '',
                        className: '',
                        academicYear: '',
                        startTime: '',
                        endTime: '',
                        subjectId: null,
                        subjectName: '',
                        isLeaser: false,
                        isFreePeriod: true,
                        substituteTeacherId: null,
                        substituteTeacherName: null,
                        originalTeacherName: '',
                        teacherId: '',
                        teacherName: '',
                    });
                }
            }
        }
        return resultList;
    }
    async saveSubstituteForPeriod(tenantId, periodId, substituteTeacherId) {
        const p = await this.prisma.period.findUnique({
            where: { id: periodId },
        });
        if (!p)
            throw new common_1.NotFoundException('Period not found.');
        return this.prisma.period.update({
            where: { id: periodId },
            data: {
                substituteTeacherId: substituteTeacherId || null,
            },
        });
    }
    async saveTimetablePeriods(tenantId, data) {
        if (!data.periods || data.periods.length === 0) {
            throw new common_1.BadRequestException('No periods provided.');
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.period.deleteMany({
                where: {
                    classSectionId: data.classSectionId,
                    tenantId,
                },
            });
            const timings = await tx.periodTiming.findMany({
                where: { tenantId, isActive: true },
            });
            const timingNumToId = {};
            for (const t of timings) {
                timingNumToId[t.periodNumber] = t.id;
            }
            const toInsert = [];
            for (const p of data.periods) {
                const timingId = timingNumToId[p.periodNumber];
                if (!timingId)
                    continue;
                if (!p.subjectId || !p.teacherId)
                    continue;
                toInsert.push({
                    id: (0, crypto_1.randomUUID)(),
                    tenantId,
                    classSectionId: data.classSectionId,
                    periodTimingId: timingId,
                    dayOfWeek: p.day,
                    subjectId: p.subjectId,
                    teacherId: p.teacherId,
                    substituteTeacherId: null,
                });
            }
            if (toInsert.length > 0) {
                await tx.period.createMany({
                    data: toInsert,
                });
            }
            return {
                savedCount: toInsert.length,
                success: true,
            };
        });
    }
};
exports.TimetableService = TimetableService;
exports.TimetableService = TimetableService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IAcademicRepository')),
    __param(1, (0, common_1.Inject)('IUserRepository')),
    __param(2, (0, common_1.Inject)('ITeacherRepository')),
    __param(3, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [Object, Object, Object, firebase_service_1.FirebaseService])
], TimetableService);
//# sourceMappingURL=timetable.service.js.map