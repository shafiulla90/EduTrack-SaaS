"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentSettingsModule = void 0;
const common_1 = require("@nestjs/common");
const payment_settings_service_1 = require("./payment-settings.service");
const payment_settings_controller_1 = require("./payment-settings.controller");
const prisma_service_1 = require("../prisma.service");
let PaymentSettingsModule = class PaymentSettingsModule {
};
exports.PaymentSettingsModule = PaymentSettingsModule;
exports.PaymentSettingsModule = PaymentSettingsModule = __decorate([
    (0, common_1.Module)({
        controllers: [payment_settings_controller_1.PaymentSettingsController],
        providers: [payment_settings_service_1.PaymentSettingsService, prisma_service_1.PrismaService],
        exports: [payment_settings_service_1.PaymentSettingsService],
    })
], PaymentSettingsModule);
//# sourceMappingURL=payment-settings.module.js.map