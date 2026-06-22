import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TenantContext } from '../tenants/tenant.context';

@Injectable()
export class CommunicationsService {
  constructor(private prisma: PrismaService) {}

  private getTenantId(): string {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('No active school tenant context found');
    }
    return tenantId;
  }

  async sendNotification(data: any) {
    const tenantId = this.getTenantId();

    const notification = await this.prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type, // IN_APP, EMAIL, SMS
        recipientId: data.recipientId,
      },
    });

    // Mock dispatch console alerts representing "SMS/Email Ready Architecture"
    console.log(`[DISPATCH] [${data.type}] To User ID: ${data.recipientId}`);
    console.log(`Subject: ${data.title}`);
    console.log(`Content: ${data.message}`);

    return notification;
  }

  async getNotifications(recipientId: string) {
    // We check tenant boundary dynamically: recipient must belong to the active tenant
    const tenantId = this.getTenantId();
    const user = await this.prisma.user.findUnique({
      where: { id: recipientId },
    });

    if (!user || user.tenantId !== tenantId) {
      throw new NotFoundException('Recipient user not found in this school context');
    }

    return this.prisma.notification.findMany({
      where: { recipientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }
}
