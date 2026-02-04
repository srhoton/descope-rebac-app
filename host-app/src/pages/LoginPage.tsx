/**
 * Login page component for Host Application.
 * Uses Descope embedded flow for authentication with tenant selection.
 */

import { Descope, useSession } from '@descope/react-sdk';
import { useCallback, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';


import { DESCOPE_FLOWS, ROUTES } from '../constants/routes';

/**
 * LoginPage - Dedicated login page with Descope authentication flow.
 * Redirects authenticated users to home page automatically.
 * Displays a loading state while checking session status.
 */
export const LoginPage: FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isSessionLoading } = useSession();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isSessionLoading) {
      navigate(ROUTES.HOME, { replace: true });
    }
  }, [isAuthenticated, isSessionLoading, navigate]);

  /**
   * Handles successful authentication by navigating to the home page.
   */
  const handleSuccess = useCallback(() => {
    navigate(ROUTES.HOME, { replace: true });
  }, [navigate]);

  /**
   * Handles authentication errors by logging them.
   *
   * @param error - The custom event containing error details
   */
  const handleError = useCallback((error: CustomEvent) => {
    console.error('Authentication error:', error.detail);
  }, []);

  // Show loading state while checking session
  if (isSessionLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 animate-spin text-blue-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Host App Login</h1>
          <p className="text-gray-600">Sign in to access the application</p>
        </div>

        <Descope flowId={DESCOPE_FLOWS.SIGN_UP_OR_IN} onSuccess={handleSuccess} onError={handleError} />

        <p className="mt-6 text-center text-sm text-gray-500">
          Powered by{' '}
          <a
            href="https://www.descope.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700"
          >
            Descope
          </a>
        </p>
      </div>
    </div>
  );
};
