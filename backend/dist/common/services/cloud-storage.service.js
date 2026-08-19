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
var CloudStorageService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudStorageService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let CloudStorageService = CloudStorageService_1 = class CloudStorageService {
    constructor() {
        this.logger = new common_1.Logger(CloudStorageService_1.name);
    }
    async uploadFile(filename, contentBuffer, mimeType = 'application/pdf') {
        const s3Bucket = process.env.AWS_S3_BUCKET_NAME;
        const region = process.env.AWS_REGION || 'us-east-1';
        if (s3Bucket && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
            try {
                const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
                const s3 = new S3Client({ region });
                await s3.send(new PutObjectCommand({
                    Bucket: s3Bucket,
                    Key: `invoices/${filename}`,
                    Body: contentBuffer,
                    ContentType: mimeType,
                }));
                const s3Url = `https://${s3Bucket}.s3.${region}.amazonaws.com/invoices/${filename}`;
                this.logger.log(`File uploaded to AWS S3: ${s3Url}`);
                return s3Url;
            }
            catch (err) {
                this.logger.warn(`AWS S3 Upload failed: ${err.message}. Falling back to local disk storage.`);
            }
        }
        const uploadDir = path.join(process.cwd(), 'public', 'invoices');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, contentBuffer);
        const localUrl = `/invoices/${filename}`;
        this.logger.log(`File stored on local disk: ${localUrl}`);
        return localUrl;
    }
};
exports.CloudStorageService = CloudStorageService;
exports.CloudStorageService = CloudStorageService = CloudStorageService_1 = __decorate([
    (0, common_1.Injectable)()
], CloudStorageService);
//# sourceMappingURL=cloud-storage.service.js.map