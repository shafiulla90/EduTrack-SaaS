const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const tenantId = '778b7f12-d8c3-406d-926c-a403b46100ef';
  console.log(`Checking StaffProfiles for tenant ID: ${tenantId}`);

  const staff = await prisma.staffProfile.findMany({
    where: {
      user: {
        tenantId: tenantId
      }
    },
    include: {
      user: true
    }
  });

  console.log(`Found ${staff.length} staff profiles:`);
  for (const s of staff) {
    console.log(`ID: ${s.id}`);
    console.log(`Designation: ${s.designation}`);
    console.log(`Staff tenantId: ${s.tenantId}`);
    console.log(`User name: ${s.user.name}`);
    console.log(`User role: ${s.user.role}`);
    console.log(`User tenantId: ${s.user.tenantId}`);
    console.log("-----------------------------------------");
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
