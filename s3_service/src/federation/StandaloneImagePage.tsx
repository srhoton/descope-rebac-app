/**
 * Standalone version of ImageUploadPage that includes all required providers.
 * Use this when the host app doesn't provide required context providers.
 */

import { type FC, type ReactNode, useEffect } from 'react';
import { AuthProvider, useSession } from '@descope/react-sdk';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { TenantProvider } from '../contexts/TenantContext';
import { ImageUploadPage } from '../pages/ImageUploadPage';
import { setTokenGetter } from '../services/authTokenProvider';

export interface StandaloneImagePageProps {
  /** Descope project ID (required if not using host's auth) */
  descopeProjectId?: string;
  /**
   * Whether to use embedded auth or expect parent to provide.
   * When true, this component manages its own AuthProvider.
   * When false (default), expects the host to provide AuthProvider.
   */
  useEmbeddedAuth?: boolean;
  /**
   * Router type to use.
   * 'browser' - Uses BrowserRouter (default, changes URL)
   * 'memory' - Uses MemoryRouter (doesn't change URL, better for federation)
   * 'none' - Expects host to provide router (use when host already provides BrowserRouter)
   */
  routerType?: 'browser' | 'memory' | 'none';
  /**
   * Initial path for MemoryRouter (only used when routerType is 'memory')
   */
  initialPath?: string;
  /**
   * Hide page chrome (header and footer).
   * Use this when embedding in a host app that provides its own header/navigation.
   * When true, only the main content (upload and gallery sections) will render,
   * and the host app is responsible for providing the header, user greeting, and logout.
   */
  hideChrome?: boolean;
}

/**
 * Internal component that sets up the auth token bridge
 */
const InternalAuthTokenBridge: FC<{ children: ReactNode }> = ({ children }) => {
  const { sessionToken } = useSession();

  useEffect(() => {
    setTokenGetter(() => sessionToken || undefined);
  }, [sessionToken]);

  return <>{children}</>;
};

/**
 * Wraps content with appropriate router based on routerType prop
 */
const RouterWrapper: FC<{
  routerType: 'browser' | 'memory' | 'none';
  initialPath: string;
  children: ReactNode;
}> = ({ routerType, initialPath, children }) => {
  if (routerType === 'browser') {
    return <BrowserRouter>{children}</BrowserRouter>;
  }

  if (routerType === 'memory') {
    return <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>;
  }

  // routerType === 'none' - host provides router
  return <>{children}</>;
};

/**
 * Core content wrapped with TenantProvider
 */
const ImagePageContent: FC<{ hideChrome?: boolean }> = ({ hideChrome }) => {
  return (
    <TenantProvider>
      <ImageUploadPage hideChrome={hideChrome ?? false} />
    </TenantProvider>
  );
};

/**
 * Standalone version of ImageUploadPage that includes all required providers.
 *
 * @example
 * // Use with host-provided auth (recommended)
 * <StandaloneImagePage routerType="memory" />
 *
 * @example
 * // Use with embedded auth (standalone mode)
 * <StandaloneImagePage
 *   useEmbeddedAuth={true}
 *   descopeProjectId="your-project-id"
 *   routerType="memory"
 * />
 *
 * @example
 * // Use with host-provided router and auth, hiding chrome
 * <StandaloneImagePage routerType="none" hideChrome={true} />
 */
export const StandaloneImagePage: FC<StandaloneImagePageProps> = ({
  descopeProjectId,
  useEmbeddedAuth = false,
  routerType = 'memory',
  initialPath = '/',
  hideChrome = false,
}) => {
  // Get project ID from props or environment
  const projectId = descopeProjectId ?? import.meta.env['VITE_DESCOPE_PROJECT_ID'];

  if (useEmbeddedAuth) {
    if (!projectId) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <strong>Configuration Error:</strong> Descope Project ID is required when using embedded
          auth. Provide it via the descopeProjectId prop or VITE_DESCOPE_PROJECT_ID environment
          variable.
        </div>
      );
    }

    return (
      <AuthProvider projectId={projectId}>
        <InternalAuthTokenBridge>
          <RouterWrapper routerType={routerType} initialPath={initialPath}>
            <ImagePageContent hideChrome={hideChrome} />
          </RouterWrapper>
        </InternalAuthTokenBridge>
      </AuthProvider>
    );
  }

  // Assume parent provides AuthProvider and auth token bridge
  return (
    <RouterWrapper routerType={routerType} initialPath={initialPath}>
      <ImagePageContent hideChrome={hideChrome} />
    </RouterWrapper>
  );
};

export default StandaloneImagePage;
