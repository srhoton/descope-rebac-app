/**
 * Auth Token Bridge component.
 * Connects React auth context to non-React services (both local and remote).
 * This enables federated modules to access the authenticated user's token.
 */

import { useSession } from '@descope/react-sdk';
import { useEffect, type FC, type ReactNode } from 'react';


import { setTokenGetter } from '../services/authTokenProvider';

/** Props for the AuthTokenBridge component */
interface AuthTokenBridgeProps {
  /** Child components that will have access to the auth token */
  children: ReactNode;
}

/** Global key used by s3_service's authTokenProvider */
const S3_SERVICE_TOKEN_KEY = '__s3_service_auth_token_getter__';

// Extend Window interface for the s3_service token getter
declare global {
  interface Window {
    [S3_SERVICE_TOKEN_KEY]?: () => string | undefined;
  }
}

/**
 * Bridge component that makes the auth token available to services.
 * Sets up the token getter so services can access the session token.
 * Also sets up the token getter for the s3_service remote module via global variable.
 *
 * This component should wrap the application at a high level, typically
 * inside the AuthProvider but outside the Router.
 *
 * @param props - Component props
 * @param props.children - Child components that will have access to the auth token
 *
 * @example
 * ```tsx
 * <AuthProvider projectId={projectId}>
 *   <AuthTokenBridge>
 *     <BrowserRouter>
 *       <App />
 *     </BrowserRouter>
 *   </AuthTokenBridge>
 * </AuthProvider>
 * ```
 */
export const AuthTokenBridge: FC<AuthTokenBridgeProps> = ({ children }) => {
  const { sessionToken } = useSession();

  // Update both local and remote token getters whenever session changes
  useEffect(() => {
    const tokenGetter = (): string | undefined => sessionToken ?? undefined;

    // Set local token getter
    setTokenGetter(tokenGetter);

    // Set s3_service token getter via global variable
    // This works because s3_service's authTokenProvider reads from window[S3_SERVICE_TOKEN_KEY]
    if (typeof window !== 'undefined') {
      window[S3_SERVICE_TOKEN_KEY] = tokenGetter;
    }
  }, [sessionToken]);

  return <>{children}</>;
};
