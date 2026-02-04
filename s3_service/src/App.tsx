/**
 * Main App component
 */

import { useEffect, type FC, type ReactNode } from 'react';
import { AuthProvider, useSession } from '@descope/react-sdk';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ImageUploadPage } from './pages/ImageUploadPage';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { TenantProvider } from './contexts/TenantContext';
import { setTokenGetter } from './services/authTokenProvider';

const DESCOPE_PROJECT_ID = import.meta.env['VITE_DESCOPE_PROJECT_ID'];

if (!DESCOPE_PROJECT_ID) {
  throw new Error('VITE_DESCOPE_PROJECT_ID is missing from environment variables');
}

/**
 * Component that bridges React's useSession hook with the service layer.
 * Sets up the token getter so services can access the session token.
 * Exported for use in federation standalone components.
 */
export const AuthTokenBridge: FC<{ children: ReactNode }> = ({ children }) => {
  const { sessionToken } = useSession();

  // Update the token getter whenever session changes
  useEffect(() => {
    setTokenGetter(() => sessionToken || undefined);
  }, [sessionToken]);

  return <>{children}</>;
};

/**
 * Main application component
 * Uses Descope for authentication with token-based session management.
 * JWTs are stored in localStorage and accessible via getSessionToken().
 */
function App() {
  return (
    <AuthProvider projectId={DESCOPE_PROJECT_ID}>
      <AuthTokenBridge>
        <BrowserRouter>
          <TenantProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <ImageUploadPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </TenantProvider>
        </BrowserRouter>
      </AuthTokenBridge>
    </AuthProvider>
  );
}

export default App;
