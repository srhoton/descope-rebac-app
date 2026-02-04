# Host Application - Module Federation Demo

This is an example host application that consumes federated modules from the `s3_service` remote application.

## Prerequisites

- Node.js 18+
- The s3_service must be running and accessible at `http://localhost:3002`

## Setup

1. Copy the environment file and configure it:
   ```bash
   cp .env.example .env
   ```

2. Set your Descope project ID in `.env`:
   ```
   VITE_DESCOPE_PROJECT_ID=your-project-id
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Running

### Development

1. First, start the s3_service (remote):
   ```bash
   cd ../s3_service
   npm run dev
   ```

2. In a new terminal, start the host app:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000 in your browser.

### Production Build

1. Build the remote first:
   ```bash
   cd ../s3_service
   npm run build
   npm run serve:federation
   ```

2. Build and serve the host:
   ```bash
   npm run build
   npm run preview
   ```

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        HOST APPLICATION                              │
│  (localhost:3000)                                                   │
│                                                                      │
│  ┌──────────────────────┐    ┌──────────────────────────────────┐   │
│  │  Shell Layout        │    │  Remote Component Wrapper        │   │
│  │  - Navigation        │    │  - ErrorBoundary                 │   │
│  │  - Auth Provider     │    │  - Suspense                      │   │
│  │  - Tenant Context    │    │  - Lazy load federated modules   │   │
│  └──────────────────────┘    └──────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Runtime import
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     S3_SERVICE (REMOTE)                             │
│  (localhost:3002/assets/remoteEntry.js)                             │
│                                                                      │
│  Exposed Modules:                                                    │
│  - ./ImagePage             - Full page component                    │
│  - ./ImageGallery          - Gallery component                      │
│  - ./ImageUploader         - Upload component                       │
│  - ./ShareModal            - Sharing modal                          │
│  - ./StandaloneImagePage   - Self-contained page with providers     │
│  - ./ui/Button, Modal, etc - UI components                         │
│  - ./hooks/useDescope      - Auth hook                              │
│  - ./contexts/TenantContext - Tenant context provider              │
└─────────────────────────────────────────────────────────────────────┘
```

## Usage Examples

### Option 1: Full Standalone Page

The simplest way to use the remote - includes all required providers:

```tsx
import { lazy } from 'react';
import { RemoteComponentWrapper } from './components/RemoteComponentWrapper';

const RemoteStandaloneImagePage = lazy(
  () => import('s3ImageService/StandaloneImagePage')
);

export const ImagesPage = () => (
  <RemoteComponentWrapper>
    <RemoteStandaloneImagePage routerType="none" />
  </RemoteComponentWrapper>
);
```

### Option 2: Individual Components

For more control, use individual components:

```tsx
import { lazy, useState } from 'react';
import { RemoteComponentWrapper } from './components/RemoteComponentWrapper';

const RemoteImageGallery = lazy(
  () => import('s3ImageService/ImageGallery').then(m => ({ default: m.ImageGallery }))
);
const RemoteImageUploader = lazy(
  () => import('s3ImageService/ImageUploader').then(m => ({ default: m.ImageUploader }))
);
const RemoteTenantProvider = lazy(
  () => import('s3ImageService/contexts/TenantContext').then(m => ({ default: m.TenantProvider }))
);

export const CustomPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <RemoteComponentWrapper>
      <RemoteTenantProvider>
        <RemoteImageUploader
          onUploadComplete={() => setRefreshTrigger(t => t + 1)}
        />
        <RemoteImageGallery refreshTrigger={refreshTrigger} />
      </RemoteTenantProvider>
    </RemoteComponentWrapper>
  );
};
```

## Shared Dependencies

The following dependencies are shared between host and remote (singletons):

- react ^18.0.0
- react-dom ^18.0.0
- react-router-dom ^6.0.0
- @descope/react-sdk ^2.0.0
- zustand ^4.0.0

Ensure version compatibility between host and remote applications.

## Production Deployment

For production, update the remote URL in `vite.config.ts`:

```ts
remotes: {
  s3ImageService: {
    external: `${import.meta.env.VITE_S3_SERVICE_URL}/assets/remoteEntry.js`,
    externalType: 'url',
  },
},
```

And ensure CORS headers are set on the remote server:

```
Access-Control-Allow-Origin: https://your-host-app.example.com
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```
