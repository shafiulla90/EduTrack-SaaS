import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TenantContext } from '../tenants/tenant.context';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  private getTenantId(): string {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('No active school tenant context found');
    }
    return tenantId;
  }

  async getRecentSubmissions() {
    const tenantId = this.getTenantId();

    return this.prisma.attendanceSession.findMany({
      where: {
        tenantId,
      },
      include: {
        classSection: {
          include: {
            class: true,
            section: true,
          },
        },
        takenBy: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
      take: 10,
    });
  }

  async getSessionData(classSectionId: string, dateStr: string) {
    const tenantId = this.getTenantId();
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

    const session = await this.prisma.attendanceSession.findFirst({
      where: {
        tenantId,
        classSectionId,
        date,
      },
      include: {
        attendances: true,
        takenBy: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!session) {
      return { sessionExists: false, absentIds: [], total: 0, present: 0, absent: 0 };
    }

    const absentIds = session.attendances
      .filter(a => a.status === AttendanceStatus.ABSENT)
      .map(a => a.studentId);

    return {
      sessionExists: true,
      sessionId: session.id,
      teacherName: session.takenBy?.user?.name || 'Unknown',
      total: session.totalStudents,
      present: session.presentCount,
      absent: session.absentCount,
      absentIds,
    };
  }

  async saveAttendance(data: any) {
    const tenantId = this.getTenantId();
    const date = new Date(data.date);
    date.setHours(0, 0, 0, 0);

    const absentStudentIds = data.absentStudentIds || [];

    return this.prisma.$transaction(async (tx) => {
      // Find or create the Attendance Session
      let session = await tx.attendanceSession.findFirst({
        where: {
          tenantId,
          classSectionId: data.classSectionId,
          date,
        },
      });

      if (!session) {
        session = await tx.attendanceSession.create({
          data: {
            classSectionId: data.classSectionId,
            date,
            takenById: data.teacherId,
            presentCount: data.presentCount,
            absentCount: data.absentCount,
            totalStudents: data.totalStudents,
            tenantId,
          },
        });
      } else {
        session = await tx.attendanceSession.update({
          where: { id: session.id },
          data: {
            presentCount: data.presentCount,
            absentCount: data.absentCount,
            totalStudents: data.totalStudents,
            takenById: data.teacherId,
          },
        });
      }

      // Delete existing individual attendance records for this session
      await tx.attendance.deleteMany({
        where: {
          attendanceSessionId: session.id,
        },
      });

      // Insert new records for absent students
      if (absentStudentIds.length > 0) {
        const attendanceData = absentStudentIds.map((studentId: string) => ({
          attendanceSessionId: session.id,
          studentId,
          status: AttendanceStatus.ABSENT,
          reason: data.reason || null,
          tenantId,
        }));

        await tx.attendance.createMany({
          data: attendanceData,
        });
      }

      return this.getSessionData(data.classSectionId, data.date);
    });
  }

  // Retrieve a single attendance record by its ID
  async getAttendanceById(id: string) {
    const tenantId = this.getTenantId();
    return this.prisma.attendance.findUnique({
      where: { id, tenantId },
      include: { attendanceSession: true },
    });
  }

  // Update an attendance record (status, reason, etc.)
  async updateAttendance(id: string, updateDto: any) {
    const tenantId = this.getTenantId();
    return this.prisma.attendance.update({
      where: { id, tenantId },
      data: {
        status: updateDto.status,
        reason: updateDto.reason,
      },
    });
  }

  // Delete an attendance record
  async deleteAttendance(id: string) {
    const tenantId = this.getTenantId();
    return this.prisma.attendance.delete({
      where: { id, tenantId },
    });
  }

  // Daily summary – totals for a given date (defaults to today)
  async getDailySummary(date?: string) {
    const tenantId = this.getTenantId();
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const sessions = await this.prisma.attendanceSession.findMany({
      where: { tenantId, date: targetDate },
      select: {
        id: true,
        totalStudents: true,
        presentCount: true,
        absentCount: true,
      },
    });
    // Aggregate totals across sessions
    const summary = sessions.reduce(
      (acc, s) => {
        acc.totalStudents += s.totalStudents;
        acc.present += s.presentCount;
        acc.absent += s.absentCount;
        return acc;
      },
      { totalStudents: 0, present: 0, absent: 0 },
    );
    return summary;
  }

  // Monthly summary – totals for a month/year (defaults to current month)
  async getMonthlySummary(month?: string, year?: string) {
    const tenantId = this.getTenantId();
    const now = new Date();
    const targetMonth = month ? parseInt(month, 10) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year, 10) : now.getFullYear();
    const start = new Date(targetYear, targetMonth, 1);
    const end = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);
    const sessions = await this.prisma.attendanceSession.findMany({
      where: {
        tenantId,
        date: {
          gte: start,
          lte: end,
        },
      },
      select: {
        totalStudents: true,
        presentCount: true,
        absentCount: true,
      },
    });
    const summary = sessions.reduce(
      (acc, s) => {
        acc.totalStudents += s.totalStudents;
        acc.present += s.presentCount;
        acc.absent += s.absentCount;
        return acc;
      },
      { totalStudents: 0, present: 0, absent: 0 },
    );
    return summary;
  }

  // Class‑wise attendance report – optionally for a specific date
  async getClassAttendanceReport(classSectionId: string, date?: string) {
    const tenantId = this.getTenantId();
    const whereClause: any = { tenantId, classSectionId };
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      whereClause.date = d;
    }
    const sessions = await this.prisma.attendanceSession.findMany({
      where: whereClause,
      select: {
        totalStudents: true,
        presentCount: true,
        absentCount: true,
      },
    });
    const report = sessions.reduce(
      (acc, s) => {
        acc.totalStudents += s.totalStudents;
        acc.present += s.presentCount;
        acc.absent += s.absentCount;
        return acc;
      },
      { totalStudents: 0, present: 0, absent: 0 },
    );
    return report;
  }

  // Student‑wise attendance report – optionally for a specific date
  async getStudentAttendanceReport(studentId: string, date?: string) {
    const tenantId = this.getTenantId();
    const whereClause: any = { tenantId, studentId };
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      whereClause.attendanceSession = { date: d };
    }
    const records = await this.prisma.attendance.findMany({
      where: whereClause,
      select: { status: true },
    });
    const total = records.length;
    const present = records.filter(r => r.status === AttendanceStatus.PRESENT).length;
    const absent = records.filter(r => r.status === AttendanceStatus.ABSENT).length;
    return { total, present, absent };
  }
}
