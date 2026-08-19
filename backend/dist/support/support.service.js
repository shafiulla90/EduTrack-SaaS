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
exports.SupportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const nodemailer = __importStar(require("nodemailer"));
let SupportService = class SupportService {
    constructor(prisma) {
        this.prisma = prisma;
        this.rateLimitCache = new Map();
    }
    async createSupportRequest(dto, ipAddress, userAgent) {
        const ipKey = ipAddress || 'unknown-ip';
        const now = Date.now();
        const limitDuration = 3600 * 1000;
        const record = this.rateLimitCache.get(ipKey);
        if (record) {
            if (now > record.resetTime) {
                this.rateLimitCache.set(ipKey, { count: 1, resetTime: now + limitDuration });
            }
            else {
                if (record.count >= 5) {
                    throw new common_1.HttpException('Too many support requests from this IP. Please try again in an hour.', common_1.HttpStatus.TOO_MANY_REQUESTS);
                }
                record.count++;
            }
        }
        else {
            this.rateLimitCache.set(ipKey, { count: 1, resetTime: now + limitDuration });
        }
        const supportRequest = await this.prisma.supportRequest.create({
            data: {
                name: dto.name,
                schoolName: dto.schoolName,
                email: dto.email,
                phone: dto.phone,
                subject: dto.subject,
                message: dto.message,
                ipAddress: ipAddress,
                userAgent: userAgent,
                status: 'OPEN',
                emailSent: false,
            },
        });
        let emailSent = false;
        try {
            const smtpHost = process.env.SMTP_HOST;
            const smtpPort = process.env.SMTP_PORT;
            const smtpSecure = process.env.SMTP_SECURE === 'true';
            const smtpUser = process.env.SMTP_USER;
            const smtpPass = process.env.SMTP_PASS;
            const supportEmail = process.env.SUPPORT_EMAIL || 'mr.shafiulla143@gmail.com';
            if (!smtpHost || !smtpUser || !smtpPass) {
                throw new Error('SMTP credentials not configured in environment variables');
            }
            const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: parseInt(smtpPort || '587', 10),
                secure: smtpSecure,
                auth: {
                    user: smtpUser,
                    pass: smtpPass,
                },
                tls: {
                    rejectUnauthorized: false,
                },
            });
            const companyMailOptions = {
                from: smtpUser,
                to: supportEmail,
                subject: `EduTrack Support Request - ${dto.subject}`,
                text: `Name: ${dto.name}
School Name: ${dto.schoolName}
Email: ${dto.email}
Phone: ${dto.phone}
Subject: ${dto.subject}
Message: ${dto.message}

Submitted On: ${supportRequest.createdAt.toISOString()}
`,
            };
            await transporter.sendMail(companyMailOptions);
            const userMailOptions = {
                from: smtpUser,
                to: dto.email,
                subject: 'We have received your support request',
                text: `Hello ${dto.name},

Thank you for contacting EduTrack Support.

We have successfully received your support request.

Reference ID:
${supportRequest.id}

Our support team will review your request and contact you as soon as possible.

Regards,
EduTrack Support
`,
            };
            await transporter.sendMail(userMailOptions);
            await this.prisma.supportRequest.update({
                where: { id: supportRequest.id },
                data: { emailSent: true },
            });
            emailSent = true;
        }
        catch (err) {
            console.error('[SupportService] SMTP Email sending failed:', err);
        }
        return {
            success: true,
            emailSent,
            message: emailSent
                ? 'Your support request has been submitted successfully.\n\nOur support team will contact you shortly.'
                : 'Your request has been saved successfully.\n\nOur support team will review it shortly.',
            data: {
                id: supportRequest.id,
                name: supportRequest.name,
                schoolName: supportRequest.schoolName,
                email: supportRequest.email,
                phone: supportRequest.phone,
                subject: supportRequest.subject,
                message: supportRequest.message,
                status: supportRequest.status,
                emailSent,
                createdAt: supportRequest.createdAt,
            },
        };
    }
};
exports.SupportService = SupportService;
exports.SupportService = SupportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SupportService);
//# sourceMappingURL=support.service.js.map