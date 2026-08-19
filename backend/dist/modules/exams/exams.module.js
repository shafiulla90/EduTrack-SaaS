"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamsModule = void 0;
const common_1 = require("@nestjs/common");
const exams_service_1 = require("./exams.service");
const exams_controller_1 = require("./exams.controller");
const teacher_portal_controller_1 = require("./teacher-portal.controller");
const database_provider_module_1 = require("../../database/database-provider.module");
let ExamsModule = class ExamsModule {
};
exports.ExamsModule = ExamsModule;
exports.ExamsModule = ExamsModule = __decorate([
    (0, common_1.Module)({
        imports: [database_provider_module_1.DatabaseProviderModule],
        controllers: [exams_controller_1.ExamsController, teacher_portal_controller_1.TeacherPortalController, teacher_portal_controller_1.ExamConfigController],
        providers: [exams_service_1.ExamsService],
        exports: [exams_service_1.ExamsService],
    })
], ExamsModule);
//# sourceMappingURL=exams.module.js.map