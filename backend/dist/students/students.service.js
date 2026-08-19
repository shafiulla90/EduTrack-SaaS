"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const tenant_context_1 = require("../tenants/tenant.context");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const storage_service_1 = require("../common/storage.service");
const billing_service_1 = require("../billing/billing.service");
let StudentsService = class StudentsService {
    constructor(prisma, storageService, billingService) {
        this.prisma = prisma;
        this.storageService = storageService;
        this.billingService = billingService;
    }
    async onModuleInit() {
        try {
            const students = await this.prisma.studentProfile.findMany({
                where: {
                    OR: [
                        { rollNo: null },
                        { rollNo: '' },
                        { rollNo: 'N/A' },
                        { rollNo: 'null' }
                    ]
                },
                include: {
                    classSection: true
                }
            });
            if (students.length === 0)
                return;
            console.log(`[RollNo Bootstrapper] Auto-assigning roll numbers for ${students.length} students...`);
            const groups = {};
            for (const s of students) {
                if (!s.classSectionId)
                    continue;
                if (!groups[s.classSectionId]) {
                    groups[s.classSectionId] = [];
                }
                groups[s.classSectionId].push(s);
            }
            for (const [classSectionId, list] of Object.entries(groups)) {
                const existing = await this.prisma.studentProfile.findMany({
                    where: {
                        classSectionId,
                        NOT: [
                            { rollNo: null },
                            { rollNo: '' },
                            { rollNo: 'N/A' },
                            { rollNo: 'null' }
                        ]
                    },
                    select: { rollNo: true }
                });
                const parsedInts = existing
                    .map(s => parseInt(s.rollNo || '', 10))
                    .filter(val => !isNaN(val));
                let currentNext = parsedInts.length > 0 ? Math.max(...parsedInts) + 1 : 1;
                for (const student of list) {
                    await this.prisma.studentProfile.update({
                        where: { id: student.id },
                        data: { rollNo: String(currentNext) }
                    });
                    currentNext++;
                }
            }
            console.log('[RollNo Bootstrapper] Successfully completed roll number auto-generation bootup hook.');
        }
        catch (err) {
            console.error('[RollNo Bootstrapper] Failed to run roll number bootstrapping hook:', err);
        }
    }
    getTenantId() {
        const tenantId = tenant_context_1.TenantContext.getTenantId();
        if (!tenantId) {
            throw new common_1.BadRequestException('No active school tenant context found');
        }
        return tenantId;
    }
    async createStudent(data) {
        const tenantId = this.getTenantId();
        let emailLower;
        if (data.email && data.email.trim()) {
            emailLower = data.email.toLowerCase().trim();
        }
        else {
            const randomSuffix = Math.random().toString(36).substring(2, 8);
            const firstName = (data.firstName || data.name || 'student').toLowerCase().replace(/\s+/g, '');
            const lastName = (data.lastName || '').toLowerCase().replace(/\s+/g, '');
            emailLower = `${firstName}${lastName ? '.' + lastName : ''}.${randomSuffix}@noemail.local`;
        }
        const existing = await this.prisma.user.findUnique({
            where: { email: emailLower },
        });
        if (existing) {
            throw new common_1.ConflictException('A user with this email is already registered in the system');
        }
        let normalizedPhone = null;
        if (data.phone && String(data.phone).trim()) {
            const digitsOnly = String(data.phone).replace(/\D/g, '').slice(-10);
            if (digitsOnly.length >= 10) {
                normalizedPhone = `${tenantId.substring(0, 8)}-${digitsOnly}`;
            }
        }
        const defaultPassword = data.password || 'Welcome@123';
        const passwordHash = await bcrypt.hash(defaultPassword, 10);
        return this.prisma.$transaction(async (tx) => {
            let classSectionId = data.classSectionId;
            let matchedClassId = null;
            let matchedAcademicYearId = null;
            if (!classSectionId && data.selectedClass && data.selectedSection && data.academicYear) {
                const ay = await tx.academicYear.findFirst({
                    where: { name: data.academicYear, tenantId }
                });
                if (ay) {
                    matchedAcademicYearId = ay.id;
                    const cls = await tx.class.findFirst({
                        where: { name: data.selectedClass, academicYearId: ay.id, tenantId }
                    });
                    if (cls) {
                        matchedClassId = cls.id;
                        const sec = await tx.section.findFirst({
                            where: { name: data.selectedSection, tenantId }
                        });
                        if (sec) {
                            let cs = await tx.classSection.findFirst({
                                where: { classId: cls.id, sectionId: sec.id, tenantId }
                            });
                            if (!cs) {
                                cs = await tx.classSection.create({
                                    data: {
                                        classId: cls.id,
                                        sectionId: sec.id,
                                        tenantId,
                                        strength: 0
                                    }
                                });
                            }
                            if (cs) {
                                classSectionId = cs.id;
                            }
                        }
                    }
                }
            }
            else if (classSectionId) {
                const cs = await tx.classSection.findUnique({
                    where: { id: classSectionId },
                    include: { class: true }
                });
                if (cs) {
                    matchedClassId = cs.classId;
                    matchedAcademicYearId = cs.class.academicYearId;
                }
            }
            const user = await tx.user.create({
                data: {
                    email: emailLower,
                    name: `${data.firstName} ${data.lastName}`,
                    passwordHash,
                    role: client_1.Role.STUDENT,
                    phone: normalizedPhone,
                    tenantId,
                },
            });
            let finalRollNo = data.rollNo ? String(data.rollNo).trim() : '';
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
            let profilePhotoUrl = null;
            if (data.profilePhotoUrl && data.profilePhotoUrl.startsWith('data:')) {
                profilePhotoUrl = await this.storageService.uploadImage(data.profilePhotoUrl, tenantId, user.id, `student-${user.id}`);
            }
            const profile = await tx.studentProfile.create({
                data: {
                    userId: user.id,
                    rollNo: finalRollNo || null,
                    fatherName: data.fatherName,
                    motherName: data.motherName,
                    aadharNo: data.aadharNo,
                    classSectionId: classSectionId || null,
                    profilePhotoUrl,
                    tenantId,
                },
            });
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
                        status: client_1.PaymentStatus.UNPAID,
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
            if (matchedClassId && matchedAcademicYearId) {
                await this.billingService.syncPriceBookToStudents(matchedClassId, matchedAcademicYearId, tx);
            }
            return { user, profile };
        });
    }
    async getStudentsBillingInfoBatch(studentIds, tenantId, academicYearId) {
        if (studentIds.length === 0)
            return {};
        const allOpps = await this.prisma.opportunity.findMany({
            where: {
                studentId: { in: studentIds },
                tenantId,
            },
            include: {
                academicYear: true,
                opportunityLineItems: {
                    include: { product: true }
                },
                invoices: {
                    where: {
                        tenantId,
                        status: { not: 'VOIDED' }
                    },
                    include: { invoiceItems: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        const allOrphanInvoices = await this.prisma.invoice.findMany({
            where: {
                studentId: { in: studentIds },
                tenantId,
                opportunityId: null,
                status: { in: ['UNPAID', 'PARTIALLY_PAID'] }
            }
        });
        const oppsByStudent = new Map();
        for (const opp of allOpps) {
            if (!oppsByStudent.has(opp.studentId)) {
                oppsByStudent.set(opp.studentId, []);
            }
            oppsByStudent.get(opp.studentId).push(opp);
        }
        const orphansByStudent = new Map();
        for (const inv of allOrphanInvoices) {
            if (!orphansByStudent.has(inv.studentId)) {
                orphansByStudent.set(inv.studentId, []);
            }
            orphansByStudent.get(inv.studentId).push(inv);
        }
        const billingMap = {};
        const activeProductsCache = new Map();
        const getActiveProductsCached = async (classId, ayId) => {
            const cacheKey = `${classId}-${ayId || 'default'}`;
            if (activeProductsCache.has(cacheKey)) {
                return activeProductsCache.get(cacheKey);
            }
            const products = await this.billingService.getActiveProducts(classId, ayId);
            activeProductsCache.set(cacheKey, products);
            return products;
        };
        for (const studentId of studentIds) {
            const studentOpps = oppsByStudent.get(studentId) || [];
            const studentOrphans = orphansByStudent.get(studentId) || [];
            let openOpp = null;
            if (academicYearId) {
                openOpp = studentOpps.find(opp => opp.academicYearId === academicYearId);
            }
            else {
                openOpp = studentOpps.find(opp => !['Closed Won', 'Closed Lost'].includes(opp.stageName));
            }
            if (!openOpp) {
                openOpp = studentOpps[0] || null;
            }
            let totalFee = 0;
            let totalPaid = 0;
            if (openOpp) {
                totalFee = openOpp.opportunityLineItems.reduce((sum, oli) => {
                    const itemTotal = Number(oli.unitPrice) * Number(oli.quantity);
                    const itemDiscount = (itemTotal * Number(oli.discount)) / 100;
                    return sum + (itemTotal - itemDiscount);
                }, 0);
                totalPaid = openOpp.invoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
                if (totalFee === 0 && openOpp.classId) {
                    const pricebookProducts = await getActiveProductsCached(openOpp.classId, openOpp.academicYearId || undefined);
                    totalFee = pricebookProducts.reduce((sum, p) => sum + p.unitPrice, 0);
                }
            }
            let currentYearStart = new Date(0);
            if (academicYearId) {
                const cy = openOpp?.academicYearId === academicYearId ? openOpp.academicYear : allOpps.find(opp => opp.academicYearId === academicYearId)?.academicYear;
                if (cy) {
                    currentYearStart = cy.startDate;
                }
                else {
                    const academicYearRecord = await this.prisma.academicYear.findUnique({
                        where: { id: academicYearId }
                    });
                    if (academicYearRecord) {
                        currentYearStart = academicYearRecord.startDate;
                    }
                }
            }
            else if (openOpp && openOpp.academicYear) {
                currentYearStart = openOpp.academicYear.startDate;
            }
            const prevOpps = studentOpps.filter(opp => opp.academicYear && new Date(opp.academicYear.startDate) < currentYearStart);
            const prevYearDuesMap = new Map();
            for (const opp of prevOpps) {
                const yearName = opp.academicYear?.name || 'Previous Years';
                const oppFee = opp.opportunityLineItems.reduce((sum, oli) => {
                    const itemTotal = Number(oli.unitPrice) * Number(oli.quantity);
                    const itemDiscount = (itemTotal * Number(oli.discount)) / 100;
                    return sum + (itemTotal - itemDiscount);
                }, 0);
                const oppPaid = opp.invoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
                const balance = Math.max(0, oppFee - oppPaid);
                if (balance > 0) {
                    prevYearDuesMap.set(yearName, (prevYearDuesMap.get(yearName) || 0) + balance);
                }
            }
            const prevOrphanInvoices = studentOrphans.filter(inv => new Date(inv.invoiceDate) < currentYearStart);
            for (const inv of prevOrphanInvoices) {
                const yearName = 'Previous Years';
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
            const totalFees = totalPaid + grandTotalBalanceDue;
            const pendingPercentage = totalFees > 0
                ? Math.round((grandTotalBalanceDue / totalFees) * 100)
                : 0;
            const paidPercentage = totalFees > 0
                ? Math.round((totalPaid / totalFees) * 100)
                : 100;
            const financialStatus = grandTotalBalanceDue > 0
                ? `Pending Due (${pendingPercentage}%)`
                : 'Fully Paid (100%)';
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
            billingMap[studentId] = {
                totalFees,
                paidAmount: totalPaid,
                currentYearPending,
                previousYearPending: totalPreviousYearDue,
                totalPendingBalance: grandTotalBalanceDue,
                pendingPercentage,
                paidPercentage,
                financialStatus,
                totalPaidAmount: totalPaid,
                feeSummary
            };
        }
        return billingMap;
    }
    async searchStudents(searchTerm, classId, sectionId, academicYearId, page, limit) {
        const tenantId = this.getTenantId();
        const where = {
            tenantId,
            user: {
                isActive: true
            },
            ...(searchTerm ? {
                OR: [
                    { rollNo: { contains: searchTerm, mode: 'insensitive' } },
                    {
                        user: {
                            OR: [
                                { name: { contains: searchTerm, mode: 'insensitive' } },
                                { email: { contains: searchTerm, mode: 'insensitive' } },
                                { phone: { contains: searchTerm, mode: 'insensitive' } },
                            ]
                        }
                    }
                ]
            } : {}),
            ...(classId || sectionId ? {
                classSection: {
                    classId: classId || undefined,
                    sectionId: sectionId || undefined,
                }
            } : {})
        };
        if (academicYearId) {
            if (where.classSection) {
                where.classSection.class = {
                    academicYearId
                };
            }
            else {
                where.classSection = {
                    class: {
                        academicYearId
                    }
                };
            }
        }
        const isPaginated = page !== undefined && limit !== undefined;
        const skip = isPaginated ? (page - 1) * limit : undefined;
        const take = isPaginated ? limit : undefined;
        const total = isPaginated
            ? await this.prisma.studentProfile.count({ where })
            : 0;
        const students = await this.prisma.studentProfile.findMany({
            where,
            select: {
                id: true,
                rollNo: true,
                fatherName: true,
                motherName: true,
                aadharNo: true,
                profilePhotoUrl: true,
                classSectionId: true,
                tenantId: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    }
                },
                classSection: {
                    select: {
                        id: true,
                        classId: true,
                        sectionId: true,
                        class: {
                            select: {
                                id: true,
                                name: true,
                                academicYearId: true,
                            }
                        },
                        section: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    }
                }
            },
            orderBy: {
                user: {
                    name: 'asc'
                }
            },
            skip,
            take,
        });
        const studentIds = students.map(s => s.id);
        const billingMap = await this.getStudentsBillingInfoBatch(studentIds, tenantId, academicYearId);
        const data = students.map(s => {
            const billingInfo = billingMap[s.id] || {
                paidAmount: 0,
                balanceDue: 0,
                totalFees: 0,
                pendingPercentage: 0,
                paidPercentage: 100,
                financialStatus: 'Fully Paid (100%)',
                feeSummary: null
            };
            return {
                ...s,
                paidAmount: billingInfo.paidAmount,
                balanceDue: billingInfo.totalPendingBalance,
                totalFees: billingInfo.totalFees,
                pendingPercentage: billingInfo.pendingPercentage,
                paidPercentage: billingInfo.paidPercentage,
                financialStatus: billingInfo.financialStatus,
                feeSummary: billingInfo.feeSummary
            };
        });
        if (isPaginated) {
            return {
                data,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        }
        return data;
    }
    async getStudentDetails(studentId, academicYearId) {
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
                    include: {
                        invoiceItems: true,
                        opportunity: {
                            include: {
                                academicYear: true
                            }
                        }
                    },
                    orderBy: { invoiceDate: 'desc' }
                },
                opportunities: {
                    where: {
                        tenantId,
                    },
                    include: {
                        opportunityLineItems: {
                            include: { product: true }
                        }
                    }
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
            throw new common_1.NotFoundException('Student profile not found');
        }
        const billingInfo = await this.billingService.getStudentById(studentId, academicYearId);
        const selectedYear = academicYearId || profile.classSection?.class.academicYearId;
        const refOpp = profile.opportunities.find(opp => opp.academicYearId === selectedYear);
        let unpaidFees = [];
        if (refOpp) {
            unpaidFees = await this.billingService.getUnpaidFees(refOpp.id);
        }
        return {
            ...profile,
            paidAmount: billingInfo.paidAmount,
            balanceDue: billingInfo.totalPendingBalance,
            totalFees: billingInfo.totalFees,
            pendingPercentage: billingInfo.pendingPercentage,
            paidPercentage: billingInfo.paidPercentage,
            financialStatus: billingInfo.financialStatus,
            feeSummary: billingInfo.feeSummary,
            feeItems: unpaidFees
        };
    }
    async importStudentsBulk(studentRows) {
        const tenantId = this.getTenantId();
        let successCount = 0;
        const errors = [];
        const ays = await this.prisma.academicYear.findMany({ where: { tenantId } });
        const activeYear = ays.find(ay => ay.isActive);
        const classes = await this.prisma.class.findMany({ where: { tenantId } });
        const sections = await this.prisma.section.findMany({ where: { tenantId } });
        const classSections = await this.prisma.classSection.findMany({
            where: { tenantId },
            include: { class: true, section: true }
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
                const ayStr = row['Academic Year'] || row['academicYear'];
                if (!email || !lastName || !className || !sectionName) {
                    errors.push(`Row ${i + 1}: Missing mandatory fields (Email, Last Name, Class, Section)`);
                    continue;
                }
                let currentAY = ays.find(ay => ay.name.toLowerCase() === (ayStr || '').toLowerCase().trim()) || activeYear;
                if (!currentAY) {
                    currentAY = await this.prisma.academicYear.findFirst({ where: { tenantId } }) || null;
                    if (!currentAY) {
                        currentAY = await this.prisma.academicYear.create({
                            data: {
                                name: ayStr?.trim() || '2026-2027',
                                startDate: new Date('2026-04-01'),
                                endDate: new Date('2027-03-31'),
                                isActive: true,
                                tenantId
                            }
                        });
                        ays.push(currentAY);
                    }
                }
                let matchedClass = classes.find(c => c.name.toLowerCase() === className.toLowerCase().trim());
                if (!matchedClass && currentAY) {
                    matchedClass = await this.prisma.class.create({
                        data: {
                            name: className.trim(),
                            academicYearId: currentAY.id,
                            tenantId
                        }
                    });
                    classes.push(matchedClass);
                }
                if (!matchedClass) {
                    errors.push(`Row ${i + 1}: Class "${className}" could not be resolved or created`);
                    continue;
                }
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
                let matchedClassSection = classSections.find(cs => cs.classId === matchedClass.id && cs.sectionId === matchedSection.id);
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
                const finalPhone = phone ? String(phone).replace(/\D/g, '').slice(-10) : null;
                await this.prisma.$transaction(async (tx) => {
                    const priceBookName = matchedClass.name.replace('-', ' ');
                    const priceBookNameAlt = matchedClass.name.replace(' ', '-');
                    const classPriceBook = await tx.pricebook.findFirst({
                        where: {
                            tenantId,
                            classId: matchedClass.id,
                            academicYearId: currentAY?.id || undefined,
                            isActive: true
                        },
                    }) || await tx.pricebook.findFirst({
                        where: {
                            tenantId,
                            isActive: true,
                            OR: [
                                { name: { equals: priceBookName, mode: 'insensitive' } },
                                { name: { equals: priceBookNameAlt, mode: 'insensitive' } },
                                { name: { contains: matchedClass.name, mode: 'insensitive' } },
                            ],
                        },
                    }) || await tx.pricebook.findFirst({
                        where: { tenantId, isActive: true }
                    });
                    let pbes = [];
                    if (classPriceBook) {
                        pbes = await tx.pricebookEntry.findMany({
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
                    }
                    const user = await tx.user.create({
                        data: {
                            email: emailLower,
                            name: `${firstName || ''} ${lastName}`.trim(),
                            passwordHash,
                            role: client_1.Role.STUDENT,
                            phone: finalPhone,
                            tenantId,
                        }
                    });
                    let finalRollNo = rollNo ? String(rollNo).trim() : '';
                    const existingInCS = await tx.studentProfile.findMany({
                        where: { classSectionId: matchedClassSection.id, tenantId },
                        select: { rollNo: true }
                    });
                    const existingRolls = new Set(existingInCS.map(s => s.rollNo?.trim()).filter(Boolean));
                    if (!finalRollNo || existingRolls.has(finalRollNo)) {
                        const parsedInts = existingInCS
                            .map(s => parseInt(s.rollNo || '', 10))
                            .filter(val => !isNaN(val));
                        const nextRoll = parsedInts.length > 0 ? Math.max(...parsedInts) + 1 : 1;
                        finalRollNo = String(nextRoll);
                    }
                    const profile = await tx.studentProfile.create({
                        data: {
                            userId: user.id,
                            rollNo: finalRollNo || null,
                            fatherName,
                            motherName,
                            aadharNo: aadharNo ? String(aadharNo) : null,
                            classSectionId: matchedClassSection.id,
                            tenantId,
                        }
                    });
                    const existingOpp = await tx.opportunity.findFirst({
                        where: {
                            studentId: profile.id,
                            academicYearId: currentAY?.id || undefined,
                            tenantId,
                        }
                    });
                    if (!existingOpp) {
                        const opp = await tx.opportunity.create({
                            data: {
                                name: `${firstName || ''} ${lastName} - Admission ${currentAY?.name || ''}`.trim(),
                                studentId: profile.id,
                                stageName: 'Prospecting',
                                closeDate: new Date(new Date().setDate(new Date().getDate() + 30)),
                                classId: matchedClass.id,
                                sectionId: matchedSection.id,
                                academicYearId: currentAY?.id || null,
                                totalPaidAmount: 0,
                                tenantId,
                            },
                        });
                        if (pbes.length > 0) {
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
                        }
                    }
                    if (currentAY?.id) {
                        try {
                            await this.billingService.syncPriceBookToStudents(matchedClass.id, currentAY.id, tx);
                        }
                        catch (syncErr) {
                            console.warn('[ImportStudentsBulk] Ledger sync notice:', syncErr?.message);
                        }
                    }
                });
                successCount++;
            }
            catch (err) {
                errors.push(`Row ${i + 1} Error: ${err.message}`);
            }
        }
        return {
            totalRows: studentRows.length,
            successCount,
            errors,
        };
    }
    async getPromotionCandidates(sourceYearId, className, sectionName) {
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
        return Promise.all(students.map(async (s) => {
            const billingInfo = await this.billingService.getStudentById(s.id);
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
                balanceDue: billingInfo.totalPendingBalance,
                paidAmount: billingInfo.paidAmount,
                totalFees: billingInfo.totalFees,
                pendingPercentage: billingInfo.pendingPercentage,
                paidPercentage: billingInfo.paidPercentage,
                financialStatus: billingInfo.financialStatus,
                parentEmail: '',
                profilePhotoUrl: s.profilePhotoUrl || null,
            };
        }));
    }
    async promoteStudents(payload) {
        try {
            const tenantId = this.getTenantId();
            const { studentIds, sourceYearId, targetYearId, targetClassName, targetSectionName } = payload;
            if (!studentIds || studentIds.length === 0) {
                throw new common_1.BadRequestException('No students selected for promotion');
            }
            const isBulkGlobal = targetClassName === 'ALL';
            const sourceYear = await this.prisma.academicYear.findFirst({
                where: { id: sourceYearId, tenantId }
            });
            const targetYear = await this.prisma.academicYear.findFirst({
                where: { id: targetYearId, tenantId }
            });
            if (!sourceYear || !targetYear) {
                throw new common_1.NotFoundException('Source or Target Academic Year not found');
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
            const studentBillingMap = new Map();
            for (const studentId of studentIds) {
                const billingInfo = await this.billingService.getStudentById(studentId);
                studentBillingMap.set(studentId, billingInfo.totalPendingBalance);
            }
            return await this.prisma.$transaction(async (tx) => {
                const promotedCount = studentIds.length;
                let studentsWithCarriedForwardDues = 0;
                let totalCarriedForwardAmount = 0;
                const studentOutstandingBalances = [];
                const targetClassYearPairs = new Map();
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
                    if (!profile)
                        continue;
                    const currentClassName = profile.classSection?.class.name;
                    const currentSectionName = profile.classSection?.section.name;
                    const resolvedClassName = isBulkGlobal
                        ? getNextClass(currentClassName)
                        : targetClassName;
                    if (!resolvedClassName)
                        continue;
                    let targetClass = classes.find(c => c.name.toLowerCase() === resolvedClassName.toLowerCase());
                    if (!targetClass) {
                        const existingTargetClass = await tx.class.findFirst({
                            where: {
                                name: resolvedClassName,
                                academicYearId: targetYearId,
                                tenantId
                            }
                        });
                        if (existingTargetClass) {
                            targetClass = existingTargetClass;
                        }
                        else {
                            targetClass = await tx.class.create({
                                data: {
                                    name: resolvedClassName,
                                    academicYearId: targetYearId,
                                    tenantId,
                                    isActive: true
                                }
                            });
                        }
                        classes.push(targetClass);
                    }
                    const pairKey = `${targetClass.id}-${targetYearId}`;
                    if (!targetClassYearPairs.has(pairKey)) {
                        targetClassYearPairs.set(pairKey, { classId: targetClass.id, targetYearId });
                    }
                    const resolvedSectionName = targetSectionName || currentSectionName || 'Section A';
                    const targetSection = sections.find(s => s.name.toLowerCase() === resolvedSectionName.toLowerCase());
                    if (!targetSection) {
                        throw new common_1.BadRequestException(`Section "${resolvedSectionName}" not found`);
                    }
                    let targetClassSection = classSections.find(cs => cs.classId === targetClass.id && cs.sectionId === targetSection.id);
                    if (!targetClassSection) {
                        const existingClassSection = await tx.classSection.findFirst({
                            where: { classId: targetClass.id, sectionId: targetSection.id, tenantId },
                            include: { class: true, section: true }
                        });
                        if (existingClassSection) {
                            targetClassSection = existingClassSection;
                        }
                        else {
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
                        classSections.push(targetClassSection);
                    }
                    const existingInCS = await tx.studentProfile.findMany({
                        where: { classSectionId: targetClassSection.id, tenantId },
                        select: { rollNo: true }
                    });
                    const parsedInts = existingInCS
                        .map(s => parseInt(s.rollNo || '', 10))
                        .filter(val => !isNaN(val));
                    const nextRoll = parsedInts.length > 0 ? Math.max(...parsedInts) + 1 : 1;
                    await tx.studentProfile.update({
                        where: { id: studentId },
                        data: {
                            classSectionId: targetClassSection.id,
                            rollNo: String(nextRoll)
                        }
                    });
                    const carriedForwardDue = studentBillingMap.get(studentId) || 0;
                    if (carriedForwardDue > 0) {
                        studentsWithCarriedForwardDues++;
                        totalCarriedForwardAmount += carriedForwardDue;
                    }
                    let targetPricebook = await tx.pricebook.findFirst({
                        where: { tenantId, classId: targetClass.id, academicYearId: targetYearId, isActive: true }
                    });
                    if (!targetPricebook) {
                        const priceBookName = resolvedClassName.replace('-', ' ');
                        const priceBookNameAlt = resolvedClassName.replace(' ', '-');
                        targetPricebook = await tx.pricebook.findFirst({
                            where: {
                                tenantId,
                                isActive: true,
                                academicYearId: targetYearId,
                                OR: [
                                    { name: { equals: priceBookName, mode: 'insensitive' } },
                                    { name: { equals: priceBookNameAlt, mode: 'insensitive' } },
                                    { name: { startsWith: priceBookName, mode: 'insensitive' } },
                                    { name: { startsWith: priceBookNameAlt, mode: 'insensitive' } },
                                ],
                            }
                        });
                    }
                    const pbes = targetPricebook
                        ? await tx.pricebookEntry.findMany({
                            where: {
                                tenantId,
                                isActive: true,
                                pricebookId: targetPricebook.id,
                                product: {
                                    isActive: true,
                                    productCode: { not: 'PREV_DUES' },
                                    name: { not: { contains: 'Previous' } },
                                },
                            },
                            include: { product: true },
                        })
                        : [];
                    const oppName = `${profile.user.name} - Promotion to ${resolvedClassName} - ${targetYear.name}`;
                    const newOpportunity = await tx.opportunity.create({
                        data: {
                            name: oppName,
                            studentId,
                            stageName: 'Prospecting',
                            closeDate: new Date(new Date().setDate(new Date().getDate() + 30)),
                            classId: targetClass.id,
                            sectionId: targetClassSection.sectionId,
                            academicYearId: targetYearId,
                            totalPaidAmount: 0,
                            tenantId
                        }
                    });
                    if (pbes.length > 0) {
                        await tx.opportunityLineItem.createMany({
                            data: pbes.map(pbe => ({
                                opportunityId: newOpportunity.id,
                                pricebookEntryId: pbe.id,
                                productId: pbe.productId,
                                quantity: 1,
                                unitPrice: pbe.unitPrice,
                                discount: 0,
                                tenantId,
                            }))
                        });
                    }
                    if (pbes.length > 0) {
                        const totalAmount = pbes.reduce((sum, pbe) => sum + Number(pbe.unitPrice), 0);
                        const newInvoice = await tx.invoice.create({
                            data: {
                                opportunityId: newOpportunity.id,
                                studentId,
                                invoiceDate: new Date(),
                                dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
                                totalAmount,
                                paidAmount: 0,
                                remainingBalance: totalAmount,
                                status: client_1.PaymentStatus.UNPAID,
                                description: `Fees Invoice for ${resolvedClassName} — ${targetYear.name}`,
                                tenantId
                            }
                        });
                        await tx.invoiceItem.createMany({
                            data: pbes.map(pbe => ({
                                invoiceId: newInvoice.id,
                                name: pbe.product.name,
                                amount: Number(pbe.unitPrice),
                                tenantId,
                            }))
                        });
                    }
                    studentOutstandingBalances.push({
                        name: profile.user.name,
                        rollNo: profile.rollNo || 'N/A',
                        class: currentClassName || resolvedClassName,
                        targetClass: resolvedClassName,
                        carriedForwardAmount: carriedForwardDue,
                        newYearFees: pbes.reduce((sum, pbe) => sum + Number(pbe.unitPrice), 0),
                        totalOutstanding: carriedForwardDue + pbes.reduce((sum, pbe) => sum + Number(pbe.unitPrice), 0),
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
                for (const pair of targetClassYearPairs.values()) {
                    await this.billingService.syncPriceBookToStudents(pair.classId, pair.targetYearId, tx);
                }
                return {
                    success: true,
                    promotedCount,
                    studentsWithCarriedForwardDues,
                    totalCarriedForwardAmount,
                    studentOutstandingBalances
                };
            }, { timeout: 30000 });
        }
        catch (err) {
            console.error('Promotion transaction error:', err);
            throw new common_1.BadRequestException(`Promotion failed: ${err.message || err}`);
        }
    }
    async validatePromotion(payload) {
        try {
            const tenantId = this.getTenantId();
            const { studentIds, sourceYearId } = payload;
            if (!studentIds || studentIds.length === 0) {
                throw new common_1.BadRequestException('No students selected for validation');
            }
            const profiles = await this.prisma.studentProfile.findMany({
                where: { id: { in: studentIds }, tenantId },
                include: {
                    user: { select: { name: true } },
                    classSection: { include: { class: true, section: true } },
                }
            });
            const profileMap = new Map(profiles.map(p => [p.id, p]));
            const sourceAcademicYear = await this.prisma.academicYear.findFirst({
                where: { id: sourceYearId, tenantId },
                select: { name: true }
            });
            const sourceYearName = sourceAcademicYear?.name || '';
            let totalOutstandingDue = 0;
            let totalCarriedForwardAmount = 0;
            let studentsWithDue = 0;
            const dueList = [];
            for (const sid of studentIds) {
                const details = await this.billingService.getStudentById(sid);
                const pending = details.totalPendingBalance;
                const prevYearDue = details.feeSummary?.previousYears?.reduce((sum, yr) => sum + yr.outstandingBalance, 0) || 0;
                if (pending > 0) {
                    studentsWithDue++;
                    totalOutstandingDue += pending;
                    totalCarriedForwardAmount += prevYearDue;
                }
                const profile = profileMap.get(sid);
                dueList.push({
                    studentId: sid,
                    name: profile?.user?.name || 'Unknown',
                    rollNo: profile?.rollNo || '—',
                    class: profile?.classSection?.class?.name || '—',
                    section: profile?.classSection?.section?.name || '—',
                    sourceYear: sourceYearName,
                    pendingDue: pending,
                    previousYearDue: prevYearDue,
                });
            }
            const totalSelected = studentIds.length;
            const studentsWithoutDue = totalSelected - studentsWithDue;
            return {
                totalSelected,
                studentsWithPendingDue: studentsWithDue,
                studentsWithNoDue: studentsWithoutDue,
                totalOutstandingDue,
                totalCarriedForwardAmount,
                dueList,
            };
        }
        catch (err) {
            console.error('Error validating promotion:', err);
            throw new common_1.BadRequestException(`Validation failed: ${err.message || err}`);
        }
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
    async deleteStudent(studentId) {
        const tenantId = this.getTenantId();
        const profile = await this.prisma.studentProfile.findUnique({
            where: { id: studentId },
            include: { user: true },
        });
        if (!profile || profile.user.tenantId !== tenantId) {
            throw new common_1.NotFoundException('Student profile not found');
        }
        if (profile.profilePhotoUrl) {
            await this.storageService.deleteImage(profile.profilePhotoUrl);
        }
        await this.prisma.user.delete({
            where: { id: profile.userId },
        });
        return { success: true };
    }
    async updateStudent(studentId, data) {
        const tenantId = this.getTenantId();
        await this.prisma.$transaction(async (tx) => {
            const profile = await tx.studentProfile.findUnique({
                where: { id: studentId },
                include: { user: true },
            });
            if (!profile || profile.user.tenantId !== tenantId) {
                throw new common_1.NotFoundException('Student profile not found');
            }
            const userUpdates = {};
            if (data.name) {
                userUpdates.name = data.name.trim();
            }
            else if (data.firstName || data.lastName) {
                const name = `${data.firstName || ''} ${data.lastName || ''}`.trim();
                userUpdates.name = name;
            }
            if (data.email) {
                const emailLower = data.email.toLowerCase().trim();
                const emailExists = await tx.user.findFirst({
                    where: {
                        email: emailLower,
                        id: { not: profile.userId }
                    }
                });
                if (emailExists) {
                    throw new common_1.ConflictException('Email address is already in use by another user');
                }
                userUpdates.email = emailLower;
            }
            if (data.phone) {
                const normalizedPhone = data.phone.replace(/\D/g, '').slice(-10);
                if (normalizedPhone) {
                    userUpdates.phone = normalizedPhone;
                }
            }
            if (Object.keys(userUpdates).length) {
                await tx.user.update({ where: { id: profile.userId }, data: userUpdates });
            }
            const profileUpdates = {};
            if (data.fatherName !== undefined)
                profileUpdates.fatherName = data.fatherName;
            if (data.motherName !== undefined)
                profileUpdates.motherName = data.motherName;
            if (data.aadharNo !== undefined)
                profileUpdates.aadharNo = data.aadharNo;
            if (data.rollNo !== undefined)
                profileUpdates.rollNo = data.rollNo;
            if (data.classSectionId !== undefined)
                profileUpdates.classSectionId = data.classSectionId;
            if (data.profilePhotoUrl !== undefined) {
                if (data.profilePhotoUrl === null || data.profilePhotoUrl === '') {
                    if (profile.profilePhotoUrl) {
                        await this.storageService.deleteImage(profile.profilePhotoUrl);
                    }
                    profileUpdates.profilePhotoUrl = null;
                }
                else if (data.profilePhotoUrl.startsWith('data:')) {
                    if (profile.profilePhotoUrl) {
                        await this.storageService.deleteImage(profile.profilePhotoUrl);
                    }
                    profileUpdates.profilePhotoUrl = await this.storageService.uploadImage(data.profilePhotoUrl, tenantId, profile.userId, `student-${profile.userId}`);
                }
            }
            if (Object.keys(profileUpdates).length) {
                await tx.studentProfile.update({ where: { id: studentId }, data: profileUpdates });
            }
        });
        return this.getStudentDetails(studentId);
    }
    async bulkDeleteStudents(studentIds, actorUserId) {
        const tenantId = this.getTenantId();
        const profiles = await this.prisma.studentProfile.findMany({
            where: {
                id: { in: studentIds },
                tenantId
            },
            select: {
                id: true,
                userId: true
            }
        });
        const userIds = profiles.map(p => p.userId);
        if (userIds.length === 0) {
            return { success: true, count: 0 };
        }
        if (profiles.length !== studentIds.length) {
            throw new common_1.BadRequestException('One or more selected students do not exist or belong to another tenant.');
        }
        try {
            await this.prisma.$transaction(async (tx) => {
                await tx.user.deleteMany({
                    where: {
                        id: { in: userIds },
                        tenantId
                    }
                });
                await tx.activityLog.create({
                    data: {
                        userId: actorUserId,
                        action: 'RECORD_DELETE',
                        entityName: 'StudentProfile',
                        entityId: 'BULK_DELETE',
                        details: JSON.stringify({
                            deletedCount: userIds.length,
                            studentIds: studentIds,
                            timestamp: new Date().toISOString(),
                        }),
                        tenantId
                    }
                });
            });
            return { success: true, count: userIds.length };
        }
        catch (err) {
            console.error('Prisma transaction failed during bulk delete:', err);
            throw new common_1.BadRequestException(`Failed to delete students transactionally: ${err.message}`);
        }
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService,
        billing_service_1.BillingService])
], StudentsService);
function getNextClass(currentClass) {
    const CLASS_ORDER = [
        'Nursery', 'LKG', 'UKG',
        'Class-1', 'Class-2', 'Class-3', 'Class-4', 'Class-5', 'Class-6', 'Class-7', 'Class-8', 'Class-9', 'Class-10',
        'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
    ];
    if (!currentClass)
        return '';
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
//# sourceMappingURL=students.service.js.map