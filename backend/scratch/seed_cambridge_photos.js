const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const UNSPLASH_IDS = [
  'photo-1502082553048-f009c37129b9', // girl
  'photo-1519085360753-af0119f7cbe7', // boy
  'photo-1503919545889-aef636e10ad4', // boy
  'photo-1508214751196-bcfd4ca60f91', // girl
  'photo-1544717305-2782549b5136', // girl student
  'photo-1518806118471-f28b20a1d79d', // boy
  'photo-1520607162513-77705c0f0d4a', // girl
  'photo-1501196354995-cbb51c65aaea', // boy
  'photo-1544005313-94ddf0286df2', // girl
  'photo-1506794778202-cad84cf45f1d', // boy
  'photo-1438761681033-6461ffad8d80', // girl
  'photo-1500648767791-00dcc994a43e', // boy
  'photo-1542206395-9feb3edaa68d', // girl
  'photo-1517841905240-472988babdf9', // girl
  'photo-1534528741775-53994a69daeb', // girl
  'photo-1539571696357-5a69c17a67c6', // boy
  'photo-1507003211169-0a1dd7228f2d', // boy
  'photo-1494790108377-be9c29b29330', // girl
  'photo-1522075469751-3a6694fb2f61', // boy
  'photo-1488426862026-3ee34a7d66df', // girl
  'photo-1531746020798-e6953c6e8e04', // girl
  'photo-1524504388940-b1c1722653e1', // girl
  'photo-1519345182560-3f2917c472ef', // boy
  'photo-1522529590124-75d693f69735', // boy
  'photo-1548142813-c348350df52b', // girl
  'photo-1531123897727-8f129e1688ce', // girl
  'photo-1552058544-f2b08422138a', // boy
  'photo-1566492031773-4f4e44671857', // boy
  'photo-1580489944761-15a19d654956', // girl
  'photo-1597223557154-721c1cecc4b0', // girl
  'photo-1607990283143-e81e7a2c93ab', // boy
  'photo-1601412436009-d964bd02edbc', // boy
  'photo-1614644147724-2d4785d69962', // boy
  'photo-1595211877493-41a4e5f236b3', // boy
  'photo-1601288496920-b6154fe3626a', // girl
  'photo-1596495578065-6e0763fa1141', // boy
  'photo-1609132718484-cc90df3417f8', // girl
  'photo-1613145400516-09e192f15a1d', // boy
  'photo-1618673747378-7e0d3561371a', // boy
  'photo-1628157582853-a796fa650a6a'  // girl
];

function getPhotoUrl(index) {
  const id = UNSPLASH_IDS[index % UNSPLASH_IDS.length];
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=256&h=256`;
}

async function run() {
  try {
    const tenantId = 'ebc2dcb0-8985-43a7-bc83-c62b22f301d1';
    console.log("Seeding dummy student photos for tenant: Cambridge International School");

    // Fetch all student profiles in Cambridge International School
    const students = await prisma.studentProfile.findMany({
      where: { tenantId },
      select: { id: true, user: { select: { name: true } } }
    });

    console.log(`Found ${students.length} students. Updating profile photos...`);

    let updatedCount = 0;
    // Process updates in chunks of 50 to avoid overloading the DB connections
    const chunkSize = 50;
    for (let i = 0; i < students.length; i += chunkSize) {
      const chunk = students.slice(i, i + chunkSize);
      
      await Promise.all(chunk.map((student, idx) => {
        // Deterministic hash based on student ID to assign a photo
        const totalIdx = i + idx;
        const photoUrl = getPhotoUrl(totalIdx);
        return prisma.studentProfile.update({
          where: { id: student.id },
          data: { profilePhotoUrl: photoUrl }
        });
      }));

      updatedCount += chunk.length;
      console.log(`Updated ${updatedCount}/${students.length} students...`);
    }

    console.log("Successfully seeded dummy student photos!");

  } catch (err) {
    console.error('Error during seeding:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
