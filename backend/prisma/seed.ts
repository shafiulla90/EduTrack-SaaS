import { PrismaClient, Role, AttendanceStatus, PaymentStatus, PaymentMethod, ExpenseStatus, BookCopyStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // 1. Clean old entries
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Tenant" CASCADE;`);
  console.log('Cleared existing database records.');

  const passwordHash = await bcrypt.hash('Password@123', 10);

  // 2. Create Tenant A: Demo Public School
  const tenantA = await prisma.tenant.create({
    data: {
      name: 'Demo Public School',
      subDomain: 'demo-school',
      logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?q=80&w=200&auto=format&fit=crop',
      address: '123 Academy Lane, Education City',
      email: 'info@demoschool.com',
      phone: '123-456-7890',
      subtitle: 'Nurturing Minds, Shaping Futures',
      setupCompleted: true,
      bankName: 'National Education Bank',
      bankBranch: 'Main City Branch',
      bankIFSC: 'NEB0001234',
      bankAccountNo: '9876543210',
      googlePayId: 'gpay-demoschool@okaxis',
      phonePeId: 'ppe-demoschool@ybl',
    },
  });
  console.log(`Created Tenant A: ${tenantA.name} (${tenantA.subDomain})`);

  // 3. Create Tenant B: Synergy High School
  const tenantB = await prisma.tenant.create({
    data: {
      name: 'Synergy High School',
      subDomain: 'synergy-school',
      logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=200&auto=format&fit=crop',
      address: '456 Synergy Parkway, Tech Valley',
      email: 'admissions@synergy.edu',
      phone: '987-654-3210',
      subtitle: 'Innovation through Collaboration',
      setupCompleted: true,
    },
  });
  console.log(`Created Tenant B: ${tenantB.name} (${tenantB.subDomain})`);

  // ── TENANT A SEED DATA ──────────────────────────────────────────────────────

  // Academic Years
  const yearA_2025 = await prisma.academicYear.create({
    data: {
      name: '2025-2026',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2026-05-31'),
      isActive: false,
      tenantId: tenantA.id,
    },
  });

  const yearA_2026 = await prisma.academicYear.create({
    data: {
      name: '2026-2027',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2027-05-31'),
      isActive: true,
      tenantId: tenantA.id,
    },
  });

  // School Admin
  const adminA = await prisma.user.create({
    data: {
      email: 'admin@demoschool.com',
      passwordHash,
      name: 'Principal Sarah Jenkins',
      role: Role.SCHOOL_ADMIN,
      phone: '111-222-3333',
      tenantId: tenantA.id,
    },
  });

  // Teachers
  const teacherUser1 = await prisma.user.create({
    data: {
      email: 'math.teacher@demoschool.com',
      passwordHash,
      name: 'Dr. Alan Turing',
      role: Role.TEACHER,
      phone: '222-333-4444',
      tenantId: tenantA.id,
    },
  });

  const staffProfile1 = await prisma.staffProfile.create({
    data: {
      userId: teacherUser1.id,
      employeeId: 'EMP-MATH-01',
      designation: 'Head of Mathematics',
      basicSalary: 75000.00,
      allowances: 15000.00,
      deductions: 5000.00,
      pfDeduction: 4500.00,
      status: 'Active',
      qualification: 'PhD in Applied Mathematics',
      subjectsTaught: ['Mathematics', 'Statistics'],
    },
  });

  const teacherUser2 = await prisma.user.create({
    data: {
      email: 'science.teacher@demoschool.com',
      passwordHash,
      name: 'Marie Curie',
      role: Role.TEACHER,
      phone: '333-444-5555',
      tenantId: tenantA.id,
    },
  });

  const staffProfile2 = await prisma.staffProfile.create({
    data: {
      userId: teacherUser2.id,
      employeeId: 'EMP-SCI-02',
      designation: 'Senior Science Lecturer',
      basicSalary: 70000.00,
      allowances: 12000.00,
      deductions: 4000.00,
      pfDeduction: 4200.00,
      status: 'Active',
      qualification: 'M.Sc. in Physics',
      subjectsTaught: ['Physics', 'Chemistry'],
    },
  });

  // Sections setup
  const secA = await prisma.section.create({
    data: {
      name: 'Section A',
      isActive: true,
      tenantId: tenantA.id,
    },
  });

  // Class & Section setup for Y2025 (Completed)
  const classA_9 = await prisma.class.create({
    data: {
      name: 'Grade 9',
      isActive: true,
      academicYearId: yearA_2025.id,
      tenantId: tenantA.id,
    },
  });

  const classSection = await prisma.classSection.create({
    data: {
      classId: classA_9.id,
      sectionId: secA.id,
      teacherId: staffProfile1.id,
      strength: 2,
      tenantId: tenantA.id,
    },
  });

  // Class & Section setup for Y2026 (Active)
  const classA_10 = await prisma.class.create({
    data: {
      name: 'Grade 10',
      isActive: true,
      academicYearId: yearA_2026.id,
      tenantId: tenantA.id,
    },
  });

  const classSection10 = await prisma.classSection.create({
    data: {
      classId: classA_10.id,
      sectionId: secA.id,
      teacherId: staffProfile1.id,
      strength: 0,
      tenantId: tenantA.id,
    },
  });

  // Subjects
  const subMath = await prisma.subject.create({
    data: { name: 'Mathematics', tenantId: tenantA.id },
  });

  const subPhysics = await prisma.subject.create({
    data: { name: 'Physics', tenantId: tenantA.id },
  });

  await prisma.classSubject.createMany({
    data: [
      { classSectionId: classSection.id, subjectId: subMath.id, tenantId: tenantA.id },
      { classSectionId: classSection.id, subjectId: subPhysics.id, tenantId: tenantA.id },
    ],
  });

  // Teacher Assignments
  await prisma.teacherAssignment.createMany({
    data: [
      { teacherId: staffProfile1.id, classSectionId: classSection.id, subjectId: subMath.id, periodsPerWeek: 5, tenantId: tenantA.id },
      { teacherId: staffProfile2.id, classSectionId: classSection.id, subjectId: subPhysics.id, periodsPerWeek: 4, tenantId: tenantA.id },
    ],
  });

  // Parents
  const parentUser1 = await prisma.user.create({
    data: {
      email: 'parent.doe@demoschool.com',
      passwordHash,
      name: 'Robert Doe',
      role: Role.PARENT,
      phone: '888-999-0000',
      tenantId: tenantA.id,
    },
  });

  const parentProfile1 = await prisma.parentProfile.create({
    data: {
      userId: parentUser1.id,
      emergencyContact: '888-999-0000',
    },
  });

  const parentUser2 = await prisma.user.create({
    data: {
      email: 'parent.smith@demoschool.com',
      passwordHash,
      name: 'Linda Smith',
      role: Role.PARENT,
      phone: '999-000-1111',
      tenantId: tenantA.id,
    },
  });

  const parentProfile2 = await prisma.parentProfile.create({
    data: {
      userId: parentUser2.id,
      emergencyContact: '999-000-1111',
    },
  });

  // Students
  const studentUser1 = await prisma.user.create({
    data: {
      email: 'john.doe@demoschool.com',
      passwordHash,
      name: 'John Doe',
      role: Role.STUDENT,
      phone: '444-555-6666',
      tenantId: tenantA.id,
    },
  });

  const studentProfile1 = await prisma.studentProfile.create({
    data: {
      userId: studentUser1.id,
      rollNo: '1001',
      fatherName: 'Robert Doe',
      motherName: 'Mary Doe',
      aadharNo: '1234-5678-9012',
      classSectionId: classSection.id,
      parentProfileId: parentProfile1.id,
    },
  });

  const studentUser2 = await prisma.user.create({
    data: {
      email: 'jane.smith@demoschool.com',
      passwordHash,
      name: 'Jane Smith',
      role: Role.STUDENT,
      phone: '555-666-7777',
      tenantId: tenantA.id,
    },
  });

  const studentProfile2 = await prisma.studentProfile.create({
    data: {
      userId: studentUser2.id,
      rollNo: '1002',
      fatherName: 'David Smith',
      motherName: 'Linda Smith',
      aadharNo: '9876-5432-1098',
      classSectionId: classSection.id,
      parentProfileId: parentProfile2.id,
    },
  });

  // Attendance Session
  const attSession = await prisma.attendanceSession.create({
    data: {
      date: new Date(),
      classSectionId: classSection.id,
      takenById: staffProfile1.id,
      presentCount: 1,
      absentCount: 1,
      totalStudents: 2,
      tenantId: tenantA.id,
    },
  });

  // Log John as Present and Jane as Absent
  await prisma.attendance.create({
    data: {
      attendanceSessionId: attSession.id,
      studentId: studentProfile2.id, // Jane is Absent
      status: AttendanceStatus.ABSENT,
      reason: 'Sick with common cold',
      tenantId: tenantA.id,
    },
  });

  // Exams & Marks
  const exam = await prisma.exam.create({
    data: {
      name: 'First Mid-Term',
      type: 'Written',
      classSectionId: classSection.id,
      date: new Date(),
      tenantId: tenantA.id,
    },
  });

  await prisma.examMark.createMany({
    data: [
      { examId: exam.id, studentId: studentProfile1.id, subjectId: subMath.id, marksObtained: 85.00, remarks: 'Excellent logical skills', tenantId: tenantA.id },
      { examId: exam.id, studentId: studentProfile1.id, subjectId: subPhysics.id, marksObtained: 90.00, remarks: 'Top scores in class', tenantId: tenantA.id },
      { examId: exam.id, studentId: studentProfile2.id, subjectId: subMath.id, marksObtained: 72.00, remarks: 'Good, needs practice', tenantId: tenantA.id },
      { examId: exam.id, studentId: studentProfile2.id, subjectId: subPhysics.id, marksObtained: 78.00, remarks: 'Well prepared', tenantId: tenantA.id },
    ],
  });

  // Invoices & Items
  const invoice1 = await prisma.invoice.create({
    data: {
      studentId: studentProfile1.id,
      invoiceDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      totalAmount: 15000.00,
      paidAmount: 5000.00,
      remainingBalance: 10000.00,
      status: PaymentStatus.PARTIALLY_PAID,
      paymentMethod: PaymentMethod.UPI,
      description: 'Term 1 Tuition and Library Fees',
      tenantId: tenantA.id,
    },
  });

  await prisma.invoiceItem.createMany({
    data: [
      { invoiceId: invoice1.id, name: 'Tuition Fee - Grade 10', amount: 12000.00, tenantId: tenantA.id },
      { invoiceId: invoice1.id, name: 'Library Membership Fee', amount: 3000.00, tenantId: tenantA.id },
    ],
  });

  // Expenses
  await prisma.expense.createMany({
    data: [
      { amount: 50000.00, category: 'Rent', date: new Date(), description: 'Main Block Lease Payment', paymentMode: 'BANK_TRANSFER', status: ExpenseStatus.PAID, tenantId: tenantA.id },
      { amount: 12000.00, category: 'Salaries', date: new Date(), description: 'Part-time cleaning staff wage', paymentMode: 'CASH', status: ExpenseStatus.APPROVED, tenantId: tenantA.id },
    ],
  });

  // Timetable
  const timing1 = await prisma.periodTiming.create({
    data: { periodNumber: 1, startTime: '08:30', endTime: '09:15', isActive: true, tenantId: tenantA.id },
  });
  const timing2 = await prisma.periodTiming.create({
    data: { periodNumber: 2, startTime: '09:15', endTime: '10:00', isActive: true, tenantId: tenantA.id },
  });

  await prisma.period.createMany({
    data: [
      { classSectionId: classSection.id, subjectId: subMath.id, teacherId: staffProfile1.id, periodTimingId: timing1.id, dayOfWeek: 'Monday', tenantId: tenantA.id },
      { classSectionId: classSection.id, subjectId: subPhysics.id, teacherId: staffProfile2.id, periodTimingId: timing2.id, dayOfWeek: 'Monday', tenantId: tenantA.id },
    ],
  });

  // Library Setup
  const book = await prisma.book.create({
    data: {
      title: 'Foundation Physics',
      author: 'H.C. Verma',
      isbn: '978-3-16-148410-0',
      category: 'Science',
      totalCopies: 3,
      availableCopies: 2,
      tenantId: tenantA.id,
    },
  });

  const copy1 = await prisma.bookCopy.create({
    data: { bookId: book.id, barcode: '9783161484100-BK01-1', status: BookCopyStatus.ISSUED, tenantId: tenantA.id },
  });
  await prisma.bookCopy.createMany({
    data: [
      { bookId: book.id, barcode: '9783161484100-BK01-2', status: BookCopyStatus.AVAILABLE, tenantId: tenantA.id },
      { bookId: book.id, barcode: '9783161484100-BK01-3', status: BookCopyStatus.AVAILABLE, tenantId: tenantA.id },
    ],
  });

  // John Doe borrows copy 1
  await prisma.bookIssue.create({
    data: {
      bookCopyId: copy1.id,
      borrowerId: studentUser1.id,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 14)),
      tenantId: tenantA.id,
    },
  });

  // Activity Logs
  await prisma.activityLog.createMany({
    data: [
      { userId: adminA.id, action: 'USER_LOGIN', entityName: 'User', details: 'Administrator sarah logged in.', tenantId: tenantA.id },
      { userId: teacherUser1.id, action: 'RECORD_CREATE', entityName: 'AttendanceSession', details: 'Submitted attendance for Grade 10 A.', tenantId: tenantA.id },
    ],
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
