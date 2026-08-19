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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const crypto_1 = require("crypto");
const subscription_service_1 = require("../subscription/subscription.service");
let AuthService = class AuthService {
    constructor(userRepo, tenantRepo, jwtService, subscriptionService) {
        this.userRepo = userRepo;
        this.tenantRepo = tenantRepo;
        this.jwtService = jwtService;
        this.subscriptionService = subscriptionService;
        this.otpStore = new Map();
    }
    async register(dto) {
        const existingUser = await this.userRepo.findByEmail(dto.email);
        if (existingUser)
            throw new common_1.ConflictException('Email already in use');
        const existingTenant = await this.tenantRepo.findBySubdomain(dto.domain.toLowerCase());
        if (existingTenant)
            throw new common_1.ConflictException('Domain already in use');
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const tenant = await this.tenantRepo.create({
            id: (0, crypto_1.randomUUID)(),
            name: dto.school_name,
            subDomain: dto.domain.toLowerCase(),
            updatedAt: new Date(),
        });
        const user = await this.userRepo.create({
            id: (0, crypto_1.randomUUID)(),
            tenantId: tenant.id,
            email: dto.email,
            passwordHash: hashedPassword,
            name: `${dto.first_name} ${dto.last_name}`,
            role: 'SCHOOL_ADMIN',
            updatedAt: new Date(),
        });
        const result = {
            message: 'Institution registered successfully',
            tenant_id: tenant.id,
            user_id: user.id,
        };
        await this.subscriptionService.assignFreePlanToNewTenant(result.tenant_id);
        return result;
    }
    async login(dto) {
        const user = await this.userRepo.findByEmail(dto.email);
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const tenant = await this.tenantRepo.findById(user.tenantId);
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId
        };
        let subscriptionStatus = 'ACTIVE';
        if (user.role === 'SCHOOL_ADMIN') {
            const sub = await this.subscriptionService.checkSubscriptionStatus(user.tenantId);
            subscriptionStatus = sub.status;
        }
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                first_name: user.name.split(' ')[0] || '',
                last_name: user.name.split(' ').slice(1).join(' ') || '',
                role: user.role,
                tenant,
                subscriptionStatus,
            },
        };
    }
    async sendOtp(phone, portal) {
        const cleanedPhone = (phone || '').replace(/[\s\-()]/g, '');
        let existingUser = null;
        if (typeof this.userRepo.findByPhone === 'function') {
            existingUser = await this.userRepo.findByPhone(cleanedPhone);
        }
        const portalRole = (portal === 'teacher' ? 'TEACHER' : portal === 'parent' ? 'PARENT' : portal === 'student' ? 'STUDENT' : 'SCHOOL_ADMIN');
        if (!existingUser) {
            if (portalRole === 'SCHOOL_ADMIN' || !portal || portal === 'admin') {
                console.log(`[AuthService] Mobile number ${cleanedPhone} NOT FOUND in Firestore -> Redirecting to School Registration`);
                return {
                    success: false,
                    notFound: true,
                    redirectToRegister: true,
                    portal: 'admin',
                    message: 'School Administrator account not found. Please register your school.',
                };
            }
            else {
                console.log(`[AuthService] Mobile number ${cleanedPhone} NOT FOUND in Firestore for ${portalRole}`);
                return {
                    success: false,
                    notFound: true,
                    redirectToRegister: false,
                    portal,
                    message: `${portal.toUpperCase()} account not found. Please contact your School Administrator.`,
                };
            }
        }
        const tenants = await this.tenantRepo.findAll();
        const primaryTenant = tenants.find((t) => t.id === existingUser.tenantId) || tenants[0] || { id: 'tenant-test-001', name: 'EduTrack School' };
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        this.otpStore.set(cleanedPhone, {
            code: generatedOtp,
            expiresAt: Date.now() + 5 * 60 * 1000,
        });
        console.log(`\n==========================================`);
        console.log(`[EduTrack Auth] REAL-TIME OTP FOR REGISTERED USER (${cleanedPhone}): ${generatedOtp}`);
        console.log(`==========================================\n`);
        return {
            success: true,
            registered: true,
            schoolName: primaryTenant.name || 'EduTrack School',
            logoUrl: primaryTenant.logoUrl || null,
            message: 'OTP sent successfully to registered mobile number',
            phone: cleanedPhone,
            code: generatedOtp,
            tenantId: primaryTenant.id,
        };
    }
    async verifyOtp(phone, otp, idToken, portal) {
        const cleanedPhone = (phone || '').replace(/[\s\-()]/g, '');
        let existingUser = null;
        if (typeof this.userRepo.findByPhone === 'function') {
            existingUser = await this.userRepo.findByPhone(cleanedPhone);
        }
        if (!existingUser) {
            throw new common_1.UnauthorizedException('Mobile number not found. Access denied.');
        }
        const tenants = await this.tenantRepo.findAll();
        const tenant = tenants.find((t) => t.id === existingUser.tenantId) || tenants[0] || { id: 'tenant-test-001', name: 'EduTrack School' };
        const role = existingUser.role || (portal === 'teacher' ? 'TEACHER' : portal === 'parent' ? 'PARENT' : 'SCHOOL_ADMIN');
        const userId = existingUser.id || `user-phone-${cleanedPhone}`;
        const payload = {
            sub: userId,
            phone: cleanedPhone,
            role,
            tenantId: tenant.id,
        };
        return {
            success: true,
            registered: true,
            access_token: this.jwtService.sign(payload),
            user: {
                id: userId,
                phone: cleanedPhone,
                email: existingUser.email || `${portal || 'user'}@edutrack.com`,
                name: existingUser.name || 'School Administrator',
                role,
                tenantId: tenant.id,
                tenant,
            },
            token: this.jwtService.sign(payload),
        };
    }
    async exchangeCode(code) {
        const tenants = await this.tenantRepo.findAll();
        const tenant = tenants[0] || { id: 'tenant-test-001', name: 'EduTrack School' };
        const payload = { sub: 'user-auth-hub', role: 'SCHOOL_ADMIN', tenantId: tenant.id };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: 'user-auth-hub',
                email: 'admin@edutrack.com',
                role: 'SCHOOL_ADMIN',
                tenantId: tenant.id,
                tenant,
            },
        };
    }
    async getProfile(tokenHeader) {
        if (!tokenHeader) {
            throw new common_1.UnauthorizedException('No token provided');
        }
        const token = tokenHeader.replace('Bearer ', '').trim();
        try {
            const payload = this.jwtService.verify(token);
            const tenants = await this.tenantRepo.findAll();
            const tenant = tenants.find((t) => t.id === payload.tenantId) || tenants[0] || { id: 'tenant-test-001', name: 'EduTrack School' };
            return {
                success: true,
                user: {
                    id: payload.sub,
                    email: payload.email || 'admin@edutrack.com',
                    phone: payload.phone || '',
                    role: payload.role || 'SCHOOL_ADMIN',
                    tenantId: payload.tenantId,
                    tenant,
                },
            };
        }
        catch (e) {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IUserRepository')),
    __param(1, (0, common_1.Inject)('ITenantRepository')),
    __metadata("design:paramtypes", [Object, Object, jwt_1.JwtService,
        subscription_service_1.SubscriptionService])
], AuthService);
//# sourceMappingURL=auth.service.js.map