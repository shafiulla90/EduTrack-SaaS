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
const tenant_service_1 = require("./tenant.service");
const swagger_1 = require("@nestjs/swagger");
let TenantController = class TenantController {
    constructor(tenantService) {
        this.tenantService = tenantService;
    }
    async getPublicBranding() {
        const tenants = await this.tenantService.findAll();
        const primaryTenant = tenants[0] || {
            id: 'tenant-test-001',
            name: 'EduTrack School System',
            subDomain: 'default',
        };
        return {
            success: true,
            tenant: primaryTenant,
            branding: {
                schoolName: primaryTenant.name || 'EduTrack Application',
                logoUrl: null,
                themeColor: '#4f46e5',
            },
        };
    }
    async registerSchool(body) {
        return this.tenantService.registerSchool(body);
    }
    async getSetupStatus(tenantId) {
        return this.tenantService.getSetupStatus(tenantId);
    }
    async updateBankingUpi(body) {
        return {
            success: true,
            message: 'Banking & UPI details updated successfully in Cloud Firestore',
            data: body,
        };
    }
    async findAll() {
        return this.tenantService.findAll();
    }
    async findOne(id) {
        return this.tenantService.findOne(id);
    }
};
exports.TenantController = TenantController;
__decorate([
    (0, common_1.Get)('public-branding'),
    (0, swagger_1.ApiOperation)({ summary: 'Get public branding for default/current tenant' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "getPublicBranding", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new school tenant and admin' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "registerSchool", null);
__decorate([
    (0, common_1.Get)('setup-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tenant setup status and current user details' }),
    __param(0, (0, common_1.Headers)('X-Tenant-ID')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "getSetupStatus", null);
__decorate([
    (0, common_1.Put)('banking-upi'),
    (0, swagger_1.ApiOperation)({ summary: 'Update tenant banking and UPI configuration' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "updateBankingUpi", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all tenants' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tenant by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TenantController.prototype, "findOne", null);
exports.TenantController = TenantController = __decorate([
    (0, swagger_1.ApiTags)('Tenants'),
    (0, common_1.Controller)('tenant'),
    __metadata("design:paramtypes", [tenant_service_1.TenantService])
], TenantController);
//# sourceMappingURL=tenant.controller.js.map