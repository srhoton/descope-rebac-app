# S3 Image Upload Service

React-based web application for secure image uploads to AWS S3 with Descope authentication and ReBaC authorization.

## Features

- Descope authentication with redirect flow
- Secure image upload to S3 using presigned URLs
- Image gallery displaying user's uploaded images
- ReBaC-based access control for images
- Drag-and-drop upload interface
- Responsive design with Tailwind CSS
- TypeScript with strict type checking
- Comprehensive testing setup

## Architecture

### Authentication Flow

1. User visits the S3 service (descope-s3.sb.fullbay.com)
2. If not authenticated, redirected to IDP service (descope-idp.sb.fullbay.com)
3. After login at IDP service, redirected back to S3 service
4. User can now upload and view images

### Upload Flow

1. User selects an image file
2. Frontend requests presigned upload URL from API Lambda
3. Frontend uploads image directly to S3 using presigned URL
4. Frontend creates ownership relation in ReBaC AppSync API
5. Image appears in user's gallery

### Image Listing Flow

1. Frontend queries ReBaC AppSync API for user's accessible images
2. For each image, frontend requests presigned download URL from API Lambda
3. Images are displayed in gallery with presigned download URLs

## Technology Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Descope React SDK
- AWS Amplify (for AppSync integration)
- React Router
- Zustand (for state management)
- Vitest (for testing)

## Project Structure

```
s3_service/
├── src/
│   ├── components/         # Reusable React components
│   │   ├── ImageUploader.tsx
│   │   ├── ImageGallery.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/              # Page-level components
│   │   └── ImageUploadPage.tsx
│   ├── hooks/              # Custom React hooks
│   │   └── useDescope.ts
│   ├── services/           # API and service integrations
│   │   ├── appsyncClient.ts
│   │   └── imageService.ts
│   ├── types/              # TypeScript type definitions
│   │   └── image.ts
│   ├── styles/             # Global styles
│   │   └── index.css
│   ├── App.tsx             # Main app component
│   └── main.tsx            # Entry point
├── __tests__/              # Test files
├── index.html              # HTML template
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
├── package.json
└── README.md
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Descope Configuration
VITE_DESCOPE_PROJECT_ID=your_descope_project_id

# API Configuration
VITE_API_BASE_URL=https://api.example.com/v1
VITE_APPSYNC_API_URL=https://your-appsync-api.appsync-api.us-west-2.amazonaws.com/graphql
VITE_APPSYNC_API_KEY=your_appsync_api_key

# IDP Service Domain
VITE_IDP_DOMAIN=descope-idp.sb.fullbay.com
```

## Development

### Prerequisites

- Node.js 18+ or 20+
- npm or yarn

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3002

### Building for Production

```bash
npm run build
```

Build output will be in the `dist/` directory.

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

## Components

### ImageUploader

Drag-and-drop file uploader component with file validation.

**Props:**
- `onUploadComplete: () => void` - Callback fired when upload completes successfully

**Features:**
- Drag-and-drop support
- File type validation (JPEG, PNG, GIF, WebP, SVG)
- File size validation (max 10MB)
- Upload progress indication
- Error handling and display

### ImageGallery

Gallery component for displaying user's uploaded images.

**Props:**
- `refreshTrigger: number` - Increment to force refresh

**Features:**
- Responsive grid layout
- Lazy loading images
- Empty state display
- Error handling
- Loading states

### ProtectedRoute

Route wrapper that enforces authentication.

**Props:**
- `children: ReactNode` - Protected content

**Features:**
- Redirects to IDP service if not authenticated
- Handles loading states
- Returns to original URL after login

## Services

### ImageService

Handles image upload and download operations.

**Methods:**
- `generateUploadUrl(request)` - Gets presigned upload URL
- `uploadImage(file, presignedUrl)` - Uploads file to S3
- `generateDownloadUrl(imageId, userId)` - Gets presigned download URL
- `getUserImages(userId)` - Gets all user's images
- `completeImageUpload(file, userId)` - Complete upload flow (URL → upload → ReBaC)

### AppSyncClient

GraphQL client for ReBaC service.

**Methods:**
- `getTargetAccess(userId)` - Gets all relations for a user
- `createImageOwnership(imageId, userId)` - Creates ownership relation
- `filterImageRelations(relations)` - Filters relations to get image IDs

## Hooks

### useDescope

Custom hook for accessing Descope authentication state.

**Returns:**
- `isAuthenticated: boolean` - Authentication status
- `isLoading: boolean` - Loading state
- `user: { userId, email?, name? } | null` - User information
- `logout: () => void` - Logout function

## Deployment

### Build

```bash
npm run build
```

### Deployment to S3 + CloudFront

The application is deployed as a static site to S3 and served via CloudFront.

**Infrastructure (managed via Terraform):**
- S3 bucket for static hosting
- CloudFront distribution
- ACM certificate for HTTPS
- Route53 DNS record (descope-s3.sb.fullbay.com)

### CORS Configuration

The API endpoints must have CORS enabled for:
- `https://descope-s3.sb.fullbay.com`
- `https://descope-idp.sb.fullbay.com`

## Security

- All API calls use HTTPS
- Images are uploaded directly to S3 using presigned URLs
- Presigned URLs expire after 15 minutes
- File type and size validation
- XSS protection through React's built-in escaping
- Authentication required for all operations
- ReBaC enforces access control

## Integration Points

### With IDP Service

- Redirects to IDP service for authentication
- Returns to S3 service after login with session token
- Shares Descope session across domains

### With ReBaC Service

- Queries AppSync API for user's accessible images
- Creates ownership relations after successful uploads
- Uses namespace: `metadata_item`, relationDefinition: `owner`

### With S3 Presigned URL API

- Requests presigned upload URLs
- Requests presigned download URLs
- Direct upload/download to/from S3

## Troubleshooting

### "User not authenticated" error

- Ensure Descope project ID is correctly configured
- Check that IDP service is accessible
- Verify session cookie is being set correctly

### Images not appearing in gallery

- Check AppSync API URL and API key are correct
- Verify ReBaC relations were created after upload
- Check browser console for API errors

### Upload failing

- Verify S3 bucket name is correct in API Lambda
- Check presigned URL expiration time
- Ensure CORS is properly configured on S3 bucket

### CORS errors

- Verify API Gateway has CORS enabled
- Check CloudFront distribution CORS headers
- Ensure origins match exactly (no trailing slashes)

## License

MIT
