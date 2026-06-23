import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TenantContext } from '../tenants/tenant.context';
import { Request } from 'express';
import { Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { CreateBehaviorDto } from './dto/create-behavior.dto';
import { UpdateCaseStatusDto } from './dto/update-case-status.dto';

@Injectable()
export class ComplaintBoxService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  private getTenantId(): string {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('No active tenant context');
    }
    return tenantId;
  }

  /** Returns the profile of the currently authenticated teacher. */
  async getCurrentTeacher() {
    const tenantId = this.getTenantId();
    const user = (this.request as any).user;
    if (!user || !user.id) {
      throw new BadRequestException('User not authenticated');
    }
    const profile = await this.prisma.staffProfile.findUnique({
      where: { userId: user.id },
      include: { user: true },
    });
    if (!profile || profile.user.tenantId !== tenantId) {
      throw new NotFoundException('Teacher profile not found');
    }
    return profile;
  }

  /** Returns all class sections (classes) for the tenant. */
  async getStudentClasses() {
    const tenantId = this.getTenantId();
    return this.prisma.classSection.findMany({
      where: { tenantId },
      include: { class: true, section: true },
      orderBy: { class: { name: 'asc' } },
    });
  }

  /** Returns all teachers for the tenant. */
  async getTeachers() {
    const tenantId = this.getTenantId();
    return this.prisma.staffProfile.findMany({
      where: { user: { tenantId, role: 'TEACHER', isActive: true } },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { user: { name: 'asc' } },
    });
  }

  /** Returns students belonging to a specific class section. */
  async getStudentsByClass(classSectionId: string) {
    const tenantId = this.getTenantId();
    return this.prisma.studentProfile.findMany({
      where: {
        user: { tenantId },
        classSectionId,
      },
      include: { user: true, classSection: { include: { class: true, section: true } } },
      orderBy: { user: { name: 'asc' } },
    });
  }

  /** Searches students across the tenant with optional filters. */
  async searchStudents(searchTerm?: string, classId?: string, sectionId?: string) {
    const tenantId = this.getTenantId();
    return this.prisma.studentProfile.findMany({
      where: {
        user: { tenantId, isActive: true },
        ...(classId || sectionId
          ? {
              classSection: {
                classId: classId || undefined,
                sectionId: sectionId || undefined,
              },
            }
          : {}),
        ...(searchTerm
          ? {
              OR: [
                { user: { name: { contains: searchTerm, mode: 'insensitive' } } },
                { user: { email: { contains: searchTerm, mode: 'insensitive' } } },
                { user: { phone: { contains: searchTerm, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        classSection: { include: { class: true, section: true } },
      },
      orderBy: { user: { name: 'asc' } },
      take: 200,
    });
  }

  /** Submits a new behavior case (complaint or praise). */
  async submitStudentBehavior(dto: CreateBehaviorDto) {
    const tenantId = this.getTenantId();
    let teacherId = dto.teacherId;
    if (!teacherId) {
      try {
        const current = await this.getCurrentTeacher();
        teacherId = (current as any).id;
      } catch {
        teacherId = undefined;
      }
    }
    const priority = dto.behaviorType === 'Complaint' ? 'High' : 'Medium';
    return this.prisma.behaviorCase.create({
      data: {
        tenantId,
        studentId: dto.studentId,
        teacherId,
        behaviorType: dto.behaviorType,
        category: dto.category,
        academicYear: dto.academicYear,
        status: 'New',
        priority,
        description: dto.description,
      },
    });
  }

  /** Returns academic years for the tenant. */
  async getAcademicYears() {
    const tenantId = this.getTenantId();
    return this.prisma.academicYear.findMany({ where: { tenantId }, orderBy: { name: 'desc' } });
  }

  /** Returns pending behavior cases (actually returns all cases for management ledger). */
  async getPendingCases(academicYear?: string) {
    const tenantId = this.getTenantId();
    return this.prisma.behaviorCase.findMany({
      where: { tenantId, ...(academicYear ? { academicYear } : {}) },
      include: {
        student: {
          include: {
            user: { select: { name: true } },
            classSection: { include: { class: true, section: true } },
          },
        },
        teacher: {
          include: {
            user: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Returns all cases for a specific student. */
  async getStudentCases(studentId: string, academicYear?: string) {
    const tenantId = this.getTenantId();
    return this.prisma.behaviorCase.findMany({
      where: { tenantId, studentId, ...(academicYear ? { academicYear } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Updates the status of a case. Only the status field is mutated. */
  async updateCaseStatus(caseId: string, dto: UpdateCaseStatusDto) {
    const tenantId = this.getTenantId();
    const existing = await this.prisma.behaviorCase.findUnique({ where: { id: caseId } });
    if (!existing || existing.tenantId !== tenantId) {
      throw new NotFoundException('Case not found');
    }
    return this.prisma.behaviorCase.update({
      where: { id: caseId },
      data: { status: dto.status },
    });
  }

  /** Returns simple statistics for a student – total cases and pending count. */
  async getStudentStats(studentId: string) {
    const tenantId = this.getTenantId();
    const total = await this.prisma.behaviorCase.count({ where: { tenantId, studentId } });
    const complaintCount = await this.prisma.behaviorCase.count({
      where: { tenantId, studentId, behaviorType: 'Complaint' },
    });
    const praiseCount = await this.prisma.behaviorCase.count({
      where: { tenantId, studentId, behaviorType: 'Praise' },
    });
    const resolvedCount = await this.prisma.behaviorCase.count({
      where: { tenantId, studentId, status: 'Closed' },
    });
    return { studentId, totalCases: total, complaintCount, praiseCount, resolvedCount };
  }
}
