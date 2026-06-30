import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TenantContext } from '../tenants/tenant.context';
import { Role, PaymentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  private getTenantId(): string {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('No active school tenant context found');
    }
    return tenantId;
  }

  async createStudent(data: any) {
    const tenantId = this.getTenantId();
    const emailLower = data.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({
      where: { email: emailLower },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const defaultPassword = data.password || 'Welcome@123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    return this.prisma.$transaction(async (tx) => {
      let classSectionId = data.classSectionId;
      if (!classSectionId && data.selectedClass && data.selectedSection && data.academicYear) {
        const ay = await tx.academicYear.findFirst({
          where: { name: data.academicYear, tenantId }
        });
        if (ay) {
          const cls = await tx.class.findFirst({
            where: { name: data.selectedClass, academicYearId: ay.id, tenantId }
          });
          if (cls) {
            const sec = await tx.section.findFirst({
              where: { name: data.selectedSection, tenantId }
            });
            if (sec) {
              const cs = await tx.classSection.findFirst({
                where: { classId: cls.id, sectionId: sec.id, tenantId }
              });
              if (cs) {
                classSectionId = cs.id;
              }
            }
          }
        }
      }

      const normalizedPhone = data.phone ? data.phone.replace(/\D/g, '').slice(-10) : null;
      const user = await tx.user.create({
        data: {
          email: emailLower,
          name: `${data.firstName} ${data.lastName}`,
          passwordHash,
          role: Role.STUDENT,
          phone: normalizedPhone,
          tenantId,
        },
      });

      const profile = await tx.studentProfile.create({
        data: {
          userId: user.id,
          rollNo: data.rollNo,
          fatherName: data.fatherName,
          motherName: data.motherName,
          aadharNo: data.aadharNo,
          classSectionId: classSectionId || null,
          tenantId,
        },
      });

      // Automated Invoice Generation during Onboarding
      const feeItems = data.feeItems || [];
      if (feeItems.length > 0) {
        const concessionVal = Number(data.concessionAmount) || 0;
        
        const processedItems = [...feeItems];
        if (concessionVal > 0) {
          processedItems.push({
            name: 'Discount Concession',
            amount: -concessionVal,
          });
        }

        const totalAmount = processedItems.reduce((sum, item) => sum + Number(item.amount), 0);

        const invoice = await tx.invoice.create({
          data: {
            studentId: profile.id,
            invoiceDate: new Date(),
            dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
            totalAmount,
            paidAmount: 0,
            remainingBalance: totalAmount,
            status: PaymentStatus.UNPAID,
            description: `Admission Fees Invoice for Academic Year ${data.academicYear || '2026-2027'}`,
            tenantId,
          },
        });

        await tx.invoiceItem.createMany({
          data: processedItems.map(item => ({
            invoiceId: invoice.id,
            name: item.name,
            amount: item.amount,
            tenantId,
          })),
        });
      }

      return { user, profile };
    });
  }

  async searchStudents(searchTerm?: string, classId?: string, sectionId?: string, page = 1, limit = 100) {
    const tenantId = this.getTenantId();
    const skip = (page - 1) * limit;

    return this.prisma.studentProfile.findMany({
      where: {
        user: {
          tenantId,
          isActive: true,
          ...(searchTerm ? {
            OR: [
              { name: { contains: searchTerm, mode: 'insensitive' } },
              { email: { contains: searchTerm, mode: 'insensitive' } },
              { phone: { contains: searchTerm, mode: 'insensitive' } },
            ]
          } : {})
        },
        ...(classId || sectionId ? {
          classSection: {
            classId: classId || undefined,
            sectionId: sectionId || undefined,
          }
        } : {})
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        classSection: {
          include: {
            class: true,
            section: true,
          }
        },
        invoices: {
          where: { tenantId },
          select: { remainingBalance: true, paidAmount: true }
        }
      },
      orderBy: {
        user: {
          name: 'asc'
        }
      },
      skip,
      take: limit,
    });
  }

  async getStudentDetails(studentId: string) {
    const tenantId = this.getTenantId();

    const profile = await this.prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        classSection: {
          include: {
            class: true,
            section: true,
          }
        },
        parentProfile: {
          include: {
            user: true,
          }
        },
        invoices: {
          where: { tenantId },
          include: { invoiceItems: true },
          orderBy: { invoiceDate: 'desc' }
        },
        examMarks: {
          where: { tenantId },
          include: { exam: true, subject: true },
          orderBy: { exam: { date: 'desc' } }
        },
        attendances: {
          where: { tenantId },
          include: { attendanceSession: true },
          orderBy: { attendanceSession: { date: 'desc' } },
          take: 50,
        }
      }
    });

    if (!profile || profile.user.tenantId !== tenantId) {
      throw new NotFoundException('Student profile not found');
    }

    return profile;
  }

  // ── CSV BULK IMPORT FRAMEWORK ───────────────────────────────────────────────

  async importStudentsBulk(studentRows: any[]) {
    const tenantId = this.getTenantId();
    let successCount = 0;
    const errors: string[] = [];

    // Cache lists to resolve names to primary keys
    const classes = await this.prisma.class.findMany({ where: { tenantId } });
    const sections = await this.prisma.section.findMany({ where: { tenantId } });
    const classSections = await this.prisma.classSection.findMany({
      where: { tenantId },
      include: { class: true, section: true }
    });

    const activeYear = await this.prisma.academicYear.findFirst({
      where: { tenantId, isActive: true }
    });

    const defaultPassword = 'Welcome@123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    for (let i = 0; i < studentRows.length; i++) {
      const row = studentRows[i];
      try {
        const email = row['Email'] || row['email'];
        const firstName = row['First Name'] || row['firstName'];
        const lastName = row['Last Name'] || row['lastName'];
        const phone = row['Phone'] || row['phone'];
        const className = row['Class'] || row['class'];
        const sectionName = row['Section'] || row['section'];
        const rollNo = row['Roll No'] || row['rollNo'];
        const fatherName = row['Father Name'] || row['fatherName'];
        const motherName = row['Mother Name'] || row['motherName'];
        const aadharNo = row['Aadhar No'] || row['aadharNo'];

        if (!email || !lastName || !className || !sectionName) {
          errors.push(`Row ${i + 1}: Missing mandatory fields (Email, Last Name, Class, Section)`);
          continue;
        }

        // Resolve class name
        let matchedClass = classes.find(c => c.name.toLowerCase() === className.toLowerCase().trim());
        if (!matchedClass && activeYear) {
          matchedClass = await this.prisma.class.create({
            data: {
              name: className.trim(),
              academicYearId: activeYear.id,
              tenantId
            }
          });
          classes.push(matchedClass);
        }

        if (!matchedClass) {
          errors.push(`Row ${i + 1}: Class "${className}" could not be resolved or created (No active academic year defined)`);
          continue;
        }

        // Resolve section name
        let matchedSection = sections.find(s => s.name.toLowerCase() === sectionName.toLowerCase().trim());
        if (!matchedSection) {
          matchedSection = await this.prisma.section.create({
            data: {
              name: sectionName.trim(),
              tenantId
            }
          });
          sections.push(matchedSection);
        }

        // Resolve classSection mapping
        let matchedClassSection = classSections.find(
          cs => cs.classId === matchedClass.id && cs.sectionId === matchedSection.id
        );

        if (!matchedClassSection) {
          matchedClassSection = await this.prisma.classSection.create({
            data: {
              classId: matchedClass.id,
              sectionId: matchedSection.id,
              tenantId,
              strength: 0
            },
            include: { class: true, section: true }
          });
          classSections.push(matchedClassSection);
        }

        const emailLower = email.toLowerCase().trim();
        const existingUser = await this.prisma.user.findUnique({ where: { email: emailLower } });
        if (existingUser) {
          errors.push(`Row ${i + 1}: Email "${email}" is already registered`);
          continue;
        }

        // Check if phone number is already registered to prevent Prisma user.create unique constraint crash
        const normalizedPhone = phone ? String(phone).replace(/\D/g, '').slice(-10) : null;
        let finalPhone = normalizedPhone;
        if (normalizedPhone) {
          const phoneExists = await this.prisma.user.findFirst({
            where: { phone: normalizedPhone }
          });
          if (phoneExists) {
            finalPhone = null; // Bypassed duplicate phone gracefully to allow student import success
          }
        }

        // Perform user creation transaction
        await this.prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              email: emailLower,
              name: `${firstName || ''} ${lastName}`.trim(),
              passwordHash,
              role: Role.STUDENT,
              phone: finalPhone,
              tenantId,
            }
          });

          const profile = await tx.studentProfile.create({
            data: {
              userId: user.id,
              rollNo: rollNo ? String(rollNo) : null,
              fatherName,
              motherName,
              aadharNo: aadharNo ? String(aadharNo) : null,
              classSectionId: matchedClassSection.id,
              tenantId,
            }
          });

          // Create standard fee invoice for this student
          const standardFees = [
            { name: `Tuition Fees - ${matchedClass.name}`, amount: 12000.00 },
            { name: 'Admission Registration Fee', amount: 3000.00 },
            { name: 'Library Membership Fee', amount: 800.00 }
          ];

          const totalAmount = standardFees.reduce((sum, item) => sum + item.amount, 0);

          const invoice = await tx.invoice.create({
            data: {
              studentId: profile.id,
              invoiceDate: new Date(),
              dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
              totalAmount,
              paidAmount: 0,
              remainingBalance: totalAmount,
              status: PaymentStatus.UNPAID,
              description: `Admission Fees Invoice for Academic Year ${matchedClass.name}`,
              tenantId,
            },
          });

          await tx.invoiceItem.createMany({
            data: standardFees.map(item => ({
              invoiceId: invoice.id,
              name: item.name,
              amount: item.amount,
              tenantId,
            })),
          });
        });

        successCount++;
      } catch (err) {
        errors.push(`Row ${i + 1} Error: ${err.message}`);
      }
    }

    return {
      totalRows: studentRows.length,
      successCount,
      errors,
    };
  }

  async getPromotionCandidates(sourceYearId: string, className?: string, sectionName?: string) {
    const tenantId = this.getTenantId();

    const students = await this.prisma.studentProfile.findMany({
      where: {
        user: { tenantId, isActive: true },
        classSection: {
          class: {
            academicYearId: sourceYearId,
            name: className && className !== 'ALL' ? className : undefined,
          },
          section: {
            name: sectionName ? sectionName : undefined,
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        classSection: {
          include: {
            class: true,
            section: true,
          }
        },
        invoices: {
          where: { tenantId },
          select: {
            totalAmount: true,
            paidAmount: true,
            remainingBalance: true,
            status: true,
          }
        }
      },
      orderBy: {
        user: { name: 'asc' }
      }
    });

    return students.map(s => {
      const unpaidInvoices = s.invoices.filter(inv => inv.status !== 'VOIDED');
      const balanceDue = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.remainingBalance), 0);
      const paidAmount = unpaidInvoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);

      return {
        id: s.id,
        name: s.user.name,
        email: s.user.email,
        rollNo: s.rollNo || '',
        class: s.classSection?.class.name || '',
        section: s.classSection?.section.name || '',
        fatherName: s.fatherName || '',
        motherName: s.motherName || '',
        aadharNo: s.aadharNo || '',
        phone: s.user.phone || '',
        balanceDue,
        paidAmount,
        parentEmail: '',
      };
    });
  }

  async promoteStudents(payload: {
    studentIds: string[];
    sourceYearId: string;
    targetYearId: string;
    targetClassName: string;
    targetSectionName?: string;
  }) {
    const tenantId = this.getTenantId();
    const { studentIds, sourceYearId, targetYearId, targetClassName, targetSectionName } = payload;

    if (!studentIds || studentIds.length === 0) {
      throw new BadRequestException('No students selected for promotion');
    }

    const isBulkGlobal = targetClassName === 'ALL';

    const sourceYear = await this.prisma.academicYear.findFirst({
      where: { id: sourceYearId, tenantId }
    });
    const targetYear = await this.prisma.academicYear.findFirst({
      where: { id: targetYearId, tenantId }
    });
    if (!sourceYear || !targetYear) {
      throw new NotFoundException('Source or Target Academic Year not found');
    }

    const classes = await this.prisma.class.findMany({
      where: { academicYearId: targetYearId, tenantId }
    });
    const sections = await this.prisma.section.findMany({
      where: { tenantId }
    });
    const classSections = await this.prisma.classSection.findMany({
      where: { tenantId },
      include: { class: true, section: true }
    });

    return this.prisma.$transaction(async (tx) => {
      const promotedCount = studentIds.length;

      for (const studentId of studentIds) {
        const profile = await tx.studentProfile.findFirst({
          where: { id: studentId, user: { tenantId } },
          include: {
            user: true,
            classSection: {
              include: { class: true, section: true }
            }
          }
        });

        if (!profile) continue;

        const currentClassName = profile.classSection?.class.name;
        const currentSectionName = profile.classSection?.section.name;

        const resolvedClassName = isBulkGlobal 
          ? getNextClass(currentClassName)
          : targetClassName;

        if (!resolvedClassName) continue;

        const targetClass = classes.find(
          c => c.name.toLowerCase() === resolvedClassName.toLowerCase()
        );
        if (!targetClass) {
          throw new BadRequestException(`Target class "${resolvedClassName}" does not exist in Academic Year ${targetYear.name}`);
        }

        const resolvedSectionName = targetSectionName || currentSectionName || 'Section A';
        const targetSection = sections.find(
          s => s.name.toLowerCase() === resolvedSectionName.toLowerCase()
        );
        if (!targetSection) {
          throw new BadRequestException(`Section "${resolvedSectionName}" not found`);
        }

        let targetClassSection = classSections.find(
          cs => cs.classId === targetClass.id && cs.sectionId === targetSection.id
        );

        if (!targetClassSection) {
          targetClassSection = await tx.classSection.create({
            data: {
              classId: targetClass.id,
              sectionId: targetSection.id,
              tenantId,
              strength: 0
            },
            include: { class: true, section: true }
          });
        }

        await tx.studentProfile.update({
          where: { id: studentId },
          data: { classSectionId: targetClassSection.id }
        });

        const oldInvoices = await tx.invoice.findMany({
          where: {
            studentId,
            tenantId,
            invoiceDate: {
              gte: sourceYear.startDate,
              lte: sourceYear.endDate
            },
            status: {
              in: [PaymentStatus.UNPAID, PaymentStatus.PARTIALLY_PAID]
            }
          }
        });

        for (const oldInv of oldInvoices) {
          await tx.invoice.update({
            where: { id: oldInv.id },
            data: {
              status: PaymentStatus.PAID,
              paidAmount: oldInv.totalAmount,
              remainingBalance: 0
            }
          });
        }

        const standardFees = [
          { name: `Tuition Fees - ${resolvedClassName}`, amount: 12000.00 },
          { name: 'Admission Registration Fee', amount: 3000.00 },
          { name: 'Library Membership Fee', amount: 800.00 }
        ];

        const totalAmount = standardFees.reduce((sum, item) => sum + item.amount, 0);

        const newInvoice = await tx.invoice.create({
          data: {
            studentId,
            invoiceDate: new Date(),
            dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
            totalAmount,
            paidAmount: 0,
            remainingBalance: totalAmount,
            status: PaymentStatus.UNPAID,
            description: `Auto-generated Invoice upon promotion to ${resolvedClassName}`,
            tenantId
          }
        });

        await tx.invoiceItem.createMany({
          data: standardFees.map(item => ({
            invoiceId: newInvoice.id,
            name: item.name,
            amount: item.amount,
            tenantId
          }))
        });

        await tx.activityLog.create({
          data: {
            userId: profile.userId,
            action: 'RECORD_UPDATE',
            entityName: 'StudentProfile',
            entityId: studentId,
            details: `Promoted from ${currentClassName || '—'} (${currentSectionName || '—'}) to ${resolvedClassName} (${resolvedSectionName})`,
            tenantId
          }
        });
      }

      return {
        success: true,
        promotedCount
      };
    });
  }

  async getParents() {
    const tenantId = this.getTenantId();
    return this.prisma.parentProfile.findMany({
      where: {
        user: { tenantId }
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true }
        },
        students: {
          include: {
            user: { select: { name: true } }
          }
        }
      },
      orderBy: {
        user: { name: 'asc' }
      }
    });
  }
}

