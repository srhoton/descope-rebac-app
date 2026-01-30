import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from '@descope/react-sdk';
import { ErrorBoundary } from 'react-error-boundary';
import App from './App';
import './styles/index.css';
import { getDescopeProjectId, validateEnvironment } from './utils/descope.utils';

/**
 * Error fallback component for top-level errors
 */
function ErrorFallback({ error }: { error: Error }): React.ReactElement {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="card max-w-md w-full border-2 border-red-200">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Application Error</h1>
        <p className="text-gray-700 mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary w-full"
        >
          Reload Application
        </button>
      </div>
    </div>
  );
}

// Validate environment before starting the app
try {
  validateEnvironment();
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error('Environment validation failed:', message);
}

const projectId = getDescopeProjectId();

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AuthProvider
        projectId={projectId}
        baseUrl="https://auth.sb.fullbay.com"
      >
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
