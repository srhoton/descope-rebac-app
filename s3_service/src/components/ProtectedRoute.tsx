/**
 * Protected route component that redirects to IDP service if not authenticated
 */

import { useEffect, type FC, type ReactNode } from 'react';
import { useDescope } from '../hooks/useDescope';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Wraps routes that require authentication
 * Redirects to IDP service login if user is not authenticated
 */
export const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useDescope();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to IDP service login with return URL
      const idpDomain = import.meta.env['VITE_IDP_DOMAIN'] as string;
      const currentUrl = window.location.href;

      if (idpDomain) {
        window.location.href = `https://${idpDomain}/?returnUrl=${encodeURIComponent(currentUrl)}`;
      } else {
        console.error('IDP_DOMAIN not configured');
      }
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
          <p className="text-gray-600">Loading...</p>
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

  return <>{children}</>;
};
