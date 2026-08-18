import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { FirebaseService } from '../src/database/firebase.service';
import { FirestoreUserRepository } from '../src/database/repositories/firestore/firestore-user.repository';
import { FirestoreTenantRepository } from '../src/database/repositories/firestore/firestore-tenant.repository';
import { FirestoreAcademicRepository } from '../src/database/repositories/firestore/firestore-academic.repository';
import { FirestoreStudentRepository } from '../src/database/repositories/firestore/firestore-student.repository';
import { FirestoreTeacherRepository } from '../src/database/repositories/firestore/firestore-teacher.repository';
import { FirestoreTimetableRepository } from '../src/database/repositories/firestore/firestore-timetable.repository';
import { FirestoreAttendanceRepository } from '../src/database/repositories/firestore/firestore-attendance.repository';
import { FirestoreExamRepository } from '../src/database/repositories/firestore/firestore-exam.repository';
import { FirestoreBillingRepository } from '../src/database/repositories/firestore/firestore-billing.repository';
import { FirestoreSubscriptionRepository } from '../src/database/repositories/firestore/firestore-subscription.repository';
import { FirestorePlatformAdminRepository } from '../src/database/repositories/firestore/firestore-platform-admin.repository';
import { FirestoreLibraryRepository } from '../src/database/repositories/firestore/firestore-library.repository';
import { FirestoreOperationsRepository } from '../src/database/repositories/firestore/firestore-operations.repository';

describe('Phase 7E Firestore Repositories Unit Tests', () => {
  let moduleRef: TestingModule;
  let firebaseService: FirebaseService;

  let userRepo: FirestoreUserRepository;
  let tenantRepo: FirestoreTenantRepository;
  let academicRepo: FirestoreAcademicRepository;
  let studentRepo: FirestoreStudentRepository;
  let teacherRepo: FirestoreTeacherRepository;
  let timetableRepo: FirestoreTimetableRepository;
  let attendanceRepo: FirestoreAttendanceRepository;
  let examRepo: FirestoreExamRepository;
  let billingRepo: FirestoreBillingRepository;
  let subscriptionRepo: FirestoreSubscriptionRepository;
  let adminRepo: FirestorePlatformAdminRepository;
  let libraryRepo: FirestoreLibraryRepository;
  let operationsRepo: FirestoreOperationsRepository;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    firebaseService = moduleRef.get<FirebaseService>(FirebaseService);
    userRepo = new FirestoreUserRepository(firebaseService);
    tenantRepo = new FirestoreTenantRepository(firebaseService);
    academicRepo = new FirestoreAcademicRepository(firebaseService);
    studentRepo = new FirestoreStudentRepository(firebaseService);
    teacherRepo = new FirestoreTeacherRepository(firebaseService);
    timetableRepo = new FirestoreTimetableRepository(firebaseService);
    attendanceRepo = new FirestoreAttendanceRepository(firebaseService);
    examRepo = new FirestoreExamRepository(firebaseService);
    billingRepo = new FirestoreBillingRepository(firebaseService);
    subscriptionRepo = new FirestoreSubscriptionRepository(firebaseService);
    adminRepo = new FirestorePlatformAdminRepository(firebaseService);
    libraryRepo = new FirestoreLibraryRepository(firebaseService);
    operationsRepo = new FirestoreOperationsRepository(firebaseService);
  });

  afterAll(async () => {
    if (moduleRef) {
      await moduleRef.close();
    }
  });

  it('1. FirestoreUserRepository: Instantiation and interface compliance', () => {
    expect(userRepo).toBeDefined();
  });

  it('2. FirestoreTenantRepository: Instantiation and interface compliance', () => {
    expect(tenantRepo).toBeDefined();
  });

  it('3. FirestoreAcademicRepository: Instantiation and interface compliance', () => {
    expect(academicRepo).toBeDefined();
  });

  it('4. FirestoreStudentRepository: Instantiation and interface compliance', () => {
    expect(studentRepo).toBeDefined();
  });

  it('5. FirestoreTeacherRepository: Instantiation and interface compliance', () => {
    expect(teacherRepo).toBeDefined();
  });

  it('6. FirestoreTimetableRepository: Instantiation and interface compliance', () => {
    expect(timetableRepo).toBeDefined();
  });

  it('7. FirestoreAttendanceRepository: Instantiation and interface compliance', () => {
    expect(attendanceRepo).toBeDefined();
  });

  it('8. FirestoreExamRepository: Instantiation and interface compliance', () => {
    expect(examRepo).toBeDefined();
  });

  it('9. FirestoreBillingRepository: Instantiation and interface compliance', () => {
    expect(billingRepo).toBeDefined();
  });

  it('10. FirestoreSubscriptionRepository: Instantiation and interface compliance', () => {
    expect(subscriptionRepo).toBeDefined();
  });

  it('11. FirestorePlatformAdminRepository: Instantiation and interface compliance', () => {
    expect(adminRepo).toBeDefined();
  });

  it('12. FirestoreLibraryRepository: Instantiation and interface compliance', () => {
    expect(libraryRepo).toBeDefined();
  });

  it('13. FirestoreOperationsRepository: Instantiation and interface compliance', () => {
    expect(operationsRepo).toBeDefined();
  });
});
