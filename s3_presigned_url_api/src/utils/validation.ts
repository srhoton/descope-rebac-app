/**
 * Input validation utilities
 */

import { ALLOWED_CONTENT_TYPES, type AllowedContentType } from '../types/api';

/**
 * Validates if a string is a valid UUID v4
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validates if a string is a valid image ID (UUID with optional extension)
 * Accepts formats like: "uuid" or "uuid.png"
 */
export function isValidImageId(imageId: string): boolean {
  // UUID with optional file extension
  const imageIdRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(\.[a-z0-9]+)?$/i;
  return imageIdRegex.test(imageId);
}

/**
 * Validates if a string is not empty after trimming
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates if content type is allowed
 */
export function isAllowedContentType(
  contentType: string
): contentType is AllowedContentType {
  return (ALLOWED_CONTENT_TYPES as readonly string[]).includes(contentType);
}

/**
 * Sanitizes filename by removing path traversal attempts and special characters
 */
export function sanitizeFilename(filename: string): string {
  // Remove any path components
  const basename = filename.split('/').pop() ?? filename;
  const cleanBasename = basename.split('\\').pop() ?? basename;

  // Remove potentially dangerous characters but keep dots and hyphens
  return cleanBasename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

/**
 * Validates user ID format (Descope user IDs are alphanumeric with specific format)
 */
export function isValidUserId(userId: string): boolean {
  // Descope user IDs are typically alphanumeric strings
  // Adjust this regex based on actual Descope user ID format
  return /^[a-zA-Z0-9_-]{1,128}$/.test(userId);
}

/**
 * Gets file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length > 1) {
    const ext = parts[parts.length - 1];
    if (ext !== undefined) {
      return ext.toLowerCase();
    }
  }
  return '';
}

/**
 * Validates the entire upload request
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateUploadRequest(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  const request = data as Record<string, unknown>;

  // Validate userId
  if (!isNonEmptyString(request['userId'])) {
    errors.push('userId is required and must be a non-empty string');
  } else if (!isValidUserId(request['userId'])) {
    errors.push('userId format is invalid');
  }

  // Validate filename
  if (!isNonEmptyString(request['filename'])) {
    errors.push('filename is required and must be a non-empty string');
  } else if (request['filename'].length > 255) {
    errors.push('filename must be less than 255 characters');
  }

  // Validate contentType
  if (!isNonEmptyString(request['contentType'])) {
    errors.push('contentType is required and must be a non-empty string');
  } else if (!isAllowedContentType(request['contentType'])) {
    errors.push(
      `contentType must be one of: ${ALLOWED_CONTENT_TYPES.join(', ')}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates the download request
 */
export function validateDownloadRequest(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof data !== 'object' || data === null) {
    return { valid: false, errors: ['Request parameters must be an object'] };
  }

  const request = data as Record<string, unknown>;

  // Validate imageId (UUID with optional extension like uuid.png)
  if (!isNonEmptyString(request['imageId'])) {
    errors.push('imageId is required and must be a non-empty string');
  } else if (!isValidImageId(request['imageId'])) {
    errors.push('imageId must be a valid UUID or UUID with extension');
  }

  // Validate userId
  if (!isNonEmptyString(request['userId'])) {
    errors.push('userId is required and must be a non-empty string');
  } else if (!isValidUserId(request['userId'])) {
    errors.push('userId format is invalid');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
