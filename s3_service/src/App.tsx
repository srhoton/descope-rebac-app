/**
 * Main App component
 */

import { AuthProvider } from '@descope/react-sdk';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ImageUploadPage } from './pages/ImageUploadPage';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';

const DESCOPE_PROJECT_ID = import.meta.env['VITE_DESCOPE_PROJECT_ID'] as string;

if (!DESCOPE_PROJECT_ID) {
  throw new Error('VITE_DESCOPE_PROJECT_ID is missing from environment variables');
}

/**
 * Main application component
 * Uses cookie-based session sharing via custom Descope domain
 * Cookie management is configured in Descope console
 */
function App() {
  return (
    <AuthProvider
      projectId={DESCOPE_PROJECT_ID}
      baseUrl="https://auth.sb.fullbay.com"
    >
      <BrowserRouter>
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
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
