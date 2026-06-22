import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Tenant } from '@prisma/client';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findBySubdomain(subDomain: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { subDomain },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with subdomain '${subDomain}' not found`);
    }
    return tenant;
  }

  async findById(id: string): Promise<Tenant> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID '${id}' not found`);
    }
    return tenant;
  }

  async create(name: string, subDomain: string): Promise<Tenant> {
    const existing = await this.prisma.tenant.findUnique({
      where: { subDomain },
    });
    if (existing) {
      throw new ConflictException(`Subdomain '${subDomain}' is already registered`);
    }
    return this.prisma.tenant.create({
      data: {
        name,
        subDomain,
      },
    });
  }

  async findAll(): Promise<Tenant[]> {
    return this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: any): Promise<Tenant> {
    return this.prisma.tenant.update({
      where: { id },
      data,
    });
  }
}
