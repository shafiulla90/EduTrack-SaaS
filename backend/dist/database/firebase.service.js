"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FirebaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseService = void 0;
const common_1 = require("@nestjs/common");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("firebase-admin/auth");
const fs = require("fs");
let FirebaseService = FirebaseService_1 = class FirebaseService {
    constructor() {
        this.logger = new common_1.Logger(FirebaseService_1.name);
    }
    async onModuleInit() {
        this.initFirebase();
    }
    initFirebase() {
        if ((0, app_1.getApps)().length > 0) {
            this.firebaseApp = (0, app_1.getApps)()[0];
            this.firestoreDb = (0, firestore_1.getFirestore)(this.firebaseApp);
            return;
        }
        const projectId = process.env.FIREBASE_PROJECT_ID || 'edutrack-52e6c';
        const credentialsPath = process.env.FIREBASE_CREDENTIALS_PATH;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;
        if (privateKey) {
            privateKey = privateKey.trim();
            if ((privateKey.startsWith('"') && privateKey.endsWith('"')) || (privateKey.startsWith("'") && privateKey.endsWith("'"))) {
                privateKey = privateKey.substring(1, privateKey.length - 1);
            }
            privateKey = privateKey.replace(/\\n/g, '\n');
        }
        let credential;
        if (credentialsPath && fs.existsSync(credentialsPath)) {
            this.logger.log(`Initializing Firebase Admin SDK using credential file: ${credentialsPath}`);
            const serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
            credential = (0, app_1.cert)(serviceAccount);
        }
        else if (clientEmail && privateKey) {
            this.logger.log(`Initializing Firebase Admin SDK using environment variable credentials`);
            credential = (0, app_1.cert)({
                projectId,
                clientEmail,
                privateKey,
            });
        }
        else {
            this.logger.log(`Initializing Firebase Admin SDK with project ID: ${projectId}`);
            credential = (0, app_1.cert)({ projectId });
        }
        this.firebaseApp = (0, app_1.initializeApp)({
            credential,
            projectId,
        });
        this.firestoreDb = (0, firestore_1.getFirestore)(this.firebaseApp);
        this.logger.log(`Firebase Admin SDK initialized successfully for project: ${projectId}`);
    }
    getFirestore() {
        if (!this.firestoreDb) {
            this.initFirebase();
        }
        return this.firestoreDb;
    }
    getAuth() {
        if (!this.firebaseApp) {
            this.initFirebase();
        }
        return (0, auth_1.getAuth)(this.firebaseApp);
    }
    async onModuleDestroy() {
        this.logger.log(`Firebase Admin SDK connection closed.`);
    }
};
exports.FirebaseService = FirebaseService;
exports.FirebaseService = FirebaseService = FirebaseService_1 = __decorate([
    (0, common_1.Injectable)()
], FirebaseService);
//# sourceMappingURL=firebase.service.js.map