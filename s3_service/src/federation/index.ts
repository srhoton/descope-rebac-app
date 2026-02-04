/**
 * Module Federation exports barrel file
 * Provides clean interfaces for consuming applications
 */

// Re-export components with explicit props interfaces
export { ImageGallery } from '../components/ImageGallery';
export type { ImageGalleryProps } from '../components/ImageGallery';

export { ImageUploader } from '../components/ImageUploader';
export type { ImageUploaderProps } from '../components/ImageUploader';

export { ShareModal } from '../components/ShareModal';
export type { ShareModalProps } from '../components/ShareModal';

export { SharedUsersList } from '../components/SharedUsersList';
export type { SharedUsersListProps } from '../components/SharedUsersList';

// Export UI components
export { Button } from '../components/ui/Button';
export type { ButtonProps } from '../components/ui/Button';

export { Modal } from '../components/ui/Modal';
export type { ModalProps } from '../components/ui/Modal';

export { Select } from '../components/ui/Select';
export type { SelectProps, SelectOption } from '../components/ui/Select';

// Export tenant state management (ADR-005: Zustand for global state)
export { TenantProvider, useTenant } from '../contexts/TenantContext';
export type { Tenant as TenantContextTenant } from '../contexts/TenantContext';
export { useTenantStore, selectNeedsTenantSelection } from '../stores/tenantStore';
export type { Tenant as TenantStoreTenant } from '../stores/tenantStore';

// Export hooks
export { useDescope } from '../hooks/useDescope';
export type { UseDescopeResult } from '../hooks/useDescope';

// Export utility functions
export { cn } from '../utils/cn';

// Export types for consuming applications
export type {
  Image,
  UploadUrlRequest,
  UploadUrlResponse,
  DownloadUrlRequest,
  DownloadUrlResponse,
  RelationTuple,
  AllowedImageType,
} from '../types/image';
export { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from '../types/image';

export type {
  Tenant,
  PaginatedTenants,
  Member,
  PaginatedMembers,
  SharedUser,
  UserInfo,
} from '../types/sharing';

// Export page components
export { ImageUploadPage } from '../pages/ImageUploadPage';
export type { ImageUploadPageProps } from '../pages/ImageUploadPage';

// Export standalone version
export { StandaloneImagePage } from './StandaloneImagePage';
export type { StandaloneImagePageProps } from './StandaloneImagePage';
