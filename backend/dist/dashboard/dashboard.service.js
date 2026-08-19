"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const tenant_context_1 = require("../tenants/tenant.context");
const client_1 = require("@prisma/client");
const role_filter_helper_1 = require("../common/role-filter.helper");
let DashboardService = class DashboardService {
    constructor(prisma, roleFilterHelper) {
        this.prisma = prisma;
        this.roleFilterHelper = roleFilterHelper;
        this.dashboardCache = new Map();
    }
    getTenantId() {
        const tenantId = tenant_context_1.TenantContext.getTenantId();
        if (!tenantId) {
            throw new common_1.BadRequestException('No active school tenant context found');
        }
        return tenantId;
    }
    async getDashboardSummary() {
        const tenantId = this.getTenantId();
        const cacheKey = `dashboard-summary-${tenantId}`;
        const cached = this.dashboardCache.get(cacheKey);
        const nowTime = Date.now();
        if (cached && cached.expiresAt > nowTime) {
            return cached.data;
        }
        const last6Months = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            last6Months.push({
                year: d.getFullYear(),
                month: d.getMonth(),
                label: d.toLocaleString('default', { month: 'short', year: 'numeric' }),
            });
        }
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        const [studentsCount, teachersCount, classesCount, revenueAgg, expenseAgg, sessions, marks, examSubjectsConfig, leavesList] = await Promise.all([
            this.prisma.studentProfile.count({
                where: {
                    user: {
                        tenantId,
                        isActive: true,
                    },
                },
            }),
            this.prisma.staffProfile.count({
                where: {
                    user: {
                        tenantId,
                        isActive: true,
                        role: { in: ['TEACHER', 'STAFF'] },
                    },
                },
            }),
            this.prisma.classSection.count({
                where: {
                    tenantId,
                    class: {
                        isActive: true,
                    },
                },
            }),
            this.prisma.invoice.aggregate({
                where: {
                    tenantId,
                    status: 'PAID',
                },
                _sum: {
                    paidAmount: true,
                },
            }),
            this.prisma.expense.aggregate({
                where: {
                    tenantId,
                    status: 'PAID',
                },
                _sum: {
                    amount: true,
                },
            }),
            this.prisma.attendanceSession.findMany({
                where: { tenantId },
                select: { presentCount: true, totalStudents: true },
            }),
            this.prisma.examMark.findMany({
                where: { tenantId },
                select: { examId: true, subjectId: true, subjectType: true, marksObtained: true },
            }),
            this.prisma.examSubject.findMany({
                where: { tenantId },
                select: { examId: true, subjectId: true, subjectType: true, maxMarks: true },
            }),
            this.prisma.leaveRequest.findMany({
                where: { tenantId },
                select: { status: true, approvedDate: true, rejectedDate: true }
            })
        ]);
        const [recentStudents, invoices, salaryExpenses, studentsThisMonth, studentsLastMonth, revThisMonthAgg, revLastMonthAgg] = await Promise.all([
            this.prisma.studentProfile.findMany({
                where: {
                    user: {
                        tenantId,
                        isActive: true,
                    },
                },
                orderBy: {
                    user: {
                        createdAt: 'desc',
                    },
                },
                take: 10,
                include: {
                    user: true,
                    classSection: {
                        include: {
                            class: true,
                            section: true,
                        },
                    },
                },
            }),
            this.prisma.invoice.findMany({
                where: {
                    tenantId,
                    status: 'PAID',
                },
                include: {
                    student: {
                        include: { user: true },
                    },
                },
                orderBy: {
                    invoiceDate: 'desc',
                },
                take: 10,
            }),
            this.prisma.expense.findMany({
                where: {
                    tenantId,
                    category: 'Salary',
                    status: 'PAID',
                },
                orderBy: {
                    date: 'desc',
                },
                take: 10,
            }),
            this.prisma.studentProfile.count({
                where: { user: { tenantId, isActive: true, createdAt: { gte: thisMonthStart } } },
            }),
            this.prisma.studentProfile.count({
                where: { user: { tenantId, isActive: true, createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } },
            }),
            this.prisma.invoice.aggregate({
                where: { tenantId, status: 'PAID', invoiceDate: { gte: thisMonthStart } },
                _sum: { paidAmount: true },
            }),
            this.prisma.invoice.aggregate({
                where: { tenantId, status: 'PAID', invoiceDate: { gte: lastMonthStart, lte: lastMonthEnd } },
                _sum: { paidAmount: true },
            })
        ]);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);
        const [monthlyInvoices, monthlyExpenses] = await Promise.all([
            this.prisma.invoice.findMany({
                where: {
                    tenantId,
                    status: 'PAID',
                    invoiceDate: { gte: sixMonthsAgo },
                },
                select: { paidAmount: true, invoiceDate: true },
            }),
            this.prisma.expense.findMany({
                where: {
                    tenantId,
                    category: 'Salary',
                    status: 'PAID',
                    date: { gte: sixMonthsAgo },
                },
                select: { amount: true, date: true },
            })
        ]);
        const totalRevenue = Number(revenueAgg._sum.paidAmount || 0);
        const totalExpenses = Number(expenseAgg._sum.amount || 0);
        const netIncome = totalRevenue - totalExpenses;
        const totalPresent = sessions.reduce((sum, s) => sum + s.presentCount, 0);
        const totalRoster = sessions.reduce((sum, s) => sum + s.totalStudents, 0);
        const attendanceRate = totalRoster > 0 ? Math.round((totalPresent / totalRoster) * 1000) / 10 : 0;
        const examSubMap = new Map(examSubjectsConfig.map(es => [`${es.examId}_${es.subjectId}_${es.subjectType}`, es.maxMarks]));
        let totalPct = 0;
        marks.forEach(m => {
            const max = examSubMap.get(`${m.examId}_${m.subjectId}_${m.subjectType}`) || 100;
            totalPct += max > 0 ? (Number(m.marksObtained) / max) * 100 : 0;
        });
        const academicAverage = marks.length > 0
            ? Math.round((totalPct / marks.length) * 10) / 10
            : 0;
        const todayStr = new Date().toISOString().split('T')[0];
        const pendingLeaveRequests = leavesList.filter((l) => l.status === 'PENDING').length;
        const approvedToday = leavesList.filter((l) => l.status === 'APPROVED' && l.approvedDate && l.approvedDate.toISOString().split('T')[0] === todayStr).length;
        const rejectedToday = leavesList.filter((l) => l.status === 'REJECTED' && l.rejectedDate && l.rejectedDate.toISOString().split('T')[0] === todayStr).length;
        const recentAdmissions = recentStudents.map(s => ({
            id: s.id,
            name: s.user.name,
            avatar: s.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
            class: s.classSection ? `${s.classSection.class.name} - ${s.classSection.section.name}` : 'Unassigned',
            rollNo: s.rollNo || 'N/A',
            joiningDate: s.user.createdAt.toISOString().split('T')[0],
            status: 'Active',
        }));
        const studentPayments = invoices.map(inv => ({
            id: inv.id,
            type: 'Fee Payment',
            name: `${inv.student.user.name} - Tuition Fees`,
            amount: Number(inv.paidAmount),
            date: inv.invoiceDate.toISOString().split('T')[0],
            status: 'Paid',
        }));
        const salaryPayments = salaryExpenses.map(exp => ({
            id: exp.id,
            type: 'Salary Payment',
            name: exp.description || 'Staff Salary Disbursement',
            amount: Number(exp.amount),
            date: exp.date.toISOString().split('T')[0],
            status: 'Paid',
        }));
        const recentPayments = [...studentPayments, ...salaryPayments]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10);
        const chartData = last6Months.map(m => {
            const collections = monthlyInvoices
                .filter(inv => inv.invoiceDate.getFullYear() === m.year && inv.invoiceDate.getMonth() === m.month)
                .reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
            const salaries = monthlyExpenses
                .filter(exp => exp.date.getFullYear() === m.year && exp.date.getMonth() === m.month)
                .reduce((sum, exp) => sum + Number(exp.amount), 0);
            return {
                month: m.label,
                feeCollection: collections,
                salaryExpense: salaries,
                netRevenue: collections - salaries,
            };
        });
        const studentTrendVal = studentsLastMonth > 0
            ? ((studentsThisMonth - studentsLastMonth) / studentsLastMonth) * 100
            : studentsThisMonth > 0 ? 100 : 0;
        const revThisMonth = Number(revThisMonthAgg._sum.paidAmount || 0);
        const revLastMonth = Number(revLastMonthAgg._sum.paidAmount || 0);
        const revenueTrendVal = revLastMonth > 0
            ? ((revThisMonth - revLastMonth) / revLastMonth) * 100
            : revThisMonth > 0 ? 100 : 0;
        const summaryData = {
            stats: {
                studentsCount,
                teachersCount,
                classesCount,
                totalRevenue,
                totalExpenses,
                netIncome,
                attendanceRate,
                academicAverage,
                pendingLeaveRequests,
                approvedToday,
                rejectedToday,
                trends: {
                    students: {
                        value: Math.abs(Math.round(studentTrendVal * 10) / 10) + '%',
                        isUp: studentTrendVal >= 0,
                    },
                    revenue: {
                        value: Math.abs(Math.round(revenueTrendVal * 10) / 10) + '%',
                        isUp: revenueTrendVal >= 0,
                    },
                    attendance: {
                        value: '1.5%',
                        isUp: true,
                    },
                    academic: {
                        value: '0.8%',
                        isUp: false,
                    },
                },
            },
            recentAdmissions,
            recentPayments,
            chartData,
        };
        this.dashboardCache.set(cacheKey, {
            data: summaryData,
            expiresAt: nowTime + 30 * 1000,
        });
        return summaryData;
    }
    async getReportsSummary(userId, role) {
        const tenantId = this.getTenantId();
        let studentWhere = { user: { tenantId, isActive: true } };
        let marksWhere = { tenantId };
        let showFinancials = true;
        if (this.roleFilterHelper.isTeacher(role)) {
            showFinancials = false;
            try {
                const scope = await this.roleFilterHelper.buildTeacherScope(userId, tenantId);
                const classSectionIds = scope.assignedClassSectionIds;
                studentWhere = {
                    tenantId,
                    classSectionId: { in: classSectionIds },
                    user: { isActive: true },
                };
                marksWhere = {
                    tenantId,
                    student: { classSectionId: { in: classSectionIds } },
                };
            }
            catch {
                studentWhere = { id: 'none' };
                marksWhere = { id: 'none' };
            }
        }
        const students = await this.prisma.studentProfile.findMany({
            where: studentWhere,
            include: {
                user: { select: { createdAt: true } },
                classSection: {
                    include: { class: true, section: true }
                }
            }
        });
        const classDistribution = {};
        students.forEach(s => {
            const className = s.classSection?.class.name || 'Unassigned';
            classDistribution[className] = (classDistribution[className] || 0) + 1;
        });
        const timelineGroups = {};
        students.forEach(s => {
            const dateStr = s.user.createdAt.toISOString().slice(0, 7);
            timelineGroups[dateStr] = (timelineGroups[dateStr] || 0) + 1;
        });
        const timeline = Object.entries(timelineGroups)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
        const demographics = {
            totalStudents: students.length,
            classDistribution,
            timeline
        };
        let financials = {
            totalRevenue: 0,
            outstandingReceivables: 0,
            totalExpenses: 0,
            netCashflow: 0
        };
        if (showFinancials) {
            const [invoices, expenses] = await Promise.all([
                this.prisma.invoice.findMany({
                    where: { tenantId }
                }),
                this.prisma.expense.findMany({
                    where: { tenantId, status: 'PAID' }
                })
            ]);
            let totalRevenue = 0;
            let outstandingReceivables = 0;
            invoices.forEach(inv => {
                totalRevenue += Number(inv.paidAmount || 0);
                outstandingReceivables += Number(inv.remainingBalance || 0);
            });
            let totalExpenses = 0;
            expenses.forEach(exp => {
                totalExpenses += Number(exp.amount || 0);
            });
            financials = {
                totalRevenue,
                outstandingReceivables,
                totalExpenses,
                netCashflow: totalRevenue - totalExpenses
            };
        }
        const [marks, examSubjects] = await Promise.all([
            this.prisma.examMark.findMany({
                where: marksWhere
            }),
            this.prisma.examSubject.findMany({
                where: { tenantId }
            })
        ]);
        const subjectConfigMap = new Map(examSubjects.map(es => [`${es.examId}_${es.subjectId}_${es.subjectType}`, es]));
        let totalPctScore = 0;
        let passedCount = 0;
        let failedCount = 0;
        const distribution = {
            failed: 0,
            belowAverage: 0,
            average: 0,
            firstDivision: 0,
            highDistinction: 0
        };
        marks.forEach(m => {
            const score = Number(m.marksObtained);
            const es = subjectConfigMap.get(`${m.examId}_${m.subjectId}_${m.subjectType}`);
            const maxMarks = es ? es.maxMarks : 100;
            const passingPct = es ? Number(es.passingPercentage) : 35;
            const pct = maxMarks > 0 ? (score / maxMarks) * 100 : 0;
            totalPctScore += pct;
            if (pct < passingPct) {
                failedCount++;
                distribution.failed++;
            }
            else {
                passedCount++;
                if (pct >= passingPct && pct < 60)
                    distribution.belowAverage++;
                else if (pct >= 60 && pct < 75)
                    distribution.average++;
                else if (pct >= 75 && pct < 90)
                    distribution.firstDivision++;
                else if (pct >= 90)
                    distribution.highDistinction++;
            }
        });
        const totalMarksEntries = marks.length;
        const averageScore = totalMarksEntries > 0 ? (totalPctScore / totalMarksEntries) : 0;
        const passRate = totalMarksEntries > 0 ? (passedCount / totalMarksEntries) * 100 : 0;
        const grading = {
            averageScore: Math.round(averageScore * 10) / 10,
            passRate: Math.round(passRate * 10) / 10,
            distribution
        };
        return {
            demographics,
            financials,
            grading
        };
    }
    async getDemographicsReport(userId, role) {
        const tenantId = this.getTenantId();
        let studentWhere = { user: { tenantId, isActive: true } };
        if (this.roleFilterHelper.isTeacher(role)) {
            try {
                const scope = await this.roleFilterHelper.buildTeacherScope(userId, tenantId);
                studentWhere = {
                    tenantId,
                    classSectionId: { in: scope.assignedClassSectionIds },
                    user: { isActive: true },
                };
            }
            catch {
                studentWhere = { id: 'none' };
            }
        }
        const students = await this.prisma.studentProfile.findMany({
            where: studentWhere,
            include: {
                user: { select: { name: true, email: true, phone: true, createdAt: true } },
                classSection: {
                    include: { class: true, section: true }
                }
            }
        });
        return students.map(s => ({
            name: s.user.name,
            email: s.user.email || 'N/A',
            phone: s.user.phone || 'N/A',
            class: s.classSection?.class.name || 'Unassigned',
            section: s.classSection?.section.name || 'Unassigned',
            rollNo: s.rollNo || 'N/A',
            joiningDate: s.user.createdAt.toISOString().split('T')[0]
        }));
    }
    async getCashflowsReport(userId, role) {
        if (role === client_1.Role.TEACHER) {
            return [];
        }
        const tenantId = this.getTenantId();
        const [invoices, expenses] = await Promise.all([
            this.prisma.invoice.findMany({
                where: { tenantId },
                include: { student: { include: { user: { select: { name: true } } } } }
            }),
            this.prisma.expense.findMany({
                where: { tenantId, status: 'PAID' }
            })
        ]);
        const txs = [];
        invoices.forEach(inv => {
            txs.push({
                type: 'Fee Revenue',
                name: inv.student?.user.name || 'Student Fee',
                amount: Number(inv.paidAmount),
                date: inv.invoiceDate.toISOString().split('T')[0],
                status: inv.status
            });
            if (Number(inv.remainingBalance) > 0) {
                txs.push({
                    type: 'Receivable Outstanding',
                    name: inv.student?.user.name || 'Student Fee',
                    amount: Number(inv.remainingBalance),
                    date: inv.dueDate.toISOString().split('T')[0],
                    status: 'UNPAID'
                });
            }
        });
        expenses.forEach(exp => {
            txs.push({
                type: 'School Expense',
                name: exp.description || exp.category || 'Vendor Payment',
                amount: -Number(exp.amount),
                date: exp.date.toISOString().split('T')[0],
                status: 'PAID'
            });
        });
        return txs;
    }
    async getGradingReport(userId, role) {
        const tenantId = this.getTenantId();
        let marksWhere = { tenantId };
        if (this.roleFilterHelper.isTeacher(role)) {
            try {
                const scope = await this.roleFilterHelper.buildTeacherScope(userId, tenantId);
                marksWhere = {
                    tenantId,
                    student: { classSectionId: { in: scope.assignedClassSectionIds } },
                };
            }
            catch {
                marksWhere = { id: 'none' };
            }
        }
        const [marks, examSubjects] = await Promise.all([
            this.prisma.examMark.findMany({
                where: marksWhere,
                include: {
                    student: { include: { user: { select: { name: true } } } },
                    subject: { select: { name: true } },
                    exam: { select: { type: true } }
                }
            }),
            this.prisma.examSubject.findMany({
                where: { tenantId }
            })
        ]);
        const subjectConfigMap = new Map(examSubjects.map(es => [`${es.examId}_${es.subjectId}_${es.subjectType}`, es]));
        return marks.map(m => {
            const es = subjectConfigMap.get(`${m.examId}_${m.subjectId}_${m.subjectType}`);
            const maxMarks = es ? es.maxMarks : 100;
            return {
                studentName: m.student?.user.name || 'Student',
                rollNo: m.student?.rollNo || 'N/A',
                subject: m.subject?.name || 'Subject',
                subjectType: m.subjectType,
                examType: m.exam?.type || 'Exam',
                marksObtained: Number(m.marksObtained),
                maxMarks: maxMarks
            };
        });
    }
    async getPlatformMetrics() {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const [totalRevenueAgg, todayRevenueAgg, monthlyRevenueAgg, annualRevenueAgg, totalSchools, activeSubscriptions, trialSubscriptions, expiredSubscriptions, gracePeriodSubscriptions, renewalsDueThisMonth, failedPaymentsCount, successfulPaymentsCount, pendingPayments, totalStudents, totalTeachers, totalParents] = await Promise.all([
            this.prisma.subscriptionPayment.aggregate({
                where: { status: 'SUCCESS' },
                _sum: { amount: true },
            }),
            this.prisma.subscriptionPayment.aggregate({
                where: { status: 'SUCCESS', createdAt: { gte: todayStart } },
                _sum: { amount: true },
            }),
            this.prisma.subscriptionPayment.aggregate({
                where: { status: 'SUCCESS', createdAt: { gte: monthStart } },
                _sum: { amount: true },
            }),
            this.prisma.subscriptionPayment.aggregate({
                where: { status: 'SUCCESS', createdAt: { gte: yearStart } },
                _sum: { amount: true },
            }),
            this.prisma.tenant.count(),
            this.prisma.tenantSubscription.count({
                where: { status: { in: ['ACTIVE', 'RENEWED'] } },
            }),
            this.prisma.tenantSubscription.count({
                where: { status: 'TRIAL' },
            }),
            this.prisma.tenantSubscription.count({
                where: { status: 'EXPIRED' },
            }),
            this.prisma.tenantSubscription.count({
                where: { status: 'GRACE_PERIOD' },
            }),
            this.prisma.tenantSubscription.count({
                where: { expiryDate: { gte: monthStart, lte: monthEnd } },
            }),
            this.prisma.subscriptionPayment.count({
                where: { status: 'FAILED' },
            }),
            this.prisma.subscriptionPayment.count({
                where: { status: 'SUCCESS' },
            }),
            this.prisma.subscriptionPayment.findMany({
                where: { status: 'PENDING' },
                include: {
                    tenant: { select: { id: true, name: true, subDomain: true, email: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.studentProfile.count(),
            this.prisma.staffProfile.count(),
            this.prisma.parentProfile.count(),
        ]);
        const totalRevenue = Number(totalRevenueAgg._sum.amount || 0);
        const todayRevenue = Number(todayRevenueAgg._sum.amount || 0);
        const monthlyRevenue = Number(monthlyRevenueAgg._sum.amount || 0);
        const annualRevenue = Number(annualRevenueAgg._sum.amount || 0);
        const totalPaymentAttempts = successfulPaymentsCount + failedPaymentsCount;
        const renewalSuccessRate = totalPaymentAttempts > 0
            ? Math.round((successfulPaymentsCount / totalPaymentAttempts) * 1000) / 10
            : 100;
        const mrr = Math.round(monthlyRevenue);
        const arr = totalRevenue > 0 ? Math.round(totalRevenue) : mrr * 12;
        const pendingRequests = pendingPayments.map((p) => {
            const resp = p.gatewayResponse || {};
            return {
                id: p.id,
                tenantId: p.tenantId,
                schoolName: p.tenant?.name || 'School',
                subDomain: p.tenant?.subDomain || '',
                plan: p.planId || 'BASIC',
                billingCycle: p.billingDurationMonths ? `${p.billingDurationMonths} Months` : '12 Months',
                billingMonths: p.billingDurationMonths || 12,
                amount: Number(p.amount),
                coupon: resp.couponCode || null,
                razorpayOrderId: p.gatewayReference || '',
                razorpayPaymentId: p.transactionId || '',
                transactionId: p.transactionId || '',
                paymentStatus: p.status,
                signatureVerified: p.signatureVerified,
                createdAt: p.createdAt,
            };
        });
        return {
            metrics: {
                totalRevenue,
                todayRevenue,
                monthlyRevenue,
                annualRevenue,
                mrr,
                arr,
                totalSchools,
                activeSchools: activeSubscriptions,
                trialSchools: trialSubscriptions,
                expiredSchools: expiredSubscriptions,
                gracePeriodSchools: gracePeriodSubscriptions,
                renewalsDueThisMonth,
                failedPayments: failedPaymentsCount,
                renewalSuccessRate: `${renewalSuccessRate}%`,
                activeSubscriptions,
                trialConversions: activeSubscriptions,
                pendingApprovals: pendingRequests.length,
                totalStudents,
                totalTeachers,
                totalParents,
                totalEcosystemUsers: totalStudents + totalTeachers + totalParents,
                pendingRequests,
            },
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        role_filter_helper_1.RoleFilterHelper])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map