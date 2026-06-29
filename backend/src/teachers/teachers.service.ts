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

    const normalizedPhone = data.phone ? data.phone.replace(/\D/g, '').slice(-10) : undefined;
    if (normalizedPhone) {
      const existingPhone = await this.prisma.user.findFirst({
        where: { phone: normalizedPhone },
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
          phone: normalizedPhone,
          tenantId,
          avatarUrl: data.avatarUrl || null,
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
          tenantId,
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
            avatarUrl: true,
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
            avatarUrl: true,
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

    const assignment = await this.prisma.teacherAssignment.upsert({
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
    // Ensure a TeacherSkill record exists for this subject/teacher
    await this.prisma.teacherSkill.upsert({
      where: {
        teacherId_subjectId: {
          teacherId,
          subjectId,
        },
      },
      create: {
        teacherId,
        subjectId,
        skillLevel: 'Beginner',
        yearsOfExperience: 0,
        tenantId,
      },
      update: {}, // no changes needed if already exists
    });
    return assignment;
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
      if (data.name !== undefined || data.phone !== undefined || data.email !== undefined || data.avatarUrl !== undefined) {
        const normalizedPhone = data.phone ? data.phone.replace(/\D/g, '').slice(-10) : data.phone;
        await tx.user.update({
          where: { id: profile.userId },
          data: {
            name: data.name !== undefined ? data.name : undefined,
            phone: data.phone !== undefined ? normalizedPhone : undefined,
            email: data.email !== undefined ? data.email.toLowerCase().trim() : undefined,
            avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : undefined,
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

  async paySalary(id: string, month: string) {
    const tenantId = this.getTenantId();
    const profile = await this.prisma.staffProfile.findFirst({
      where: { id, user: { tenantId } },
      include: { user: true }
    });
    if (!profile) {
      throw new NotFoundException('Staff profile not found');
    }

    const netSalary = Number(profile.basicSalary || 0) + Number(profile.allowances || 0) - Number(profile.pfDeduction || 0);

    return this.prisma.expense.create({
      data: {
        amount: netSalary,
        category: 'Salary',
        date: new Date(),
        description: `Salary disbursed to ${profile.user.name} (${profile.employeeId || 'Staff'}) for ${month}`,
        paymentMode: 'BANK_TRANSFER',
        status: 'PAID',
        tenantId,
      }
    });
  }

  async getSalaryInvoices(staffProfileId: string) {
    const tenantId = this.getTenantId();
    // Look up the staff member to get their name and employeeId for description matching
    const profile = await this.prisma.staffProfile.findFirst({
      where: { id: staffProfileId, user: { tenantId } },
      include: { user: true },
    });
    if (!profile) return [];

    // Expense records store staff info in the description field.
    // Filter by category=Salary AND description containing the staff's name or employeeId.
    const nameFragment = profile.user.name;
    const empId = profile.employeeId || '';

    return this.prisma.expense.findMany({
      where: {
        tenantId,
        category: 'Salary',
        description: {
          contains: nameFragment,
          mode: 'insensitive',
        },
      },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        amount: true,
        category: true,
        date: true,
        description: true,
        status: true,
      },
    });
  }

  async getTeacherCases(teacherId: string) {
    const tenantId = this.getTenantId();
    return this.prisma.behaviorCase.findMany({
      where: { tenantId, teacherId },
      include: {
        student: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTeacherSchedule(teacherId: string) {
    const tenantId = this.getTenantId();
    return this.prisma.period.findMany({
      where: { tenantId, teacherId },
      include: {
        subject: { select: { name: true } },
        classSection: {
          include: {
            class: { select: { name: true } },
            section: { select: { name: true } },
          },
        },
        periodTiming: { select: { startTime: true, endTime: true, periodNumber: true } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { periodTiming: { periodNumber: 'asc' } }],
    });
  }

  async payAllSalaries(month: string) {
    const tenantId = this.getTenantId();
    const staffMembers = await this.prisma.staffProfile.findMany({
      where: { user: { tenantId, isActive: true } },
      include: { user: true }
    });

    return this.prisma.$transaction(async (tx) => {
      const createdExpenses = [];
      for (const staff of staffMembers) {
        const netSalary = Number(staff.basicSalary || 0) + Number(staff.allowances || 0) - Number(staff.pfDeduction || 0);
        const exp = await tx.expense.create({
          data: {
            amount: netSalary,
            category: 'Salary',
            date: new Date(),
            description: `Salary disbursed to ${staff.user.name} (${staff.employeeId || 'Staff'}) for ${month}`,
            paymentMode: 'BANK_TRANSFER',
            status: 'PAID',
            tenantId,
          }
        });
        createdExpenses.push(exp);
      }
      return createdExpenses;
    });
  }
}

