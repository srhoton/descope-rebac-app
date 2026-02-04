/**
 * Host application main component
 * Demonstrates consuming federated modules from s3-image-service
 */

import { AuthProvider, useDescope, useSession, useUser } from '@descope/react-sdk';
import { useState, type FC } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';


import { AuthTokenBridge } from './components/AuthTokenBridge';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ROUTES } from './constants/routes';
import { FullImagePage } from './pages/ImagesPage';
import { LoginPage } from './pages/LoginPage';
import { getUserDisplayName } from './utils/userDisplay';

/** Descope project ID from environment variables */
const DESCOPE_PROJECT_ID = import.meta.env.VITE_DESCOPE_PROJECT_ID ?? '';

/**
 * Navigation component with auth-aware logout functionality.
 * Displays the app title, user greeting, and a logout button when authenticated.
 */
const Navigation: FC = () => {
  const { isAuthenticated, isSessionLoading } = useSession();
  const { user } = useUser();
  const sdk = useDescope();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const displayName = getUserDisplayName(user);

  /**
   * Handles user logout by calling Descope SDK and navigating to login.
   * Displays error message if logout fails.
   */
  const handleLogout = async (): Promise<void> => {
    try {
      setLogoutError(null);
      await sdk.logout();
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to logout';
      setLogoutError(errorMessage);
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <Link to={ROUTES.HOME} className="text-2xl font-bold text-gray-900">
              Image Upload Service
            </Link>
            {!isSessionLoading && isAuthenticated && user && (
              <p
                className="mt-1 text-sm text-gray-600"
                aria-label={`Logged in as ${displayName}`}
              >
                Welcome, {displayName}
              </p>
            )}
          </div>
          <div className="flex gap-4 items-center">
            {logoutError !== null && (
              <span className="text-sm text-red-600" role="alert">
                {logoutError}
              </span>
            )}
            {!isSessionLoading && isAuthenticated && (
              <button
                onClick={() => void handleLogout()}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                aria-label="Sign out of your account"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

/**
 * Main app content wrapped in router context.
 * Defines application routes and renders the navigation bar.
 */
const AppContent: FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <main>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route
            path={ROUTES.HOME}
            element={
              <ProtectedRoute>
                <FullImagePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </main>
    </div>
  );
};

/**
 * Root application component.
 * Sets up authentication provider, token bridge, and router.
 * Displays configuration error if DESCOPE_PROJECT_ID is not set.
 */
const App: FC = () => {
  if (DESCOPE_PROJECT_ID === '') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="text-gray-600">
            Please set the <code className="bg-gray-100 px-1 rounded">VITE_DESCOPE_PROJECT_ID</code>{' '}
            environment variable.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider projectId={DESCOPE_PROJECT_ID}>
      <AuthTokenBridge>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthTokenBridge>
    </AuthProvider>
  );
};

export default App;
