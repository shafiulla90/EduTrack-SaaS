"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationsModule = void 0;
const common_1 = require("@nestjs/common");
const communications_service_1 = require("./communications.service");
const communications_controller_1 = require("./communications.controller");
const database_provider_module_1 = require("../../database/database-provider.module");
let CommunicationsModule = class CommunicationsModule {
};
exports.CommunicationsModule = CommunicationsModule;
exports.CommunicationsModule = CommunicationsModule = __decorate([
    (0, common_1.Module)({
        imports: [database_provider_module_1.DatabaseProviderModule],
        controllers: [communications_controller_1.CommunicationsController],
        providers: [communications_service_1.CommunicationsService],
        exports: [communications_service_1.CommunicationsService],
    })
], CommunicationsModule);
//# sourceMappingURL=communications.module.js.map