import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TenantContext } from '../tenants/tenant.context';

@Injectable()
export class AcademicsService {
  constructor(private prisma: PrismaService) {}

  private getTenantId(): string {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('No active school tenant context found');
    }
    return tenantId;
  }

  // ── ACADEMIC YEAR SERVICES ──────────────────────────────────────────────────

  async createAcademicYear(name: string, startDate: Date, endDate: Date, isActive: boolean) {
    const tenantId = this.getTenantId();

    if (isActive) {
      // Limit of up to 2 active academic years. Deactivate older active year if limit is exceeded.
      const activeYears = await this.prisma.academicYear.findMany({
        where: { tenantId, isActive: true },
        orderBy: { startDate: 'asc' },
      });
      if (activeYears.length >= 2) {
        await this.prisma.academicYear.update({
          where: { id: activeYears[0].id },
          data: { isActive: false },
        });
      }
    }

    return this.prisma.academicYear.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive,
        tenantId,
      },
    });
  }

  async getAcademicYears() {
    const tenantId = this.getTenantId();
    return this.prisma.academicYear.findMany({
      where: { tenantId },
      orderBy: { startDate: 'desc' },
    });
  }

  async toggleAcademicYearActive(id: string) {
    const tenantId = this.getTenantId();
    const ay = await this.prisma.academicYear.findUnique({
      where: { id },
    });
    if (!ay || ay.tenantId !== tenantId) {
      throw new NotFoundException('Academic year not found');
    }

    const nextActive = !ay.isActive;
    if (nextActive) {
      // Limit of up to 2 active academic years
      const activeYears = await this.prisma.academicYear.findMany({
        where: { tenantId, isActive: true },
        orderBy: { startDate: 'asc' },
      });
      if (activeYears.length >= 2) {
        await this.prisma.academicYear.update({
          where: { id: activeYears[0].id },
          data: { isActive: false },
        });
      }
    }

    return this.prisma.academicYear.update({
      where: { id },
      data: { isActive: nextActive },
    });
  }

  // ── CLASS SERVICES ──────────────────────────────────────────────────────────

  async createClass(name: string, academicYearId: string) {
    const tenantId = this.getTenantId();
    return this.prisma.class.create({
      data: {
        name,
        academicYearId,
        tenantId,
      },
    });
  }

  async getClasses() {
    const tenantId = this.getTenantId();
    return this.prisma.class.findMany({
      where: { tenantId, isActive: true },
      include: { academicYear: true },
      orderBy: { name: 'asc' },
    });
  }

  async deleteClass(id: string) {
    const tenantId = this.getTenantId();

    // ── 1. Tenant-isolation check ────────────────────────────────────────────
    const classRecord = await this.prisma.class.findFirst({
      where: { id, tenantId },
    });
    if (!classRecord) {
      throw new NotFoundException('Class not found');
    }

    // ── 2. Dependency guards (hard blocks – no data loss allowed) ────────────
    // Collect ALL ClassSection ids for this class (used in cascaded checks)
    const classSections = await this.prisma.classSection.findMany({
      where: { classId: id, tenantId },
      select: { id: true },
    });
    const classSectionIds = classSections.map((cs) => cs.id);

    // 2a. Students enrolled in any section of this class
    const studentCount =
      classSectionIds.length > 0
        ? await this.prisma.studentProfile.count({
            where: { classSectionId: { in: classSectionIds } },
          })
        : 0;

    // 2b. Attendance sessions recorded against these class-sections
    const attendanceCount =
      classSectionIds.length > 0
        ? await this.prisma.attendanceSession.count({
            where: {
              tenantId,
              classSectionId: { in: classSectionIds },
            },
          })
        : 0;

    // 2c. Exams created for any section of this class
    const examCount =
      classSectionIds.length > 0
        ? await this.prisma.exam.count({
            where: { tenantId, classSectionId: { in: classSectionIds } },
          })
        : 0;

    // Build descriptive error message
    const blockers: string[] = [];
    if (studentCount > 0) blockers.push(`${studentCount} Student(s)`);
    if (attendanceCount > 0) blockers.push(`${attendanceCount} Attendance Record(s)`);
    if (examCount > 0) blockers.push(`${examCount} Exam(s)`);

    if (blockers.length > 0) {
      throw new BadRequestException(
        `Cannot delete this Class because it is already being used by: ${blockers.join(', ')}. ` +
          `Please remove all associated records before deleting this class.`,
      );
    }

    // ── 3. Cascade-delete safe child records in a transaction ────────────────
    return this.prisma.$transaction(async (tx) => {
      // 3a. Delete ClassSubjects (subjects assigned to class sections)
      if (classSectionIds.length > 0) {
        await tx.classSubject.deleteMany({
          where: { tenantId, classSectionId: { in: classSectionIds } },
        });

        // 3b. Delete Periods (timetable entries) tied to class sections
        await tx.period.deleteMany({
          where: { tenantId, classSectionId: { in: classSectionIds } },
        });

        // 3c. Deactivate (not delete) any Pricebooks referencing this class
        //     so fee history is preserved; classId pointer is cleared.
        await tx.pricebook.updateMany({
          where: { tenantId, classId: id },
          data: { classId: null, isActive: false },
        });

        // 3d. Delete ClassSections themselves
        await tx.classSection.deleteMany({
          where: { tenantId, classId: id },
        });
      }

      // 3e. Finally delete the class record
      return tx.class.update({
          where: { id },
          data: { isActive: false },
        });
    });
  }

  // ── SECTION SERVICES ────────────────────────────────────────────────────────

  async createSection(name: string) {
    const tenantId = this.getTenantId();
    return this.prisma.section.create({
      data: {
        name,
        tenantId,
      },
    });
  }

  async getSections() {
    const tenantId = this.getTenantId();
    return this.prisma.section.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  // ── CLASS-SECTION JUNCTION SERVICES ─────────────────────────────────────────

  async createClassSection(classId: string, sectionId: string, teacherId?: string) {
    const tenantId = this.getTenantId();
    return this.prisma.classSection.create({
      data: {
        classId,
        sectionId,
        teacherId,
        tenantId,
      },
    });
  }

  async getClassSections() {
    const tenantId = this.getTenantId();
    return this.prisma.classSection.findMany({
      where: { tenantId },
      include: {
        class: true,
        section: true,
        teacher: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        class: {
          name: 'asc',
        },
      },
    });
  }

  // ── SUBJECT SERVICES ────────────────────────────────────────────────────────

  async createSubject(name: string) {
    const tenantId = this.getTenantId();
    return this.prisma.subject.create({
      data: {
        name,
        tenantId,
      },
    });
  }

  async getSubjects() {
    const tenantId = this.getTenantId();
    return this.prisma.subject.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });
  }

  // ── CLASS-SUBJECTS JUNCTIONS ────────────────────────────────────────────────

  async addSubjectToClassSection(classSectionId: string, subjectId: string) {
    const tenantId = this.getTenantId();
    return this.prisma.classSubject.create({
      data: {
        classSectionId,
        subjectId,
        tenantId,
      },
    });
  }

  async getClassSubjects(classSectionId: string) {
    const tenantId = this.getTenantId();
    return this.prisma.classSubject.findMany({
      where: { tenantId, classSectionId },
      include: {
        subject: true,
      },
    });
  }

  async removeSubjectFromClassSection(classSectionId: string, subjectId: string) {
    const tenantId = this.getTenantId();
    await this.prisma.teacherAssignment.deleteMany({
      where: { classSectionId, subjectId, tenantId },
    });
    return this.prisma.classSubject.delete({
      where: {
        classSectionId_subjectId: {
          classSectionId,
          subjectId,
        },
      },
    });
  }

  // ── TIMETABLE / PERIOD SERVICES ──────────────────────────────────────────────

  async createPeriodTiming(periodNumber: number, startTime: string, endTime: string, isActive: boolean) {
    const tenantId = this.getTenantId();
    return this.prisma.periodTiming.create({
      data: {
        periodNumber,
        startTime,
        endTime,
        isActive,
        tenantId,
      },
    });
  }

  async getPeriodTimings() {
    const tenantId = this.getTenantId();
    return this.prisma.periodTiming.findMany({
      where: { tenantId, isActive: true },
      orderBy: { periodNumber: 'asc' },
    });
  }

  async createPeriod(data: any) {
    const tenantId = this.getTenantId();
    return this.prisma.period.create({
      data: {
        classSectionId: data.classSectionId,
        subjectId: data.subjectId,
        teacherId: data.teacherId,
        periodTimingId: data.periodTimingId,
        dayOfWeek: data.dayOfWeek,
        substituteTeacherId: data.substituteTeacherId || null,
        tenantId,
      },
    });
  }

  async getPeriodsByClassSection(classSectionId: string) {
    const tenantId = this.getTenantId();
    return this.prisma.period.findMany({
      where: { tenantId, classSectionId },
      include: {
        subject: true,
        teacher: { include: { user: true } },
        substituteTeacher: { include: { user: true } },
        periodTiming: true,
      },
    });
  }

  async getPeriodsByTeacher(teacherId: string) {
    const tenantId = this.getTenantId();
    return this.prisma.period.findMany({
      where: {
        tenantId,
        OR: [
          { teacherId },
          { substituteTeacherId: teacherId },
        ],
      },
      include: {
        classSection: { include: { class: true, section: true } },
        subject: true,
        periodTiming: true,
      },
    });
  }
}

