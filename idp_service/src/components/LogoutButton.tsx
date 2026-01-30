import React, { useState } from 'react';
import { useDescope } from '@descope/react-sdk';
import { useNavigate } from 'react-router-dom';

/**
 * Logout button component that clears Descope session
 */
function LogoutButton(): React.ReactElement {
  const sdk = useDescope();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async (): Promise<void> => {
    try {
      setIsLoggingOut(true);

      // Use Descope SDK logout method
      await sdk.logout();

      // Navigate back to home page
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      // Still navigate to home even if logout fails
      navigate('/', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="btn btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Sign out"
    >
      {isLoggingOut ? (
        <span className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
          Signing out...
        </span>
      ) : (
        'Sign Out'
      )}
    </button>
  );
}

export default LogoutButton;
