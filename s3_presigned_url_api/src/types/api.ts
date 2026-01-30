/**
 * API type definitions for S3 Presigned URL service
 */

/**
 * Request body for generating upload presigned URL
 */
export interface GenerateUploadUrlRequest {
  /** Descope user ID */
  userId: string;
  /** Original filename with extension */
  filename: string;
  /** MIME type of the file (e.g., image/png, image/jpeg) */
  contentType: string;
}

/**
 * Response for generate upload URL request
 */
export interface GenerateUploadUrlResponse {
  /** Presigned URL for uploading the image */
  uploadUrl: string;
  /** Unique image ID (UUID) */
  imageId: string;
  /** S3 object key */
  s3Key: string;
  /** Expiration time in seconds */
  expiresIn: number;
}

/**
 * Request parameters for generating download presigned URL
 */
export interface GenerateDownloadUrlRequest {
  /** Image ID (UUID) */
  imageId: string;
  /** Descope user ID */
  userId: string;
}

/**
 * Response for generate download URL request
 */
export interface GenerateDownloadUrlResponse {
  /** Presigned URL for downloading the image */
  downloadUrl: string;
  /** S3 object key */
  s3Key: string;
  /** Expiration time in seconds */
  expiresIn: number;
}

/**
 * Error response structure
 */
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
}

/**
 * Supported image MIME types
 */
export const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
] as const;

export type AllowedContentType = (typeof ALLOWED_CONTENT_TYPES)[number];

/**
 * Maximum file size in bytes (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Presigned URL expiration time in seconds (15 minutes)
 */
export const PRESIGNED_URL_EXPIRATION = 15 * 60;
