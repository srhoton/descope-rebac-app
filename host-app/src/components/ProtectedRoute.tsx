/**
 * Protected route component that redirects to login page if not authenticated.
 * Used to wrap routes that require authentication.
 */

import { useSession } from '@descope/react-sdk';
import { useEffect, type FC, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';


import { ROUTES } from '../constants/routes';

/** Props for the ProtectedRoute component */
interface ProtectedRouteProps {
  /** Child components to render when authenticated */
  children: ReactNode;
}

/**
 * Wraps routes that require authentication.
 * Redirects to internal /login page if user is not authenticated.
 * Tenant selection is handled by Descope flow (sign-up-or-in-fullbay).
 *
 * Shows loading state while checking session status, and a redirect
 * message briefly before navigation occurs.
 *
 * @param props - Component props
 * @param props.children - Child components to render when authenticated
 *
 * @example
 * ```tsx
 * <Route
 *   path="/"
 *   element={
 *     <ProtectedRoute>
 *       <HomePage />
 *     </ProtectedRoute>
 *   }
 * />
 * ```
 */
export const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isSessionLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if we're done loading AND not authenticated
    if (!isSessionLoading && !isAuthenticated) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [isAuthenticated, isSessionLoading, navigate]);

  if (isSessionLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="text-center">
          <div
            className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
            aria-hidden="true"
          />
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
