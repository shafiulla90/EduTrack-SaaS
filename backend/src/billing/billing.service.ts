import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TenantContext } from '../tenants/tenant.context';
import { PaymentStatus, PaymentMethod, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { StorageService } from '../common/storage.service';

@Injectable()
export class BillingService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  private getTenantId(): string {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('No active school tenant context found');
    }
    return tenantId;
  }

  // ── OPPORTUNITY SERVICE LOGIC (Centralized trigger logic from Apex) ─────────

  async recalculatePaidAmount(oppId: string, tx?: any): Promise<number> {
    const tenantId = this.getTenantId();
    const db = tx || this.prisma;

    // Fetch all non-cancelled (not VOIDED) invoice items for this opportunity
    const invoiceItems = await db.invoiceItem.findMany({
      where: {
        tenantId,
        invoice: {
          opportunityId: oppId,
          status: { not: PaymentStatus.VOIDED },
        },
      },
    });

    const totalPaid = invoiceItems.reduce((sum, item) => sum + Number(item.amount), 0);

    await db.opportunity.update({
      where: { id: oppId },
      data: {
        totalPaidAmount: totalPaid,
      },
    });

    return totalPaid;
  }

  // ── ACTIVE PRODUCTS (Pricebook Entries) ────────────────────────────────────

  async getActiveProducts(classId: string, academicYearId?: string) {
    const tenantId = this.getTenantId();

    if (!classId) {
      return [];
    }

    let classPriceBook;
    if (academicYearId) {
      // First try strong relation
      classPriceBook = await this.prisma.pricebook.findFirst({
        where: {
          tenantId,
          classId,
          academicYearId,
          isActive: true
        }
      });

      // Fallback to name matching
      if (!classPriceBook) {
        const classRecord = await this.prisma.class.findFirst({
          where: { id: classId, tenantId },
        });
        if (classRecord) {
          const className = classRecord.name;
          const priceBookName = className.replace('-', ' ');
          const priceBookNameAlt = className.replace(' ', '-');
          classPriceBook = await this.prisma.pricebook.findFirst({
            where: {
              tenantId,
              isActive: true,
              academicYearId,
              OR: [
                { name: { equals: priceBookName, mode: 'insensitive' } },
                { name: { equals: priceBookNameAlt, mode: 'insensitive' } },
                { name: { startsWith: priceBookName, mode: 'insensitive' } },
                { name: { startsWith: priceBookNameAlt, mode: 'insensitive' } },
              ],
            },
            orderBy: { academicYearId: 'asc' },
          });
        }
      }
    } else {
      // First try strong relation
      classPriceBook = await this.prisma.pricebook.findFirst({
        where: {
          tenantId,
          classId,
          isActive: true
        }
      });

      // Fallback to name matching
      if (!classPriceBook) {
        const classRecord = await this.prisma.class.findFirst({
          where: { id: classId, tenantId },
        });
        if (classRecord) {
          const className = classRecord.name;
          const priceBookName = className.replace('-', ' ');
          const priceBookNameAlt = className.replace(' ', '-');
          classPriceBook = await this.prisma.pricebook.findFirst({
            where: {
              tenantId,
              isActive: true,
              OR: [
                { name: { equals: priceBookName, mode: 'insensitive' } },
                { name: { equals: priceBookNameAlt, mode: 'insensitive' } },
              ],
            },
          });
        }
      }
    }

    if (!classPriceBook) {
      return [];
    }

    const entries = await this.prisma.pricebookEntry.findMany({
      where: {
        tenantId,
        isActive: true,
        pricebookId: classPriceBook.id,
        pricebook: { isActive: true },
        product: {
          isActive: true,
          productCode: { not: 'PREV_DUES' },
          name: { not: { contains: 'Previous' } },
        },
      },
      include: {
        product: true,
      },
      orderBy: { product: { name: 'asc' } },
      take: 1000,
    });

    return (entries as any[]).map(entry => ({
      id: entry.id,
      product2Id: entry.productId,
      productName: entry.product.name,
      productDescription: entry.product.description || '',
      unitPrice: Number(entry.unitPrice),
      pricebook2Id: entry.pricebookId,
    }));
  }

  // ── CREATE ADMISSION (Opportunities & Concessions) ─────────────────────────

  async createAdmission(studentData: any, selectedPricebookEntryIds: string[], concessionAmount: number) {
    const tenantId = this.getTenantId();

    // ── Email handling: generate a unique fallback if no email provided ──────
    let emailLower: string;
    if (studentData.email && studentData.email.trim()) {
      emailLower = studentData.email.toLowerCase().trim();
    } else {
      // Generate a unique, tenant-scoped email so no crash on empty email
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const firstName = (studentData.firstName || 'student').toLowerCase().replace(/\s+/g, '');
      const lastName = (studentData.lastName || '').toLowerCase().replace(/\s+/g, '');
      emailLower = `${firstName}${lastName ? '.' + lastName : ''}.${randomSuffix}@noemail.local`;
    }

    // ── Email uniqueness check (globally unique field in DB) ────────────────
    const existingUser = await this.prisma.user.findUnique({
      where: { email: emailLower },
    });
    if (existingUser) {
      throw new ConflictException('A user with this email is already registered in the system');
    }

    const defaultPassword = studentData.password || 'Welcome@123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    // ── Phone: make globally unique by prefixing with short tenantId ─────────
    // This allows the same phone number to exist across different schools.
    let normalizedPhone: string | null = null;
    if (studentData.phone && studentData.phone.trim()) {
      const digitsOnly = studentData.phone.replace(/\D/g, '').slice(-10);
      if (digitsOnly.length >= 10) {
        // Store as tenantId[:8]-phone to avoid cross-tenant unique constraint violations
        normalizedPhone = `${tenantId.substring(0, 8)}-${digitsOnly}`;
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // Resolve classSection
      let classSectionId = null;
      if (studentData.selectedClass && studentData.selectedSection) {
        let classSec = await tx.classSection.findFirst({
          where: {
            classId: studentData.selectedClass,
            sectionId: studentData.selectedSection,
            tenantId,
          },
        });
        if (!classSec) {
          classSec = await tx.classSection.create({
            data: {
              classId: studentData.selectedClass,
              sectionId: studentData.selectedSection,
              tenantId,
              strength: 0,
            },
          });
        }
        if (classSec) {
          classSectionId = classSec.id;
        }
      }

      // Create student user
      const user = await tx.user.create({
        data: {
          email: emailLower,
          name: `${studentData.firstName} ${studentData.lastName}`,
          passwordHash,
          role: Role.STUDENT,
          phone: normalizedPhone,
          tenantId,
        },
      });

      // Auto-generate roll number if not provided
      let finalRollNo = studentData.rollNo ? String(studentData.rollNo).trim() : '';
      if (classSectionId) {
        const existingStudents = await tx.studentProfile.findMany({
          where: { classSectionId, tenantId },
          select: { rollNo: true }
        });
        const rollNumbersSet = new Set(existingStudents.map(s => s.rollNo?.trim()).filter(Boolean));

        if (!finalRollNo || rollNumbersSet.has(finalRollNo)) {
          const parsedInts = existingStudents
            .map(s => parseInt(s.rollNo || '', 10))
            .filter(val => !isNaN(val));
          const nextRoll = parsedInts.length > 0 ? Math.max(...parsedInts) + 1 : 1;
          finalRollNo = String(nextRoll);
        }
      }

      let profilePhotoUrl: string | null = null;
      if (studentData.profilePhotoUrl && studentData.profilePhotoUrl.startsWith('data:')) {
        profilePhotoUrl = await this.storageService.uploadImage(studentData.profilePhotoUrl, tenantId, user.id, `student-${user.id}`);
      }

      // Create student profile
      const profile = await tx.studentProfile.create({
        data: {
          userId: user.id,
          rollNo: finalRollNo || null,
          fatherName: studentData.fatherName || null,
          motherName: studentData.motherName || null,
          aadharNo: studentData.aadharNo || null,
          classSectionId,
          profilePhotoUrl,
          tenantId,
        },
      });

      let academicYearName = '';
      if (studentData.academicYear) {
        const ay = await tx.academicYear.findUnique({
          where: { id: studentData.academicYear },
        });
        if (ay) academicYearName = ay.name;
      }

      // Create Opportunity (Admissions Opportunity)
      const opp = await tx.opportunity.create({
        data: {
          name: `${studentData.firstName} ${studentData.lastName} - Admission ${academicYearName}`.trim(),
          studentId: profile.id,
          stageName: 'Prospecting',
          closeDate: new Date(new Date().setDate(new Date().getDate() + 30)),
          classId: studentData.selectedClass || null,
          sectionId: studentData.selectedSection || null,
          academicYearId: studentData.academicYear || null,
          totalPaidAmount: 0,
          tenantId,
        },
      });

      if (selectedPricebookEntryIds && selectedPricebookEntryIds.length > 0) {
        // Fetch pricebook entries
        const pbes = await tx.pricebookEntry.findMany({
          where: {
            id: { in: selectedPricebookEntryIds },
            tenantId,
          },
        });

        const totalAmount = pbes.reduce((sum, pbe) => sum + Number(pbe.unitPrice), 0);

        let discountPercent = 0;
        if (totalAmount > 0 && concessionAmount > 0) {
          discountPercent = (concessionAmount / totalAmount) * 100;
          if (discountPercent > 100) {
            discountPercent = 100;
          }
        }

        const olis = pbes.map(pbe => ({
          opportunityId: opp.id,
          pricebookEntryId: pbe.id,
          productId: pbe.productId,
          quantity: 1,
          unitPrice: pbe.unitPrice,
          discount: discountPercent,
          tenantId,
        }));

        await tx.opportunityLineItem.createMany({
          data: olis,
        });
      }

      return {
        success: true,
        opportunityId: opp.id,
        accountId: profile.id,
      };
    }, { timeout: 90000 });
  }

  // ── OPTIONS RETRIEVAL ──────────────────────────────────────────────────────

  async getAcademicYearOptions() {
    const tenantId = this.getTenantId();
    const ays = await this.prisma.academicYear.findMany({
      where: { tenantId, isActive: true },
      orderBy: { startDate: 'asc' },
    });
    return ays.map(ay => ({ label: ay.name, value: ay.id }));
  }

  async getClassOptions() {
    const tenantId = this.getTenantId();
    const classes = await this.prisma.class.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: 'asc' },
    });
    return classes.map(c => ({ label: c.name, value: c.id }));
  }

  async getSectionOptions(classId?: string) {
    const tenantId = this.getTenantId();
    const sections = await this.prisma.section.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: 'asc' },
    });
    return sections.map(s => ({ label: s.name, value: s.id }));
  }

  // ── STUDENT SEARCH WITH PENDING BALANCE CALCULATIONS ─────────────────────────

  // ── STUDENT SEARCH WITH PENDING BALANCE CALCULATIONS ─────────────────────────

  async searchStudents(searchTerm: string) {
    const tenantId = this.getTenantId();

    const students = await this.prisma.studentProfile.findMany({
      where: {
        user: {
          tenantId,
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { phone: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
      },
      include: {
        user: true,
        classSection: {
          include: {
            class: true,
            section: true,
          },
        },
        opportunities: {
          where: {
            stageName: { notIn: ['Closed Won', 'Closed Lost'] }, // Opportunity is open
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            opportunityLineItems: {
              include: { product: true }
            },
            invoices: {
              where: {
                tenantId,
                status: { not: PaymentStatus.VOIDED }
              },
              include: { invoiceItems: true }
            }
          }
        },
      },
      take: 20,
    });

    const studentIds = students.map(s => s.id);
    const unpaidInvoices = await this.prisma.invoice.findMany({
      where: {
        studentId: { in: studentIds },
        tenantId,
        status: { in: [PaymentStatus.UNPAID, PaymentStatus.PARTIALLY_PAID] }
      }
    });

    const results = [];
    for (const student of students) {
      const openOpp = student.opportunities[0];
      let totalFee = 0;
      let totalPaid = 0;

      if (openOpp) {
        totalFee = openOpp.opportunityLineItems.reduce((sum, oli) => {
          const itemTotal = Number(oli.unitPrice) * Number(oli.quantity);
          const itemDiscount = (itemTotal * Number(oli.discount)) / 100;
          return sum + (itemTotal - itemDiscount);
        }, 0);

        totalPaid = openOpp.invoices.reduce((sum, inv) => {
          const invoiceSum = inv.invoiceItems.reduce((iSum, item) => iSum + Number(item.amount), 0);
          return sum + invoiceSum;
        }, 0);
      }

      // Calculate previous years unpaid balances
      let currentYearStart = new Date(0);
      if (openOpp && openOpp.academicYearId) {
        const cy = await this.prisma.academicYear.findFirst({
          where: { id: openOpp.academicYearId, tenantId }
        });
        if (cy) currentYearStart = cy.startDate;
      }

      const studentPrevUnpaid = unpaidInvoices.filter(inv => 
        inv.studentId === student.id && 
        new Date(inv.invoiceDate) < currentYearStart
      );

      const totalPreviousYearDue = studentPrevUnpaid.reduce((sum, inv) => sum + Number(inv.remainingBalance), 0);

      results.push({
        account: {
          id: student.id,
          name: student.user.name,
          rollNo: student.rollNo,
          phone: student.user.phone,
          profilePhotoUrl: student.profilePhotoUrl,
          class: student.classSection?.class.name || '',
          section: student.classSection?.section.name || '',
          classId: student.classSection?.classId || '',
          sectionId: student.classSection?.sectionId || '',
          opportunities: openOpp ? [{ id: openOpp.id, academicYearId: openOpp.academicYearId }] : [],
        },
        totalPendingBalance: Math.max(0, totalFee - totalPaid) + totalPreviousYearDue,
        totalPaidAmount: totalPaid,
      });
    }

    return results;
  }

  async getStudentById(studentId: string) {
    const tenantId = this.getTenantId();

    const student = await this.prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        classSection: {
          include: {
            class: true,
            section: true,
          },
        },
        opportunities: {
          where: {
            stageName: { notIn: ['Closed Won', 'Closed Lost'] },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            opportunityLineItems: {
              include: { product: true }
            },
            invoices: {
              where: {
                tenantId,
                status: { not: PaymentStatus.VOIDED }
              },
              include: { invoiceItems: true }
            }
          }
        },
      },
    });

    if (!student || student.user.tenantId !== tenantId) {
      throw new NotFoundException('Student not found.');
    }

    const openOpp = student.opportunities[0];
    let totalFee = 0;
    let totalPaid = 0;

    if (openOpp) {
      totalFee = openOpp.opportunityLineItems.reduce((sum, oli) => {
        const itemTotal = Number(oli.unitPrice) * Number(oli.quantity);
        const itemDiscount = (itemTotal * Number(oli.discount)) / 100;
        return sum + (itemTotal - itemDiscount);
      }, 0);

      totalPaid = openOpp.invoices.reduce((sum, inv) => {
        const invoiceSum = inv.invoiceItems.reduce((iSum, item) => iSum + Number(item.amount), 0);
        return sum + invoiceSum;
      }, 0);
    }

    // Calculate dynamic previous academic year outstanding dues
    let currentYearStart = new Date(0);
    if (openOpp && openOpp.academicYearId) {
      const cy = await this.prisma.academicYear.findUnique({
        where: { id: openOpp.academicYearId }
      });
      if (cy) {
        currentYearStart = cy.startDate;
      }
    }

    const prevInvoices = await this.prisma.invoice.findMany({
      where: {
        studentId,
        tenantId,
        invoiceDate: {
          lt: currentYearStart
        },
        status: {
          in: [PaymentStatus.UNPAID, PaymentStatus.PARTIALLY_PAID]
        }
      },
      include: {
        opportunity: {
          include: {
            academicYear: true
          }
        }
      }
    });

    const prevYearDuesMap = new Map<string, number>();
    for (const inv of prevInvoices) {
      const yearName = inv.opportunity?.academicYear?.name || 'Previous Years';
      const balance = Number(inv.remainingBalance);
      if (balance > 0) {
        prevYearDuesMap.set(yearName, (prevYearDuesMap.get(yearName) || 0) + balance);
      }
    }

    const previousYears = Array.from(prevYearDuesMap.entries()).map(([academicYearName, outstandingBalance]) => ({
      academicYearName,
      outstandingBalance
    }));

    const totalPreviousYearDue = previousYears.reduce((sum, item) => sum + item.outstandingBalance, 0);
    const currentYearPending = Math.max(0, totalFee - totalPaid);
    const grandTotalBalanceDue = currentYearPending + totalPreviousYearDue;

    const feeSummary = {
      currentYear: {
        feeProductsAmount: totalFee,
        paidAmount: totalPaid,
        pendingAmount: currentYearPending
      },
      previousYears,
      overall: {
        totalCurrentYearDue: currentYearPending,
        totalPreviousYearDue,
        grandTotalBalanceDue
      }
    };

    return {
      account: {
        id: student.id,
        name: student.user.name,
        rollNo: student.rollNo,
        phone: student.user.phone,
        profilePhotoUrl: student.profilePhotoUrl,
        fatherName: student.fatherName,
        motherName: student.motherName,
        aadharNo: student.aadharNo,
        class: student.classSection?.class.name || '',
        section: student.classSection?.section.name || '',
        classId: student.classSection?.classId || '',
        sectionId: student.classSection?.sectionId || '',
        opportunities: openOpp ? [{ id: openOpp.id, academicYearId: openOpp.academicYearId }] : [],
      },
      totalPendingBalance: grandTotalBalanceDue,
      totalPaidAmount: totalPaid,
      feeSummary
    };
  }

  // ── UNPAID FEES LISTING ────────────────────────────────────────────────────

  async getUnpaidFees(opportunityId: string) {
    const tenantId = this.getTenantId();

    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { academicYear: true }
    });
    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    // Map Opportunity Line Item paid amounts
    const invoiceItems = await this.prisma.invoiceItem.findMany({
      where: {
        tenantId,
        invoice: {
          opportunityId,
          status: { not: PaymentStatus.VOIDED },
        },
      },
    });

    const oliPaidMap = new Map<string, number>();
    for (const item of invoiceItems) {
      if (item.opportunityLineItemId) {
        const cur = oliPaidMap.get(item.opportunityLineItemId) || 0;
        oliPaidMap.set(item.opportunityLineItemId, cur + Number(item.amount));
      }
    }

    // Fetch opportunity line items
    const olis = await this.prisma.opportunityLineItem.findMany({
      where: { opportunityId, tenantId },
      include: {
        product: true,
      },
    });

    const result = olis.map(oli => {
      const totalAmount = Number(oli.unitPrice) * Number(oli.quantity);
      const discountPercent = Number(oli.discount);
      const discountAmount = (totalAmount * discountPercent) / 100;
      const netAmount = totalAmount - discountAmount;
      const paidAmount = oliPaidMap.get(oli.id) || 0;
      const balanceDue = netAmount - paidAmount;

      return {
        oliId: oli.id,
        productName: oli.product.name,
        totalAmount,
        netAmount,
        paidAmount,
        balanceDue: Math.max(0, balanceDue),
        productId: oli.productId,
        discountPercent,
        discountAmount,
      };
    });

    // Check if there are unpaid/partially paid invoices from previous years
    const prevInvoices = await this.prisma.invoice.findMany({
      where: {
        studentId: opportunity.studentId,
        tenantId,
        invoiceDate: {
          lt: opportunity.academicYear?.startDate || new Date()
        },
        status: {
          in: [PaymentStatus.UNPAID, PaymentStatus.PARTIALLY_PAID]
        }
      }
    });

    const prevBalanceDue = prevInvoices.reduce((sum, inv) => sum + Number(inv.remainingBalance), 0);
    if (prevBalanceDue > 0) {
      result.unshift({
        oliId: 'PREV_YEAR_DUE_CF',
        productName: 'Previous Year Balance Brought Forward',
        totalAmount: prevBalanceDue,
        netAmount: prevBalanceDue,
        paidAmount: 0,
        balanceDue: prevBalanceDue,
        productId: null,
        discountPercent: 0,
        discountAmount: 0
      });
    }

    return result;
  }

  // ── CREATE INVOICE & REGISTER PAYMENT (Trigger Flow) ───────────────────────

  async createInvoice(
    opportunityId: string,
    studentId: string,
    selectedItems: { oliId: string; productId: string; amount: number }[],
    paymentMethod: string,
    bankDetails?: any,
  ) {
    const tenantId = this.getTenantId();

    if (!selectedItems || selectedItems.length === 0) {
      throw new BadRequestException('No fee items selected for payment.');
    }

    const totalAmount = selectedItems.reduce((sum, item) => sum + Number(item.amount), 0);
    if (totalAmount <= 0) {
      throw new BadRequestException('The total payment amount must be greater than zero.');
    }

    // Map string payment method to Prisma enum
    let method: PaymentMethod = PaymentMethod.CASH;
    if (paymentMethod === 'GPAY_UPI' || paymentMethod === 'PHONEPE_UPI' || paymentMethod === 'UPI') {
      method = PaymentMethod.UPI;
    } else if (paymentMethod === 'NET_BANKING' || paymentMethod === 'BANK_TRANSFER') {
      method = PaymentMethod.BANK_TRANSFER;
    } else if (paymentMethod === 'CARD') {
      method = PaymentMethod.CARD;
    }

    return this.prisma.$transaction(async (tx) => {
      const opportunity = await tx.opportunity.findUnique({
        where: { id: opportunityId },
        include: { academicYear: true }
      });
      if (!opportunity) {
        throw new NotFoundException('Opportunity not found');
      }

      // Create Invoice
      const invoice = await tx.invoice.create({
        data: {
          opportunityId,
          studentId,
          status: PaymentStatus.PAID,
          invoiceDate: new Date(),
          dueDate: new Date(),
          totalAmount,
          paidAmount: totalAmount,
          remainingBalance: 0,
          paymentMethod: method,
          bankName: bankDetails?.bankName || null,
          bankIFSC: bankDetails?.bankIfsc || null,
          bankAccountNumber: bankDetails?.bankAccountNumber || null,
          bankBranch: bankDetails?.bankBranch || null,
          tenantId,
        },
      });

      // Create Invoice Items
      const invoiceItemsToCreate = [];
      for (const item of selectedItems) {
        if (item.oliId === 'PREV_YEAR_DUE_CF') {
          // Carry Forward payment: Apply to original previous year's invoices
          let amountToApply = Number(item.amount);

          const prevInvoicesToPay = await tx.invoice.findMany({
            where: {
              studentId,
              tenantId,
              invoiceDate: {
                lt: opportunity.academicYear?.startDate || new Date()
              },
              status: {
                in: [PaymentStatus.UNPAID, PaymentStatus.PARTIALLY_PAID]
              }
            },
            orderBy: {
              invoiceDate: 'asc'
            }
          });

          for (const oldInv of prevInvoicesToPay) {
            if (amountToApply <= 0) break;
            const currentRemaining = Number(oldInv.remainingBalance);
            if (currentRemaining <= 0) continue;

            const paymentForThis = Math.min(amountToApply, currentRemaining);
            const newPaidAmount = Number(oldInv.paidAmount) + paymentForThis;
            const newRemaining = currentRemaining - paymentForThis;
            const newStatus = newRemaining <= 0 ? PaymentStatus.PAID : PaymentStatus.PARTIALLY_PAID;

            await tx.invoice.update({
              where: { id: oldInv.id },
              data: {
                paidAmount: newPaidAmount,
                remainingBalance: newRemaining,
                status: newStatus
              }
            });

            amountToApply -= paymentForThis;
          }

          invoiceItemsToCreate.push({
            invoiceId: invoice.id,
            opportunityLineItemId: null,
            productId: null,
            name: 'Previous Year Balance Brought Forward Payment',
            amount: item.amount,
            tenantId,
          });
        } else {
          // Fetch product name
          const p = await tx.product.findUnique({ where: { id: item.productId } });
          const name = p ? p.name : 'School Fee Item';

          invoiceItemsToCreate.push({
            invoiceId: invoice.id,
            opportunityLineItemId: item.oliId,
            productId: item.productId,
            name,
            amount: item.amount,
            tenantId,
          });
        }
      }

      await tx.invoiceItem.createMany({
        data: invoiceItemsToCreate,
      });

      // Recalculate Opportunity paid amount (Equivalent to Apex triggers)
      await this.recalculatePaidAmount(opportunityId, tx);

      return invoice.id;
    }, { timeout: 30000 });
  }

  // ── RECENT INVOICES ────────────────────────────────────────────────────────

  async getRecentInvoices(studentId?: string) {
    const tenantId = this.getTenantId();

    const invoices = await this.prisma.invoice.findMany({
      where: {
        tenantId,
        status: { not: PaymentStatus.VOIDED },
        ...(studentId ? { studentId } : {}),
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { invoiceDate: 'desc' },
      take: 10,
    });

    return (invoices as any[]).map(inv => ({
      id: inv.id,
      name: inv.student.user.name,
      rollNo: inv.student.rollNo || '',
      dateStr: inv.invoiceDate.toISOString().split('T')[0],
      status: inv.status === PaymentStatus.VOIDED ? 'Cancelled' : 'Paid',
      totalAmount: Number(inv.totalAmount),
      paymentMethod: inv.paymentMethod || 'CASH',
    }));
  }

  // ── VOID INVOICE ───────────────────────────────────────────────────────────

  async voidInvoice(invoiceId: string) {
    const tenantId = this.getTenantId();

    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice || invoice.tenantId !== tenantId) {
      throw new NotFoundException('Invoice not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          status: PaymentStatus.VOIDED,
          remainingBalance: invoice.totalAmount,
          paidAmount: 0,
        },
      });

      if (invoice.opportunityId) {
        await this.recalculatePaidAmount(invoice.opportunityId, tx);
      }

      return updatedInvoice;
    }, { timeout: 30000 });
  }

  // ── CONCESSION MANAGEMENT ──────────────────────────────────────────────────

  async updateLineItemDiscount(oliId: string, discountPercent: number) {
    const tenantId = this.getTenantId();

    const oli = await this.prisma.opportunityLineItem.findUnique({
      where: { id: oliId },
    });

    if (!oli || oli.tenantId !== tenantId) {
      throw new NotFoundException('Fee line item not found.');
    }

    return this.prisma.opportunityLineItem.update({
      where: { id: oliId },
      data: { discount: discountPercent },
    });
  }

  async updateBulkLineItemDiscounts(oliIds: string[], discountPercent: number) {
    const tenantId = this.getTenantId();

    return this.prisma.opportunityLineItem.updateMany({
      where: {
        id: { in: oliIds },
        tenantId,
      },
      data: { discount: discountPercent },
    });
  }

  // ── PDF RECEIPT / TEMPLATE DATA RESOLUTION ─────────────────────────────────

  async getInvoicePDFData(invoiceId: string) {
    const tenantId = this.getTenantId();

    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
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
        opportunity: {
          include: {
            academicYear: true,
          },
        },
        invoiceItems: true,
      },
    });

    if (!invoice || invoice.tenantId !== tenantId) {
      throw new NotFoundException('Invoice receipt not found.');
    }

    // Fetch School/Tenant settings
    const school = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    return {
      schoolName: school?.name || 'Vikas Senior Secondary School',
      schoolAddress: school?.address || 'School Campus Address',
      schoolPhone: school?.phone || '+91 999 999 9999',
      schoolLogo: school?.logoUrl || '',
      schoolSubtitle: school?.subtitle || 'Inspiring Excellence, Nurturing Values',
      invoiceNo: `INV-2026-${invoice.student.rollNo?.slice(-3) || invoice.id.slice(-3)}`,
      invoiceDate: invoice.invoiceDate.toISOString().split('T')[0],
      academicYear: invoice.opportunity?.academicYear?.name || '2026-2027',
      admissionRef: invoice.opportunity?.name || `ADMISSION-REF-${invoice.student.rollNo || ''}`,
      studentName: invoice.student.user.name,
      fatherName: invoice.student.fatherName || '',
      motherName: invoice.student.motherName || '',
      className: invoice.student.classSection?.class.name || '',
      sectionName: invoice.student.classSection?.section.name || '',
      studentDob: '', // Dob can be added to user/student profile if needed
      addressVillage: school?.address || '',
      totalAmount: Number(invoice.totalAmount),
      items: invoice.invoiceItems.map(item => ({
        particulars: item.name,
        amount: Number(item.amount),
      })),
    };
  }

  // ── BULK IMPORT STUDENTS ───────────────────────────────────────────────────

  async importStudentsBulk(studentDataList: any[]) {
    const tenantId = this.getTenantId();
    let successCount = 0;
    const errors: string[] = [];

    // Pre-cache classes, sections, academic years
    const ays = await this.prisma.academicYear.findMany({ where: { tenantId } });
    const classes = await this.prisma.class.findMany({ where: { tenantId } });
    const sections = await this.prisma.section.findMany({ where: { tenantId } });
    const classSections = await this.prisma.classSection.findMany({
      where: { tenantId },
      include: { class: true, section: true },
    });

    const defaultPassword = 'Welcome@123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    for (let i = 0; i < studentDataList.length; i++) {
      const data = studentDataList[i];
      try {
        const firstName = data['First Name'] || data['firstName'];
        const lastName = data['Last Name'] || data['lastName'];
        const email = data['Email'] || data['email'];
        const phone = data['Phone'] || data['phone'];
        const classStr = data['Class'] || data['class'];
        const sectionStr = data['Section'] || data['section'];
        const ayStr = data['Academic Year'] || data['academicYear'];

        if (!email || !lastName || !classStr || !sectionStr) {
          errors.push(`Row ${i + 1}: Missing mandatory fields (Email, Last Name, Class, Section)`);
          continue;
        }

        const matchedClass = classes.find(c => c.name.toLowerCase() === classStr.toLowerCase().trim());
        const matchedSection = sections.find(s => s.name.toLowerCase() === sectionStr.toLowerCase().trim());

        if (!matchedClass || !matchedSection) {
          errors.push(`Row ${i + 1}: Class "${classStr}" or Section "${sectionStr}" not found`);
          continue;
        }

        const matchedCS = classSections.find(cs => cs.classId === matchedClass.id && cs.sectionId === matchedSection.id);
        if (!matchedCS) {
          errors.push(`Row ${i + 1}: Junction mapping between Class and Section not found`);
          continue;
        }

        const matchedAY = ays.find(ay => ay.name.toLowerCase() === (ayStr || '').toLowerCase().trim()) || ays.find(ay => ay.isActive);

        const emailLower = email.toLowerCase().trim();
        const existingUser = await this.prisma.user.findUnique({ where: { email: emailLower } });
        if (existingUser) {
          errors.push(`Row ${i + 1}: Email "${email}" is already registered`);
          continue;
        }

        await this.prisma.$transaction(async (tx) => {
          // Create User
          const user = await tx.user.create({
            data: {
              email: emailLower,
              name: `${firstName || ''} ${lastName}`.trim(),
              passwordHash,
              role: Role.STUDENT,
              phone: phone ? String(phone) : null,
              tenantId,
            },
          });

          // Create StudentProfile
          const profile = await tx.studentProfile.create({
            data: {
              userId: user.id,
              rollNo: data['Roll No'] || data['rollNo'] || null,
              fatherName: data['Father Name'] || data['fatherName'] || null,
              motherName: data['Mother Name'] || data['motherName'] || null,
              aadharNo: data['Aadhar No'] || data['aadharNo'] || null,
              classSectionId: matchedCS.id,
              tenantId,
            },
          });

          // Create Opportunity
          const opp = await tx.opportunity.create({
            data: {
              name: `${firstName || ''} ${lastName} - Admission ${matchedAY?.name || ''}`.trim(),
              studentId: profile.id,
              stageName: 'Prospecting',
              closeDate: new Date(new Date().setDate(new Date().getDate() + 30)),
              classId: matchedClass.id,
              sectionId: matchedSection.id,
              academicYearId: matchedAY?.id || null,
              totalPaidAmount: 0,
              tenantId,
            },
          });

          // Resolve class pricebook & entries
          const priceBookName = matchedClass.name.replace('-', ' ');
          const priceBookNameAlt = matchedClass.name.replace(' ', '-');

          const classPriceBook = await tx.pricebook.findFirst({
            where: {
              tenantId,
              classId: matchedClass.id,
              academicYearId: matchedAY?.id || undefined,
              isActive: true
            },
          }) || await tx.pricebook.findFirst({
            where: {
              tenantId,
              isActive: true,
              OR: [
                { name: { equals: priceBookName, mode: 'insensitive' } },
                { name: { equals: priceBookNameAlt, mode: 'insensitive' } },
              ],
            },
          });

          if (!classPriceBook) {
            throw new Error(`No active Price Book (fee structure) configured for class "${matchedClass.name}"`);
          }

          const pbes = await tx.pricebookEntry.findMany({
            where: {
              tenantId,
              isActive: true,
              pricebookId: classPriceBook.id,
              pricebook: { isActive: true },
              product: {
                isActive: true,
                productCode: { not: 'PREV_DUES' },
                name: { not: { contains: 'Previous' } },
              },
            },
          });

          if (pbes.length === 0) {
            throw new Error(`No active fee products found in the Price Book for class "${matchedClass.name}"`);
          }

          const olis = pbes.map(pbe => ({
            opportunityId: opp.id,
            pricebookEntryId: pbe.id,
            productId: pbe.productId,
            quantity: 1,
            unitPrice: pbe.unitPrice,
            discount: 0,
            tenantId,
          }));

          await tx.opportunityLineItem.createMany({
            data: olis,
          });
        });

        successCount++;
      } catch (err) {
        errors.push(`Row ${i + 1} Error: ${err.message}`);
      }
    }

    return {
      totalRows: studentDataList.length,
      successCount,
      errors,
    };
  }

  // ── PRODUCT MANAGEMENT ─────────────────────────────────────────────────────

  async createFeeProducts(productNames: string[]) {
    const tenantId = this.getTenantId();
    const created = [];

    const generateProductCode = (name: string) => {
      const clean = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      return `${clean.slice(0, 10)}_${Date.now().toString().slice(-4)}`;
    };

    for (const name of productNames) {
      if (!name || name.trim() === '') continue;
      const cleanName = name.trim();

      // Check if product with same name already exists for this tenant
      const existing = await this.prisma.product.findFirst({
        where: {
          tenantId,
          name: { equals: cleanName, mode: 'insensitive' },
          isActive: true,
        },
      });

      if (!existing) {
        const prod = await this.prisma.product.create({
          data: {
            name: cleanName,
            productCode: generateProductCode(cleanName),
            tenantId,
            isActive: true,
          },
        });
        created.push(prod);
      } else {
        created.push(existing);
      }
    }
    return created;
  }

  async getAllFeeProducts() {
    const tenantId = this.getTenantId();
    return this.prisma.product.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  // ── PRICEBOOK UPSERT & LOADING ─────────────────────────────────────────────

  async getPriceBook(classId: string, academicYearId: string) {
    const tenantId = this.getTenantId();
    
    if (!classId || !academicYearId) {
      throw new BadRequestException('classId and academicYearId are required');
    }

    // Try to find pricebook by classId and academicYearId
    const pricebook = await this.prisma.pricebook.findFirst({
      where: {
        tenantId,
        classId,
        academicYearId,
        isActive: true,
      },
      include: {
        pricebookEntries: {
          where: { isActive: true },
          include: { product: true },
        },
      },
    });

    if (pricebook) {
      return {
        id: pricebook.id,
        name: pricebook.name,
        isActive: pricebook.isActive,
        academicYearId: pricebook.academicYearId,
        classId: pricebook.classId,
        entries: pricebook.pricebookEntries.map(e => ({
          productId: e.productId,
          productName: e.product.name,
          unitPrice: Number(e.unitPrice),
          isActive: e.isActive,
        })),
      };
    }
    return null;
  }

  async savePriceBook(
    classId: string,
    academicYearId: string,
    priceItems: { productId: string; price: number; selected: boolean }[],
  ) {
    const tenantId = this.getTenantId();

    if (!classId || !academicYearId) {
      throw new BadRequestException('classId and academicYearId are required');
    }

    const classRecord = await this.prisma.class.findFirst({
      where: { id: classId, tenantId },
    });
    const ayRecord = await this.prisma.academicYear.findFirst({
      where: { id: academicYearId, tenantId },
    });

    if (!classRecord || !ayRecord) {
      throw new BadRequestException('Class or Academic Year not found');
    }

    const pricebookName = `${classRecord.name} - ${ayRecord.name}`;

    return this.prisma.$transaction(async (tx) => {
      // Upsert the pricebook record
      const pricebook = await tx.pricebook.upsert({
        where: {
          tenantId_classId_academicYearId: {
            tenantId,
            classId,
            academicYearId,
          },
        },
        create: {
          tenantId,
          classId,
          academicYearId,
          name: pricebookName,
          isActive: true,
        },
        update: {
          name: pricebookName,
          isActive: true,
        },
      });

      // Handle entries
      for (const item of priceItems) {
        const existingEntry = await tx.pricebookEntry.findFirst({
          where: {
            tenantId,
            pricebookId: pricebook.id,
            productId: item.productId,
          },
        });

        if (existingEntry) {
          await tx.pricebookEntry.update({
            where: { id: existingEntry.id },
            data: {
              unitPrice: item.price,
              isActive: item.selected && item.price > 0,
            },
          });
        } else if (item.selected && item.price > 0) {
          await tx.pricebookEntry.create({
            data: {
              tenantId,
              pricebookId: pricebook.id,
              productId: item.productId,
              unitPrice: item.price,
              isActive: true,
            },
          });
        }
      }

      // Return the updated pricebook
      const finalPb = await tx.pricebook.findUnique({
        where: { id: pricebook.id },
        include: {
          pricebookEntries: {
            where: { isActive: true },
            include: { product: true },
          },
        },
      });

      return {
        id: finalPb.id,
        name: finalPb.name,
        isActive: finalPb.isActive,
        academicYearId: finalPb.academicYearId,
        classId: finalPb.classId,
        entries: finalPb.pricebookEntries.map(e => ({
          productId: e.productId,
          productName: e.product.name,
          unitPrice: Number(e.unitPrice),
          isActive: e.isActive,
        })),
      };
    }, { timeout: 30000 });
  }
}
