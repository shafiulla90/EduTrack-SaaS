import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TenantContext } from '../tenants/tenant.context';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  private getTenantId(): string {
    const tenantId = TenantContext.getTenantId();
    if (!tenantId) {
      throw new BadRequestException('No active school tenant context found');
    }
    return tenantId;
  }

  async getDashboardSummary() {
    const tenantId = this.getTenantId();

    // Prepare date ranges for last 6 months
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

    // Execute queries in batches to prevent connection pool timeouts
    const [
      studentsCount,
      teachersCount,
      classesCount,
      revenueAgg,
      expenseAgg,
      sessions,
      marks
    ] = await Promise.all([
      // 1. Total Students
      this.prisma.studentProfile.count({
        where: {
          user: {
            tenantId,
            isActive: true,
          },
        },
      }),

      // 2. Total Teachers
      this.prisma.staffProfile.count({
        where: {
          user: {
            tenantId,
            isActive: true,
            role: { in: ['TEACHER', 'STAFF'] },
          },
        },
      }),

      // 3. Total Classes
      this.prisma.classSection.count({
        where: {
          tenantId,
          class: {
            isActive: true,
          },
        },
      }),

      // 4. Total Revenue
      this.prisma.invoice.aggregate({
        where: {
          tenantId,
          status: 'PAID',
        },
        _sum: {
          paidAmount: true,
        },
      }),

      // 5. Total Expenses
      this.prisma.expense.aggregate({
        where: {
          tenantId,
          status: 'PAID',
        },
        _sum: {
          amount: true,
        },
      }),

      // 6. Average Attendance Rate
      this.prisma.attendanceSession.findMany({
        where: { tenantId },
        select: { presentCount: true, totalStudents: true },
      }),

      // 7. Avg. Academic Score
      this.prisma.examMark.findMany({
        where: { tenantId },
        select: { marksObtained: true },
      })
    ]);

    const [
      recentStudents,
      invoices,
      salaryExpenses,
      studentsThisMonth,
      studentsLastMonth,
      revThisMonthAgg,
      revLastMonthAgg
    ] = await Promise.all([
      // 8. Recent Admissions
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

      // 9. Recent Payments - Invoices
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

      // 9b. Recent Payments - Salary Expenses
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

      // 11. Trend Students This Month
      this.prisma.studentProfile.count({
        where: { user: { tenantId, isActive: true, createdAt: { gte: thisMonthStart } } },
      }),

      // 11b. Trend Students Last Month
      this.prisma.studentProfile.count({
        where: { user: { tenantId, isActive: true, createdAt: { gte: lastMonthStart, lte: lastMonthEnd } } },
      }),

      // 11c. Trend Revenue This Month
      this.prisma.invoice.aggregate({
        where: { tenantId, status: 'PAID', invoiceDate: { gte: thisMonthStart } },
        _sum: { paidAmount: true },
      }),

      // 11d. Trend Revenue Last Month
      this.prisma.invoice.aggregate({
        where: { tenantId, status: 'PAID', invoiceDate: { gte: lastMonthStart, lte: lastMonthEnd } },
        _sum: { paidAmount: true },
      })
    ]);

    // 10. Chart Data (Monthly collections & salaries queries in smaller groups)
    const chartDataAggregates = [];

    // Months 1-2
    const batch1 = await Promise.all(
      last6Months.slice(0, 2).flatMap(m => {
        const startDate = new Date(m.year, m.month, 1);
        const endDate = new Date(m.year, m.month + 1, 0, 23, 59, 59, 999);
        return [
          this.prisma.invoice.aggregate({
            where: {
              tenantId,
              status: 'PAID',
              invoiceDate: { gte: startDate, lte: endDate },
            },
            _sum: { paidAmount: true },
          }),
          this.prisma.expense.aggregate({
            where: {
              tenantId,
              category: 'Salary',
              status: 'PAID',
              date: { gte: startDate, lte: endDate },
            },
            _sum: { amount: true },
          })
        ];
      })
    );
    chartDataAggregates.push(...batch1);

    // Months 3-4
    const batch2 = await Promise.all(
      last6Months.slice(2, 4).flatMap(m => {
        const startDate = new Date(m.year, m.month, 1);
        const endDate = new Date(m.year, m.month + 1, 0, 23, 59, 59, 999);
        return [
          this.prisma.invoice.aggregate({
            where: {
              tenantId,
              status: 'PAID',
              invoiceDate: { gte: startDate, lte: endDate },
            },
            _sum: { paidAmount: true },
          }),
          this.prisma.expense.aggregate({
            where: {
              tenantId,
              category: 'Salary',
              status: 'PAID',
              date: { gte: startDate, lte: endDate },
            },
            _sum: { amount: true },
          })
        ];
      })
    );
    chartDataAggregates.push(...batch2);

    // Months 5-6
    const batch3 = await Promise.all(
      last6Months.slice(4, 6).flatMap(m => {
        const startDate = new Date(m.year, m.month, 1);
        const endDate = new Date(m.year, m.month + 1, 0, 23, 59, 59, 999);
        return [
          this.prisma.invoice.aggregate({
            where: {
              tenantId,
              status: 'PAID',
              invoiceDate: { gte: startDate, lte: endDate },
            },
            _sum: { paidAmount: true },
          }),
          this.prisma.expense.aggregate({
            where: {
              tenantId,
              category: 'Salary',
              status: 'PAID',
              date: { gte: startDate, lte: endDate },
            },
            _sum: { amount: true },
          })
        ];
      })
    );
    chartDataAggregates.push(...batch3);

    const totalRevenue = Number(revenueAgg._sum.paidAmount || 0);
    const totalExpenses = Number(expenseAgg._sum.amount || 0);
    const netIncome = totalRevenue - totalExpenses;

    const totalPresent = sessions.reduce((sum, s) => sum + s.presentCount, 0);
    const totalRoster = sessions.reduce((sum, s) => sum + s.totalStudents, 0);
    const attendanceRate = totalRoster > 0 ? Math.round((totalPresent / totalRoster) * 1000) / 10 : 0;

    const academicAverage = marks.length > 0
      ? Math.round((marks.reduce((sum, m) => sum + Number(m.marksObtained), 0) / (marks.length)) * 10) / 10
      : 0;

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

    // Combine and sort by date descending
    const recentPayments = [...studentPayments, ...salaryPayments]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    // Unpack chartDataAggregates
    const chartData = [];
    for (let idx = 0; idx < last6Months.length; idx++) {
      const m = last6Months[idx];
      const monthFees = chartDataAggregates[idx * 2] as any;
      const monthSalaries = chartDataAggregates[idx * 2 + 1] as any;

      const collections = Number(monthFees._sum.paidAmount || 0);
      const salaries = Number(monthSalaries._sum.amount || 0);
      const revenue = collections - salaries;

      chartData.push({
        month: m.label,
        feeCollection: collections,
        salaryExpense: salaries,
        netRevenue: revenue,
      });
    }

    const studentTrendVal = studentsLastMonth > 0 
      ? ((studentsThisMonth - studentsLastMonth) / studentsLastMonth) * 100
      : studentsThisMonth > 0 ? 100 : 0;

    const revThisMonth = Number(revThisMonthAgg._sum.paidAmount || 0);
    const revLastMonth = Number(revLastMonthAgg._sum.paidAmount || 0);
    const revenueTrendVal = revLastMonth > 0 
      ? ((revThisMonth - revLastMonth) / revLastMonth) * 100
      : revThisMonth > 0 ? 100 : 0;

    return {
      stats: {
        studentsCount,
        teachersCount,
        classesCount,
        totalRevenue,
        totalExpenses,
        netIncome,
        attendanceRate,
        academicAverage,
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
  }

  async getReportsSummary() {
    const tenantId = this.getTenantId();

    // 1. Enrollment Demographics (Student counts grouped by class)
    const students = await this.prisma.studentProfile.findMany({
      where: {
        user: { tenantId, isActive: true }
      },
      include: {
        user: { select: { createdAt: true } },
        classSection: {
          include: { class: true, section: true }
        }
      }
    });

    const classDistribution: Record<string, number> = {};
    students.forEach(s => {
      const className = s.classSection?.class.name || 'Unassigned';
      classDistribution[className] = (classDistribution[className] || 0) + 1;
    });

    const timelineGroups: Record<string, number> = {};
    students.forEach(s => {
      const dateStr = s.user.createdAt.toISOString().slice(0, 7); // YYYY-MM
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

    // 2. Financial Statements (Paid revenue, outstanding balances, salaries paid)
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

    const financials = {
      totalRevenue,
      outstandingReceivables,
      totalExpenses,
      netCashflow: totalRevenue - totalExpenses
    };

    // 3. Grading Averages & Mark Distribution curve
    const marks = await this.prisma.examMark.findMany({
      where: { tenantId }
    });

    let totalMarksObtained = 0;
    let passedCount = 0;
    let failedCount = 0;
    const distribution = {
      failed: 0, // < 35
      belowAverage: 0, // 35 - 60
      average: 0, // 60 - 75
      firstDivision: 0, // 75 - 90
      highDistinction: 0 // 90 - 100
    };

    marks.forEach(m => {
      const score = Number(m.marksObtained);
      totalMarksObtained += score;

      if (score < 35) {
        failedCount++;
        distribution.failed++;
      } else {
        passedCount++;
        if (score >= 35 && score < 60) distribution.belowAverage++;
        else if (score >= 60 && score < 75) distribution.average++;
        else if (score >= 75 && score < 90) distribution.firstDivision++;
        else if (score >= 90) distribution.highDistinction++;
      }
    });

    const totalMarksEntries = marks.length;
    const averageScore = totalMarksEntries > 0 ? (totalMarksObtained / totalMarksEntries) : 0;
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

  async getDemographicsReport() {
    const tenantId = this.getTenantId();
    const students = await this.prisma.studentProfile.findMany({
      where: { user: { tenantId, isActive: true } },
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

  async getCashflowsReport() {
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

    const txs: any[] = [];
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

  async getGradingReport() {
    const tenantId = this.getTenantId();
    const marks = await this.prisma.examMark.findMany({
      where: { tenantId },
      include: {
        student: { include: { user: { select: { name: true } } } },
        subject: { select: { name: true } },
        exam: { select: { type: true } }
      }
    });

    return marks.map(m => ({
      studentName: m.student?.user.name || 'Student',
      rollNo: m.student?.rollNo || 'N/A',
      subject: m.subject?.name || 'Subject',
      examType: m.exam?.type || 'Exam',
      marksObtained: Number(m.marksObtained),
      maxMarks: 100
    }));
  }
}
