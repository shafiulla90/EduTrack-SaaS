"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const auth_module_1 = require("./modules/auth/auth.module");
const attendance_module_1 = require("./modules/attendance/attendance.module");
const core_1 = require("@nestjs/core");
const subscription_guard_1 = require("./common/guards/subscription.guard");
const tenant_module_1 = require("./modules/tenant/tenant.module");
const student_module_1 = require("./modules/student/student.module");
const firebase_module_1 = require("./database/firebase.module");
const database_provider_module_1 = require("./database/database-provider.module");
const teacher_module_1 = require("./modules/teacher/teacher.module");
const timetable_module_1 = require("./modules/timetable/timetable.module");
const subscription_module_1 = require("./modules/subscription/subscription.module");
const communications_module_1 = require("./modules/communications/communications.module");
const school_setup_module_1 = require("./modules/school-setup/school-setup.module");
const platform_admin_module_1 = require("./modules/platform-admin/platform-admin.module");
const billing_module_1 = require("./modules/billing/billing.module");
const expenses_module_1 = require("./modules/expenses/expenses.module");
const exams_module_1 = require("./modules/exams/exams.module");
const complaint_box_module_1 = require("./modules/complaint-box/complaint-box.module");
const teacher_portal_module_1 = require("./modules/teacher-portal/teacher-portal.module");
const parent_portal_module_1 = require("./modules/parent-portal/parent-portal.module");
const academics_module_1 = require("./modules/academics/academics.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const tenant_context_middleware_1 = require("./common/middleware/tenant-context.middleware");
const app_controller_1 = require("./app.controller");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(tenant_context_middleware_1.TenantContextMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        controllers: [app_controller_1.AppController],
        imports: [
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'edutrack_secret_2026_!@#',
                signOptions: { expiresIn: '24h' },
            }),
            firebase_module_1.FirebaseModule,
            database_provider_module_1.DatabaseProviderModule,
            auth_module_1.AuthModule,
            tenant_module_1.TenantModule,
            student_module_1.StudentModule,
            attendance_module_1.AttendanceModule,
            teacher_module_1.TeacherModule,
            timetable_module_1.TimetableModule,
            subscription_module_1.SubscriptionModule,
            platform_admin_module_1.PlatformAdminModule,
            communications_module_1.CommunicationsModule,
            school_setup_module_1.SchoolSetupModule,
            billing_module_1.BillingModule,
            expenses_module_1.ExpensesModule,
            exams_module_1.ExamsModule,
            complaint_box_module_1.ComplaintBoxModule,
            teacher_portal_module_1.TeacherPortalModule,
            parent_portal_module_1.ParentPortalModule,
            academics_module_1.AcademicsModule,
            dashboard_module_1.DashboardModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: subscription_guard_1.SubscriptionGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map