/**
 * Service for handling image upload and download operations
 */

import type {
  DownloadUrlResponse,
  Image,
  UploadUrlRequest,
  UploadUrlResponse,
} from '../types/image';
import { appSyncClient } from './appsyncClient';

const API_BASE_URL = import.meta.env['VITE_API_ENDPOINT'] as string;

if (!API_BASE_URL) {
  throw new Error('VITE_API_ENDPOINT is missing from environment variables');
}

/**
 * Service for managing image uploads and downloads
 */
export class ImageService {
  private readonly apiBaseUrl: string;

  constructor(apiBaseUrl = API_BASE_URL) {
    this.apiBaseUrl = apiBaseUrl;
  }

  /**
   * Generates a presigned URL for uploading an image
   */
  async generateUploadUrl(
    request: UploadUrlRequest
  ): Promise<UploadUrlResponse> {
    const response = await fetch(`${this.apiBaseUrl}/upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = (await response.json()) as { message?: string };
      throw new Error(error.message ?? 'Failed to generate upload URL');
    }

    return (await response.json()) as UploadUrlResponse;
  }

  /**
   * Uploads an image file to S3 using a presigned URL
   */
  async uploadImage(file: File, presignedUrl: string): Promise<void> {
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image to S3');
    }
  }

  /**
   * Generates a presigned URL for downloading an image
   */
  async generateDownloadUrl(
    imageId: string,
    userId: string
  ): Promise<DownloadUrlResponse> {
    const params = new URLSearchParams({
      imageId,
      userId,
    });

    const response = await fetch(
      `${this.apiBaseUrl}/download-url?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = (await response.json()) as { message?: string };
      throw new Error(error.message ?? 'Failed to generate download URL');
    }

    return (await response.json()) as DownloadUrlResponse;
  }

  /**
   * Gets all images owned by a user
   */
  async getUserImages(userId: string): Promise<Image[]> {
    try {
      // Get all relations for the user from ReBaC
      const { relations } = await appSyncClient.getTargetAccess(userId);

      // Filter to get only image resources
      const imageIds = appSyncClient.filterImageRelations(relations);

      // Generate download URLs for each image
      const images = await Promise.all(
        imageIds.map(async (imageId) => {
          try {
            const downloadUrlData = await this.generateDownloadUrl(
              imageId,
              userId
            );

            // Extract filename from S3 key
            const filename = downloadUrlData.s3Key.split('/').pop() ?? imageId;

            const image: Image = {
              imageId,
              s3Key: downloadUrlData.s3Key,
              filename,
              contentType: 'image/jpeg', // Default, would need metadata API to get actual type
              userId,
              uploadedAt: new Date().toISOString(), // Would need metadata API for actual date
              downloadUrl: downloadUrlData.downloadUrl,
            };

            return image;
          } catch (error) {
            console.error(`Failed to get download URL for image ${imageId}:`, error);
            return null;
          }
        })
      );

      // Filter out any failed image fetches
      return images.filter((img): img is Image => img !== null);
    } catch (error) {
      console.error('Failed to get user images:', error);
      throw new Error('Failed to load images');
    }
  }

  /**
   * Complete image upload process: get presigned URL, upload file, create ReBaC relation
   */
  async completeImageUpload(
    file: File,
    userId: string
  ): Promise<{ imageId: string; s3Key: string }> {
    // Step 1: Generate presigned upload URL
    const uploadUrlData = await this.generateUploadUrl({
      userId,
      filename: file.name,
      contentType: file.type,
    });

    // Step 2: Upload the file to S3
    await this.uploadImage(file, uploadUrlData.uploadUrl);

    // Step 3: Create ownership relation in ReBaC
    await appSyncClient.createImageOwnership(uploadUrlData.imageId, userId);

    return {
      imageId: uploadUrlData.imageId,
      s3Key: uploadUrlData.s3Key,
    };
  }
}

export const imageService = new ImageService();
