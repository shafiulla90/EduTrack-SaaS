"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintBoxModule = void 0;
const common_1 = require("@nestjs/common");
const complaint_box_service_1 = require("./complaint-box.service");
const complaint_box_controller_1 = require("./complaint-box.controller");
const database_provider_module_1 = require("../../database/database-provider.module");
let ComplaintBoxModule = class ComplaintBoxModule {
};
exports.ComplaintBoxModule = ComplaintBoxModule;
exports.ComplaintBoxModule = ComplaintBoxModule = __decorate([
    (0, common_1.Module)({
        imports: [database_provider_module_1.DatabaseProviderModule],
        controllers: [complaint_box_controller_1.ComplaintBoxController],
        providers: [complaint_box_service_1.ComplaintBoxService],
        exports: [complaint_box_service_1.ComplaintBoxService],
    })
], ComplaintBoxModule);
//# sourceMappingURL=complaint-box.module.js.map