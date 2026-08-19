"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamScheduleModule = void 0;
const common_1 = require("@nestjs/common");
const exam_schedule_service_1 = require("./exam-schedule.service");
const exam_schedule_controller_1 = require("./exam-schedule.controller");
const prisma_service_1 = require("../prisma.service");
const communications_module_1 = require("../communications/communications.module");
let ExamScheduleModule = class ExamScheduleModule {
};
exports.ExamScheduleModule = ExamScheduleModule;
exports.ExamScheduleModule = ExamScheduleModule = __decorate([
    (0, common_1.Module)({
        imports: [communications_module_1.CommunicationsModule],
        controllers: [exam_schedule_controller_1.ExamScheduleController],
        providers: [exam_schedule_service_1.ExamScheduleService, prisma_service_1.PrismaService],
        exports: [exam_schedule_service_1.ExamScheduleService],
    })
], ExamScheduleModule);
//# sourceMappingURL=exam-schedule.module.js.map