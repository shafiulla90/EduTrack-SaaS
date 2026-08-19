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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const AWS = __importStar(require("aws-sdk"));
const fs_1 = require("fs");
const path_1 = require("path");
const crypto_1 = require("crypto");
let StorageService = class StorageService {
    constructor(configService) {
        this.configService = configService;
        this.s3 = null;
        this.bucketName = null;
        const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
        const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
        const region = this.configService.get('AWS_REGION') || 'us-east-1';
        this.bucketName = this.configService.get('AWS_S3_BUCKET_NAME') || null;
        if (accessKeyId &&
            secretAccessKey &&
            accessKeyId !== 'mock-key-id' &&
            secretAccessKey !== 'mock-secret-access-key') {
            this.s3 = new AWS.S3({
                accessKeyId,
                secretAccessKey,
                region,
            });
        }
    }
    async uploadImage(base64Data, tenantId, studentId, filenamePrefix) {
        const match = base64Data.match(/^data:([a-zA-Z0-9-]+\/[a-zA-Z0-9-+.]+);base64,(.+)$/);
        if (!match) {
            if (base64Data.startsWith('http') || base64Data.startsWith('/uploads')) {
                return base64Data;
            }
            throw new common_1.BadRequestException('Invalid file format. Expected a base64 Data URL.');
        }
        const mimeType = match[1].toLowerCase();
        const base64Content = match[2];
        const buffer = Buffer.from(base64Content, 'base64');
        if (buffer.length > 5 * 1024 * 1024) {
            throw new common_1.BadRequestException('File size exceeds the maximum 5 MB limit.');
        }
        let mimeExtension = mimeType.split('/')[1] || 'bin';
        if (mimeExtension.includes('vnd.openxmlformats-officedocument'))
            mimeExtension = 'docx';
        if (mimeExtension.includes('msword'))
            mimeExtension = 'doc';
        const uniqueFilename = `${filenamePrefix}-${(0, crypto_1.randomBytes)(8).toString('hex')}.${mimeExtension}`;
        const storageKey = `students/${tenantId}/${studentId}/${uniqueFilename}`;
        if (this.s3 && this.bucketName) {
            try {
                const uploadResult = await this.s3
                    .upload({
                    Bucket: this.bucketName,
                    Key: storageKey,
                    Body: buffer,
                    ContentType: `image/${mimeExtension}`,
                    ACL: 'public-read',
                })
                    .promise();
                return uploadResult.Location;
            }
            catch (err) {
                console.warn('[StorageService] S3 upload failed, falling back to local storage:', err.message);
            }
        }
        try {
            if (process.env.VERCEL) {
                return base64Data;
            }
            const relativePath = `/uploads/${storageKey}`;
            const absolutePath = (0, path_1.join)(__dirname, '..', '..', 'uploads', storageKey);
            const dirPath = require('path').dirname(absolutePath);
            require('fs').mkdirSync(dirPath, { recursive: true });
            (0, fs_1.writeFileSync)(absolutePath, buffer);
            return relativePath;
        }
        catch (err) {
            console.error('[StorageService] Local storage write failed:', err);
            return base64Data;
        }
    }
    async deleteImage(imageUrl) {
        try {
            if (this.s3 && this.bucketName && imageUrl.startsWith('http')) {
                const urlObj = new URL(imageUrl);
                const key = decodeURIComponent(urlObj.pathname.replace(/^\//, ''));
                await this.s3.deleteObject({ Bucket: this.bucketName, Key: key }).promise();
                return;
            }
        }
        catch (err) {
            console.warn('[StorageService] Failed to delete from S3:', err);
        }
        try {
            const localPath = (0, path_1.join)(__dirname, '..', '..', imageUrl);
            const fs = require('fs');
            if (fs.existsSync(localPath)) {
                fs.unlinkSync(localPath);
            }
        }
        catch (err) {
            console.warn('[StorageService] Failed to delete local file:', err);
        }
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map