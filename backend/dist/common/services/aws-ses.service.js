"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AwsSesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwsSesService = void 0;
const common_1 = require("@nestjs/common");
let AwsSesService = AwsSesService_1 = class AwsSesService {
    constructor() {
        this.logger = new common_1.Logger(AwsSesService_1.name);
    }
    async sendEmail(options) {
        const region = process.env.AWS_REGION || 'us-east-1';
        const senderEmail = process.env.AWS_SES_FROM_EMAIL || 'support@edutrack.com';
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
            try {
                const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
                const ses = new SESClient({ region });
                const command = new SendEmailCommand({
                    Source: senderEmail,
                    Destination: {
                        ToAddresses: [options.to],
                    },
                    Message: {
                        Subject: { Data: options.subject },
                        Body: {
                            Html: { Data: options.html },
                            Text: { Data: options.text || options.subject },
                        },
                    },
                });
                await ses.send(command);
                this.logger.log(`Email successfully dispatched via AWS SES to ${options.to}`);
                return true;
            }
            catch (err) {
                this.logger.warn(`AWS SES dispatch error: ${err.message}. Using fallback Logger.`);
            }
        }
        this.logger.log(`[Email Mock Dispatch] To: ${options.to} | Subject: ${options.subject}`);
        return true;
    }
};
exports.AwsSesService = AwsSesService;
exports.AwsSesService = AwsSesService = AwsSesService_1 = __decorate([
    (0, common_1.Injectable)()
], AwsSesService);
//# sourceMappingURL=aws-ses.service.js.map