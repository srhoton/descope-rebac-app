# Module Federation Configuration

The s3_service exposes React components as federated modules using `@originjs/vite-plugin-federation`, allowing host applications to dynamically load image management functionality at runtime.

## Exposed Modules

### Full Page Components

| Module | Export | Description |
|--------|--------|-------------|
| `./ImagePage` | `ImageUploadPage` | Full page with uploader and gallery (requires providers) |
| `./StandaloneImagePage` | `StandaloneImagePage` | Self-contained page with all providers included |

### Individual Components

| Module | Export | Description |
|--------|--------|-------------|
| `./ImageGallery` | `ImageGallery` | Image gallery with sharing controls |
| `./ImageUploader` | `ImageUploader` | Drag-and-drop image upload |
| `./ShareModal` | `ShareModal` | Modal for sharing images with users |
| `./SharedUsersList` | `SharedUsersList` | List of users with viewer access |

### UI Components

| Module | Export | Description |
|--------|--------|-------------|
| `./ui/Button` | `Button` | Styled button with variants |
| `./ui/Modal` | `Modal` | Accessible modal dialog |
| `./ui/Select` | `Select` | Styled select dropdown |

### Contexts & Hooks

| Module | Export | Description |
|--------|--------|-------------|
| `./contexts/TenantContext` | `TenantProvider`, `useTenant` | Multi-tenant context provider |
| `./hooks/useDescope` | `useDescope` | Authentication hook |

### Utilities

| Module | Export | Description |
|--------|--------|-------------|
| `./utils/cn` | `cn` | Class name utility (clsx + tailwind-merge) |
| `./federation` | All exports | Barrel file with all exports |

## Shared Dependencies

These dependencies are configured as singletons to avoid duplicate instances:

```javascript
shared: {
  react: { singleton: true, requiredVersion: '^18.0.0' },
  'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
  'react-router-dom': { singleton: true, requiredVersion: '^6.0.0' },
  '@descope/react-sdk': { singleton: true, requiredVersion: '^2.0.0' },
  zustand: { singleton: true, requiredVersion: '^4.0.0' },
}
```

## Usage

### Starting the Remote

Development:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm run serve:federation
```

The remote entry point is available at:
- Development: `http://localhost:3002/assets/remoteEntry.js`
- Production: `http://your-domain/assets/remoteEntry.js`

### Host Configuration

In the host application's `vite.config.ts`:

```typescript
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'host-app',
      remotes: {
        s3ImageService: {
          external: 'http://localhost:3002/assets/remoteEntry.js',
          externalType: 'url',
        },
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
        'react-router-dom': { singleton: true, requiredVersion: '^6.0.0' },
        '@descope/react-sdk': { singleton: true, requiredVersion: '^2.0.0' },
        zustand: { singleton: true, requiredVersion: '^4.0.0' },
      },
    }),
  ],
});
```

### Importing in Host

```typescript
// Option 1: Use standalone page (simplest)
const StandaloneImagePage = lazy(() => import('s3ImageService/StandaloneImagePage'));

// Option 2: Use individual components
const ImageGallery = lazy(() =>
  import('s3ImageService/ImageGallery').then(m => ({ default: m.ImageGallery }))
);

// Option 3: Import from barrel file
const { ImageGallery, ImageUploader, TenantProvider } = await import('s3ImageService/federation');
```

## Component Props

### StandaloneImagePage

```typescript
interface StandaloneImagePageProps {
  /** Descope project ID (required if using embedded auth) */
  descopeProjectId?: string;
  /** Whether to use embedded auth (default: false) */
  useEmbeddedAuth?: boolean;
  /** Router type: 'browser' | 'memory' | 'none' (default: 'memory') */
  routerType?: 'browser' | 'memory' | 'none';
  /** Initial path for MemoryRouter (default: '/') */
  initialPath?: string;
}
```

### ImageGallery

```typescript
interface ImageGalleryProps {
  /** Trigger to refresh gallery (increment to reload) */
  refreshTrigger: number;
  /** Callback when an image is deleted */
  onImageDeleted?: (imageId: string) => void;
  /** Callback when sharing changes */
  onSharingChanged?: (imageId: string) => void;
  /** Optional CSS class name */
  className?: string;
}
```

### ImageUploader

```typescript
interface ImageUploaderProps {
  /** Callback when upload completes */
  onUploadComplete: () => void;
  /** Callback when upload fails */
  onUploadError?: (error: Error) => void;
  /** Maximum file size in bytes */
  maxFileSize?: number;
  /** Accepted file types */
  acceptedTypes?: string[];
  /** Optional CSS class name */
  className?: string;
}
```

## Context Requirements

### When using individual components:

Components require these providers:
1. `AuthProvider` from `@descope/react-sdk` - For authentication
2. `TenantProvider` from `./contexts/TenantContext` - For multi-tenant support
3. `BrowserRouter` or `MemoryRouter` - For routing (useDescope hook uses useNavigate)

### When using StandaloneImagePage:

The standalone page can provide its own providers:
- Set `useEmbeddedAuth={true}` to include AuthProvider
- Set `routerType="memory"` to include MemoryRouter (doesn't affect host URL)
- Set `routerType="none"` if host provides Router

## CORS Configuration

For production, ensure the remote server allows cross-origin requests:

```
Access-Control-Allow-Origin: https://your-host-app.example.com
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## Version Management

For zero-downtime deployments:
1. Deploy new remote version to a new path: `/v2/assets/remoteEntry.js`
2. Update host configuration to point to new version
3. Keep old version running during transition period
