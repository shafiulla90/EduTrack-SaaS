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
exports.TenantMiddleware = void 0;
const common_1 = require("@nestjs/common");
const tenants_service_1 = require("./tenants.service");
const tenant_context_1 = require("./tenant.context");
let TenantMiddleware = class TenantMiddleware {
    constructor(tenantsService) {
        this.tenantsService = tenantsService;
    }
    async use(req, res, next) {
        let tenantSubdomain = '';
        const headerTenant = req.headers['x-tenant-id'] || req.headers['X-Tenant-ID'];
        if (headerTenant) {
            tenantSubdomain = String(headerTenant).trim();
        }
        else {
            const hostname = req.hostname;
            if (hostname === 'edutrack.covenantsynergy.in' || hostname === 'api-edutrack.covenantsynergy.in') {
                tenantSubdomain = '';
            }
            else if (hostname.endsWith('.edutrack.covenantsynergy.in')) {
                const parts = hostname.replace('.edutrack.covenantsynergy.in', '').split('.');
                const sub = parts[parts.length - 1];
                if (sub !== 'www' && sub !== 'api') {
                    tenantSubdomain = sub;
                }
            }
            else if (hostname === 'edutrack.com' || hostname === 'www.edutrack.com' || hostname === 'app.edutrack.com') {
                tenantSubdomain = '';
            }
            else if (hostname.endsWith('.edutrack.com')) {
                const parts = hostname.replace('.edutrack.com', '').split('.');
                const sub = parts[parts.length - 1];
                if (sub !== 'www' && sub !== 'api' && sub !== 'app') {
                    tenantSubdomain = sub;
                }
            }
            else if (hostname.endsWith('.vercel.app')) {
                const parts = hostname.replace('.vercel.app', '').split('.');
                if (parts.length > 1 && parts[0] !== 'www') {
                    tenantSubdomain = parts[0];
                }
            }
            else {
                const parts = hostname.split('.');
                if (parts.length > 1 && parts[0] !== 'localhost' && parts[0] !== 'www' && isNaN(Number(parts[0]))) {
                    tenantSubdomain = parts[0];
                }
            }
        }
        if (!tenantSubdomain && req.query.tenant) {
            tenantSubdomain = String(req.query.tenant).trim();
        }
        if (!tenantSubdomain) {
            next();
            return;
        }
        try {
            const tenant = await this.tenantsService.findBySubdomain(tenantSubdomain);
            tenant_context_1.TenantContext.run(tenant.id, () => {
                req['tenantId'] = tenant.id;
                next();
            });
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                try {
                    const tenant = await this.tenantsService.findById(tenantSubdomain);
                    tenant_context_1.TenantContext.run(tenant.id, () => {
                        req['tenantId'] = tenant.id;
                        next();
                    });
                    return;
                }
                catch (e) {
                    const isPublicAuthRoute = req.path.startsWith('/auth/') || req.path.startsWith('/tenant/public-branding');
                    if (isPublicAuthRoute) {
                        next();
                        return;
                    }
                }
            }
            const isPublicAuthRoute = req.path.startsWith('/auth/') || req.path.startsWith('/tenant/public-branding');
            if (isPublicAuthRoute) {
                next();
                return;
            }
            throw new common_1.BadRequestException(`Tenant resolution failed: ${error.message}`);
        }
    }
};
exports.TenantMiddleware = TenantMiddleware;
exports.TenantMiddleware = TenantMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tenants_service_1.TenantsService])
], TenantMiddleware);
//# sourceMappingURL=tenant.middleware.js.map