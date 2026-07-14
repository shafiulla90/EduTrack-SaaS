import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { randomBytes } from 'crypto';

@Injectable()
export class StorageService {
  private s3: AWS.S3 | null = null;
  private bucketName: string | null = null;

  constructor(private configService: ConfigService) {
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
    const region = this.configService.get<string>('AWS_REGION') || 'us-east-1';
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME') || null;

    if (
      accessKeyId &&
      secretAccessKey &&
      accessKeyId !== 'mock-key-id' &&
      secretAccessKey !== 'mock-secret-access-key'
    ) {
      this.s3 = new AWS.S3({
        accessKeyId,
        secretAccessKey,
        region,
      });
    }
  }

  async uploadImage(base64Data: string, tenantId: string, studentId: string, filenamePrefix: string): Promise<string> {
    // Determine type, validate size
    const match = base64Data.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!match) {
      throw new BadRequestException('Invalid image format. Expected a base64 Data URL.');
    }

    const mimeExtension = match[1].toLowerCase();
    const base64Content = match[2];
    const buffer = Buffer.from(base64Content, 'base64');

    // 2 MB validation (2 * 1024 * 1024 bytes)
    if (buffer.length > 2 * 1024 * 1024) {
      throw new BadRequestException('Image size exceeds the maximum 2 MB limit.');
    }

    // Supported formats check
    const supportedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    if (!supportedExtensions.includes(mimeExtension)) {
      throw new BadRequestException(
        `Unsupported image format: ${mimeExtension}. Allowed formats: ${supportedExtensions.join(', ')}`
      );
    }

    const uniqueFilename = `${filenamePrefix}-${randomBytes(8).toString('hex')}.${mimeExtension}`;
    const storageKey = `students/${tenantId}/${studentId}/${uniqueFilename}`;

    // 1. Try S3 upload if credentials are not mock
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
      } catch (err: any) {
        console.warn('[StorageService] S3 upload failed, falling back to local storage:', err.message);
      }
    }

    // 2. Local fallback storage
    try {
      const relativePath = `/uploads/${storageKey}`;
      const absolutePath = join(__dirname, '..', '..', 'uploads', storageKey);
      // Ensure directory exists
      const dirPath = require('path').dirname(absolutePath);
      require('fs').mkdirSync(dirPath, { recursive: true });
      writeFileSync(absolutePath, buffer);
      // Return path that can be served statically (relative to server root)
      return relativePath;

    } catch (err) {
      console.error('[StorageService] Local storage write failed:', err);
      throw new BadRequestException('Failed to store profile photo.');
    }
  }


  async deleteImage(imageUrl: string): Promise<void> {
    // Determine if URL is an S3 location or local path
    try {
      if (this.s3 && this.bucketName && imageUrl.startsWith('http')) {
        // Extract key from URL
        const urlObj = new URL(imageUrl);
        const key = decodeURIComponent(urlObj.pathname.replace(/^\//, ''));
        await this.s3.deleteObject({ Bucket: this.bucketName, Key: key }).promise();
        return;
      }
    } catch (err) {
      console.warn('[StorageService] Failed to delete from S3:', err);
    }
    // Local fallback: map relative URL to filesystem path
    try {
      const localPath = join(__dirname, '..', '..', imageUrl);
      const fs = require('fs');
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    } catch (err) {
      console.warn('[StorageService] Failed to delete local file:', err);
    }
  }
}

