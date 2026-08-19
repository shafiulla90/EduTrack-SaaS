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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationsController = void 0;
const common_1 = require("@nestjs/common");
const communications_service_1 = require("./communications.service");
const swagger_1 = require("@nestjs/swagger");
let CommunicationsController = class CommunicationsController {
    constructor(communicationsService) {
        this.communicationsService = communicationsService;
    }
    async send(data) {
        return this.communicationsService.sendNotification(data);
    }
    async getUserNotifications() {
        return this.communicationsService.getNotifications('user-active');
    }
    async getForUser(recipientId) {
        return this.communicationsService.getNotifications(recipientId);
    }
    async read(id) {
        return this.communicationsService.markAsRead(id);
    }
    async deleteNotification(id) {
        return this.communicationsService.deleteNotification(id);
    }
    async clearReadNotifications(recipientId) {
        return this.communicationsService.clearReadNotifications(recipientId);
    }
};
exports.CommunicationsController = CommunicationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Send a new notification' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "send", null);
__decorate([
    (0, common_1.Get)('user-notifications'),
    (0, swagger_1.ApiOperation)({ summary: 'Get notifications for current active user' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "getUserNotifications", null);
__decorate([
    (0, common_1.Get)('user/:recipientId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get notifications for user' }),
    __param(0, (0, common_1.Param)('recipientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "getForUser", null);
__decorate([
    (0, common_1.Post)(':id/read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark notification as read' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "read", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a notification' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "deleteNotification", null);
__decorate([
    (0, common_1.Post)('clear-read/:recipientId'),
    (0, swagger_1.ApiOperation)({ summary: 'Clear read notifications' }),
    __param(0, (0, common_1.Param)('recipientId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CommunicationsController.prototype, "clearReadNotifications", null);
exports.CommunicationsController = CommunicationsController = __decorate([
    (0, swagger_1.ApiTags)('Communications'),
    (0, common_1.Controller)('communications'),
    __metadata("design:paramtypes", [communications_service_1.CommunicationsService])
], CommunicationsController);
//# sourceMappingURL=communications.controller.js.map