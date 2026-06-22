import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TenantContext } from '../tenants/tenant.context';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  private getTenantId(): string {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('No active school tenant context found');
    }
    return tenantId;
  }

  async createTeacher(data: any) {
    const tenantId = this.getTenantId();
    const emailLower = data.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({
      where: { email: emailLower },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const defaultPassword = data.password || 'StaffPass@123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: emailLower,
          name: data.name,
          passwordHash,
          role: Role.TEACHER,
          phone: data.phone,
          tenantId,
        },
      });

      const profile = await tx.staffProfile.create({
        data: {
          userId: user.id,
          employeeId: data.employeeId,
          designation: data.designation || 'Teacher',
          basicSalary: data.basicSalary,
          allowances: data.allowances,
          deductions: data.deductions,
          pfDeduction: data.pfDeduction,
          joiningDate: data.joiningDate ? new Date(data.joiningDate) : new Date(),
          status: 'Active',
          qualification: data.qualification,
          subjectsTaught: data.subjectsTaught || [],
        },
      });

      return { user, profile };
    });
  }

  async getTeachers() {
    const tenantId = this.getTenantId();
    return this.prisma.staffProfile.findMany({
      where: {
        user: {
          tenantId,
          role: Role.TEACHER,
          isActive: true,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });
  }

  async assignClassSubject(
    teacherId: string,
    classSectionId: string,
    subjectId: string,
    periodsPerWeek: number,
  ) {
    const tenantId = this.getTenantId();

    return this.prisma.teacherAssignment.upsert({
      where: {
        teacherId_classSectionId_subjectId: {
          teacherId,
          classSectionId,
          subjectId,
        },
      },
      create: {
        teacherId,
        classSectionId,
        subjectId,
        periodsPerWeek,
        tenantId,
      },
      update: {
        periodsPerWeek,
      },
    });
  }

  async getAssignments(teacherId: string) {
    const tenantId = this.getTenantId();
    return this.prisma.teacherAssignment.findMany({
      where: { tenantId, teacherId },
      include: {
        classSection: {
          include: {
            class: true,
            section: true,
          },
        },
        subject: true,
      },
    });
  }

  async saveSkill(
    teacherId: string,
    subjectId: string,
    skillLevel: string,
    yearsOfExperience: number,
  ) {
    const tenantId = this.getTenantId();
    return this.prisma.teacherSkill.create({
      data: {
        teacherId,
        subjectId,
        skillLevel,
        yearsOfExperience,
        tenantId,
      },
    });
  }

  async getSkills(teacherId: string) {
    const tenantId = this.getTenantId();
    return this.prisma.teacherSkill.findMany({
      where: { tenantId, teacherId },
      include: {
        subject: true,
      },
    });
  }
}
