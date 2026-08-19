import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { Auth } from 'firebase-admin/auth';
export declare class FirebaseService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private firebaseApp;
    private firestoreDb;
    onModuleInit(): Promise<void>;
    private initFirebase;
    getFirestore(): Firestore;
    getAuth(): Auth;
    onModuleDestroy(): Promise<void>;
}
