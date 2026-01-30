# SDLC Plan: S3 Image Upload Service

## Status: In Progress
## Created: 2026-01-30
## Last Updated: 2026-01-30

## Original Request
> In a new directory called s3_service, we want to create a TypeScript and React-based website that allows people upload images to an S3 bucket. The flow is as follows:
>
> - If the user is not logged into descope they should be redirected to the descope login page for fullbay (https://descope-idp.auth.descope.com). After logging in they should be redirected back to the image upload page. This may require updated configuration in the idp_service project to allow this redirect.
> - After logging in, the user should see a simple page with an image upload button, and a list of previously uploaded images (if any). This can be found be querying the rebac_service appsync endpoint for images the user has access to. They should also see an upload button that allows them to select an image from their computer and upload it to the S3 bucket.
>
> - When the user selects an image to upload, it should be uploaded to the S3 bucket in a folder corresponding to their user id (which can be found in the descope user info), and the rebac_service appsync create relation endpoint should be updated to reflect the new image being available to the user as an owner. The page should then refresh the list of images to show the newly uploaded image.
>
> - This should be deployed using S3 and CloudFront.
> - The deployment process should be done through Terraform (like the rest of the project).
> - The descope project id for this can be found in ~/git/tmp/descope/project_id.
> - It should resolve to a dns name of descope-s3.sb.fullbay.com. The domain is already managed in route53, but you will need to create an ACM ceritificate for it (no wildcard needed).

## Clarifications

### User Provided Answers:
1. **S3 Upload Mechanism**: Presigned URLs (frontend requests presigned URL from API, uploads directly to S3)
2. **Image Storage Structure**: UUIDs for image IDs (auto-generated to prevent collisions)
3. **ReBaC Relations Schema**: Use existing schema from test-metadata-schema.json
   - namespace: "metadata_item"
   - relationDefinition: "owner"
   - resource: "image:{imageId}"
   - target: "user:{userId}"
4. **Image Metadata Storage**: S3 metadata only (no DynamoDB needed)
5. **Authentication**: Descope session tokens for AppSync calls
6. **CORS Configuration**: Allow both descope-s3.sb.fullbay.com AND the idp_service domain (descope-idp.sb.fullbay.com)
7. **Image Listing Strategy**: Query AppSync for relations with namespace="metadata_item" and relationDefinition="owner" filtered by target="user:{userId}", then query S3 for each image to get presigned GET URLs
8. **Image Deletion**: Upload only for now (no delete functionality)

## Architecture Overview

The S3 Image Upload Service consists of:

1. **Frontend (React + TypeScript + Vite)**:
   - Image upload page with file selection interface
   - List view of user's accessible images
   - Descope authentication integration with redirect flow to idp_service
   - AppSync GraphQL client for querying relations and creating ownership relations

2. **Backend (AWS Lambda + API Gateway)**:
   - Lambda function to generate presigned S3 URLs (PUT for upload, GET for download)
   - API Gateway REST API to expose Lambda endpoints

3. **Storage Layer**:
   - S3 bucket for image storage (organized by user ID: s3://bucket/{userId}/{imageUUID}.{ext})
   - S3 object metadata for image metadata (filename, upload date, content-type)

4. **Infrastructure (Terraform)**:
   - S3 bucket with CORS and lifecycle policies
   - CloudFront distribution for frontend hosting
   - ACM certificate for descope-s3.sb.fullbay.com
   - Route53 DNS records
   - Lambda function and API Gateway for presigned URL generation
   - IAM roles and policies

5. **Integration**:
   - Uses existing Descope authentication via redirect to idp_service (descope-idp.sb.fullbay.com)
   - Uses existing rebac_service AppSync API (namespace: "metadata_item", relationDefinition: "owner")
   - Frontend passes Descope session token to AppSync for authentication

## Components

### Component: S3 Presigned URL API Lambda
- **Type**: backend
- **Technology**: TypeScript + AWS Lambda
- **Subagent**: typescript-agent
- **Status**: Pending
- **Dependencies**: None
- **Description**: Lambda function providing API endpoints for generating presigned S3 URLs for upload (PUT) and download (GET)
- **Files**:
  - `s3_presigned_url_api/package.json`
  - `s3_presigned_url_api/tsconfig.json`
  - `s3_presigned_url_api/src/index.ts`
  - `s3_presigned_url_api/src/handlers/generateUploadUrl.ts`
  - `s3_presigned_url_api/src/handlers/generateDownloadUrl.ts`
  - `s3_presigned_url_api/src/services/s3Service.ts`
  - `s3_presigned_url_api/src/types/api.ts`
  - `s3_presigned_url_api/src/utils/validation.ts`
  - `s3_presigned_url_api/__tests__/handlers/generateUploadUrl.test.ts`
  - `s3_presigned_url_api/__tests__/handlers/generateDownloadUrl.test.ts`
  - `s3_presigned_url_api/README.md`
- **Review History**: None yet

### Component: S3 Service Frontend
- **Type**: frontend
- **Technology**: React 18 + TypeScript + Vite
- **Subagent**: react-agent
- **Status**: Pending
- **Dependencies**: S3 Presigned URL API Lambda (for integration testing)
- **Description**: React application providing image upload UI, image gallery, and Descope authentication integration
- **Files**:
  - `s3_service/package.json`
  - `s3_service/tsconfig.json`
  - `s3_service/vite.config.ts`
  - `s3_service/index.html`
  - `s3_service/src/main.tsx`
  - `s3_service/src/App.tsx`
  - `s3_service/src/pages/ImageUploadPage.tsx`
  - `s3_service/src/components/ImageUploader.tsx`
  - `s3_service/src/components/ImageGallery.tsx`
  - `s3_service/src/components/ProtectedRoute.tsx`
  - `s3_service/src/hooks/useDescope.ts`
  - `s3_service/src/services/appsyncClient.ts`
  - `s3_service/src/services/imageService.ts`
  - `s3_service/src/types/image.ts`
  - `s3_service/tailwind.config.js`
  - `s3_service/postcss.config.js`
  - `s3_service/.eslintrc.json`
  - `s3_service/__tests__/*`
  - `s3_service/README.md`
- **Review History**: None yet

### Component: Terraform Infrastructure
- **Type**: infrastructure
- **Technology**: Terraform (HCL)
- **Subagent**: terraform-agent
- **Status**: Pending
- **Dependencies**: S3 Service Frontend (needs build artifacts), S3 Presigned URL API Lambda
- **Description**: Terraform configuration for S3 bucket, CloudFront, ACM certificate, Lambda function, API Gateway, and IAM
- **Files**:
  - `terraform/s3_service_acm.tf`
  - `terraform/s3_service.tf`
  - `terraform/s3_image_bucket.tf`
  - `terraform/s3_presigned_url_api.tf`
  - `terraform/s3_api_gateway.tf`
  - `terraform/variables.tf` (update with new variables)
  - `terraform/outputs.tf` (update with new outputs)
- **Review History**: None yet

## Implementation Order

1. **S3 Presigned URL API Lambda** - Backend first to provide API endpoints for frontend development
   - Reason: Frontend needs API endpoints to test against during development

2. **S3 Service Frontend** - React application for image upload UI
   - Reason: Depends on API Lambda being available for integration testing

3. **Terraform Infrastructure** - Infrastructure deployment
   - Reason: Last, as it needs build artifacts from all previous components

## Commits

- [ ] S3 Presigned URL API Lambda: Add Lambda function for S3 presigned URL generation (upload and download)
- [ ] S3 Service Frontend: Add React image upload application with Descope authentication and AppSync integration
- [ ] Terraform Infrastructure: Add Terraform configuration for S3 service infrastructure (S3, CloudFront, Lambda, API Gateway)

## Current Phase
**Phase**: 4-Commit
**Current Component**: All components completed
**Current Action**: Committing code and creating pull request

## Implementation Summary
All three components have been successfully implemented:

1. **S3 Presigned URL API Lambda** (TypeScript)
   - Generate presigned upload URLs
   - Generate presigned download URLs
   - Comprehensive input validation
   - Full test coverage
   - Security best practices implemented

2. **S3 Service Frontend** (React + TypeScript)
   - Image upload with drag-and-drop
   - Image gallery with user's images
   - Descope authentication integration
   - Protected routes
   - ReBaC integration via AppSync
   - Responsive Tailwind UI

3. **Terraform Infrastructure**
   - S3 bucket for images with CORS
   - S3 bucket for frontend static hosting
   - CloudFront distributions
   - ACM certificates
   - Lambda functions
   - API Gateway with CORS
   - Route53 DNS records
   - IAM roles and policies

## Error Log
None
