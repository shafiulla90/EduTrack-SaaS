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
const school_setup_service_1 = require("./school-setup.service");
const swagger_1 = require("@nestjs/swagger");
let SchoolSetupController = class SchoolSetupController {
    constructor(schoolSetupService) {
        this.schoolSetupService = schoolSetupService;
    }
    async getSetup(tenantId) {
        return this.schoolSetupService.getSchoolSetup(tenantId);
    }
    async updateSetup(body, tenantId) {
        return this.schoolSetupService.updateSchoolSetup(body, tenantId);
    }
};
exports.SchoolSetupController = SchoolSetupController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get school setup configuration' }),
    __param(0, (0, common_1.Headers)('X-Tenant-ID')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SchoolSetupController.prototype, "getSetup", null);
__decorate([
    (0, common_1.Put)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update school setup configuration' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('X-Tenant-ID')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SchoolSetupController.prototype, "updateSetup", null);
exports.SchoolSetupController = SchoolSetupController = __decorate([
    (0, swagger_1.ApiTags)('School Setup'),
    (0, common_1.Controller)('school-setup'),
    __metadata("design:paramtypes", [school_setup_service_1.SchoolSetupService])
], SchoolSetupController);
//# sourceMappingURL=school-setup.controller.js.map