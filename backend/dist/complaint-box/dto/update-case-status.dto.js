"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCaseStatusDto = exports.ComplaintStatusEnum = void 0;
const class_validator_1 = require("class-validator");
var ComplaintStatusEnum;
(function (ComplaintStatusEnum) {
    ComplaintStatusEnum["NEW"] = "New";
    ComplaintStatusEnum["IN_PROGRESS"] = "In Progress";
    ComplaintStatusEnum["CLOSED"] = "Closed";
})(ComplaintStatusEnum || (exports.ComplaintStatusEnum = ComplaintStatusEnum = {}));
class UpdateCaseStatusDto {
}
exports.UpdateCaseStatusDto = UpdateCaseStatusDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(ComplaintStatusEnum),
    __metadata("design:type", String)
], UpdateCaseStatusDto.prototype, "status", void 0);
//# sourceMappingURL=update-case-status.dto.js.map