import * as fs from 'fs';
import * as path from 'path';

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...values] = trimmed.split('=');
        const val = values.join('=').replace(/^["']|["']$/g, '');
        if (key && !process.env[key.trim()]) {
          process.env[key.trim()] = val.trim();
        }
      }
    });
  }
}
loadEnv();

import { FirebaseService } from './src/database/firebase.service';
import { FirestoreUserRepository } from './src/database/repositories/firestore/firestore-user.repository';
import { FirestoreTeacherRepository } from './src/database/repositories/firestore/firestore-teacher.repository';
import { TeacherService } from './src/modules/teacher/teacher.service';

async function testCreate() {
  const firebaseService = new FirebaseService();
  await firebaseService.onModuleInit();

  const userRepo = new FirestoreUserRepository(firebaseService);
  const teacherRepo = new FirestoreTeacherRepository(firebaseService);
  const teacherService = new TeacherService(teacherRepo, userRepo);

  console.log('Testing Non-Teaching Staff Creation in Firebase...');
  const payload = {
    name: 'Raju Bhai',
    email: `raju_test_${Date.now()}@gmail.com`,
    phone: '9642402639',
    employeeId: 'BUS-123',
    designation: 'Bus Attendant',
    department: 'Transport',
    basicSalary: 30000,
    allowances: 3600,
    pfDeduction: 1500,
    joiningDate: '2026-08-17',
    qualification: undefined, // intentionally undefined to test sanitizePayload
    subjectsTaught: ['Transport'],
    staffType: 'Non-Teaching',
    status: 'Active',
    avatarUrl: null
  };

  try {
    const result = await teacherService.create('tenant-test-001', payload);
    console.log('✅ SUCCESS! Created staff:', JSON.stringify(result, null, 2));
  } catch (err: any) {
    console.error('❌ ERROR in teacherService.create:', err.stack || err);
  }
}

testCreate().then(() => process.exit(0)).catch(err => { console.error('FATAL:', err); process.exit(1); });
