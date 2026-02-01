/**
 * Tests for generateDownloadUrl handler
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEvent } from 'aws-lambda';

import { handler } from '../../src/handlers/generateDownloadUrl';
import * as s3Service from '../../src/services/s3Service';

vi.mock('../../src/services/s3Service');

describe('generateDownloadUrl handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env['S3_BUCKET_NAME'] = 'test-bucket';
    process.env['AWS_REGION'] = 'us-west-2';
  });

  const createMockEvent = (
    queryStringParameters: Record<string, string> | null
  ): APIGatewayProxyEvent => ({
    body: null,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    path: '/download-url',
    pathParameters: null,
    queryStringParameters,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent['requestContext'],
    resource: '',
  });

  it('should return 400 when imageId is missing', async () => {
    const event = createMockEvent({
      userId: 'user123',
    });

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toHaveProperty('error', 'Validation Error');
    expect(responseBody.message).toContain('imageId');
  });

  it('should return 400 when userId is missing', async () => {
    const event = createMockEvent({
      imageId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    });

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toHaveProperty('error', 'Validation Error');
    expect(responseBody.message).toContain('userId');
  });

  it('should return 400 when imageId is not a valid UUID', async () => {
    const event = createMockEvent({
      imageId: 'not-a-uuid',
      userId: 'user123',
    });

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toHaveProperty('error', 'Validation Error');
    expect(responseBody.message).toContain('UUID');
  });

  it('should generate download URL successfully with valid request', async () => {
    const mockResponse = {
      downloadUrl:
        'https://s3.amazonaws.com/test-bucket/user123/image-id.jpg?signature',
      s3Key: 'user123/image-id.jpg',
      expiresIn: 900,
    };

    const mockGenerateDownloadUrl = vi.fn().mockResolvedValue(mockResponse);
    vi.spyOn(s3Service, 'S3Service').mockImplementation(
      () =>
        ({
          generateDownloadUrl: mockGenerateDownloadUrl,
        }) as unknown as s3Service.S3Service
    );

    const event = createMockEvent({
      imageId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      userId: 'user123',
    });

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.headers).toHaveProperty('Content-Type', 'application/json');
    expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');

    const responseBody = JSON.parse(result.body);
    expect(responseBody).toEqual(mockResponse);
  });

  it('should return 500 when S3 service throws error', async () => {
    const mockGenerateDownloadUrl = vi
      .fn()
      .mockRejectedValue(new Error('S3 error'));
    vi.spyOn(s3Service, 'S3Service').mockImplementation(
      () =>
        ({
          generateDownloadUrl: mockGenerateDownloadUrl,
        }) as unknown as s3Service.S3Service
    );

    const event = createMockEvent({
      imageId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      userId: 'user123',
    });

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toHaveProperty('error', 'Internal Server Error');
  });

  it('should handle CORS headers correctly', async () => {
    const mockResponse = {
      downloadUrl: 'https://s3.amazonaws.com/test-bucket/user123/image-id.jpg',
      s3Key: 'user123/image-id.jpg',
      expiresIn: 900,
    };

    const mockGenerateDownloadUrl = vi.fn().mockResolvedValue(mockResponse);
    vi.spyOn(s3Service, 'S3Service').mockImplementation(
      () =>
        ({
          generateDownloadUrl: mockGenerateDownloadUrl,
        }) as unknown as s3Service.S3Service
    );

    const event = createMockEvent({
      imageId: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      userId: 'user123',
    });

    const result = await handler(event);

    expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
  });

  it('should handle missing query parameters gracefully', async () => {
    const event = createMockEvent(null);

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toHaveProperty('error', 'Validation Error');
  });
});
