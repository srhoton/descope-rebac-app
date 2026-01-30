/**
 * Protected route component that redirects to IDP service if not authenticated
 */

import { useEffect, useRef, type FC, type ReactNode } from 'react';
import { useSession } from '@descope/react-sdk';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Wraps routes that require authentication
 * Redirects to IDP service login if user is not authenticated
 * Session is shared via cookies across subdomains
 */
export const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isSessionLoading } = useSession();
  const hasRedirected = useRef(false);

  console.log('[ProtectedRoute] Render:', { isAuthenticated, isSessionLoading });

  useEffect(() => {
    // Only redirect if we're done loading AND not authenticated AND haven't already redirected
    if (!isSessionLoading && !isAuthenticated && !hasRedirected.current) {
      console.log('[ProtectedRoute] Not authenticated, redirecting to IDP');
      hasRedirected.current = true;

      // Redirect to IDP service login with return URL
      const idpDomain = import.meta.env['VITE_IDP_DOMAIN'] as string;
      const currentUrl = window.location.href;

      if (idpDomain) {
        window.location.href = `https://${idpDomain}/?returnUrl=${encodeURIComponent(currentUrl)}`;
      } else {
        console.error('IDP_DOMAIN not configured');
      }
    }
  }, [isAuthenticated, isSessionLoading]);

  if (isSessionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  console.log('[ProtectedRoute] User is authenticated, rendering children');
  return <>{children}</>;
};
