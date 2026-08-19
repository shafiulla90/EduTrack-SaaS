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
exports.CreateSupportRequestDto = void 0;
const class_validator_1 = require("class-validator");
class CreateSupportRequestDto {
}
exports.CreateSupportRequestDto = CreateSupportRequestDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Full Name is required' }),
    __metadata("design:type", String)
], CreateSupportRequestDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'School Name is required' }),
    __metadata("design:type", String)
], CreateSupportRequestDto.prototype, "schoolName", void 0);
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Invalid email address' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email address is required' }),
    __metadata("design:type", String)
], CreateSupportRequestDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Mobile number is required' }),
    (0, class_validator_1.Matches)(/^[0-9]{10,15}$/, { message: 'Phone number must be between 10 and 15 digits' }),
    __metadata("design:type", String)
], CreateSupportRequestDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Subject is required' }),
    __metadata("design:type", String)
], CreateSupportRequestDto.prototype, "subject", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Message is required' }),
    (0, class_validator_1.MinLength)(20, { message: 'Message must be at least 20 characters' }),
    (0, class_validator_1.MaxLength)(2000, { message: 'Message cannot exceed 2000 characters' }),
    __metadata("design:type", String)
], CreateSupportRequestDto.prototype, "message", void 0);
//# sourceMappingURL=create-support-request.dto.js.map