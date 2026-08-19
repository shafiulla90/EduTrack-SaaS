"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const sessions = await prisma.attendanceSession.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
            classSection: {
                include: {
                    class: true,
                    section: true,
                }
            }
        }
    });
    console.log(`--- LAST 10 SESSIONS ---`);
    sessions.forEach(s => {
        console.log({
            id: s.id,
            dateInDb: s.date,
            dateISO: s.date.toISOString(),
            dateLocalString: s.date.toString(),
            class: s.classSection.class.name,
            section: s.classSection.section.name,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
        });
    });
}
main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=list_sessions.js.map