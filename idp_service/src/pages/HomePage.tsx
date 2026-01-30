import React, { useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Descope, useSession } from '@descope/react-sdk';

/**
 * Validates that a return URL is safe to redirect to
 * Only allows URLs from trusted domains
 */
function isValidReturnUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Allow redirects to sb.fullbay.com subdomains and localhost for development
    const allowedHosts = [
      'descope-s3.sb.fullbay.com',
      'descope-idp.sb.fullbay.com',
      'localhost',
    ];
    return allowedHosts.some(host =>
      parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}

/**
 * Home page component - landing page with embedded login flow
 */
function HomePage(): React.ReactElement {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isSessionLoading } = useSession();

  // Get and validate return URL from query params
  const returnUrl = useMemo(() => {
    const url = searchParams.get('returnUrl');
    if (url && isValidReturnUrl(url)) {
      return url;
    }
    return null;
  }, [searchParams]);

  // Redirect after authentication
  const redirectAfterAuth = useCallback(() => {
    if (returnUrl) {
      // Redirect to external service
      window.location.href = returnUrl;
    } else {
      // Stay on IDP service profile page
      navigate('/profile', { replace: true });
    }
  }, [returnUrl, navigate]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isSessionLoading) {
      redirectAfterAuth();
    }
  }, [isAuthenticated, isSessionLoading, redirectAfterAuth]);

  const handleSuccess = useCallback(() => {
    redirectAfterAuth();
  }, [redirectAfterAuth]);

  const handleError = useCallback((error: CustomEvent) => {
    console.error('Authentication error:', error.detail);
  }, []);

  // Show loading state while checking session
  if (isSessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 mx-auto text-primary-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="card max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Descope IDP
          </h1>
          <p className="text-gray-600">
            Secure authentication for Fullbay applications
          </p>
        </div>

        <Descope
          flowId="sign-up-or-in"
          onSuccess={handleSuccess}
          onError={handleError}
        />

        <p className="mt-6 text-center text-sm text-gray-500">
          Powered by Descope
        </p>
      </div>
    </div>
  );
}

export default HomePage;
