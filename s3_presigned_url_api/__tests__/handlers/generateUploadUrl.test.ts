/**
 * Tests for generateUploadUrl handler
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { APIGatewayProxyEvent } from 'aws-lambda';

import { handler } from '../../src/handlers/generateUploadUrl';
import * as s3Service from '../../src/services/s3Service';

vi.mock('../../src/services/s3Service');

describe('generateUploadUrl handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env['S3_BUCKET_NAME'] = 'test-bucket';
    process.env['AWS_REGION'] = 'us-west-2';
  });

  const createMockEvent = (body: string): APIGatewayProxyEvent => ({
    body,
    headers: {},
    multiValueHeaders: {},
    httpMethod: 'POST',
    isBase64Encoded: false,
    path: '/upload-url',
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as APIGatewayProxyEvent['requestContext'],
    resource: '',
  });

  it('should return 400 when request body is missing', async () => {
    const event = createMockEvent('');
    event.body = null;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toHaveProperty('error', 'Bad Request');
    expect(responseBody.message).toContain('required');
  });

  it('should return 400 when request body is invalid JSON', async () => {
    const event = createMockEvent('invalid json');

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toHaveProperty('error', 'Bad Request');
    expect(responseBody.message).toContain('Invalid JSON');
  });

  it('should return 400 when userId is missing', async () => {
    const event = createMockEvent(
      JSON.stringify({
        filename: 'test.jpg',
        contentType: 'image/jpeg',
      })
    );

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toHaveProperty('error', 'Validation Error');
    expect(responseBody.message).toContain('userId');
  });

  it('should return 400 when filename is missing', async () => {
    const event = createMockEvent(
      JSON.stringify({
        userId: 'user123',
        contentType: 'image/jpeg',
      })
    );

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toHaveProperty('error', 'Validation Error');
    expect(responseBody.message).toContain('filename');
  });

  it('should return 400 when contentType is invalid', async () => {
    const event = createMockEvent(
      JSON.stringify({
        userId: 'user123',
        filename: 'test.jpg',
        contentType: 'application/pdf',
      })
    );

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toHaveProperty('error', 'Validation Error');
    expect(responseBody.message).toContain('contentType');
  });

  it('should generate upload URL successfully with valid request', async () => {
    const mockResponse = {
      uploadUrl: 'https://s3.amazonaws.com/test-bucket/user123/image-id.jpg?signature',
      imageId: 'test-uuid',
      s3Key: 'user123/test-uuid.jpg',
      expiresIn: 900,
    };

    const mockGenerateUploadUrl = vi.fn().mockResolvedValue(mockResponse);
    vi.spyOn(s3Service, 'S3Service').mockImplementation(
      () =>
        ({
          generateUploadUrl: mockGenerateUploadUrl,
        }) as unknown as s3Service.S3Service
    );

    const event = createMockEvent(
      JSON.stringify({
        userId: 'user123',
        filename: 'test.jpg',
        contentType: 'image/jpeg',
      })
    );

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.headers).toHaveProperty('Content-Type', 'application/json');
    expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');

    const responseBody = JSON.parse(result.body);
    expect(responseBody).toEqual(mockResponse);
  });

  it('should return 500 when S3 service throws error', async () => {
    const mockGenerateUploadUrl = vi
      .fn()
      .mockRejectedValue(new Error('S3 error'));
    vi.spyOn(s3Service, 'S3Service').mockImplementation(
      () =>
        ({
          generateUploadUrl: mockGenerateUploadUrl,
        }) as unknown as s3Service.S3Service
    );

    const event = createMockEvent(
      JSON.stringify({
        userId: 'user123',
        filename: 'test.jpg',
        contentType: 'image/jpeg',
      })
    );

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toHaveProperty('error', 'Internal Server Error');
  });

  it('should handle CORS headers correctly', async () => {
    const mockResponse = {
      uploadUrl: 'https://s3.amazonaws.com/test-bucket/user123/image-id.jpg',
      imageId: 'test-uuid',
      s3Key: 'user123/test-uuid.jpg',
      expiresIn: 900,
    };

    const mockGenerateUploadUrl = vi.fn().mockResolvedValue(mockResponse);
    vi.spyOn(s3Service, 'S3Service').mockImplementation(
      () =>
        ({
          generateUploadUrl: mockGenerateUploadUrl,
        }) as unknown as s3Service.S3Service
    );

    const event = createMockEvent(
      JSON.stringify({
        userId: 'user123',
        filename: 'test.jpg',
        contentType: 'image/jpeg',
      })
    );

    const result = await handler(event);

    expect(result.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
  });
});
