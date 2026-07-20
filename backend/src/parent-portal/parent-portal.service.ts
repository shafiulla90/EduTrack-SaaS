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

    // 1. Total Outstanding Fees directly from BillingService single source of truth
    let pendingFees = 0;
    for (const childId of studentIds) {
      try {
        const billingInfo = await this.billingService.getStudentById(childId);
        pendingFees += Number(billingInfo.totalPendingBalance || 0);
      } catch (err) {
        console.error(`Failed to fetch billing info for student ${childId}:`, err);
      }
    }

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

    // 6. Student-specific Today's Attendance Summary
    const todayUTC = parseAttendanceDate(null);
    let markedChildrenCount = 0;
    let presentChildrenCount = 0;

    for (const child of children) {
      if (!child.classSectionId) continue;

      const session = await this.prisma.attendanceSession.findFirst({
        where: {
          classSectionId: child.classSectionId,
          date: todayUTC,
          tenantId,
        },
        include: {
          attendances: {
            where: { studentId: child.id },
          },
        },
      });

      if (session) {
        markedChildrenCount++;
        const record = session.attendances[0];
        const status = record ? record.status : 'PRESENT';
        if (status === 'PRESENT' || status === 'LATE') {
          presentChildrenCount++;
        }
      }
    }

    let todayAttendanceStr = 'Attendance Not Taken Yet';
    if (markedChildrenCount > 0) {
      if (children.length === 1) {
        todayAttendanceStr = `${presentChildrenCount}/${children.length} Present`;
      } else {
        todayAttendanceStr = `${presentChildrenCount}/${children.length} Children Present`;
      }
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
    const hasAttendanceData = total > 0;
    const attendancePercentage = hasAttendanceData ? Math.round((present / total) * 100) : null;

    // Check today's submission status for this child
    const todayUTC = parseAttendanceDate(null);
    let todayAttendanceSubmitted = false;
    let todayAttendanceStatus = 'NOT_TAKEN';

    if (student.classSectionId) {
      const todaySession = await this.prisma.attendanceSession.findFirst({
        where: {
          classSectionId: student.classSectionId,
          date: todayUTC,
          tenantId: student.tenantId,
        },
        include: {
          attendances: {
            where: { studentId },
          },
        },
      });

      if (todaySession) {
        todayAttendanceSubmitted = true;
        const record = todaySession.attendances[0];
        todayAttendanceStatus = record ? record.status : 'PRESENT';
      }
    }

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
        hasAttendanceData,
        todayAttendanceSubmitted,
        todayAttendanceStatus,
        pendingHomework,
        pendingFees,
        upcomingExamsCount: upcomingExams.length,
      },
      upcomingExams,
      recentMarks,
    };
  }

  async getAttendance(userId: string, studentId: string) {
    const student = await this.verifyOwnership(userId, studentId);

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

    const hasAttendanceData = total > 0;
    const rate = hasAttendanceData ? Math.round(((present + late) / total) * 100) : null;

    // Check today's submission state
    const todayUTC = parseAttendanceDate(null);
    let todayAttendanceSubmitted = false;
    let todayAttendanceStatus = 'NOT_TAKEN';

    if (student.classSectionId) {
      const todaySession = await this.prisma.attendanceSession.findFirst({
        where: {
          classSectionId: student.classSectionId,
          date: todayUTC,
          tenantId: student.tenantId,
        },
        include: {
          attendances: {
            where: { studentId },
          },
        },
      });

      if (todaySession) {
        todayAttendanceSubmitted = true;
        const record = todaySession.attendances[0];
        todayAttendanceStatus = record ? record.status : 'PRESENT';
      }
    }

    return {
      summary: {
        total,
        present,
        absent,
        late,
        excused,
        attendanceRate: rate,
        hasAttendanceData,
        todayAttendanceSubmitted,
        todayAttendanceStatus,
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

    // Single source of truth: fetch live billing and ledger balance directly from BillingService
    const billingSummary = await this.billingService.getStudentById(studentId);

    const dbInvoices = await this.prisma.invoice.findMany({
      where: { studentId: student.id },
      include: {
        invoiceItems: true,
        opportunity: {
          include: {
            academicYear: true,
            class: true,
            section: true,
          },
        },
      },
      orderBy: { invoiceDate: 'desc' },
    });

    const tenantDetails = await this.prisma.tenant.findUnique({
      where: { id: student.tenantId },
      select: {
        name: true,
        address: true,
        phone: true,
        email: true,
        logoUrl: true,
        subtitle: true,
        bankName: true,
        bankBranch: true,
        bankIFSC: true,
        bankAccountNo: true,
        googlePayId: true,
        phonePeId: true,
      },
    });

    const paymentLogs = await this.prisma.activityLog.findMany({
      where: {
        tenantId: student.tenantId,
        action: 'FEE_PAYMENT',
        entityName: 'Invoice',
      },
    });

    const mappedInvoices = dbInvoices.map(inv => {
      const log = paymentLogs.find(l => l.entityId === inv.id);
      let transactionId = `TXN-${inv.id.substring(0, 8).toUpperCase()}`;
      if (log && log.details) {
        try {
          const parsed = JSON.parse(log.details);
          if (parsed.transactionId) transactionId = parsed.transactionId;
        } catch {}
      }

      return {
        id: inv.id,
        opportunityId: inv.opportunityId,
        invoiceNo: `INV-${inv.id.substring(0, 8).toUpperCase()}`,
        receiptNo: `REC-${inv.id.substring(0, 8).toUpperCase()}`,
        invoiceDate: inv.invoiceDate,
        dueDate: inv.dueDate,
        totalAmount: Number(inv.totalAmount),
        paidAmount: Number(inv.paidAmount),
        remainingBalance: Number(inv.remainingBalance),
        status: inv.status,
        paymentMethod: inv.paymentMethod || 'UPI',
        transactionId,
        description: inv.description || 'School Fees Statement',
        academicYear: inv.opportunity?.academicYear?.name || '2026-2027',
        className: student.classSection?.class.name || inv.opportunity?.class?.name || 'N/A',
        sectionName: student.classSection?.section.name || inv.opportunity?.section?.name || 'N/A',
        studentName: student.user.name,
        rollNo: student.rollNo || 'N/A',
        fatherName: student.fatherName || 'N/A',
        motherName: student.motherName || 'N/A',
        items: inv.invoiceItems.map(item => ({
          id: item.id,
          name: item.name,
          amount: Number(item.amount),
          oliId: item.opportunityLineItemId,
          productId: item.productId,
        })),
      };
    });

    // If no unpaid database invoice exists yet, but BillingService reports a pending balance > 0,
    // read the open opportunity line items from BillingService so the parent can initiate payment via BillingService.createInvoice()
    const openOppId = billingSummary.account?.opportunities?.[0]?.id;
    const hasUnpaidDbInvoice = mappedInvoices.some(inv => inv.status !== 'PAID' && inv.status !== 'VOIDED');

    if (!hasUnpaidDbInvoice && billingSummary.totalPendingBalance > 0 && openOppId) {
      const activeOpp = await this.prisma.opportunity.findUnique({
        where: { id: openOppId },
        include: {
          academicYear: true,
          opportunityLineItems: {
            include: { product: true }
          }
        }
      });

      if (activeOpp) {
        const lineItems = activeOpp.opportunityLineItems.map(oli => {
          const itemTotal = Number(oli.unitPrice) * Number(oli.quantity);
          const itemDiscount = (itemTotal * Number(oli.discount)) / 100;
          return {
            id: oli.id,
            name: oli.product?.name || 'Fee Particular',
            amount: itemTotal - itemDiscount,
            oliId: oli.id,
            productId: oli.productId,
          };
        });

        if (billingSummary.previousYearPending > 0) {
          lineItems.push({
            id: 'PREV_YEAR_DUE_CF',
            name: 'Previous Years Carried Forward Dues',
            amount: billingSummary.previousYearPending,
            oliId: 'PREV_YEAR_DUE_CF',
            productId: 'PREV_YEAR_DUE_CF',
          });
        }

        mappedInvoices.unshift({
          id: `OPP-${activeOpp.id}`,
          opportunityId: activeOpp.id,
          invoiceNo: `STMT-${student.rollNo || student.id.substring(0, 5).toUpperCase()}`,
          receiptNo: 'REC-PENDING',
          invoiceDate: new Date(),
          dueDate: activeOpp.closeDate || new Date(),
          totalAmount: billingSummary.totalPendingBalance + billingSummary.paidAmount,
          paidAmount: billingSummary.paidAmount,
          remainingBalance: billingSummary.totalPendingBalance,
          status: billingSummary.paidAmount > 0 ? 'PARTIALLY_PAID' : 'UNPAID',
          paymentMethod: 'UPI',
          transactionId: 'N/A',
          description: `Academic Fee Statement ${activeOpp.academicYear?.name || '2026-2027'}`,
          academicYear: activeOpp.academicYear?.name || '2026-2027',
          className: student.classSection?.class.name || 'N/A',
          sectionName: student.classSection?.section.name || 'N/A',
          studentName: student.user.name,
          rollNo: student.rollNo || 'N/A',
          fatherName: student.fatherName || 'N/A',
          motherName: student.motherName || 'N/A',
          items: lineItems,
        } as any);
      }
    }

    return {
      summary: billingSummary,
      invoices: mappedInvoices,
      paymentDetails: tenantDetails || {
        name: 'Cambridge International School',
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
    const method = paymentData.paymentMethod || 'UPI';

    if (invoiceId.startsWith('OPP-')) {
      const opportunityId = invoiceId.replace('OPP-', '');
      const activeOpp = await this.prisma.opportunity.findUnique({
        where: { id: opportunityId },
        include: {
          opportunityLineItems: true
        }
      });
      if (!activeOpp) {
        throw new NotFoundException('Fee Opportunity not found');
      }

      const billingSummary = await this.billingService.getStudentById(studentId);
      const selectedItems = activeOpp.opportunityLineItems.map(oli => {
        const itemTotal = Number(oli.unitPrice) * Number(oli.quantity);
        const itemDiscount = (itemTotal * Number(oli.discount)) / 100;
        return {
          oliId: oli.id,
          productId: oli.productId,
          amount: itemTotal - itemDiscount,
        };
      });

      if (billingSummary.previousYearPending > 0) {
        selectedItems.push({
          oliId: 'PREV_YEAR_DUE_CF',
          productId: 'PREV_YEAR_DUE_CF',
          amount: billingSummary.previousYearPending,
        });
      }

      // Delegate directly to BillingService.createInvoice() to handle full ledger & database persistence
      const createdInvoiceId = await this.billingService.createInvoice(
        opportunityId,
        studentId,
        selectedItems,
        method,
      );

      const createdInvoice = await this.prisma.invoice.findUnique({
        where: { id: createdInvoiceId },
        include: { invoiceItems: true }
      });

      const txnId = `TXN-${createdInvoiceId.substring(0, 8).toUpperCase()}`;

      await this.logAction(userId, student.tenantId, 'FEE_PAYMENT', 'Invoice', createdInvoiceId, {
        studentId,
        amount: Number(createdInvoice?.totalAmount || 0),
        method,
        transactionId: txnId,
      });

      const parent = await this.getParentProfile(userId);
      await this.createNotification(
        parent.userId,
        'Fee Payment Successful',
        `Payment of ₹${createdInvoice?.totalAmount || 0} received for ${student.user.name}'s invoice. Txn: ${txnId}`,
      );

      return {
        success: true,
        message: 'Payment processed and official invoice created successfully via BillingService.',
        invoice: createdInvoice,
        transactionId: txnId,
      };
    }

    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, studentId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (invoice.status === PaymentStatus.PAID || Number(invoice.remainingBalance) === 0) {
      throw new BadRequestException('This invoice has already been paid.');
    }

    const amount = Number(invoice.remainingBalance);
    const txnResult = await this.paymentProcessor.processPayment(amount, method, invoiceId);

    if (!txnResult.success) {
      throw new BadRequestException('Payment gateway transaction rejected.');
    }

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

    if (invoice.opportunityId) {
      const oppInvoices = await this.prisma.invoice.findMany({
        where: {
          opportunityId: invoice.opportunityId,
          tenantId: student.tenantId,
          status: { not: PaymentStatus.VOIDED },
        },
      });
      const newTotalPaid = oppInvoices.reduce((sum, inv) => {
        if (inv.id === invoiceId) {
          return sum + Number(invoice.totalAmount);
        }
        return sum + Number(inv.paidAmount);
      }, 0);

      await this.prisma.opportunity.update({
        where: { id: invoice.opportunityId },
        data: { totalPaidAmount: newTotalPaid },
      }).catch(err => console.error('Failed to update opportunity totalPaidAmount:', err));
    }

    await this.logAction(userId, student.tenantId, 'FEE_PAYMENT', 'Invoice', invoiceId, {
      studentId,
      amount,
      method,
      transactionId: txnResult.transactionId,
    });

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
