"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAN_FEATURES = void 0;
const client_1 = require("@prisma/client");
exports.PLAN_FEATURES = {
    [client_1.PlanType.TRIAL]: ['admissions', 'attendance', 'timetable', 'exams', 'billing'],
    [client_1.PlanType.BASIC]: [
        'admissions', 'attendance', 'timetable', 'exams', 'billing',
        'library', 'expenses', 'academics'
    ],
    [client_1.PlanType.PREMIUM]: [
        'admissions', 'attendance', 'timetable', 'exams', 'billing',
        'library', 'expenses', 'academics',
        'transport', 'hostel', 'payroll', 'notifications_websockets',
        'parent_portal', 'teacher_portal'
    ]
};
//# sourceMappingURL=subscription.config.js.map