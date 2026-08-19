"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseProviderModule = void 0;
const common_1 = require("@nestjs/common");
const firebase_module_1 = require("./firebase.module");
const firebase_service_1 = require("./firebase.service");
const firestore_user_repository_1 = require("./repositories/firestore/firestore-user.repository");
const firestore_tenant_repository_1 = require("./repositories/firestore/firestore-tenant.repository");
const firestore_academic_repository_1 = require("./repositories/firestore/firestore-academic.repository");
const firestore_student_repository_1 = require("./repositories/firestore/firestore-student.repository");
const firestore_teacher_repository_1 = require("./repositories/firestore/firestore-teacher.repository");
const firestore_timetable_repository_1 = require("./repositories/firestore/firestore-timetable.repository");
const firestore_attendance_repository_1 = require("./repositories/firestore/firestore-attendance.repository");
const firestore_exam_repository_1 = require("./repositories/firestore/firestore-exam.repository");
const firestore_billing_repository_1 = require("./repositories/firestore/firestore-billing.repository");
const firestore_subscription_repository_1 = require("./repositories/firestore/firestore-subscription.repository");
const firestore_platform_admin_repository_1 = require("./repositories/firestore/firestore-platform-admin.repository");
const firestore_library_repository_1 = require("./repositories/firestore/firestore-library.repository");
const firestore_operations_repository_1 = require("./repositories/firestore/firestore-operations.repository");
const repositoryProviders = [
    {
        provide: 'IUserRepository',
        useFactory: (firebase) => new firestore_user_repository_1.FirestoreUserRepository(firebase),
        inject: [firebase_service_1.FirebaseService],
    },
    {
        provide: 'ITenantRepository',
        useFactory: (firebase) => new firestore_tenant_repository_1.FirestoreTenantRepository(firebase),
        inject: [firebase_service_1.FirebaseService],
    },
    {
        provide: 'IAcademicRepository',
        useFactory: (firebase) => new firestore_academic_repository_1.FirestoreAcademicRepository(firebase),
        inject: [firebase_service_1.FirebaseService],
    },
    {
        provide: 'IStudentRepository',
        useFactory: (firebase) => new firestore_student_repository_1.FirestoreStudentRepository(firebase),
        inject: [firebase_service_1.FirebaseService],
    },
    {
        provide: 'ITeacherRepository',
        useFactory: (firebase) => new firestore_teacher_repository_1.FirestoreTeacherRepository(firebase),
        inject: [firebase_service_1.FirebaseService],
    },
    {
        provide: 'ITimetableRepository',
        useFactory: (firebase) => new firestore_timetable_repository_1.FirestoreTimetableRepository(firebase),
        inject: [firebase_service_1.FirebaseService],
    },
    {
        provide: 'IAttendanceRepository',
        useFactory: (firebase) => new firestore_attendance_repository_1.FirestoreAttendanceRepository(firebase),
        inject: [firebase_service_1.FirebaseService],
    },
    {
        provide: 'IExamRepository',
        useFactory: (firebase) => new firestore_exam_repository_1.FirestoreExamRepository(firebase),
        inject: [firebase_service_1.FirebaseService],
    },
    {
        provide: 'IBillingRepository',
        useFactory: (firebase) => new firestore_billing_repository_1.FirestoreBillingRepository(firebase),
        inject: [firebase_service_1.FirebaseService],
    },
    {
        provide: 'ISubscriptionRepository',
        useFactory: (firebase) => new firestore_subscription_repository_1.FirestoreSubscriptionRepository(firebase),
        inject: [firebase_service_1.FirebaseService],
    },
    {
        provide: 'IPlatformAdminRepository',
        useFactory: (firebase) => new firestore_platform_admin_repository_1.FirestorePlatformAdminRepository(firebase),
        inject: [firebase_service_1.FirebaseService],
    },
    {
        provide: 'ILibraryRepository',
        useFactory: (firebase) => new firestore_library_repository_1.FirestoreLibraryRepository(firebase),
        inject: [firebase_service_1.FirebaseService],
    },
    {
        provide: 'IOperationsRepository',
        useFactory: (firebase) => new firestore_operations_repository_1.FirestoreOperationsRepository(firebase),
        inject: [firebase_service_1.FirebaseService],
    },
];
let DatabaseProviderModule = class DatabaseProviderModule {
};
exports.DatabaseProviderModule = DatabaseProviderModule;
exports.DatabaseProviderModule = DatabaseProviderModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [firebase_module_1.FirebaseModule],
        providers: [...repositoryProviders],
        exports: [...repositoryProviders, firebase_module_1.FirebaseModule],
    })
], DatabaseProviderModule);
//# sourceMappingURL=database-provider.module.js.map