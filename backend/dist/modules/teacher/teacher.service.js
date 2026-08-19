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
exports.TeacherService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../database/firebase.service");
const crypto_1 = require("crypto");
const bcrypt = require("bcrypt");
let TeacherService = class TeacherService {
    constructor(teacherRepo, userRepo, firebase) {
        this.teacherRepo = teacherRepo;
        this.userRepo = userRepo;
        this.firebase = firebase;
    }
    async create(tenantId, data) {
        if (!data.name && !data.email) {
            throw new common_1.BadRequestException('Name and email are required to create a staff member.');
        }
        const role = data.staffType === 'Non-Teaching' ? 'STAFF' : 'TEACHER';
        const existingUser = await this.userRepo.findByEmail(data.email);
        if (existingUser) {
            throw new common_1.BadRequestException('A user with this email already exists.');
        }
        const userId = (0, crypto_1.randomUUID)();
        const staffProfileId = (0, crypto_1.randomUUID)();
        const defaultPassword = data.phone || 'edutrack123';
        const passwordHash = await bcrypt.hash(defaultPassword, 10);
        await this.userRepo.create({
            id: userId,
            email: data.email,
            passwordHash,
            name: data.name,
            role,
            phone: data.phone || null,
            isActive: true,
            tenantId,
            avatarUrl: data.avatarUrl || null,
            updatedAt: new Date(),
        });
        const safeJoiningDate = data.joiningDate && !isNaN(new Date(data.joiningDate).getTime())
            ? new Date(data.joiningDate)
            : new Date();
        await this.teacherRepo.createStaffProfile({
            id: staffProfileId,
            userId,
            tenantId,
            employeeId: data.employeeId || null,
            designation: data.designation || null,
            qualification: data.qualification || null,
            joiningDate: safeJoiningDate,
            status: data.status || 'Active',
            basicSalary: data.basicSalary !== undefined && data.basicSalary !== null && !isNaN(Number(data.basicSalary)) ? Number(data.basicSalary) : null,
            allowances: data.allowances !== undefined && data.allowances !== null && !isNaN(Number(data.allowances)) ? Number(data.allowances) : null,
            pfDeduction: data.pfDeduction !== undefined && data.pfDeduction !== null && !isNaN(Number(data.pfDeduction)) ? Number(data.pfDeduction) : null,
            subjectsTaught: Array.isArray(data.subjectsTaught) ? data.subjectsTaught : [],
        });
        return {
            id: staffProfileId,
            userId,
            name: data.name,
            role,
            staffType: data.staffType,
        };
    }
    async findAll(tenantId, filters) {
        const list = await this.teacherRepo.findTeachersByTenant(tenantId);
        if (!filters)
            return list;
        let filtered = [...list];
        if (filters.search && typeof filters.search === 'string' && filters.search.trim()) {
            const q = filters.search.toLowerCase().trim();
            filtered = filtered.filter((t) => (t.name || t.User?.name || t.user?.name || '').toLowerCase().includes(q) ||
                (t.employeeId || '').toLowerCase().includes(q) ||
                (t.designation || '').toLowerCase().includes(q) ||
                (t.user?.phone || t.phone || '').includes(q) ||
                (t.user?.email || t.email || '').toLowerCase().includes(q));
        }
        if (filters.role && filters.role !== 'All') {
            filtered = filtered.filter((t) => (t.User?.role || t.user?.role || t.role || '').toLowerCase() === filters.role.toLowerCase());
        }
        if (filters.department && filters.department !== 'All') {
            filtered = filtered.filter((t) => (t.department || t.designation || '').toLowerCase().includes(filters.department.toLowerCase()));
        }
        return filtered;
    }
    async findOne(id, tenantId) {
        return this.teacherRepo.findProfileById(id);
    }
    async update(id, tenantId, data) {
        const profile = await this.teacherRepo.findProfileById(id);
        if (!profile) {
            throw new common_1.BadRequestException('Staff member not found.');
        }
        if (profile.userId) {
            const userUpdateData = {};
            if (data.name)
                userUpdateData.name = data.name;
            if (data.email)
                userUpdateData.email = data.email;
            if (data.phone)
                userUpdateData.phone = data.phone;
            if (data.avatarUrl !== undefined)
                userUpdateData.avatarUrl = data.avatarUrl;
            userUpdateData.updatedAt = new Date();
            await this.userRepo.update(profile.userId, userUpdateData);
        }
        await this.teacherRepo.updateStaffProfile(id, {
            employeeId: data.employeeId,
            designation: data.designation,
            qualification: data.qualification,
            joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined,
            status: data.status,
            basicSalary: data.basicSalary ? Number(data.basicSalary) : undefined,
            allowances: data.allowances ? Number(data.allowances) : undefined,
            pfDeduction: data.pfDeduction ? Number(data.pfDeduction) : undefined,
            subjectsTaught: data.subjectsTaught,
        });
        return { success: true, id };
    }
    async remove(id, tenantId) {
        const profile = await this.teacherRepo.findProfileById(id);
        if (!profile) {
            throw new common_1.BadRequestException('Staff member not found.');
        }
        await this.teacherRepo.deleteStaffProfile(id);
        if (profile.userId) {
            await this.userRepo.delete(profile.userId);
        }
        return { success: true, id };
    }
    async paySalary(id, tenantId, data) {
        const month = data?.month || 'Jun 2026';
        const tid = tenantId || 'tenant-test-001';
        if (this.firebase) {
            const db = this.firebase.getFirestore();
            try {
                await db.collection('staffProfiles').doc(id).set({
                    salaryStatus: 'Paid',
                    lastPaidMonth: month,
                    lastPaidAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }, { merge: true });
                await db.collection('tenants').doc(tid).collection('salaryPayments').add({
                    staffId: id,
                    month,
                    paymentDate: new Date().toISOString(),
                    status: 'SUCCESS',
                    createdAt: new Date().toISOString(),
                });
            }
            catch (err) {
                console.warn('paySalary firestore update warning:', err);
            }
        }
        return {
            success: true,
            message: `Salary disbursed successfully for ${month}`,
            id,
            month,
            status: 'Paid',
        };
    }
    async payAllSalaries(tenantId, data) {
        const month = data?.month || 'Jun 2026';
        const tid = tenantId || 'tenant-test-001';
        if (this.firebase) {
            const db = this.firebase.getFirestore();
            try {
                const staffSnap = await db.collection('staffProfiles').get();
                const batch = db.batch();
                staffSnap.docs.forEach((doc) => {
                    batch.set(doc.ref, {
                        salaryStatus: 'Paid',
                        lastPaidMonth: month,
                        lastPaidAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    }, { merge: true });
                });
                await batch.commit();
            }
            catch (err) {
                console.warn('payAllSalaries firestore update warning:', err);
            }
        }
        return {
            success: true,
            message: `All salaries processed successfully for ${month}`,
            month,
        };
    }
    async getSalaryInvoices(id, tenantId) {
        return [
            {
                id: `SAL-${id.slice(0, 6).toUpperCase()}-01`,
                month: 'May 2026',
                amount: 32100,
                status: 'Paid',
                paidAt: '2026-05-31',
            },
        ];
    }
    async getCases(id, tenantId) {
        return [];
    }
    async getSchedule(id, tenantId) {
        return [
            { day: 'Monday', period: '1st Period', class: 'Grade 10 - A', subject: 'Mathematics' },
            { day: 'Wednesday', period: '3rd Period', class: 'Grade 10 - B', subject: 'Mathematics' },
        ];
    }
};
exports.TeacherService = TeacherService;
exports.TeacherService = TeacherService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('ITeacherRepository')),
    __param(1, (0, common_1.Inject)('IUserRepository')),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [Object, Object, firebase_service_1.FirebaseService])
], TeacherService);
//# sourceMappingURL=teacher.service.js.map