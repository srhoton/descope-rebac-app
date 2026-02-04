/**
 * Type definitions for s3-image-service federated modules
 */

declare module 's3ImageService/ImagePage' {
  import { FC } from 'react';

  export interface ImageUploadPageProps {
    /**
     * Hide page chrome (header and footer).
     * Use this when embedding in a host app that provides its own header/navigation.
     */
    hideChrome?: boolean;
  }

  export const ImageUploadPage: FC<ImageUploadPageProps>;
  export default ImageUploadPage;
}

declare module 's3ImageService/StandaloneImagePage' {
  import { FC } from 'react';

  export interface StandaloneImagePageProps {
    /** Descope project ID (required if not using host's auth) */
    descopeProjectId?: string;
    /** Whether to use embedded auth or expect parent to provide */
    useEmbeddedAuth?: boolean;
    /** Router type to use ('none' when host already provides BrowserRouter) */
    routerType?: 'browser' | 'memory' | 'none';
    /** Initial path for MemoryRouter */
    initialPath?: string;
    /**
     * Hide page chrome (header and footer).
     * Use this when embedding in a host app that provides its own header/navigation.
     */
    hideChrome?: boolean;
  }

  export const StandaloneImagePage: FC<StandaloneImagePageProps>;
  export default StandaloneImagePage;
}

declare module 's3ImageService/ImageGallery' {
  import { FC } from 'react';

  export interface ImageGalleryProps {
    /** Trigger to refresh the gallery (increment to reload) */
    refreshTrigger: number;
    /** Optional callback when an image is deleted */
    onImageDeleted?: (imageId: string) => void;
    /** Optional callback when sharing changes */
    onSharingChanged?: (imageId: string) => void;
    /** Optional CSS class name */
    className?: string;
  }

  export const ImageGallery: FC<ImageGalleryProps>;
}

declare module 's3ImageService/ImageUploader' {
  import { FC } from 'react';

  export interface ImageUploaderProps {
    /** Callback when upload completes successfully */
    onUploadComplete: () => void;
    /** Optional callback when upload fails */
    onUploadError?: (error: Error) => void;
    /** Maximum file size in bytes */
    maxFileSize?: number;
    /** Accepted file types */
    acceptedTypes?: string[];
    /** Optional CSS class name */
    className?: string;
  }

  export const ImageUploader: FC<ImageUploaderProps>;
}

declare module 's3ImageService/ShareModal' {
  import { FC } from 'react';

  export interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageId: string;
    imageName: string;
    onShareSuccess: () => void;
    existingViewers: Array<{ userId: string; tenantId: string }>;
  }

  export const ShareModal: FC<ShareModalProps>;
}

declare module 's3ImageService/SharedUsersList' {
  import { FC } from 'react';

  interface SharedUser {
    userId: string;
    email: string;
    name?: string;
    tenantId: string;
    tenantName?: string;
  }

  export interface SharedUsersListProps {
    imageId: string;
    imageName: string;
    sharedUsers: SharedUser[];
    onUnshareSuccess: () => void;
  }

  export const SharedUsersList: FC<SharedUsersListProps>;
}

declare module 's3ImageService/contexts/TenantContext' {
  import { FC, ReactNode } from 'react';

  export interface Tenant {
    tenantId: string;
    tenantName?: string;
    roleNames?: string[];
  }

  export interface TenantContextValue {
    tenants: Tenant[];
    selectedTenant: Tenant | null;
    setSelectedTenant: (tenant: Tenant) => void;
    needsTenantSelection: boolean;
    isLoading: boolean;
  }

  export const TenantProvider: FC<{ children: ReactNode }>;
  export function useTenant(): TenantContextValue;
}

declare module 's3ImageService/hooks/useDescope' {
  export interface UseDescopeResult {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: {
      userId: string;
      email?: string;
      name?: string;
    } | null;
    logout: () => void;
  }

  export function useDescope(): UseDescopeResult;
}

declare module 's3ImageService/ui/Button' {
  import { FC, ButtonHTMLAttributes } from 'react';

  export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
  }

  export const Button: FC<ButtonProps>;
}

declare module 's3ImageService/ui/Modal' {
  import { FC, ReactNode } from 'react';

  export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    className?: string;
  }

  export const Modal: FC<ModalProps>;
}

declare module 's3ImageService/ui/Select' {
  import { FC, SelectHTMLAttributes } from 'react';

  export interface SelectOption {
    value: string;
    label: string;
  }

  export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    options: SelectOption[];
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
  }

  export const Select: FC<SelectProps>;
}

declare module 's3ImageService/utils/cn' {
  import { ClassValue } from 'clsx';
  export function cn(...inputs: ClassValue[]): string;
}

declare module 's3ImageService/services/authTokenProvider' {
  export function setTokenGetter(getter: () => string | undefined): void;
  export function getAuthToken(): string | undefined;
}

declare module 's3ImageService/federation' {
  // Re-exports all components, types, and utilities from the federation barrel
  export * from 's3ImageService/ImageGallery';
  export * from 's3ImageService/ImageUploader';
  export * from 's3ImageService/ShareModal';
  export * from 's3ImageService/SharedUsersList';
  export * from 's3ImageService/ui/Button';
  export * from 's3ImageService/ui/Modal';
  export * from 's3ImageService/ui/Select';
  export * from 's3ImageService/contexts/TenantContext';
  export * from 's3ImageService/hooks/useDescope';
  export * from 's3ImageService/utils/cn';
}
