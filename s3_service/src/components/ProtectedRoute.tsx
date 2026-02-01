/**
 * Protected route component that redirects to login page if not authenticated
 */

import { useEffect, type FC, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@descope/react-sdk';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Wraps routes that require authentication
 * Redirects to internal /login page if user is not authenticated
 * Tenant selection is handled by Descope flow (sign-up-or-in-fullbay)
 */
export const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isSessionLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if we're done loading AND not authenticated
    if (!isSessionLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isSessionLoading, navigate]);

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

  return <>{children}</>;
};
