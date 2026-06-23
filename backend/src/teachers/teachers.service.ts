import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
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

    if (data.phone) {
      const existingPhone = await this.prisma.user.findFirst({
        where: { phone: data.phone },
      });
      if (existingPhone) {
        throw new ConflictException('Phone number already registered');
      }
    }

    const defaultPassword = data.password || 'StaffPass@123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // Determine role: Non-Teaching staff get STAFF role, Teaching staff get TEACHER role
    const userRole = data.staffType === 'Non-Teaching' ? Role.STAFF : Role.TEACHER;

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: emailLower,
          name: data.name,
          passwordHash,
          role: userRole,
          phone: data.phone,
          tenantId,
        },
      });

      const profile = await tx.staffProfile.create({
        data: {
          userId: user.id,
          employeeId: data.employeeId,
          designation: data.designation || (userRole === Role.STAFF ? 'Staff' : 'Teacher'),
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
          role: { in: [Role.TEACHER, Role.STAFF] },
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
            role: true,
          },
        },
        _count: {
          select: { teacherAssignments: true },
        },
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });
  }

  // Returns only TEACHER-role staff (used by Teacher & Class Management page)
  async getTeachingStaff() {
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
            role: true,
          },
        },
        _count: {
          select: { teacherAssignments: true },
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

  async deleteTeacher(id: string) {
    const tenantId = this.getTenantId();
    const profile = await this.prisma.staffProfile.findFirst({
      where: { id, user: { tenantId } },
      include: { user: true }
    });

    if (!profile) {
      throw new NotFoundException('Teacher profile not found');
    }

    const hasActiveAssignments = await this.prisma.teacherAssignment.findFirst({
      where: { teacherId: id }
    });

    if (hasActiveAssignments) {
      throw new BadRequestException('Cannot delete teacher with active class assignments');
    }

    return this.prisma.$transaction(async (tx) => {
      // Clean up references
      await tx.classSection.updateMany({
        where: { teacherId: id },
        data: { teacherId: null },
      });
      await tx.period.updateMany({
        where: {
          OR: [{ teacherId: id }, { substituteTeacherId: id }],
        },
        data: {
          teacherId: null,
          substituteTeacherId: null,
        },
      });
      await tx.behaviorCase.updateMany({
        where: { teacherId: id },
        data: { teacherId: null },
      });
      // Deactivate profile and user
      await tx.staffProfile.update({
        where: { id },
        data: { status: 'INACTIVE' },
      });
      await tx.user.update({
        where: { id: profile.userId },
        data: { isActive: false },
      });
      return { success: true };
    });
  }

  async updateTeacher(id: string, data: any) {
    const tenantId = this.getTenantId();
    const profile = await this.prisma.staffProfile.findFirst({
      where: { id, user: { tenantId } },
      include: { user: true }
    });

    if (!profile) {
      throw new NotFoundException('Teacher profile not found');
    }

    return this.prisma.$transaction(async (tx) => {
      if (data.name !== undefined || data.phone !== undefined || data.email !== undefined) {
        await tx.user.update({
          where: { id: profile.userId },
          data: {
            name: data.name !== undefined ? data.name : undefined,
            phone: data.phone !== undefined ? data.phone : undefined,
            email: data.email !== undefined ? data.email.toLowerCase().trim() : undefined,
          }
        });
      }

      return tx.staffProfile.update({
        where: { id },
        data: {
          employeeId: data.employeeId !== undefined ? data.employeeId : undefined,
          designation: data.designation !== undefined ? data.designation : undefined,
          basicSalary: data.basicSalary !== undefined ? data.basicSalary : undefined,
          allowances: data.allowances !== undefined ? data.allowances : undefined,
          deductions: data.deductions !== undefined ? data.deductions : undefined,
          pfDeduction: data.pfDeduction !== undefined ? data.pfDeduction : undefined,
          status: data.status !== undefined ? data.status : undefined,
          qualification: data.qualification !== undefined ? data.qualification : undefined,
          subjectsTaught: data.subjectsTaught !== undefined ? data.subjectsTaught : undefined,
        }
      });
    });
  }
}
