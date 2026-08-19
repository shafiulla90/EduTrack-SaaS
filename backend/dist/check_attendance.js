"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const attendance_service_1 = require("./attendance/attendance.service");
const tenant_context_1 = require("./tenants/tenant.context");
const prisma = new client_1.PrismaClient();
const service = new attendance_service_1.AttendanceService(prisma, null);
async function main() {
    const tenantId = 'ebc2dcb0-8985-43a7-bc83-c62b22f301d1';
    console.log(`Using tenant: ${tenantId}`);
    await tenant_context_1.TenantContext.run(tenantId, async () => {
        const data = await service.getAttendanceData('2026-07-01', '2026-07-31');
        console.log("--- SESSIONS FROM SERVICE ---");
        data.sessions.forEach(s => {
            console.log({
                id: s.id,
                className: s.className,
                section: s.section,
                attendanceDate: s.attendanceDate,
                totalStudents: s.totalStudents,
                presentCount: s.presentCount,
                absentCount: s.absentCount,
            });
        });
    });
}
main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=check_attendance.js.map