/**
 * Wrapper for remote federated components.
 * Provides error boundary and suspense fallback for graceful handling
 * of loading states and errors when loading remote modules.
 */

import { Suspense, type ComponentType, type FC, type ReactNode } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';

/** Props for the RemoteComponentWrapper component */
interface RemoteComponentWrapperProps {
  /** Child components to render within the wrapper */
  children: ReactNode;
  /** Custom loading fallback UI (optional) */
  fallback?: ReactNode;
  /** Custom error fallback component (optional) */
  errorFallback?: ComponentType<FallbackProps>;
}

/**
 * Default error fallback component displayed when a remote component fails to load.
 * Shows the error message and a retry button.
 *
 * @param props - Error boundary fallback props
 * @param props.error - The error that was caught
 * @param props.resetErrorBoundary - Function to reset the error boundary and retry
 */
const DefaultErrorFallback: FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
  return (
    <div
      className="p-4 bg-red-50 border border-red-200 rounded-lg"
      role="alert"
      aria-live="assertive"
    >
      <h3 className="text-red-800 font-medium">Failed to load remote component</h3>
      <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
    <button
      onClick={resetErrorBoundary}
      className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
      aria-label="Retry loading the component"
    >
      Retry
    </button>
  </div>
  );
};

/**
 * Default loading fallback component displayed while a remote component is loading.
 * Shows a spinner animation and loading text.
 */
const DefaultLoadingFallback: FC = () => (
  <div className="flex items-center justify-center p-8" role="status" aria-live="polite">
    <div
      className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
      aria-hidden="true"
    />
    <span className="ml-2 text-gray-600">Loading...</span>
  </div>
);

/**
 * Wrapper component for remote federated components.
 * Provides error boundary and suspense fallback for graceful handling
 * of loading states and errors when loading remote modules.
 *
 * @param props - Component props
 * @param props.children - Child components to render
 * @param props.fallback - Custom loading fallback UI
 * @param props.errorFallback - Custom error fallback component
 *
 * @example
 * ```tsx
 * <RemoteComponentWrapper>
 *   <LazyRemoteComponent />
 * </RemoteComponentWrapper>
 * ```
 */
export const RemoteComponentWrapper: FC<RemoteComponentWrapperProps> = ({
  children,
  fallback = <DefaultLoadingFallback />,
  errorFallback = DefaultErrorFallback,
}) => {
  return (
    <ErrorBoundary FallbackComponent={errorFallback}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  );
};
