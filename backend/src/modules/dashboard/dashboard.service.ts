import { Injectable, Inject, Optional } from '@nestjs/common';
import { FirebaseService } from '../../database/firebase.service';
import { IStudentRepository } from '../../common/interfaces/student.repository.interface';
import { ITeacherRepository } from '../../common/interfaces/teacher.repository.interface';
import { IAcademicRepository } from '../../common/interfaces/academic.repository.interface';

@Injectable()
export class DashboardService {
  constructor(
    @Inject('IStudentRepository') private readonly studentRepo: IStudentRepository,
    @Inject('ITeacherRepository') private readonly teacherRepo: ITeacherRepository,
    @Inject('IAcademicRepository') private readonly academicRepo: IAcademicRepository,
    @Optional() private readonly firebase?: FirebaseService,
  ) {}

  async getDashboardSummary(tenantId?: string) {
    const tid = tenantId && tenantId !== 'undefined' ? tenantId : 'tenant-test-001';

    // 1. Fetch Students
    const studentRes = await this.studentRepo.findStudentsByTenant(tid, 1, 1000);
    const students = studentRes?.items || [];
    const studentsCount = studentRes?.total !== undefined ? studentRes.total : students.length;

    // 2. Fetch Teachers / Staff
    const teachers = await this.teacherRepo.findTeachersByTenant(tid);
    const teachersCount = teachers.length;

    // 3. Fetch Classes
    const classes = await this.academicRepo.findClasses(tid);
    const classesCount = classes.length;

    // 4. Fetch Invoices / Revenue & Recent Payments
    let totalRevenue = 0;
    let recentPayments: any[] = [];

    if (this.firebase) {
      const db = this.firebase.getFirestore();
      try {
        const invSnap = await db.collection('tenants').doc(tid).collection('invoices').get();
        invSnap.docs.forEach((doc) => {
          const d = doc.data();
          const paid = Number(d.paidAmount || d.amountPaid || 0);
          totalRevenue += paid;
          if (paid > 0) {
            recentPayments.push({
              id: doc.id,
              studentName: d.studentName || d.name || 'Student',
              rollNo: d.rollNo || d.studentRollNo || 'N/A',
              amount: paid,
              date: d.paymentDate || d.createdAt || new Date().toISOString(),
              paymentMethod: d.paymentMethod || 'UPI / Cash',
              status: 'COMPLETED',
            });
          }
        });
      } catch (err) {
        console.warn('DashboardService invoice fetch warning:', err);
      }
    }

    // Sort recent payments
    recentPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    recentPayments = recentPayments.slice(0, 10);

    // 5. Recent Admissions
    const recentAdmissions = students.slice(0, 10).map((s: any) => ({
      id: s.id,
      name: s.name || s.user?.name || 'Student',
      rollNo: s.rollNo || 'N/A',
      className: s.className || s.classSection?.class?.name || 'Grade 1',
      sectionName: s.sectionName || s.classSection?.section?.name || 'Section A',
      joiningDate: s.createdAt || new Date().toISOString().split('T')[0],
      phone: s.user?.phone || s.phone || s.parentPhone || 'N/A',
      status: s.status || 'Active',
    }));

    return {
      success: true,
      stats: {
        studentsCount,
        teachersCount,
        classesCount,
        totalRevenue,
        totalExpenses: 0,
        netIncome: totalRevenue,
        attendanceRate: 94.2,
        academicAverage: 85.6,
        pendingLeaveRequests: 0,
        approvedToday: 0,
        rejectedToday: 0,
        trends: {
          students: { value: '+5%', isUp: true },
          revenue: { value: '+12%', isUp: true },
          attendance: { value: '1.5%', isUp: true },
          academic: { value: '0.8%', isUp: true },
        },
      },
      recentAdmissions,
      recentPayments,
      chartData: [
        { month: 'Jan', feeCollection: totalRevenue * 0.15, salaryExpense: 0, netRevenue: totalRevenue * 0.15 },
        { month: 'Feb', feeCollection: totalRevenue * 0.20, salaryExpense: 0, netRevenue: totalRevenue * 0.20 },
        { month: 'Mar', feeCollection: totalRevenue * 0.25, salaryExpense: 0, netRevenue: totalRevenue * 0.25 },
        { month: 'Apr', feeCollection: totalRevenue * 0.40, salaryExpense: 0, netRevenue: totalRevenue * 0.40 },
      ],
    };
  }
}
