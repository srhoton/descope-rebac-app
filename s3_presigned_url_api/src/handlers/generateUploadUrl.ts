/**
 * Lambda handler for generating presigned upload URLs
 */

import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { S3Service } from '../services/s3Service';
import type { GenerateUploadUrlRequest } from '../types/api';
import { validateUploadRequest } from '../utils/validation';

const BUCKET_NAME = process.env['S3_BUCKET_NAME'];
const AWS_REGION = process.env['AWS_REGION'] ?? 'us-west-2';

if (!BUCKET_NAME) {
  throw new Error('S3_BUCKET_NAME environment variable is required');
}

const s3Service = new S3Service(BUCKET_NAME, AWS_REGION);

/**
 * Lambda handler for POST /upload-url
 *
 * Generates a presigned URL for uploading an image to S3
 *
 * @param event - API Gateway event
 * @returns API Gateway response with presigned URL or error
 */
export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    // Parse request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'Request body is required',
        }),
      };
    }

    let requestData: unknown;
    try {
      requestData = JSON.parse(event.body) as unknown;
    } catch {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          error: 'Bad Request',
          message: 'Invalid JSON in request body',
        }),
      };
    }

    // Validate request
    const validation = validateUploadRequest(requestData);
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

    const request = requestData as GenerateUploadUrlRequest;

    // Generate presigned URL
    const response = await s3Service.generateUploadUrl(
      request.userId,
      request.filename,
      request.contentType
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
    console.error('Error generating upload URL:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: 'Failed to generate upload URL',
      }),
    };
  }
}
