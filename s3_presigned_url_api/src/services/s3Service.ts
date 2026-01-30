/**
 * S3 service for generating presigned URLs
 */

import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

import type {
  GenerateDownloadUrlResponse,
  GenerateUploadUrlResponse,
} from '../types/api';
import { PRESIGNED_URL_EXPIRATION } from '../types/api';
import { getFileExtension, sanitizeFilename } from '../utils/validation';

/**
 * S3Service handles generation of presigned URLs for S3 operations
 */
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor(bucketName: string, region = 'us-west-2') {
    if (!bucketName || bucketName.trim().length === 0) {
      throw new Error('S3 bucket name is required');
    }

    this.bucketName = bucketName;
    this.region = region;
    this.s3Client = new S3Client({ region: this.region });
  }

  /**
   * Generates a presigned URL for uploading an image to S3
   *
   * @param userId - Descope user ID
   * @param filename - Original filename
   * @param contentType - MIME type of the file
   * @returns Upload URL details including presigned URL, image ID, and S3 key
   */
  async generateUploadUrl(
    userId: string,
    filename: string,
    contentType: string
  ): Promise<GenerateUploadUrlResponse> {
    const imageId = randomUUID();
    const sanitized = sanitizeFilename(filename);
    const extension = getFileExtension(sanitized);
    const s3Key = `${userId}/${imageId}.${extension}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
      ContentType: contentType,
      Metadata: {
        originalFilename: sanitized,
        userId: userId,
        uploadedAt: new Date().toISOString(),
      },
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: PRESIGNED_URL_EXPIRATION,
    });

    return {
      uploadUrl,
      imageId,
      s3Key,
      expiresIn: PRESIGNED_URL_EXPIRATION,
    };
  }

  /**
   * Generates a presigned URL for downloading an image from S3
   *
   * @param userId - Descope user ID
   * @param imageId - UUID of the image
   * @returns Download URL details including presigned URL and S3 key
   */
  async generateDownloadUrl(
    userId: string,
    imageId: string
  ): Promise<GenerateDownloadUrlResponse> {
    // We need to construct the S3 key pattern to find the file
    // Since we don't know the extension, we'll need to list objects or
    // the frontend should pass the full S3 key
    // For now, we'll accept that the frontend knows the extension from metadata
    // Alternative: frontend passes s3Key directly

    // Construct a pattern - in production, you'd query metadata or list objects
    // For this implementation, we'll assume the imageId includes extension info
    // or the frontend provides the full s3Key as part of the imageId parameter

    // If imageId contains a dot, treat it as the full filename
    const s3Key = imageId.includes('.')
      ? `${userId}/${imageId}`
      : `${userId}/${imageId}`;

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
    });

    const downloadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: PRESIGNED_URL_EXPIRATION,
    });

    return {
      downloadUrl,
      s3Key,
      expiresIn: PRESIGNED_URL_EXPIRATION,
    };
  }

  /**
   * Constructs the S3 key for an image
   *
   * @param userId - User ID
   * @param imageId - Image ID
   * @param extension - File extension
   * @returns S3 object key
   */
  static constructS3Key(userId: string, imageId: string, extension: string): string {
    return `${userId}/${imageId}.${extension}`;
  }
}
