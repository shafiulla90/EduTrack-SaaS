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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const dashboard_service_1 = require("./dashboard.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let DashboardController = class DashboardController {
    constructor(dashboardService) {
        this.dashboardService = dashboardService;
    }
    async getDashboardSummary() {
        return this.dashboardService.getDashboardSummary();
    }
    async getReportsSummary(req) {
        return this.dashboardService.getReportsSummary(req.user.sub, req.user.role);
    }
    async getDemographicsReport(req) {
        return this.dashboardService.getDemographicsReport(req.user.sub, req.user.role);
    }
    async getCashflowsReport(req) {
        return this.dashboardService.getCashflowsReport(req.user.sub, req.user.role);
    }
    async getGradingReport(req) {
        return this.dashboardService.getGradingReport(req.user.sub, req.user.role);
    }
    async getPlatformMetrics() {
        return this.dashboardService.getPlatformMetrics();
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN),
    (0, common_1.Get)('summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getDashboardSummary", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.TEACHER),
    (0, common_1.Get)('reports'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getReportsSummary", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.TEACHER),
    (0, common_1.Get)('reports/demographics'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getDemographicsReport", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.TEACHER),
    (0, common_1.Get)('reports/cashflows'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getCashflowsReport", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.TEACHER),
    (0, common_1.Get)('reports/grading'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getGradingReport", null);
__decorate([
    (0, roles_decorator_1.Roles)(client_1.Role.SUPER_ADMIN),
    (0, common_1.Get)('platform/metrics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getPlatformMetrics", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('dashboard'),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map