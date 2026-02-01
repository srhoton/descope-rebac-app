# S3 Presigned URL API

AWS Lambda function for generating presigned S3 URLs for image uploads and downloads.

## Overview

This service provides secure presigned URLs for uploading and downloading images to/from S3. It's designed to work with the Descope authentication system and ReBaC service for managing image access permissions.

## Features

- Generate presigned URLs for image uploads (PUT)
- Generate presigned URLs for image downloads (GET)
- Input validation and sanitization
- Support for multiple image formats (JPEG, PNG, GIF, WebP, SVG)
- CORS-enabled API endpoints
- Comprehensive error handling
- TypeScript with strict type checking
- High test coverage (80%+)

## Architecture

### Directory Structure

```
s3_presigned_url_api/
├── src/
│   ├── handlers/              # Lambda function handlers
│   │   ├── generateUploadUrl.ts
│   │   └── generateDownloadUrl.ts
│   ├── services/              # Business logic services
│   │   └── s3Service.ts
│   ├── types/                 # TypeScript type definitions
│   │   └── api.ts
│   ├── utils/                 # Utility functions
│   │   └── validation.ts
│   └── index.ts              # Main entry point
├── __tests__/                 # Test files
│   └── handlers/
├── dist/                      # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## API Endpoints

### POST /upload-url

Generates a presigned URL for uploading an image.

**Request Body:**
```json
{
  "userId": "string (Descope user ID)",
  "filename": "string (original filename with extension)",
  "contentType": "string (MIME type, e.g., image/jpeg)"
}
```

**Response (200):**
```json
{
  "uploadUrl": "string (presigned S3 URL)",
  "imageId": "string (UUID)",
  "s3Key": "string (S3 object key)",
  "expiresIn": 900
}
```

**Error Response (400/500):**
```json
{
  "error": "string",
  "message": "string"
}
```

### GET /download-url

Generates a presigned URL for downloading an image.

**Query Parameters:**
- `imageId`: UUID of the image
- `userId`: Descope user ID

**Response (200):**
```json
{
  "downloadUrl": "string (presigned S3 URL)",
  "s3Key": "string (S3 object key)",
  "expiresIn": 900
}
```

## Configuration

### Environment Variables

- `S3_BUCKET_NAME` (required): Name of the S3 bucket for image storage
- `AWS_REGION` (optional): AWS region, defaults to `us-west-2`

### S3 Bucket Structure

Images are stored with the following key pattern:
```
{userId}/{imageId}.{extension}
```

Example: `user123/a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d.jpg`

### S3 Metadata

When uploading, the following metadata is attached to objects:
- `originalFilename`: Sanitized original filename
- `userId`: User ID who uploaded the file
- `uploadedAt`: ISO 8601 timestamp of upload

## Validation Rules

### Upload Request
- `userId`: Required, non-empty, alphanumeric with hyphens/underscores, max 128 chars
- `filename`: Required, non-empty, max 255 chars
- `contentType`: Required, must be one of the allowed image types

### Download Request
- `imageId`: Required, must be a valid UUID v4
- `userId`: Required, non-empty, alphanumeric with hyphens/underscores, max 128 chars

### Allowed Content Types
- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/gif`
- `image/webp`
- `image/svg+xml`

### File Size Limits
- Maximum file size: 10 MB

### URL Expiration
- Presigned URLs expire after 15 minutes (900 seconds)

## Development

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### Installation

```bash
npm install
```

### Build

```bash
npm run build
```

### Testing

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

### Package for Deployment

```bash
npm run package
```

This creates a `lambda.zip` file ready for deployment to AWS Lambda.

## Deployment

### Lambda Configuration

- **Runtime**: Node.js 18.x or 20.x
- **Handler**: `index.generateUploadUrl` or `index.generateDownloadUrl`
- **Memory**: 512 MB (recommended)
- **Timeout**: 30 seconds
- **Environment Variables**: Set `S3_BUCKET_NAME` and optionally `AWS_REGION`

### IAM Permissions

The Lambda execution role needs the following S3 permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

### API Gateway Integration

Configure API Gateway with:
- POST `/upload-url` → `generateUploadUrl` handler
- GET `/download-url` → `generateDownloadUrl` handler

Enable CORS with appropriate origins.

## Security Considerations

1. **Input Validation**: All inputs are validated and sanitized before processing
2. **Filename Sanitization**: Filenames are sanitized to prevent path traversal attacks
3. **Content Type Validation**: Only allowed image types can be uploaded
4. **URL Expiration**: Presigned URLs expire after 15 minutes
5. **CORS**: Configure appropriate CORS policies for production
6. **IAM Permissions**: Use least-privilege IAM roles
7. **User ID Validation**: User IDs must be validated against Descope authentication

## Integration with ReBaC Service

After a successful upload:
1. Frontend receives `imageId` from this API
2. Frontend calls ReBaC AppSync API to create ownership relation:
   ```graphql
   mutation {
     createRelations(input: {
       relations: [{
         namespace: "metadata_item"
         relationDefinition: "owner"
         resource: "image:{imageId}"
         target: "user:{userId}"
       }]
     })
   }
   ```

## Testing

The test suite includes:
- Unit tests for all handlers
- Input validation tests
- Error handling tests
- CORS header verification
- Edge case coverage

Run tests with coverage:
```bash
npm run test:coverage
```

Aim for 80%+ coverage on all metrics.

## Troubleshooting

### Common Issues

1. **"S3_BUCKET_NAME environment variable is required"**
   - Ensure the environment variable is set in Lambda configuration

2. **"Failed to generate upload URL"**
   - Check IAM permissions for the Lambda execution role
   - Verify S3 bucket exists and is accessible

3. **CORS errors**
   - Ensure API Gateway CORS is properly configured
   - Verify Access-Control-Allow-Origin headers in responses

## License

MIT
