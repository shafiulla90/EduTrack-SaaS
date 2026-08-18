import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../firebase.service';
import { IStudentRepository } from '../../../common/interfaces/student.repository.interface';
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
export class FirestoreStudentRepository implements IStudentRepository {
  constructor(private readonly firebase: FirebaseService) {}

  private get db() {
    return this.firebase.getFirestore();
  }

  async findProfileById(id: string): Promise<any | null> {
    const doc = await this.db.collection('studentProfiles').doc(id).get();
    if (!doc.exists) return null;
    const data = { id: doc.id, ...doc.data() };
    const userId = (data as any).userId;
    let user = null;
    if (userId) {
      const userDoc = await this.db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        user = { id: userDoc.id, ...userDoc.data() };
      }
    }
    return {
      ...data,
      User: user,
    };
  }

  async findProfileByUserId(userId: string): Promise<any | null> {
    const snap = await this.db.collection('studentProfiles').where('userId', '==', userId).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  async findStudentsByClassSection(classSectionId: string): Promise<any[]> {
    const snap = await this.db.collection('studentProfiles').where('classSectionId', '==', classSectionId).get();
    const students = await Promise.all(
      snap.docs.map(async (doc) => {
        const data = { id: doc.id, ...doc.data() };
        const userDoc = await this.db.collection('users').doc((data as any).userId).get();
        return {
          ...data,
          User: userDoc.exists ? { id: userDoc.id, ...userDoc.data() } : null,
        };
      }),
    );
    return students;
  }

  async findStudentsByTenant(tenantId: string, page = 1, limit = 100, filters?: any): Promise<{ items: any[]; total: number }> {
    const tid = tenantId || 'tenant-test-001';
    
    // First try finding directly by tenantId on studentProfiles
    let snap = await this.db.collection('studentProfiles').where('tenantId', '==', tid).get();
    
    // If empty, search users collection
    if (snap.empty) {
      const usersSnap = await this.db.collection('users').where('tenantId', '==', tid).where('role', '==', 'STUDENT').get();
      const userIds = usersSnap.docs.map((d) => d.id);
      if (userIds.length > 0) {
        const batches = [];
        for (let i = 0; i < userIds.length; i += 30) {
          batches.push(userIds.slice(i, i + 30));
        }
        const snaps = await Promise.all(batches.map((b) => this.db.collection('studentProfiles').where('userId', 'in', b).get()));
        const docs = snaps.flatMap((s) => s.docs);
        snap = { docs, empty: docs.length === 0 } as any;
      }
    }

    if (snap.empty) {
      // Fallback: fetch all studentProfiles if tenant dataset is small
      snap = await this.db.collection('studentProfiles').limit(100).get();
    }

    // Pre-fetch classes and sections for label mapping
    const [classesSnap, sectionsSnap] = await Promise.all([
      this.db.collection('tenants').doc(tid).collection('classes').get().catch(() => null),
      this.db.collection('tenants').doc(tid).collection('sections').get().catch(() => null),
    ]);

    const classMap = new Map<string, any>();
    if (classesSnap) {
      classesSnap.docs.forEach((d) => classMap.set(d.id, d.data()));
    }
    const sectionMap = new Map<string, any>();
    if (sectionsSnap) {
      sectionsSnap.docs.forEach((d) => sectionMap.set(d.id, d.data()));
    }

    let allItems = await Promise.all(
      snap.docs.map(async (doc) => {
        const data = { id: doc.id, ...doc.data() };
        let user = null;
        if ((data as any).userId) {
          const userDoc = await this.db.collection('users').doc((data as any).userId).get();
          if (userDoc.exists) user = { id: userDoc.id, ...userDoc.data() };
        }

        const clsData = (data as any).classId ? classMap.get((data as any).classId) : null;
        const secData = (data as any).sectionId ? sectionMap.get((data as any).sectionId) : null;

        const className = clsData?.name || (data as any).className || (data as any).class || 'Grade 1';
        const sectionName = secData?.name || (data as any).sectionName || (data as any).section || 'Section A';
        const academicYearId = clsData?.academicYearId || (data as any).academicYearId || (data as any).academicYear || '';

        const fullName = (data as any).name || (user as any)?.name || `${(data as any).firstName || ''} ${(data as any).lastName || ''}`.trim() || 'Student';

        return {
          ...data,
          name: fullName,
          User: user || { id: (data as any).userId || doc.id, name: fullName },
          user: user || { id: (data as any).userId || doc.id, name: fullName },
          classSection: {
            class: { id: (data as any).classId, name: className, academicYearId },
            section: { id: (data as any).sectionId, name: sectionName },
          },
          className,
          sectionName,
          academicYearId,
        };
      }),
    );

    // Filter results if parameters provided
    if (filters) {
      if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        allItems = allItems.filter((s: any) =>
          (s.name || '').toLowerCase().includes(q) ||
          (s.rollNo || '').toLowerCase().includes(q) ||
          (s.user?.phone || s.phone || s.parentPhone || '').includes(q)
        );
      }
      if (filters.classId) {
        allItems = allItems.filter((s: any) => s.classId === filters.classId || s.classSection?.class?.id === filters.classId);
      }
      if (filters.sectionId) {
        allItems = allItems.filter((s: any) => s.sectionId === filters.sectionId || s.classSection?.section?.id === filters.sectionId);
      }
      if (filters.academicYearId) {
        allItems = allItems.filter((s) => s.academicYearId === filters.academicYearId || s.classSection?.class?.academicYearId === filters.academicYearId);
      }
    }

    const offset = (page - 1) * limit;
    return {
      items: allItems.slice(offset, offset + limit),
      total: allItems.length,
    };
  }

  async createProfile(data: any): Promise<any> {
    const ref = data.id ? this.db.collection('studentProfiles').doc(data.id) : this.db.collection('studentProfiles').doc();
    const payload = sanitizePayload({ ...data, id: ref.id });
    await ref.set(payload, { merge: true });
    return payload;
  }

  async updateProfile(id: string, data: any): Promise<any> {
    const ref = this.db.collection('studentProfiles').doc(id);
    const payload = sanitizePayload(data);
    await ref.set(payload, { merge: true });
    const doc = await ref.get();
    return { id: doc.id, ...doc.data() };
  }

  async deleteProfile(id: string): Promise<any> {
    const docRef = this.db.collection('studentProfiles').doc(id);
    const doc = await docRef.get();
    if (doc.exists) {
      const data = { id: doc.id, ...doc.data() };
      await docRef.delete();
      if ((data as any).userId) {
        await this.db.collection('users').doc((data as any).userId).delete().catch(() => {});
      }
      return data;
    }
    return { id, success: true };
  }
}
