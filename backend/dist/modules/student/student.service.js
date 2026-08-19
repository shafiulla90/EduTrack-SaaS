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
exports.StudentService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let StudentService = class StudentService {
    constructor(studentRepo) {
        this.studentRepo = studentRepo;
    }
    async findAll(tenantId, page = 1, limit = 100, filters) {
        const res = await this.studentRepo.findStudentsByTenant(tenantId || 'tenant-test-001', page, limit, filters);
        const items = res?.items || [];
        const total = res?.total !== undefined ? res.total : items.length;
        return {
            data: items,
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / (limit || 100))),
        };
    }
    async findOne(id, tenantId) {
        return this.studentRepo.findProfileById(id);
    }
    async create(data, tenantId) {
        const id = data.id || (0, crypto_1.randomUUID)();
        return this.studentRepo.createProfile({
            ...data,
            id,
            tenantId: tenantId || 'tenant-test-001',
            createdAt: new Date().toISOString(),
        });
    }
    async update(id, data, tenantId) {
        return this.studentRepo.updateProfile(id, {
            ...data,
            updatedAt: new Date().toISOString(),
        });
    }
    async delete(id, tenantId) {
        if (this.studentRepo.deleteProfile) {
            return this.studentRepo.deleteProfile(id);
        }
        return { success: true, id };
    }
    async importStudentsBulk(studentsData, tenantId) {
        const tid = tenantId || 'tenant-test-001';
        let importedCount = 0;
        const errors = [];
        for (let i = 0; i < studentsData.length; i++) {
            const row = studentsData[i];
            try {
                const studentName = (row.name || row.studentName || row.fullName || `${row.firstName || ''} ${row.lastName || ''}`).trim() || `Student ${i + 1}`;
                const phone = (row.phone || row.mobileNumber || row.contact || '').replace(/\D/g, '');
                const email = (row.email || `student_${Date.now()}_${i}@school.com`).trim();
                const rollNo = (row.rollNo || row.rollNumber || `STU-${1000 + i}`).trim();
                const fatherName = (row.fatherName || row.parentName || '').trim();
                const motherName = (row.motherName || '').trim();
                const userId = (0, crypto_1.randomUUID)();
                const studentId = (0, crypto_1.randomUUID)();
                await this.studentRepo.createProfile({
                    id: studentId,
                    userId,
                    tenantId: tid,
                    rollNo,
                    fatherName,
                    motherName,
                    user: {
                        id: userId,
                        name: studentName,
                        email,
                        phone,
                        role: 'STUDENT',
                        tenantId: tid,
                        isActive: true,
                    },
                    classSection: {
                        class: { name: row.className || row.class || 'Class 1' },
                        section: { name: row.sectionName || row.section || 'A' }
                    },
                    createdAt: new Date().toISOString(),
                });
                importedCount++;
            }
            catch (err) {
                errors.push(`Row ${i + 1}: ${err.message || 'Import failed'}`);
            }
        }
        return {
            success: true,
            importedCount,
            totalRecords: studentsData.length,
            errors,
        };
    }
};
exports.StudentService = StudentService;
exports.StudentService = StudentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IStudentRepository')),
    __metadata("design:paramtypes", [Object])
], StudentService);
//# sourceMappingURL=student.service.js.map