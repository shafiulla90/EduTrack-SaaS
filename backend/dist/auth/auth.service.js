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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const client_1 = require("@prisma/client");
const firebase_admin_service_1 = require("./firebase-admin.service");
const config_1 = require("@nestjs/config");
let AuthService = class AuthService {
    constructor(prisma, jwtService, firebaseAdminService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.firebaseAdminService = firebaseAdminService;
        this.configService = configService;
        this.failedAttemptsMap = new Map();
        this.usedCodes = new Set();
    }
    async hashPassword(password) {
        return bcrypt.hash(password, 10);
    }
    async validateUser(email, pass) {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });
        if (user && await bcrypt.compare(pass, user.passwordHash)) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null;
    }
    async login(user) {
        const payload = { email: user.email, sub: user.id, role: user.role, tenantId: user.tenantId };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                tenantId: user.tenantId,
            }
        };
    }
    async sendOtp(phone, portal) {
        const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
        let targetTenantId;
        if (portal) {
            const p = portal.toLowerCase();
            const users = await this.prisma.user.findMany({
                where: { phone: { endsWith: normalizedPhone } }
            });
            const matchingStudents = await this.prisma.studentProfile.findMany({
                where: {
                    OR: [
                        { user: { phone: { endsWith: normalizedPhone } } },
                        { fatherPhone: { endsWith: normalizedPhone } },
                        { motherPhone: { endsWith: normalizedPhone } },
                        { guardianPhone: { endsWith: normalizedPhone } }
                    ]
                }
            });
            const isAdmin = users.some(u => u.role === client_1.Role.SCHOOL_ADMIN || u.role === client_1.Role.SUPER_ADMIN || u.role === 'ADMIN');
            const isTeacher = users.some(u => u.role === client_1.Role.TEACHER || u.role === client_1.Role.STAFF || u.role === client_1.Role.DRIVER);
            const isParent = users.some(u => u.role === client_1.Role.PARENT) || matchingStudents.length > 0;
            const isStudent = users.some(u => u.role === client_1.Role.STUDENT);
            const userExists = users.length > 0 || matchingStudents.length > 0;
            if (p === 'admin') {
                if (!isAdmin) {
                    if (userExists) {
                        throw new common_1.BadRequestException('This mobile number is not authorized for the Administrator portal. Please log in through the appropriate portal.');
                    }
                    return {
                        success: false,
                        notFound: true,
                        redirectToRegister: true,
                        message: 'School Administrator account not found. Redirecting to School Registration page...'
                    };
                }
                const matchedUser = users.find(u => u.role === client_1.Role.SCHOOL_ADMIN || u.role === client_1.Role.SUPER_ADMIN || u.role === 'ADMIN');
                if (matchedUser)
                    targetTenantId = matchedUser.tenantId;
            }
            else if (p === 'teacher') {
                if (!isTeacher) {
                    if (userExists) {
                        throw new common_1.BadRequestException('This mobile number is not authorized for the Teacher Portal. Please log in through the appropriate portal.');
                    }
                    return {
                        success: false,
                        notFound: true,
                        portal: 'teacher',
                        message: 'Teacher or Driver account not found. Please contact your School Administrator to obtain portal access.'
                    };
                }
                const matchedUser = users.find(u => u.role === client_1.Role.TEACHER || u.role === client_1.Role.STAFF || u.role === client_1.Role.DRIVER);
                if (matchedUser)
                    targetTenantId = matchedUser.tenantId;
            }
            else if (p === 'parent') {
                if (!isParent) {
                    if (userExists) {
                        throw new common_1.BadRequestException('This mobile number is not authorized for the Parent Portal. Please log in through the appropriate portal.');
                    }
                    return {
                        success: false,
                        notFound: true,
                        portal: 'parent',
                        message: 'Parent account not found. Please contact your School Administrator to obtain Parent Portal access.'
                    };
                }
                const matchedUser = users.find(u => u.role === client_1.Role.PARENT);
                if (matchedUser) {
                    targetTenantId = matchedUser.tenantId;
                }
                else if (matchingStudents.length > 0) {
                    targetTenantId = matchingStudents[0].tenantId;
                }
            }
            else if (p === 'student') {
                if (!isStudent) {
                    if (userExists) {
                        throw new common_1.BadRequestException('This mobile number is not authorized for the Student Desk. Please log in through the appropriate portal.');
                    }
                    return {
                        success: false,
                        notFound: true,
                        portal: 'student',
                        message: 'Student account not found. Please contact your School Administrator to obtain Student Desk access.'
                    };
                }
                const matchedUser = users.find(u => u.role === client_1.Role.STUDENT);
                if (matchedUser)
                    targetTenantId = matchedUser.tenantId;
            }
        }
        else {
            const user = await this.prisma.user.findFirst({
                where: { phone: { endsWith: normalizedPhone } },
                select: { tenantId: true },
            });
            if (user)
                targetTenantId = user.tenantId;
        }
        const isSecurityDisabled = process.env.NODE_ENV !== 'production' && this.configService.get('DISABLE_OTP_SECURITY') === 'true';
        if (!isSecurityDisabled) {
            const lastRequest = await this.prisma.otpRequest.findFirst({
                where: { phone: normalizedPhone },
                orderBy: { createdAt: 'desc' },
            });
            if (lastRequest) {
                const now = new Date();
                const diffMs = now.getTime() - lastRequest.createdAt.getTime();
                if (diffMs < 60 * 1000) {
                    const remainingSec = Math.ceil((60 * 1000 - diffMs) / 1000);
                    throw new common_1.BadRequestException(`Please wait ${remainingSec} seconds before requesting a new OTP.`);
                }
            }
            const oneHourAgo = new Date();
            oneHourAgo.setHours(oneHourAgo.getHours() - 1);
            const hourlyRequestCount = await this.prisma.otpRequest.count({
                where: {
                    phone: normalizedPhone,
                    createdAt: { gte: oneHourAgo },
                },
            });
            if (hourlyRequestCount >= 5) {
                throw new common_1.BadRequestException('Too many OTP requests. Maximum 5 requests per hour. Please try again later.');
            }
        }
        await this.prisma.otpRequest.updateMany({
            where: { phone: normalizedPhone, expiresAt: { gt: new Date() } },
            data: { expiresAt: new Date(0) }
        }).catch(() => { });
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        await this.prisma.otpRequest.deleteMany({
            where: { phone: normalizedPhone, createdAt: { lt: oneDayAgo } }
        }).catch(() => { });
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 5);
        await this.prisma.otpRequest.create({
            data: {
                phone: normalizedPhone,
                otpCode: 'FIREBASE_PENDING',
                expiresAt,
            },
        });
        let schoolName;
        let logoUrl;
        try {
            if (targetTenantId) {
                const [tenant, setup] = await Promise.all([
                    this.prisma.tenant.findUnique({
                        where: { id: targetTenantId },
                        select: { name: true, logoUrl: true },
                    }),
                    this.prisma.schoolSetup.findUnique({
                        where: { tenantId: targetTenantId },
                        select: { schoolName: true, schoolLogo: true },
                    }),
                ]);
                schoolName = setup?.schoolName || tenant?.name || undefined;
                logoUrl = setup?.schoolLogo || tenant?.logoUrl || undefined;
            }
        }
        catch (e) {
        }
        return {
            success: true,
            message: 'OTP request authorized successfully',
            ...(schoolName ? { schoolName } : {}),
            ...(logoUrl ? { logoUrl } : {}),
        };
    }
    async verifyOtp(phone, otpCode, portal, generateCode) {
        const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
        const isSecurityDisabled = process.env.NODE_ENV !== 'production' && this.configService.get('DISABLE_OTP_SECURITY') === 'true';
        const blockInfo = this.failedAttemptsMap.get(normalizedPhone);
        if (!isSecurityDisabled && blockInfo && blockInfo.blockedUntil > new Date()) {
            const remainingMin = Math.ceil((blockInfo.blockedUntil.getTime() - new Date().getTime()) / 60000);
            throw new common_1.UnauthorizedException(`Too many failed attempts. This number is locked for another ${remainingMin} minutes.`);
        }
        let verifiedPhoneRaw;
        try {
            if (isSecurityDisabled && (otpCode === 'MOCK_FIREBASE_ID_TOKEN' || !this.firebaseAdminService.isInitialized())) {
                verifiedPhoneRaw = normalizedPhone;
            }
            else {
                verifiedPhoneRaw = await this.firebaseAdminService.verifyIdToken(otpCode);
            }
        }
        catch (error) {
            if (isSecurityDisabled) {
                verifiedPhoneRaw = normalizedPhone;
            }
            else {
                const currentAttempts = blockInfo ? blockInfo.count + 1 : 1;
                if (currentAttempts >= 5) {
                    const blockedUntil = new Date();
                    blockedUntil.setMinutes(blockedUntil.getMinutes() + 15);
                    this.failedAttemptsMap.set(normalizedPhone, { count: currentAttempts, blockedUntil });
                    throw new common_1.UnauthorizedException('Too many failed attempts. This phone number has been locked for 15 minutes.');
                }
                else {
                    const blockedUntil = new Date(0);
                    this.failedAttemptsMap.set(normalizedPhone, { count: currentAttempts, blockedUntil });
                    throw error;
                }
            }
        }
        const verifiedPhone = verifiedPhoneRaw.replace(/\D/g, '').slice(-10);
        if (verifiedPhone !== normalizedPhone) {
            throw new common_1.UnauthorizedException('Phone number verification mismatch.');
        }
        if (!isSecurityDisabled) {
            const request = await this.prisma.otpRequest.findFirst({
                where: {
                    phone: normalizedPhone,
                    otpCode: 'FIREBASE_PENDING',
                    expiresAt: { gt: new Date() },
                },
                orderBy: { createdAt: 'desc' },
            });
            if (!request) {
                throw new common_1.UnauthorizedException('No active authentication request found. Please request a new verification code.');
            }
            this.failedAttemptsMap.delete(normalizedPhone);
            await this.prisma.otpRequest.delete({
                where: { id: request.id },
            }).catch(() => { });
        }
        else {
            this.failedAttemptsMap.delete(normalizedPhone);
        }
        if (portal && portal.toLowerCase() === 'parent') {
            const matchingStudents = await this.prisma.studentProfile.findMany({
                where: {
                    OR: [
                        { user: { phone: { endsWith: normalizedPhone } } },
                        { fatherPhone: { endsWith: normalizedPhone } },
                        { motherPhone: { endsWith: normalizedPhone } },
                        { guardianPhone: { endsWith: normalizedPhone } }
                    ]
                },
                include: {
                    user: true
                }
            });
            let parentUser = await this.prisma.user.findFirst({
                where: {
                    role: client_1.Role.PARENT,
                    phone: { endsWith: normalizedPhone }
                },
                include: {
                    parentProfile: true
                }
            });
            if (matchingStudents.length > 0) {
                const firstStudent = matchingStudents[0];
                const tenantId = firstStudent.tenantId;
                if (!parentUser) {
                    const parentName = firstStudent.fatherName || firstStudent.motherName || `Parent of ${firstStudent.user.name}`;
                    const parentEmail = `parent.${normalizedPhone}@edutrack.local`;
                    const passwordHash = await bcrypt.hash('Welcome@123', 10);
                    const parentPhone = `${tenantId.substring(0, 8)}-${normalizedPhone}`;
                    parentUser = await this.prisma.$transaction(async (tx) => {
                        let existing = await tx.user.findFirst({
                            where: {
                                OR: [
                                    { email: parentEmail },
                                    { phone: parentPhone, role: client_1.Role.PARENT }
                                ]
                            },
                            include: { parentProfile: true }
                        });
                        if (existing)
                            return existing;
                        const user = await tx.user.create({
                            data: {
                                email: parentEmail,
                                name: parentName,
                                passwordHash,
                                role: client_1.Role.PARENT,
                                phone: parentPhone,
                                tenantId,
                            }
                        });
                        const profile = await tx.parentProfile.create({
                            data: {
                                userId: user.id,
                            }
                        });
                        return {
                            ...user,
                            parentProfile: profile
                        };
                    });
                }
                if (parentUser && parentUser.parentProfile) {
                    for (const student of matchingStudents) {
                        let relationship = "Guardian";
                        if (student.fatherPhone && student.fatherPhone.replace(/\D/g, '').endsWith(normalizedPhone)) {
                            relationship = "Father";
                        }
                        else if (student.motherPhone && student.motherPhone.replace(/\D/g, '').endsWith(normalizedPhone)) {
                            relationship = "Mother";
                        }
                        await this.prisma.parentStudent.upsert({
                            where: {
                                parentId_studentId: {
                                    parentId: parentUser.parentProfile.id,
                                    studentId: student.id
                                }
                            },
                            update: {},
                            create: {
                                parentId: parentUser.parentProfile.id,
                                studentId: student.id,
                                relationship,
                                isPrimary: true
                            }
                        }).catch(() => { });
                        if (student.parentProfileId !== parentUser.parentProfile.id) {
                            await this.prisma.studentProfile.update({
                                where: { id: student.id },
                                data: { parentProfileId: parentUser.parentProfile.id }
                            }).catch(() => { });
                        }
                    }
                }
            }
        }
        let user = null;
        if (portal) {
            const p = portal.toLowerCase();
            if (p === 'parent') {
                user = await this.prisma.user.findFirst({
                    where: {
                        phone: { endsWith: normalizedPhone },
                        role: client_1.Role.PARENT
                    },
                });
            }
            else if (p === 'student') {
                user = await this.prisma.user.findFirst({
                    where: {
                        phone: { endsWith: normalizedPhone },
                        role: client_1.Role.STUDENT
                    },
                });
            }
            else if (p === 'teacher') {
                user = await this.prisma.user.findFirst({
                    where: {
                        phone: { endsWith: normalizedPhone },
                        role: { in: [client_1.Role.TEACHER, client_1.Role.STAFF, client_1.Role.DRIVER] }
                    },
                });
            }
            else if (p === 'admin') {
                user = await this.prisma.user.findFirst({
                    where: {
                        phone: { endsWith: normalizedPhone },
                        role: { in: [client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN] }
                    },
                });
            }
        }
        else {
            user = await this.prisma.user.findFirst({
                where: {
                    phone: { endsWith: normalizedPhone }
                },
            });
        }
        if (!user) {
            if (portal && portal.toLowerCase() !== 'admin') {
                throw new common_1.BadRequestException('Account not found for the selected portal. Please contact your School Administrator.');
            }
            return {
                registered: false,
                phone,
            };
        }
        const loginResult = await this.login(user);
        if (generateCode) {
            const codePayload = {
                type: 'auth_code',
                userId: user.id,
                tenantId: user.tenantId,
                access_token: loginResult.access_token,
                user: loginResult.user
            };
            const code = this.jwtService.sign(codePayload, { expiresIn: '30s' });
            return {
                registered: true,
                code
            };
        }
        return {
            registered: true,
            ...loginResult,
        };
    }
    async exchangeCode(code) {
        if (this.usedCodes.has(code)) {
            throw new common_1.UnauthorizedException('Authorization code has already been used.');
        }
        try {
            const payload = this.jwtService.verify(code);
            if (payload.type !== 'auth_code') {
                throw new common_1.UnauthorizedException('Invalid authorization code.');
            }
            this.usedCodes.add(code);
            setTimeout(() => {
                this.usedCodes.delete(code);
            }, 35000);
            return {
                access_token: payload.access_token,
                user: payload.user
            };
        }
        catch (e) {
            throw new common_1.UnauthorizedException(`Authorization code validation failed: ${e.message}`);
        }
    }
    async register(data, tenantId) {
        const emailLower = data.email.toLowerCase().trim();
        const existing = await this.prisma.user.findUnique({
            where: { email: emailLower },
        });
        if (existing) {
            throw new common_1.ConflictException('Email is already registered');
        }
        const passwordHash = await this.hashPassword(data.password);
        const normalizedPhone = data.phone ? data.phone.replace(/\D/g, '').slice(-10) : data.phone;
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: emailLower,
                    passwordHash,
                    name: data.name,
                    role: data.role,
                    phone: normalizedPhone,
                    tenantId,
                },
            });
            if (data.role === client_1.Role.STUDENT) {
                await tx.studentProfile.create({
                    data: {
                        userId: user.id,
                        rollNo: data.rollNo,
                        fatherName: data.fatherName,
                        motherName: data.motherName,
                        aadharNo: data.aadharNo,
                        classSectionId: data.classSectionId,
                        tenantId,
                    },
                });
            }
            else if (data.role === client_1.Role.TEACHER ||
                data.role === client_1.Role.STAFF ||
                data.role === client_1.Role.SCHOOL_ADMIN) {
                await tx.staffProfile.create({
                    data: {
                        userId: user.id,
                        employeeId: data.employeeId,
                        designation: data.designation,
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
            }
            else if (data.role === client_1.Role.PARENT) {
                await tx.parentProfile.create({
                    data: {
                        userId: user.id,
                        emergencyContact: data.emergencyContact,
                    },
                });
            }
            const { passwordHash: _, ...result } = user;
            return result;
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        firebase_admin_service_1.FirebaseAdminService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map