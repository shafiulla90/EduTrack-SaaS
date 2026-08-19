"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamConfigModule = void 0;
const common_1 = require("@nestjs/common");
const exam_config_service_1 = require("./exam-config.service");
const exam_config_controller_1 = require("./exam-config.controller");
const prisma_service_1 = require("../prisma.service");
let ExamConfigModule = class ExamConfigModule {
};
exports.ExamConfigModule = ExamConfigModule;
exports.ExamConfigModule = ExamConfigModule = __decorate([
    (0, common_1.Module)({
        controllers: [exam_config_controller_1.ExamConfigController],
        providers: [exam_config_service_1.ExamConfigService, prisma_service_1.PrismaService],
        exports: [exam_config_service_1.ExamConfigService],
    })
], ExamConfigModule);
//# sourceMappingURL=exam-config.module.js.map