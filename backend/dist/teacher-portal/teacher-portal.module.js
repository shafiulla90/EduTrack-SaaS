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
const teacher_portal_controller_1 = require("./teacher-portal.controller");
const teacher_portal_service_1 = require("./teacher-portal.service");
const prisma_service_1 = require("../prisma.service");
const attendance_module_1 = require("../attendance/attendance.module");
const exams_module_1 = require("../exams/exams.module");
let TeacherPortalModule = class TeacherPortalModule {
};
exports.TeacherPortalModule = TeacherPortalModule;
exports.TeacherPortalModule = TeacherPortalModule = __decorate([
    (0, common_1.Module)({
        imports: [attendance_module_1.AttendanceModule, exams_module_1.ExamsModule],
        controllers: [teacher_portal_controller_1.TeacherPortalController],
        providers: [
            teacher_portal_service_1.TeacherPortalService,
            prisma_service_1.PrismaService,
        ],
    })
], TeacherPortalModule);
//# sourceMappingURL=teacher-portal.module.js.map