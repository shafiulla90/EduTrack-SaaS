"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsModule = void 0;
const common_1 = require("@nestjs/common");
const tenants_service_1 = require("./tenants.service");
const tenants_controller_1 = require("./tenants.controller");
const tenant_controller_1 = require("./tenant.controller");
const school_setup_controller_1 = require("./school-setup.controller");
const super_admin_controller_1 = require("./super-admin.controller");
const prisma_service_1 = require("../prisma.service");
const auth_module_1 = require("../auth/auth.module");
const subscription_scheduler_service_1 = require("./subscription-scheduler.service");
const payment_service_1 = require("../common/services/payment.service");
const subscription_module_1 = require("../subscription/subscription.module");
const saas_billing_module_1 = require("../saas-billing/saas-billing.module");
let TenantsModule = class TenantsModule {
};
exports.TenantsModule = TenantsModule;
exports.TenantsModule = TenantsModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, subscription_module_1.SubscriptionModule, saas_billing_module_1.SaaSBillingModule],
        providers: [tenants_service_1.TenantsService, prisma_service_1.PrismaService, subscription_scheduler_service_1.SubscriptionSchedulerService, payment_service_1.PaymentService],
        controllers: [tenants_controller_1.TenantsController, tenant_controller_1.TenantController, school_setup_controller_1.SchoolSetupController, super_admin_controller_1.SuperAdminController],
        exports: [tenants_service_1.TenantsService, payment_service_1.PaymentService],
    })
], TenantsModule);
//# sourceMappingURL=tenants.module.js.map