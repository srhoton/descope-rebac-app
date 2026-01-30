/**
 * Type definitions for image management
 */

/**
 * Image metadata stored in ReBaC and S3
 */
export interface Image {
  /** Unique image ID (UUID) */
  imageId: string;
  /** S3 object key */
  s3Key: string;
  /** Original filename */
  filename: string;
  /** MIME type */
  contentType: string;
  /** User ID who owns the image */
  userId: string;
  /** Upload timestamp */
  uploadedAt: string;
  /** Presigned download URL (temporary) */
  downloadUrl?: string;
}

/**
 * Request to generate presigned upload URL
 */
export interface UploadUrlRequest {
  userId: string;
  filename: string;
  contentType: string;
}

/**
 * Response from presigned upload URL generation
 */
export interface UploadUrlResponse {
  uploadUrl: string;
  imageId: string;
  s3Key: string;
  expiresIn: number;
}

/**
 * Request to generate presigned download URL
 */
export interface DownloadUrlRequest {
  imageId: string;
  userId: string;
}

/**
 * Response from presigned download URL generation
 */
export interface DownloadUrlResponse {
  downloadUrl: string;
  s3Key: string;
  expiresIn: number;
}

/**
 * ReBaC relation tuple
 */
export interface RelationTuple {
  namespace: string;
  relationDefinition: string;
  resource: string;
  target: string;
}

/**
 * Supported image MIME types
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

/**
 * Maximum file size (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
