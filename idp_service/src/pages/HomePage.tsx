import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@descope/react-sdk';
import LoginButton from '../components/LoginButton';

/**
 * Home page component - landing page with login functionality
 */
function HomePage(): React.ReactElement {
  const navigate = useNavigate();
  const { isAuthenticated, isSessionLoading } = useSession();

  // Redirect to profile if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isSessionLoading) {
      navigate('/profile', { replace: true });
    }
  }, [isAuthenticated, isSessionLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="card max-w-md w-full mx-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Descope IDP
          </h1>
          <p className="text-gray-600 mb-8">
            Secure authentication for Fullbay applications
          </p>

          <div className="mb-6">
            <svg
              className="w-24 h-24 mx-auto text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <LoginButton />

          <p className="mt-6 text-sm text-gray-500">
            Powered by Descope
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
