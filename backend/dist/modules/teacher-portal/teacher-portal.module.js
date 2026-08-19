"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherPortalModule = void 0;
const common_1 = require("@nestjs/common");
const teacher_portal_service_1 = require("./teacher-portal.service");
const teacher_portal_controller_1 = require("./teacher-portal.controller");
const database_provider_module_1 = require("../../database/database-provider.module");
let TeacherPortalModule = class TeacherPortalModule {
};
exports.TeacherPortalModule = TeacherPortalModule;
exports.TeacherPortalModule = TeacherPortalModule = __decorate([
    (0, common_1.Module)({
        imports: [database_provider_module_1.DatabaseProviderModule],
        controllers: [teacher_portal_controller_1.TeacherPortalController],
        providers: [teacher_portal_service_1.TeacherPortalService],
        exports: [teacher_portal_service_1.TeacherPortalService],
    })
], TeacherPortalModule);
//# sourceMappingURL=teacher-portal.module.js.map