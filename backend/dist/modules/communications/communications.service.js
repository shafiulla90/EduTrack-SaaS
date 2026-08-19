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
exports.CommunicationsService = void 0;
const common_1 = require("@nestjs/common");
let CommunicationsService = class CommunicationsService {
    constructor(opsRepo, tenantRepo) {
        this.opsRepo = opsRepo;
        this.tenantRepo = tenantRepo;
    }
    async sendNotification(data) {
        return this.opsRepo.createNotification({
            title: data.title,
            message: data.message,
            type: data.type || 'IN_APP',
            recipientId: data.recipientId || 'user-active',
            isRead: false,
            createdAt: new Date().toISOString(),
        });
    }
    async getNotifications(recipientId) {
        const list = await this.opsRepo.findNotificationsByUser(recipientId || 'user-active');
        return list || [];
    }
    async markAsRead(id) {
        return this.opsRepo.markNotificationRead(id);
    }
    async deleteNotification(id) {
        return { success: true, id };
    }
    async clearReadNotifications(recipientId) {
        return { success: true, recipientId };
    }
};
exports.CommunicationsService = CommunicationsService;
exports.CommunicationsService = CommunicationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IOperationsRepository')),
    __param(1, (0, common_1.Inject)('ITenantRepository')),
    __metadata("design:paramtypes", [Object, Object])
], CommunicationsService);
//# sourceMappingURL=communications.service.js.map