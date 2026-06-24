import { PrismaClient, Role } from '@prisma/client';
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

  // Academic Years for Tenant A
  const yearA_2026 = await prisma.academicYear.create({
    data: {
      name: '2026-2027',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2027-05-31'),
      isActive: true,
      tenantId: tenantA.id,
    },
  });
  console.log(`Created Academic Year for Tenant A`);

  // School Admin for Tenant A
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
  console.log(`Created Admin User for Tenant A`);

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
