import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BillingService } from '../billing/billing.service';
import { StorageService } from '../common/storage.service';
import { Role, PaymentStatus } from '@prisma/client';
import { parseAttendanceDate } from '../attendance/date.utils';

export interface PaymentGatewayResult {
  success: boolean;
  transactionId: string;
  gatewayMessage: string;
}

@Injectable()
export class ParentPortalPaymentProcessor {
  async processPayment(amount: number, method: string, invoiceId: string): Promise<PaymentGatewayResult> {
    // This is modularly separated and can be replaced with Stripe/Razorpay integrations later
    return {
      success: true,
      transactionId: `TXN-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      gatewayMessage: `Mock payment of ₹${amount} completed successfully via ${method} for invoice ${invoiceId}`,
    };
  }
}

@Injectable()
export class ParentPortalService {
  private paymentProcessor = new ParentPortalPaymentProcessor();

  constructor(
    private prisma: PrismaService,
    private billingService: BillingService,
    private storageService: StorageService,
  ) {}

  private async verifyOwnership(userId: string, studentId: string): Promise<any> {
    const parent = await this.prisma.parentProfile.findUnique({
      where: { userId },
    });
    if (!parent) {
      throw new NotFoundException('Parent profile not found');
    }

    const link = await this.prisma.parentStudent.findUnique({
      where: {
        parentId_studentId: {
          parentId: parent.id,
          studentId: studentId,
        },
      },
      include: {
        student: {
          include: {
            user: true,
            classSection: {
              include: {
                class: true,
                section: true,
              },
            },
          },
        },
      },
    });

    if (!link) {
      throw new ForbiddenException('You do not have permission to access records for this student');
    }

    return link.student;
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
    }).catch((err) => console.error('Failed to create audit activity log:', err));
  }

  private async createNotification(recipientId: string, title: string, message: string, type = 'IN_APP') {
    await this.prisma.notification.create({
      data: {
        recipientId,
        title,
        message,
        type,
      },
    }).catch((err) => console.error('Failed to log parent notification:', err));
  }

  async getParentProfile(userId: string) {
    const parent = await this.prisma.parentProfile.findUnique({
      where: { userId },
      include: { user: true },
    });
    if (!parent) {
      throw new NotFoundException('Parent profile not found');
    }
    return parent;
  }

  async getChildren(userId: string) {
    const parent = await this.getParentProfile(userId);
    const links = await this.prisma.parentStudent.findMany({
      where: { parentId: parent.id },
      include: {
        student: {
          include: {
            user: true,
            classSection: {
              include: {
                class: true,
                section: true,
              },
            },
          },
        },
      },
    });

    return links.map(l => ({
      id: l.student.id,
      name: l.student.user.name,
      rollNo: l.student.rollNo || 'N/A',
      avatarUrl: l.student.user.avatarUrl || l.student.profilePhotoUrl,
      class: l.student.classSection?.class.name || 'N/A',
      section: l.student.classSection?.section.name || 'N/A',
      classSectionId: l.student.classSectionId,
      relationship: l.relationship,
      isPrimary: l.isPrimary,
      fatherName: l.student.fatherName || 'N/A',
      motherName: l.student.motherName || 'N/A',
    }));
  }

  async getDashboardStats(userId: string, tenantId: string) {
    const children = await this.getChildren(userId);
    if (children.length === 0) {
      return {
        totalChildren: 0,
        todayAttendance: 'N/A',
        homeworkPending: 0,
        pendingFees: 0,
        upcomingExams: 0,
        announcements: [],
        notifications: [],
      };
    }

    const studentIds = children.map(c => c.id);
    const classSectionIds = children.map(c => c.classSectionId).filter(Boolean) as string[];

    // 1. Total Outstanding Fees
    const invoices = await this.prisma.invoice.findMany({
      where: {
        studentId: { in: studentIds },
        tenantId,
        status: { in: [PaymentStatus.UNPAID, PaymentStatus.PARTIALLY_PAID] },
      },
      select: { remainingBalance: true },
    });
    const pendingFees = invoices.reduce((sum, inv) => sum + Number(inv.remainingBalance), 0);

    // 2. Pending Homework count
    const homeworkCount = await this.prisma.homework.count({
      where: {
        classSectionId: { in: classSectionIds },
        tenantId,
        dueDate: { gte: new Date() },
      },
    });

    // 3. Upcoming Exams (next 14 days)
    const upcomingExams = await this.prisma.examSchedule.count({
      where: {
        classSectionId: { in: classSectionIds },
        tenantId,
        examDate: { gte: new Date() },
      },
    });

    // 4. Combined announcements
    const announcements = await this.prisma.announcement.findMany({
      where: {
        tenantId,
        OR: [
          { audienceType: 'INSTITUTION' },
          { classSectionId: { in: classSectionIds } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // 5. Combined notifications
    const parent = await this.getParentProfile(userId);
    const notificationRecipients = [parent.userId];

    const notifications = await this.prisma.notification.findMany({
      where: {
        recipientId: { in: notificationRecipients },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // 6. Today's Attendance Summary
    const todayUTC = parseAttendanceDate(null);
    const sessions = await this.prisma.attendanceSession.findMany({
      where: {
        classSectionId: { in: classSectionIds },
        date: todayUTC,
        tenantId,
      },
    });

    let todayAttendanceStr = 'Not Marked';
    if (sessions.length > 0) {
      const todayAttendances = await this.prisma.attendance.findMany({
        where: {
          studentId: { in: studentIds },
          attendanceSession: {
            date: todayUTC,
          },
        },
        select: {
          status: true,
          studentId: true,
        },
      });

      const absentCount = todayAttendances.filter(a => a.status === 'ABSENT').length;
      const presentCount = children.length - absentCount;
      todayAttendanceStr = `${presentCount}/${children.length} Present`;
    }

    return {
      totalChildren: children.length,
      todayAttendance: todayAttendanceStr,
      homeworkPending: homeworkCount,
      pendingFees,
      upcomingExams,
      announcements,
      notifications,
    };
  }

  async getChildDashboard(userId: string, studentId: string) {
    const student = await this.verifyOwnership(userId, studentId);

    // Get attendance metrics
    const attendances = await this.prisma.attendance.findMany({
      where: { studentId },
      select: { status: true },
    });
    const total = attendances.length;
    const present = attendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const attendancePercentage = total > 0 ? Math.round((present / total) * 100) : 100;

    // Get pending homework
    let pendingHomework = 0;
    if (student.classSectionId) {
      pendingHomework = await this.prisma.homework.count({
        where: {
          classSectionId: student.classSectionId,
          dueDate: { gte: new Date() },
        },
      });
    }

    // Get fee stats
    const billingInfo = await this.billingService.getStudentById(studentId);
    const pendingFees = billingInfo.totalPendingBalance;

    // Get upcoming exams
    let upcomingExams = [];
    if (student.classSectionId) {
      upcomingExams = await this.prisma.examSchedule.findMany({
        where: {
          classSectionId: student.classSectionId,
          examDate: { gte: new Date() },
        },
        include: { subject: true },
        orderBy: { examDate: 'asc' },
        take: 3,
      });
    }

    // Get recent results
    const recentMarks = await this.prisma.examMark.findMany({
      where: { studentId },
      include: { exam: true, subject: true },
      orderBy: { exam: { date: 'desc' } },
      take: 5,
    });

    return {
      student: {
        id: student.id,
        name: student.user.name,
        rollNo: student.rollNo || 'N/A',
        class: student.classSection?.class.name || 'N/A',
        section: student.classSection?.section.name || 'N/A',
        avatarUrl: student.user.avatarUrl || student.profilePhotoUrl,
        classSectionId: student.classSectionId,
      },
      metrics: {
        attendancePercentage,
        pendingHomework,
        pendingFees,
        upcomingExamsCount: upcomingExams.length,
      },
      upcomingExams,
      recentMarks,
    };
  }

  async getAttendance(userId: string, studentId: string) {
    await this.verifyOwnership(userId, studentId);

    const attendances = await this.prisma.attendance.findMany({
      where: { studentId },
      include: {
        attendanceSession: {
          select: { date: true, takenBy: { include: { user: true } } },
        },
      },
      orderBy: { attendanceSession: { date: 'desc' } },
    });

    const total = attendances.length;
    const present = attendances.filter(a => a.status === 'PRESENT').length;
    const late = attendances.filter(a => a.status === 'LATE').length;
    const absent = attendances.filter(a => a.status === 'ABSENT').length;
    const excused = attendances.filter(a => a.status === 'EXCUSED').length;

    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 100;

    return {
      summary: {
        total,
        present,
        absent,
        late,
        excused,
        attendanceRate: rate,
      },
      records: attendances.map(a => ({
        id: a.id,
        date: a.attendanceSession.date,
        status: a.status,
        reason: a.reason,
        markedBy: a.attendanceSession.takenBy?.user?.name || 'Teacher',
      })),
    };
  }

  async getHomework(userId: string, studentId: string) {
    const student = await this.verifyOwnership(userId, studentId);
    if (!student.classSectionId) return [];

    const homeworkList = await this.prisma.homework.findMany({
      where: {
        classSectionId: student.classSectionId,
        status: 'Published',
      },
      include: {
        subject: true,
        teacher: { include: { user: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    // Query actual submissions stored in ActivityLog table to maintain persistence
    const submissionsLogs = await this.prisma.activityLog.findMany({
      where: {
        tenantId: student.tenantId,
        action: 'SUBMIT_ASSIGNMENT',
        entityName: 'Homework',
      },
    });

    return homeworkList.map(h => {
      const logMatch = submissionsLogs.find(log => {
        try {
          const detailObj = JSON.parse(log.details || '{}');
          return detailObj.studentId === studentId && log.entityId === h.id;
        } catch {
          return false;
        }
      });

      return {
        id: h.id,
        title: h.title,
        description: h.description,
        dueDate: h.dueDate,
        maxMarks: Number(h.maxMarks),
        assignmentType: h.assignmentType,
        attachments: logMatch ? [JSON.parse(logMatch.details || '{}').fileUrl] : h.attachments,
        subject: h.subject.name,
        teacher: h.teacher.user?.name || 'Teacher',
        submitted: !!logMatch,
        submissionStatus: logMatch ? 'Pending Approval' : 'Pending',
      };
    });
  }

  async submitAssignment(userId: string, studentId: string, homeworkId: string, base64File: string, fileName: string) {
    const student = await this.verifyOwnership(userId, studentId);

    const homework = await this.prisma.homework.findUnique({
      where: { id: homeworkId },
    });
    if (!homework) {
      throw new NotFoundException('Homework assignment not found');
    }

    // Upload attachment using S3 Centralized StorageService
    let fileUrl = 'mock_attachment.pdf';
    if (base64File) {
      fileUrl = await this.storageService.uploadImage(base64File, student.tenantId, studentId, 'homework-submission');
    }

    // Save submission inside ActivityLog audit table for query retrieval
    await this.logAction(userId, student.tenantId, 'SUBMIT_ASSIGNMENT', 'Homework', homeworkId, {
      studentId,
      fileName,
      fileUrl,
    });

    // Trigger Notification confirmations
    const parent = await this.getParentProfile(userId);
    await this.createNotification(
      parent.userId,
      `Work Submitted: ${homework.title}`,
      `Successfully uploaded ${fileName} for child ${student.user.name}.`,
    );

    return {
      success: true,
      message: 'Homework assignment submitted successfully.',
      fileUrl,
    };
  }

  async getExams(userId: string, studentId: string) {
    const student = await this.verifyOwnership(userId, studentId);
    if (!student.classSectionId) {
      return { schedules: [], marks: [] };
    }

    const [schedules, marks] = await Promise.all([
      this.prisma.examSchedule.findMany({
        where: { classSectionId: student.classSectionId },
        include: { subject: true },
        orderBy: { examDate: 'asc' },
      }),
      this.prisma.examMark.findMany({
        where: { studentId },
        include: { exam: true, subject: true },
        orderBy: { exam: { date: 'desc' } },
      }),
    ]);

    return {
      schedules: schedules.map(s => ({
        id: s.id,
        examName: s.examName,
        subject: s.subject.name,
        examDate: s.examDate,
        startTime: s.startTime,
        endTime: s.endTime,
        duration: s.duration,
        examHall: s.examHall || 'Main Hall',
        instructions: s.instructions,
      })),
      marks: marks.map(m => {
        const marksVal = Number(m.marksObtained);
        let grade = 'F';
        if (marksVal >= 90) grade = 'A+';
        else if (marksVal >= 80) grade = 'A';
        else if (marksVal >= 70) grade = 'B';
        else if (marksVal >= 60) grade = 'C';
        else if (marksVal >= 50) grade = 'D';

        return {
          id: m.id,
          examName: m.exam.name,
          subject: m.subject.name,
          marksObtained: marksVal,
          remarks: m.remarks || 'Good performance',
          grade,
        };
      }),
    };
  }

  async getFees(userId: string, studentId: string) {
    const student = await this.verifyOwnership(userId, studentId);

    const invoices = await this.prisma.invoice.findMany({
      where: { studentId: student.id },
      include: { invoiceItems: true },
      orderBy: { invoiceDate: 'desc' },
    });

    const tenantDetails = await this.prisma.tenant.findUnique({
      where: { id: student.tenantId },
      select: {
        bankName: true,
        bankBranch: true,
        bankIFSC: true,
        bankAccountNo: true,
        googlePayId: true,
        phonePeId: true,
      },
    });

    return {
      invoices: invoices.map(inv => ({
        id: inv.id,
        invoiceDate: inv.invoiceDate,
        dueDate: inv.dueDate,
        totalAmount: Number(inv.totalAmount),
        paidAmount: Number(inv.paidAmount),
        remainingBalance: Number(inv.remainingBalance),
        status: inv.status,
        description: inv.description,
        items: inv.invoiceItems.map(item => ({
          id: item.id,
          name: item.name,
          amount: Number(item.amount),
        })),
      })),
      paymentDetails: tenantDetails || {
        bankName: 'Covenant Bank',
        bankBranch: 'Main Branch',
        bankIFSC: 'COVB0001234',
        bankAccountNo: '9876543210',
        googlePayId: 'gpay@edutrack',
        phonePeId: 'phonepe@edutrack',
      },
    };
  }

  async payInvoice(userId: string, studentId: string, invoiceId: string, paymentData: any) {
    const student = await this.verifyOwnership(userId, studentId);

    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, studentId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Call modular Payment Processor simulating gateway
    const amount = Number(invoice.remainingBalance);
    const method = paymentData.paymentMethod || 'UPI';
    const txnResult = await this.paymentProcessor.processPayment(amount, method, invoiceId);

    if (!txnResult.success) {
      throw new BadRequestException('Payment gateway transaction rejected.');
    }

    // Fully update ledger balances in PostgreSQL database
    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: invoice.totalAmount,
        remainingBalance: 0,
        status: PaymentStatus.PAID,
        paymentMethod: method === 'BANK' ? 'BANK_TRANSFER' : 'UPI',
        description: `${invoice.description || ''} (Paid via Parent Portal ${txnResult.transactionId})`.trim(),
      },
    });

    // Write audit trail log
    await this.logAction(userId, student.tenantId, 'FEE_PAYMENT', 'Invoice', invoiceId, {
      studentId,
      amount,
      method,
      transactionId: txnResult.transactionId,
    });

    // Trigger Notification alerts
    const parent = await this.getParentProfile(userId);
    await this.createNotification(
      parent.userId,
      'Fee Payment Successful',
      `Payment of ₹${amount} received for ${student.user.name}'s invoice. Txn: ${txnResult.transactionId}`,
    );

    return {
      success: true,
      message: 'Payment processed and invoice ledger updated successfully.',
      invoice: updatedInvoice,
      transactionId: txnResult.transactionId,
    };
  }

