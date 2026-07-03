import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Tenant } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  private subdomainCache = new Map<string, { tenant: Tenant; expiresAt: number }>();

  async findBySubdomain(subDomain: string): Promise<Tenant> {
    const nowTime = Date.now();
    const cached = this.subdomainCache.get(subDomain);
    if (cached && cached.expiresAt > nowTime) {
      return cached.tenant;
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { subDomain },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with subdomain '${subDomain}' not found`);
    }

    this.subdomainCache.set(subDomain, {
      tenant,
      expiresAt: nowTime + 5 * 60 * 1000, // Cache subdomain mapping for 5 minutes
    });

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

  async registerTenant(data: any): Promise<any> {
    const normalizedPhone = data.mobileNumber.replace(/\D/g, '').slice(-10);
    const existingUser = await this.prisma.user.findFirst({
      where: {
        phone: {
          endsWith: normalizedPhone,
        },
      },
    });
    if (existingUser) {
      throw new ConflictException('A user with this mobile number is already registered. Please log in instead.');
    }

    const slug = data.schoolName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    let subDomain = slug;
    let exists = await this.prisma.tenant.findUnique({ where: { subDomain } });
    let counter = 1;
    while (exists) {
      subDomain = `${slug}-${counter}`;
      exists = await this.prisma.tenant.findUnique({ where: { subDomain } });
      counter++;
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: data.schoolName,
          subDomain,
          address: data.address,
          email: data.email,
          phone: normalizedPhone,
          setupCompleted: false,
        },
      });

      // 2. Create SchoolSetup
      const schoolSetup = await tx.schoolSetup.create({
        data: {
          tenantId: tenant.id,
          schoolName: data.schoolName,
          schoolType: data.schoolType,
          adminName: data.adminName,
          mobileNumber: normalizedPhone,
          email: data.email,
          address: data.address,
          academicYear: data.academicYear,
        },
      });

      // 3. Create default active AcademicYear
      const currentYear = new Date().getFullYear();
      const startDate = new Date(`${currentYear}-06-01`);
      const endDate = new Date(`${currentYear + 1}-05-31`);

      const academicYear = await tx.academicYear.create({
        data: {
          name: data.academicYear,
          startDate,
          endDate,
          isActive: true,
          tenantId: tenant.id,
        },
      });

      // 4. Create default Tenant Admin User (SCHOOL_ADMIN)
      const randomPassword = Math.random().toString(36).slice(-10) + '!A1';
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      const user = await tx.user.create({
        data: {
          name: data.adminName,
          email: data.email,
          phone: normalizedPhone,
          passwordHash,
          role: 'SCHOOL_ADMIN',
          tenantId: tenant.id,
        },
      });

      // 5. Create default StaffProfile for the Admin user
      await tx.staffProfile.create({
        data: {
          userId: user.id,
          designation: 'Principal',
          status: 'Active',
          tenantId: tenant.id,
        },
      });

      return {
        tenant,
        schoolSetup,
        academicYear,
        user,
      };
    }, { timeout: 30000 });
  }
}

