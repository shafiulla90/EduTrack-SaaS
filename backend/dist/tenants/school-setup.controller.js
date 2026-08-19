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
exports.SchoolSetupController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let SchoolSetupController = class SchoolSetupController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async updateSetup(req, body) {
        const tenantId = req.user.tenantId;
        const allowedFields = [
            'schoolName',
            'schoolType',
            'adminName',
            'mobileNumber',
            'email',
            'address',
            'academicYear',
            'principalName',
            'country',
            'state',
            'district',
            'city',
            'postalCode',
            'schoolLogo',
        ];
        const updateData = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }
        if (body.subdomain) {
            const cleanSubdomain = String(body.subdomain).trim().toLowerCase().replace(/[^a-z0-9\-]/g, '');
            if (!cleanSubdomain) {
                throw new common_1.BadRequestException('Subdomain must contain alphanumeric characters or hyphens');
            }
            const existing = await this.prisma.tenant.findFirst({
                where: {
                    subDomain: cleanSubdomain,
                    NOT: { id: tenantId }
                }
            });
            if (existing) {
                throw new common_1.BadRequestException('This school subdomain is already in use.');
            }
            await this.prisma.tenant.update({
                where: { id: tenantId },
                data: { subDomain: cleanSubdomain }
            });
        }
        const setup = await this.prisma.schoolSetup.upsert({
            where: { tenantId },
            update: updateData,
            create: {
                tenantId,
                schoolName: updateData.schoolName || '',
                schoolType: updateData.schoolType || 'School',
                adminName: updateData.adminName || '',
                mobileNumber: updateData.mobileNumber || '',
                email: updateData.email || '',
                address: updateData.address || '',
                academicYear: updateData.academicYear || '',
                ...updateData,
            },
        });
        const checkFields = [
            setup.schoolName, setup.schoolType, setup.adminName, setup.mobileNumber,
            setup.email, setup.address, setup.academicYear, setup.principalName,
            setup.country, setup.state, setup.district, setup.city, setup.postalCode
        ];
        const isCompleted = checkFields.every((val) => val && String(val).trim() !== '');
        if (isCompleted) {
            await this.prisma.schoolSetup.update({
                where: { tenantId },
                data: { isCompleted: true },
            });
            await this.prisma.tenant.update({
                where: { id: tenantId },
                data: { setupCompleted: true },
            });
        }
        else {
            await this.prisma.schoolSetup.update({
                where: { tenantId },
                data: { isCompleted: false },
            });
            await this.prisma.tenant.update({
                where: { id: tenantId },
                data: { setupCompleted: false },
            });
        }
        await this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                name: setup.schoolName,
                address: setup.address,
                email: setup.email,
                phone: setup.mobileNumber,
                logoUrl: setup.schoolLogo,
                subtitle: setup.schoolType,
            },
        });
        if (setup.adminName) {
            await this.prisma.user.updateMany({
                where: {
                    tenantId,
                    role: 'SCHOOL_ADMIN',
                },
                data: {
                    name: setup.adminName,
                },
            });
        }
        if (body.adminAvatarUrl !== undefined) {
            await this.prisma.user.updateMany({
                where: {
                    tenantId,
                    role: 'SCHOOL_ADMIN',
                },
                data: {
                    avatarUrl: body.adminAvatarUrl,
                },
            });
        }
        return {
            success: true,
            message: 'School setup updated successfully',
            setup,
        };
    }
};
exports.SchoolSetupController = SchoolSetupController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Put)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SchoolSetupController.prototype, "updateSetup", null);
exports.SchoolSetupController = SchoolSetupController = __decorate([
    (0, common_1.Controller)('school-setup'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SchoolSetupController);
//# sourceMappingURL=school-setup.controller.js.map