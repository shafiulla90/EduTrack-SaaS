import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class SmsService {
  private sns: AWS.SNS | null = null;
  private readonly logger = new Logger(SmsService.name);

  constructor(private configService: ConfigService) {
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    const region = this.configService.get<string>('AWS_REGION') || 'us-east-1';

    if (
      accessKeyId &&
      secretAccessKey &&
      accessKeyId !== 'mock-key-id' &&
      secretAccessKey !== 'mock-secret-access-key'
    ) {
      this.sns = new AWS.SNS({
        accessKeyId,
        secretAccessKey,
        region,
      });
      this.logger.log(`AWS SNS SMS service initialized in region: ${region}`);
    } else {
      this.logger.warn('AWS credentials are not configured or are set to mock values. SMS service running in SIMULATION/DEVELOPMENT mode.');
    }
  }

  async sendOtpSms(phone: string, otpCode: string): Promise<boolean> {
    const message = `Your EduTrack verification code is: ${otpCode}. It is valid for 5 minutes.`;
    const normalizedPhone = phone.startsWith('+') ? phone : `+91${phone}`; // Fallback to Indian prefix if missing

    if (this.sns) {
      try {
        const params: AWS.SNS.PublishInput = {
          Message: message,
          PhoneNumber: normalizedPhone,
          MessageAttributes: {
            'AWS.SNS.SMS.SMSType': {
              DataType: 'String',
              StringValue: 'Transactional',
            },
            'AWS.SNS.SMS.SenderID': {
              DataType: 'String',
              StringValue: 'EduTrackOTP',
            },
          },
        };

        const result = await this.sns.publish(params).promise();
        this.logger.log(`[SMS DISPATCH] Sent OTP to ${normalizedPhone} via AWS SNS. MessageId: ${result.MessageId}`);
        return true;
      } catch (err: any) {
        this.logger.error(`[SMS DISPATCH FAILED] Failed to send SMS to ${normalizedPhone} via AWS SNS: ${err.message}`, err.stack);
        return false;
      }
    } else {
      // Local simulation mode
      this.logger.log(`[SMS SIMULATION] To: ${normalizedPhone} | Message: ${message}`);
      return true;
    }
  }
}
