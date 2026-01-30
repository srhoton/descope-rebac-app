/**
 * Main App component
 */

import { AuthProvider } from '@descope/react-sdk';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ImageUploadPage } from './pages/ImageUploadPage';
import { ProtectedRoute } from './components/ProtectedRoute';

const DESCOPE_PROJECT_ID = import.meta.env['VITE_DESCOPE_PROJECT_ID'] as string;

if (!DESCOPE_PROJECT_ID) {
  throw new Error('VITE_DESCOPE_PROJECT_ID is missing from environment variables');
}

/**
 * Main application component
 */
function App() {
  return (
    <AuthProvider projectId={DESCOPE_PROJECT_ID}>
      <BrowserRouter>
        <Routes>
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
