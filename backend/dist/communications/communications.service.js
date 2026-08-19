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
exports.CommunicationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const tenant_context_1 = require("../tenants/tenant.context");
let CommunicationsService = class CommunicationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    getTenantId() {
        const tenantId = tenant_context_1.TenantContext.getTenantId();
        if (!tenantId) {
            throw new common_1.BadRequestException('No active school tenant context found');
        }
        return tenantId;
    }
    async sendNotification(data) {
        const tenantId = this.getTenantId();
        const notification = await this.prisma.notification.create({
            data: {
                title: data.title,
                message: data.message,
                type: data.type,
                recipientId: data.recipientId,
            },
        });
        console.log(`[DISPATCH] [${data.type}] To User ID: ${data.recipientId}`);
        console.log(`Subject: ${data.title}`);
        console.log(`Content: ${data.message}`);
        return notification;
    }
    async getNotifications(recipientId) {
        const tenantId = this.getTenantId();
        const user = await this.prisma.user.findUnique({ where: { id: recipientId } });
        if (!user || user.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Recipient user not found in this school context');
        }
        return this.prisma.notification.findMany({
            where: { recipientId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async markAsRead(id) {
        return this.prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
    }
    async createCommunication(data) {
        const tenantId = this.getTenantId();
        const { headline, subject, message, type, priority, audienceGroups, scheduledAt, attachments } = data;
        const communication = await this.prisma.communication.create({
            data: {
                tenantId,
                createdById: data.createdById || data.senderId || data.userId || '',
                headline,
                subject,
                message,
                type,
                priority,
                audienceGroups,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
                attachments: {
                    create: (attachments || []).map((att) => ({ url: att.url, filename: att.filename })),
                },
            },
        });
        return communication;
    }
    async listCommunications(filter = {}) {
        const tenantId = this.getTenantId();
        return this.prisma.communication.findMany({
            where: { tenantId, ...filter },
            orderBy: { createdAt: 'desc' },
            include: { attachments: true },
        });
    }
    async getCommunication(id) {
        const tenantId = this.getTenantId();
        const comm = await this.prisma.communication.findUnique({
            where: { id },
            include: { attachments: true, recipients: true },
        });
        if (!comm || comm.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Communication not found');
        }
        return comm;
    }
    async updateCommunication(id, data) {
        const tenantId = this.getTenantId();
        const existing = await this.prisma.communication.findUnique({ where: { id } });
        if (!existing || existing.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Communication not found');
        }
        if (existing.status !== 'DRAFT' && existing.status !== 'SCHEDULED') {
            throw new common_1.BadRequestException('Only draft or scheduled communications can be updated');
        }
        return this.prisma.communication.update({
            where: { id },
            data: {
                headline: data.headline,
                subject: data.subject,
                message: data.message,
                type: data.type,
                priority: data.priority,
                audienceGroups: data.audienceGroups,
                scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
                status: data.status || existing.status,
            },
        });
    }
    async resolveAudience(communicationId) {
        const tenantId = this.getTenantId();
        const comm = await this.prisma.communication.findUnique({ where: { id: communicationId } });
        if (!comm || comm.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Communication not found');
        }
        const groups = comm.audienceGroups || [];
        const recipientIds = new Set();
        for (const group of groups) {
            if (group === 'ALL_TEACHERS') {
                const teachers = await this.prisma.user.findMany({ where: { role: 'TEACHER', tenantId }, select: { id: true } });
                teachers.forEach(t => recipientIds.add(t.id));
            }
            else if (group.startsWith('CLASS_')) {
                const classId = group.split('_')[1];
                const students = await this.prisma.studentProfile.findMany({ where: { classSectionId: classId }, select: { id: true } });
                students.forEach(s => recipientIds.add(s.id));
            }
        }
        const createData = Array.from(recipientIds).map(uid => ({ communicationId, userId: uid, tenantId }));
        await this.prisma.communicationRecipient.createMany({ data: createData, skipDuplicates: true });
        return { count: recipientIds.size };
    }
    async markRecipientStatus(recipientId, status) {
        const tenantId = this.getTenantId();
        const recipient = await this.prisma.communicationRecipient.findUnique({ where: { id: recipientId } });
        if (!recipient || recipient.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Recipient not found');
        }
        const data = {};
        if (status === 'DELIVERED') {
            data.deliveredAt = new Date();
            data.status = 'DELIVERED';
        }
        else if (status === 'READ') {
            data.readAt = new Date();
            data.status = 'READ';
        }
        return this.prisma.communicationRecipient.update({ where: { id: recipientId }, data });
    }
    async deleteNotification(id) {
        const tenantId = this.getTenantId();
        return this.prisma.notification.delete({
            where: { id },
        });
    }
    async clearReadNotifications(recipientId) {
        const tenantId = this.getTenantId();
        return this.prisma.notification.deleteMany({
            where: { recipientId, isRead: true },
        });
    }
};
exports.CommunicationsService = CommunicationsService;
exports.CommunicationsService = CommunicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommunicationsService);
//# sourceMappingURL=communications.service.js.map