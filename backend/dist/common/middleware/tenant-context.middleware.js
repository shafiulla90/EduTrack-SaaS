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
exports.TenantContextMiddleware = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
let TenantContextMiddleware = class TenantContextMiddleware {
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    use(req, res, next) {
        let userPayload = null;
        const authHeader = req.headers.authorization || req.headers.Authorization;
        if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7).trim();
            try {
                userPayload = this.jwtService.decode(token);
            }
            catch (err) {
                console.warn('TenantContextMiddleware JWT decode warning:', err);
            }
        }
        const headerTenantId = req.headers['x-tenant-id'];
        const resolvedTenantId = userPayload?.tenantId ||
            (headerTenantId && headerTenantId !== 'undefined' && headerTenantId !== 'null' ? headerTenantId : null);
        if (userPayload) {
            req.user = {
                ...userPayload,
                tenantId: userPayload.tenantId || resolvedTenantId,
            };
        }
        else if (resolvedTenantId) {
            req.user = {
                id: 'user-header',
                tenantId: resolvedTenantId,
                role: 'SCHOOL_ADMIN',
            };
        }
        req.tenantId = resolvedTenantId;
        next();
    }
};
exports.TenantContextMiddleware = TenantContextMiddleware;
exports.TenantContextMiddleware = TenantContextMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], TenantContextMiddleware);
//# sourceMappingURL=tenant-context.middleware.js.map