function getNextClass(currentClass: string): string {
  const CLASS_ORDER = [
    'Nursery', 'LKG', 'UKG',
    'Class-1', 'Class-2', 'Class-3', 'Class-4', 'Class-5', 'Class-6', 'Class-7', 'Class-8', 'Class-9', 'Class-10',
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
  ];
  if (!currentClass) return '';
  const normalized = currentClass.trim().replace(/\s+/g, ' ');
  const normalizedWithDash = currentClass.trim().replace(/\s+/g, '-');
  
  let idx = CLASS_ORDER.findIndex(c => c.toLowerCase() === normalized.toLowerCase() || c.toLowerCase() === normalizedWithDash.toLowerCase());
  if (idx >= 0 && idx < CLASS_ORDER.length - 1) {
    const currentIsGrade = normalized.toLowerCase().startsWith('grade');
    const nextClass = CLASS_ORDER[idx + 1];
    const nextIsGrade = nextClass.toLowerCase().startsWith('grade');
    if (currentIsGrade === nextIsGrade) {
      return nextClass;
    }
  }
  
  const salesforceOrder = [
    'Nursery', 'LKG', 'UKG',
    'Class-1', 'Class-2', 'Class-3', 'Class-4', 'Class-5', 'Class-6', 'Class-7', 'Class-8', 'Class-9', 'Class-10'
  ];
  const gradeOrder = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
  ];
  
  let salesforceIdx = salesforceOrder.findIndex(c => c.toLowerCase() === normalizedWithDash.toLowerCase() || c.toLowerCase() === normalized.toLowerCase());
  if (salesforceIdx >= 0 && salesforceIdx < salesforceOrder.length - 1) {
    return salesforceOrder[salesforceIdx + 1];
  }
  
  let gradeIdx = gradeOrder.findIndex(c => c.toLowerCase() === normalized.toLowerCase() || c.toLowerCase() === normalizedWithDash.toLowerCase());
  if (gradeIdx >= 0 && gradeIdx < gradeOrder.length - 1) {
    return gradeOrder[gradeIdx + 1];
  }
  
  return '';
}

