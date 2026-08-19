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
exports.SubscriptionGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
let SubscriptionGuard = class SubscriptionGuard {
    constructor(reflector, subRepo) {
        this.reflector = reflector;
        this.subRepo = subRepo;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || user.role === 'SUPER_ADMIN') {
            return true;
        }
        const path = request.route?.path || request.path || '';
        if (path.includes('/api/subscription') ||
            path.includes('/api/payment') ||
            path.includes('/api/auth')) {
            return true;
        }
        const tenantId = user.tenantId;
        if (!tenantId)
            return true;
        const sub = await this.subRepo.findActiveSubscription(tenantId);
        if (sub && sub.status === 'EXPIRED') {
            throw new common_1.ForbiddenException('Tenant subscription is expired. Please renew to access this resource.');
        }
        return true;
    }
};
exports.SubscriptionGuard = SubscriptionGuard;
exports.SubscriptionGuard = SubscriptionGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('ISubscriptionRepository')),
    __metadata("design:paramtypes", [core_1.Reflector, Object])
], SubscriptionGuard);
//# sourceMappingURL=subscription.guard.js.map