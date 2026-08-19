"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolSetupModule = void 0;
const common_1 = require("@nestjs/common");
const school_setup_service_1 = require("./school-setup.service");
const school_setup_controller_1 = require("./school-setup.controller");
const database_provider_module_1 = require("../../database/database-provider.module");
let SchoolSetupModule = class SchoolSetupModule {
};
exports.SchoolSetupModule = SchoolSetupModule;
exports.SchoolSetupModule = SchoolSetupModule = __decorate([
    (0, common_1.Module)({
        imports: [database_provider_module_1.DatabaseProviderModule],
        controllers: [school_setup_controller_1.SchoolSetupController],
        providers: [school_setup_service_1.SchoolSetupService],
        exports: [school_setup_service_1.SchoolSetupService],
    })
], SchoolSetupModule);
//# sourceMappingURL=school-setup.module.js.map