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
      where: { tenantId },
      include: { academicYear: true },
      orderBy: { name: 'asc' },
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

