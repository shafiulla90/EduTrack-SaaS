import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../firebase.service';
import { ITeacherRepository } from '../../../common/interfaces/teacher.repository.interface';
import { DeterministicKey } from '../../../common/utils/migration-helpers';

function sanitizePayload(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map(sanitizePayload);
  const clean: any = {};
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      clean[key] = sanitizePayload(obj[key]);
    }
  }
  return clean;
}

@Injectable()
export class FirestoreTeacherRepository implements ITeacherRepository {
  constructor(private readonly firebase: FirebaseService) {}

  private get db() {
    return this.firebase.getFirestore();
  }

  async findProfileById(id: string): Promise<any | null> {
    const doc = await this.db.collection('staffProfiles').doc(id).get();
    if (!doc.exists) return null;
    const data = { id: doc.id, ...doc.data() };
    const userDoc = await this.db.collection('users').doc((data as any).userId).get();
    const userData = userDoc.exists ? { id: userDoc.id, ...userDoc.data() } : null;
    return {
      ...data,
      User: userData,
      user: userData,
    };
  }

  async findProfileByUserId(userId: string): Promise<any | null> {
    const snap = await this.db.collection('staffProfiles').where('userId', '==', userId).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  async findTeachersByTenant(tenantId: string): Promise<any[]> {
    // Query users with role TEACHER or STAFF (non-teaching) for this tenant
    const [teacherSnap, staffSnap, driverSnap] = await Promise.all([
      this.db.collection('users').where('tenantId', '==', tenantId).where('role', '==', 'TEACHER').get(),
      this.db.collection('users').where('tenantId', '==', tenantId).where('role', '==', 'STAFF').get(),
      this.db.collection('users').where('tenantId', '==', tenantId).where('role', '==', 'DRIVER').get(),
    ]);

    const allUserDocs = [...teacherSnap.docs, ...staffSnap.docs, ...driverSnap.docs];
    const userIds = allUserDocs.map((d) => d.id);
    if (userIds.length === 0) return [];

    // Firestore 'in' query supports max 30 items
    const staffProfiles: any[] = [];
    for (let i = 0; i < userIds.length; i += 30) {
      const batch = userIds.slice(i, i + 30);
      const snap = await this.db.collection('staffProfiles').where('userId', 'in', batch).get();
      staffProfiles.push(...snap.docs);
    }

    return Promise.all(
      staffProfiles.map(async (doc) => {
        const data = { id: doc.id, ...doc.data() };
        const userDoc = await this.db.collection('users').doc((data as any).userId).get();
        const userData = userDoc.exists ? { id: userDoc.id, ...userDoc.data() } : null;
        return {
          ...data,
          User: userData,
          user: userData, // lowercase alias for frontend compatibility
        };
      }),
    );
  }

  async findTeacherAssignments(teacherId: string): Promise<any[]> {
    const snap = await this.db.collectionGroup('teacherAssignments').where('teacherId', '==', teacherId).get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async findTeacherSkills(teacherId: string): Promise<any[]> {
    const snap = await this.db.collectionGroup('teacherSkills').where('teacherId', '==', teacherId).get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async createTeacherAssignment(data: any): Promise<any> {
    const tenantId = data.tenantId || 'tenant-test-001';
    const docId = data.id || DeterministicKey.teacherAssignment(data.teacherId, data.classSectionId, data.subjectId);
    const ref = this.db.collection('tenants').doc(tenantId).collection('teacherAssignments').doc(docId);
    const payload = sanitizePayload({ ...data, id: docId, tenantId });
    await ref.set(payload, { merge: true });
    return payload;
  }

  async createTeacherSkill(data: any): Promise<any> {
    const tenantId = data.tenantId || 'tenant-test-001';
    const docId = data.id || DeterministicKey.teacherSkill(data.teacherId, data.subjectId);
    const ref = this.db.collection('tenants').doc(tenantId).collection('teacherSkills').doc(docId);
    const payload = sanitizePayload({ ...data, id: docId, tenantId });
    await ref.set(payload, { merge: true });
    return payload;
  }

  async createStaffProfile(data: any): Promise<any> {
    const docId = data.id || this.db.collection('staffProfiles').doc().id;
    const ref = this.db.collection('staffProfiles').doc(docId);
    const payload = sanitizePayload({ ...data, id: docId });
    await ref.set(payload, { merge: true });
    return payload;
  }

  async updateStaffProfile(id: string, data: any): Promise<any> {
    const ref = this.db.collection('staffProfiles').doc(id);
    const cleanData = sanitizePayload(data);
    await ref.set(cleanData, { merge: true });
    const doc = await ref.get();
    return { id: doc.id, ...doc.data() };
  }

  async deleteStaffProfile(id: string): Promise<any> {
    const ref = this.db.collection('staffProfiles').doc(id);
    const doc = await ref.get();
    const data = doc.exists ? { id: doc.id, ...doc.data() } : null;
    await ref.delete();
    return data;
  }
}
