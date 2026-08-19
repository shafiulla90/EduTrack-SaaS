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
exports.TransportController = void 0;
const common_1 = require("@nestjs/common");
const transport_service_1 = require("./transport.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let TransportController = class TransportController {
    constructor(transportService) {
        this.transportService = transportService;
    }
    async getBuses(req) {
        return this.transportService.getBuses(req.user.tenantId);
    }
    async createBus(req, dto) {
        return this.transportService.createBus(req.user.tenantId, dto);
    }
    async updateBus(req, id, dto) {
        return this.transportService.updateBus(req.user.tenantId, id, dto);
    }
    async deleteBus(req, id) {
        return this.transportService.deleteBus(req.user.tenantId, id);
    }
    async getDrivers(req) {
        return this.transportService.getDrivers(req.user.tenantId);
    }
    async createDriver(req, dto) {
        return this.transportService.createDriver(req.user.tenantId, dto);
    }
    async updateDriver(req, id, dto) {
        return this.transportService.updateDriver(req.user.tenantId, id, dto);
    }
    async deleteDriver(req, id) {
        return this.transportService.deleteDriver(req.user.tenantId, id);
    }
    async getRoutes(req) {
        return this.transportService.getRoutes(req.user.tenantId);
    }
    async createRoute(req, dto) {
        return this.transportService.createRoute(req.user.tenantId, dto);
    }
    async addBusStop(req, routeId, dto) {
        return this.transportService.addBusStop(req.user.tenantId, routeId, dto);
    }
    async deleteBusStop(req, stopId) {
        return this.transportService.deleteBusStop(req.user.tenantId, stopId);
    }
    async getStudentAssignments(req) {
        return this.transportService.getStudentAssignments(req.user.tenantId);
    }
    async assignStudentBus(req, dto) {
        return this.transportService.assignStudentBus(req.user.tenantId, dto);
    }
    async getAdminDashboard(req) {
        return this.transportService.getAdminDashboard(req.user.tenantId);
    }
    async getTripHistory(req) {
        return this.transportService.getTripHistory(req.user.tenantId);
    }
    async getDriverAssignedBus(req) {
        const userId = req.user.id || req.user.userId || req.user.sub;
        return this.transportService.getDriverAssignedBus(userId, req.user.tenantId);
    }
    async updateDriverDuty(req, dutyStatus) {
        const userId = req.user.id || req.user.userId || req.user.sub;
        return this.transportService.updateDriverDuty(userId, req.user.tenantId, dutyStatus);
    }
    async processDriverGps(req, gpsData) {
        const userId = req.user.id || req.user.userId || req.user.sub;
        console.log(`[Backend GPS Controller] Received GPS ping from userId=${userId}:`, gpsData);
        return this.transportService.processDriverGps(userId, req.user.tenantId, gpsData);
    }
    async getParentStudentTransport(req, studentId) {
        const parentUserId = req.user.id || req.user.userId || req.user.sub;
        console.log(`[Backend Parent Portal Controller] Fetching transport info for studentId=${studentId}, parentUserId=${parentUserId}`);
        return this.transportService.getParentStudentTransport(studentId, parentUserId, req.user.tenantId);
    }
};
exports.TransportController = TransportController;
__decorate([
    (0, common_1.Get)('buses'),
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.STAFF),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransportController.prototype, "getBuses", null);
__decorate([
    (0, common_1.Post)('buses'),
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TransportController.prototype, "createBus", null);
__decorate([
    (0, common_1.Patch)('buses/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TransportController.prototype, "updateBus", null);
__decorate([
    (0, common_1.Delete)('buses/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TransportController.prototype, "deleteBus", null);
__decorate([
    (0, common_1.Get)('drivers'),
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.STAFF),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransportController.prototype, "getDrivers", null);
__decorate([
    (0, common_1.Post)('drivers'),
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TransportController.prototype, "createDriver", null);
__decorate([
    (0, common_1.Patch)('drivers/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TransportController.prototype, "updateDriver", null);
__decorate([
    (0, common_1.Delete)('drivers/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TransportController.prototype, "deleteDriver", null);
__decorate([
    (0, common_1.Get)('routes'),
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.STAFF),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransportController.prototype, "getRoutes", null);
__decorate([
    (0, common_1.Post)('routes'),
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TransportController.prototype, "createRoute", null);
__decorate([
    (0, common_1.Post)('routes/:id/stops'),
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], TransportController.prototype, "addBusStop", null);
__decorate([
    (0, common_1.Delete)('stops/:id'),
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TransportController.prototype, "deleteBusStop", null);
__decorate([
    (0, common_1.Get)('students/assignments'),
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.STAFF),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransportController.prototype, "getStudentAssignments", null);
__decorate([
    (0, common_1.Post)('students/assign'),
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TransportController.prototype, "assignStudentBus", null);
__decorate([
    (0, common_1.Get)('admin/dashboard'),
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.STAFF),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransportController.prototype, "getAdminDashboard", null);
__decorate([
    (0, common_1.Get)('trip-history'),
    (0, roles_decorator_1.Roles)(client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN, client_1.Role.STAFF),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransportController.prototype, "getTripHistory", null);
__decorate([
    (0, common_1.Get)('driver/assigned-bus'),
    (0, roles_decorator_1.Roles)(client_1.Role.DRIVER, client_1.Role.STAFF, client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TransportController.prototype, "getDriverAssignedBus", null);
__decorate([
    (0, common_1.Post)('driver/duty'),
    (0, roles_decorator_1.Roles)(client_1.Role.DRIVER, client_1.Role.STAFF, client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('dutyStatus')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TransportController.prototype, "updateDriverDuty", null);
__decorate([
    (0, common_1.Post)('driver/gps'),
    (0, roles_decorator_1.Roles)(client_1.Role.DRIVER, client_1.Role.STAFF, client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], TransportController.prototype, "processDriverGps", null);
__decorate([
    (0, common_1.Get)('parent-portal/children/:studentId'),
    (0, roles_decorator_1.Roles)(client_1.Role.PARENT, client_1.Role.SCHOOL_ADMIN, client_1.Role.SUPER_ADMIN),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], TransportController.prototype, "getParentStudentTransport", null);
exports.TransportController = TransportController = __decorate([
    (0, common_1.Controller)('transport'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [transport_service_1.TransportService])
], TransportController);
//# sourceMappingURL=transport.controller.js.map