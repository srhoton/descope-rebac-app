/**
 * Lambda handler for generating presigned download URLs
 */

import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { S3Service } from '../services/s3Service';
import type { GenerateDownloadUrlRequest } from '../types/api';
import { validateDownloadRequest } from '../utils/validation';

const BUCKET_NAME = process.env['S3_BUCKET_NAME'];
const AWS_REGION = process.env['AWS_REGION'] ?? 'us-west-2';

if (!BUCKET_NAME) {
  throw new Error('S3_BUCKET_NAME environment variable is required');
}

const s3Service = new S3Service(BUCKET_NAME, AWS_REGION);

/**
 * Lambda handler for GET /download-url
 *
 * Generates a presigned URL for downloading an image from S3
 *
 * @param event - API Gateway event
 * @returns API Gateway response with presigned URL or error
 */
export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    // Extract query parameters
    const queryParams = event.queryStringParameters ?? {};

    // Validate request
    const validation = validateDownloadRequest(queryParams);
    if (!validation.valid) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Validation Error',
          message: validation.errors.join(', '),
        }),
      };
    }

    const request = queryParams as unknown as GenerateDownloadUrlRequest;

    // Generate presigned URL
    const response = await s3Service.generateDownloadUrl(
      request.userId,
      request.imageId
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Error generating download URL:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: 'Failed to generate download URL',
      }),
    };
  }
}
