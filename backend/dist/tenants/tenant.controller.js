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
exports.TenantController = void 0;
const common_1 = require("@nestjs/common");
const tenants_service_1 = require("./tenants.service");
const auth_service_1 = require("../auth/auth.service");
const prisma_service_1 = require("../prisma.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let TenantController = class TenantController {
    constructor(tenantsService, authService, prisma) {
        this.tenantsService = tenantsService;
        this.authService = authService;
        this.prisma = prisma;
    }
    async getPublicBranding(req) {
        const tenantId = req['tenantId'];
        if (!tenantId) {
            return {
                id: null,
                name: 'EduTrack Application',
                subdomain: null,
                logoUrl: null,
                subtitle: 'School Management Platform',
            };
        }
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId }
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        const setup = await this.prisma.schoolSetup.findUnique({
            where: { tenantId }
        });
        return {
            id: tenant.id,
            name: tenant.name,
            subdomain: tenant.subDomain,
            logoUrl: setup?.schoolLogo || tenant.logoUrl || null,
            subtitle: tenant.subtitle || setup?.schoolType || 'Building Excellence for Futures'
        };
    }
    async register(body) {
        const required = [
            'schoolName',
            'schoolType',
            'adminName',
            'mobileNumber',
            'email',
            'address',
            'academicYear',
        ];
        for (const field of required) {
            if (!body[field] || String(body[field]).trim() === '') {
                throw new common_1.BadRequestException(`Field '${field}' is required for school registration`);
            }
        }
        const result = await this.tenantsService.registerTenant(body);
        const loginResult = await this.authService.login(result.user);
        return {
            success: true,
            message: 'School registered successfully',
            ...loginResult,
        };
    }
    async getSetupStatus(req) {
        const tenantId = req.user.tenantId;
        const currentUser = await this.prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatarUrl: true,
                staffProfile: {
                    select: { id: true, staffRole: true, designation: true, staffCategory: true }
                }
            },
        });
        const setup = await this.prisma.schoolSetup.findUnique({
            where: { tenantId },
            include: { tenant: true },
        });
        const classesCount = await this.prisma.class.count({
            where: {
                tenantId,
                isActive: true,
            },
        });
        const teachersCount = await this.prisma.staffProfile.count({
            where: {
                user: {
                    tenantId,
                    isActive: true,
                    role: { in: ['TEACHER', 'STAFF'] },
                },
            },
        });
        const studentsCount = await this.prisma.studentProfile.count({
            where: {
                user: {
                    tenantId,
                    isActive: true,
                },
            },
        });
        if (!setup) {
            const tenant = await this.prisma.tenant.findUnique({
                where: { id: tenantId },
            });
            return {
                setupCompleted: false,
                completionPercentage: 0,
                classesCount,
                teachersCount,
                studentsCount,
                missingFields: [
                    'schoolName',
                    'schoolType',
                    'adminName',
                    'mobileNumber',
                    'email',
                    'address',
                    'academicYear',
                ],
                setup: tenant ? {
                    id: '',
                    tenantId: tenant.id,
                    schoolName: tenant.name,
                    schoolType: 'School',
                    adminName: tenant.name,
                    mobileNumber: tenant.phone || '',
                    email: tenant.email || '',
                    address: tenant.address || '',
                    academicYear: '2026-2027',
                    principalName: '',
                    country: '',
                    state: '',
                    district: '',
                    city: '',
                    postalCode: '',
                    schoolLogo: null,
                    isCompleted: false,
                } : null,
                currentUser,
            };
        }
        const fields = [
            setup.schoolName, setup.schoolType, setup.adminName, setup.mobileNumber,
            setup.email, setup.address, setup.academicYear, setup.principalName,
            setup.country, setup.state, setup.district, setup.city, setup.postalCode
        ];
        const filledCount = fields.filter(val => val && String(val).trim() !== '').length;
        const completionPercentage = Math.round((filledCount / fields.length) * 100);
        const missingFields = [];
        const checkFields = {
            principalName: setup.principalName,
            country: setup.country,
            state: setup.state,
            district: setup.district,
            city: setup.city,
            postalCode: setup.postalCode,
            schoolLogo: setup.schoolLogo,
        };
        for (const [key, val] of Object.entries(checkFields)) {
            if (!val || String(val).trim() === '') {
                missingFields.push(key);
            }
        }
        const subscription = await this.prisma.tenantSubscription.findUnique({
            where: { tenantId },
            include: { plan: true },
        });
        return {
            setupCompleted: setup.isCompleted,
            completionPercentage,
            classesCount,
            teachersCount,
            studentsCount,
            missingFields,
            setup,
            currentUser,
            subscription: subscription ? {
                plan: subscription.plan.name,
                status: subscription.status,
                expiryDate: subscription.expiryDate,
                studentLimit: subscription.plan.studentLimit,
                teacherLimit: subscription.plan.teacherLimit,
                features: subscription.plan.features,
            } : null,
        };
    }
    async getDashboardStats(req) {
        const tenantId = req.user.tenantId;
        const studentsCount = await this.prisma.studentProfile.count({
            where: { user: { tenantId } },
        });
        const teachersCount = await this.prisma.staffProfile.count({
            where: { user: { tenantId } },
        });
        const classesCount = await this.prisma.class.count({
            where: { tenantId },
        });
        const booksCount = await this.prisma.book.count({
            where: { tenantId },
        });
        const complaintsCount = await this.prisma.behaviorCase.count({
            where: { tenantId },
        });
        const invoices = await this.prisma.invoice.findMany({
            where: { tenantId },
            select: { paidAmount: true },
        });
        const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
        const expenses = await this.prisma.expense.findMany({
            where: { tenantId },
            select: { amount: true },
        });
        const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
        const sessions = await this.prisma.attendanceSession.findMany({
            where: { tenantId },
            select: { presentCount: true, totalStudents: true },
        });
        const totalPresent = sessions.reduce((sum, s) => sum + s.presentCount, 0);
        const totalRoster = sessions.reduce((sum, s) => sum + s.totalStudents, 0);
        const attendanceRate = totalRoster > 0 ? Math.round((totalPresent / totalRoster) * 1000) / 10 : 0;
        const marks = await this.prisma.examMark.findMany({
            where: { tenantId },
            select: { marksObtained: true },
        });
        const academicAverage = marks.length > 0
            ? Math.round((marks.reduce((sum, m) => sum + Number(m.marksObtained), 0) / (marks.length)) * 10) / 10
            : 0;
        return {
            studentsCount,
            teachersCount,
            classesCount,
            booksCount,
            complaintsCount,
            totalRevenue,
            totalExpenses,
            attendanceRate,
            academicAverage,
        };
    }
    async updateBankingUpi(req, body) {
        const tenantId = req.user.tenantId;
        return this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                bankName: body.bankName || null,
                bankBranch: body.bankBranch || null,
                bankIFSC: body.bankIFSC || null,
                bankAccountNo: body.bankAccountNo || null,
                googlePayId: body.googlePayId || null,
                phonePeId: body.phonePeId || null,
                upiQrId: body.upiQrId || null,
            },
        });
    }
    async getSubscription(req) {
        const tenantId = req.user.tenantId;
        return this.tenantsService.getSubscriptionStatus(tenantId);
    }
    async getPlans() {
        return this.prisma.subscriptionPlan.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' },
        });
    }
    async renewSubscription(req, planName, paymentDetails) {
        const tenantId = req.user.tenantId;
        const userId = req.user.id;
        return this.tenantsService.upgradeOrRenewSubscription(tenantId, planName, paymentDetails, userId);
    }
    async createRazorpayOrder(req, planName, billingMonths, baseAmountRs, couponCode) {
        const tenantId = req.user.tenantId;
        return this.tenantsService.createRazorpayOrder(tenantId, planName, billingMonths, baseAmountRs, couponCode);
    }
    async verifyPayment(req, razorpayOrderId, razorpayPaymentId, razorpaySignature, planName, billingMonths, finalAmountRs, couponCode) {
        const tenantId = req.user.tenantId;
        return this.tenantsService.verifyAndRecordPayment(tenantId, razorpayOrderId, razorpayPaymentId, razorpaySignature, planName, billingMonths, finalAmountRs, couponCode);
    }
};
exports.TenantController = TenantController;
__decorate([
    (0, common_1.Get)('public-branding'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "getPublicBranding", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "register", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('setup-status'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "getSetupStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('dashboard-stats'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)('banking-upi'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "updateBankingUpi", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('subscription'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "getSubscription", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('subscription/plans'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "getPlans", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('subscription/renew'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('planName')),
    __param(2, (0, common_1.Body)('paymentDetails')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "renewSubscription", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('subscription/create-order'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('planName')),
    __param(2, (0, common_1.Body)('billingMonths')),
    __param(3, (0, common_1.Body)('baseAmountRs')),
    __param(4, (0, common_1.Body)('couponCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number, Number, String]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "createRazorpayOrder", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('subscription/verify-payment'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('razorpay_order_id')),
    __param(2, (0, common_1.Body)('razorpay_payment_id')),
    __param(3, (0, common_1.Body)('razorpay_signature')),
    __param(4, (0, common_1.Body)('planName')),
    __param(5, (0, common_1.Body)('billingMonths')),
    __param(6, (0, common_1.Body)('finalAmountRs')),
    __param(7, (0, common_1.Body)('couponCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, Number, Number, String]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "verifyPayment", null);
exports.TenantController = TenantController = __decorate([
    (0, common_1.Controller)('tenant'),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService,
        auth_service_1.AuthService,
        prisma_service_1.PrismaService])
], TenantController);
//# sourceMappingURL=tenant.controller.js.map