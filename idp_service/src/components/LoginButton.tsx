import React from 'react';
import { useSession } from '@descope/react-sdk';
import { getDescopeProjectId } from '../utils/descope.utils';

/**
 * Login button component that redirects to Descope hosted page
 */
function LoginButton(): React.ReactElement {
  const { isSessionLoading } = useSession();

  const handleLogin = (): void => {
    // Redirect to Descope hosted login page
    const projectId = getDescopeProjectId();
    const redirectUrl = encodeURIComponent(window.location.origin + '/profile');

    // Descope hosted auth URL format
    const authUrl = `https://auth.descope.com/${projectId}?flow=sign-up-or-in&redirect_url=${redirectUrl}`;

    window.location.href = authUrl;
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isSessionLoading}
      className="btn btn-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Sign in with Descope"
    >
      {isSessionLoading ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
          Loading...
        </span>
      ) : (
        'Sign In with Descope'
      )}
    </button>
  );
}

export default LoginButton;
