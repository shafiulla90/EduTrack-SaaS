import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Role } from '@prisma/client';
import { TenantContext } from '../tenants/tenant.context';
import { RoleFilterHelper } from '../common/role-filter.helper';

@Injectable()
export class HomeworkService {
  constructor(
    private prisma: PrismaService,
    private roleFilterHelper: RoleFilterHelper,
  ) {}

  /**
   * Tenant ID is obtained from the global AsyncLocalStorage context set by
   * TenantMiddleware (same pattern as all other services).
   * The previous @Inject(REQUEST) approach has been removed.
   */
  private getTenantId(): string {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('No active school tenant context found.');
    }
    return tenantId;
  }

  private async logAction(userId: string, tenantId: string, action: string, entityName: string, entityId?: string, details?: any) {
    await this.prisma.activityLog.create({
      data: {
        userId,
        tenantId,
        action,
        entityName,
        entityId: entityId || null,
        details: details ? JSON.stringify(details) : null,
      },
    });
  }

  async getHomeworks(userId: string, role: string) {
    const tenantId = this.getTenantId();

    if (this.roleFilterHelper.isTeacher(role)) {
      const scope = await this.roleFilterHelper.buildTeacherScope(userId, tenantId);
      return this.prisma.homework.findMany({
        where: { tenantId, teacherId: scope.staff.id },
        include: {
          classSection: { include: { class: true, section: true } },
          subject: true,
        },
        orderBy: { dueDate: 'asc' },
      });
    }

    // Admins see all homework
    return this.prisma.homework.findMany({
      where: { tenantId },
      include: {
        classSection: { include: { class: true, section: true } },
        subject: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getHomeworkClasses(userId: string, role: string) {
    const tenantId = this.getTenantId();
    if (this.roleFilterHelper.isTeacher(role)) {
      const scope = await this.roleFilterHelper.buildTeacherScope(userId, tenantId);
      if (scope.assignedClassSectionIds.length === 0) return [];

      const [assignments, periods] = await Promise.all([
        this.prisma.teacherAssignment.findMany({
          where: { tenantId, teacherId: scope.staff.id },
          include: {
            classSection: { include: { class: true, section: true } },
            subject: true,
          },
        }),
        this.prisma.period.findMany({
          where: { tenantId, teacherId: scope.staff.id },
          include: {
            classSection: { include: { class: true, section: true } },
            subject: true,
          },
        }),
      ]);

      const classMap = new Map<string, any>();
      assignments.forEach(a => {
        const key = `${a.classSectionId}-${a.subjectId}`;
        classMap.set(key, {
          classSectionId: a.classSectionId,
          subjectId: a.subjectId,
          className: `${a.classSection.class.name} - ${a.classSection.section.name}`,
          subjectName: a.subject.name,
        });
      });
      periods.forEach(p => {
        const key = `${p.classSectionId}-${p.subjectId}`;
        if (!classMap.has(key)) {
          classMap.set(key, {
            classSectionId: p.classSectionId,
            subjectId: p.subjectId,
            className: `${p.classSection.class.name} - ${p.classSection.section.name}`,
            subjectName: p.subject.name,
          });
        }
      });

      const list = Array.from(classMap.values());
      list.sort((x, y) => x.className.localeCompare(y.className));
      return list;
    }

    // Admin: all class-section × subject combinations
    const classSections = await this.prisma.classSection.findMany({
      where: { tenantId },
      include: { class: true, section: true },
    });
    const subjects = await this.prisma.subject.findMany({
      where: { tenantId, isActive: true },
    });
    const results = [];
    classSections.forEach(cs => {
      subjects.forEach(sub => {
        results.push({
          classSectionId: cs.id,
          subjectId: sub.id,
          className: `${cs.class.name} - ${cs.section.name}`,
          subjectName: sub.name,
        });
      });
    });
    return results;
  }

  async createHomework(userId: string, role: string, data: any) {
    const tenantId = this.getTenantId();

    if (this.roleFilterHelper.isTeacher(role)) {
      const scope = await this.roleFilterHelper.buildTeacherScope(userId, tenantId);
      await this.roleFilterHelper.validateTeacherAssignment(
        scope.staff.id,
        data.classSectionId,
        data.subjectId,
        tenantId,
      );

      const homework = await this.prisma.homework.create({
        data: {
          title: data.title,
          description: data.description,
          dueDate: new Date(data.dueDate),
          allowLateSubmission: data.allowLateSubmission || false,
          maxMarks: data.maxMarks || 100,
          assignmentType: data.assignmentType || 'Homework',
          status: data.status || 'Published',
          visibleFrom: data.visibleFrom ? new Date(data.visibleFrom) : new Date(),
          attachments: data.attachments || [],
          classSectionId: data.classSectionId,
          subjectId: data.subjectId,
          teacherId: scope.staff.id,
          tenantId,
          createdBy: scope.staff['user']?.name || 'Teacher',
          updatedBy: scope.staff['user']?.name || 'Teacher',
        },
      });

      // Notify students in this class-section
      const students = await this.prisma.studentProfile.findMany({
        where: { tenantId, classSectionId: data.classSectionId },
        select: { userId: true },
      });
      if (students.length > 0) {
        await this.prisma.notification.createMany({
          data: students.map(s => ({
            title: `New Assignment: ${data.title}`,
            message: `Subject: ${data.subjectName || 'Assignment'}. Due date: ${data.dueDate}. Max Marks: ${data.maxMarks || 100}.`,
            type: 'IN_APP',
            recipientId: s.userId,
          })),
        });
      }

      await this.logAction(userId, tenantId, 'RECORD_CREATE', 'Homework', homework.id, data);
      return homework;
    }

    // Admin flow — resolve teacherId fallback
    let finalTeacherId = data.teacherId;
    if (!finalTeacherId) {
      const firstStaff = await this.prisma.staffProfile.findFirst({ where: { tenantId } });
      if (!firstStaff) {
        throw new BadRequestException('No teacher/staff profile exists for this school. Please register a teacher first.');
      }
      finalTeacherId = firstStaff.id;
    }

    const homework = await this.prisma.homework.create({
      data: {
        title: data.title,
        description: data.description,
        dueDate: new Date(data.dueDate),
        allowLateSubmission: data.allowLateSubmission || false,
        maxMarks: data.maxMarks || 100,
        assignmentType: data.assignmentType || 'Homework',
        status: data.status || 'Published',
        visibleFrom: data.visibleFrom ? new Date(data.visibleFrom) : new Date(),
        attachments: data.attachments || [],
        classSectionId: data.classSectionId,
        subjectId: data.subjectId,
        teacherId: finalTeacherId,
        tenantId,
        createdBy: 'Admin',
        updatedBy: 'Admin',
      },
    });

    await this.logAction(userId, tenantId, 'RECORD_CREATE', 'Homework', homework.id, data);
    return homework;
  }

  async updateHomework(userId: string, role: string, id: string, data: any) {
    const tenantId = this.getTenantId();

    if (this.roleFilterHelper.isTeacher(role)) {
      const scope = await this.roleFilterHelper.buildTeacherScope(userId, tenantId);
      const existing = await this.prisma.homework.findFirst({
        where: { id, tenantId, teacherId: scope.staff.id },
      });
      if (!existing) {
        throw new NotFoundException('Homework not found or permissions denied.');
      }

      const homework = await this.prisma.homework.update({
        where: { id },
        data: {
          title: data.title !== undefined ? data.title : undefined,
          description: data.description !== undefined ? data.description : undefined,
          dueDate: data.dueDate !== undefined ? new Date(data.dueDate) : undefined,
          allowLateSubmission: data.allowLateSubmission !== undefined ? data.allowLateSubmission : undefined,
          maxMarks: data.maxMarks !== undefined ? data.maxMarks : undefined,
          assignmentType: data.assignmentType !== undefined ? data.assignmentType : undefined,
          status: data.status !== undefined ? data.status : undefined,
          visibleFrom: data.visibleFrom !== undefined ? new Date(data.visibleFrom) : undefined,
          attachments: data.attachments !== undefined ? data.attachments : undefined,
          updatedBy: scope.staff['user']?.name || 'Teacher',
        },
      });

      await this.logAction(userId, tenantId, 'RECORD_UPDATE', 'Homework', id, data);
      return homework;
    }

    // Admin update flow
    const existing = await this.prisma.homework.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      throw new NotFoundException('Homework not found.');
    }

    const homework = await this.prisma.homework.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title : undefined,
        description: data.description !== undefined ? data.description : undefined,
        dueDate: data.dueDate !== undefined ? new Date(data.dueDate) : undefined,
        allowLateSubmission: data.allowLateSubmission !== undefined ? data.allowLateSubmission : undefined,
        maxMarks: data.maxMarks !== undefined ? data.maxMarks : undefined,
        assignmentType: data.assignmentType !== undefined ? data.assignmentType : undefined,
        status: data.status !== undefined ? data.status : undefined,
        visibleFrom: data.visibleFrom !== undefined ? new Date(data.visibleFrom) : undefined,
        attachments: data.attachments !== undefined ? data.attachments : undefined,
        updatedBy: 'Admin',
      },
    });

    await this.logAction(userId, tenantId, 'RECORD_UPDATE', 'Homework', id, data);
    return homework;
  }

  async deleteHomework(userId: string, role: string, id: string) {
    const tenantId = this.getTenantId();

    if (this.roleFilterHelper.isTeacher(role)) {
      const scope = await this.roleFilterHelper.buildTeacherScope(userId, tenantId);
      const existing = await this.prisma.homework.findFirst({
        where: { id, tenantId, teacherId: scope.staff.id },
      });
      if (!existing) {
        throw new NotFoundException('Homework not found or permissions denied.');
      }
      await this.prisma.homework.delete({ where: { id } });
      await this.logAction(userId, tenantId, 'RECORD_DELETE', 'Homework', id);
      return { success: true };
    }

    // Admin delete flow
    const existing = await this.prisma.homework.findFirst({
      where: { id, tenantId },
    });
    if (!existing) {
      throw new NotFoundException('Homework not found.');
    }
    await this.prisma.homework.delete({ where: { id } });
    await this.logAction(userId, tenantId, 'RECORD_DELETE', 'Homework', id);
    return { success: true };
  }
}
