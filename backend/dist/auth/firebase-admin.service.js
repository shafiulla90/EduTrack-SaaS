"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FirebaseAdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseAdminService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let FirebaseAdminService = FirebaseAdminService_1 = class FirebaseAdminService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(FirebaseAdminService_1.name);
        this.firebaseApp = null;
    }
    onModuleInit() {
        try {
            const serviceAccountJson = this.configService.get('FIREBASE_SERVICE_ACCOUNT_JSON');
            const credentialsPath = this.configService.get('FIREBASE_CREDENTIALS_PATH');
            let serviceAccount = null;
            if (serviceAccountJson) {
                try {
                    serviceAccount = JSON.parse(serviceAccountJson);
                    this.logger.log('Firebase Admin: Loaded credentials from FIREBASE_SERVICE_ACCOUNT_JSON env variable.');
                }
                catch (e) {
                    this.logger.error('Firebase Admin: Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON env variable.', e);
                }
            }
            if (!serviceAccount && credentialsPath) {
                const resolvedPath = path.resolve(credentialsPath);
                if (fs.existsSync(resolvedPath)) {
                    try {
                        const fileContent = fs.readFileSync(resolvedPath, 'utf8');
                        serviceAccount = JSON.parse(fileContent);
                        this.logger.log(`Firebase Admin: Loaded credentials from local file: ${resolvedPath}`);
                    }
                    catch (e) {
                        this.logger.error(`Firebase Admin: Failed to parse service account JSON file at ${resolvedPath}`, e);
                    }
                }
                else {
                    this.logger.warn(`Firebase Admin: Local credentials file not found at ${resolvedPath}`);
                }
            }
            if (!serviceAccount) {
                this.logger.warn('No valid Firebase credentials found. Firebase Admin SDK will not be initialized.');
                return;
            }
            const admin = require('firebase-admin');
            if (admin.apps && admin.apps.length > 0) {
                this.firebaseApp = admin.apps[0];
                this.logger.log('Firebase Admin: Reusing already initialized Firebase App instance.');
            }
            else {
                this.firebaseApp = admin.initializeApp({
                    credential: admin.cert(serviceAccount),
                });
                this.logger.log('Firebase Admin: SDK successfully initialized.');
            }
        }
        catch (error) {
            this.logger.error('Firebase Admin Initialization Failure:', error.stack || error.message);
        }
    }
    async verifyIdToken(idToken) {
        if (!this.firebaseApp) {
            throw new common_1.UnauthorizedException('Firebase Admin SDK is not initialized.');
        }
        try {
            const { getAuth } = require('firebase-admin/auth');
            const decodedToken = await getAuth(this.firebaseApp).verifyIdToken(idToken);
            const phone = decodedToken.phone_number;
            if (!phone) {
                throw new common_1.UnauthorizedException('Firebase token verified, but no phone number found in claims.');
            }
            return phone;
        }
        catch (error) {
            this.logger.error('Firebase token verification failed:', error.message);
            if (error.code === 'auth/id-token-expired') {
                throw new common_1.UnauthorizedException('OTP token has expired. Please request a new one.');
            }
            if (error.code === 'auth/argument-error') {
                throw new common_1.UnauthorizedException('Invalid verification token argument.');
            }
            throw new common_1.UnauthorizedException(`OTP token verification failed: ${error.message}`);
        }
    }
    isInitialized() {
        return !!this.firebaseApp;
    }
};
exports.FirebaseAdminService = FirebaseAdminService;
exports.FirebaseAdminService = FirebaseAdminService = FirebaseAdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FirebaseAdminService);
//# sourceMappingURL=firebase-admin.service.js.map