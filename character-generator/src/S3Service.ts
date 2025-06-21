import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { Character } from './types';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;
  private region: string;

  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME || '';
    this.region = process.env.S3_REGION || 'ap-south-1';
    
    if (!this.bucketName) {
      throw new Error('S3_BUCKET_NAME environment variable is required');
    }

    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      throw new Error('AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables are required');
    }

    this.s3Client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId,
        secretAccessKey
      }
    });
  }

  /**
   * Generate a unique filename with timestamp and random string
   */
  private generateUniqueFilename(prefix: string, extension: string): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    return `${prefix}_${timestamp}_${randomString}.${extension}`;
  }

  /**
   * Download image from URL and convert to buffer
   */
  private async downloadImageFromUrl(imageUrl: string): Promise<Buffer> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      throw new Error(`Error downloading image: ${error}`);
    }
  }

  /**
   * Upload image to S3 and return the public URL
   */
  async uploadImage(imageUrl: string, characterName: string): Promise<string> {
    try {
      console.log('📥 Downloading image from OpenAI...');
      const imageBuffer = await this.downloadImageFromUrl(imageUrl);
      
      const filename = this.generateUniqueFilename(
        this.sanitizeFilename(characterName),
        'png'
      );
      const s3Key = `images/${filename}`;

      console.log('📤 Uploading image to S3...');
      const uploadCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: imageBuffer,
        ContentType: 'image/png',
        ACL: 'public-read'
      });

      await this.s3Client.send(uploadCommand);

      const publicUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${s3Key}`;
      console.log(`✅ Image uploaded successfully: ${publicUrl}`);
      
      return publicUrl;
    } catch (error) {
      console.error('❌ Error uploading image to S3:', error);
      throw error;
    }
  }

  /**
   * Save character data to S3
   */
  async saveCharacterData(character: Character): Promise<string> {
    try {
      const filename = this.generateUniqueFilename(
        this.sanitizeFilename(character.name),
        'json'
      );
      const s3Key = `data/${filename}`;

      console.log('📤 Uploading character data to S3...');
      const uploadCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: s3Key,
        Body: JSON.stringify(character, null, 2),
        ContentType: 'application/json',
        ACL: 'public-read'
      });

      await this.s3Client.send(uploadCommand);

      const publicUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${s3Key}`;
      console.log(`✅ Character data uploaded successfully: ${publicUrl}`);
      
      return publicUrl;
    } catch (error) {
      console.error('❌ Error uploading character data to S3:', error);
      throw error;
    }
  }

  /**
   * Check if a file exists in S3
   */
  async fileExists(key: string): Promise<boolean> {
    try {
      await this.s3Client.send(new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key
      }));
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Sanitize filename for S3
   */
  private sanitizeFilename(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
      .replace(/\s/g, '_') // Replace spaces with underscores
      .toLowerCase(); // Convert to lowercase for consistency
  }

  /**
   * Get bucket information
   */
  getBucketInfo(): { bucketName: string; region: string; baseUrl: string } {
    return {
      bucketName: this.bucketName,
      region: this.region,
      baseUrl: `https://${this.bucketName}.s3.${this.region}.amazonaws.com`
    };
  }
} 