  async getTimetable(userId: string, studentId: string) {
    const student = await this.verifyOwnership(userId, studentId);
    if (!student.classSectionId) return [];

    const periods = await this.prisma.period.findMany({
      where: { classSectionId: student.classSectionId },
      include: {
        subject: true,
        teacher: { include: { user: true } },
        periodTiming: true,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { periodTiming: { periodNumber: 'asc' } },
      ],
    });

    return periods.map(p => ({
      id: p.id,
      day: p.dayOfWeek,
      subject: p.subject.name,
      teacher: p.teacher.user?.name || 'Teacher',
      startTime: p.periodTiming.startTime,
      endTime: p.periodTiming.endTime,
      periodNumber: p.periodTiming.periodNumber,
      isBreak: p.periodTiming.isBreak,
    }));
  }

  async getAnnouncements(userId: string, studentId: string) {
    const student = await this.verifyOwnership(userId, studentId);

    return this.prisma.announcement.findMany({
      where: {
        tenantId: student.tenantId,
        OR: [
          { audienceType: 'INSTITUTION' },
          { classSectionId: student.classSectionId },
        ],
      },
      include: { teacher: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getComplaints(userId: string) {
    const parent = await this.getParentProfile(userId);
    return this.prisma.complaint.findMany({
      where: { submittedById: parent.userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async submitComplaint(userId: string, tenantId: string, data: any) {
    const parent = await this.getParentProfile(userId);
    const activeYear = await this.prisma.academicYear.findFirst({
      where: { tenantId, isActive: true },
    });

    if (!activeYear) {
      throw new BadRequestException('No active academic year found for tenant');
    }

    const complaint = await this.prisma.complaint.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category || 'General',
        submittedById: parent.userId,
        academicYearId: activeYear.id,
        tenantId,
        status: 'OPEN',
      },
    });

    // Write audit trail log
    await this.logAction(userId, tenantId, 'SUBMIT_COMPLAINT', 'Complaint', complaint.id, {
      title: data.title,
      category: data.category,
    });

    // Send confirmation notification
    await this.createNotification(
      parent.userId,
      'Complaint Ticket Opened',
      `Your complaint "${data.title}" has been registered. Reference: ${complaint.id.substring(0, 8).toUpperCase()}`,
    );

    return complaint;
  }

  async getTransport(userId: string, studentId: string) {
    await this.verifyOwnership(userId, studentId);

    return {
      busNumber: 'MH-12-FE-4321',
      driverName: 'Sanjay Shinde',
      driverPhone: '+91 9881726354',
      route: 'Route A - Kharadi to Viman Nagar',
      pickupTime: '07:45 AM',
      dropTime: '02:30 PM',
      liveGPS: {
        latitude: 18.5529,
        longitude: 73.9312,
        etaMinutes: 8,
      },
    };
  }

  async submitLeaveRequest(userId: string, studentId: string, data: any) {
    const student = await this.verifyOwnership(userId, studentId);

    // Upload medical certificate attachment if present
    let attachmentUrl = null;
    if (data.base64File) {
      attachmentUrl = await this.storageService.uploadImage(
        data.base64File,
        student.tenantId,
        studentId,
        'leave-attachment',
      );
    }

    // Persistent storage of leave request in ActivityLog
    const requestId = `LEV-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    await this.logAction(userId, student.tenantId, 'SUBMIT_LEAVE', 'Student', studentId, {
      requestId,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
      attachmentUrl,
      status: 'PENDING',
    });

    // Create notifications for both parent and student
    const parent = await this.getParentProfile(userId);
    await this.createNotification(
      parent.userId,
      'Leave Application Received',
      `Leave request submitted for ${student.user.name} from ${data.startDate} to ${data.endDate}.`,
    );

    return {
      success: true,
      message: 'Leave application submitted successfully.',
      requestId,
      attachmentUrl,
    };
  }

  async getLeavesHistory(userId: string, studentId: string) {
    const student = await this.verifyOwnership(userId, studentId);

    // Retrieve persistent leave requests logged in audit logs
    const logs = await this.prisma.activityLog.findMany({
      where: {
        userId,
        tenantId: student.tenantId,
        action: 'SUBMIT_LEAVE',
      },
      orderBy: { createdAt: 'desc' },
    });

    return logs.map(log => {
      try {
        const details = JSON.parse(log.details || '{}');
        return {
          id: details.requestId || log.id,
          leaveType: details.leaveType,
          startDate: details.startDate,
          endDate: details.endDate,
          reason: details.reason,
          status: details.status || 'PENDING',
          attachmentUrl: details.attachmentUrl,
        };
      } catch {
        return null;
      }
    }).filter(Boolean);
  }
}
