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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityLogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const tenant_context_1 = require("../tenants/tenant.context");
let ActivityLogService = class ActivityLogService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getTenantId() {
        const tenantId = tenant_context_1.TenantContext.getTenantId();
        if (!tenantId) {
            throw new common_1.BadRequestException('No active school tenant context found for logging');
        }
        return tenantId;
    }
    async logActivity(userId, action, entityName, entityId, details) {
        const tenantId = this.getTenantId();
        return this.prisma.activityLog.create({
            data: {
                userId,
                action,
                entityName,
                entityId: entityId || null,
                details: details || null,
                tenantId,
            },
        });
    }
    async getLogs(userId, action, entityName) {
        const tenantId = this.getTenantId();
        return this.prisma.activityLog.findMany({
            where: {
                tenantId,
                ...(userId ? { userId } : {}),
                ...(action ? { action } : {}),
                ...(entityName ? { entityName } : {}),
            },
            include: {
                user: {
                    select: { name: true, email: true, role: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 1000,
        });
    }
};
exports.ActivityLogService = ActivityLogService;
exports.ActivityLogService = ActivityLogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ActivityLogService);
//# sourceMappingURL=activity-log.service.js.map