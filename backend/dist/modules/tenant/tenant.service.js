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
exports.TenantService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const crypto_1 = require("crypto");
const firebase_service_1 = require("../../database/firebase.service");
let TenantService = class TenantService {
    constructor(tenantRepo, userRepo, jwtService, firebaseService) {
        this.tenantRepo = tenantRepo;
        this.userRepo = userRepo;
        this.jwtService = jwtService;
        this.firebaseService = firebaseService;
    }
    async registerSchool(data) {
        const cleanedPhone = (data.mobileNumber || '').replace(/[\s\-()]/g, '');
        if (typeof this.userRepo.findByPhone === 'function') {
            const existing = await this.userRepo.findByPhone(cleanedPhone);
            if (existing) {
                throw new common_1.ConflictException('A school administrator with this mobile number is already registered. Please log in.');
            }
        }
        const tenantId = (0, crypto_1.randomUUID)();
        const userId = (0, crypto_1.randomUUID)();
        const subDomain = (data.schoolName || 'school').toLowerCase().replace(/[^a-z0-9]/g, '');
        const tenant = await this.tenantRepo.create({
            id: tenantId,
            name: data.schoolName,
            schoolType: data.schoolType || 'School',
            adminName: data.adminName,
            adminPhone: cleanedPhone,
            email: data.email,
            address: data.address || '',
            subDomain,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        const user = await this.userRepo.create({
            id: userId,
            tenantId,
            name: data.adminName,
            email: data.email,
            phone: cleanedPhone,
            role: 'SCHOOL_ADMIN',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        const payload = {
            sub: user.id,
            phone: cleanedPhone,
            role: 'SCHOOL_ADMIN',
            tenantId: tenant.id,
        };
        const token = this.jwtService.sign(payload);
        return {
            success: true,
            access_token: token,
            user: {
                id: user.id,
                phone: cleanedPhone,
                email: user.email,
                name: user.name,
                role: 'SCHOOL_ADMIN',
                tenantId: tenant.id,
                tenant,
            },
        };
    }
    async getSetupStatus(tenantId) {
        const tenants = await this.tenantRepo.findAll();
        const tenant = tenants.find((t) => t.id === tenantId) || tenants[0] || { id: 'tenant-test-001', name: 'EduTrack School' };
        const tid = tenant.id || 'tenant-test-001';
        let classesCount = 0;
        let teachersCount = 0;
        let studentsCount = 0;
        if (this.firebaseService) {
            try {
                const db = this.firebaseService.getFirestore();
                if (db) {
                    const [classesSnap, teachersSnap, studentsSnap] = await Promise.all([
                        db.collection('tenants').doc(tid).collection('classes').get().catch(() => null),
                        db.collection('users').where('tenantId', '==', tid).where('role', 'in', ['TEACHER', 'STAFF', 'DRIVER']).get().catch(() => null),
                        db.collection('studentProfiles').where('tenantId', '==', tid).get().catch(() => null),
                    ]);
                    if (classesSnap && !classesSnap.empty) {
                        classesCount = classesSnap.size;
                    }
                    else {
                        const rootClasses = await db.collection('classes').where('tenantId', '==', tid).get().catch(() => null);
                        if (rootClasses)
                            classesCount = rootClasses.size;
                    }
                    if (teachersSnap)
                        teachersCount = teachersSnap.size;
                    if (studentsSnap && !studentsSnap.empty) {
                        studentsCount = studentsSnap.size;
                    }
                    else {
                        const altStudents = await db.collection('users').where('tenantId', '==', tid).where('role', '==', 'STUDENT').get().catch(() => null);
                        if (altStudents)
                            studentsCount = altStudents.size;
                    }
                }
            }
            catch (err) {
                console.warn('[getSetupStatus] Count calculation notice:', err);
            }
        }
        let completedSteps = 1;
        if (classesCount > 0)
            completedSteps++;
        if (teachersCount > 0)
            completedSteps++;
        if (studentsCount > 0)
            completedSteps++;
        const completionPercentage = Math.round((completedSteps / 4) * 100);
        const setupCompleted = completionPercentage === 100;
        return {
            success: true,
            classesCount,
            teachersCount,
            studentsCount,
            completionPercentage,
            setupCompleted,
            currentUser: {
                id: 'user-active',
                name: tenant.adminName || tenant.name || 'School Administrator',
                role: 'SCHOOL_ADMIN',
                tenantId: tid,
            },
            setup: {
                tenantId: tid,
                schoolName: tenant.name || 'EduTrack School',
                schoolType: tenant.schoolType || 'School',
                adminName: tenant.adminName || tenant.name || 'School Administrator',
                schoolLogo: tenant.logoUrl || null,
                email: tenant.email || '',
                mobileNumber: tenant.adminPhone || tenant.phone || '',
                address: tenant.address || '',
                classesCount,
                teachersCount,
                studentsCount,
                completionPercentage,
                setupCompleted,
                tenant,
            },
            subscription: {
                plan: 'PRO',
                status: 'ACTIVE',
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                features: ['all'],
            },
            isSubscriptionActive: true,
        };
    }
    async findAll() {
        return this.tenantRepo.findAll();
    }
    async findOne(id) {
        const tenant = await this.tenantRepo.findById(id);
        if (!tenant)
            throw new common_1.NotFoundException('Tenant not found');
        return tenant;
    }
    async update(id, data) {
        return this.tenantRepo.update(id, data);
    }
    async remove(id) {
        return this.tenantRepo.delete(id);
    }
};
exports.TenantService = TenantService;
exports.TenantService = TenantService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('ITenantRepository')),
    __param(1, (0, common_1.Inject)('IUserRepository')),
    __param(3, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [Object, Object, jwt_1.JwtService,
        firebase_service_1.FirebaseService])
], TenantService);
//# sourceMappingURL=tenant.service.js.map