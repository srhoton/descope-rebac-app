import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSession, useUser } from '@descope/react-sdk';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';

/**
 * Protected route component that redirects to home if not authenticated
 */
function ProtectedRoute({ children }: { children: React.ReactElement }): React.ReactElement {
  const { isAuthenticated, isSessionLoading } = useSession();

  if (isSessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/**
 * Main application component with routing
 */
function App(): React.ReactElement {
  const { isSessionLoading } = useSession();
  const { isUserLoading } = useUser();

  // Show loading state while initializing
  if (isSessionLoading || isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
