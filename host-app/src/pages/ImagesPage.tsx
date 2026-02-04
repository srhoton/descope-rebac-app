/**
 * Full image page using remote federated component.
 * Provides access to the complete image management experience from the s3-image-service.
 */

import { lazy, type FC } from 'react';

import { RemoteComponentWrapper } from '../components/RemoteComponentWrapper';

/** Lazy load the standalone image page from the remote module */
const RemoteStandaloneImagePage = lazy(() => import('s3ImageService/StandaloneImagePage'));

/**
 * Full standalone page component that includes all required providers.
 * Works independently with complete image management experience including
 * upload, gallery view, and image sharing functionality.
 *
 * The component is wrapped in RemoteComponentWrapper to handle loading
 * and error states gracefully when the federated module is being fetched.
 *
 * @example
 * ```tsx
 * <Route
 *   path="/"
 *   element={
 *     <ProtectedRoute>
 *       <FullImagePage />
 *     </ProtectedRoute>
 *   }
 * />
 * ```
 */
/**
 * Full standalone page component that includes all required providers.
 * Works independently with complete image management experience including
 * upload, gallery view, and image sharing functionality.
 *
 * Uses routerType="none" because the host app already provides BrowserRouter.
 * Uses hideChrome={true} because the host app provides its own Navigation header.
 */
export const FullImagePage: FC = () => {
  return (
    <RemoteComponentWrapper>
      <RemoteStandaloneImagePage routerType="none" hideChrome={true} />
    </RemoteComponentWrapper>
  );
};
