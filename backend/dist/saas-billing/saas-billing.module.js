"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaaSBillingModule = void 0;
const common_1 = require("@nestjs/common");
const saas_billing_service_1 = require("./saas-billing.service");
const saas_billing_controller_1 = require("./saas-billing.controller");
const prisma_service_1 = require("../prisma.service");
let SaaSBillingModule = class SaaSBillingModule {
};
exports.SaaSBillingModule = SaaSBillingModule;
exports.SaaSBillingModule = SaaSBillingModule = __decorate([
    (0, common_1.Module)({
        controllers: [saas_billing_controller_1.SaaSBillingController],
        providers: [saas_billing_service_1.SaaSBillingService, prisma_service_1.PrismaService],
        exports: [saas_billing_service_1.SaaSBillingService],
    })
], SaaSBillingModule);
//# sourceMappingURL=saas-billing.module.js.map