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
exports.SchoolSetupService = void 0;
const common_1 = require("@nestjs/common");
let SchoolSetupService = class SchoolSetupService {
    constructor(tenantRepo) {
        this.tenantRepo = tenantRepo;
    }
    async getSchoolSetup(tenantId) {
        const tenants = await this.tenantRepo.findAll();
        const tenant = tenants.find((t) => t.id === tenantId) || tenants[0] || {
            id: 'tenant-test-001',
            name: 'A.P. Greenwood High School',
            schoolType: 'School',
            adminName: 'School Administrator',
            email: 'apgreenwoodschool@gmail.com',
            helpDeskPhone: '9642402639',
            subDomain: 'apgreenwoodschool',
        };
        return {
            success: true,
            id: tenant.id,
            schoolName: tenant.name || 'A.P. Greenwood High School',
            schoolType: tenant.schoolType || 'School',
            adminName: tenant.adminName || 'School Administrator',
            email: tenant.email || 'apgreenwoodschool@gmail.com',
            helpDeskPhone: tenant.helpDeskPhone || tenant.adminPhone || '9642402639',
            address: tenant.address || 'Greenwood Campus',
            subDomain: tenant.subDomain || 'apgreenwoodschool',
            schoolLogo: tenant.logoUrl || null,
            adminPhoto: tenant.adminPhoto || null,
        };
    }
    async updateSchoolSetup(data, tenantId) {
        const tenants = await this.tenantRepo.findAll();
        const primaryTenant = tenants.find((t) => t.id === tenantId) || tenants[0];
        const idToUpdate = primaryTenant ? primaryTenant.id : 'tenant-test-001';
        const updatePayload = {};
        if (data.schoolName || data.name)
            updatePayload.name = data.schoolName || data.name;
        if (data.schoolType)
            updatePayload.schoolType = data.schoolType;
        if (data.adminName)
            updatePayload.adminName = data.adminName;
        if (data.email)
            updatePayload.email = data.email;
        if (data.helpDeskPhone || data.mobileNumber)
            updatePayload.helpDeskPhone = data.helpDeskPhone || data.mobileNumber;
        if (data.address)
            updatePayload.address = data.address;
        if (data.schoolLogo || data.logoUrl)
            updatePayload.logoUrl = data.schoolLogo || data.logoUrl;
        if (data.adminPhoto)
            updatePayload.adminPhoto = data.adminPhoto;
        if (data.subdomain)
            updatePayload.subDomain = data.subdomain;
        if (data.title)
            updatePayload.title = data.title;
        updatePayload.updatedAt = new Date().toISOString();
        const updated = await this.tenantRepo.update(idToUpdate, updatePayload);
        return {
            success: true,
            message: 'School setup updated successfully in Cloud Firestore',
            setup: updated,
        };
    }
};
exports.SchoolSetupService = SchoolSetupService;
exports.SchoolSetupService = SchoolSetupService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('ITenantRepository')),
    __metadata("design:paramtypes", [Object])
], SchoolSetupService);
//# sourceMappingURL=school-setup.service.js.map